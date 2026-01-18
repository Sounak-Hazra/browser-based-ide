import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Conversation from "@/models/conversation.models";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { userId, title="New Conversation", model, systemPrompt } = body;


    const newConversation = await Conversation.create({
      userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
      title,
      model: model || "codellama:7b",
      systemPrompt: systemPrompt || "You are a helpful assistant.",
    });

    return NextResponse.json({conversationId: newConversation._id.toString()}, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating conversation:", error);

    /* eslint-disable @typescript-eslint/no-explicit-any */
    if ((error as any).code === 11000) {
      return NextResponse.json(
        { error: "A conversation with this title already exists." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}



