// "use client";

// import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from "react";
// import { Terminal } from "xterm";
// import { FitAddon } from "xterm-addon-fit";
// import { WebLinksAddon } from "xterm-addon-web-links";
// import { SearchAddon } from "xterm-addon-search";
// import "xterm/css/xterm.css";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Search, Copy, Trash2, Download } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { ApiErrorResponse, ApiSuccessResponse } from "@/types/api-responce";
// import { useXtermTerminal } from "../hooks/useXtermTerminal";
// import { useContainerSocket } from "../hooks/useContainerSocket";

// interface TerminalProps {
//     className?: string;
//     theme?: "dark" | "light";
//     compileCode: (command: string) => Promise<ApiErrorResponse | ApiSuccessResponse<string>>
//     socketUrl: string;
//     containerId: string;
// }

// // Define the methods that will be exposed through the ref
// export interface TerminalRef {
//     writeToTerminal: (data: string) => void;
//     clearTerminal: () => void;
//     focusTerminal: () => void;
// }

// const
//     TerminalComponentForGeneralLanguage = forwardRef<TerminalRef, TerminalProps>(({
//         className,
//         theme = "dark",
//         compileCode,
//         socketUrl,
//         containerId
//     }, ref) => {
//         const terminalRef = useRef<HTMLDivElement>(null);
//         const term = useRef<Terminal | null>(null);
//         const fitAddon = useRef<FitAddon | null>(null);
//         const searchAddon = useRef<SearchAddon | null>(null);
//         const [isConnected, setIsConnected] = useState(false);
//         const [searchTerm, setSearchTerm] = useState("");
//         const [showSearch, setShowSearch] = useState(false);
//         const socket = useRef<WebSocket | null>(null);

//         // Command line state
//         const currentLine = useRef<string>("");
//         const cursorPosition = useRef<number>(0);
//         const commandHistory = useRef<string[]>([]);
//         const historyIndex = useRef<number>(-1);
//         const currentProcess = useRef<any>(null);
//         const shellProcess = useRef<any>(null);

//         const terminalThemes = {
//             dark: {
//                 background: "#09090B",
//                 foreground: "#FAFAFA",
//                 cursor: "#FAFAFA",
//                 cursorAccent: "#09090B",
//                 selection: "#27272A",
//                 black: "#18181B",
//                 red: "#EF4444",
//                 green: "#22C55E",
//                 yellow: "#EAB308",
//                 blue: "#3B82F6",
//                 magenta: "#A855F7",
//                 cyan: "#06B6D4",
//                 white: "#F4F4F5",
//                 brightBlack: "#3F3F46",
//                 brightRed: "#F87171",
//                 brightGreen: "#4ADE80",
//                 brightYellow: "#FDE047",
//                 brightBlue: "#60A5FA",
//                 brightMagenta: "#C084FC",
//                 brightCyan: "#22D3EE",
//                 brightWhite: "#FFFFFF",
//             },
//             light: {
//                 background: "#FFFFFF",
//                 foreground: "#18181B",
//                 cursor: "#18181B",
//                 cursorAccent: "#FFFFFF",
//                 selection: "#E4E4E7",
//                 black: "#18181B",
//                 red: "#DC2626",
//                 green: "#16A34A",
//                 yellow: "#CA8A04",
//                 blue: "#2563EB",
//                 magenta: "#9333EA",
//                 cyan: "#0891B2",
//                 white: "#F4F4F5",
//                 brightBlack: "#71717A",
//                 brightRed: "#EF4444",
//                 brightGreen: "#22C55E",
//                 brightYellow: "#EAB308",
//                 brightBlue: "#3B82F6",
//                 brightMagenta: "#A855F7",
//                 brightCyan: "#06B6D4",
//                 brightWhite: "#FAFAFA",
//             },
//         };

//         const writePrompt = useCallback(() => {
//             if (term.current) {
//                 term.current.write("\r\n$ ");
//                 currentLine.current = "";
//                 cursorPosition.current = 0;
//             }
//         }, []);

