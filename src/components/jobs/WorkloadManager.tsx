import React, { useState } from 'react';
import { ComputeJob, GridNode } from '../../types';
import { PlusCircle, Cpu, Shield, Globe, Lock, CheckCircle2, Zap, Sparkles } from 'lucide-react';

interface WorkloadManagerProps {
  jobs: ComputeJob[];
  nodes: GridNode[];
  onRegisterJob: (newJob: Partial<ComputeJob>) => Promise<void>;
  onTriggerJobArbitrage: (jobId: string, regionId: string) => Promise<void>;
  isExecuting: boolean;
  selectedNodeId?: string;
  selectedJobId?: string;
}

export const WorkloadManager: React.FC<WorkloadManagerProps> = ({
  jobs,
  nodes,
  onRegisterJob,
  onTriggerJobArbitrage,
  isExecuting,
  selectedNodeId,
  selectedJobId,
}) => {
  const [jobName, setJobName] = useState('');
  const [clientOwner, setClientOwner] = useState('AlphaLabs AI');
  const [frameworkType, setFrameworkType] = useState<ComputeJob['frameworkType']>('PYTORCH_DDP');
  const [dataResidency, setDataResidency] = useState<'DOMESTIC_ONLY' | 'GLOBAL_FLUID'>('DOMESTIC_ONLY');
  const [gpusRequested, setGpusRequested] = useState(64);
  const [slaUrgent, setSlaUrgent] = useState(false);
  const [targetRegionId, setTargetRegionId] = useState('IND-GUJ-SOLAR');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  // Template Quick Chips for realistic AI workloads
  const templates = [
    { name: 'LLAMA-3-70B-LORA', owner: 'AlphaLabs AI', framework: 'PYTORCH_DDP' as const, gpus: 128, residency: 'DOMESTIC_ONLY' as const },
    { name: 'DEEPSEEK-SYNTH-V3', owner: 'Nexus Robotics', framework: 'SYNTHETIC_DATA_GEN' as const, gpus: 64, residency: 'GLOBAL_FLUID' as const },
    { name: 'WHISPER-MULTIMODAL-3', owner: 'Veritas Audio AI', framework: 'NEMO_MEGATRON' as const, gpus: 32, residency: 'DOMESTIC_ONLY' as const },
  ];

  const applyTemplate = (tpl: typeof templates[0]) => {
    setJobName(tpl.name);
    setClientOwner(tpl.owner);
    setFrameworkType(tpl.framework);
    setGpusRequested(tpl.gpus);
    setDataResidency(tpl.residency);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobName.trim()) return;
    setIsSubmitting(true);
    await onRegisterJob({
      jobId: jobName.trim().toUpperCase().replace(/\s+/g, '-'),
      clientOwner,
      frameworkType,
      dataResidency,
      slaUrgent,
      gpusRequested,
      allocatedNodeId: targetRegionId,
    });
    setIsSubmitting(false);
    setSuccessNotice(true);
    setJobName('');
    setTimeout(() => setSuccessNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Overview */}
      <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            Compute Workload Management & Dynamic Ingestion
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Register high-density asynchronous batch jobs (LLM pretraining, synthetic datasets, media rendering) with strict jurisdictional sovereignty rules and SLA thresholds.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 text-right">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Active Jobs</div>
            <div className="text-lg font-mono font-bold text-emerald-400">{jobs.length}</div>
          </div>
          <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 text-right">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Allocated GPUs</div>
            <div className="text-lg font-mono font-bold text-sky-400">
              {jobs.reduce((s, j) => s + j.gpusRequested, 0)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workload Registration Form */}
        <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl p-5 shadow-xl h-fit">
          <h3 className="text-sm font-bold text-slate-200 pb-3 mb-4 border-b border-slate-800 flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            Ingest Computational Batch Payload
          </h3>

          {/* Quick Templates */}
          <div className="mb-4">
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" /> 1-Click Workload Presets:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {templates.map((tpl) => (
                <button
                  key={tpl.name}
                  type="button"
                  onClick={() => applyTemplate(tpl)}
                  className="px-2 py-1 rounded-lg text-[10px] font-mono font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
                >
                  {tpl.name}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1 uppercase text-[11px] tracking-wider">
                Workload Identifier / Tag
              </label>
              <input
                type="text"
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
                placeholder="e.g. LLM-FINE-TUNE-70B-EXP3"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1 uppercase text-[11px] tracking-wider">
                Corporate Client Entity
              </label>
              <input
                type="text"
                value={clientOwner}
                onChange={(e) => setClientOwner(e.target.value)}
                placeholder="e.g. AlphaLabs AI"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1 uppercase text-[11px] tracking-wider">
                Distributed Framework
              </label>
              <select
                value={frameworkType}
                onChange={(e) => setFrameworkType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs"
              >
                <option value="PYTORCH_DDP">PyTorch Distributed Elastic (DDP)</option>
                <option value="NEMO_MEGATRON">NVIDIA NeMo / Megatron-LM</option>
                <option value="SYNTHETIC_DATA_GEN">Distributed Synthetic Data Generation</option>
                <option value="MEDIA_RENDER">Blender / 3D Spatial Media Render Batch</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1 uppercase text-[11px] tracking-wider">
                Data Sovereignty & Jurisdictional Lock
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDataResidency('DOMESTIC_ONLY')}
                  className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    dataResidency === 'DOMESTIC_ONLY'
                      ? 'bg-emerald-950/30 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>DOMESTIC ONLY</span>
                  </div>
                  <span className="text-[10px] text-slate-400 leading-tight">
                    Strict In-Country Subnet (DPDPA / GDPR Lock)
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setDataResidency('GLOBAL_FLUID')}
                  className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    dataResidency === 'GLOBAL_FLUID'
                      ? 'bg-sky-950/30 border-sky-500 text-sky-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <Globe className="w-3.5 h-3.5 text-sky-400" />
                    <span>GLOBAL FLUID</span>
                  </div>
                  <span className="text-[10px] text-slate-400 leading-tight">
                    Cross-Border Egress for Lowest Tariff
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1 uppercase text-[11px] tracking-wider">
                Target Regional Corridor
              </label>
              <select
                value={targetRegionId}
                onChange={(e) => setTargetRegionId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono text-xs cursor-pointer"
              >
                {nodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.name} (${node.spotPricePerMWh.toFixed(2)}/MWh · {node.curtailmentMWh}MWh)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-400 font-semibold mb-1 text-[11px]">
                  GPU Footprint (H100)
                </label>
                <select
                  value={gpusRequested}
                  onChange={(e) => setGpusRequested(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono text-xs"
                >
                  <option value={16}>16 GPUs</option>
                  <option value={32}>32 GPUs</option>
                  <option value={64}>64 GPUs</option>
                  <option value={128}>128 GPUs</option>
                  <option value={256}>256 GPUs</option>
                </select>
              </div>
              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-medium">
                  <input
                    type="checkbox"
                    checked={slaUrgent}
                    onChange={(e) => setSlaUrgent(e.target.checked)}
                    className="accent-emerald-400 rounded"
                  />
                  <span>Strict SLA Urgency</span>
                </label>
              </div>
            </div>

            {successNotice && (
              <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/40 rounded-lg text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Workload queued for clean arbitrage!</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-98 disabled:opacity-50 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              {isSubmitting ? 'Registering...' : 'Enqueue Compute Workload'}
            </button>
          </form>
        </div>

        {/* Processing Queue & Active Job Table */}
        <div className="lg:col-span-2 bg-[#0b101d] border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-200">
                Active Compute Workload Matrix
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                Real-Time State Inventory
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                    <th className="pb-2.5 pl-2">Job Identifier</th>
                    <th className="pb-2.5">Client & Framework</th>
                    <th className="pb-2.5">Sovereignty</th>
                    <th className="pb-2.5">Hosting Node</th>
                    <th className="pb-2.5 text-right">CO₂ Saved</th>
                    <th className="pb-2.5 text-center">Status</th>
                    <th className="pb-2.5 text-right pr-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {jobs.map((job) => {
                    let statusBadge = (
                      <span className="text-emerald-400 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                        {job.status}
                      </span>
                    );
                    if (job.status === 'THROTTLED') {
                      statusBadge = (
                        <span className="text-amber-400 font-semibold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                          THROTTLED
                        </span>
                      );
                    } else if (job.status === 'PENDING') {
                      statusBadge = (
                        <span className="text-slate-400 font-semibold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          PENDING
                        </span>
                      );
                    }
                    return (
                      <tr key={job.jobId} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 pl-2 font-bold text-slate-200">
                          {job.jobId}
                          <div className="text-[10px] font-normal text-slate-500 font-sans">
                            {job.gpusRequested} x H100 GPUs
                          </div>
                        </td>
                        <td className="py-3 font-sans text-slate-300">
                          <div className="font-semibold text-slate-200">{job.clientOwner}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {job.frameworkType}
                          </div>
                        </td>
                        <td className="py-3 font-sans">
                          {job.dataResidency === 'DOMESTIC_ONLY' ? (
                            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                              <Lock className="w-3 h-3 text-emerald-400" /> Domestic
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[11px] text-sky-400 font-semibold">
                              <Globe className="w-3 h-3 text-sky-400" /> Global Fluid
                            </span>
                          )}
                        </td>
                        <td className="py-3 font-sans text-slate-300">
                          <div className="font-medium text-slate-200">{job.allocatedNodeName}</div>
                          <div className="text-[10px] font-mono text-slate-500">
                            {job.allocatedNodeId}
                          </div>
                        </td>
                        <td className="py-3 text-right font-bold text-emerald-400 tabular-nums">
                          {job.carbonAvoidedTons.toFixed(2)} MT
                        </td>
                        <td className="py-3 text-center">
                          {statusBadge}
                        </td>
                        <td className="py-3 text-right pr-2">
                          <button
                            onClick={() => onTriggerJobArbitrage(job.jobId, job.allocatedNodeId)}
                            disabled={isExecuting}
                            className="px-2.5 py-1 text-[11px] font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 rounded-lg transition-all whitespace-nowrap cursor-pointer"
                          >
                            Arbitrage
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              Automated Data Boundary Guard Active: DOMESTIC_ONLY enforces zero cross-border egress.
            </span>
            <span className="font-mono text-slate-500">
              BigQuery Partition Synced
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
