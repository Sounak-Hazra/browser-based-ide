import { useState } from "react";
import { useChatStore } from "./useChats";

export const useSendMessage = () => {
  const { addMessage, appendToLastAssistant, finishStreaming, setThinking, setStreaming } = useChatStore();

  const sendMessage = async (
    messageContent: string,
    conversationId: string,
    model: string,
    mode: string
  ) => {
    addMessage({
      _id: crypto.randomUUID(),
      role: "user",
      content: messageContent,
      createdAt: new Date().toISOString(),
      isStreaming: false,
      isThinking: false,
      mode,
      model,
    });

    const latestMessageId = crypto.randomUUID();

    addMessage({
      _id: latestMessageId,
      role: "assistant",
      content: "",
      isStreaming: true,
      isThinking: true,
      createdAt: new Date().toISOString(),
      mode,
      model,
    });

    try {
      const res = await fetch("/api/aiChat/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, userMessage: messageContent, model, mode }),
      });

      if (!res.ok || !res.body) {
        throw new Error("Failed to send message");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let firstChunk = true;
      let receivedAnyChunk = false;

      while (true) {
        const result = await reader.read();
        if (!result) {
          throw new Error("Stream read failed");
        }

        const { done, value } = result;

        if (done) {
          if (!receivedAnyChunk) {
            throw new Error("Stream closed without data");
          }
          setStreaming(latestMessageId,false);
          break;
        }

        if (!value || value.byteLength === 0) {
          continue;
        }

        let chunk: string;
        try {
          chunk = decoder.decode(value, { stream: true });
        } catch {
          throw new Error("Stream decode failed");
        }

        if (firstChunk) {
          setThinking(latestMessageId,false);
          firstChunk = false;
        }

        receivedAnyChunk = true;
        appendToLastAssistant(chunk);
      }
    } catch (error: unknown) {
      setThinking(latestMessageId,false);
      appendToLastAssistant(
        (error as any)?.message || "⚠️ Streaming failed. Please retry."
      );
    } finally {
      setThinking(latestMessageId,false);
      finishStreaming();
    }
  };

  return { sendMessage };
};
