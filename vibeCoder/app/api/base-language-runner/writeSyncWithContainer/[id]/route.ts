import { NextRequest, NextResponse } from "next/server";
import Playground from "@/models/playground.models";
import { connectDB } from "@/lib/mongoose";
import { currentUser } from "@/modules/auth/actions";
import { writeSyncContainer } from "../../lib/writeSyncContainer";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  try {
    const { id } = await params;

    const { playgroundId } = await req.json();
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const playground = await Playground.findById(playgroundId).populate("templateFiles");

    if (!playground) {
      return NextResponse.json(
        { success: false, message: "Playground not found" },
        { status: 404 }
      );
    }

    await writeSyncContainer({
      userId: user._id,
      playground: playground.templateFiles,
      runId: "run1",
      containerId: id,
      projectId: playgroundId
    })

    return NextResponse.json({ success: true, message: "Files sinced with container." });
  } catch (err: unknown) {
    console.error("❌ Container init failed:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
