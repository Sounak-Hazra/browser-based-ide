import { useEffect, useRef } from "react";

export function useContainerSocket(socketUrl: string, termRef: any) {
    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        const protocol = window.location.protocol === "https:" ? "wss" : "ws";
        const wsUrl = `${protocol}://localhost:8080${socketUrl}`;
        const ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
            termRef.current?.writeln("🐳 Connected to container shell.\r\n");
            // ws.send()
        };

        ws.onmessage = (e) => {
            termRef.current?.write(e.data);
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
