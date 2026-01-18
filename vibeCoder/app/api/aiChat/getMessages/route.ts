import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Message from "@/models/message.models";
import mongoose from "mongoose";

export async function POST(req: Request) {
    try {
        await connectDB();
        const { conversationId } = await req.json();

        if (!conversationId) {
            return NextResponse.json({ error: "Conversation ID is required" }, { status: 400 });
        }

        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
             return NextResponse.json({ error: "Invalid conversation ID" }, { status: 400 });
        }

        const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

        return NextResponse.json({messages}, { status: 200 });

    } catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
