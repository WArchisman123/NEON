"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

export interface SwatchProps {
  name: string;
  hex: string;
  tailwind: string;
  role: string;
  textColor?: string;
  border?: string;
  glowClass?: string;
}

export function SwatchCard({
  name,
  hex,
  tailwind,
  role,
  textColor = "text-white",
  border,
  glowClass,
}: SwatchProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] hover:border-[#FF2A85]/40 transition-all p-4 flex flex-col justify-between group relative overflow-hidden">
      <div>
        {/* Swatch Preview Block */}
        <div
          className={`h-20 w-full rounded-lg mb-3 flex items-center justify-center font-mono text-xs font-bold transition-all relative overflow-hidden ${border || "border border-white/[0.1]"} ${glowClass || ""}`}
          style={{ backgroundColor: hex }}
        >
          <span
            className={`px-2 py-1 rounded bg-black/40 backdrop-blur-sm ${textColor} text-[11px] font-mono tracking-wider`}
          >
            {hex}
          </span>
        </div>

        {/* Details */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-bold text-white group-hover:text-[#FF2A85] transition-colors">
            {name}
          </h4>
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 rounded bg-[#121622] text-slate-400 hover:text-white border border-white/[0.08] hover:border-[#FF2A85]/40 transition-all"
            title="Copy Hex Code"
          >
            {copied ? (
              <Check className="size-3 text-[#00E676]" />
            ) : (
              <Copy className="size-3" />
            )}
          </button>
        </div>

        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
          {role}
        </p>
      </div>

      <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-slate-500">
        <span>Tailwind</span>
        <code className="text-[#FF2A85] bg-[#121622] px-1.5 py-0.5 rounded border border-white/[0.04]">
          {tailwind}
        </code>
      </div>
    </div>
  );
}
