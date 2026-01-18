import { useCallback, useEffect, useState } from "react";
import { TemplateFolder } from "@/modules/playground/lib/path-to-json";
import { toast } from "sonner";


interface UseDockerContainersProp {
    playgroundId: string
}

interface UseWebContainersReturn {
    isLoading: boolean,
    error: string | null,
    writeFileSync: () => Promise<void>,
    socketUrl: string | null,
    containerId: string | null,
}

export function useDockerContainers({ playgroundId }: UseDockerContainersProp): UseWebContainersReturn {
    const [socketUrl, setSocketUrl] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [containerId, setContainerId] = useState<string | null>(null)

    useEffect(() => {

        const initilizer = async () => {
            setIsLoading(true)
            try {
                const initilizeContainer = await fetch(`/api/base-language-runner/init/${playgroundId}`, {
                    method: "POST"
                })
    
                const responce = await initilizeContainer.json()
    
                if (!responce.success) {
                    throw new Error(responce.message || "Unable to initilize container.")
                }
    
                if (!responce.socketUrl || !responce.containerId) {
                    throw new Error(responce.message || "Failed to load playground")
                }
    
                setSocketUrl(responce.socketUrl)
                setContainerId(responce.containerId)

                console.log("Container initialized with ID:", responce.containerId)
            } catch (error: unknown) {
                console.log(error)
                setError((error as any).message || "Failed to initilize contanier.")
            } finally {
                setIsLoading(false)
            }
        }

        initilizer()
        return () => {
        }
    }, [])


    const writeFileSync = useCallback(async () => {
        console.log("Syncing file system with container...")
        console.log("Container ID:", containerId)
        if(!containerId) return
        try {
            const res = await fetch(`/api/base-language-runner/writeSyncWithContainer/${containerId}`,{
                method: "POST",
                body: JSON.stringify({playgroundId: playgroundId})
            })

            const data = await res.json()

            if(!data.success){
                throw new Error(data.message || "Failed to update data in container.")
            }

            toast.success("File system synced with container.")


        } catch (error: unknown) {
            console.log(error)
            setError((error as any).message)
        } finally{
            setIsLoading(false)
        }
    }, [containerId])


    return {
        error,
        isLoading,
        writeFileSync,
        containerId: containerId,
        socketUrl: socketUrl
    }

}