import { useCallback, useEffect, useState } from "react";
import { WebContainer } from "@webcontainer/api"
import { TemplateFolder } from "@/modules/playground/lib/path-to-json";

interface UseWebContainersProp {
    templateData: TemplateFolder
}

interface UseWebContainersReturn {
    serverURL: string | null,
    isLoading: boolean,
    error: string | null,
    instance: WebContainer | null,
    writeFileSync: (path: string, content: string) => Promise<void>,
    destroy: () => void
}


export function useWebContainers({ templateData }: UseWebContainersProp): UseWebContainersReturn {
    const [serverURL, setServerURL] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [instance, setInstance] = useState<WebContainer | null>(null)

    useEffect(() => {
        let mounted = true
        async function initiliseWebContainer() {
            try {
                const webContainerInstance = await WebContainer.boot()

                if (!mounted) return

                setInstance(webContainerInstance)
                setIsLoading(false)

            } catch (error) {
                console.log(error)
                console.log("Error here")
                if (mounted) {
                    setError(error instanceof Error ? error.message : "Failed to initilized web container.")
                    setIsLoading(false)
                }
            }
        }
        initiliseWebContainer()

        return () => {
            mounted = false
            if (instance) {
                instance.teardown()
            }
        }
    }, [])


    const writeFileSync = useCallback(async (path: string, content: string): Promise<void> => {
        if (!instance) {
            throw new Error("We container instance is not avilable.")
        }

        console.log(path)

        try {
            const pathParts = path.split("/")
            const folderPaths = pathParts.slice(0, -1).join("/")

            if (folderPaths) {
                await instance.fs.mkdir(folderPaths, { recursive: true })
            }

            await instance.fs.writeFile(path, content)
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to write file"
            console.log(`Failed to write file at ${path}: ${error}`)
            throw new Error(`Failed to write file at ${path}: ${error} `)
        }
    }, [instance])

    const destroy = useCallback(() => {
        if (instance) {
            instance.teardown()
            setInstance(null)
            setServerURL(null)
        }
    }, [instance])


    return {
        destroy,
        error,
        instance,
        isLoading,
        serverURL,
        writeFileSync
    }

}
