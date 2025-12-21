export const runtime = "nodejs";
import { NextRequest } from "next/server";
import Docker from "dockerode";
import { WebSocketServer } from "ws";

const docker = new Docker({ socketPath: "/var/run/docker.sock" });

// Keep WebSocket server reference
let wss: WebSocketServer | null = null;

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  console.log("🔌 WS connection request for container ID:", id);

  if (!id) {
    return new Response("❌ Missing container ID", { status: 400 });
  }

  // Grab Node’s internal socket
  // @ts-ignore
  const upgradeHeader = req.headers.get("upgrade") || "";
  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected a WebSocket request", { status: 400 });
  }

  // @ts-ignore - Next.js provides access to Node HTTP server
  const nodeServer = req?.socket?.server;
  if (!nodeServer) {
    console.error("❌ Node server not available for WebSocket upgrade.");
    return new Response("Server not ready for WebSocket", { status: 500 });
  }

  // Initialize WebSocketServer once
  if (!wss) {
    console.log("🚀 Creating WebSocketServer...");
    wss = new WebSocketServer({ noServer: true });

    nodeServer.on("upgrade", async (request: any, socket: any, head: any) => {
      const url = new URL(request.url, `http://${request.headers.host}`);
      const containerId = url.pathname.split("/").pop();

      if (!containerId) {
        socket.destroy();
        return;
      }

      console.log(`⚡ Incoming WS connection for container: ${containerId}`);

      wss?.handleUpgrade(request, socket, head, async (ws) => {
        try {
          const container = docker.getContainer(containerId);
          const exec = await container.exec({
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
            Cmd: ["/bin/bash"],
          });

          const stream = await exec.start({ hijack: true, stdin: true });

          ws.send(`🐳 Connected to container shell (${containerId})\n`);

          // Send container output → client
          stream.on("data", (chunk) => {
            ws.send(chunk.toString());
          });

          // Client input → container stdin
          ws.on("message", (msg) => {
            stream.write(msg);
          });

          ws.on("close", () => {
            console.log(`🔌 Connection closed for container ${containerId}`);
            stream.end();
          });
        } catch (err) {
          console.error("💥 Docker attach failed:", err);
          ws.send(`❌ Error: ${(err as Error).message}`);
          ws.close();
        }
      });
    });
  }

  // This just tells Next.js the route is ready — WebSocket handled separately
  return new Response("WebSocket endpoint ready", { status: 200 });
}
