import { create } from "zustand"


interface SocketStore {
    socket: WebSocket | null,
    setSocket: (socket: WebSocket | null) => void
}

export const useSocketStore = create<SocketStore>((set, get) => ({
    socket: null,
    setSocket: (socket) => {

        if(get().socket) return
        if (!socket) return 
        
        set({socket: socket})
    }
}))


