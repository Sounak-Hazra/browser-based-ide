// backend/server.ts
import express from "express";
import { createServer } from "http";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import compression from "compression";
import { WebSocketServer } from "ws";
import { handleSocketConnection } from "./ws/handleSocket.ts";

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ noServer: true });


app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(compression());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Express backend is live 🚀" });
});


// import base_language_runner_router from "./routes/container.routes.ts"
// app.use("/base-language-runner", base_language_runner_router)


// import templateRouter from "./routes/template.routes.ts";
// app.use("/template", templateRouter);


server.on("upgrade", (req , socket, head) => {
  const pathname = new URL(req.url!, `http://${req.headers.host}`).pathname;
  console.log(`⚡ WebSocket upgrade request → ${pathname}`);
  wss.handleUpgrade(req, socket, head, (ws) => {
    ws.send("👋 WebSocket connection established!");

    const match = pathname.match(/^\/api\/container\/socket\/([^/]+)$/);
    if (!match) return socket.destroy();

    const containerId = match[1];
    handleSocketConnection(ws, containerId);
  });
});

export { app, server, wss };