//         // Expose methods through ref
//         useImperativeHandle(ref, () => ({
//             writeToTerminal: (data: string) => {
//                 if (term.current) {
//                     term.current.write(data);
//                 }
//             },
//             clearTerminal: () => {
//                 clearTerminal();
//             },
//             focusTerminal: () => {
//                 if (term.current) {
//                     term.current.focus();
//                 }
//             },
//         }));

//         // const executeCommand = useCallback(async (command: string) => {
//         //     if (!term.current) return;

//         //     // Add to history
//         //     if (command.trim() && commandHistory.current[commandHistory.current.length - 1] !== command) {
//         //         commandHistory.current.push(command);
//         //     }
//         //     historyIndex.current = -1;

//         //     try {
//         //         // Handle built-in commands
//         //         if (command.trim() === "clear") {
//         //             term.current.clear();
//         //             writePrompt();
//         //             return;
//         //         }

//         //         if (command.trim() === "history") {
//         //             commandHistory.current.forEach((cmd, index) => {
//         //                 term.current!.writeln(`  ${index + 1}  ${cmd}`);
//         //             });
//         //             writePrompt();
//         //             return;
//         //         }

//         //         if (command.trim() === "") {
//         //             writePrompt();
//         //             return;
//         //         }

//         //         //TODO implement compile code function

//         //         const data = await compileCode(command)

//         //         term.current.writeln(`\r\n${data.data || data.message}`);
//         //         writePrompt();

//         //     } catch (error: any) {
//         //         if (term.current) {
//         //             term.current.writeln(`\r\nError: ${error.message || 'Command not found'}`);
//         //             writePrompt();
//         //         }
//         //         currentProcess.current = null;
//         //     }
//         // }, [writePrompt]);

//         const executeCommand = useCallback(
//             (command: string) => {
//                 if (!term.current) return;
//                 console.log("Socket", socket);
//                 console.log("Socket readyState", socket?.current?.readyState);
//                 if (!socket.current || socket.current.readyState !== WebSocket.OPEN) {
//                     term.current.writeln("\r\n⚠️ Not connected to container.");
//                     writePrompt();
//                     return;
//                 }

//                 if (command.trim()) {
//                     commandHistory.current.push(command);
//                 }

//                 console.log("Executing command:", command);

//                 socket.current.send(command + "\n");
//                 writePrompt();
//             },
//             [socket, writePrompt]
//         );

//         const handleTerminalInput = useCallback((data: string) => {
//             if (!term.current) return;

//             // Handle special characters
//             switch (data) {
//                 case '\r': // Enter
//                     executeCommand(currentLine.current);
//                     break;

//                 case '\u007F': // Backspace
//                     if (cursorPosition.current > 0) {
//                         currentLine.current =
//                             currentLine.current.slice(0, cursorPosition.current - 1) +
//                             currentLine.current.slice(cursorPosition.current);
//                         cursorPosition.current--;

//                         // Update terminal display
//                         term.current.write('\b \b');
//                     }
//                     break;

//                 case '\u0003': // Ctrl+C
//                     if (currentProcess.current) {
//                         currentProcess.current.kill();
//                         currentProcess.current = null;
//                     }
//                     term.current.writeln("^C");
//                     writePrompt();
//                     break;

//                 case '\u001b[A': // Up arrow
//                     if (commandHistory.current.length > 0) {
//                         if (historyIndex.current === -1) {
//                             historyIndex.current = commandHistory.current.length - 1;
//                         } else if (historyIndex.current > 0) {
//                             historyIndex.current--;
//                         }

//                         // Clear current line and write history command
//                         const historyCommand = commandHistory.current[historyIndex.current];
//                         term.current.write('\r$ ' + ' '.repeat(currentLine.current.length) + '\r$ ');
//                         term.current.write(historyCommand);
//                         currentLine.current = historyCommand;
//                         cursorPosition.current = historyCommand.length;
//                     }
//                     break;

