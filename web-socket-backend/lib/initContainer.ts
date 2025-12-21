// // lib/initContainer.ts
// import type { TemplateFile, TemplateFolder, TemplateItem } from "../../modules/playground/lib/path-to-json.ts";
// import Docker from "dockerode";
// import tar from "tar-stream";



// type FlatFile = { path: string; content: string };

// function fileTreeToTar(files: FlatFile[]) {
//   const pack = tar.pack();
//   for (const f of files) {
//     pack.entry({ name: f.path }, f.content);
//   }
//   pack.finalize();
//   return pack;
// }

// function isFolder(item: TemplateItem): item is TemplateFolder {
//   return (item as TemplateFolder).items !== undefined;
// }

// function isFile(item: TemplateItem): item is TemplateFile {
//   return (item as TemplateFile).filename !== undefined;
// }

// function flattenTemplateStructure(folder: TemplateFolder, basePath = ""): FlatFile[] {
//   const files: FlatFile[] = [];
//   const currentPath = basePath ? `${basePath}/${folder.folderName}` : folder.folderName;

//   for (const item of folder.items) {
//     if (isFolder(item)) {
//       files.push(...flattenTemplateStructure(item, currentPath));
//     } else if (isFile(item)) {
//       const fileName = item.fileExtension
//         ? `${item.filename}.${item.fileExtension}`
//         : item.filename;
//       files.push({ path: `${currentPath}/${fileName}`, content: item.content ?? "" });
//     }
//   }

//   return files;
// }

// type PlaygroundRecord = { content: string | TemplateFolder } | TemplateFolder;

// const docker = new Docker({ socketPath: "/var/run/docker.sock" });

// export async function initContainer({
//   userId,
//   projectId,
//   runId,
//   playground,
// }: {
//   userId: string;
//   projectId: string;
//   runId: string;
//   playground: PlaygroundRecord[];
// }) {
//   console.log(`🟢 Initializing container for ${userId} (${projectId})`);

//   const files: FlatFile[] = [];

//   for (const p of playground) {
//     const parsed =
//       typeof (p as any).content === "string"
//         ? JSON.parse((p as any).content)
//         : (p as any).content ?? p;
//     const flatFiles = flattenTemplateStructure(parsed as TemplateFolder);
//     files.push(...flatFiles);
//   }

//   const container = await docker.createContainer({
//     Image: "vibe/base-runner:latest",
//     Cmd: ["/bin/sh"],
//     Tty: true,              // 👈 allocate terminal
//     OpenStdin: true,        // 👈 keep stdin open
//     StdinOnce: false,       // 👈 don’t close stdin automatically
//     Env: [
//       `USER_ID=${userId}`,
//       `PROJECT_ID=${projectId}`,
//       `RUN_ID=${runId}`,
//     ],
//     HostConfig: {
//       NetworkMode: "none",
//       Memory: 512 * 1024 * 1024,
//       CpuQuota: 50000,
//     },
//   });

//   await container.start();

//   console.log(`✅ Container started: ${container.id}`);

//   // You could later copy files from playground here if needed
//   // For now, just start a blank environment.


//   //Adding files to container
//   try {
//     const workspacePath = `/workspace/${userId}/${projectId}/${runId}`;

//     // 🧱 Make workspace
//     // const exec = await container.exec({
//     //   Cmd: ["bash", "-c", `mkdir -p ${workspacePath}`],
//     //   AttachStdout: true,
//     //   AttachStderr: true,
//     // });
//     // await exec.start({ hijack: true, stdin: false });

//     const exec = await container.exec({
//       Cmd: ["bash", "-c", `mkdir -p ${workspacePath}`],
//       AttachStdout: true,
//       AttachStderr: true,
//     });
//     const stream = await exec.start({ hijack: true, stdin: false });
    
//     await new Promise<void>((resolve, reject) => {
//       container.modem.demuxStream(stream, process.stdout, process.stderr);
//       stream.on("end", resolve);
//       stream.on("error", reject);
//     });

//     // 🗂️ Copy files
//     const tarStream = fileTreeToTar(files);
//     await container.putArchive(tarStream, { path: workspacePath });
//     console.log(`📁 Files copied into ${workspacePath}`);
    
//     return {
//       containerId: container.id,
//       socketUrl: `/api/container/socket/${container.id}`,
//     };
    
//   } catch (err) {
//     console.error("❌ Docker execution failed:", err);
//     throw err;
//   }
// }
