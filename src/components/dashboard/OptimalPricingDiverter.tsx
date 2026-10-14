import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  GitBranch,
  Activity,
  Zap,
  Cpu,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { GridNode, ComputeJob } from '../../types';
import { DecisionTreeDiagram } from './DecisionTreeDiagram';
import { DualAxisEconomicChart } from './DualAxisEconomicChart';

interface OptimalPricingDiverterProps {
  selectedNode: GridNode;
  selectedJob: ComputeJob;
  onExecuteArbitrage: () => Promise<void>;
  isExecuting: boolean;
  allNodes?: GridNode[];
  onSelectNode?: (nodeId: string) => void;
}

export const OptimalPricingDiverter: React.FC<OptimalPricingDiverterProps> = ({
  selectedNode,
  selectedJob,
  onExecuteArbitrage,
  isExecuting,
  allNodes,
  onSelectNode,
}) => {
  const [activeStepTab, setActiveStepTab] = useState<'dual_axis_chart' | 'decision_tree' | 'flow' | 'calculator'>('dual_axis_chart');
  const [hoursToRun, setHoursToRun] = useState<number>(4);

  const standardGridPricePerMWh = 48.0;
  const arbitragePricePerMWh = selectedNode.spotPricePerMWh;
  const mwhConsumedPerHour = (selectedJob.gpusRequested * 0.7) / 1000;
  const totalMWh = mwhConsumedPerHour * hoursToRun;
  const baselineCost = totalMWh * standardGridPricePerMWh;
  const arbitrageCost = Math.max(0, totalMWh * arbitragePricePerMWh);
  const totalSavingsUSD = baselineCost - arbitrageCost;
  const savingsPercent = Math.min(100, Math.round(((baselineCost - arbitrageCost) / (baselineCost || 1)) * 100));

  return (
    <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <DollarSign className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-white">
              Power Capture, Workload Divert &amp; Optimal Pricing Engine
            </h2>
            <span className="text-[10px] font-mono bg-emerald-950/60 px-2 py-0.5 rounded text-emerald-300 border border-emerald-500/40">
              Hardware Interceptor
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
            How REGEN-X captures physical generation via SCADA telemetry, diverts wattage behind-the-meter, and locks in optimal negative-tariff pricing.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs shrink-0 flex-wrap">
          <button
            onClick={() => setActiveStepTab('dual_axis_chart')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeStepTab === 'dual_axis_chart'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>24h Dual-Axis Arbitrage</span>
          </button>
          <button
            onClick={() => setActiveStepTab('decision_tree')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeStepTab === 'decision_tree'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Decision Tree</span>
          </button>
          <button
            onClick={() => setActiveStepTab('flow')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-colors cursor-pointer ${
              activeStepTab === 'flow' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Divert Pipeline
          </button>
          <button
            onClick={() => setActiveStepTab('calculator')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-colors cursor-pointer ${
              activeStepTab === 'calculator' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pricing Calculator
          </button>
        </div>
      </div>

      {activeStepTab === 'dual_axis_chart' && (
        <DualAxisEconomicChart
          selectedNode={selectedNode}
          selectedJob={selectedJob}
          allNodes={allNodes}
          onExecuteArbitrage={onExecuteArbitrage}
          isExecuting={isExecuting}
        />
      )}

      {activeStepTab === 'decision_tree' && (
        <DecisionTreeDiagram
          selectedNode={selectedNode}
          selectedJob={selectedJob}
          allNodes={allNodes}
          onSelectNode={onSelectNode}
          onExecuteArbitrage={onExecuteArbitrage}
          isExecuting={isExecuting}
        />
      )}

      {activeStepTab === 'flow' && (
        <div className="space-y-5 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-amber-400 font-bold pb-1.5 border-b border-slate-800">
                <span>STAGE 1: CAPTURE</span>
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div className="font-bold text-slate-100 text-xs mt-2">SCADA Capture</div>
              <p className="text-slate-400 text-[11px]">
                Substation IoT meters push generation telemetry via <code className="text-amber-300 font-mono">GET /v1/grid/telemetry</code>.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 font-bold pb-1.5 border-b border-slate-800">
                <span>STAGE 2: EVALUATION</span>
                <DollarSign className="w-3.5 h-3.5" />
              </div>
              <div className="font-bold text-slate-100 text-xs mt-2">Gemini Governor</div>
              <p className="text-slate-400 text-[11px]">
                Gemini 3.8 Flash assesses if spot tariff is optimal (&le; $0.00) and checks boundary constraints.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-sky-400 font-bold pb-1.5 border-b border-slate-800">
                <span>STAGE 3: DIVERT</span>
                <Cpu className="w-3.5 h-3.5" />
              </div>
              <div className="font-bold text-slate-100 text-xs mt-2">Behind-Meter Divert</div>
              <p className="text-slate-400 text-[11px]">
                Dispatches container signals to edge GPU clusters co-located right at the renewable park substation.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-purple-400 font-bold pb-1.5 border-b border-slate-800">
                <span>STAGE 4: VERIFY</span>
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="font-bold text-slate-100 text-xs mt-2">Green Passport</div>
              <p className="text-slate-400 text-[11px]">
                Issues a SHA-256 cryptographic certificate recording MWh absorbed and avoided carbon to BigQuery.
              </p>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="font-bold text-slate-200">
                Execute Live Divert Sequence for {selectedJob.jobId} ({selectedNode.name}):
              </span>
              <p className="text-slate-400 text-[11px]">
                Captures {selectedNode.curtailmentMWh} MWh at ${selectedNode.spotPricePerMWh.toFixed(2)}/MWh.
              </p>
            </div>
            <button
              onClick={onExecuteArbitrage}
              disabled={isExecuting}
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <Activity className={`w-3.5 h-3.5 ${isExecuting ? 'animate-spin' : ''}`} />
              <span>{isExecuting ? 'Executing Power Divert...' : 'Trigger Power Divert'}</span>
            </button>
          </div>
        </div>
      )}

      {activeStepTab === 'calculator' && (
        <div className="space-y-5 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                Standard Commercial Grid
              </span>
              <div className="text-2xl font-bold font-mono text-slate-300 tabular-nums">
                ${standardGridPricePerMWh.toFixed(2)}
                <span className="text-xs text-slate-500 font-normal ml-1">/MWh</span>
              </div>
              <div className="pt-2 border-t border-slate-800 font-mono text-[11px] text-slate-400">
                Run Cost: <strong className="text-slate-200">${baselineCost.toFixed(2)}</strong> ({totalMWh.toFixed(2)} MWh)
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/40 space-y-2 ring-1 ring-emerald-500/20">
              <span className="text-emerald-400 text-[11px] uppercase tracking-wider font-semibold">
                REGEN-X Arbitraged Tariff
              </span>
              <div className={`text-2xl font-bold font-mono tabular-nums ${arbitragePricePerMWh <= 0 ? 'text-emerald-400' : 'text-slate-100'}`}>
                ${arbitragePricePerMWh.toFixed(2)}
                <span className="text-xs text-slate-400 font-normal ml-1">/MWh</span>
              </div>
              <div className="pt-2 border-t border-slate-800 font-mono text-[11px] text-emerald-400">
                Arbitrage Cost: <strong className="text-white">${arbitrageCost.toFixed(2)}</strong> (Net Credited)
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-sky-400 text-[11px] uppercase tracking-wider font-semibold">
                Net Economic Benefit
              </span>
              <div className="text-2xl font-bold font-mono text-sky-400 tabular-nums">
                {savingsPercent}%
                <span className="text-xs text-slate-400 font-normal ml-1">Cost Slashing</span>
              </div>
              <div className="pt-2 border-t border-slate-800 font-mono text-[11px] text-sky-300">
                Avoided Cost: <strong className="text-white">${totalSavingsUSD.toFixed(2)}</strong>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">
                Simulated Workload Duration:
              </span>
              <span className="font-mono font-bold text-emerald-400">
                {hoursToRun} Hours ({totalMWh.toFixed(2)} MWh Absorbed)
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="24"
              value={hoursToRun}
              onChange={(e) => setHoursToRun(Number(e.target.value))}
              className="w-full accent-emerald-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
};
