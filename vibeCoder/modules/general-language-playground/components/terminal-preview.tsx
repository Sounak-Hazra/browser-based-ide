"use client";
import React, { useState, useRef } from "react";
import TerminalComponent from "./terminal-for-general-language";
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/api-responce";
import { FitAddon } from "xterm-addon-fit";
import { WebLinksAddon } from "xterm-addon-web-links";
import { SearchAddon } from "xterm-addon-search";
import { Terminal } from "xterm";


interface TerminalProps {
    className?: string;
    theme?: "dark" | "light";
    compileCode: (command: string) => Promise<ApiErrorResponse | ApiSuccessResponse<string>>
    socketUrl: string;
    socket: WebSocket | null;
    containerId: string;
    playgroundId: string;
    term: Terminal | null;
    fitAddon: FitAddon | null;
    searchAddon: SearchAddon | null;
}

const WebContainerPreviewForGeneral = ({
    className,
    theme,
    compileCode,
    socket,
    socketUrl,
    containerId,
    playgroundId,
    term,
    fitAddon,
    searchAddon
}: TerminalProps) => {

    const [loadingState, setLoadingState] = useState(false)
    const [setupError, setSetupError] = useState<string | null>(null)

    const terminalRef = useRef<any>(null);

    // if (loadingState)
    //     return (
    //         <div className="h-full flex items-center justify-center">
    //             <div className="text-center space-y-4 max-w-md p-6 rounded-1g bg-gray-50 Odark:bg-gray-900">
    //                 <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
    //                 <h3 className="text-1g font-medium">Initializing WebContainer</h3>
    //                 <p className="text-sm text-gray-500 dark: text-gray-400">
    //                     Setting up the environment for your project ...
    //                 </p>
    //             </div>
    //         </div>
    //     );

    // if (error || setupError) {
    //     return (
    //         <div className="h-full flex items-center justify-center">
    //             <div className="bg-red-50 dark:bg-red-900/20 dark: text - red - 400 text - red - 600 p - 6 rounded - 1g max - w - md">
    //                 <div className="flex items-center gap-2 mb-3">
    //                     <XCircle className="h-5 w-5" />
    //                     <h3 className="font-semibold">Error</h3>
    //                 </div>
    //                 <p className="text-sm" > {error || setupError}</p >
    //             </div >
    //         </div >
    //     )
    // }


    // const getStepIcon = (stepIndex: number) => {
    //     if (stepIndex < currentStep) {
    //         return <CheckCircle className="h-5 w-5 [text-green-500" />;
    //     } else if (stepIndex === currentStep) {
    //         return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
    //     } else {
    //         return <div className="h-5 w-5 rounded-full border-2 border - gray - 300" />;
    //     };
    // }

    // const getStepText = (stepIndex: number, label: string) => {
    //     const isActive = stepIndex === currentStep;
    //     const isComplete = stepIndex < currentStep;

    //     return (
    //         <span className={`text-sm font-medium ${isComplete ? 'text-green-600' : isActive ? 'Otext-blue-600' : '[text-gray-500'}`}>
    //             {label}
    //         </span >
    //     )
    // };

    return (
        <div className="h-full w-full flex flex-col">
            <TerminalComponent
                compileCode={compileCode}
                ref={terminalRef}
                theme="dark"
                className="h-full"
                socketUrl={socketUrl}
                socket={socket}
                containerId={containerId}
                playgroundId={playgroundId}
                term={term}
                fitAddon={fitAddon}
                searchAddon={searchAddon}
            />
        </div>
    )


}

export default WebContainerPreviewForGeneral