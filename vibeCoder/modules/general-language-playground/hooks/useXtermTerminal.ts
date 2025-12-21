import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { WebLinksAddon } from "xterm-addon-web-links";
import { SearchAddon } from "xterm-addon-search";
import "xterm/css/xterm.css";

export function useXtermTerminal(theme: "dark" | "light") {
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const searchAddonRef = useRef<SearchAddon | null>(null);

  useEffect(() => {
    const term = new Terminal({
      cursorBlink: true,
      convertEol: true,
      fontFamily: '"Fira Code", monospace',
      fontSize: 14,
      theme:
        theme === "dark"
          ? { background: "#09090B", foreground: "#FAFAFA", cursor: "#FAFAFA" }
          : { background: "#FFFFFF", foreground: "#18181B", cursor: "#18181B" },
      scrollback: 1000,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();
    const searchAddon = new SearchAddon();

    // Load add-ons
    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);
    term.loadAddon(searchAddon);

    terminalRef.current = term;
    fitAddonRef.current = fitAddon;
    searchAddonRef.current = searchAddon;

    return () => {
      term.dispose();
      fitAddon.dispose();
      searchAddon.dispose();
    };
  }, [theme]);

  return { term: terminalRef, fitAddon: fitAddonRef, searchAddon: searchAddonRef };
}
