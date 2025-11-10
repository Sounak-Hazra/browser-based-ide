import { TemplateFolder, TemplateItem, TemplateFile } from "@/modules/playground/lib/path-to-json";
import Docker from "dockerode";
import tar from "tar-stream";

const docker = new Docker({ socketPath: "/var/run/docker.sock" });

type FlatFile = { path: string; content: string };

function fileTreeToTar(files: FlatFile[]) {
  const pack = tar.pack();
  for (const f of files) {
    pack.entry({ name: f.path }, f.content);
  }
  pack.finalize();
  return pack;
}

function isFolder(item: TemplateItem): item is TemplateFolder {
  return (item as TemplateFolder).items !== undefined;
}

function isFile(item: TemplateItem): item is TemplateFile {
  return (item as TemplateFile).filename !== undefined;
}

function flattenTemplateStructure(folder: TemplateFolder, basePath = ""): FlatFile[] {
  const files: FlatFile[] = [];
  const currentPath = basePath ? `${basePath}/${folder.folderName}` : folder.folderName;

  for (const item of folder.items) {
    if (isFolder(item)) {
      files.push(...flattenTemplateStructure(item, currentPath));
    } else if (isFile(item)) {
      const fileName = item.fileExtension
        ? `${item.filename}.${item.fileExtension}`
        : item.filename;
      files.push({ path: `${currentPath}/${fileName}`, content: item.content ?? "" });
    }
  }

  return files;
}

type PlaygroundRecord = { content: string | TemplateFolder } | TemplateFolder;

export async function runInDocker(options: {
  userId: string;
  projectId: string;
  runId: string;
  cmd: string;
  playground: PlaygroundRecord[];
}): Promise<{ exitCode: number; output: string; containerId: string }> {
  const { userId, projectId, runId, cmd, playground } = options;
  let output = "";
  const files: FlatFile[] = [];

  // 🧩 Parse & flatten structure
  for (const p of playground) {
    const parsed =
      typeof (p as any).content === "string"
        ? JSON.parse((p as any).content)
        : (p as any).content ?? p;
    const flatFiles = flattenTemplateStructure(parsed as TemplateFolder);
    files.push(...flatFiles);
  }

  if (!files.length) throw new Error("No files found in provided template structure");

  console.log("📦 Packing files for container:");
  files.forEach((f) => console.log(" -", f.path));

  // 🐳 Create container
  const container = await docker.createContainer({
    Image: "vibe/base-runner:latest",
    Tty: true,
    OpenStdin: true,
    StdinOnce: false, // allows multiple inputs later
    Env: [
      `USER_ID=${userId}`,
      `PROJECT_ID=${projectId}`,
      `RUN_ID=${runId}`,
      `CMD=${cmd}`,
    ],
    HostConfig: {
      NetworkMode: "none",
      Memory: 512 * 1024 * 1024,
      CpuQuota: 50000,
      CapDrop: ["ALL"],
    },
  });

  const containerId = container.id;
  console.log(`🐳 Created container ${containerId}`);

  try {
    const workspacePath = `/workspace/${userId}/${projectId}/${runId}`;

    // 🟢 Start container
    await container.start();

    // 🧱 Make workspace
    const exec = await container.exec({
      Cmd: ["bash", "-c", `mkdir -p ${workspacePath}`],
      AttachStdout: true,
      AttachStderr: true,
    });
    await exec.start({ hijack: true, stdin: false });

    // 🗂️ Copy files
    const tarStream = fileTreeToTar(files);
    await container.putArchive(tarStream, { path: workspacePath });
    console.log(`📁 Files copied into ${workspacePath}`);

    // 🧠 Attach to logs (to capture cmd output)
    const execCmd = await container.exec({
      Cmd: ["bash", "-lc", `cd ${workspacePath} && ${cmd}`],
      AttachStdout: true,
      AttachStderr: true,
      AttachStdin: false,
      Tty: true,
    });

    const stream = await execCmd.start({ hijack: true, stdin: false });

    stream.on("data", (chunk: Buffer) => {
      const text = chunk.toString();
      process.stdout.write(text);
      output += text;
    });

    const result = await execCmd.inspect();

    return {
      exitCode: result.ExitCode ?? 0,
      output,
      containerId, // ✅ Return this for DB
    };
  } catch (err) {
    console.error("❌ Docker execution failed:", err);
    throw err;
  }
}
