"use client";

import React, { useState, useMemo } from "react";
import {
  Layers,
  AlertTriangle,
  Download,
  Calendar,
  Maximize2,
  Minimize2,
  Zap,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
} from "lucide-react";

interface StringHeatmapProps {
  inverterCount?: number;
  nominalCurrent?: number; // e.g., 2.0 A
}

export function StringCurrentHeatmapMatrix({
  inverterCount = 2,
  nominalCurrent = 2.0,
}: StringHeatmapProps) {
  const [selectedInv, setSelectedInv] = useState("INV-01");
  const [selectedDate, setSelectedDate] = useState("2026-10-07");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredCell, setHoveredCell] = useState<{
    stringNum: number | "AVG";
    timeSlot: string;
    current: number;
  } | null>(null);

  // Time slots for daytime 5-minute telemetry intervals (06:00 to 07:45 morning ramp)
  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    const baseHour = 6;
    for (let m = 0; m <= 100; m += 5) {
      const h = baseHour + Math.floor(m / 60);
      const min = m % 60;
      slots.push(`${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`);
    }
    return slots;
  }, []);

  // Generate realistic 24-string data matching competitor ref_img_5
  // Note: Strings 1-6 and 15-20 are offline (0.00 A) to demonstrate fuse/combiner fault detection
  const stringData = useMemo(() => {
    const strings: Array<{
      id: number;
      name: string;
      isDead: boolean;
      readings: number[];
    }> = [];

    for (let s = 1; s <= 24; s++) {
      // Offline strings matching ref_img_5
      const isDead = (s >= 1 && s <= 6) || (s >= 15 && s <= 20);
      const readings: number[] = [];

      for (let t = 0; t < timeSlots.length; t++) {
        if (isDead) {
          readings.push(0.0);
        } else {
          // Daytime solar ramping curve
          const progress = t / (timeSlots.length - 1);
          // Scale from 0.0 to ~1.95 A
          const ramp = Math.sin(progress * Math.PI * 0.5);
          const noise = ((s * 13 + t * 7) % 10) * 0.015;
          const current = Math.max(0, ramp * nominalCurrent * 0.95 + noise);
          readings.push(parseFloat(current.toFixed(2)));
        }
      }

      strings.push({
        id: s,
        name: `CURRENT_STRING_${s}`,
        isDead,
        readings,
      });
    }

    return strings;
  }, [timeSlots, nominalCurrent]);

  // Compute AVG row
  const avgRow = useMemo(() => {
    return timeSlots.map((_, tIdx) => {
      const sum = stringData.reduce((acc, str) => acc + str.readings[tIdx], 0);
      return parseFloat((sum / stringData.length).toFixed(2));
    });
  }, [stringData, timeSlots]);

  // Color generator for heatmap cells
  const getCellColor = (val: number, isDead: boolean) => {
    if (val === 0 || isDead) {
      return "bg-[#FF1744]/20 text-[#FF1744] border-[#FF1744]/40 hover:bg-[#FF1744]/40";
    }
    if (val < 0.8) {
      return "bg-[#FFD600]/20 text-[#FFD600] border-[#FFD600]/40 hover:bg-[#FFD600]/40";
    }
    return "bg-[#00E676]/20 text-[#00E676] border-[#00E676]/40 hover:bg-[#00E676]/40";
  };

  // Table pagination
  const rowsPerPage = 10;
  const paginatedTimeSlots = timeSlots.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const totalPages = Math.ceil(timeSlots.length / rowsPerPage);

  // CSV Export helper
  const handleExportCsv = () => {
    let csv = "DATETIME,AVG_CURRENT," + stringData.map((s) => s.name).join(",") + "\n";
    timeSlots.forEach((slot, tIdx) => {
      const row = [
        `${selectedDate} ${slot}`,
        avgRow[tIdx],
        ...stringData.map((s) => s.readings[tIdx]),
      ];
      csv += row.join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `string_telemetry_${selectedInv}_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className={`rounded-xl bg-theme-card border border-theme-subtle p-4 sm:p-6 transition-all ${
        isFullscreen ? "fixed inset-4 z-50 overflow-y-auto shadow-2xl backdrop-blur-xl" : ""
      }`}
    >
      {/* Top Header & Inverter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-theme-subtle">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#FFD600]/10 border border-[#FFD600]/30 text-[#FFD600]">
            <Layers className="size-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-theme-primary flex items-center gap-2">
              <span>24-String Current Telemetry Heatmap</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FF2A85]/20 text-[#FF2A85] border border-[#FF2A85]/40">
                5-MIN RESOLUTION
              </span>
            </h2>
            <p className="text-xs text-theme-muted font-mono mt-0.5">
              Diurnal string current distribution & DC combiner fuse monitoring
            </p>
          </div>
        </div>

        {/* Controls: Inverter selector, Date filter, CSV Download, Fullscreen */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <div className="flex items-center rounded-lg bg-theme-muted p-1 border border-theme-subtle">
            {Array.from({ length: inverterCount }, (_, i) => {
              const name = `INV-${String(i + 1).padStart(2, "0")}`;
              const active = selectedInv === name;
              return (
                <button
                  key={name}
                  onClick={() => setSelectedInv(name)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    active
                      ? "bg-[#FF2A85] text-white shadow-[0_0_10px_rgba(255,42,133,0.4)]"
                      : "text-theme-muted hover:text-theme-primary"
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-theme-muted border border-theme-subtle text-theme-primary">
            <Calendar className="size-3.5 text-[#FFD600]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-mono text-theme-primary focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00E676]/10 hover:bg-[#00E676]/20 border border-[#00E676]/30 text-[#00E676] font-bold transition-all"
          >
            <Download className="size-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-theme-muted hover:bg-theme-subtle border border-theme-subtle text-theme-muted hover:text-theme-primary transition-all"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </button>
        </div>
      </div>

      {/* Critical String Outlier Diagnostic Alert */}
      <div className="my-4 p-3.5 rounded-xl bg-[#FF1744]/10 border border-[#FF1744]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-start sm:items-center gap-2.5 text-[#FF1744]">
          <AlertTriangle className="size-4 shrink-0 text-[#FF1744] mt-0.5 sm:mt-0" />
          <div>
            <strong className="text-white block sm:inline font-bold">
              Blown Fuse / Combiner Open-Circuit Alert:{" "}
            </strong>
            <span className="text-slate-300">
              Strings <strong>#01–#06</strong> and <strong>#15–#20</strong> are registering{" "}
              <span className="text-[#FF1744] font-bold">0.00 A</span> during peak morning insolation.
              12 out of 24 strings require immediate combiner box inspection.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#FF1744]/20 text-[#FF1744] border border-[#FF1744]/40">
            50% ARRAY DERATED
          </span>
        </div>
      </div>

      {/* 2D Heatmap Grid Container */}
      <div className="mt-4 relative rounded-xl border border-theme-subtle bg-theme-muted overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <div className="min-w-[900px] p-4">
            {/* Column Headers (5-min time slots) */}
            <div className="flex items-center mb-1 pl-36">
              {timeSlots.map((slot) => (
                <div
                  key={slot}
                  className="flex-1 text-center text-[10px] font-mono text-theme-muted select-none truncate px-0.5"
                >
                  {slot}
                </div>
              ))}
            </div>

            {/* AVG Current Row */}
            <div className="flex items-center gap-1 mb-2 py-1 px-1 rounded-lg bg-theme-card border border-theme-subtle font-mono text-xs">
              <div className="w-36 shrink-0 font-bold text-xs text-[#00F0FF] flex items-center gap-1.5 px-2">
                <Zap className="size-3.5 text-[#00F0FF]" />
                <span>AVG_Current</span>
              </div>
              <div className="flex-1 flex items-center gap-1">
                {avgRow.map((val, tIdx) => (
                  <div
                    key={`avg-${tIdx}`}
                    onMouseEnter={() =>
                      setHoveredCell({
                        stringNum: "AVG",
                        timeSlot: timeSlots[tIdx],
                        current: val,
                      })
                    }
                    onMouseLeave={() => setHoveredCell(null)}
                    className="flex-1 h-6 rounded flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 hover:scale-105"
                  >
                    {val.toFixed(2)}
                  </div>
                ))}
              </div>
            </div>

            {/* 24 String Rows */}
            <div className="space-y-1 font-mono text-xs">
              {stringData.map((str) => (
                <div
                  key={str.name}
                  className={`flex items-center gap-1 p-0.5 rounded transition-colors ${
                    str.isDead ? "bg-[#FF1744]/5" : "hover:bg-theme-card"
                  }`}
                >
                  {/* String Label Badge */}
                  <div className="w-36 shrink-0 flex items-center justify-between px-2 text-[11px]">
                    <span
                      className={`font-semibold ${
                        str.isDead ? "text-[#FF1744]" : "text-theme-primary"
                      }`}
                    >
                      {str.name}
                    </span>
                    {str.isDead ? (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#FF1744]/20 text-[#FF1744] font-bold">
                        FAULT
                      </span>
                    ) : (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#00E676]/15 text-[#00E676]">
                        HEALTHY
                      </span>
                    )}
                  </div>

                  {/* Heatmap 5-min Cells */}
                  <div className="flex-1 flex items-center gap-1">
                    {str.readings.map((val, tIdx) => (
                      <div
                        key={`${str.id}-${tIdx}`}
                        onMouseEnter={() =>
                          setHoveredCell({
                            stringNum: str.id,
                            timeSlot: timeSlots[tIdx],
                            current: val,
                          })
                        }
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`flex-1 h-5 rounded flex items-center justify-center text-[9px] font-mono font-medium transition-all cursor-pointer border ${getCellColor(
                          val,
                          str.isDead
                        )} hover:scale-110 hover:z-10`}
                      >
                        {val.toFixed(2)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating Tooltip Pill */}
        {hoveredCell && (
          <div className="absolute bottom-3 left-4 px-3 py-1.5 rounded-lg bg-black/90 border border-[#00F0FF]/50 shadow-xl text-white font-mono text-xs flex items-center gap-3 backdrop-blur-md z-20">
            <span className="text-[#00F0FF] font-bold">
              {hoveredCell.stringNum === "AVG" ? "Array Average" : `String #${hoveredCell.stringNum}`}
            </span>
            <span className="text-slate-400">|</span>
            <span>Time: {hoveredCell.timeSlot}</span>
            <span className="text-slate-400">|</span>
            <span className="text-[#FFD600] font-bold">
              Current: {hoveredCell.current.toFixed(2)} A
            </span>
            {hoveredCell.current === 0 && (
              <span className="px-1.5 py-0.5 rounded bg-[#FF1744] text-white text-[10px] font-bold">
                DEAD / OPEN CIRCUIT
              </span>
            )}
          </div>
        )}
      </div>

      {/* Heatmap Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-theme-subtle font-mono text-xs">
        <div className="flex items-center gap-4">
          <span className="text-theme-muted text-[11px] font-bold uppercase">Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded bg-[#FF1744]/40 border border-[#FF1744]" />
            <span className="text-theme-muted">0.00 A (Fault / Open Circuit)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded bg-[#FFD600]/40 border border-[#FFD600]" />
            <span className="text-theme-muted">&lt; 0.80 A (Low / Ramping)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded bg-[#00E676]/40 border border-[#00E676]" />
            <span className="text-theme-muted">&ge; 0.80 A (Optimal Generation)</span>
          </div>
        </div>

        <div className="text-theme-muted text-[11px]">
          Sample Interval: <strong className="text-theme-primary">5 Minutes</strong> | Total Strings:{" "}
          <strong className="text-theme-primary">24</strong>
        </div>
      </div>

      {/* Paginated 5-Minute Telemetry Audit Table */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold font-mono text-theme-primary uppercase tracking-wider flex items-center gap-2">
            <FileSpreadsheet className="size-3.5 text-[#00E676]" />
            <span>5-Minute String Telemetry Log</span>
          </h3>

          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded bg-theme-muted border border-theme-subtle disabled:opacity-40 text-theme-primary hover:bg-theme-subtle"
            >
              <ChevronLeft className="size-3.5" />
            </button>
            <span className="text-theme-muted text-xs">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 rounded bg-theme-muted border border-theme-subtle disabled:opacity-40 text-theme-primary hover:bg-theme-subtle"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-theme-subtle overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-theme-muted border-b border-theme-subtle text-[10px] text-theme-muted uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3 whitespace-nowrap">Timestamp</th>
                <th className="py-2.5 px-3 text-[#00F0FF] whitespace-nowrap">AVG_CURRENT (A)</th>
                {stringData.slice(0, 12).map((s) => (
                  <th key={s.name} className="py-2.5 px-2 text-center whitespace-nowrap">
                    STR_{s.id}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-subtle">
              {paginatedTimeSlots.map((slot, pIdx) => {
                const globalIdx = (currentPage - 1) * rowsPerPage + pIdx;
                return (
                  <tr key={slot} className="hover:bg-theme-muted/50 transition-colors">
                    <td className="py-2 px-3 text-theme-primary whitespace-nowrap font-bold">
                      {selectedDate} {slot}
                    </td>
                    <td className="py-2 px-3 text-[#00F0FF] font-bold whitespace-nowrap">
                      {avgRow[globalIdx]?.toFixed(2)} A
                    </td>
                    {stringData.slice(0, 12).map((s) => {
                      const val = s.readings[globalIdx];
                      return (
                        <td
                          key={s.name}
                          className={`py-2 px-2 text-center whitespace-nowrap font-medium ${
                            val === 0 ? "text-[#FF1744] font-bold" : "text-theme-primary"
                          }`}
                        >
                          {val.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
