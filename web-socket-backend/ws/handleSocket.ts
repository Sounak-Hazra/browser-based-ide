// backend/ws/handleSocket.ts
import Docker from "dockerode";
import { WebSocket } from "ws";

const docker = new Docker({ socketPath: "/var/run/docker.sock" });

/**
 * Handles a WebSocket session for a specific container.
 * Called whenever a client connects to /api/container/socket/:containerId
 */
export async function handleSocketConnection(ws: WebSocket, containerId: string, workingDirectory: string) {
  try {

    let suppressOutput = false;

    if (!containerId) {
      return;
    }
    console.log(`⚡ Handling WebSocket for container: ${containerId}`);

    // 1️⃣ Get container reference
    const container = docker.getContainer(containerId);

    // 2️⃣ Inspect its state
    const info = await container.inspect();
    if (info.State.Status !== "running") {
      console.log(`🟡 Container not running. Starting ${containerId}...`);
      await container.start();
    }

    // 3️⃣ Create an interactive shell session (bash)
    const exec = await container.exec({
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      Tty: true,
      Cmd: ["/bin/bash"],
    });

    // 4️⃣ Start the exec session
    const stream = await exec.start({ hijack: true, stdin: true });

    // Send welcome message
    ws.send(`🐳 Connected to container shell (${containerId})\n`);

    // 5️⃣ Pipe container → frontend
    stream.on("data", (chunk) => {
      if (suppressOutput) {
        return; // do NOT send to frontend
      }
      ws.send(chunk.toString());
    });

    // 6️⃣ Pipe frontend → container
    ws.on("message", async (msg) => {
      const text = msg.toString();

      try {
        const data = JSON.parse(text);
        console.log(data)

        if (data.type === "resize") {

          suppressOutput = true; // start suppressing stream
        
          stream.write("\x0c"); // clear bash internally
          await exec.resize({ w: data.cols, h: data.rows });
        
          // stop suppressing after short delay
          setTimeout(() => {
            suppressOutput = false;
          }, 80); // 80-120ms works great
        
          return;
        }
        

        if (data.type === "stdin") {
          stream.write(data.data);
          return;
        }

      } catch (err) {
        // Not JSON → normal input
      }

      // Write raw input to container shell
      stream.write(text);
    });


    // 7️⃣ Handle close
    ws.on("close", async () => {
      console.log(`🔌 WebSocket closed for container ${containerId}`);
      try {
        stream.end();
        // Optional cleanup
        await container.stop();
        await container.remove();
      } catch (err) {
        console.warn(`⚠️ Failed to stop container: ${err}`);
      }
    });

    // 8️⃣ Error handling
    ws.on("error", (err) => {
      console.error(`💥 WebSocket error for ${containerId}:`, err);
    });

  } catch (err: any) {
    console.error("❌ Error handling socket connection:", err);
    try {
      ws.send(`Error: ${err.message || "Unknown Docker error"}`);
      ws.close();
    } catch { }
  }
}
