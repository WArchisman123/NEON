import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, ...props }, ref) => {
    if (icon) {
      return (
        <div className="relative flex items-center w-full">
          <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-500">
            {icon}
          </div>
          <input
            type={type}
            className={cn(
              "w-full bg-[#0B0D13] border border-white/[0.1] hover:border-white/[0.18] focus:border-[#FF2A85] focus:ring-1 focus:ring-[#FF2A85] rounded-lg pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono transition-all outline-none min-h-[44px] sm:min-h-[40px]",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
      );
    }

    return (
      <input
        type={type}
        className={cn(
          "w-full bg-[#0B0D13] border border-white/[0.1] hover:border-white/[0.18] focus:border-[#FF2A85] focus:ring-1 focus:ring-[#FF2A85] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono transition-all outline-none min-h-[44px] sm:min-h-[40px]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
