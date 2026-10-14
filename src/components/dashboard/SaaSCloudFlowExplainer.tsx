import React, { useState } from 'react';
import {
  Cloud,
  Cpu,
  Server,
  RefreshCw,
  Play,
  Radio,
} from 'lucide-react';
import { GridNode, ComputeJob, GreenComputePassport } from '../../types';

interface SaaSCloudFlowExplainerProps {
  selectedNode: GridNode;
  selectedJobId: string;
  jobs: ComputeJob[];
  totalCO2Prevented: number;
  onExecuteLiveTrace: () => Promise<void>;
  isExecuting: boolean;
  lastPassport?: GreenComputePassport;
}

export const SaaSCloudFlowExplainer: React.FC<SaaSCloudFlowExplainerProps> = ({
  selectedNode,
  selectedJobId,
  jobs,
  totalCO2Prevented,
  onExecuteLiveTrace,
  isExecuting,
  lastPassport,
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'diagram' | 'payload' | 'frontend_fetch'>('diagram');

  const currentJob = jobs.find((j) => j.jobId === selectedJobId) || jobs[0];

  const requestPayload = {
    method: 'POST',
    endpoint: '/v1/orchestrate',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
      'X-SaaS-Tenant-ID': currentJob?.clientOwner || 'AlphaLabs-AI',
    },
    body: {
      region_id: selectedNode.id,
      target_job_id: currentJob?.jobId || selectedJobId,
      sla_is_urgent: currentJob?.slaUrgent || false,
      data_residency_restriction: currentJob?.dataResidency || 'DOMESTIC_ONLY',
    },
  };

  const liveTelemetryPayload = {
    method: 'GET',
    endpoint: '/v1/grid/telemetry',
    polling_frequency: 'Every 3000ms (3s Interval)',
    status: '200 OK (Sub-50ms Latency)',
    response_body: {
      active_regions: [
        {
          id: selectedNode.id,
          name: selectedNode.name,
          spot_price_per_mwh: selectedNode.spotPricePerMWh,
          curtailment_mwh: selectedNode.curtailmentMWh,
          available_power_mwh: selectedNode.availablePowerMWh,
          hardware_status: selectedNode.hardwareStatus,
          active_containers: selectedNode.activeContainers,
        },
      ],
      cumulative_co2_prevented: totalCO2Prevented,
      timestamp: new Date().toISOString(),
    },
  };

  return (
    <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl p-5 shadow-2xl space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-sky-500/15 text-sky-400 border border-sky-500/30">
              <Cloud className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-white">
              SaaS Cloud Data Flow &amp; Live Payload Architecture
            </h3>
            <span className="text-[10px] font-mono bg-slate-950 px-2 py-0.5 rounded text-emerald-400 border border-slate-800">
              Interactive Flow
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            See exactly how AI workloads enter the system, how JSON payloads transfer across the REST gateway, and how the React frontend continuously polls live energy telemetry.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs shrink-0">
          <button
            onClick={() => setActiveTab('diagram')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'diagram'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            5-Step Pipeline
          </button>
          <button
            onClick={() => setActiveTab('payload')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'payload'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Payload Inspector
          </button>
          <button
            onClick={() => setActiveTab('frontend_fetch')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'frontend_fetch'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Frontend Polling
          </button>
        </div>
      </div>

      {/* 5-Step Visual Cloud Pipeline */}
      {activeTab === 'diagram' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
            <div
              onClick={() => setActiveStep(1)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                activeStep === 1
                  ? 'bg-sky-950/40 border-sky-500 text-sky-200 shadow-lg ring-1 ring-sky-500/30'
                  : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-bold text-sky-400">STEP 1</span>
                  <Cloud className="w-3.5 h-3.5 text-sky-400" />
                </div>
                <div className="font-bold text-slate-100 text-xs">SaaS Entry Point</div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Client submits AI training job via REST API or Developer SDK.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 font-mono text-[10px] text-slate-400">
                POST /v1/jobs
              </div>
            </div>

            <div
              onClick={() => setActiveStep(2)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                activeStep === 2
                  ? 'bg-amber-950/40 border-amber-500 text-amber-200 shadow-lg ring-1 ring-amber-500/30'
                  : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-bold text-amber-400">STEP 2</span>
                  <Radio className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="font-bold text-slate-100 text-xs">Payload Transfer</div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  JSON payload passed to Gateway with sovereignty &amp; SLA flags.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 font-mono text-[10px] text-slate-400">
                POST /v1/orchestrate
              </div>
            </div>

            <div
              onClick={() => setActiveStep(3)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                activeStep === 3
                  ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200 shadow-lg ring-1 ring-emerald-500/30'
                  : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-bold text-emerald-400">STEP 3</span>
                  <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="font-bold text-slate-100 text-xs">Vertex AI Governor</div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Gemini 3.8 Flash assesses negative pricing curve &amp; boundary limits.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 font-mono text-[10px] text-slate-400">
                GenAI SDK Loop
              </div>
            </div>

            <div
              onClick={() => setActiveStep(4)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                activeStep === 4
                  ? 'bg-purple-950/40 border-purple-500 text-purple-200 shadow-lg ring-1 ring-purple-500/30'
                  : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-bold text-purple-400">STEP 4</span>
                  <Server className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <div className="font-bold text-slate-100 text-xs">Compute &amp; Ledger</div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Scales Cloud Run v2 containers; mints SHA-256 Green Passport.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 font-mono text-[10px] text-slate-400">
                Cloud Run + BigQuery
              </div>
            </div>

            <div
              onClick={() => setActiveStep(5)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                activeStep === 5
                  ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200 shadow-lg ring-1 ring-cyan-500/30'
                  : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-bold text-cyan-400">STEP 5</span>
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="font-bold text-slate-100 text-xs">Live Frontend Sync</div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  React app polls real-time telemetry every 3s to update map and charts.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 font-mono text-[10px] text-slate-400">
                GET /v1/grid/telemetry
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
            <span className="text-slate-400">
              Selected step: <strong className="text-white">Step {activeStep}</strong>
            </span>
            <button
              onClick={onExecuteLiveTrace}
              disabled={isExecuting}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 rounded-xl transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isExecuting ? 'Executing Live Trace...' : 'Trigger Live Pipeline Trace'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Payload Inspector */}
      {activeTab === 'payload' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="text-sky-400 font-bold font-mono text-xs pb-1 border-b border-slate-800">
              1. Outbound Request (Client → SaaS Gateway)
            </div>
            <pre className="bg-[#020617] p-3 rounded-lg border border-slate-800/80 font-mono text-[11px] text-sky-300 overflow-x-auto max-h-64 leading-relaxed">
              {JSON.stringify(requestPayload, null, 2)}
            </pre>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="text-emerald-400 font-bold font-mono text-xs pb-1 border-b border-slate-800">
              2. Inbound Response (Gemini 3.8 Flash Output)
            </div>
            <pre className="bg-[#020617] p-3 rounded-lg border border-slate-800/80 font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-64 leading-relaxed">
              {JSON.stringify(
                {
                  status: 'Multi-Agent Optimization Sequence Verified',
                  gemini_structured_output: {
                    validated_target_region: selectedNode.id,
                    routing_action_decision: selectedNode.spotPricePerMWh <= 0 ? 'SCALE_MAX_SPONGE' : 'MODULATE_GPU_POWER_THROTTLE',
                    decision_confidence_score: 0.98,
                    data_sovereignty_signature: currentJob?.dataResidency === 'DOMESTIC_ONLY' ? 'PASSED_DOMESTIC_BOUNDARY' : 'PASSED_GLOBAL_FLUID',
                    spot_market_price_per_mwh: selectedNode.spotPricePerMWh,
                    verified_stranded_power_mwh: selectedNode.curtailmentMWh,
                  },
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      )}

      {/* Frontend Polling */}
      {activeTab === 'frontend_fetch' && (
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
              <h4 className="font-bold text-slate-100 text-sm">
                Frontend Live Telemetry Polling Stream (`/v1/grid/telemetry`)
              </h4>
            </div>
            <span className="font-mono text-cyan-400 text-xs bg-cyan-950/40 px-2.5 py-0.5 rounded border border-cyan-500/30">
              3000ms Interval
            </span>
          </div>
          <pre className="bg-[#020617] p-3.5 rounded-lg border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto max-h-64 leading-relaxed">
            {JSON.stringify(liveTelemetryPayload, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
