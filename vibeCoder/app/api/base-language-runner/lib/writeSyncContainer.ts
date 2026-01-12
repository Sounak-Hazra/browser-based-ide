import { TemplateFile, TemplateFolder, TemplateItem } from "@/modules/playground/lib/path-to-json";
import Docker from "dockerode";
import { contentToTar } from "./fileTreeToTar";
import { workingDirectoryGenerator } from "@/lib/workingDirectoryGenerator";



type PlaygroundRecord = { content: string | TemplateFolder } | TemplateFolder;

// const docker = new Docker({ socketPath: "/var/run/docker.sock" });
const docker = new Docker(); //* Chnages for windows compatibility


export async function writeSyncContainer({
  userId,
  projectId,
  runId,
  playground,
  containerId
}: {
  userId: string;
  projectId: string;
  runId: string;
  playground: PlaygroundRecord[];
  containerId: string
}) {

  try {
    const container = docker.getContainer(containerId)
    if (!container) {
      throw new Error("Container not found.")
    }

    const info = await container.inspect()

    if (info.State.Status !== "running") {
      console.log("Container is not running starting it...")
      await container.start()
    }

    // const workspacePath = `/workspace/${userId}/${projectId}/${runId}`;
    const workspacePath = workingDirectoryGenerator({
      projectId: projectId
    })

    const newFiles = contentToTar(playground)

    if(!newFiles){
      throw new Error("Failed to generate new files for container.")
    }
    const val = await container.putArchive(newFiles, { path: workspacePath })
    console.log("Files synced to container:", val.toString())
  } catch (error) {
    console.log(error)
    throw error
  }
}