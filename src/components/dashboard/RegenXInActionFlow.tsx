import React, { useState, useEffect } from 'react';
import {
  Sun,
  Wind,
  Cpu,
  Brain,
  CheckCircle2,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Zap,
  TrendingDown,
  CloudSun,
  Activity,
  Server,
  ShieldCheck,
} from 'lucide-react';
import { GridNode, ComputeJob } from '../../types';

interface RegenXInActionFlowProps {
  selectedNode: GridNode;
  selectedJob: ComputeJob;
  isExecuting: boolean;
  onExecuteArbitrage: () => void;
  onSelectNode?: (nodeId: string) => void;
}

export const RegenXInActionFlow: React.FC<RegenXInActionFlowProps> = ({
  selectedNode,
  selectedJob,
  isExecuting,
  onExecuteArbitrage,
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Auto-play demo cycle (advances every 4 seconds when playing)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setActiveStep((prev) => (prev >= 5 ? 1 : prev + 1));
      }, 3500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  // If user triggers execution from outside, jump to step 4 then 5
  useEffect(() => {
    if (isExecuting) {
      setActiveStep(4);
      const timer = setTimeout(() => {
        setActiveStep(5);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isExecuting]);

  const workloadMatches = [
    { name: selectedJob?.jobId || 'LLM_Training_#7842', type: 'LLM Training', gpuHrs: '200 GPU hrs', matchPct: 96, isSelected: true },
    { name: 'Synthetic_Data_Gen_V4', type: 'Synthetic Gen', gpuHrs: '80 GPU hrs', matchPct: 88, isSelected: false },
    { name: 'Vision_CLIP_Distill_21', type: 'Data Processing', gpuHrs: '50 GPU hrs', matchPct: 76, isSelected: false },
    { name: 'NeMo_Multimodal_Pretrain', type: '3D Rendering', gpuHrs: '120 GPU hrs', matchPct: 68, isSelected: false },
  ];

  const avoidedCarbon = ((selectedNode.curtailmentMWh * selectedNode.carbonAvoidanceRateKgPerMWh) / 1000).toFixed(1);
  const costSavingsPct = Math.min(95, Math.round(((48 - Math.max(0, selectedNode.spotPricePerMWh)) / 48) * 100));

  return (
    <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
      {/* Laser glow highlight on top */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-500 opacity-80" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-extrabold text-white tracking-tight">REGEN</span>
            <span className="text-sm font-extrabold text-emerald-400">X</span>
            <span className="text-sm font-extrabold text-white">IN ACTION</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-xs font-semibold text-emerald-400">
            Animated Demo Flow
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-medium hidden md:inline">
            From Surplus to Sustainable AI Compute in Seconds
          </span>

          {/* Interactive Player Controls */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                isPlaying
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
              <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
            </button>
            <button
              onClick={() => {
                setIsPlaying(false);
                setActiveStep(1);
              }}
              title="Reset flow to Step 1"
              className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 5 Sequential Interactive Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 relative">
        {/* Step 1: Renewable Surplus Detected */}
        <div
          onClick={() => setActiveStep(1)}
          className={`rounded-xl border p-3.5 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
            activeStep === 1
              ? 'bg-slate-900/95 border-emerald-400 ring-2 ring-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
              : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 opacity-80 hover:opacity-100'
          }`}
        >
          <div>
            {/* Visual Header Box */}
            <div className="relative h-28 rounded-lg bg-gradient-to-b from-sky-950/60 via-slate-900 to-emerald-950/40 border border-slate-800/80 p-2.5 flex flex-col justify-between overflow-hidden mb-3">
              {/* Graphic background simulation */}
              <div className="absolute inset-0 opacity-30 flex items-end justify-around px-2 pb-1 pointer-events-none">
                <Wind className="w-9 h-9 text-sky-400/40 animate-pulse" />
                <Sun className="w-8 h-8 text-amber-400/40" />
                <Wind className="w-7 h-7 text-sky-400/30 animate-pulse" />
              </div>
              <div className="flex items-center justify-between z-10">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                  Grid Sensor
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div className="bg-slate-950/90 border border-emerald-500/50 rounded-lg p-2 z-10 shadow-lg">
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-extrabold">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Surplus Detected</span>
                </div>
                <div className="text-sm font-mono font-bold text-white mt-0.5">
                  {selectedNode.curtailmentMWh} MW
                </div>
                <div className="text-[10px] font-mono text-slate-400 truncate">
                  {selectedNode.name.split(' ')[0]} ({selectedNode.energyType})
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs font-mono font-bold text-emerald-400">01</span>
              <h4 className="text-xs font-bold text-white">Renewable Surplus Detected</h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Real-time grid data identifies excess clean energy and negative spot tariffs.
            </p>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-500">Tariff:</span>
            <span className={selectedNode.spotPricePerMWh <= 0 ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
              ${selectedNode.spotPricePerMWh.toFixed(2)}/MWh
            </span>
          </div>
        </div>

        {/* Step 2: AI Predicts Opportunity */}
        <div
          onClick={() => setActiveStep(2)}
          className={`rounded-xl border p-3.5 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
            activeStep === 2
              ? 'bg-slate-900/95 border-emerald-400 ring-2 ring-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
              : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 opacity-80 hover:opacity-100'
          }`}
        >
          <div>
            <div className="relative h-28 rounded-lg bg-gradient-to-b from-purple-950/40 via-slate-900 to-emerald-950/40 border border-slate-800/80 p-2.5 flex flex-col justify-between overflow-hidden mb-3">
              <div className="flex items-center justify-between z-10">
                <span className="text-[10px] font-mono text-purple-300 uppercase font-bold">
                  Gemini 3.8 Flash
                </span>
                <Brain className="w-4 h-4 text-emerald-400 animate-pulse" />
              </div>
              <div className="grid grid-cols-2 gap-1.5 z-10 text-[10px] font-mono">
                <div className="bg-slate-950/80 px-2 py-1 rounded border border-slate-800 text-slate-300 flex items-center gap-1">
                  <CloudSun className="w-3 h-3 text-amber-400" /> Weather
                </div>
                <div className="bg-slate-950/80 px-2 py-1 rounded border border-slate-800 text-slate-300 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-sky-400" /> Grid Load
                </div>
                <div className="bg-slate-950/80 px-2 py-1 rounded border border-slate-800 text-slate-300 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3 text-emerald-400" /> Forecast
                </div>
                <div className="bg-slate-950/80 px-2 py-1 rounded border border-slate-800 text-purple-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" /> AI Analysis
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs font-mono font-bold text-emerald-400">02</span>
              <h4 className="text-xs font-bold text-white">AI Predicts Opportunity</h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Gemini analyzes weather, grid stability and historical pricing patterns.
            </p>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-500">Latency:</span>
            <span className="text-emerald-400 font-bold">&lt; 180 ms</span>
          </div>
        </div>

        {/* Step 3: Workload Selected */}
        <div
          onClick={() => setActiveStep(3)}
          className={`rounded-xl border p-3.5 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
            activeStep === 3
              ? 'bg-slate-900/95 border-emerald-400 ring-2 ring-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
              : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 opacity-80 hover:opacity-100'
          }`}
        >
          <div>
            <div className="relative h-28 rounded-lg bg-slate-950 border border-slate-800/80 p-2 flex flex-col justify-between overflow-hidden mb-3">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center justify-between">
                <span>Matching Workloads...</span>
                <Cpu className="w-3 h-3 text-sky-400" />
              </div>
              <div className="space-y-1 text-[9px] font-mono">
                {workloadMatches.slice(0, 3).map((w, idx) => (
                  <div
                    key={idx}
                    className={`px-1.5 py-0.5 rounded flex items-center justify-between ${
                      w.isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                        : 'text-slate-400'
                    }`}
                  >
                    <span className="truncate">{w.type}</span>
                    <span className="text-emerald-400">{w.matchPct}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs font-mono font-bold text-emerald-400">03</span>
              <h4 className="text-xs font-bold text-white">Workload Selected</h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Platform matches best AI workload with strict data residency compliance.
            </p>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-500">Selected:</span>
            <span className="text-sky-300 font-bold truncate max-w-[90px]">{selectedJob.jobId}</span>
          </div>
        </div>

        {/* Step 4: Autonomous Execution */}
        <div
          onClick={() => setActiveStep(4)}
          className={`rounded-xl border p-3.5 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
            activeStep === 4
              ? 'bg-slate-900/95 border-emerald-400 ring-2 ring-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
              : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 opacity-80 hover:opacity-100'
          }`}
        >
          <div>
            <div className="relative h-28 rounded-lg bg-gradient-to-b from-sky-950/50 via-slate-900 to-slate-950 border border-slate-800/80 p-2.5 flex flex-col justify-between overflow-hidden mb-3">
              <div className="flex items-center justify-between z-10">
                <span className="text-[10px] font-mono text-sky-300 uppercase font-bold">
                  Container Scaling
                </span>
                <Server className="w-4 h-4 text-sky-400 animate-pulse" />
              </div>
              <div className="bg-slate-950/90 border border-sky-500/50 rounded-lg p-2 z-10 shadow-lg">
                <div className="text-[10px] text-slate-400 font-mono">Routing to:</div>
                <div className="text-xs font-bold text-emerald-400 font-mono">
                  {selectedNode.name.split(' ')[0]} ({selectedNode.curtailmentMWh} MW)
                </div>
                <div className="text-[9px] text-slate-500 font-mono">
                  Cloud Run Sub-200ms scale
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs font-mono font-bold text-emerald-400">04</span>
              <h4 className="text-xs font-bold text-white">Autonomous Execution</h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Workload deployed to renewable-rich region in milliseconds via Cloud Run.
            </p>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-500">Action:</span>
            <span className="text-emerald-400 font-bold">SCALE_MAX_SPONGE</span>
          </div>
        </div>

        {/* Step 5: Measurable Impact */}
        <div
          onClick={() => setActiveStep(5)}
          className={`rounded-xl border p-3.5 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
            activeStep === 5
              ? 'bg-slate-900/95 border-emerald-400 ring-2 ring-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
              : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 opacity-80 hover:opacity-100'
          }`}
        >
          <div>
            <div className="relative h-28 rounded-lg bg-gradient-to-b from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/40 p-2.5 flex flex-col justify-between overflow-hidden mb-3">
              <div className="flex items-center justify-between">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9px] font-mono text-emerald-300 font-bold uppercase bg-emerald-950 px-1 rounded border border-emerald-800">
                  Verified
                </span>
              </div>
              <div>
                <div className="text-[10px] font-bold text-white leading-tight">
                  Workload Completed
                </div>
                <div className="text-[9px] font-mono text-emerald-400 font-bold">
                  100% Renewable Energy
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1 pt-1 border-t border-slate-800 text-[9px] font-mono">
                <div>
                  <span className="text-slate-500 block">Savings</span>
                  <span className="text-sky-300 font-bold">{costSavingsPct}%</span>
                </div>
                <div>
                  <span className="text-slate-500 block">CO₂</span>
                  <span className="text-emerald-400 font-bold">{avoidedCarbon} MT</span>
                </div>
                <div>
                  <span className="text-slate-500 block">MWh</span>
                  <span className="text-amber-300 font-bold">{selectedNode.curtailmentMWh}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs font-mono font-bold text-emerald-400">05</span>
              <h4 className="text-xs font-bold text-white">Measurable Impact</h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Real environmental and economic value created with cryptographic Passport.
            </p>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-500">LEED Grade:</span>
            <span className="text-emerald-400 font-bold">A+ Certified</span>
          </div>
        </div>
      </div>

      {/* Action Footer Button */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>
            Current step: <strong className="text-white font-mono">Step {activeStep} of 5</strong>
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-300">
            {activeStep === 1
              ? 'Detecting real-time renewable surplus across grid nodes...'
              : activeStep === 2
              ? 'Gemini 3.8 Flash evaluating weather, spot price & domestic boundary...'
              : activeStep === 3
              ? 'Selecting optimal batch workload from active backlog...'
              : activeStep === 4
              ? 'Triggering Cloud Run v2 container scale-out in regional subnet...'
              : 'Sealing cryptographic Green Compute Passport with SHA-256...'}
          </span>
        </div>

        <button
          onClick={onExecuteArbitrage}
          disabled={isExecuting}
          className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-98 disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isExecuting ? 'Executing Arbitrage Loop...' : 'Trigger Live Optimization Cycle'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
