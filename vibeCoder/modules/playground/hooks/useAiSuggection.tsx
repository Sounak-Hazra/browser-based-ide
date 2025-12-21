import { model } from "mongoose";
import { useCallback, useState } from "react";
import { text } from "stream/consumers";

interface AiSuggestionState {
    suggestion: string | null;
    loading: boolean;
    position: { line: number, column: number } | null;
    decoration: [];
    isEnabled: boolean
}


interface useAiSuggestionReturn extends AiSuggestionState {
    toggleEnabled: () => void;
    fetchSuggestion: (type: string, editor: any) => void;
    acceptSuggestion: (editor: any, monaco: any) => void;
    rejectSuggestion: (editor: any) => void;
    clearSuggestion: (editor: any) => void
}




export const useAiSuggestion = (): useAiSuggestionReturn => {
    const [state, setstate] = useState<AiSuggestionState>({
        suggestion: null,
        decoration: [],
        isEnabled: false,
        loading: false,
        position: null

    })


    const toggleEnabled = useCallback(() => {
        setstate((prev) => ({ ...prev, isEnabled: !prev.isEnabled }))
    }, [])


    const fetchSuggestion = useCallback(async (type: string, editor: any) => {

        setstate((currentState) => {
            if (!currentState.isEnabled) {
                return currentState
            }

            if (!editor) {
                return currentState
            }

            const model = editor.getModel()
            const cursorPosition = editor.getPosition()

            if (!model || !cursorPosition) {
                return currentState
            }

            const newState = { ...currentState, loading: true };

            (async () => {
                try {
                    const payLoad = {
                        fileContent: model.getValue(),
                        cursorLine: cursorPosition.lineNumber - 1,
                        cursorColumn: cursorPosition.column - 1,
                        suggestionType: type
                    }

                    const response = await fetch("/api/code-suggestion", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payLoad)
                    })

                    if (!response.ok) {
                        throw new Error(`Api respond with status ${response.status}`)
                    }

                    const data: any = await response.json()
                    console.log("AI Suggestion Response:", data)
                    if (data.suggestion) {
                        const suggestionText = data.suggestion.trim()
                        console.log("Suggestion received:", suggestionText)
                        setstate((prev) => ({
                            ...prev,
                            suggestion: suggestionText,
                            position: {
                                column: cursorPosition.column,
                                line: cursorPosition.lineNumber
                            },
                            loading: false
                        }))
                    } else {
                        setstate((prev) => ({
                            ...prev,
                            loading: false
                        }))
                    }
                } catch (error) {
                    console.log(error)
                    setstate((prev) => ({
                        ...prev,
                        loading: false
                    }))
                }
            })()

            return newState
        })

    }, [])


    const acceptSuggestion = useCallback((editor: any, monaco: any) => {
        setstate((currentState) => {
            if (!currentState.suggestion || !currentState.position || !editor || !monaco) {
                return currentState
            }

            const { line, column } = currentState.position

            const sanitizedSuggestion = currentState.suggestion.replace(/^\d+:\s*/gm, "")

            editor.executeEdits("", [
                {
                    range: new monaco.Range(line, column, line, column),
                    text: sanitizedSuggestion,
                    forceMoveMarkers: true
                }
            ])

            if (editor && currentState.decoration.length > 0) {
                editor.deltaDecoration(currentState.decoration, [])

            }

            return {
                ...currentState,
                suggestion: null
            }
        })
    }, [])


    const rejectSuggestion = useCallback((editor: any) => {
        setstate((currentState) => {
            if (editor && currentState.decoration.length > 0) {
                editor.deltaDecoration(currentState.decoration, [])

            }

            return {
                ...currentState,
                suggestion: null
            }
        })
    }, [])

    const clearSuggestion = useCallback((editor: any) => {
        setstate((currentState) => {
            if (editor && currentState.decoration.length > 0) {
                editor.deltaDecoration(currentState.decoration, [])

            }

            return {
                ...currentState,
                suggestion: null
            }
        })
    }, [])



    return {
        ...state,
        acceptSuggestion,
        rejectSuggestion,
        toggleEnabled,
        clearSuggestion,
        fetchSuggestion
    }

}