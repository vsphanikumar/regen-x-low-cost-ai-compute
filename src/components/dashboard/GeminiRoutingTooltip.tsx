import React from 'react';
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Cpu,
  Brain,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';

export type GeminiRoutingStatus = 'Green-Flow Optimized' | 'Standard Grid' | 'Adaptive Modulated Flow';

export interface GeminiRoutingDetails {
  status: GeminiRoutingStatus;
  statusBadgeColor: string;
  actionDecision: 'SCALE_MAX_SPONGE' | 'MODULATE_GPU_POWER_THROTTLE' | 'ACTIVATE_HYBRID_BASELINE_SLA';
  modelEngine: string;
  reasoning: string;
  dataSovereignty: string;
  confidenceScore: number;
  carbonScore: 'A+' | 'A' | 'B';
  estimatedCostReductionPct: number;
}

export function computeGeminiRoutingLogic(node: {
  id: string;
  name: string;
  spotPrice: number;
  surplusMW: number;
  type: string;
  hardwareStatus?: string;
  activeContainers?: number;
}): GeminiRoutingDetails {
  const isFault = node.hardwareStatus === 'FAULT';
  const isDraining = node.hardwareStatus === 'DRAINING';

  if (isFault) {
    return {
      status: 'Standard Grid',
      statusBadgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      actionDecision: 'ACTIVATE_HYBRID_BASELINE_SLA',
      modelEngine: 'Gemini 3.8 Flash Governor',
      reasoning:
        'Hardware substation anomaly detected. Gemini Governor autonomously triggered fallback to standard grid baseline SLA to prevent workload stall.',
      dataSovereignty: 'ISOLATED_FAILOVER_ZONE',
      confidenceScore: 0.99,
      carbonScore: 'B',
      estimatedCostReductionPct: 0,
    };
  }

  if (isDraining) {
    return {
      status: 'Adaptive Modulated Flow',
      statusBadgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      actionDecision: 'MODULATE_GPU_POWER_THROTTLE',
      modelEngine: 'Gemini 3.8 Flash Governor',
      reasoning:
        'Thermal container drain sequence underway. Gemini Governor throttles GPU power envelope to 65% TDP while migrating weights to cool nodes.',
      dataSovereignty: node.id.startsWith('IND')
        ? 'PASSED_DOMESTIC_BOUNDARY (DPDPA)'
        : 'PASSED_GLOBAL_FLUID',
      confidenceScore: 0.96,
      carbonScore: 'A',
      estimatedCostReductionPct: 28,
    };
  }

  // Spot price is negative -> prime clean energy arbitrage!
  if (node.spotPrice <= 0) {
    const isMajorSurplus = node.surplusMW >= 180;
    return {
      status: 'Green-Flow Optimized',
      statusBadgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]',
      actionDecision: 'SCALE_MAX_SPONGE',
      modelEngine: 'Gemini 3.8 Flash Governor',
      reasoning: `Negative electricity price ($${node.spotPrice.toFixed(
        2
      )}/MWh) & clean ${node.type.toLowerCase()} surge (${node.surplusMW} MW). Gemini Governor routes max batch compute to absorb stranded power at zero emissions.`,
      dataSovereignty: node.id.startsWith('IND')
        ? 'PASSED_DOMESTIC_BOUNDARY (DPDPA)'
        : 'PASSED_SOVEREIGN_FLUID',
      confidenceScore: isMajorSurplus ? 0.99 : 0.97,
      carbonScore: 'A+',
      estimatedCostReductionPct: Math.round(70 + Math.abs(node.spotPrice) * 8),
    };
  }

  // Mild positive price ($0 to $4/MWh)
  if (node.spotPrice <= 4.0) {
    return {
      status: 'Adaptive Modulated Flow',
      statusBadgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      actionDecision: 'MODULATE_GPU_POWER_THROTTLE',
      modelEngine: 'Gemini 3.8 Flash Governor',
      reasoning: `Spot tariff slightly positive ($${node.spotPrice.toFixed(
        2
      )}/MWh). Gemini Governor modulates GPU clocks to prioritize compute efficiency until next renewable surge window.`,
      dataSovereignty: node.id.startsWith('IND')
        ? 'PASSED_DOMESTIC_BOUNDARY'
        : 'PASSED_GLOBAL_FLUID',
      confidenceScore: 0.94,
      carbonScore: 'A',
      estimatedCostReductionPct: 42,
    };
  }

  // High standard grid pricing
  return {
    status: 'Standard Grid',
    statusBadgeColor: 'bg-slate-700/40 text-slate-300 border-slate-600',
    actionDecision: 'ACTIVATE_HYBRID_BASELINE_SLA',
    modelEngine: 'Gemini 3.8 Flash Governor',
    reasoning: `Elevated market tariff ($${node.spotPrice.toFixed(
      2
    )}/MWh). Gemini Governor maintains standard SLA baseline, postponing non-urgent batch token workloads for negative arbitrage hours.`,
    dataSovereignty: 'PASSED_BASELINE_COMPLIANCE',
    confidenceScore: 0.96,
    carbonScore: 'A',
    estimatedCostReductionPct: 15,
  };
}

