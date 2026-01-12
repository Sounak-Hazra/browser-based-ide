// import React from 'react'
// import { ChartNoAxesCombined } from "lucide-react"
// import { Button } from '@/components/ui/button';




// interface RunButtonProps {
//     onClickRun: () => void;
// }


// const RunWithStats = ({ onClickRun }: RunButtonProps) => {
//     const handleClick = async () => {
//         onClickRun();
//     }
//     return (
//         <>
//             <Button
//                 size="sm"
//                 variant="default"
//                 onClick={handleClick}
//             >
//                 <ChartNoAxesCombined className="h-4 w-4" />
//             </Button >
//         </>
//     )
// }

// export default RunWithStats


import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ChartNoAxesCombined, Play } from "lucide-react"
import { ChartsDrawer } from "./chartsDrawer"

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


interface RunWithStatsPopOverProps {
    runWithStats: () => void;
    stats: {
        [fileId: string]: ExecutionStat[];
    };
    clearStats: () => void;
    clearStatsForaFile: (fileId: string)=> void
}

export default function RunWithStatsPopOver({ runWithStats, stats, clearStats, clearStatsForaFile }: RunWithStatsPopOverProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline">Run With Stats</Button>
            </PopoverTrigger>
            <PopoverContent className="w-60">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="leading-none font-medium">Run with stats</h4>
                        <p className="text-muted-foreground text-sm">
                            Run the selected file and display resource usage statistics.
                        </p>
                    </div>
                    <div className="grid gap-2">
                        <div className="items-center flex justify-between gap-4">
                            <Label htmlFor="run">Run</Label>
                            <Button
                                size="sm"
                                variant="default"
                                onClick={runWithStats}
                            >
                                <Play className="h-4 w-4" />
                            </Button >
                        </div>
                        <div className="items-center flex justify-between gap-4">
                            <Label htmlFor="maxWidth">Show Stats</Label>
                            {/* <Button
                                size="sm"
                                variant="default"
                                onClick={() => { }}
                            >
                                <ChartNoAxesCombined className="h-4 w-4" />
                            </Button > */}

                            <ChartsDrawer stats={stats} clearStats={clearStats} clearStatsForaFile={clearStatsForaFile} />
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
