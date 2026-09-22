import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-lg font-bold tracking-wider transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2A85] disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none";

    const variantStyles = {
      primary:
        "bg-[#FF2A85] hover:bg-[#ff1475] text-white uppercase shadow-[0_0_15px_rgba(255,42,133,0.4)] hover:shadow-[0_0_22px_rgba(255,42,133,0.6)] border border-[#FF2A85]/60",
      secondary:
        "bg-[#121622] hover:bg-[#1a2030] text-slate-200 hover:text-white border border-white/[0.08] hover:border-white/[0.2] font-semibold",
      destructive:
        "bg-[#FF1744]/10 hover:bg-[#FF1744]/20 text-[#FF1744] border border-[#FF1744]/30 hover:border-[#FF1744] uppercase shadow-[0_0_12px_rgba(255,23,68,0.25)]",
      outline:
        "border border-[#FF2A85]/40 hover:border-[#FF2A85] text-[#FF2A85] hover:bg-[#FF2A85]/10 uppercase",
      ghost:
        "text-slate-400 hover:text-white hover:bg-white/[0.06] font-medium",
    };

    const sizeStyles = {
      sm: "min-h-[36px] px-3 py-1.5 text-xs gap-1.5",
      md: "min-h-[44px] sm:min-h-[40px] px-4 py-2 text-xs uppercase gap-2",
      lg: "min-h-[48px] px-6 py-2.5 text-sm uppercase gap-2.5",
      icon: "size-10 sm:size-9 p-0 flex items-center justify-center",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
