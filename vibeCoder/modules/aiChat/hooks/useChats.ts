// store/useChatStore.ts
import { create } from "zustand";

export interface ChatMessage {
  _id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming: boolean;
  isThinking: boolean
  createdAt: string;
  mode: string;
  model: string;
}

interface ChatState {
  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  appendToLastAssistant: (token: string) => void;
  finishStreaming: () => void;
  reset: () => void;
  addMessages: (newMessages: ChatMessage[]) => void;
  setThinking: (id: string, value: boolean) => void;
  setStreaming: (id: string, value: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  
  addMessage: (msg) =>
    set((state) => ({
      messages: [...state.messages, msg],
    })),

  appendToLastAssistant: (token) =>
    set((state) => {
      const msgs = [...state.messages];
      const last = msgs[msgs.length - 1];

      if (last?.role === "assistant") {
        last.content += token;
      }

      return { messages: msgs };
    }),

  finishStreaming: () =>
    set((state) => {
      const msgs = [...state.messages];
      const last = msgs[msgs.length - 1];
      if (last?.role === "assistant") {
        last.isStreaming = false;
      }
      return { messages: msgs };
    }),

    setThinking: (id, value) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m._id === id ? { ...m, isThinking: value } : m
      ),
    })),

  setStreaming: (id, value) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m._id === id ? { ...m, isStreaming: value } : m
      ),
    })),
  
  addMessages: (newMessages: ChatMessage[]) =>
    set((state) => ({
      messages: [...state.messages, ...newMessages],
    })),

  reset: () => set({ messages: [] }),
}));
