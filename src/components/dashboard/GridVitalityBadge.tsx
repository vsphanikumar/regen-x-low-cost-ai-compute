import React, { useState, useMemo, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ChevronDown,
  ChevronUp,
  Server,
  Thermometer,
  ShieldCheck,
  RefreshCw,
  Zap,
  ArrowRight,
  Info,
} from 'lucide-react';
import { GridNode, HardwareStatus } from '../../types';

interface GridVitalityBadgeProps {
  selectedNode: GridNode;
  onOpenHardwareInspector?: () => void;
  onUpdateStatus?: (nodeId: string, status: HardwareStatus) => void;
}

export interface ContainerHealthSummary {
  vitalityScore: number;
  vitalityTier: 'OPTIMAL' | 'STABLE' | 'DEGRADED' | 'CRITICAL';
  healthyContainers: number;
  drainingContainers: number;
  faultContainers: number;
  totalContainers: number;
  avgGpuTemp: number;
  thermalHeadroom: number;
  coolingPue: number;
  flowRateLpm: number;
  containerUptimeHours: number;
  containerReliabilityPct: number;
  inverterSyncStatus: string;
}

export const GridVitalityBadge: React.FC<GridVitalityBadgeProps> = ({
  selectedNode,
  onOpenHardwareInspector,
  onUpdateStatus,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [lastTelemetryAgeSec, setLastTelemetryAgeSec] = useState<number>(0);
  const [isPinging, setIsPinging] = useState<boolean>(false);

  // Live timer for telemetry age
  useEffect(() => {
    setLastTelemetryAgeSec(0);
    const interval = setInterval(() => {
      setLastTelemetryAgeSec((prev) => (prev >= 60 ? 1 : prev + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedNode.id, selectedNode.hardwareStatus]);

  // Compute container health metrics
  const healthSummary: ContainerHealthSummary = useMemo(() => {
    const totalContainers = selectedNode.activeContainers || 48;
    const isSolar = selectedNode.energyType === 'SOLAR';
    const isHydro = selectedNode.energyType === 'HYDRO';
    const isWind = selectedNode.energyType === 'WIND';

    // Hardware status distributions
    let healthyContainers = totalContainers;
    let drainingContainers = 0;
    let faultContainers = 0;

    if (selectedNode.hardwareStatus === 'DRAINING') {
      drainingContainers = Math.ceil(totalContainers * 0.65);
      healthyContainers = totalContainers - drainingContainers;
    } else if (selectedNode.hardwareStatus === 'FAULT') {
      faultContainers = Math.ceil(totalContainers * 0.35);
      drainingContainers = Math.ceil(totalContainers * 0.3);
      healthyContainers = totalContainers - faultContainers - drainingContainers;
    }

    // Thermal & cooling calculation
    let baseTemp = 61.0;
    if (isSolar) baseTemp = 64.5;
    if (isHydro) baseTemp = 57.5;
    if (isWind) baseTemp = 59.8;

    const loadFactor = totalContainers / 64;
    const avgGpuTemp = Number((baseTemp + loadFactor * 5.2).toFixed(1));
    const thermalHeadroom = Number((85.0 - avgGpuTemp).toFixed(1));
    const coolingPue = isHydro ? 1.05 : isSolar ? 1.09 : 1.07;
    const seed = selectedNode.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const flowRateLpm = Number((43.0 + (seed % 9)).toFixed(1));
    const containerUptimeHours = Number((144 + (seed % 30)).toFixed(1));

    // Vitality score calculation
    let vitalityScore = 98.4;
    if (selectedNode.hardwareStatus === 'HEALTHY') {
      vitalityScore = Number((98.8 - (avgGpuTemp > 65 ? 1.2 : 0)).toFixed(1));
    } else if (selectedNode.hardwareStatus === 'DRAINING') {
      vitalityScore = 78.5;
    } else if (selectedNode.hardwareStatus === 'FAULT') {
      vitalityScore = 54.2;
    }

    let vitalityTier: 'OPTIMAL' | 'STABLE' | 'DEGRADED' | 'CRITICAL' = 'OPTIMAL';
    if (vitalityScore >= 95) vitalityTier = 'OPTIMAL';
    else if (vitalityScore >= 85) vitalityTier = 'STABLE';
    else if (vitalityScore >= 70) vitalityTier = 'DEGRADED';
    else vitalityTier = 'CRITICAL';

    return {
      vitalityScore,
      vitalityTier,
      healthyContainers,
      drainingContainers,
      faultContainers,
      totalContainers,
      avgGpuTemp,
      thermalHeadroom,
      coolingPue,
      flowRateLpm,
      containerUptimeHours,
      containerReliabilityPct: selectedNode.hardwareStatus === 'HEALTHY' ? 99.98 : 94.5,
      inverterSyncStatus: selectedNode.hardwareStatus === 'FAULT' ? 'DESYNC_ALERT' : 'PHASE_LOCKED',
    };
  }, [selectedNode]);

  // Color schemes based on vitality tier
  const tierConfig = useMemo(() => {
    switch (healthSummary.vitalityTier) {
      case 'OPTIMAL':
        return {
          textColor: 'text-emerald-400',
          badgeBg: 'bg-emerald-500/15',
          borderCol: 'border-emerald-500/40',
          pulseColor: 'bg-emerald-400',
          label: 'Optimal',
          icon: CheckCircle2,
          barColor: 'bg-emerald-400',
        };
      case 'STABLE':
        return {
          textColor: 'text-sky-400',
          badgeBg: 'bg-sky-500/15',
          borderCol: 'border-sky-500/40',
          pulseColor: 'bg-sky-400',
          label: 'Stable',
          icon: Activity,
          barColor: 'bg-sky-400',
        };
      case 'DEGRADED':
        return {
          textColor: 'text-amber-400',
          badgeBg: 'bg-amber-500/15',
          borderCol: 'border-amber-500/40',
          pulseColor: 'bg-amber-400',
          label: 'Draining',
          icon: AlertTriangle,
          barColor: 'bg-amber-400',
        };
      case 'CRITICAL':
        return {
          textColor: 'text-rose-400',
          badgeBg: 'bg-rose-500/15',
          borderCol: 'border-rose-500/40',
          pulseColor: 'bg-rose-400',
          label: 'Critical Fault',
          icon: AlertOctagon,
          barColor: 'bg-rose-400',
        };
    }
  }, [healthSummary.vitalityTier]);

  const TierIcon = tierConfig.icon;

  const handlePing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPinging(true);
    setTimeout(() => {
      setIsPinging(false);
      setLastTelemetryAgeSec(0);
    }, 600);
  };

  return (
    <div
      className={`absolute top-3 left-3 sm:top-4 sm:left-4 z-20 transition-all duration-300 max-w-[calc(100%-24px)] sm:max-w-md ${
        isExpanded ? 'w-[360px] sm:w-[410px]' : 'w-auto'
      }`}
    >
      {/* Main Notification Badge Capsule */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`backdrop-blur-md bg-slate-950/90 border ${
          tierConfig.borderCol
        } rounded-xl px-3.5 py-2.5 shadow-2xl cursor-pointer hover:bg-slate-900/95 transition-all select-none group`}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Heartbeat pulse and title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative flex items-center justify-center w-5 h-5 flex-shrink-0">
              <span
                className={`absolute w-3.5 h-3.5 rounded-full ${tierConfig.pulseColor} opacity-75 animate-ping`}
              />
              <span
                className={`relative w-2.5 h-2.5 rounded-full ${tierConfig.pulseColor} shadow-[0_0_8px_currentColor]`}
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-300 tracking-wide uppercase font-mono">
                  Grid Vitality
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${tierConfig.badgeBg} ${tierConfig.textColor} font-mono`}
                >
                  {healthSummary.vitalityScore}% {tierConfig.label}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate font-mono">
                {selectedNode.name} · {healthSummary.healthyContainers}/{healthSummary.totalContainers}{' '}
                Containers Healthy
              </p>
            </div>
          </div>

          {/* Quick telemetry badge controls */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={handlePing}
              title="Ping hardware containers"
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw
                className={`w-3 h-3 ${isPinging ? 'animate-spin text-emerald-400' : ''}`}
              />
            </button>
            <div className="text-slate-400 group-hover:text-white transition-colors">
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </div>
          </div>
        </div>

        {/* Mini Vitality Progress Bar (always visible in collapsed state) */}
        {!isExpanded && (
          <div className="mt-2 w-full bg-slate-900 h-1 rounded-full overflow-hidden">
            <div
              className={`h-full ${tierConfig.barColor} transition-all duration-500 rounded-full`}
              style={{ width: `${healthSummary.vitalityScore}%` }}
            />
          </div>
        )}
      </div>

      {/* Expanded Diagnostic HUD Drawer */}
      {isExpanded && (
        <div className="mt-2 backdrop-blur-xl bg-slate-950/95 border border-slate-800 rounded-xl p-4 shadow-2xl text-xs space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header row with regional details */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                <Server className="w-3.5 h-3.5 text-emerald-400" />
                <span>{selectedNode.region}</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                {selectedNode.energyType} Co-located Pods · Last heartbeat: {lastTelemetryAgeSec}s ago
              </p>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tierConfig.badgeBg} ${tierConfig.textColor} border ${tierConfig.borderCol} font-mono`}
            >
              {selectedNode.hardwareStatus}
            </span>
          </div>

          {/* Container Fleet Distribution Rack */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
              <span className="text-slate-400 font-medium">Hardware Container Fleet Status</span>
              <span className="text-slate-200 font-bold">
                {healthSummary.totalContainers} Containers Provisioned
              </span>
            </div>

            {/* Segmented Container Bar */}
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden flex">
              <div
                style={{
                  width: `${(healthSummary.healthyContainers / healthSummary.totalContainers) * 100}%`,
                }}
                className="bg-emerald-400 h-full transition-all duration-300"
                title={`${healthSummary.healthyContainers} Healthy Containers`}
              />
              <div
                style={{
                  width: `${(healthSummary.drainingContainers / healthSummary.totalContainers) * 100}%`,
                }}
                className="bg-amber-400 h-full transition-all duration-300"
                title={`${healthSummary.drainingContainers} Draining Containers`}
              />
              <div
                style={{
                  width: `${(healthSummary.faultContainers / healthSummary.totalContainers) * 100}%`,
                }}
                className="bg-rose-400 h-full transition-all duration-300"
                title={`${healthSummary.faultContainers} Faulted Containers`}
              />
            </div>

            {/* Container breakdown chips */}
            <div className="flex items-center justify-between text-[10px] font-mono mt-1.5 text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Healthy: <strong className="text-emerald-400">{healthSummary.healthyContainers}</strong>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Draining: <strong className="text-amber-400">{healthSummary.drainingContainers}</strong>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                Fault: <strong className="text-rose-400">{healthSummary.faultContainers}</strong>
              </span>
            </div>
          </div>

          {/* Key Vitality Sensor Grid */}
          <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-2">
              <div className="flex items-center justify-between text-slate-400 text-[10px]">
                <span className="flex items-center gap-1">
                  <Thermometer className="w-3 h-3 text-emerald-400" /> Avg GPU Temp
                </span>
                <span className="text-emerald-400 font-bold">{healthSummary.avgGpuTemp}°C</span>
              </div>
              <p className="text-[9.5px] text-slate-500 mt-0.5">
                Thermal Headroom: +{healthSummary.thermalHeadroom}°C
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-2">
              <div className="flex items-center justify-between text-slate-400 text-[10px]">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-sky-400" /> Cooling PUE
                </span>
                <span className="text-sky-400 font-bold">{healthSummary.coolingPue} PUE</span>
              </div>
              <p className="text-[9.5px] text-slate-500 mt-0.5">
                Microchannel Flow: {healthSummary.flowRateLpm} LPM
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-2">
              <div className="flex items-center justify-between text-slate-400 text-[10px]">
                <span>Mean Uptime</span>
                <span className="text-slate-200 font-bold">
                  {healthSummary.containerUptimeHours}h
                </span>
              </div>
              <p className="text-[9.5px] text-slate-500 mt-0.5">
                Reliability: {healthSummary.containerReliabilityPct}%
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-2">
              <div className="flex items-center justify-between text-slate-400 text-[10px]">
                <span>Inverter Sync</span>
                <span className="text-emerald-400 font-bold text-[9.5px]">
                  {healthSummary.inverterSyncStatus}
                </span>
              </div>
              <p className="text-[9.5px] text-slate-500 mt-0.5">ECC Memory Errors: 0</p>
            </div>
          </div>

          {/* Draining / Fault alert banner if degraded */}
          {selectedNode.hardwareStatus !== 'HEALTHY' && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5 flex items-start gap-2 text-[10.5px] text-amber-200">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Container Drain In Progress:</strong> AI workloads are autonomously
                rerouted to protect thermal and grid stability.
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between pt-1 gap-2">
            {onOpenHardwareInspector && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenHardwareInspector();
                }}
                className="w-full py-1.5 px-3 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-semibold rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Deep Hardware Diagnostics</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            )}

            {/* Quick status test switcher */}
            {onUpdateStatus && (
              <div className="flex items-center gap-1">
                {(['HEALTHY', 'DRAINING', 'FAULT'] as HardwareStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateStatus(selectedNode.id, status);
                    }}
                    title={`Simulate ${status} status`}
                    className={`px-1.5 py-1 text-[9.5px] font-mono rounded border transition-colors cursor-pointer ${
                      selectedNode.hardwareStatus === status
                        ? 'bg-slate-700 text-white border-slate-500 font-bold'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {status[0]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
