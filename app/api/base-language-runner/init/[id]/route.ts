import { NextRequest, NextResponse } from "next/server";
import Playground from "@/models/playground.models";
import { connectDB } from "@/lib/mongoose";
import { currentUser } from "@/modules/auth/actions";
import { initContainer } from "../../../../../backend/lib/initContainer";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDB();
  try {
    const { id } = await params;
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const playground = await Playground.findById(id).populate("templateFiles");

    if (!playground) {
      return NextResponse.json(
        { success: false, message: "Playground not found" },
        { status: 404 }
      );
    }

    // Initialize Docker container and socket connection
    const data = await initContainer({
      userId: user._id.toString(),
      projectId: playground._id.toString(),
      runId: "run1",
      playground: playground.templateFiles,
    });

    return NextResponse.json({ success: true, ...data });
  } catch (err) {
    console.error("❌ Container init failed:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
