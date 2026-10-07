"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./theme-provider";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "Light" : "Dark"} theme`}
      title={`Current: ${isDark ? "Dark Cyber" : "Day Light"} Mode. Click to switch.`}
      className={`group relative inline-flex items-center justify-center gap-2 rounded-lg border transition-all cursor-pointer select-none min-h-[36px] min-w-[36px] sm:min-w-[40px] sm:min-h-[40px] px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#FF2A85] active:scale-95 ${
        isDark
          ? "bg-[#121622] hover:bg-[#1a2030] text-slate-200 border-white/[0.08] hover:border-[#FF2A85]/50 hover:shadow-[0_0_12px_rgba(255,42,133,0.3)]"
          : "bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-sm hover:border-[#FF2A85]/60 hover:shadow-[0_0_12px_rgba(255,42,133,0.25)]"
      } ${className}`}
    >
      <div className="relative size-4 sm:size-4.5 flex items-center justify-center overflow-hidden">
        {/* Sun Icon (Rotates and scales when transitioning) */}
        <Sun
          className={`size-4 sm:size-4.5 text-[#FFAB00] transition-all duration-300 absolute ${
            isDark
              ? "rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100 drop-shadow-[0_0_4px_rgba(255,171,0,0.6)]"
          }`}
        />
        {/* Moon Icon */}
        <Moon
          className={`size-4 sm:size-4.5 text-[#00F0FF] transition-all duration-300 absolute ${
            isDark
              ? "rotate-0 scale-100 opacity-100 drop-shadow-[0_0_4px_rgba(0,240,255,0.6)]"
              : "-rotate-90 scale-0 opacity-0"
          }`}
        />
      </div>

      {showLabel && (
        <span className="text-xs font-mono font-semibold">
          {isDark ? "Dark" : "Light"}
        </span>
      )}
    </button>
  );
}