//                 case '\u001b[B': // Down arrow
//                     if (historyIndex.current !== -1) {
//                         if (historyIndex.current < commandHistory.current.length - 1) {
//                             historyIndex.current++;
//                             const historyCommand = commandHistory.current[historyIndex.current];
//                             term.current.write('\r$ ' + ' '.repeat(currentLine.current.length) + '\r$ ');
//                             term.current.write(historyCommand);
//                             currentLine.current = historyCommand;
//                             cursorPosition.current = historyCommand.length;
//                         } else {
//                             historyIndex.current = -1;
//                             term.current.write('\r$ ' + ' '.repeat(currentLine.current.length) + '\r$ ');
//                             currentLine.current = "";
//                             cursorPosition.current = 0;
//                         }
//                     }
//                     break;

//                 default:
//                     // Regular character input
//                     if (data >= ' ' || data === '\t') {
//                         currentLine.current =
//                             currentLine.current.slice(0, cursorPosition.current) +
//                             data +
//                             currentLine.current.slice(cursorPosition.current);
//                         cursorPosition.current++;
//                         term.current.write(data);
//                     }
//                     break;
//             }
//         }, [executeCommand, writePrompt]);

//         const initializeTerminal = useCallback(() => {
//             if (!terminalRef.current || term.current) return;

//             const terminal = new Terminal({
//                 cursorBlink: true,
//                 fontFamily: '"Fira Code", "JetBrains Mono", "Consolas", monospace',
//                 fontSize: 14,
//                 lineHeight: 1.2,
//                 letterSpacing: 0,
//                 theme: terminalThemes[theme],
//                 allowTransparency: false,
//                 convertEol: true,
//                 scrollback: 1000,
//                 tabStopWidth: 4,
//             });

//             // Add addons
//             const fitAddonInstance = new FitAddon();
//             const webLinksAddon = new WebLinksAddon();
//             const searchAddonInstance = new SearchAddon();

//             terminal.loadAddon(fitAddonInstance);
//             terminal.loadAddon(webLinksAddon);
//             terminal.loadAddon(searchAddonInstance);

//             terminal.open(terminalRef.current);

//             fitAddon.current = fitAddonInstance;
//             searchAddon.current = searchAddonInstance;
//             term.current = terminal;

//             // Handle terminal input
//             terminal.onData(handleTerminalInput);

//             // Initial fit
//             setTimeout(() => {
//                 fitAddonInstance.fit();
//             }, 100);

//             // Welcome message
//             terminal.writeln("🚀 WebContainer Terminal");
//             terminal.writeln("Type 'help' for available commands");
//             writePrompt();

//             return terminal;
//         }, [theme, handleTerminalInput, writePrompt]);

//         const connectSocket = useCallback(() => {
//             try {
//                 if (!socketUrl) {
//                     console.error("❌ Socket URL missing — cannot connect.");
//                     term.current?.writeln("\r\n❌ Socket URL not provided.");
//                     return;
//                 }

//                 const protocol = window.location.protocol === "https:" ? "wss" : "ws";
//                 const wsUrl = `${protocol}://localhost:8080${socketUrl}`; // Fixed the syntax error
//                 console.log(`🌐 Attempting WebSocket connection to → ${wsUrl}`);

//                 const ws = new WebSocket(wsUrl);

//                 ws.onopen = () => {
//                     console.log("✅ WebSocket connection established successfully!");
//                     term.current?.writeln("\r\n🐳 Connected to container terminal.");
//                     socket.current = ws;
//                     setIsConnected(true);
//                     writePrompt();
//                 };

//                 ws.onmessage = (event) => {
//                     console.log("📥 Message from container:", event.data);
//                     term.current?.write(event.data);
//                 };

//                 ws.onerror = (err) => {
//                     console.error("💥 WebSocket encountered an error:", err);
//                     term.current?.writeln("\r\n⚠️ WebSocket error occurred. Check console for details.");
//                 };

