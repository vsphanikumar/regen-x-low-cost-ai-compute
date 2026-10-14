import React, { useState } from 'react';
import { GridNode, ComputeJob } from '../../types';
import {
  Zap,
  Cpu,
  ShieldCheck,
  Server,
  Play,
  Radio,
} from 'lucide-react';

interface EnergyFlowBridgeProps {
  selectedNode: GridNode;
  selectedJob: ComputeJob;
  isExecuting: boolean;
  onExecuteArbitrage?: () => void;
  allNodes?: GridNode[];
  allJobs?: ComputeJob[];
  onSelectNode?: (nodeId: string) => void;
  onSelectJob?: (jobId: string) => void;
}

export const EnergyFlowBridge: React.FC<EnergyFlowBridgeProps> = ({
  selectedNode,
  selectedJob,
  isExecuting,
  onExecuteArbitrage,
}) => {
  const [manualFlowActive, setManualFlowActive] = useState(false);
  const [flowSpeed, setFlowSpeed] = useState<'SUPERSONIC' | 'NOMINAL'>('SUPERSONIC');
  const [streamDensity, setStreamDensity] = useState<'TRIPLE' | 'DUAL'>('TRIPLE');

  const activeTransfer = isExecuting || manualFlowActive;

  const powerTransferMW = selectedNode.curtailmentMWh;
  const isNegativeTariff = selectedNode.spotPricePerMWh <= 0;
  const gpuCount = selectedJob.gpusRequested || 64;
  const estimatedPowerDrawnKW = Math.round((gpuCount * 700) / 1000);
  const hourlySavings = Math.abs(selectedNode.spotPricePerMWh * (powerTransferMW * 0.4)).toFixed(2);
  const carbonPaceKgPerMin = (powerTransferMW * 0.82).toFixed(1);

  const energyColors = {
    SOLAR: {
      primary: '#f59e0b',
      glow: 'rgba(245, 158, 11, 0.75)',
      badge: 'border-amber-500/40 text-amber-300 bg-amber-950/40',
    },
    WIND: {
      primary: '#38bdf8',
      glow: 'rgba(56, 189, 248, 0.75)',
      badge: 'border-sky-500/40 text-sky-300 bg-sky-950/40',
    },
    HYDRO: {
      primary: '#60a5fa',
      glow: 'rgba(96, 165, 250, 0.75)',
      badge: 'border-blue-500/40 text-blue-300 bg-blue-950/40',
    },
    HYBRID: {
      primary: '#10b981',
      glow: 'rgba(16, 185, 129, 0.75)',
      badge: 'border-emerald-500/40 text-emerald-300 bg-emerald-950/40',
    },
  }[selectedNode.energyType] || {
    primary: '#10b981',
    glow: 'rgba(16, 185, 129, 0.75)',
    badge: 'border-emerald-500/40 text-emerald-300 bg-emerald-950/40',
  };

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4 relative overflow-hidden">
      {activeTransfer && (
        <div
          className="absolute inset-0 pointer-events-none opacity-20 transition-opacity duration-500"
          style={{
            background: `radial-gradient(ellipse at 50% 50%, ${energyColors.glow} 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-800 gap-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <span
            className={`p-2 rounded-lg border transition-all ${
              activeTransfer
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 energy-intake-pulse'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <Zap className={`w-4 h-4 ${activeTransfer ? 'animate-bounce' : ''}`} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                Logical Power Transfer Interconnect
              </h3>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase transition-all ${
                  activeTransfer
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {activeTransfer ? 'ARBITRAGE FLOW ACTIVE' : 'IDLE STANDBY'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              Thermodynamic power conduit transferring surplus clean energy from{' '}
              <strong className="text-slate-200">{selectedNode.name}</strong> to{' '}
              <strong className="text-emerald-400">WorkloadManager ({selectedJob.jobId})</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setManualFlowActive(!manualFlowActive)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
              manualFlowActive
                ? 'bg-emerald-500/30 text-emerald-300 border-emerald-500/60 shadow-xs'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>{manualFlowActive ? 'Pause Flow' : 'Simulate Flow'}</span>
          </button>
          {onExecuteArbitrage && (
            <button
              onClick={onExecuteArbitrage}
              disabled={isExecuting}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-98 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{isExecuting ? 'Transferring...' : 'Execute Arbitrage'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Visual Bridge */}
      <div className="relative bg-slate-950/80 rounded-xl border border-slate-800/80 p-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Source Node */}
          <div className="md:col-span-4 bg-slate-900/90 border border-slate-800 rounded-lg p-3 relative group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-emerald-400" />
                Map Egress Node
              </span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${energyColors.badge}`}>
                {selectedNode.energyType}
              </span>
            </div>
            <div className="font-bold text-slate-100 text-xs flex items-center justify-between">
              <span>{selectedNode.name}</span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">
              {selectedNode.region}
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div>
                <span className="text-slate-500 block">Surplus Power:</span>
                <span className="text-emerald-400 font-bold text-xs">
                  {selectedNode.curtailmentMWh} MWh
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Spot Tariff:</span>
                <span className={`font-bold text-xs ${isNegativeTariff ? 'text-emerald-400' : 'text-slate-300'}`}>
                  ${selectedNode.spotPricePerMWh.toFixed(2)}/MWh
                </span>
              </div>
            </div>
            <div
              className={`absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 bg-slate-950 transition-all ${
                activeTransfer
                  ? 'border-emerald-400 bg-emerald-500/40 shadow-sm energy-intake-pulse'
                  : 'border-slate-700'
              }`}
            />
          </div>

          {/* SVG Conduit */}
          <div className="md:col-span-4 h-28 relative flex flex-col items-center justify-center">
            <svg
              className="w-full h-24 overflow-visible"
              viewBox="0 0 300 70"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="energyBeamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={energyColors.primary} stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.9" />
                </linearGradient>
                <filter id="conduitGlow" x="-20%" y="-40%" width="140%" height="180%">
                  <feGaussianBlur stdDeviation="3.5" result="glow" />
                  <feComposite in="SourceGraphic" in2="glow" operator="over" />
                </filter>
              </defs>

              <path
                d="M 10 35 C 90 35, 120 20, 150 20 C 180 20, 210 50, 290 35"
                fill="none"
                stroke="#1e293b"
                strokeWidth="6"
                strokeLinecap="round"
              />

              {activeTransfer && (
                <path
                  d="M 10 35 C 90 35, 120 20, 150 20 C 180 20, 210 50, 290 35"
                  fill="none"
                  stroke="url(#energyBeamGrad)"
                  strokeWidth="8"
                  opacity="0.35"
                  className="energy-flow-laser"
                />
              )}

              <path
                d="M 10 35 C 90 35, 120 20, 150 20 C 180 20, 210 50, 290 35"
                fill="none"
                stroke={activeTransfer ? 'url(#energyBeamGrad)' : '#334155'}
                strokeWidth={activeTransfer ? 3 : 1.5}
                strokeLinecap="round"
                className={activeTransfer ? 'energy-flow-laser' : ''}
              />

              {activeTransfer && (
                <path
                  d="M 10 35 C 90 35, 120 20, 150 20 C 180 20, 210 50, 290 35"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  className={flowSpeed === 'SUPERSONIC' ? 'energy-flow-fast-line' : 'energy-flow-active-line'}
                  filter="url(#conduitGlow)"
                />
              )}

              {activeTransfer && streamDensity === 'TRIPLE' && (
                <path
                  d="M 10 35 C 90 35, 120 50, 150 50 C 180 50, 210 20, 290 35"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="1.8"
                  strokeDasharray="6 8"
                  strokeLinecap="round"
                  className="energy-flow-active-line"
                  opacity="0.85"
                />
              )}

              {activeTransfer && (
                <>
                  <circle cx="65" cy="31" r="3" fill="#ffffff" filter="url(#conduitGlow)">
                    <animate
                      attributeName="cx"
                      values="15;285"
                      dur="1.2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="cy"
                      values="35;22;35;48;35"
                      dur="1.2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0;1;1;0"
                      dur="1.2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle cx="160" cy="28" r="3.5" fill="#a7f3d0" filter="url(#conduitGlow)">
                    <animate
                      attributeName="cx"
                      values="15;285"
                      dur="0.8s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="cy"
                      values="35;20;25;45;35"
                      dur="0.8s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0;1;1;0"
                      dur="0.8s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </>
              )}
            </svg>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
              <div
                className={`px-2.5 py-1 rounded-full border text-[9px] font-mono font-bold tracking-tight shadow-lg flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  activeTransfer
                    ? 'bg-slate-950/95 border-emerald-500/80 text-emerald-300 drop-shadow'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                <Zap className={`w-3 h-3 ${activeTransfer ? 'text-emerald-400 animate-spin' : 'text-slate-500'}`} />
                <span>
                  {activeTransfer
                    ? `FLOW: ${powerTransferMW} MWh · -$${hourlySavings}/hr`
                    : 'STANDBY: READY TO ARBITRATE'}
                </span>
              </div>
            </div>
          </div>

          {/* Receiver Workload */}
          <div className="md:col-span-4 bg-slate-900/90 border border-slate-800 rounded-lg p-3 relative group">
            <div
              className={`absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 bg-slate-950 transition-all ${
                activeTransfer
                  ? 'border-sky-400 bg-sky-500/40 shadow-sm energy-intake-pulse'
                  : 'border-slate-700'
              }`}
            />
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3 h-3 text-sky-400" />
                Workload Manager Bus
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-sky-500/40 text-sky-300 bg-sky-950/40">
                {selectedJob.frameworkType}
              </span>
            </div>
            <div className="font-bold text-slate-100 text-xs flex items-center justify-between">
              <span className="truncate">{selectedJob.jobId}</span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">
              {selectedJob.clientOwner} · {selectedJob.dataResidency}
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div>
                <span className="text-slate-500 block">GPU Sponge:</span>
                <span className="text-sky-400 font-bold text-xs">
                  {gpuCount} x H100 ({estimatedPowerDrawnKW} kW)
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Carbon Offset:</span>
                <span className="text-emerald-400 font-bold text-xs">
                  +{carbonPaceKgPerMin} kg/min
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry Bar */}
        <div className="mt-3 pt-3 border-t border-slate-800/70 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sovereignty: <strong className="text-slate-200">{selectedJob.dataResidency}</strong></span>
            </span>
            <span className="flex items-center gap-1">
              <Server className="w-3.5 h-3.5 text-sky-400" />
              <span>Bypass: <strong className="text-emerald-400">Zero-Egress Direct Meter</strong></span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-[10px]">Flow Rate:</span>
            <button
              onClick={() => setFlowSpeed(flowSpeed === 'SUPERSONIC' ? 'NOMINAL' : 'SUPERSONIC')}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-300 cursor-pointer"
            >
              {flowSpeed === 'SUPERSONIC' ? 'Supersonic (0.45s)' : 'Standard (0.8s)'}
            </button>
            <button
              onClick={() => setStreamDensity(streamDensity === 'TRIPLE' ? 'DUAL' : 'TRIPLE')}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-300 cursor-pointer"
            >
              {streamDensity === 'TRIPLE' ? '3x Stream' : '2x Stream'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
