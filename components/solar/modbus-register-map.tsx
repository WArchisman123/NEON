"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Cpu,
  Search,
  RefreshCw,
  Download,
  Terminal,
  Activity,
  Zap,
  Thermometer,
} from "lucide-react";
import { ModbusRegisterItem, InverterModbusSnapshot } from "@/lib/energy/types";

interface ModbusRegisterMapProps {
  inverterCount?: number;
  siteName?: string;
}

// Generate deterministic live Modbus registers for an inverter
function generateInverterModbusSnapshot(
  inverterIdx: number,
  jitter: number
): InverterModbusSnapshot {
  const invNum = inverterIdx + 1;
  const isInv1 = inverterIdx === 0;

  // Temperature with small jitter
  const internalTemp = 48.5 + (invNum * 1.2) + (jitter % 5) * 0.2;
  const dcPower = 102.4 + (invNum * 1.8) + (jitter % 7) * 0.15;
  const acPower = dcPower * 0.985;

  const registers: ModbusRegisterItem[] = [];

  // Group 1: 12 DC Voltages (Reg 30001 - 30012)
  for (let i = 1; i <= 12; i++) {
    const regAddr = 30000 + i;
    const baseV = 582.0 + ((i * 7 + invNum * 3) % 25);
    const liveV = (baseV + ((jitter + i) % 7) * 0.3).toFixed(1);
    registers.push({
      address: regAddr,
      hexAddress: `0x${regAddr.toString(16).toUpperCase()}`,
      name: `DC Voltage Input ${i}`,
      key: `DC_VOLTAGE_${i}`,
      value: parseFloat(liveV),
      unit: "V",
      description: `Inverter MPPT Channel #${i} DC String Input Voltage`,
      category: "dc_voltage",
      status: "normal",
    });
  }

  // Group 2: 12 DC Currents (Reg 30021 - 30032)
  for (let i = 1; i <= 12; i++) {
    const regAddr = 30020 + i;
    const isDegraded = isInv1 && i === 7;
    const isBlownFuse = isInv1 && i === 12;

    let baseA = 10.8 + ((i * 3 + invNum * 2) % 15) * 0.1;
    if (isDegraded) baseA *= 0.68;
    if (isBlownFuse) baseA = 0.0;

    const liveA = isBlownFuse
      ? "0.000"
      : (baseA + ((jitter + i * 2) % 5) * 0.04).toFixed(3);

    registers.push({
      address: regAddr,
      hexAddress: `0x${regAddr.toString(16).toUpperCase()}`,
      name: `DC Current Input ${i}`,
      key: `DC_CURRENT_${i}`,
      value: parseFloat(liveA),
      unit: "A",
      description: `Inverter MPPT Channel #${i} DC Injected Current`,
      category: "dc_current",
      status: isBlownFuse ? "critical" : isDegraded ? "warning" : "normal",
    });
  }

  // Group 3: 24 String Currents (Reg 30041 - 30064)
  for (let s = 1; s <= 24; s++) {
    const regAddr = 30040 + s;
    // Matching competitor ref_img_5 & ref_img_3 (Strings 1-6 & 15-20 dead in Inv 1)
    const isOffline = isInv1 && ((s >= 1 && s <= 6) || (s >= 15 && s <= 20));
    let baseStrA = 0.14 + ((s * 5) % 12) * 0.01;
    if (isOffline) baseStrA = 0.0;

    const val = isOffline
      ? "0.000"
      : (baseStrA + ((jitter + s) % 4) * 0.005).toFixed(3);

    registers.push({
      address: regAddr,
      hexAddress: `0x${regAddr.toString(16).toUpperCase()}`,
      name: `String Current ${s}`,
      key: `CURRENT_STRING_${s}`,
      value: parseFloat(val),
      unit: "A",
      description: `Individual PV String #${s} Hall-Effect Current Sensor`,
      category: "string_current",
      status: isOffline ? "critical" : "normal",
    });
  }

  // Group 4: 3-Phase AC Grid Registers & Power Quality (Reg 30081 - 30088)
  const acRegs = [
    { key: "GRID_VOLTAGE_AB", name: "Grid Line Voltage V_ab", val: (415.2 + (jitter % 3) * 0.2).toFixed(1), unit: "V" },
    { key: "GRID_VOLTAGE_BC", name: "Grid Line Voltage V_bc", val: (414.8 + (jitter % 4) * 0.2).toFixed(1), unit: "V" },
    { key: "GRID_VOLTAGE_CA", name: "Grid Line Voltage V_ca", val: (415.6 + (jitter % 5) * 0.2).toFixed(1), unit: "V" },
    { key: "GRID_CURRENT_A", name: "Grid Line Current Phase A", val: (144.2 + (jitter % 3) * 0.4).toFixed(1), unit: "A" },
    { key: "GRID_CURRENT_B", name: "Grid Line Current Phase B", val: (143.8 + (jitter % 4) * 0.4).toFixed(1), unit: "A" },
    { key: "GRID_CURRENT_C", name: "Grid Line Current Phase C", val: (144.5 + (jitter % 5) * 0.4).toFixed(1), unit: "A" },
    { key: "GRID_FREQUENCY", name: "Grid Interconnection Frequency", val: (50.02 + (jitter % 2) * 0.01).toFixed(2), unit: "Hz" },
    { key: "POWER_FACTOR", name: "Displacement Power Factor (cos φ)", val: "0.998", unit: "" },
  ];

  acRegs.forEach((r, idx) => {
    const regAddr = 30081 + idx;
    registers.push({
      address: regAddr,
      hexAddress: `0x${regAddr.toString(16).toUpperCase()}`,
      name: r.name,
      key: r.key,
      value: parseFloat(r.val),
      unit: r.unit,
      description: `3-Phase Utility Interconnection Point Metric`,
      category: "ac_grid",
      status: "normal",
    });
  });

  // Group 5: Energy Accumulators & Operating Lifetime (Reg 30101 - 30106)
  const energyRegs = [
    { key: "DAILY_YIELD_KWH", name: "Daily Active Energy Yield", val: (684.5 + invNum * 12).toFixed(1), unit: "kWh" },
    { key: "LIFETIME_YIELD_MWH", name: "Lifetime Cumulative Energy", val: (307.61 + invNum * 15.4).toFixed(2), unit: "MWh" },
    { key: "DAILY_RUN_HOURS", name: "Daily Operational Grid Run Time", val: "9.25", unit: "hours" },
    { key: "TOTAL_RUN_HOURS", name: "Total Inverter Operating Hours", val: `${4280 + invNum * 150}`, unit: "hours" },
    { key: "ISOLATION_RESISTANCE", name: "DC Array Insulation Resistance", val: "1280", unit: "kΩ" },
    { key: "THD_VOLTAGE", name: "Total Voltage Harmonic Distortion", val: "1.24", unit: "%" },
  ];

  energyRegs.forEach((r, idx) => {
    const regAddr = 30101 + idx;
    registers.push({
      address: regAddr,
      hexAddress: `0x${regAddr.toString(16).toUpperCase()}`,
      name: r.name,
      key: r.key,
      value: parseFloat(r.val) || r.val,
      unit: r.unit,
      description: `Energy counter & plant safety parameter`,
      category: "energy_lifetime",
      status: "normal",
    });
  });

  return {
    inverterId: `inv-0${invNum}`,
    inverterName: `INV-0${invNum} (Sungrow SG110CX)`,
    model: "SG110CX-V11",
    serialNumber: `SG-2026-99410${invNum}`,
    slaveId: invNum,
    baudRate: "9600-8-N-1",
    eventCode: isInv1 ? 0 : 0,
    eventMessage: isInv1 ? "0 - Normal Operation" : "0 - Normal Operation",
    internalTempC: parseFloat(internalTemp.toFixed(1)),
    dcInputPowerKw: parseFloat(dcPower.toFixed(2)),
    acOutputPowerKw: parseFloat(acPower.toFixed(2)),
    efficiencyPct: 98.5,
    lastPollTimestamp: new Date().toLocaleTimeString(),
    registers,
  };
}