//                 ws.onclose = (event) => {
//                     console.warn(`🔴 WebSocket closed (code: ${event.code}, reason: ${event.reason || "no reason"})`);
//                     term.current?.writeln("\r\n🔴 Disconnected from container.");
//                     setIsConnected(false);
//                     // setSocket(null);
//                     socket.current = null;
//                 };
//             } catch (error: any) {
//                 console.error("🔥 Failed to establish WebSocket connection:", error);
//                 term.current?.writeln(`\r\n❌ Error: Could not connect to container.\nReason: ${error.message}`);
//             }
//         }, [socketUrl, writePrompt]);


//         const clearTerminal = useCallback(() => {
//             if (term.current) {
//                 term.current.clear();
//                 term.current.writeln("🚀 WebContainer Terminal");
//                 writePrompt();
//             }
//         }, [writePrompt]);

//         const copyTerminalContent = useCallback(async () => {
//             if (term.current) {
//                 const content = term.current.getSelection();
//                 if (content) {
//                     try {
//                         await navigator.clipboard.writeText(content);
//                     } catch (error) {
//                         console.error("Failed to copy to clipboard:", error);
//                     }
//                 }
//             }
//         }, []);

//         const downloadTerminalLog = useCallback(() => {
//             if (term.current) {
//                 const buffer = term.current.buffer.active;
//                 let content = "";

//                 for (let i = 0; i < buffer.length; i++) {
//                     const line = buffer.getLine(i);
//                     if (line) {
//                         content += line.translateToString(true) + "\n";
//                     }
//                 }

//                 const blob = new Blob([content], { type: "text/plain" });
//                 const url = URL.createObjectURL(blob);
//                 const a = document.createElement("a");
//                 a.href = url;
//                 a.download = `terminal-log-${new Date().toISOString().slice(0, 19)}.txt`;
//                 a.click();
//                 URL.revokeObjectURL(url);
//             }
//         }, []);

//         const searchInTerminal = useCallback((term: string) => {
//             if (searchAddon.current && term) {
//                 searchAddon.current.findNext(term);
//             }
//         }, []);

//         useEffect(() => {
//             const termInstance = initializeTerminal();

//             if (!socketUrl) {
//                 termInstance?.writeln("\r\n❌ No socket URL provided.");
//                 return;
//             }

//             // create socket once per socketUrl
//             const protocol = window.location.protocol === "https:" ? "wss" : "ws";
//             const wsUrl = `${protocol}://localhost:8080${socketUrl}`;

//             console.log(`🌐 Connecting to ${wsUrl}`);
//             const ws = new WebSocket(wsUrl);
//             // setSocket(ws);
//             socket.current = ws;
//             console.log(ws)
//             ws.onopen = () => {
//                 console.log("✅ Connected to WebSocket");
//                 termInstance?.writeln("\r\n🐳 Connected to container terminal.");
//                 setIsConnected(true);
//                 writePrompt();
//             };

//             ws.onmessage = (event) => {
//                 termInstance?.write(event.data);
//             };

//             ws.onerror = (err) => {
//                 console.error("💥 WebSocket error:", err);
//                 termInstance?.writeln("\r\n⚠️ WebSocket error.");
//             };

//             ws.onclose = (event) => {
//                 console.warn(`🔴 WebSocket closed: ${event.code}`);
//                 termInstance?.writeln("\r\n🔴 Disconnected from container.");
//                 setIsConnected(false);
//             };

//             // cleanup
//             return () => {
//                 console.log("🧹 Closing WebSocket...");
//                 ws.close();
//                 termInstance?.dispose();
//                 if (fitAddon.current) fitAddon.current = null;
//                 if (searchAddon.current) searchAddon.current = null;
//                 if (term.current) term.current = null;
//             };
//         }, [socketUrl]); // ✅ only runs when socketUrl changes



