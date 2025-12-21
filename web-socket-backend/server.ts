// // express-server.ts
// import express from "express";
// import { createServer } from "http";
// import { WebSocketServer } from "ws";
// import Docker from "dockerode";
// import cors from "cors";

// const app = express();
// app.use(cors());
// app.use(express.json());

// const server = createServer(app);
// const wss = new WebSocketServer({ noServer: true });
// const docker = new Docker({ socketPath: "/var/run/docker.sock" });

// app.get("/", (req, res) => {
//   res.send("✅ Express Docker Socket Server is running!");
// });

// app.get("/api/health", (req, res) => {
//   res.json({ success: true, message: "Server healthy 🟢" });
// });

// // 🔥 WebSocket Upgrade Route
// server.on("upgrade", async (req, socket, head) => {
//   const url = new URL(req.url, `http://${req.headers.host}`);
//   const pathname = url.pathname;

//   const match = pathname.match(/^\/api\/container\/socket\/([^/]+)$/);
//   if (!match) {
//     socket.destroy();
//     return;
//   }

//   const containerId = match[1];
//   console.log(`⚡ WebSocket upgrade request for container: ${containerId}`);

//   wss.handleUpgrade(req, socket, head, async (ws) => {
//     try {
//       const container = docker.getContainer(containerId);
//       const containerInfo = await container.inspect();

//       // 🧠 Check if container is stopped — start it if needed
//       if (containerInfo.State.Status !== "running") {
//         console.log(`🟡 Container ${containerId} is ${containerInfo.State.Status}. Starting it...`);
//         await container.start();
//         console.log(`✅ Container ${containerId} started successfully.`);
//       }

//       console.log("Till here")
//       container.i

//       // 🧰 Create an interactive bash shell exec session
//       const exec = await container.exec({
//         AttachStdin: true,
//         AttachStdout: true,
//         AttachStderr: true,
//         Tty: true,
//         Cmd: ["/bin/bash"],
//       });


//       console.log("Till here 2");

//       const stream = await exec.start({ hijack: true, stdin: true });
//       ws.send(`🐳 Connected to container shell (${containerId})\n`);

//       // container stdout → client
//       stream.on("data", (chunk) => {
//         ws.send(chunk.toString());
//       });

//       // client input → container stdin
//       ws.on("message", (msg) => {
//         stream.write(msg);
//       });

//       ws.on("close", async () => {
//         console.log(`🔌 Connection closed for container ${containerId}`);
//         stream.end();

//         // Optional: stop container when user disconnects
//         // console.log(`🧹 Stopping container ${containerId}...`);
//         // await container.stop();
//       });

//       ws.onerror = (err) => {
//         console.error("💥 WebSocket error:", err);
//       };
//     } catch (err) {
//       console.error("❌ Docker exec failed:", err);
//       try {
//         ws.send(`Error: ${err.message || "Unknown Docker error"}`);
//       } catch { }
//       ws.close();
//     }
//   });
// });

// const PORT = 8080;
// server.listen(PORT, () => {
//   console.log(`🚀 Express + WebSocket server listening at http://localhost:${PORT}`);
// });


// backend/server.ts



import {server} from "./main.ts";




const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});