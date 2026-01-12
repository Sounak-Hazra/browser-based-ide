// backend/ws/handleSocket.ts
// import Docker from "dockerode";
// import { WebSocket } from "ws";
// import pty from "node-pty"

// // const docker = new Docker({ socketPath: "/var/run/docker.sock" });
// const docker = new Docker(); //* Chnages for windows compatibility

// /**
//  * Handles a WebSocket session for a specific container.
//  * Called whenever a client connects to /api/container/socket/:containerId
//  */
// export async function handleSocketConnection(ws: WebSocket, containerId: string, workingDirectory: string) {
//   try {

//     let suppressOutput = false;

//     if (!containerId) {
//       return;
//     }
//     console.log(`⚡ Handling WebSocket for container: ${containerId}`);

//     // 1️⃣ Get container reference
//     const container = docker.getContainer(containerId);

//     // 2️⃣ Inspect its state
//     const info = await container.inspect();
//     if (info.State.Status !== "running") {
//       console.log(`🟡 Container not running. Starting ${containerId}...`);
//       await container.start();
//     }

//     // 3️⃣ Create an interactive shell session (bash)
//     const exec = await container.exec({
//       AttachStdin: true,
//       AttachStdout: true,
//       AttachStderr: true,
//       Tty: true,
//       Cmd: ["/bin/bash"],
//     });

//     // 4️⃣ Start the exec session
//     const stream = await exec.start({ hijack: true, stdin: true });

//     // Send welcome message
//     ws.send(`🐳 Connected to container shell (${containerId})\n`);

//     // 5️⃣ Pipe container → frontend
//     stream.on("data", (chunk) => {
//       if (suppressOutput) {
//         return; // do NOT send to frontend
//       }
//       ws.send(chunk.toString("utf8").replace(/\n/g, "\r\n"));
//     });

//     // 6️⃣ Pipe frontend → container
//     ws.on("message", async (msg) => {
//       const text = msg.toString();

//       try {
//         const data = JSON.parse(text);
//         console.log(data)

//         if (data.type === "resize") {

//           suppressOutput = true; // start suppressing stream

//           stream.write("\x0c"); // clear bash internally
//           await exec.resize({ w: data.cols, h: data.rows });

//           // stop suppressing after short delay
//           setTimeout(() => {
//             suppressOutput = false;
//           }, 80); // 80-120ms works great

//           return;
//         }


//         if (data.type === "stdin") {
//           console.log("Writing to stdin:", data.data);
//           stream.write(data.data);
//           return;
//         }

//       } catch (err) {
//         // Not JSON → normal input
//       }

//       // Write raw input to container shell
//       stream.write(text);
//     });


//     // 7️⃣ Handle close
//     ws.on("close", async () => {
//       console.log(`🔌 WebSocket closed for container ${containerId}`);
//       try {
//         stream.end();
//         // Optional cleanup
//         await container.stop();
//         await container.remove();
//       } catch (err) {
//         console.warn(`⚠️ Failed to stop container: ${err}`);
//       }
//     });

//     // 8️⃣ Error handling
//     ws.on("error", (err) => {
//       console.error(`💥 WebSocket error for ${containerId}:`, err);
//     });

//   } catch (err: any) {
//     console.error("❌ Error handling socket connection:", err);
//     try {
//       ws.send(`Error: ${err.message || "Unknown Docker error"}`);
//       ws.close();
//     } catch { }
//   }
// }


// backend/ws/handleSocket.ts
// import Docker from "dockerode";
// import { WebSocket } from "ws";
// import pty from "node-pty"
// import os from "node:os"


// const shell = os.platform() === "win32" ? "powershell.exe" : "/bin/bash"
// const docker = new Docker(); //* Chnages for windows compatibility

// export async function handleSocketConnection(ws: WebSocket, containerId: string, workingDirectory: string) {
//   try {

//     let suppressOutput = false;
//     let col
//     let row

//     if (!containerId) {
//       return;
//     }
//     console.log(`⚡ Handling WebSocket for container: ${containerId}`);

//     const container = docker.getContainer(containerId);

//     const info = await container.inspect();
//     if (info.State.Status !== "running") {
//       console.log(`🟡 Container not running. Starting ${containerId}...`);
//       await container.start();
//     }

