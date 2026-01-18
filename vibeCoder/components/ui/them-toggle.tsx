"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

 /* eslint-disable react-hooks/set-state-in-effect */
useEffect(() => {
  setMounted(true);
}, []);
/* eslint-enable react-hooks/set-state-in-effect */


  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute(
      "data-theme",
      theme === "light" ? "light" : "dark"
    );
  }, [theme, mounted]);

  if (!mounted) return null;

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  return (
    <div className="cursor-pointer" onClick={toggleTheme}>
      {theme === "light" ? (
        <Moon className="h-5 w-5 text-black" />
      ) : (
        <Sun className="h-5 w-5 text-white" />
      )}
    </div>
  );
}
