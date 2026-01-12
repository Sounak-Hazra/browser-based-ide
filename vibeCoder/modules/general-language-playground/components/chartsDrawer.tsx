"use client"

import { ChartNoAxesCombined } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { FileText } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import {
    Menubar,
    MenubarMenu,
    MenubarTrigger,
} from "@/components/ui/menubar"

import { Button } from "@/components/ui/button"
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarProvider,
} from "@/components/ui/sidebar"

export type ExecutionStat = {
    runId: string
    timestamp: number
    exitCode: number
    status: "completed" | "failed" | "timeout"
    wallTimeMs: number
    userTimeMs: number
    systemTimeMs: number
    cpuPercent: number
    maxMemoryKb: number
    programOutput: string
}

type ChatStoreProps = {
    stats: {
        [fileId: string]: ExecutionStat[]
    },
    clearStatsForaFile: (fileId: string) => void,
    clearStats: () => void
}

export function ChartsDrawer({ stats, clearStatsForaFile, clearStats }: ChatStoreProps) {
    const [activeFileId, setActiveFileId] = useState<string | null>(Object.keys(stats)?.[0] || null)
    const [selectedData, setSelectedData] = useState<ExecutionStat[] | null>(stats?.[Object.keys(stats)[0]] || null)
    const [activeField, setActiveField] = useState<
        "userTimeMs" | "cpuPercent" | "maxMemoryKb"
    >("userTimeMs")
    const firstTime = useRef(true)

    useEffect(() => {
        if (firstTime.current) {
            firstTime.current = false
            setActiveFileId(Object.keys(stats)?.[0] || null)
            setSelectedData(stats[Object.keys(stats)[0]] || null)
            return
        }
    }, [stats])

    const handleSelectData = (fileId: string) => {
        setSelectedData(stats[fileId])
        setActiveFileId(fileId)
    }

    useEffect(() => {
        setSelectedData(stats[activeFileId ?? ""] || null)
    }, [stats])

    return (
        <Drawer>
            <DrawerTrigger asChild>
                <Button size="sm">
                    <ChartNoAxesCombined className="h-4 w-4" />
                </Button>
            </DrawerTrigger>



            <DrawerContent className="p-0">
                <DrawerHeader className="border-b px-6 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <DrawerTitle className="text-lg font-semibold">
                                Run Profiler
                            </DrawerTitle>
                            <DrawerDescription className="text-sm">
                                Execution metrics for selected file
                            </DrawerDescription>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Clear current file */}
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!activeFileId}
                                onClick={() => {
                                    if (!activeFileId) return
                                    clearStatsForaFile(activeFileId)
                                }}
                            >
                                Clear File
                            </Button>

                            {/* Clear all */}
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={clearStats}
                            >
                                Clear All
                            </Button>
                        </div>
                    </div>
                </DrawerHeader>
                <div className="flex h-full">
                    <SidebarProvider>
                        <FilesSidebar
                            activeFile={activeFileId}
                            onSelect={handleSelectData}
                            data={Object.keys(stats)}
                        />

                        <div className="flex-1">
                            <DrawerHeader className="border-b px-6 py-4">
                                <DrawerTitle className="text-lg font-semibold">
                                    Run Profiler
                                </DrawerTitle>
                                <DrawerDescription className="text-sm">
                                    Execution metrics for selected file
                                </DrawerDescription>
                            </DrawerHeader>

                            <div className="px-6 pt-4">
                                <ActiveFielIdMenuBar
                                    activeField={activeField}
                                    setActiveField={setActiveField}
                                    fields={["userTimeMs", "cpuPercent", "maxMemoryKb"]}
                                />
                            </div>

                            <div className="px-6 pb-4 pt-4">
                                <div className="rounded-lg border bg-muted/20 p-4">
                                    <div className="h-[340px]">
                                        <Chart
                                            key={activeFileId}
                                            name={activeFileId ?? ""}
                                            data={selectedData ?? []}
                                            activeField={activeField}
                                        />
                                    </div>
                                </div>
                            </div>

                            <DrawerFooter />
                        </div>
                    </SidebarProvider>
                </div>
            </DrawerContent>
        </Drawer>
    )
}

/* ===================== SIDEBAR ===================== */

