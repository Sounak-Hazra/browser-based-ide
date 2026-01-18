import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import type { TemplateFile, TemplateFolder } from "../lib/path-to-json";
import type { PlaygroundFetch } from "@/modules/dahboard/type";
import { getPlaygroundById, SaveUpdatedCode } from "../actions";


interface PlaygroundData extends PlaygroundFetch {
    templateFiles: TemplateFile[],
    [key: string]: any
}

interface UsePlaygroundreturn {
    playGroundData: PlaygroundData | null,
    templateData: TemplateFolder | null,
    isLoading: boolean,
    error: string,
    loadPlayground: () => Promise<void>,
    // saveTemplate: (data: TemplateFolder) => Promise<PlaygroundData | undefined> //Changed
    saveTemplate: (data: TemplateFolder) => Promise<void>


}

export const usePlayground = (id: string): UsePlaygroundreturn => {
    const [playgroundData, setPlaygroundData] = useState<PlaygroundData | null>(null);
    const [templateData, setTemplateData] = useState<TemplateFolder | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    const loadPlayground = useCallback(async () => {
        if (!id) return
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

                if (!res.ok) throw new Error(`Failed to load template: ${ res.status }`);

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
        } catch (error: unknown) {
            const err = error as any;
            setError(err.message || "Unexpected error occured.")
            console.log(error)
            toast.error(err.message || "Unexpected error occured.")
        } finally {
            setIsLoading(false)
        }
    }, [id])

    const saveTemplateData = useCallback(async (data: TemplateFolder): Promise<void> => {
        try {
            const val = await SaveUpdatedCode(id, data);
            const newData = setTemplateData(data);
            toast.success("Changes saved successfully");

            if(!val.data) {
                return undefined;
            }
            // return val?.data.TemplateFiles; Changed
            // return val?.data;

        } catch (error) {
            console.error("Error saving template data:", error);
            toast.error("Failed to save changes");
            throw error;
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
    }
}