//         return (
//             <div className={cn("flex flex-col h-full bg-background border rounded-lg overflow-hidden", className)}>
//                 {/* Terminal Header */}
//                 <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/50">
//                     <div className="flex items-center gap-2">
//                         <div className="flex gap-1">
//                             <div className="w-3 h-3 rounded-full bg-red-500"></div>
//                             <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
//                             <div className="w-3 h-3 rounded-full bg-green-500"></div>
//                         </div>
//                         <span className="text-sm font-medium">WebContainer Terminal</span>
//                         {isConnected && (
//                             <div className="flex items-center gap-1">
//                                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
//                                 <span className="text-xs text-muted-foreground">Connected</span>
//                             </div>
//                         )}
//                     </div>

//                     <div className="flex items-center gap-1">
//                         {showSearch && (
//                             <div className="flex items-center gap-2">
//                                 <Input
//                                     placeholder="Search..."
//                                     value={searchTerm}
//                                     onChange={(e) => {
//                                         setSearchTerm(e.target.value);
//                                         searchInTerminal(e.target.value);
//                                     }}
//                                     className="h-6 w-32 text-xs"
//                                 />
//                             </div>
//                         )}

//                         <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => setShowSearch(!showSearch)}
//                             className="h-6 w-6 p-0"
//                         >
//                             <Search className="h-3 w-3" />
//                         </Button>

//                         <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={copyTerminalContent}
//                             className="h-6 w-6 p-0"
//                         >
//                             <Copy className="h-3 w-3" />
//                         </Button>

//                         <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={downloadTerminalLog}
//                             className="h-6 w-6 p-0"
//                         >
//                             <Download className="h-3 w-3" />
//                         </Button>

//                         <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={clearTerminal}
//                             className="h-6 w-6 p-0"
//                         >
//                             <Trash2 className="h-3 w-3" />
//                         </Button>
//                     </div>
//                 </div>

//                 {/* Terminal Content */}
//                 <div className="flex-1 relative">
//                     <div
//                         ref={terminalRef}
//                         className="absolute inset-0 p-2"
//                         style={{
//                             background: terminalThemes[theme].background,
//                         }}
//                     />
//                 </div>
//             </div>
//         );
//     });

// TerminalComponentForGeneralLanguage.displayName = "TerminalComponent";

// export default TerminalComponentForGeneralLanguage;



//New

"use client";

import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Copy, Trash2, Download, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useXtermTerminal } from "../hooks/useXtermTerminal";
import { useContainerSocket } from "../hooks/useContainerSocket";
import { workingDirectoryGenerator } from "@/lib/workingDirectoryGenerator";

interface TerminalProps {
  className?: string;
  theme?: "dark" | "light";
  compileCode: any;
  socketUrl: string;
  containerId: string;
  playgroundId: string
}

export interface TerminalRef {
  writeToTerminal: (data: string) => void;
  clearTerminal: () => void;
  focusTerminal: () => void;
}

