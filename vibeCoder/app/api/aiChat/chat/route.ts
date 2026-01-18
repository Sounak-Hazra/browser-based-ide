import Message from "@/models/message.models";
import Conversation from "@/models/conversation.models";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import ollama from "ollama"

const getChatModePrompt = (mode: string, content: string) => {
    return `Mode: ${mode}\nContent: ${content}`;
};


export async function POST(request: Request) {

    const { conversationId, userMessage = "no message provided", model = "qwen3:1.7b", mode = "" } = await request.json();
    try {

        console.log(model)

        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
            return NextResponse.json({ error: "Invalid conversation ID." }, { status: 400 });
        }
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
        }
        const newMessage = new Message({
            conversationId: conversation._id,
            role: "user",
            content: userMessage,
        });

        await newMessage.save();

        const previousMessages = await Message.find({ conversationId: conversation._id }).sort({ createdAt: 1 }).limit(20);


        const assistantMessage = await Message.create({
            conversationId,
            role: "assistant",
            content: "",
            isStreaming: true,
        })

        const prompt = getChatModePrompt(mode, userMessage);
        console.log("Prompt sent to AI:", prompt);
        const encoder = new TextEncoder();

        const steam = new ReadableStream({
            async start(controller) {
                try {
                    const aiStream = await ollama.chat({
                        model: model,
                        messages: [
                            ...previousMessages.map(msg => ({ role: msg.role, content: prompt })),
                        ],
                        stream: true,
                    });

                    let responceMessage = ""

                    for await (const chunk of aiStream) {
                        const token = chunk.message?.content ?? ""

                        if (token) {
                            controller.enqueue(encoder.encode(token))
                            responceMessage += token;
                        }
                    }

                    controller.close();

                    assistantMessage.content = responceMessage
                    assistantMessage.isStreaming = false
                    await assistantMessage.save()
                } catch (err) {
                    controller.error(err)
                    assistantMessage.isStreaming = false
                    await assistantMessage.save()
                }

            }
        });


        return new Response(steam,
            {
                headers: {
                    "Content-Type": "text/plain; charset=utf-8",
                    "Cache-Control": "no-cache",
                },
            });

    } catch (error) {
        console.error("Error in AI chat route:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}