//     const exec = await container.exec({
//       AttachStdin: true,
//       AttachStdout: true,
//       AttachStderr: true,
//       Tty: true,
//       Cmd: ["/bin/bash"],
//     });

//     const stream = await exec.start({ hijack: true, stdin: true });


//     const ptyService = pty.spawn(shell, [], {
//       name: "xterm-256color",
//       cols: col || 80,
//       rows: row || 24,
//       cwd: "/",
//       env: process.env
//     })

//     stream.on("data", (chunk) => ptyService.write(chunk));

//     ptyService.onData((data) => {
//       stream.write(data)
//       ws.send(data);
//     });

//     ws.on("message", async (msg) => {
//       const text = msg.toString();

//       try {
//         const data = JSON.parse(text);
//         console.log(data)

//         if (data.type === "resize") {

//           suppressOutput = true;

//           col = data.cols
//           row = data.rows

//           setTimeout(() => {
//             suppressOutput = false;
//           }, 80);

//           return;
//         }


//         if (data.type === "stdin") {

//           ptyService.write(data.data.toString ? data.data.toString() : data.data);
//           return;
//         }

//       } catch (err) {
//       }
//       stream.write(text);
//     });


//     ws.on("close", async () => {
//       console.log(`🔌 WebSocket closed for container ${containerId}`);
//       try {
//         stream.end();
//         // Optional cleanup
//         await container.stop();
//         await container.remove();
//       } catch (err) {
//         console.warn(`⚠️ Failed to stop container: ${err}`);
//       }
//     });

//     // 8️⃣ Error handling
//     ws.on("error", (err) => {
//       console.error(`💥 WebSocket error for ${containerId}:`, err);
//     });

//   } catch (err: any) {
//     console.error("❌ Error handling socket connection:", err);
//     try {
//       ws.send(`Error: ${err.message || "Unknown Docker error"}`);
//       ws.close();
//     } catch { }
//   }
// }


//-----------------------------------------------------------------------------------------------------------

import Docker from "dockerode";
import { WebSocket } from "ws";
import pty from "node-pty";
import os from "node:os";

const docker = new Docker();

export async function handleSocketConnection(
  ws: WebSocket,
  containerId: string,
  workingDirectory: string
) {
  try {
    if (!containerId) return;

    console.log(`⚡ Terminal connection → ${containerId}`);

    const container = docker.getContainer(containerId);
    const info = await container.inspect();

    if (info.State.Status !== "running") {
      console.log("🟡 Container stopped — starting…");
      await container.start();
    }

    let cols = 80;
    let rows = 24;

    // PLATFORM PTY COMMAND
    const cmd = os.platform() === "win32"
      ? "docker.exe"   // always use Windows Docker CLI
      : "docker";

    const ptyProcess = pty.spawn(
      cmd,
      [
        "exec",
        "-it",
        "-u", "runner", //Same name as in Dockerfile USER if it changes update here too
        containerId,
        "/bin/bash",
        "-l"
      ],
      {
        name: "xterm-256color",
        cols,
        rows,
        cwd: "/",
        env: process.env
      }
    );

    console.log("✅ PTY session started");

    // PTY → frontend
    ptyProcess.onData(data => ws.send(data));

    // frontend → PTY
    ws.on("message", async (msg) => {
      try {
        const payload = JSON.parse(msg.toString());
        if (payload.type === "stdin") {
          ptyProcess.write(payload.data);
          return;
        }

        if (payload.type === "resize") {
          cols = payload.cols;
          rows = payload.rows;
          ptyProcess.resize(cols, rows);
          return;
        }

      } catch {
        ptyProcess.write(msg.toString());
      }
    });


    async function safe(fn: () => Promise<any>) {
      try { await fn() } catch (error) { console.log(error) }
    }

    ws.on("close", async () => {
      console.log("🔌 WebSocket closed — killing PTY");
      ptyProcess.kill();

      await safe(() => container.stop());
      await safe(() => container.remove());
    });

    ws.on("error", async err => {
      console.error("💥 WebSocket error:", err);
      ptyProcess.kill();

    });

    ws.send(`🐳 Connected to container terminal: ${containerId}\r\n`);

  } catch (err: any) {
    console.error("❌ Terminal init error:", err);
    try { ws.send(`Error: ${err.message}`); } catch {

    }
    ws.close();
  }
}
