// import { useEffect, useRef } from "react";
// import { useSocketStore } from "../states/socker.store";

// export function useContainerSocket(socketUrl: string, termRef: any) {
//     const socketRef = useRef<WebSocket | null>(null);

//     // const { setSocket, socket } = useSocketStore()
//     const setSocket = useSocketStore(s => s.setSocket)


//     useEffect(() => {
//         const protocol = window.location.protocol === "https:" ? "wss" : "ws";
//         const wsUrl = `${protocol}://localhost:8080${socketUrl}`;
//         const ws = new WebSocket(wsUrl);
//         socketRef.current = ws;

//         setSocket(socketRef.current)

//         ws.onopen = () => {
//             termRef.current?.writeln("🐳 Connected to container shell.\r\n");
//             // ws.send()
//         };

//         ws.onmessage = (e) => {
//             termRef.current?.write(e.data);
//         };

//         ws.onerror = (err) => {
//             termRef.current?.writeln("⚠️ WebSocket error.\r\n");
//         };

//         ws.onclose = () => {
//             termRef.current?.writeln("🔴 Disconnected from container shell.\r\n");
//         };

//         return () => ws.close();
//     }, [socketUrl]);

//     return socketRef;
// }


type isCollectingType = {
    collectingBy: string,
    isCollecting: boolean
}


import { useEffect, useRef } from "react";
import { useSocketStore } from "../states/socker.store";
import { parseExecutionStats } from "../lib/parseExecutionStats";

export function useContainerSocket(socketUrl: string | null, termRef: any, addStats: (stats: any) => void) {
    const socketRef = useRef<WebSocket | null>(null);
    const currentData = useRef<string>("")
    const isCollecting = useRef<isCollectingType>({
        collectingBy: "",
        isCollecting: false
    })

    // const { setSocket, socket } = useSocketStore()
    const setSocket = useSocketStore(s => s.setSocket)

    // strip ANSI + terminal control sequences
    const stripAnsi = (s: string) =>
        s.replace(/\x1B\[[0-9;?]*[ -/]*[@-~]/g, "");

    const handleStatsMessage = (e: MessageEvent) => {

        const ID = "stats"
        const text = String(e.data)
        const clean = stripAnsi(text)  // <-- clean here

        if (
            isCollecting.current.isCollecting &&
            isCollecting.current.collectingBy !== "" &&
            isCollecting.current.collectingBy !== ID
        ) {
            return
        }

        if (clean.includes("__RUN_STATS_START__")) {
            isCollecting.current.collectingBy = ID
            isCollecting.current.isCollecting = true
            currentData.current = ""
            currentData.current = currentData.current + clean   // <-- cleaned append
            return
        }

        if (clean.includes("__RUN_STATS_END__")) {

            currentData.current = currentData.current + clean   // <-- cleaned append

            const finalData = parseExecutionStats(currentData.current)

            addStats(finalData)
            console.log("Parsed Stats:", finalData)

            isCollecting.current.collectingBy = ""
            isCollecting.current.isCollecting = false
            currentData.current = ""

            return
        }

        if (
            isCollecting.current.isCollecting === true &&
            isCollecting.current.collectingBy === ID
        ) {
            console.log("Here here")
            currentData.current = currentData.current + clean   // <-- cleaned append
            return
        }
    }



    useEffect(() => {

        if (!socketUrl) return;
        const protocol = window.location.protocol === "https:" ? "wss" : "ws";
        const wsUrl = `${protocol}://localhost:8080${socketUrl}`;
        const ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        setSocket(socketRef.current)

        // ws.addEventListener("message", handleStatsMessage)

        ws.onopen = () => {
            termRef.current?.writeln("🐳 Connected to container shell.\r\n");
            // ws.send()
        };

        ws.onmessage = (e) => {
            termRef.current?.write(e.data);
            handleStatsMessage(e)
        };

        ws.onerror = (err) => {
            termRef.current?.writeln("⚠️ WebSocket error.\r\n");
        };

        ws.onclose = () => {
            termRef.current?.writeln("🔴 Disconnected from container shell.\r\n");
        };

        return () => ws.close();
    }, [socketUrl]);





    return socketRef;
}


