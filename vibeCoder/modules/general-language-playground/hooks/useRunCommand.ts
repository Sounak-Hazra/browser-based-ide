import { useFileExplorerForGeneralLanguage } from "./useFIleExplorerForGeneralLanguages";
import { useContainerSocket } from "./useContainerSocket";
import { useCallback } from "react";
import { toast } from "sonner";


interface useRunCommandProps {
  findFilePath: () => { parentFolderPath: string; fullFilePath: string, fileNameWithExtension: string } | undefined;
  getSocket: () => WebSocket | null;
  projectId: string
}

export function useRunCommand({ findFilePath, getSocket, projectId }: useRunCommandProps) {

  const run = useCallback(() => {
    try {


      const socket = getSocket()

      const info = findFilePath()

      if (!info) return

      // const fileExtention = path?.fileNameWithExtension?.split(".")?.length! > 1 ? path?.fileNameWithExtension.split(".")[-1] : ""

      const command = buildCommand(info?.parentFolderPath, info.fileNameWithExtension, projectId)


      if (!socket) return


      socket.send(command + "\n")
    } catch (error) {
      toast("Failed to run.")
    }
  }, [findFilePath, getSocket])


  return { run }
}


export function useRunCommandWithStats({ findFilePath, getSocket, projectId }: useRunCommandProps) {

  const runWithStats = useCallback(() => {
    try {


      const socket = getSocket()

      const info = findFilePath()

      if (!info) return

      // const fileExtention = path?.fileNameWithExtension?.split(".")?.length! > 1 ? path?.fileNameWithExtension.split(".")[-1] : ""

      const command = buildStatsCommand(info?.parentFolderPath, info.fileNameWithExtension, projectId)


      if (!socket) return

      // let collectingData = false;
      // let buffer: string[] = []

      // const handleCollectingData = (data: MessageEvent) => {

      //   console.log("atleast called")

      //   const text = String(data.data)


      //   if (text.includes("__RUN_STATS_START__") && text.includes("__RUN_STATS_END__")) {
      //     buffer.push(text)
      //     console.log(text)

      //     // socket.removeEventListener("message", handleCollectingData)
      //     return
      //   }

      //   if (text.includes("__RUN_STATS_START__")) {
      //     collectingData = true
      //     console.log(text)

      //     buffer.push(text)
      //     return
      //   } 
      //   if (text.includes("__RUN_STATS_END__")){
      //     collectingData = false
      //     buffer.push(text)
      //     console.log("here",text)
      //     // socket.removeEventListener("message", handleCollectingData)
      //     return
      //   }

      //   if (!text.includes("__RUN_STATS_END__") && !text.includes("__RUN_STATS_START__") && collectingData) {
      //     console.log(text)
      //     buffer.push(text)
      //   }
      // }


      
      socket.send(command + "\n")
      
      // socket.addEventListener("message", handleCollectingData)
      // console.log("this is buffer ",buffer)


    } catch (error) {
      toast("Failed to run.")
    }
  }, [findFilePath, getSocket])


  return { runWithStats }
}



const buildCommand = (parentFolderPath: string, fileName: string, projectId: string): string => {

  const runCommand = getRunCommand(fileName);

  const command = `cd "$(pwd | sed -E "s|(.*(/workspace/${projectId})).*|\\1|")" && cd ${parentFolderPath} && ${runCommand}`

  return command
}

export const buildStatsCommand = (
  parentFolderPath: string,
  fileName: string,
  projectId: string
) => {

  const runCommand = getRunCommand(fileName);

  const command = `cd "$(pwd | sed -E "s|(.*(/workspace/${projectId})).*|\\1|")" && cd ${parentFolderPath} && echo "__RUN_STATS_START__" && timeout 10s /usr/bin/time -v ${runCommand} && echo "__RUN_STATS_END__"`

  return command
  // const base = buildCommand(parentFolderPath, fileName, projectId);

  // return `timeout 10s /usr/bin/time -v '${base}'`;
};



export function getRunCommand(fileName: string) {
  const parts = fileName.split(".");
  const extension = parts.at(-1)?.toLowerCase();
  const baseName = parts.slice(0, -1).join(".");

  switch (extension) {

    case "js":
      return `node "${fileName}"`;

    case "ts":
      return `ts-node "${fileName}"`;

    case "py":
      return `python3 "${fileName}"`;

    case "java":
      return `javac "${fileName}" && java "${baseName}"`;

    case "c":
      return `gcc "${fileName}" -o "${baseName}" && "./${baseName}"`;

    case "cpp":
    case "cc":
      return `g++ "${fileName}" -o "${baseName}" && "./${baseName}"`;

    case "sh":
      return `bash "${fileName}"`;

    default:
      return undefined; // unknown / unsupported file
  }
}
