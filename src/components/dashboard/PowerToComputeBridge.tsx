import React, { useState } from 'react';
import {
  Zap,
  Sun,
  Wind,
  Cpu,
  Server,
  AlertTriangle,
  CheckCircle2,
  Lock,
  FileCheck,
  Activity,
} from 'lucide-react';
import { GridNode, ComputeJob } from '../../types';

interface PowerToComputeBridgeProps {
  nodes: GridNode[];
  selectedNode: GridNode;
  selectedJob: ComputeJob;
  onSelectNode: (nodeId: string) => void;
  onExecuteDecision: (overrideAction?: string) => Promise<void>;
  isExecuting: boolean;
}

export const PowerToComputeBridge: React.FC<PowerToComputeBridgeProps> = ({
  nodes,
  selectedNode,
  selectedJob,
  onSelectNode,
  onExecuteDecision,
  isExecuting,
}) => {
  const [activeScenario, setActiveScenario] = useState<'SURGE' | 'SHADOW' | 'DOMESTIC'>('SURGE');
  const [sourcePowerMW, setSourcePowerMW] = useState<number>(selectedNode.curtailmentMWh);
  const [simulatedTariff, setSimulatedTariff] = useState<number>(selectedNode.spotPricePerMWh);

  const isNegativeTariff = simulatedTariff <= 0;
  const gridTransmissionCapacityMW = 80;
  const strandedSurplusMW = Math.max(0, sourcePowerMW - gridTransmissionCapacityMW);
  const aiGpuWattsPerCard = 700;
  const activeGpuCount = selectedJob.gpusRequested || 64;
  const aiPowerDrawKW = (activeGpuCount * aiGpuWattsPerCard) / 1000;
  const containerSpongeCount = isNegativeTariff ? Math.min(128, Math.round(sourcePowerMW * 0.45)) : 24;

  const agentDecision = isNegativeTariff
    ? 'SCALE_MAX_SPONGE'
    : simulatedTariff < 5
    ? 'MODULATE_GPU_POWER_THROTTLE'
    : 'ACTIVATE_HYBRID_BASELINE_SLA';

  const sovereigntyStatus = selectedJob.dataResidency === 'DOMESTIC_ONLY'
    ? 'PASSED_DOMESTIC_BOUNDARY (DPDPA Subnet Locked)'
    : 'PASSED_GLOBAL_FLUID (Multi-Region Allowed)';

  const handleScenarioChange = (scenario: 'SURGE' | 'SHADOW' | 'DOMESTIC') => {
    setActiveScenario(scenario);
    if (scenario === 'SURGE') {
      setSourcePowerMW(240);
      setSimulatedTariff(-2.85);
    } else if (scenario === 'SHADOW') {
      setSourcePowerMW(65);
      setSimulatedTariff(3.40);
    } else if (scenario === 'DOMESTIC') {
      setSourcePowerMW(190);
      setSimulatedTariff(-1.60);
    }
  };

  return (
    <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Title */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Zap className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-white">
              Agentic Clean Energy-to-AI Compute Transfer Bridge
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
            When grid transmission lines saturate, REGEN-X treats <strong className="text-emerald-400">AI compute as a thermodynamic energy sponge</strong>, autonomously routing flexible batch jobs directly behind-the-meter.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Power Source:</span>
          <select
            value={selectedNode.id}
            onChange={(e) => onSelectNode(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:border-emerald-500 focus:outline-none cursor-pointer"
          >
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name} ({n.energyType})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Scenario Triggers */}
      <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
          Simulate Source Weather Event &amp; Watch Gemini Decide:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleScenarioChange('SURGE')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeScenario === 'SURGE'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span>Renewable Surplus (240 MW · -$2.85)</span>
          </button>
          <button
            onClick={() => handleScenarioChange('SHADOW')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeScenario === 'SHADOW'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span>Passing Cloud Shadow (65 MW · +$3.40)</span>
          </button>
          <button
            onClick={() => handleScenarioChange('DOMESTIC')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeScenario === 'DOMESTIC'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-xs'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span>India DPDPA In-Country Lock</span>
          </button>
        </div>
      </div>

      {/* Tri-Pane Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        {/* Pane 1 */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 shadow-lg">
          <div>
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                {selectedNode.energyType === 'SOLAR' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Wind className="w-4 h-4 text-sky-400" />
                )}
                <span className="font-bold text-slate-100 text-sm">
                  1. Generation Source Physics
                </span>
              </div>
              <span className="font-mono text-[10px] text-emerald-400 uppercase font-semibold">
                Substation
              </span>
            </div>
            <div className="space-y-3 font-mono text-[11px]">
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Physical Origin:</span>
                  <span className="text-white font-bold">{selectedNode.name}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Clean Generation:</span>
                  <span className="text-emerald-400 font-bold">{sourcePowerMW} MW</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Transmission Cap:</span>
                  <span className="text-slate-300">{gridTransmissionCapacityMW} MW (Congested)</span>
                </div>
                <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                  <span className="text-amber-400 font-semibold">Surplus Energy:</span>
                  <span className="text-amber-400 font-bold">{strandedSurplusMW} MW</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Energy Cost:</span>
                  <span className={isNegativeTariff ? 'text-emerald-400 font-bold' : 'text-slate-200 font-bold'}>
                    ${simulatedTariff.toFixed(2)} / MWh
                  </span>
                </div>
              </div>

              <div className={`p-2.5 rounded-lg border text-[11px] ${
                isNegativeTariff
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-950/30 border-amber-500/40 text-amber-300'
              }`}>
                {isNegativeTariff ? (
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <strong>Surplus Paradox:</strong> Electricity is so abundant it has negative price. Must absorb immediately.
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <strong>Tariff Positive:</strong> Hardware throttle active to conserve baseline.
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="pt-2 text-[10px] text-slate-500 font-mono">
            GPS: {selectedNode.lat.toFixed(2)}° N, {selectedNode.lng.toFixed(2)}° E · {selectedNode.country}
          </div>
        </div>

        {/* Pane 2 */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-emerald-500/40 flex flex-col justify-between space-y-4 shadow-xl ring-1 ring-emerald-500/20">
          <div>
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-slate-100 text-sm">
                  2. Agentic Decision Core
                </span>
              </div>
              <span className="font-mono text-[10px] bg-emerald-950 px-2 py-0.5 rounded text-emerald-300 border border-emerald-500/30">
                Gemini 3.8 Flash
              </span>
            </div>
            <div className="space-y-3 font-mono text-[11px]">
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold block mb-1">
                  AGENT 1 (SENSORY INGESTION):
                </span>
                <div className="text-slate-300">
                  Detected {strandedSurplusMW} MW clean surplus. Negative tariff verified.
                </div>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-emerald-400 font-bold block mb-1">
                  AGENT 2 (INFRASTRUCTURE GOVERNOR):
                </span>
                <div className="text-slate-200 font-bold text-xs">
                  Action: <span className="text-emerald-400">[{agentDecision}]</span>
                </div>
                <div className="text-slate-400 text-[10px] mt-1">
                  Confidence Score: <strong className="text-white">0.98</strong> · Structured Output
                </div>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-sky-400 font-bold block mb-1">
                  JURISDICTIONAL BOUNDARY CHECK:
                </span>
                <div className="text-emerald-300 flex items-center gap-1 text-[10px]">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>{sovereigntyStatus}</span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => onExecuteDecision()}
            disabled={isExecuting}
            className="w-full py-2.5 px-3 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-98 disabled:opacity-50 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Activity className={`w-3.5 h-3.5 ${isExecuting ? 'animate-spin' : ''}`} />
            <span>{isExecuting ? 'Dispatching...' : 'Trigger Multi-Agent Decision'}</span>
          </button>
        </div>

        {/* Pane 3 */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 shadow-lg">
          <div>
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-sky-400" />
                <span className="font-bold text-slate-100 text-sm">
                  3. AI Compute Target Footprint
                </span>
              </div>
              <span className="font-mono text-[10px] text-sky-400 uppercase font-semibold">
                Clean Sponge
              </span>
            </div>
            <div className="space-y-3 font-mono text-[11px]">
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Workload Target:</span>
                  <span className="text-white font-bold">{selectedJob.jobId}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Client Owner:</span>
                  <span className="text-slate-200">{selectedJob.clientOwner}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Active GPUs:</span>
                  <span className="text-sky-300 font-bold">{activeGpuCount} x H100 SXM5</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Power Draw:</span>
                  <span className="text-emerald-400 font-bold">{aiPowerDrawKW.toFixed(1)} kW</span>
                </div>
                <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                  <span className="text-sky-400">Container Sponge:</span>
                  <span className="text-sky-400 font-bold">{containerSpongeCount} Instances</span>
                </div>
              </div>

              <div className="bg-purple-950/30 border border-purple-500/40 p-2.5 rounded-lg text-[10px] text-purple-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-purple-200">
                  <FileCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>Green Compute Passport Output</span>
                </div>
                <div>
                  SHA-256 Cryptographic Lock registered to BigQuery.
                </div>
              </div>
            </div>
          </div>
          <div className="pt-2 text-[10px] text-slate-500 font-mono">
            Zero Grid Fossil Fuel Used · 100% Clean Absorption
          </div>
        </div>
      </div>
    </div>
  );
};