const TerminalComponentForGeneralLanguage = forwardRef<TerminalRef, TerminalProps>(
  ({ className, theme = "dark", socketUrl, playgroundId }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { term, fitAddon, searchAddon } = useXtermTerminal(theme);
    const socket = useContainerSocket(socketUrl, term);

    const [isConnected, setIsConnected] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showSearch, setShowSearch] = useState(false);

    // Expose terminal controls to parent
    useImperativeHandle(ref, () => ({
      writeToTerminal: (data: string) => term.current?.write(data),
      clearTerminal: () => {
        term.current?.clear();
        term.current?.writeln("🚀 WebContainer Terminal\r\n");
      },
      focusTerminal: () => term.current?.focus(),
    }));

    // Handle copy, download, clear, and search
    const copyTerminalContent = useCallback(async () => {
      const content = term.current?.getSelection();
      if (content) await navigator.clipboard.writeText(content);
    }, []);

    const downloadTerminalLog = useCallback(() => {
      const buffer = term.current?.buffer.active;
      if (!buffer) return;
      let content = "";
      for (let i = 0; i < buffer.length; i++) {
        const line = buffer.getLine(i);
        if (line) content += line.translateToString(true) + "\n";
      }
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `terminal-log-${new Date().toISOString().slice(0, 19)}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }, []);

    const searchInTerminal = useCallback(
      (query: string) => {
        if (searchAddon.current && query) searchAddon.current.findNext(query);
      },
      [searchAddon]
    );

    // Initialize terminal
    useEffect(() => {
      if (!containerRef.current || !term.current) return;
      term.current.open(containerRef.current);
      fitAddon.current?.fit();

      // Send every keystroke live to container
      term.current.onData((data) => {
        if (socket.current && socket.current.readyState === WebSocket.OPEN) {
          socket.current.send(data); // ✅ includes TAB, arrows, etc.
        }
      });

      socket.current?.addEventListener("open", () => setIsConnected(true));
      socket.current?.addEventListener("close", () => setIsConnected(false));



      return () => {
        term.current?.dispose();
      };
    }, [socketUrl]);

    useEffect(() => {
      if (socket.current === null) return
      // socket.current.send(`hello`)

      if (socket.current.readyState !== 1) return

      socket.current.send(`cd ${workingDirectoryGenerator({ projectId: playgroundId })}\r\n`)
    }, [socket.current])


    useEffect(() => {

      if(!term.current) return

      if (socket.current === null) return
      // socket.current.send(`hello`)

      if (socket.current.readyState !== 1) return
      //Terminal size sync


      fitAddon?.current?.fit()
      
      socket.current?.send(JSON.stringify({
        type: "resize",
        cols: term.current.cols,
        rows: term.current.rows
      }))
    }, [term, socket.current])

    useEffect(() => {
      if (!containerRef.current || !term.current) return;

      const resizeObserver = new ResizeObserver(() => {
        if (!term.current || !fitAddon.current) return;

        fitAddon.current.fit();

        console.log(term.current.cols)

        if (socket.current && socket.current.readyState === WebSocket.OPEN) {

          // socket.current.send("\x0c")
          socket.current.send(
            JSON.stringify({
              type: "resize",
              cols: term.current.cols,
              rows: term.current.rows,
            })
          );
        }
      });

      resizeObserver.observe(containerRef.current);

      return () => resizeObserver.disconnect();
    }, []);


    const terminalBackground = theme === "dark" ? "#09090B" : "#FFFFFF";

    return (
      <div className={cn("flex flex-col h-full border rounded-lg overflow-hidden", className)}>
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/50">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-sm font-medium">WebContainer Terminal</span>
            {isConnected && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs text-muted-foreground">Connected</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {showSearch && (
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    searchInTerminal(e.target.value);
                  }}
                  className="h-6 w-32 text-xs"
                />
              </div>
            )}

            <Button variant="ghost" size="sm" onClick={() => setShowSearch(!showSearch)} className="h-6 w-6 p-0">
              <Search className="h-3 w-3" />
            </Button>

            <Button variant="ghost" size="sm" onClick={copyTerminalContent} className="h-6 w-6 p-0">
              <Copy className="h-3 w-3" />
            </Button>

            <Button variant="ghost" size="sm" onClick={downloadTerminalLog} className="h-6 w-6 p-0">
              <Download className="h-3 w-3" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                term.current?.clear();
                term.current?.writeln("🚀 WebContainer Terminal\r\n");
              }}
              className="h-6 w-6 p-0"
            >
              <Trash2 className="h-3 w-3" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => socket.current?.close()}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>

          </div>
        </div>

        {/* Terminal */}
        <div className="flex-1 relative">
          <div
            ref={containerRef}
            className="absolute inset-0 p-2"
            style={{
              background: terminalBackground,
            }}
          />
        </div>
      </div>
    );
  }
);

TerminalComponentForGeneralLanguage.displayName = "TerminalComponentForGeneralLanguage";
export default TerminalComponentForGeneralLanguage;