export function ModbusRegisterMap({
  inverterCount = 3,
  siteName = "Site Solar Array",
}: ModbusRegisterMapProps) {
  const [selectedInverter, setSelectedInverter] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [addressMode, setAddressMode] = useState<"dec" | "hex">("dec");
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "dc_voltage" | "dc_current" | "string_current" | "ac_grid" | "energy_lifetime"
  >("all");
  const [pollInterval, setPollInterval] = useState<"5s" | "10s" | "paused">("5s");
  const [jitter, setJitter] = useState(0);
  const [showRawJson, setShowRawJson] = useState(false);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  // Live polling effect
  useEffect(() => {
    if (pollInterval === "paused") return;
    const intervalMs = pollInterval === "5s" ? 5000 : 10000;
    const timer = setInterval(() => {
      setJitter((prev) => prev + 1);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [pollInterval]);

  // Generate current snapshot
  const snapshot = useMemo(() => {
    return generateInverterModbusSnapshot(selectedInverter, jitter);
  }, [selectedInverter, jitter]);

  // Filtered registers
  const filteredRegisters = useMemo(() => {
    return snapshot.registers.filter((reg) => {
      const matchesCategory =
        selectedCategory === "all" || reg.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesQuery =
        reg.name.toLowerCase().includes(q) ||
        reg.key.toLowerCase().includes(q) ||
        reg.address.toString().includes(q) ||
        reg.hexAddress.toLowerCase().includes(q) ||
        reg.value.toString().toLowerCase().includes(q);

      return matchesCategory && matchesQuery;
    });
  }, [snapshot, selectedCategory, searchQuery]);

  // Manual refresh
  const handleManualRefresh = () => {
    setIsManualRefreshing(true);
    setJitter((prev) => prev + 1);
    setTimeout(() => setIsManualRefreshing(false), 500);
  };

  // Export register map to CSV
  const handleExportCsv = () => {
    let csv = "Address_DEC,Address_HEX,Register_Key,Register_Name,Value,Unit,Category,Status\n";
    snapshot.registers.forEach((r) => {
      csv += `${r.address},${r.hexAddress},${r.key},"${r.name}",${r.value},${r.unit},${r.category},${r.status || "normal"}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Modbus_Registers_${snapshot.inverterId}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Modbus Master Header matching ref_img_3 */}
      <div className="rounded-xl bg-theme-card border border-theme-subtle p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-theme-subtle">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#FFD600]/10 border border-[#FFD600]/30 text-[#FFD600]">
                <Cpu className="size-4" />
              </span>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#FFD600] font-bold">
                  Modbus-RTU / TCP Parameter Register Map
                </span>
                <h2 className="text-base sm:text-lg font-black text-theme-primary">
                  {snapshot.inverterName}
                </h2>
              </div>
            </div>
            <p className="text-xs text-theme-muted mt-1 font-mono">
              Site: <span className="text-theme-primary font-bold">{siteName}</span> • Serial: <span className="text-theme-secondary font-bold">{snapshot.serialNumber}</span> • Slave ID: <span className="text-theme-secondary font-bold">0{snapshot.slaveId}</span> • Protocol: <span className="text-theme-secondary font-bold">{snapshot.baudRate}</span>
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Polling Interval Select */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-theme-muted border border-theme-subtle text-xs font-mono text-theme-secondary min-h-[44px]">
              <Activity className="size-3.5 text-[#00E676] animate-pulse" />
              <span>Poll:</span>
              <select
                value={pollInterval}
                onChange={(e) =>
                  setPollInterval(e.target.value as "5s" | "10s" | "paused")
                }
                className="bg-transparent text-theme-primary font-bold focus:outline-none cursor-pointer"
              >
                <option value="5s" className="bg-slate-900 text-white">5s Live</option>
                <option value="10s" className="bg-slate-900 text-white">10s Rate</option>
                <option value="paused" className="bg-slate-900 text-white">Paused</option>
              </select>
            </div>

            <button
              onClick={handleManualRefresh}
              disabled={isManualRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-theme-muted border border-theme-subtle hover:border-theme-primary/30 text-xs font-mono text-theme-primary transition-all min-h-[44px]"
            >
              <RefreshCw className={`size-3.5 ${isManualRefreshing ? "animate-spin text-[#FFD600]" : ""}`} />
              <span>Poll Now</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#00E676]/10 border border-[#00E676]/30 hover:bg-[#00E676]/20 text-[#00E676] text-xs font-mono font-bold transition-all min-h-[44px]"
            >
              <Download className="size-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setShowRawJson(!showRawJson)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-theme-muted border border-theme-subtle hover:border-theme-primary/30 text-xs font-mono text-theme-secondary transition-all min-h-[44px]"
            >
              <Terminal className="size-3.5" />
              <span>{showRawJson ? "Hide JSON" : "Raw JSON"}</span>
            </button>
          </div>
        </div>

        {/* Master Telemetry Bar matching ref_img_3 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-4 font-mono">
          <div className="p-2.5 rounded-lg bg-theme-muted border border-theme-subtle">
            <span className="text-[10px] uppercase text-theme-muted flex items-center gap-1">
              <Thermometer className="size-3 text-[#FF6B00]" />
              Internal Temp
            </span>
            <div className="text-base sm:text-lg font-bold text-[#FF6B00] mt-0.5">
              {snapshot.internalTempC.toFixed(3)} °C
            </div>
            <span className="text-[9px] text-theme-muted">IGBT Heat Sink</span>
          </div>

          <div className="p-2.5 rounded-lg bg-theme-muted border border-theme-subtle">
            <span className="text-[10px] uppercase text-theme-muted flex items-center gap-1">
              <Zap className="size-3 text-[#FFD600]" />
              DC Active Power
            </span>
            <div className="text-base sm:text-lg font-bold text-[#FFD600] mt-0.5">
              {snapshot.dcInputPowerKw.toFixed(3)} kW
            </div>
            <span className="text-[9px] text-theme-muted">Total DC Input</span>
          </div>

          <div className="p-2.5 rounded-lg bg-theme-muted border border-theme-subtle">
            <span className="text-[10px] uppercase text-theme-muted flex items-center gap-1">
              <Activity className="size-3 text-[#00E676]" />
              AC Output Power
            </span>
            <div className="text-base sm:text-lg font-bold text-[#00E676] mt-0.5">
              {snapshot.acOutputPowerKw.toFixed(3)} kW
            </div>
            <span className="text-[9px] text-theme-muted">Grid Feed-in</span>
          </div>

          <div className="p-2.5 rounded-lg bg-theme-muted border border-theme-subtle">
            <span className="text-[10px] uppercase text-theme-muted">
              Efficiency (η)
            </span>
            <div className="text-base sm:text-lg font-bold text-theme-primary mt-0.5">
              {snapshot.efficiencyPct.toFixed(1)}%
            </div>
            <span className="text-[9px] text-[#00E676]">CEC Weighted</span>
          </div>

          <div className="p-2.5 rounded-lg bg-theme-muted border border-theme-subtle">
            <span className="text-[10px] uppercase text-theme-muted">
              Event Code
            </span>
            <div className="text-base sm:text-lg font-bold text-theme-primary mt-0.5 flex items-center gap-1.5">
              <span>{snapshot.eventCode}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#00E676]/20 text-[#00E676] font-bold">
                NORMAL
              </span>
            </div>
            <span className="text-[9px] text-theme-muted">No Trip Flags</span>
          </div>

          <div className="p-2.5 rounded-lg bg-theme-muted border border-theme-subtle">
            <span className="text-[10px] uppercase text-theme-muted">
              Last Poll
            </span>
            <div className="text-xs sm:text-sm font-bold text-theme-primary mt-1">
              {snapshot.lastPollTimestamp}
            </div>
            <span className="text-[9px] text-slate-500">Sub-second Sync</span>
          </div>
        </div>

        {/* Inverter Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-4 mt-4 border-t border-theme-subtle">
          <span className="text-xs font-mono text-theme-muted mr-1.5">Inverter:</span>
          {Array.from({ length: inverterCount }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedInverter(idx)}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all min-h-[40px] flex items-center gap-2 ${
                selectedInverter === idx
                  ? "bg-[#FF2A85] text-white shadow-[0_0_12px_rgba(255,42,133,0.35)]"
                  : "bg-theme-muted text-theme-secondary hover:text-theme-primary border border-theme-subtle"
              }`}
            >
              <span>INV-0{idx + 1}</span>
              <span className="size-1.5 rounded-full bg-[#00E676]" />
            </button>
          ))}
        </div>
      </div>

      {/* Raw JSON Modal / View */}
      {showRawJson && (
        <div className="rounded-xl bg-slate-950 border border-[#00F0FF]/40 p-4 text-xs font-mono text-[#00F0FF] overflow-x-auto shadow-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
            <span className="flex items-center gap-1.5 font-bold text-white">
              <Terminal className="size-3.5 text-[#00F0FF]" />
              Modbus Frame Buffer Dump (Slave: 0x0{snapshot.slaveId})
            </span>
            <button
              onClick={() => setShowRawJson(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕ Close
            </button>
          </div>
          <pre className="text-[11px] leading-relaxed max-h-60 overflow-y-auto">
            {JSON.stringify(snapshot, null, 2)}
          </pre>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="rounded-xl bg-theme-card border border-theme-subtle p-3.5 sm:p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-theme-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search registers by key, name, or address (e.g. 3002, VOLTAGE, STRING)..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-theme-muted border border-theme-subtle text-theme-primary text-xs font-mono placeholder:text-theme-muted focus:outline-none focus:border-[#FF2A85] min-h-[42px]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-primary text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Hex / Dec Address Mode Switch */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-theme-muted">Address Format:</span>
            <div className="flex rounded-lg bg-theme-muted p-0.5 border border-theme-subtle">
              <button
                onClick={() => setAddressMode("dec")}
                className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all min-h-[36px] ${
                  addressMode === "dec"
                    ? "bg-[#FF2A85] text-white shadow-sm"
                    : "text-theme-muted hover:text-theme-primary"
                }`}
              >
                DEC (30001)
              </button>
              <button
                onClick={() => setAddressMode("hex")}
                className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all min-h-[36px] ${
                  addressMode === "hex"
                    ? "bg-[#FF2A85] text-white shadow-sm"
                    : "text-theme-muted hover:text-theme-primary"
                }`}
              >
                HEX (0x7531)
              </button>
            </div>
          </div>
        </div>

        {/* Category Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-theme-subtle pt-3">
          {[
            { id: "all", label: `All Registers (${snapshot.registers.length})` },
            { id: "dc_voltage", label: "DC Voltages (12)" },
            { id: "dc_current", label: "DC Currents (12)" },
            { id: "string_current", label: "String Currents (24)" },
            { id: "ac_grid", label: "AC Grid & Power Quality (8)" },
            { id: "energy_lifetime", label: "Energy & Lifetime (6)" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as typeof selectedCategory)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all min-h-[38px] ${
                selectedCategory === cat.id
                  ? "bg-theme-primary text-theme-inverse font-bold"
                  : "bg-theme-muted text-theme-muted hover:text-theme-primary hover:bg-theme-muted/80"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Register Tiles Grid matching ref_img_3 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filteredRegisters.length === 0 ? (
          <div className="col-span-full p-8 text-center rounded-xl bg-theme-card border border-theme-subtle">
            <Search className="size-8 text-theme-muted mx-auto mb-2 opacity-50" />
            <p className="text-sm font-mono text-theme-primary font-bold">
              No Modbus registers matched &quot;{searchQuery}&quot;
            </p>
            <p className="text-xs font-mono text-theme-muted mt-1">
              Try searching by register number, hex code, or clear the filter.
            </p>
          </div>
        ) : (
          filteredRegisters.map((reg) => {
            const isCritical = reg.status === "critical";
            const isWarning = reg.status === "warning";
            const displayAddress =
              addressMode === "hex" ? reg.hexAddress : reg.address;

            // Value color based on category & status
            let valColor = "text-theme-primary";
            if (isCritical) {
              valColor = "text-[#FF1744]";
            } else if (isWarning) {
              valColor = "text-[#FFAB00]";
            } else if (reg.category === "dc_voltage") {
              valColor = "text-[#00F0FF]";
            } else if (reg.category === "dc_current" || reg.category === "string_current") {
              valColor = "text-[#FFD600]";
            } else if (reg.category === "ac_grid") {
              valColor = "text-[#00E676]";
            }

            return (
              <div
                key={reg.address}
                className={`p-3 rounded-xl border transition-all font-mono space-y-2 relative overflow-hidden ${
                  isCritical
                    ? "bg-[#FF1744]/10 border-[#FF1744]/40"
                    : isWarning
                    ? "bg-[#FFAB00]/10 border-[#FFAB00]/40"
                    : "bg-theme-card border-theme-subtle hover:border-theme-primary/30"
                }`}
              >
                {/* Top Row: Address Badge & Key */}
                <div className="flex items-center justify-between text-[10px]">
                  <span className="px-1.5 py-0.5 rounded bg-theme-muted text-theme-muted font-bold">
                    {displayAddress}
                  </span>
                  {isCritical ? (
                    <span className="text-[9px] px-1 rounded bg-[#FF1744]/20 text-[#FF1744] font-bold">
                      OFFLINE
                    </span>
                  ) : isWarning ? (
                    <span className="text-[9px] px-1 rounded bg-[#FFAB00]/20 text-[#FFAB00] font-bold">
                      WARN
                    </span>
                  ) : (
                    <span className="size-1.5 rounded-full bg-[#00E676]" />
                  )}
                </div>

                {/* Key Label */}
                <div className="text-xs font-bold text-theme-primary truncate" title={reg.name}>
                  {reg.key}
                </div>

                {/* Big Live Value Display */}
                <div className="pt-1">
                  <div className={`text-base sm:text-lg font-black tracking-tight ${valColor}`}>
                    {typeof reg.value === "number" ? reg.value.toLocaleString() : reg.value}
                    {reg.unit && <span className="text-xs font-normal text-theme-muted ml-1">{reg.unit}</span>}
                  </div>
                </div>

                {/* Description Subtext */}
                <div className="text-[9px] text-theme-muted truncate pt-1 border-t border-theme-subtle" title={reg.description}>
                  {reg.name}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
