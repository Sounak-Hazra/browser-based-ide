import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import type { TemplateFile, TemplateFolder } from "@/modules/playground/lib/path-to-json";
import type { PlaygroundFetch } from "@/modules/dahboard/type";
import { getPlaygroundById, SaveUpdatedCode } from "@/modules/playground/actions";
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/api-responce";


interface PlaygroundData extends PlaygroundFetch {
    templateFiles: TemplateFile[],
    [key: string]: any
}

type ContainerInitResponce = {
    socketUrl: string,
    containerId: string
}

interface UsePlaygroundreturn {
    playGroundData: PlaygroundData | null,
    templateData: TemplateFolder | null,
    isLoading: boolean,
    error: string,
    loadPlayground: () => Promise<ApiSuccessResponse<string> | ApiErrorResponse>,
    // saveTemplate: (data: TemplateFolder) => Promise<TemplateFolder | undefined>
    saveTemplate: (data: TemplateFolder) => Promise<void>
    compile: (data: TemplateFolder, command: string, playgroundId: string, currentFile?: TemplateFile) => Promise<ApiSuccessResponse<string> | ApiErrorResponse>,
    socketUrl: string | null,
    containerId: string | null
}

export const usePlaygroundForGeneralLanguage = (id: string): UsePlaygroundreturn => {
    const [playgroundData, setPlaygroundData] = useState<PlaygroundData | null>(null);
    const [templateData, setTemplateData] = useState<TemplateFolder | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [socketUrl, setSocketUrl] = useState<string | null>(null);
    const [containerId, setContainerId] = useState<string | null>(null);


    const loadPlayground = useCallback(async (): Promise<ApiSuccessResponse<string> | ApiErrorResponse> => {
        if (!id) return {
            success: false,
            message: "Invalid playground ID"
        }
        try {

            setIsLoading(true)
            setError(null)

            const data = await getPlaygroundById(id)

            if (!data.success) {
                throw new Error(data.message)
            }

            setPlaygroundData(data.data)


            const rawContent = data?.data?.templateFiles?.[0]?.content

            if (typeof rawContent === "string") {
                const parsedContent = JSON.parse(rawContent)
                setTemplateData(parsedContent)
                toast.success("Playground data loaded.")
            } else {
                const res = await fetch(`/api/template/${id}`);

                if (!res.ok) throw new Error("Failed to load template: ${ res.status ");

                const templateRes = await res.json();

                if (templateRes.templateJson && Array.isArray(templateRes.templateJson)) {
                    setTemplateData({
                        folderName: "Root",
                        items: templateRes.templateJson,
                    });
                }
                else {
                    setTemplateData(templateRes.templateJson || {
                        folderName: "Root",
                        items: [],
                    });
                }
            }

            // const initilizeContainer = await fetch(`/api/base-language-runner/init/${id}`,{
            //     method: "POST"
            // })

            // const responce = await initilizeContainer.json()

            // if(!responce.success){
            //     throw new Error(responce.message || "Unable to initilize container.")
            // }

            // if(!responce.socketUrl || ! responce.containerId){
            //     throw new Error(responce.message || "Failed to load playground")
            // }

            // setSocketUrl(responce.socketUrl)
            // setContainerId(responce.containerId)
            // return {
            //     success: true,
            //     message: "Playground initialized.",
            //     data:{
            //         socketUrl: responce.socketUrl,
            //         containerId: responce.containerId
            //     }
            // }

            return {
                success: true,
                message: "Playground initialized.",
                data: "Playground Initilized"
            }


        } catch (error: unknown) {
            const err = error as any;
            setError(err.message || "Unexpected error occured.")
            console.log(error)
            toast.error(err.message || "Unexpected error occured.")

            return {
                success: false,
                message: err.message || "Failed to load playground"
            }
        } finally {
            setIsLoading(false)
        }
    }, [id])

    // const saveTemplateData = useCallback(async (data: TemplateFolder): Promise<TemplateFolder | undefined> => {
    const saveTemplateData = useCallback(async (data: TemplateFolder): Promise<void> => {

        try {
            const val = await SaveUpdatedCode(id, data);
            const newData = setTemplateData(data);
            toast.success("Changes saved successfully");

            console.log("val from val", val)
            if (!val.data) {
                return undefined;
            }
            // return val?.data;
        } catch (error) {
            console.error("Error saving template data:", error);
            toast.error("Failed to save changes");
            throw error;
        }

    }, [id])

    const compile = useCallback(async (data: TemplateFolder, command: string, playgroundId: string, currentFile?: TemplateFile): Promise<ApiSuccessResponse<string> | ApiErrorResponse> => {

        try {
            const res = await fetch(`/api/base-language-runner/${id}`, {
                method: "POST",
                body: JSON.stringify({ command, }),
            })

            const result = await res.json();
            console.log("compile result", result)

            if (!result.success) {
                throw new Error(result.message || "Compilation failed");
            }
            return {
                data: result?.data?.output + `\nExited with code: ${result?.data?.exitCode}` || "No response from compiler",
                success: result.success,
                message: result.message
            }
        } catch (error) {

            console.error("Error during compilation:", error);
            return {
                success: false,
                message: (error as Error).message || "Compilation failed"
            }
        }
    }, [id])



    useEffect(() => {
        loadPlayground()
    }, [loadPlayground])

    return {
        playGroundData: playgroundData,
        templateData,
        isLoading,
        error: error || "",
        loadPlayground,
        saveTemplate: saveTemplateData,
        compile,
        socketUrl,
        containerId
    }
}