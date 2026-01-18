
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
