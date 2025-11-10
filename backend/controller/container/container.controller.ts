// controllers/containerController.ts
import { Request, Response } from "express";
import Playground from "../../../models/playground.models.ts";
import {connectDB} from "../../../lib/mongoose.ts";
import { currentUser } from "../../../modules/auth/actions/index.ts";
import { initContainer } from "../../lib/initContainer.ts";

export const initContainerController = async (req: Request, res: Response) => {
  try {
    await connectDB();

    const { id } = req.params; // playground ID from route params
    const user = await currentUser(); // pass req if your auth uses cookies/session

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const playground = await Playground.findById(id).populate("templateFiles");

    if (!playground) {
      return res.status(404).json({
        success: false,
        message: "Playground not found",
      });
    }

    // 🐳 Initialize Docker container
    const data = await initContainer({
      userId: user._id.toString(),
      projectId: "generalPlayground",
      runId: "run1",
      playground: playground.templateFiles,
    });

    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (err: any) {
    console.error("❌ Container init failed:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};


