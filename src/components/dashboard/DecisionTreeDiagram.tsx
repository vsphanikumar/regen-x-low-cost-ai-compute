import React, { useState, useMemo } from 'react';
import {
  GitBranch,
  DollarSign,
  Zap,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Sparkles,
  Scale,
  Cpu,
  Info,
  Check,
  ArrowRight,
} from 'lucide-react';
import { GridNode, ComputeJob } from '../../types';

interface DecisionTreeDiagramProps {
  selectedNode: GridNode;
  selectedJob: ComputeJob;
  allNodes?: GridNode[];
  onSelectNode?: (nodeId: string) => void;
  onExecuteArbitrage?: () => Promise<void>;
  isExecuting?: boolean;
}

interface NodeEvaluation {
  node: GridNode;
  pricePassed: boolean;
  priceReason: string;
  priceScore: number;
  curtailmentPassed: boolean;
  curtailmentDeltaMWh: number;
  curtailmentReason: string;
  curtailmentScore: number;
  slaPassed: boolean;
  slaReason: string;
  slaScore: number;
  residencyPassed: boolean;
  residencyReason: string;
  compositeScore: number;
  isWinner: boolean;
  prunedStage: 'GATE_1_PRICE' | 'GATE_2_CURTAILMENT' | 'GATE_3_SLA_RESIDENCY' | 'NONE';
}

