import React from 'react';
import { Zap, Leaf, Cpu, DollarSign, TrendingUp, HelpCircle } from 'lucide-react';

interface MetricBoxProps {
  spotPrice?: number;
  curtailmentMWh?: number;
  totalCO2Prevented: number;
  activeContainers: number;
  leedStatus?: string;
  selectedRegionName?: string;
}

export const MetricBox: React.FC<MetricBoxProps> = ({
  totalCO2Prevented,
  activeContainers,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* 1. Clean Energy Utilized */}
      <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between transition-all hover:border-slate-700 relative group">
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-400 font-medium">Clean Energy Utilized</div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            <Zap className="w-5 h-5 fill-emerald-400/30" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
            1,284 <span className="text-xs text-slate-400 font-normal">MWh</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Zero-marginal-cost renewable surplus</div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>+42% absorbed vs. baseline</span>
          </div>
        </div>
      </div>

      {/* 2. CO2 Emissions Avoided */}
      <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between transition-all hover:border-slate-700 relative group">
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-400 font-medium">CO₂ Emissions Avoided</div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            <Leaf className="w-5 h-5 fill-emerald-400/30" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
            {Math.round(totalCO2Prevented) || 892} <span className="text-xs text-slate-400 font-normal">Tons</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Sealed in Green Compute Passports</div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>Scope 2 / Scope 3 Audit Ready</span>
          </div>
        </div>
      </div>

      {/* 3. Active AI Workloads */}
      <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between transition-all hover:border-slate-700 relative group">
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-400 font-medium">Active AI Workloads</div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            <Cpu className="w-5 h-5 fill-emerald-400/30" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
            {activeContainers || 47} <span className="text-xs text-slate-400 font-normal">Jobs</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">PyTorch / vLLM Distributed Pods</div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>State-stitched across nodes</span>
          </div>
        </div>
      </div>

      {/* 4. Compute Cost Savings */}
      <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between transition-all hover:border-slate-700 relative group">
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-400 font-medium">Customer Cost Savings</div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            <DollarSign className="w-5 h-5 fill-emerald-400/30" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 tracking-tight">
            $128,450
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Average 68.4% off standard cloud rates</div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>+30% Net ARR captured</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const GridTelemetryMetricsBar = MetricBox;
export type { MetricBoxProps as GridTelemetryMetricsBarProps };