interface GeminiRoutingNodeCardProps {
  node: {
    id: string;
    name: string;
    region: string;
    country: string;
    type: string;
    spotPrice: number;
    surplusMW: number;
    activeContainers?: number;
    hardwareStatus?: string;
    ippSupplier?: string;
    cercClassification?: string;
  };
}

/**
 * Floating tooltip rendered at the node coordinates or in the HUD
 */
export const GeminiRoutingTooltipCard: React.FC<GeminiRoutingNodeCardProps> = ({ node }) => {
  const routing = computeGeminiRoutingLogic(node);
  const isGreenOptimized = routing.status === 'Green-Flow Optimized';

  return (
    <div className="bg-[#070d18]/95 border border-emerald-500/40 rounded-xl p-3.5 shadow-2xl backdrop-blur-xl text-xs font-mono w-[300px] sm:w-[330px] pointer-events-none select-none transition-all duration-200">
      {/* Header with Gemini Model Engine indicator */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5 font-bold text-white">
          <div className="w-5 h-5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <div className="text-[11px] leading-tight text-white font-sans font-bold flex items-center gap-1">
              <span>{node.name}</span>
              <span className="text-[10px] text-slate-400 font-mono">({node.country})</span>
            </div>
            <div className="text-[9.5px] text-emerald-400 font-mono flex items-center gap-1">
              <span>{routing.modelEngine}</span>
            </div>
          </div>
        </div>

        {/* Status Badge ('Green-Flow Optimized' vs 'Standard Grid') */}
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${routing.statusBadgeColor} flex items-center gap-1 whitespace-nowrap`}
        >
          {isGreenOptimized ? (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          )}
          {routing.status}
        </span>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-2 text-[10.5px] mb-2.5">
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-1.5">
          <div className="text-slate-400 text-[9.5px]">Autonomous Decision</div>
          <div className="text-emerald-400 font-bold font-mono text-[10px] truncate">
            {routing.actionDecision}
          </div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-1.5">
          <div className="text-slate-400 text-[9.5px]">Spot Tariff vs Baseline</div>
          <div
            className={`font-bold font-mono text-[10.5px] ${
              node.spotPrice <= 0 ? 'text-emerald-400' : 'text-slate-200'
            }`}
          >
            ${node.spotPrice.toFixed(2)}/MWh ({routing.estimatedCostReductionPct}% off)
          </div>
        </div>
      </div>

      {/* Domestic Indian IPP & CERC Carrier Indicator (if applicable) */}
      {(node.ippSupplier || node.cercClassification) && (
        <div className="bg-slate-900/90 border border-amber-500/20 rounded-lg p-1.5 mb-2 text-[9.5px] space-y-0.5">
          {node.ippSupplier && (
            <div className="text-slate-200 flex items-center justify-between">
              <span className="text-slate-400">IPP Supplier:</span>
              <span className="text-amber-300 font-bold truncate max-w-[190px]">{node.ippSupplier}</span>
            </div>
          )}
          {node.cercClassification && (
            <div className="text-[9px] text-emerald-400/90 font-mono flex items-center gap-1">
              <span>⚖️ CERC Public Common Carrier</span>
            </div>
          )}
        </div>
      )}

      {/* Gemini AI Rationale Box */}
      <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-lg p-2 mb-2 text-[10.5px] text-slate-300 leading-relaxed font-sans">
        <div className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider mb-0.5 flex items-center gap-1">
          <Brain className="w-3 h-3 text-emerald-400" />
          <span>Gemini Autonomous Routing Logic</span>
        </div>
        <p className="text-slate-300 text-[10px]">{routing.reasoning}</p>
      </div>

      {/* Footer Info: Sovereign Data Residency and Energy Profile */}
      <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/80 text-[9.5px] text-slate-400">
        <div className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>{routing.dataSovereignty}</span>
        </div>
        <div className="flex items-center gap-1 font-mono">
          <span className="text-emerald-400 font-bold">{node.surplusMW} MW</span>
          <span>{node.type}</span>
        </div>
      </div>
    </div>
  );
};
