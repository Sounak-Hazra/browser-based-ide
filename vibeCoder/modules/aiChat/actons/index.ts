import type { ChatMessage } from "@/modules/aiChat/hooks/useChats";

export const createConversation = async (userId: string): Promise<string | undefined> => {
  try {
    const res = await fetch("/api/aiChat/createConversation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, title: Date.now().toString()}),
    });

    if (!res.ok) {
      throw new Error("Failed to create conversation");
    }

    const data = await res.json();

    return data.conversationId;
  } catch (err) {
    console.error(err);
  }
}

export const fetchMessages = async (conversationId: string): Promise<ChatMessage[]> => {
  try {
    const res = await fetch("/api/aiChat/getMessages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId }),
    });
    const data = await res.json();
    return data.messages;
  } catch (err) {
    console.error(err);
    return [];
  }
}

