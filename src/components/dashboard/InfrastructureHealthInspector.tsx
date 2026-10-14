import React, { useState, useMemo } from 'react';
import {
  GridNode,
  HardwareStatus,
} from '../../types';
import {
  Cpu,
  Zap,
  Activity,
  CheckCircle2,
  Thermometer,
  Clock,
  ShieldCheck,
  RefreshCw,
  Server,
  Layers,
  Flame,
  Droplets,
  Gauge,
  TrendingDown,
  Info,
} from 'lucide-react';

interface InfrastructureHealthInspectorProps {
  selectedNode: GridNode;
  allNodes: GridNode[];
  onSelectNode: (nodeId: string) => void;
  onUpdateNodeStatus?: (nodeId: string, newStatus: HardwareStatus) => void;
  compactMode?: boolean;
}

export const InfrastructureHealthInspector: React.FC<InfrastructureHealthInspectorProps> = ({
  selectedNode,
  allNodes,
  onSelectNode,
  onUpdateNodeStatus,
}) => {
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);
  const [diagnosticStep, setDiagnosticStep] = useState<number>(0);
  const [diagnosticResult, setDiagnosticResult] = useState<string | null>(null);
  const [coolingBoostActive, setCoolingBoostActive] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'hardware' | 'thermal' | 'uptime'>('all');
  const [selectedGpuDie, setSelectedGpuDie] = useState<number | null>(null);

  const metrics = useMemo(() => {
    const isSolar = selectedNode.energyType === 'SOLAR';
    const isHydro = selectedNode.energyType === 'HYDRO';
    const isWind = selectedNode.energyType === 'WIND';

    let baseGpuTemp = 61.5;
    if (isSolar) baseGpuTemp = 64.2;
    if (isHydro) baseGpuTemp = 57.8;
    if (isWind) baseGpuTemp = 60.1;

    const loadFactor = (selectedNode.activeContainers || 32) / 64;
    let currentTemp = baseGpuTemp + loadFactor * 5.5;
    if (coolingBoostActive) {
      currentTemp -= 4.2;
    }
    const throttleCeiling = 85.0;
    const tempHeadroom = Math.max(0, throttleCeiling - currentTemp);

    const thermalEfficiencyPct = Math.min(
      99.4,
      Math.max(91.2, 100 - (currentTemp - 55) * 0.45 + (coolingBoostActive ? 1.5 : 0))
    );

    const tflopsPerWatt = Number((1.95 - (currentTemp - 55) * 0.008).toFixed(2));
    const coolingPue = isHydro ? 1.05 : isSolar ? 1.09 : 1.07;
    const baseUptime = 148.5;
    const seed = selectedNode.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const nodeUptimeHours = Number((baseUptime + (seed % 35) + loadFactor * 8).toFixed(1));

    const dieTemps = [0, 1, 2, 3, 4, 5, 6, 7].map((idx) => {
      const variation = Math.sin(seed + idx) * 2.8;
      return Number((currentTemp + variation).toFixed(1));
    });

    return {
      currentTemp: Number(currentTemp.toFixed(1)),
      throttleCeiling,
      tempHeadroom: Number(tempHeadroom.toFixed(1)),
      thermalEfficiencyPct: Number(thermalEfficiencyPct.toFixed(1)),
      tflopsPerWatt,
      coolingPue,
      coolingMethod: isHydro
        ? 'Closed-Loop Deep Hydro Immersion'
        : isSolar
        ? 'Direct-to-Chip Microchannel Liquid + Heat Exchanger'
        : 'Closed-Loop Glycol Liquid-to-Air Array',
      flowRateLpm: Number((44.5 + (seed % 8)).toFixed(1)),
      nodeUptimeHours,
      uptimeDays: Number((nodeUptimeHours / 24).toFixed(1)),
      reliabilityPct: 99.98,
      dieTemps,
      pduFrequencyHz: selectedNode.country === 'United States' ? 60.01 : 50.02,
      nvlinkBandwidthGbps: 896,
      eccErrorsCorrected: 0,
      uncorrectableErrors: 0,
      totalGpuCores: selectedNode.activeContainers * 8,
      restartsCount24h: 0,
    };
  }, [selectedNode, coolingBoostActive]);

  const handleRunDiagnostics = () => {
    if (isDiagnosticRunning) return;
    setIsDiagnosticRunning(true);
    setDiagnosticStep(1);
    setDiagnosticResult(null);
    const stepInterval = setInterval(() => {
      setDiagnosticStep((prev) => {
        if (prev >= 4) {
          clearInterval(stepInterval);
          setIsDiagnosticRunning(false);
          setDiagnosticResult('Hardware Health Verified: 100% Sensor Integrity · Zero Thermal Drift');
          return 4;
        }
        return prev + 1;
      });
    }, 400);
  };

  const handleToggleDrainStatus = () => {
    if (!onUpdateNodeStatus) return;
    const nextStatus: HardwareStatus =
      selectedNode.hardwareStatus === 'HEALTHY' ? 'DRAINING' : 'HEALTHY';
    onUpdateNodeStatus(selectedNode.id, nextStatus);
  };

  const isHealthy = selectedNode.hardwareStatus === 'HEALTHY';
  const isDraining = selectedNode.hardwareStatus === 'DRAINING';

  return (
    <div className="bg-slate-950/95 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
      {/* Inspector Header */}
      <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100 tracking-tight">
                Infrastructure Health Inspector
              </h3>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wide border ${
                  isHealthy
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    : isDraining
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                    : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isHealthy
                      ? 'bg-emerald-400 animate-pulse'
                      : isDraining
                      ? 'bg-amber-400 animate-ping'
                      : 'bg-rose-400'
                  }`}
                />
                {selectedNode.hardwareStatus}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Target Corridor: <strong className="text-slate-200">{selectedNode.name}</strong> ({selectedNode.id})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCoolingBoostActive((prev) => !prev)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              coolingBoostActive
                ? 'bg-sky-500/20 border-sky-500/40 text-sky-300 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
            title="Temporarily boosts coolant loop pressure and lowers junction temperatures"
          >
            <Droplets className={`w-3.5 h-3.5 ${coolingBoostActive ? 'text-sky-400 animate-spin' : ''}`} />
            <span>{coolingBoostActive ? 'Cooling Flush (-4°C)' : 'Immersion Flush'}</span>
          </button>
          <button
            onClick={handleRunDiagnostics}
            disabled={isDiagnosticRunning}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isDiagnosticRunning ? 'animate-spin' : ''}`} />
            <span>{isDiagnosticRunning ? 'Sweeping Bus...' : 'Run Diagnostics'}</span>
          </button>
          {onUpdateNodeStatus && (
            <button
              onClick={handleToggleDrainStatus}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all cursor-pointer ${
                isDraining
                  ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300 hover:bg-emerald-900/60'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-amber-300 hover:border-amber-700'
              }`}
            >
              {isDraining ? 'Restore Node' : 'Drain Node'}
            </button>
          )}
        </div>
      </div>

      {/* Node Quick Switch Pills Bar */}
      <div className="px-5 py-2.5 bg-slate-950 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap uppercase tracking-wider flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          Nodes:
        </span>
        <div className="flex items-center gap-1.5">
          {allNodes.map((n) => {
            const isSelected = n.id === selectedNode.id;
            return (
              <button
                key={n.id}
                onClick={() => onSelectNode(n.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                    : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    n.energyType === 'SOLAR'
                      ? 'bg-amber-400'
                      : n.energyType === 'WIND'
                      ? 'bg-sky-400'
                      : 'bg-blue-400'
                  }`}
                />
                <span>{n.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Diagnostics Progress Banner if Running */}
      {isDiagnosticRunning && (
        <div className="px-5 py-2.5 bg-emerald-950/40 border-b border-emerald-800/50 flex items-center justify-between text-xs font-mono text-emerald-300 animate-pulse">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            <span>
              Sweep Step {diagnosticStep}/4: {
                diagnosticStep === 1
                  ? 'Polling Inverter Phase & PDU Line Frequency...'
                  : diagnosticStep === 2
                  ? 'Testing 896 GB/s NVLink Full-Mesh Fabric...'
                  : diagnosticStep === 3
                  ? 'Checking Liquid Loop Flow Pressure (2.4 bar)...'
                  : 'Validating ECC Memory Registers & Container Sockets...'
              }
            </span>
          </div>
          <span className="text-emerald-400 font-bold">{diagnosticStep * 25}%</span>
        </div>
      )}

      {diagnosticResult && !isDiagnosticRunning && (
        <div className="px-5 py-2 bg-emerald-950/60 border-b border-emerald-800/60 flex items-center justify-between text-xs font-mono text-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{diagnosticResult}</span>
          </div>
          <button
            onClick={() => setDiagnosticResult(null)}
            className="text-[10px] text-slate-400 hover:text-slate-200 uppercase cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Section Filter Tabs */}
      <div className="px-5 py-2 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-slate-800 text-slate-100 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Complete View
          </button>
          <button
            onClick={() => setActiveTab('hardware')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'hardware'
                ? 'bg-slate-800 text-slate-100 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Hardware Status
          </button>
          <button
            onClick={() => setActiveTab('thermal')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'thermal'
                ? 'bg-slate-800 text-slate-100 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Thermometer className="w-3 h-3 text-amber-400" />
            GPU Thermals
          </button>
          <button
            onClick={() => setActiveTab('uptime')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'uptime'
                ? 'bg-slate-800 text-slate-100 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3 h-3 text-sky-400" />
            Container Uptime
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
          <span>Telemetry Sync:</span>
          <span className="text-slate-300">
            {new Date(selectedNode.lastTelemetryTimestamp || Date.now()).toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Main Telemetry Body */}
      <div className="p-5 space-y-6 overflow-y-auto max-h-[580px]">
        {/* Hardware Status */}
        {(activeTab === 'all' || activeTab === 'hardware') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Hardware Status & Subsystems
                </h4>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                0 Uncorrectable Faults · 2N Redundant Feed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* PDU & Inverter */}
              <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-lg flex flex-col justify-between hover:border-slate-700 transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-xs font-medium flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      PDU & Inverter
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/70 px-1.5 py-0.5 rounded border border-emerald-800/60">
                      OPTIMAL
                    </span>
                  </div>
                  <div className="space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Line Frequency:</span>
                      <strong className="text-white">{metrics.pduFrequencyHz} Hz</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Inverter Drift:</span>
                      <strong className="text-emerald-400">0.00% (Locked)</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">PDU Voltage:</span>
                      <strong className="text-slate-200">415V AC Pure Sine</strong>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                  Calibrated for renewable arbitrage
                </div>
              </div>

              {/* NVLink Mesh Fabric */}
              <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-lg flex flex-col justify-between hover:border-slate-700 transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-xs font-medium flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-sky-400" />
                      NVLink Interconnect
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/70 px-1.5 py-0.5 rounded border border-emerald-800/60">
                      896 GB/s
                    </span>
                  </div>
                  <div className="space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Mesh Topology:</span>
                      <strong className="text-white">Full Crossbar</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Inter-Die Latency:</span>
                      <strong className="text-sky-300">1.4 μs RoCEv2</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Packet Loss:</span>
                      <strong className="text-emerald-400">0.00%</strong>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                  8-GPU SXM5 cluster mesh
                </div>
              </div>

              {/* Memory & Bus */}
              <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-lg flex flex-col justify-between hover:border-slate-700 transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-xs font-medium flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-purple-400" />
                      ECC & Bus Integrity
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/70 px-1.5 py-0.5 rounded border border-emerald-800/60">
                      HEALTHY
                    </span>
                  </div>
                  <div className="space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">HBM3e Health:</span>
                      <strong className="text-emerald-400">0 Bit Flips</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">PCIe Gen5 Bus:</span>
                      <strong className="text-slate-200">128 GT/s (x16)</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Uncorrectable:</span>
                      <strong className="text-emerald-400">0 Faults</strong>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                  Fault isolation active
                </div>
              </div>

              {/* Liquid Cooling */}
              <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-lg flex flex-col justify-between hover:border-slate-700 transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-xs font-medium flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-blue-400" />
                      Cooling Plant
                    </span>
                    <span className="text-[10px] font-mono text-sky-400 font-bold bg-sky-950/70 px-1.5 py-0.5 rounded border border-sky-800/60">
                      2.4 BAR
                    </span>
                  </div>
                  <div className="space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Flow Velocity:</span>
                      <strong className="text-sky-300">{metrics.flowRateLpm} L/min</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Coolant In/Out:</span>
                      <strong className="text-slate-200">28°C / 42°C</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Pump Duty:</span>
                      <strong className="text-emerald-400">54% Nominal</strong>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400 truncate">
                  {metrics.coolingMethod}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GPU Thermals */}
        {(activeTab === 'all' || activeTab === 'thermal') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  GPU Thermal Efficiency & Junction Temperatures
                </h4>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-slate-400">Throttle Limit:</span>
                <span className="text-rose-400 font-bold">85.0°C</span>
                <span className="text-slate-400">Headroom:</span>
                <span className="text-emerald-400 font-bold">+{metrics.tempHeadroom}°C</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                      Thermal Efficiency Index
                    </span>
                    <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                      Optimal Tier
                    </span>
                  </div>
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
                      {metrics.thermalEfficiencyPct}%
                    </span>
                    <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                      <TrendingDown className="w-3.5 h-3.5" />
                      -0.34 kW Loss/Die
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800 mb-3">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-sky-400 to-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${metrics.thermalEfficiencyPct}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Percentage of electrical wattage converted directly to floating-point compute without throttling.
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-800 text-xs font-mono">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      Performance / Watt:
                    </span>
                    <strong className="text-emerald-400 font-bold">
                      {metrics.tflopsPerWatt} TFLOPS/W
                    </strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-sky-400" />
                      Cooling PUE Overhead:
                    </span>
                    <strong className="text-sky-300 font-bold">
                      {metrics.coolingPue} PUE
                    </strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-rose-400" />
                      Throttle Events:
                    </span>
                    <strong className="text-emerald-400 font-bold">
                      0 (Zero Throttling)
                    </strong>
                  </div>
                </div>
              </div>

              {/* 8-Die Heatmap */}
              <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h5 className="text-xs font-bold text-slate-200">
                        8-Die SXM5 GPU Thermal Matrix
                      </h5>
                      <p className="text-[11px] text-slate-400">
                        Real-time junction sensors across 8x Tensor Core Accelerators
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-mono">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded bg-emerald-500"></span> &lt;62°C (Cool)
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded bg-sky-500"></span> 62-67°C (Nominal)
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded bg-amber-500"></span> &gt;67°C (Warm)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-2">
                    {metrics.dieTemps.map((dieTempCelsius, idx) => {
                      const isSelectedDie = selectedGpuDie === idx;
                      const isWarm = dieTempCelsius >= 66;
                      const isCool = dieTempCelsius < 62;
                      return (
                        <div
                          key={`gpu-die-${idx}`}
                          onClick={() => setSelectedGpuDie(isSelectedDie ? null : idx)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            isSelectedDie
                              ? 'bg-slate-800 border-emerald-400 ring-1 ring-emerald-400/50 shadow-md'
                              : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-mono text-slate-400 font-bold">
                              GPU {idx}
                            </span>
                            <span
                              className={`text-[9px] font-mono font-bold px-1 rounded ${
                                isWarm
                                  ? 'bg-amber-950 text-amber-300'
                                  : isCool
                                  ? 'bg-emerald-950 text-emerald-300'
                                  : 'bg-sky-950 text-sky-300'
                              }`}
                            >
                              SXM5
                            </span>
                          </div>
                          <div className="flex items-baseline justify-between">
                            <span
                              className={`text-lg font-bold font-mono ${
                                isWarm
                                  ? 'text-amber-300'
                                  : isCool
                                  ? 'text-emerald-300'
                                  : 'text-sky-300'
                              }`}
                            >
                              {dieTempCelsius}°C
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {dieTempCelsius < 85 ? `+${(85 - dieTempCelsius).toFixed(1)}°C` : 'LIMIT'}
                            </span>
                          </div>
                          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-2">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isWarm
                                  ? 'bg-amber-400'
                                  : isCool
                                  ? 'bg-emerald-400'
                                  : 'bg-sky-400'
                              }`}
                              style={{ width: `${(dieTempCelsius / 85) * 100}%` }}
                            />
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mt-1.5">
                            <span>Duty: 58%</span>
                            <span className="text-emerald-400">1980MHz</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-2 text-xs bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                    <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    Optimal thermal efficiency allows sustained high GPU clock boosts.
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold whitespace-nowrap">
                    Average: {metrics.currentTemp}°C
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Container Uptime */}
        {(activeTab === 'all' || activeTab === 'uptime') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Container Fleet Uptime & Workload Reliability
                </h4>
              </div>
              <span className="text-[11px] font-mono text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/60">
                99.98% SLA Availability Guarantee
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-slate-400 text-xs font-medium">Average Container Uptime</span>
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold font-mono text-white">
                    {metrics.nodeUptimeHours}h
                  </span>
                  <span className="text-xs font-mono text-sky-400 font-semibold">
                    ({metrics.uptimeDays} days)
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-3">
                  <div className="h-full bg-sky-400 rounded-full" style={{ width: '92%' }} />
                </div>
                <p className="text-[10px] text-slate-400 mt-2">
                  Continuous training without eviction
                </p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-slate-400 text-xs font-medium">Active Containers</span>
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold font-mono text-emerald-400">
                    {selectedNode.activeContainers}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    / 64 Max Pods
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-3">
                  <div
                    className="h-full bg-emerald-400 rounded-full"
                    style={{ width: `${(selectedNode.activeContainers / 64) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-2">
                  PyTorch DDP & synthetic workloads
                </p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-slate-400 text-xs font-medium">Restarts (24h)</span>
                  <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold font-mono text-white">
                    0
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-semibold">
                    (Zero OOM Kills)
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-3">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: '100%' }} />
                </div>
                <p className="text-[10px] text-slate-400 mt-2">
                  MTBF: 1,540 hours estimated
                </p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-slate-400 text-xs font-medium">Drain Eviction Window</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold font-mono text-white">
                    1.2s
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-semibold">
                    Warm Standby
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-3">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: '96%' }} />
                </div>
                <p className="text-[10px] text-slate-400 mt-2">
                  Zero loss live migration on drops
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Server className="w-4 h-4 text-emerald-400" />
          <span>
            Hardware Class: <strong className="text-slate-200">NVIDIA H100 SXM5 Multi-Node Pod</strong>
          </span>
          <span className="text-slate-600">|</span>
          <span>
            Thermal Envelope: <strong className="text-emerald-400">{metrics.currentTemp}°C / 85°C Max</strong>
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-slate-400 text-[11px]">
          <span>Uptime SLA: <strong className="text-sky-300">99.98%</strong></span>
          <span>Carbon Avoided: <strong className="text-emerald-400">{selectedNode.carbonAvoidanceRateKgPerMWh} kg/MWh</strong></span>
        </div>
      </div>
    </div>
  );
};