function FilesSidebar({
    data,
    activeFile,
    onSelect,
}: {
    data: string[]
    activeFile: string | null
    onSelect: (fileName: string) => void
}) {
    return (
        <Sidebar className="border-r bg-muted/30">
            <SidebarHeader className="px-4 py-3 text-sm font-semibold text-muted-foreground">
                Files
            </SidebarHeader>

            <SidebarContent className="px-2 py-2">
                <div className="space-y-1">
                    {data.map((fileName) => {
                        const isActive = fileName === activeFile

                        return (
                            <button
                                key={fileName}
                                onClick={() => onSelect(fileName)}
                                className={`
                  flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm
                  transition-all duration-150
                  ${isActive
                                        ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                                        : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
                                    }
                `}
                            >
                                <FileText className="h-4 w-4 shrink-0" />
                                <span className="truncate">{fileName}</span>
                            </button>
                        )
                    })}
                </div>
            </SidebarContent>

            <SidebarFooter className="px-4 py-2 text-xs text-muted-foreground">
                {data.length} file{data.length !== 1 && "s"}
            </SidebarFooter>
        </Sidebar>
    )
}

/* ===================== CHART ===================== */

function Chart({
    data,
    activeField,
}: {
    name: string
    data: ExecutionStat[]
    activeField: "userTimeMs" | "cpuPercent" | "maxMemoryKb"
}) {
    const chartData = data.map((stat, i) => ({
        ExecutionTime: stat.userTimeMs,
        index: i + 1,
        cpu: stat.cpuPercent,
        Memory_Usage: stat.maxMemoryKb,
        status: stat.status,
        output: stat.programOutput,
        exitCode: stat.exitCode,
    }))

    const chartConfig = { ExecutionTime: { label: "Execution Time (ms)", color: "#ffffff", }, cpu: { label: "CPU Usage (%)", color: "#8884d8", }, Memory_Usage: { label: "Memory Usage (KB)", color: "#82ca9d", }, } satisfies ChartConfig

    const STAT_KEY_MAP = {
        userTimeMs: "ExecutionTime",
        cpuPercent: "cpu",
        maxMemoryKb: "Memory_Usage",
    } as const

    const activeChartKey = STAT_KEY_MAP[activeField]

    return (
        <div className="w-full h-full flex items-center">
            <ChartContainer className="w-full max-h-[360px]" config={chartConfig}>
                <BarChart
                    barSize={30}
                    data={chartData}
                    barGap={10}
                    barCategoryGap={20}
                >
                    <XAxis dataKey="index" />
                    <YAxis allowDecimals={false} />
                    <ChartTooltip
                        wrapperStyle={{ pointerEvents: "auto" }}
                        content={<ExecutionTooltip />}
                    />
                    <Bar
                        dataKey={activeChartKey}
                        fill={`var(--color-${activeChartKey})`}
                        radius={4}
                    />
                </BarChart>
            </ChartContainer>
        </div>
    )
}

/* ===================== TOOLTIP ===================== */

function ExecutionTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null

    const d = payload[0].payload

    return (
        <div className="max-w-xs rounded-lg border bg-background/95 backdrop-blur p-3 text-xs shadow-lg">
            <div className="mb-2 font-semibold">Run #{d.index}</div>

            <div className="space-y-1 text-muted-foreground">
                <div>Status: <span className="text-foreground">{d.status}</span></div>
                <div>Exit Code: <span className="text-foreground">{d.exitCode}</span></div>

                <hr className="my-1 border-border" />

                <div>Execution Time: <span className="text-foreground">{d.ExecutionTime} ms</span></div>
                <div>CPU Usage: <span className="text-foreground">{d.cpu}%</span></div>
                <div>Memory Usage: <span className="text-foreground">{(d.Memory_Usage / 1024).toFixed(1)} MB</span></div>

                {d.output && (
                    <>
                        <hr className="my-1 border-border" />
                        <pre className="max-h-24 overflow-auto rounded bg-muted p-2 text-[10px]">
                            {d.output}
                        </pre>
                    </>
                )}
            </div>
        </div>
    )
}

/* ===================== MENU BAR ===================== */

function ActiveFielIdMenuBar({
    activeField,
    setActiveField,
    fields,
}: {
    activeField: "userTimeMs" | "cpuPercent" | "maxMemoryKb"
    setActiveField: (f: any) => void
    fields: ("userTimeMs" | "cpuPercent" | "maxMemoryKb")[]
}) {
    const STAT_KEY_MAP = {
        userTimeMs: "Execution Time",
        cpuPercent: "CPU",
        maxMemoryKb: "Memory",
    } as const

    return (
        <Menubar className="w-fit h-fit rounded-lg border bg-muted/40 px-2 py-1">
            <MenubarMenu>
                {fields.map((field) => (
                    <MenubarTrigger
                        key={field}
                        className="p-0 focus:bg-transparent"
                    >
                        <button
                            onClick={() => setActiveField(field)}
                            className={`
                flex items-center px-4 py-2 text-sm rounded-md
                transition-all duration-150
                ${field === activeField
                                    ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                                    : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
                                }
              `}
                        >
                            {STAT_KEY_MAP[field]}
                        </button>
                    </MenubarTrigger>
                ))}
            </MenubarMenu>
        </Menubar>
    )
}
