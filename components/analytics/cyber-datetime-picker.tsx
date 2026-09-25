"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  RotateCcw,
  X,
  Check,
  CalendarRange,
} from "lucide-react";

export interface DateTimeRange {
  startDate: string; // "YYYY-MM-DD"
  startTime: string; // "HH:mm"
  endDate: string; // "YYYY-MM-DD"
  endTime: string; // "HH:mm"
}

export type PresetRangeKey = "today" | "7d" | "30d" | "ytd" | "custom";

export interface CyberDatetimePickerProps {
  value: DateTimeRange;
  onChange: (range: DateTimeRange) => void;
  activePreset?: PresetRangeKey;
  onPresetChange?: (preset: PresetRangeKey) => void;
  accentColor?: string; // Hex color (e.g. #FF2A85, #FFD600, #00F0FF, #FF6B00, #9D4EDD)
  buttonLabel?: string;
  className?: string;
  align?: "left" | "right";
  compact?: boolean;
}

// Format Date object to "YYYY-MM-DD"
export function toDateString(d: Date): string {
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Format Date object to "HH:mm"
export function toTimeString(d: Date): string {
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

// Helper to generate default 7d or 30d range
export function getDefaultDateTimeRange(daysBack: number = 7): DateTimeRange {
  const now = new Date();
  const past = new Date();
  past.setDate(past.getDate() - daysBack);
  past.setHours(0, 0, 0, 0);

  return {
    startDate: toDateString(past),
    startTime: "00:00",
    endDate: toDateString(now),
    endTime: toTimeString(now),
  };
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function CyberDatetimePicker({
  value,
  onChange,
  activePreset = "custom",
  onPresetChange,
  accentColor = "#FF2A85",
  buttonLabel,
  className = "",
  align = "right",
  compact = false,
}: CyberDatetimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Temporary staging range while dialog is open
  const [tempRange, setTempRange] = useState<DateTimeRange>(value);

  // Calendar month state
  const initialCalendarDate = useMemo(() => {
    if (value.startDate) {
      const parsed = new Date(`${value.startDate}T12:00:00`);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  }, [value.startDate]);

  const [calendarYear, setCalendarYear] = useState<number>(
    initialCalendarDate.getFullYear()
  );
  const [calendarMonth, setCalendarMonth] = useState<number>(
    initialCalendarDate.getMonth()
  );

  // Open/Close toggle handler that initializes tempRange from current value
  const handleToggle = () => {
    if (!isOpen) {
      setTempRange(value);
      if (value.startDate) {
        const parsed = new Date(`${value.startDate}T12:00:00`);
        if (!isNaN(parsed.getTime())) {
          setCalendarYear(parsed.getFullYear());
          setCalendarMonth(parsed.getMonth());
        }
      }
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  // Click outside and escape key handling
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Calendar calculations
  const daysInMonth = useMemo(() => {
    return new Date(calendarYear, calendarMonth + 1, 0).getDate();
  }, [calendarYear, calendarMonth]);

  const firstDayOfWeek = useMemo(() => {
    return new Date(calendarYear, calendarMonth, 1).getDay();
  }, [calendarYear, calendarMonth]);

  // Quick preset chips handlers
  const handleSelectPreset = (preset: "today" | "yesterday" | "7d" | "30d" | "ytd") => {
    const now = new Date();
    const todayStr = toDateString(now);
    const nowTimeStr = toTimeString(now);

    let start = todayStr;
    let startTime = "00:00";
    let end = todayStr;
    let endTime = "23:59";

    if (preset === "today") {
      start = todayStr;
      startTime = "00:00";
      end = todayStr;
      endTime = nowTimeStr;
    } else if (preset === "yesterday") {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const yStr = toDateString(y);
      start = yStr;
      startTime = "00:00";
      end = yStr;
      endTime = "23:59";
    } else if (preset === "7d") {
      const d7 = new Date();
      d7.setDate(d7.getDate() - 7);
      start = toDateString(d7);
      startTime = "00:00";
      end = todayStr;
      endTime = nowTimeStr;
    } else if (preset === "30d") {
      const d30 = new Date();
      d30.setDate(d30.getDate() - 30);
      start = toDateString(d30);
      startTime = "00:00";
      end = todayStr;
      endTime = nowTimeStr;
    } else if (preset === "ytd") {
      start = `${now.getFullYear()}-01-01`;
      startTime = "00:00";
      end = todayStr;
      endTime = nowTimeStr;
    }

    const newRange: DateTimeRange = {
      startDate: start,
      startTime,
      endDate: end,
      endTime,
    };

    setTempRange(newRange);
    const startDateObj = new Date(`${start}T12:00:00`);
    if (!isNaN(startDateObj.getTime())) {
      setCalendarYear(startDateObj.getFullYear());
      setCalendarMonth(startDateObj.getMonth());
    }
  };

  // Calendar Day Click Logic
  const handleDayClick = (day: number) => {
    const clickedDateStr = `${calendarYear}-${(calendarMonth + 1)
      .toString()
      .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

    if (!tempRange.startDate || (tempRange.startDate && tempRange.endDate)) {
      // First click: start new range
      setTempRange({
        ...tempRange,
        startDate: clickedDateStr,
        endDate: "",
      });
    } else {
      // Second click: determine order
      if (clickedDateStr < tempRange.startDate) {
        setTempRange({
          ...tempRange,
          startDate: clickedDateStr,
          endDate: tempRange.startDate,
        });
      } else {
        setTempRange({
          ...tempRange,
          endDate: clickedDateStr,
        });
      }
    }
  };

  // Month navigation
  const prevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarYear(calendarYear - 1);
      setCalendarMonth(11);
    } else {
      setCalendarMonth(calendarMonth - 1);
    }
  };

  const nextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarYear(calendarYear + 1);
      setCalendarMonth(0);
    } else {
      setCalendarMonth(calendarMonth + 1);
    }
  };

  // Validation
  const isValidRange = useMemo(() => {
    if (!tempRange.startDate || !tempRange.endDate) return false;
    const start = new Date(`${tempRange.startDate}T${tempRange.startTime || "00:00"}`);
    const end = new Date(`${tempRange.endDate}T${tempRange.endTime || "23:59"}`);
    return !isNaN(start.getTime()) && !isNaN(end.getTime()) && start <= end;
  }, [tempRange]);

  // Apply Action
  const handleApply = () => {
    if (!isValidRange) return;
    onChange(tempRange);
    if (onPresetChange) {
      onPresetChange("custom");
    }
    setIsOpen(false);
  };

  // Format button display label
  const formattedButtonLabel = useMemo(() => {
    if (buttonLabel) return buttonLabel;
    if (activePreset === "custom" && value.startDate && value.endDate) {
      try {
        const start = new Date(`${value.startDate}T${value.startTime || "00:00"}`);
        const end = new Date(`${value.endDate}T${value.endTime || "23:59"}`);
        const startFmt = start.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        const endFmt = end.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        return `${startFmt}, ${value.startTime || "00:00"} → ${endFmt}, ${
          value.endTime || "23:59"
        }`;
      } catch {
        return "Custom Range";
      }
    }
    return "Custom Range";
  }, [buttonLabel, activePreset, value]);

  const isCustomActive = activePreset === "custom";

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-xs transition-all min-h-[36px] ${
          isCustomActive
            ? "bg-[#121622] text-white border shadow-[0_0_12px_rgba(255,42,133,0.3)] font-bold"
            : "bg-[#121622] text-slate-400 hover:text-white border border-white/[0.08] hover:bg-[#1a2030]"
        }`}
        style={{
          borderColor: isCustomActive ? accentColor : undefined,
        }}
        title="Select custom date and time range"
      >
        <CalendarIcon
          className="size-3.5 transition-colors"
          style={{ color: isCustomActive ? accentColor : "#94A3B8" }}
        />
        <span className={compact ? "hidden sm:inline" : ""}>
          {formattedButtonLabel}
        </span>
        {isCustomActive && (
          <span
            className="size-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: accentColor }}
          />
        )}
      </button>

      {/* Popover / Mobile Sheet */}
      {isOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm sm:absolute sm:inset-auto sm:top-full sm:mt-2 sm:p-0 sm:bg-transparent sm:backdrop-blur-none ${
            align === "right" ? "sm:right-0" : "sm:left-0"
          }`}
        >
          <div
            className="w-full sm:w-[420px] max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-xl bg-[#0B0D13] border border-white/[0.12] shadow-[0_0_35px_rgba(0,0,0,0.85)] p-4 sm:p-5 space-y-4 font-mono text-xs animate-in fade-in slide-in-from-bottom-3 duration-200"
            style={{
              boxShadow: `0 0 25px ${accentColor}20, 0 10px 40px rgba(0,0,0,0.9)`,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <CalendarRange
                  className="size-4"
                  style={{ color: accentColor }}
                />
                <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                  Custom DateTime Window
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleSelectPreset("7d")}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                  title="Reset to Last 7 Days"
                >
                  <RotateCcw className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Quick Preset Chips */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase text-slate-500 font-semibold">
                Quick Intervals
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "Today", key: "today" as const },
                  { label: "Yesterday", key: "yesterday" as const },
                  { label: "Last 7D", key: "7d" as const },
                  { label: "Last 30D (1M)", key: "30d" as const },
                  { label: "YTD", key: "ytd" as const },
                ].map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={() => handleSelectPreset(chip.key)}
                    className="px-2.5 py-1 rounded bg-[#121622] hover:bg-[#1a2030] text-slate-300 hover:text-white border border-white/[0.06] text-[11px] transition-colors"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dual From/To Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg bg-[#121622]/60 border border-white/[0.06]">
              {/* Start Window */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold">
                  <span className="size-1.5 rounded-full bg-[#00E676]" />
                  <span>From (Start)</span>
                </div>
                <input
                  type="date"
                  value={tempRange.startDate}
                  onChange={(e) =>
                    setTempRange({ ...tempRange, startDate: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 rounded bg-[#0B0D13] border border-white/[0.1] text-white text-xs focus:outline-none focus:border-[#FF2A85] font-mono [color-scheme:dark]"
                />
                <div className="flex items-center gap-1.5">
                  <Clock className="size-3 text-slate-500" />
                  <input
                    type="time"
                    value={tempRange.startTime}
                    onChange={(e) =>
                      setTempRange({ ...tempRange, startTime: e.target.value })
                    }
                    className="w-full px-2 py-1 rounded bg-[#0B0D13] border border-white/[0.1] text-slate-200 text-xs focus:outline-none focus:border-[#FF2A85] font-mono [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* End Window */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold">
                  <span
                    className="size-1.5 rounded-full"
                    style={{ backgroundColor: accentColor }}
                  />
                  <span>To (End)</span>
                </div>
                <input
                  type="date"
                  value={tempRange.endDate}
                  onChange={(e) =>
                    setTempRange({ ...tempRange, endDate: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 rounded bg-[#0B0D13] border border-white/[0.1] text-white text-xs focus:outline-none focus:border-[#FF2A85] font-mono [color-scheme:dark]"
                />
                <div className="flex items-center gap-1.5">
                  <Clock className="size-3 text-slate-500" />
                  <input
                    type="time"
                    value={tempRange.endTime}
                    onChange={(e) =>
                      setTempRange({ ...tempRange, endTime: e.target.value })
                    }
                    className="w-full px-2 py-1 rounded bg-[#0B0D13] border border-white/[0.1] text-slate-200 text-xs focus:outline-none focus:border-[#FF2A85] font-mono [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>

            {/* Interactive Mini Calendar */}
            <div className="p-3 rounded-lg bg-[#121622]/40 border border-white/[0.04] space-y-2">
              {/* Calendar Month Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">
                  {MONTH_NAMES[calendarMonth]} {calendarYear}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={prevMonth}
                    className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={nextMonth}
                    className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>

              {/* Day-of-week header */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-500 font-bold">
                {WEEK_DAYS.map((d) => (
                  <div key={d} className="py-0.5">
                    {d}
                  </div>
                ))}
              </div>

              {/* Day cells grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells before first day */}
                {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="size-8" />
                ))}

                {/* Month days */}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const day = idx + 1;
                  const dateStr = `${calendarYear}-${(calendarMonth + 1)
                    .toString()
                    .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

                  const isStart = tempRange.startDate === dateStr;
                  const isEnd = tempRange.endDate === dateStr;
                  const isInRange =
                    tempRange.startDate &&
                    tempRange.endDate &&
                    dateStr > tempRange.startDate &&
                    dateStr < tempRange.endDate;

                  const isToday = toDateString(new Date()) === dateStr;

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayClick(day)}
                      className={`size-8 sm:size-7 text-[11px] font-mono rounded flex items-center justify-center transition-all ${
                        isStart || isEnd
                          ? "text-white font-bold shadow-md"
                          : isInRange
                          ? "bg-white/10 text-slate-200"
                          : isToday
                          ? "border border-white/30 text-white font-semibold hover:bg-white/10"
                          : "text-slate-400 hover:text-white hover:bg-white/10"
                      }`}
                      style={{
                        backgroundColor:
                          isStart || isEnd ? accentColor : undefined,
                      }}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Validation Feedback */}
            {!isValidRange && tempRange.startDate && tempRange.endDate && (
              <div className="text-[11px] text-[#FF1744] font-medium flex items-center gap-1.5">
                <span>⚠️ End Date/Time must be after Start Date/Time.</span>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-white/[0.08] gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 rounded-lg bg-[#121622] hover:bg-[#1a2030] text-slate-400 hover:text-white border border-white/[0.06] transition-colors min-h-[44px] sm:min-h-[36px]"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!isValidRange}
                onClick={handleApply}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-white font-bold transition-all min-h-[44px] sm:min-h-[36px] ${
                  isValidRange
                    ? "opacity-100 cursor-pointer shadow-[0_0_12px_rgba(255,42,133,0.35)]"
                    : "opacity-40 cursor-not-allowed"
                }`}
                style={{
                  backgroundColor: accentColor,
                }}
              >
                <Check className="size-3.5" />
                <span>Apply Range</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