export const DecisionTreeDiagram: React.FC<DecisionTreeDiagramProps> = ({
  selectedNode,
  selectedJob,
  allNodes = [],
  onSelectNode,
  onExecuteArbitrage,
  isExecuting = false,
}) => {
  const [simUrgent, setSimUrgent] = useState<boolean>(selectedJob.slaUrgent);
  const [simResidency, setSimResidency] = useState<string>(selectedJob.dataResidency);
  const [workloadDurationHours, setWorkloadDurationHours] = useState<number>(4);
  const [activeInspectorNodeId, setActiveInspectorNodeId] = useState<string>(selectedNode.id);
  const [selectedGateFilter, setSelectedGateFilter] = useState<'ALL' | 'PRICE' | 'CURTAILMENT' | 'SLA'>('ALL');

  const powerDemandMWh = useMemo(() => {
    const hourlyMWh = (selectedJob.gpusRequested * 0.7) / 1000;
    return hourlyMWh * workloadDurationHours;
  }, [selectedJob.gpusRequested, workloadDurationHours]);

  const candidates: GridNode[] = useMemo(() => {
    if (allNodes.length > 0) return allNodes;
    return [selectedNode];
  }, [allNodes, selectedNode]);

  const evaluations: NodeEvaluation[] = useMemo(() => {
    return candidates.map((node) => {
      const isNegative = node.spotPricePerMWh <= 0;
      const isLow = node.spotPricePerMWh <= 5.0;
      let priceScore = 50;
      let pricePassed = false;
      let priceReason = '';

      if (isNegative) {
        priceScore = Math.min(100, Math.round(85 + Math.abs(node.spotPricePerMWh) * 5));
        pricePassed = true;
        priceReason = `Negative spot tariff ($${node.spotPricePerMWh.toFixed(2)}/MWh). Zero fuel cost with net credit.`;
      } else if (isLow) {
        priceScore = Math.max(20, Math.round(75 - node.spotPricePerMWh * 6));
        pricePassed = true;
        priceReason = `Low positive tariff ($${node.spotPricePerMWh.toFixed(2)}/MWh). Sub-commercial arbitrage valid.`;
      } else {
        priceScore = Math.max(5, Math.round(30 - node.spotPricePerMWh));
        pricePassed = false;
        priceReason = `Tariff ($${node.spotPricePerMWh.toFixed(2)}/MWh) exceeds arbitrage ceiling ($5.00/MWh).`;
      }

      const deltaMWh = node.curtailmentMWh - powerDemandMWh;
      const curtailmentPassed = deltaMWh >= 0;
      let curtailmentScore = 0;
      let curtailmentReason = '';

      if (deltaMWh >= 50) {
        curtailmentScore = 98;
        curtailmentReason = `Massive headroom (Δ = +${deltaMWh.toFixed(1)} MWh surplus). Zero risk of baseline brownout.`;
      } else if (deltaMWh >= 0) {
        curtailmentScore = 75;
        curtailmentReason = `Adequate headroom (Δ = +${deltaMWh.toFixed(1)} MWh). Covers batch duration.`;
      } else {
        curtailmentScore = 15;
        curtailmentReason = `Surplus deficit (Δ = ${deltaMWh.toFixed(1)} MWh). Cannot sustain ${selectedJob.gpusRequested} GPUs.`;
      }

      let slaPassed = true;
      let slaScore = 80;
      let slaReason = '';

      if (node.hardwareStatus === 'FAULT') {
        slaPassed = false;
        slaScore = 0;
        slaReason = 'Node hardware fault reported. Divert blocked.';
      } else if (simUrgent) {
        if (node.availablePowerMWh < 300) {
          slaScore = 40;
          slaPassed = false;
          slaReason = 'SLA is Urgent: Node available buffer < 300 MWh poses ramp delay.';
        } else {
          slaScore = 95;
          slaReason = 'SLA is Urgent: Node in HEALTHY status with instant container ramp capacity.';
        }
      } else {
        slaScore = 90;
        slaReason = 'SLA is Relaxed (Batch): Flexible processing window tolerates diurnal dips.';
      }

      let residencyPassed = true;
      let residencyReason = '';
      if (simResidency === 'DOMESTIC_ONLY') {
        const isDomestic = node.country.toLowerCase().includes('india') || node.id.startsWith('IND');
        if (!isDomestic) {
          residencyPassed = false;
          residencyReason = `Violates DOMESTIC_ONLY rule (located in ${node.country}). India DPDPA boundary enforced.`;
        } else {
          residencyReason = `Complies with DOMESTIC_ONLY rule (${node.country}).`;
        }
      } else {
        residencyReason = 'Complies with GLOBAL_FLUID policy.';
      }

      let prunedStage: NodeEvaluation['prunedStage'] = 'NONE';
      if (!pricePassed) {
        prunedStage = 'GATE_1_PRICE';
      } else if (!curtailmentPassed) {
        prunedStage = 'GATE_2_CURTAILMENT';
      } else if (!slaPassed || !residencyPassed) {
        prunedStage = 'GATE_3_SLA_RESIDENCY';
      }

      const penalty = (!pricePassed ? 50 : 0) + (!curtailmentPassed ? 40 : 0) + (!slaPassed || !residencyPassed ? 50 : 0);
      const compositeScore = Math.max(
        0,
        Math.round((priceScore * 0.4 + curtailmentScore * 0.35 + slaScore * 0.25) - penalty)
      );

      return {
        node,
        pricePassed,
        priceReason,
        priceScore,
        curtailmentPassed,
        curtailmentDeltaMWh: deltaMWh,
        curtailmentReason,
        curtailmentScore,
        slaPassed: slaPassed && residencyPassed,
        slaReason: !residencyPassed ? residencyReason : slaReason,
        slaScore: !residencyPassed ? 10 : slaScore,
        residencyPassed,
        residencyReason,
        compositeScore,
        isWinner: node.id === selectedNode.id,
        prunedStage,
      };
    });
  }, [candidates, selectedNode.id, powerDemandMWh, simUrgent, simResidency, selectedJob.gpusRequested]);

  const winnerEval = useMemo(() => {
    return evaluations.find((e) => e.node.id === selectedNode.id) || evaluations[0];
  }, [evaluations, selectedNode.id]);

  const inspectedEval = useMemo(() => {
    return evaluations.find((e) => e.node.id === activeInspectorNodeId) || winnerEval;
  }, [evaluations, activeInspectorNodeId, winnerEval]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <GitBranch className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                AI Dispatch Decision-Tree Architecture
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  Explainable AI (XAI)
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Visualizing why Gemini chose <strong className="text-emerald-300">{selectedNode.name}</strong> over runner-up regional corridors.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs shrink-0">
            <button
              onClick={() => setSelectedGateFilter('ALL')}
              className={`px-2.5 py-1 font-medium rounded transition-colors cursor-pointer ${
                selectedGateFilter === 'ALL'
                  ? 'bg-slate-800 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Full Tree
            </button>
            <button
              onClick={() => setSelectedGateFilter('PRICE')}
              className={`px-2.5 py-1 font-medium rounded transition-colors cursor-pointer ${
                selectedGateFilter === 'PRICE'
                  ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1. Price
            </button>
            <button
              onClick={() => setSelectedGateFilter('CURTAILMENT')}
              className={`px-2.5 py-1 font-medium rounded transition-colors cursor-pointer ${
                selectedGateFilter === 'CURTAILMENT'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2. Headroom
            </button>
            <button
              onClick={() => setSelectedGateFilter('SLA')}
              className={`px-2.5 py-1 font-medium rounded transition-colors cursor-pointer ${
                selectedGateFilter === 'SLA'
                  ? 'bg-sky-500/20 text-sky-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3. SLA & Policy
            </button>
          </div>
        </div>

        {/* Sandbox Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-sky-400" /> SLA Profile:
              </span>
              <span className={`font-mono font-bold ${simUrgent ? 'text-rose-400' : 'text-emerald-400'}`}>
                {simUrgent ? 'CRITICAL' : 'BATCH'}
              </span>
            </div>
            <div className="flex items-center gap-1 pt-1">
              <button
                onClick={() => setSimUrgent(false)}
                className={`flex-1 py-1 px-2 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
                  !simUrgent
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                Batch (Flexible)
              </button>
              <button
                onClick={() => setSimUrgent(true)}
                className={`flex-1 py-1 px-2 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
                  simUrgent
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                Urgent
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Data Residency:
              </span>
              <span className="font-mono font-bold text-slate-200">
                {simResidency}
              </span>
            </div>
            <div className="flex items-center gap-1 pt-1">
              <button
                onClick={() => setSimResidency('DOMESTIC_ONLY')}
                className={`flex-1 py-1 px-2 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
                  simResidency === 'DOMESTIC_ONLY'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-bold'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                Domestic Only
              </button>
              <button
                onClick={() => setSimResidency('GLOBAL_FLUID')}
                className={`flex-1 py-1 px-2 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
                  simResidency === 'GLOBAL_FLUID'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-bold'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                Global Fluid
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1 font-medium">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Energy Demand:
              </span>
              <span className="font-mono font-bold text-amber-300">
                {powerDemandMWh.toFixed(1)} MWh ({workloadDurationHours}h run)
              </span>
            </div>
            <div className="pt-2">
              <input
                type="range"
                min="1"
                max="12"
                value={workloadDurationHours}
                onChange={(e) => setWorkloadDurationHours(Number(e.target.value))}
                className="w-full accent-amber-400 bg-slate-950 h-1.5 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Diagram */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 font-medium">
              <span>Interactive Decision Flowchart</span>
              <span>·</span>
              <span className="text-emerald-400 font-mono">Green path: Winning Route</span>
            </div>
            <span className="text-[11px] text-slate-400">
              Click any node card to inspect rationale
            </span>
          </div>

          {/* Root */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-lg bg-slate-900 border-2 border-indigo-500/40 rounded-xl p-4 shadow-lg text-xs space-y-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-0.5 bg-indigo-500/20 text-indigo-300 font-mono text-[10px] rounded-bl-lg font-bold">
                ROOT INTAKE
              </div>
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-indigo-500/20 text-indigo-400">
                  <Cpu className="w-4 h-4" />
                </span>
                <span className="font-bold text-slate-100 text-sm">
                  {selectedJob.jobId}
                </span>
                <span className="text-slate-400 text-xs">({selectedJob.clientOwner})</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 border-t border-slate-800/80 font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px]">COMPUTE</span>
                  <span className="text-slate-200 font-semibold">{selectedJob.gpusRequested} x H100</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">REQUIRED</span>
                  <span className="text-amber-400 font-semibold">{powerDemandMWh.toFixed(1)} MWh</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">SLA / RESIDENCY</span>
                  <span className="text-sky-300 font-semibold truncate block">
                    {simUrgent ? 'Urgent' : 'Batch'} · {simResidency === 'DOMESTIC_ONLY' ? 'Domestic' : 'Global'}
                  </span>
                </div>
              </div>
            </div>
            <div className="w-0.5 h-6 bg-gradient-to-b from-indigo-500 to-emerald-500 my-1" />
          </div>

          {/* Gate 1 */}
          {(selectedGateFilter === 'ALL' || selectedGateFilter === 'PRICE') && (
            <div className="space-y-3">
              <div className="bg-slate-900/90 border border-emerald-500/40 rounded-xl p-3 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-emerald-400">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[10px] font-mono">
                      1
                    </span>
                    <span>GATE 1: ENERGY PRICE FILTER</span>
                  </div>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                    Rule: Spot Price &le; $0.00 / MWh
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2">
                  {evaluations.map((ev) => (
                    <button
                      key={`g1-${ev.node.id}`}
                      onClick={() => setActiveInspectorNodeId(ev.node.id)}
                      className={`text-left p-2.5 rounded-lg border transition-all text-[11px] cursor-pointer ${
                        activeInspectorNodeId === ev.node.id
                          ? 'ring-2 ring-emerald-400 bg-slate-800'
                          : 'bg-slate-950 hover:bg-slate-900'
                      } ${
                        ev.pricePassed
                          ? 'border-emerald-500/40 text-slate-200'
                          : 'border-rose-900/60 text-slate-500 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold truncate text-slate-100">{ev.node.name}</span>
                        {ev.pricePassed ? (
                          <span className="text-emerald-400 flex items-center gap-0.5 text-[10px] font-mono">
                            <Check className="w-3 h-3" /> PASS
                          </span>
                        ) : (
                          <span className="text-rose-400 flex items-center gap-0.5 text-[10px] font-mono">
                            <XCircle className="w-3 h-3" /> PRUNED
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between font-mono text-[10px]">
                        <span className="text-slate-400">Spot Tariff:</span>
                        <strong className={ev.node.spotPricePerMWh <= 0 ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                          ${ev.node.spotPricePerMWh.toFixed(2)}/MWh
                        </strong>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-center my-1">
                <div className="w-0.5 h-6 bg-gradient-to-b from-emerald-500 to-amber-500" />
              </div>
            </div>
          )}

          {/* Gate 2 */}
          {(selectedGateFilter === 'ALL' || selectedGateFilter === 'CURTAILMENT') && (
            <div className="space-y-3">
              <div className="bg-slate-900/90 border border-amber-500/40 rounded-xl p-3 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-amber-400">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-[10px] font-mono">
                      2
                    </span>
                    <span>GATE 2: SURPLUS HEADROOM CHECK</span>
                  </div>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30">
                    Rule: Surplus &Delta; &ge; 0 MWh
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2">
                  {evaluations.map((ev) => (
                    <button
                      key={`g2-${ev.node.id}`}
                      onClick={() => setActiveInspectorNodeId(ev.node.id)}
                      className={`text-left p-2.5 rounded-lg border transition-all text-[11px] cursor-pointer ${
                        activeInspectorNodeId === ev.node.id
                          ? 'ring-2 ring-amber-400 bg-slate-800'
                          : 'bg-slate-950 hover:bg-slate-900'
                      } ${
                        ev.curtailmentPassed
                          ? 'border-amber-500/40 text-slate-200'
                          : 'border-rose-900/60 text-slate-500 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold truncate text-slate-100">{ev.node.name}</span>
                        {ev.curtailmentPassed ? (
                          <span className="text-amber-400 flex items-center gap-0.5 text-[10px] font-mono">
                            <Check className="w-3 h-3" /> PASS
                          </span>
                        ) : (
                          <span className="text-rose-400 flex items-center gap-0.5 text-[10px] font-mono">
                            <XCircle className="w-3 h-3" /> PRUNED
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between font-mono text-[10px]">
                        <span className="text-slate-400">Headroom &Delta;:</span>
                        <strong className={ev.curtailmentDeltaMWh >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {ev.curtailmentDeltaMWh >= 0 ? `+${ev.curtailmentDeltaMWh.toFixed(1)}` : ev.curtailmentDeltaMWh.toFixed(1)} MWh
                        </strong>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-center my-1">
                <div className="w-0.5 h-6 bg-gradient-to-b from-amber-500 to-sky-500" />
              </div>
            </div>
          )}

          {/* Gate 3 */}
          {(selectedGateFilter === 'ALL' || selectedGateFilter === 'SLA') && (
            <div className="space-y-3">
              <div className="bg-slate-900/90 border border-sky-500/40 rounded-xl p-3 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sky-400">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-[10px] font-mono">
                      3
                    </span>
                    <span>GATE 3: SLA URGENCY &amp; DATA RESIDENCY</span>
                  </div>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-500/30">
                    Rule: In-Country Sovereignty Lock
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2">
                  {evaluations.map((ev) => (
                    <button
                      key={`g3-${ev.node.id}`}
                      onClick={() => setActiveInspectorNodeId(ev.node.id)}
                      className={`text-left p-2.5 rounded-lg border transition-all text-[11px] cursor-pointer ${
                        activeInspectorNodeId === ev.node.id
                          ? 'ring-2 ring-sky-400 bg-slate-800'
                          : 'bg-slate-950 hover:bg-slate-900'
                      } ${
                        ev.slaPassed && ev.residencyPassed
                          ? 'border-sky-500/40 text-slate-200'
                          : 'border-rose-900/60 text-slate-500 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold truncate text-slate-100">{ev.node.name}</span>
                        {ev.slaPassed && ev.residencyPassed ? (
                          <span className="text-sky-400 flex items-center gap-0.5 text-[10px] font-mono">
                            <Check className="w-3 h-3" /> PASS
                          </span>
                        ) : (
                          <span className="text-rose-400 flex items-center gap-0.5 text-[10px] font-mono">
                            <XCircle className="w-3 h-3" /> PRUNED
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between font-mono text-[10px]">
                        <span className="text-slate-400">Jurisdiction:</span>
                        <span className="text-slate-300">{ev.node.country}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-center my-1">
                <div className="w-0.5 h-6 bg-gradient-to-b from-sky-500 to-emerald-400" />
              </div>
            </div>
          )}

          {/* Winner Leaf */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border-2 border-emerald-400 rounded-xl p-4 shadow-2xl text-xs space-y-3 relative overflow-hidden ring-1 ring-emerald-500/40">
              <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-500 text-slate-950 font-mono text-[11px] font-bold rounded-bl-lg flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                SELECTED ROUTE WINNER
              </div>
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <CheckCircle2 className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    {winnerEval.node.name}
                    <span className="text-xs font-mono text-emerald-300 font-normal">
                      ({winnerEval.node.region})
                    </span>
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-300">
                    <span>{winnerEval.node.energyType} Source</span>
                    <span>·</span>
                    <span className="text-emerald-400 font-bold font-mono">
                      ${winnerEval.node.spotPricePerMWh.toFixed(2)}/MWh
                    </span>
                    <span>·</span>
                    <span className="text-amber-300 font-bold font-mono">
                      Δ = +{winnerEval.curtailmentDeltaMWh.toFixed(1)} MWh
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-center font-mono">
                <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">PRICE SCORE</span>
                  <span className="text-emerald-400 font-bold text-xs">{winnerEval.priceScore}/100</span>
                </div>
                <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">HEADROOM</span>
                  <span className="text-amber-400 font-bold text-xs">{winnerEval.curtailmentScore}/100</span>
                </div>
                <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">SLA MATCH</span>
                  <span className="text-sky-400 font-bold text-xs">{winnerEval.slaScore}/100</span>
                </div>
                <div className="bg-slate-950/60 p-2 rounded border border-emerald-500/40 bg-emerald-950/30">
                  <span className="text-[10px] text-emerald-300 block font-semibold">TOTAL COMPOSITE</span>
                  <span className="text-emerald-300 font-bold text-xs">{winnerEval.compositeScore}/100</span>
                </div>
              </div>

              {onExecuteArbitrage && (
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Dispatched Action: <strong className="text-emerald-300 font-mono">SCALE_MAX_SPONGE</strong>
                  </span>
                  <button
                    onClick={onExecuteArbitrage}
                    disabled={isExecuting}
                    className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
                  >
                    <span>{isExecuting ? 'Diverting Power...' : 'Confirm & Divert Power'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Detailed Node Inspector */}
        <div className="xl:col-span-4 bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-slate-800 text-slate-300">
                <Info className="w-4 h-4" />
              </span>
              <h4 className="text-xs font-bold text-slate-200">
                Decision Inspector
              </h4>
            </div>
            {inspectedEval.isWinner ? (
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/40">
                ACTIVE WINNER
              </span>
            ) : (
              <button
                onClick={() => onSelectNode?.(inspectedEval.node.id)}
                className="text-[10px] font-mono text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/40 hover:bg-amber-900 transition-colors cursor-pointer"
              >
                Switch to this Node
              </button>
            )}
          </div>

          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1">
            <div className="text-sm font-bold text-white">{inspectedEval.node.name}</div>
            <div className="text-xs text-slate-400">{inspectedEval.node.region}</div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-300 pt-1">
              <span>Jurisdiction: {inspectedEval.node.country}</span>
              <span>·</span>
              <span>Source: {inspectedEval.node.energyType}</span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className={`p-3 rounded-lg border space-y-1.5 ${
              inspectedEval.pricePassed
                ? 'bg-emerald-950/20 border-emerald-500/30'
                : 'bg-rose-950/20 border-rose-500/30'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-slate-200">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  Factor 1: Energy Price
                </span>
                <span className={`font-mono text-[10px] font-bold ${
                  inspectedEval.pricePassed ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {inspectedEval.pricePassed ? 'PASSED' : 'PRUNED'}
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {inspectedEval.priceReason}
              </p>
            </div>

            <div className={`p-3 rounded-lg border space-y-1.5 ${
              inspectedEval.curtailmentPassed
                ? 'bg-amber-950/20 border-amber-500/30'
                : 'bg-rose-950/20 border-rose-500/30'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-slate-200">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Factor 2: Headroom
                </span>
                <span className={`font-mono text-[10px] font-bold ${
                  inspectedEval.curtailmentPassed ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {inspectedEval.curtailmentPassed ? 'PASSED' : 'PRUNED'}
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {inspectedEval.curtailmentReason}
              </p>
            </div>

            <div className={`p-3 rounded-lg border space-y-1.5 ${
              inspectedEval.slaPassed && inspectedEval.residencyPassed
                ? 'bg-sky-950/20 border-sky-500/30'
                : 'bg-rose-950/20 border-rose-500/30'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-slate-200">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  Factor 3: SLA &amp; Policy
                </span>
                <span className={`font-mono text-[10px] font-bold ${
                  inspectedEval.slaPassed && inspectedEval.residencyPassed ? 'text-sky-400' : 'text-rose-400'
                }`}>
                  {inspectedEval.slaPassed && inspectedEval.residencyPassed ? 'PASSED' : 'PRUNED'}
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {inspectedEval.slaReason}
              </p>
            </div>
          </div>

          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-2 text-xs">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-emerald-400" />
              Final Summary Rationale
            </span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              {inspectedEval.isWinner ? (
                <>
                  <strong className="text-emerald-300">{inspectedEval.node.name}</strong> was chosen as the optimal target because it offers negative spot pricing (${inspectedEval.node.spotPricePerMWh.toFixed(2)}/MWh), maintains a safe surplus delta buffer of +{inspectedEval.curtailmentDeltaMWh.toFixed(1)} MWh, and satisfies all sovereignty constraints.
                </>
              ) : (
                <>
                  <strong className="text-slate-200">{inspectedEval.node.name}</strong> was pruned at {inspectedEval.prunedStage.replace(/_/g, ' ')} due to lower composite score ({inspectedEval.compositeScore}/100) vs winner ({winnerEval.compositeScore}/100).
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
