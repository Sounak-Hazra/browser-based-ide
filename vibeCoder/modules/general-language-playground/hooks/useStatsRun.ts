import { create } from 'zustand';
import { immer } from "zustand/middleware/immer"

export type ExecutionStat = {
    runId: string;
    timestamp: number;

    // process result
    exitCode: number;
    status: "completed" | "failed" | "timeout";

    // timing
    wallTimeMs: number;   // elapsed time
    userTimeMs: number;
    systemTimeMs: number;
    cpuPercent: number;

    // memory
    maxMemoryKb: number;

    // raw program stdout before stats
    programOutput: string;
};



type StatsStore = {
    [fileId: string]: ExecutionStat[];
};


interface useStatsStoreStates {
    stats: StatsStore;
    addStats: (fileId: string, stat: ExecutionStat) => void,
    clearStats: () => void,
    clearStatsForaFile: (fileId: string)=> void
}


export const useStatsStore = create<useStatsStoreStates>()(
    immer((set,get) => ({

        stats: {},

        addStats: (fileId, stat) =>{
            set((state) => {
                // ensure entry exists
                if (!state.stats[fileId]) {
                    state.stats[fileId] = [];
                }

                state.stats[fileId].push(stat);

                // optional: keep last 20 runs
                if (state.stats[fileId].length > 20) {
                    state.stats[fileId].shift();
                }
            })
        },
        clearStats: () => {
            set((state) => {
                state.stats = {}
            })
        },
        clearStatsForaFile: (fileID) => {
            set((state) => {
                state.stats[fileID] = []
            })
        }
    }))
)

