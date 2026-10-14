import React, { useState, useMemo } from 'react';
import {
  Cpu,
  Zap,
  ArrowRight,
  ShieldCheck,
  DollarSign,
  TrendingUp,
  Sparkles,
  Server,
  CheckCircle2,
  Lock,
  Layers,
  BarChart3,
  Globe,
  RotateCcw,
  Play,
  Copy,
  Check,
  Building,
  Scale,
  Brain,
  FileCheck,
  Terminal,
  Code2,
  ExternalLink,
  FileText,
} from 'lucide-react';
import { GridNode, ComputeJob } from '../../types';
import { exportPassportToPDF } from '../../utils/passportPdfExport';

interface CustomerWorkloadTransferHubProps {
  nodes: GridNode[];
  onAddJob: (job: Omit<ComputeJob, 'jobId' | 'carbonAvoidedTons' | 'startTime'>) => void;
  onSelectNode?: (nodeId: string) => void;
  onExecuteArbitrage?: () => void;
}

export const CustomerWorkloadTransferHub: React.FC<CustomerWorkloadTransferHubProps> = ({
  nodes,
  onAddJob,
  onSelectNode,
  onExecuteArbitrage,
}) => {
  const [activeTab, setActiveTab] = useState<'TRANSFER_WIZARD' | 'REVENUE_ECONOMICS' | 'LIVE_SUBMIT'>('TRANSFER_WIZARD');

  // Wizard state for interactive demo
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [selectedFramework, setSelectedFramework] = useState<'PYTORCH_DDP' | 'NEMO_MEGATRON' | 'VLLM_BATCH' | 'SYNTHETIC_DATA_GEN'>('PYTORCH_DDP');
  const [gpusCount, setGpusCount] = useState<number>(128);
  const [jobDurationHours, setJobDurationHours] = useState<number>(72);
  const [slaUrgency, setSlaUrgency] = useState<'FLEXIBLE_GREEN' | 'URGENT_BASELINE'>('FLEXIBLE_GREEN');
  const [dataSovereignty, setDataSovereignty] = useState<'DOMESTIC_ONLY' | 'GLOBAL_FLUID'>('DOMESTIC_ONLY');
  const [optimizationPolicy, setOptimizationPolicy] = useState<'NEGATIVE_TARIFF' | 'MAX_CARBON' | 'BALANCED_SLA'>('NEGATIVE_TARIFF');
  const [checkpointCadence, setCheckpointCadence] = useState<'15_MIN' | '30_MIN' | '60_MIN'>('30_MIN');
  const [clientOrgName, setClientOrgName] = useState<string>('ApexCompute Labs');
  const [connectionChannel, setConnectionChannel] = useState<'PYTHON_SDK' | 'KUBERNETES_CRD' | 'SLURM_PLUGIN' | 'REST_WEBHOOK'>('PYTHON_SDK');
  const [copiedSnippet, setCopiedSnippet] = useState<boolean>(false);
  const [isRouting, setIsRouting] = useState<boolean>(false);
  const [routingComplete, setRoutingComplete] = useState<boolean>(false);
  const [copiedToken, setCopiedToken] = useState<boolean>(false);

  // Filter to Indian suppliers + Global entity
  const indianNodes = useMemo(() => {
    return nodes.filter((n) => n.id.startsWith('IND'));
  }, [nodes]);

  const bestTargetNode = useMemo(() => {
    // Pick the node with best negative tariff or highest curtailment
    return (
      indianNodes.find((n) => n.id === 'IND-TN-WIND') ||
      indianNodes.find((n) => n.id === 'IND-GUJ-SOLAR') ||
      nodes[0]
    );
  }, [indianNodes, nodes]);

  // Economics Calculation
  const standardCloudHourlyRatePerGpu = 3.60; // Standard hyperscaler H100 rate (USD)
  const powerCostSharePerGpuHour = 0.85; // Est. electricity share of GPU-hour in standard grid
  const standardTotalCost = Number((gpusCount * jobDurationHours * standardCloudHourlyRatePerGpu).toFixed(2));

  // In REGEN-X: Powered by negative/surplus energy
  // Energy price discount is ~80%
  const cleanEnergySavingsRatePerGpuHour = 1.95; // Client net savings per GPU-hour
  const regenXPlatformFeePerGpuHour = 0.85; // Our revenue (30% performance fee on arbitrage)
  const regenXTotalComputeCost = Number(
    (gpusCount * jobDurationHours * (standardCloudHourlyRatePerGpu - cleanEnergySavingsRatePerGpuHour)).toFixed(2)
  );

  const clientNetSavings = Number((gpusCount * jobDurationHours * cleanEnergySavingsRatePerGpuHour).toFixed(2));
  const clientSavingsPct = Math.round((clientNetSavings / standardTotalCost) * 100);
  const regenXRevenueGenerated = Number((gpusCount * jobDurationHours * regenXPlatformFeePerGpuHour).toFixed(2));
  const estimatedCO2AvoidedTons = Number(((gpusCount * jobDurationHours * 0.7 * 0.46) / 1000).toFixed(2));

  // Step Simulation Trigger (Optimization Mode -> Green Passport Certificate)
  const handleSimulateTransfer = () => {
    setIsRouting(true);
    setRoutingComplete(false);
    setTimeout(() => {
      setIsRouting(false);
      setRoutingComplete(true);
      setWizardStep(4);
      if (onExecuteArbitrage) {
        onExecuteArbitrage();
      }
    }, 1200);
  };

  const handleCommitLiveJob = () => {
    onAddJob({
      clientOwner: clientOrgName,
      frameworkType: selectedFramework as any,
      dataResidency: dataSovereignty,
      slaUrgent: slaUrgency === 'URGENT_BASELINE',
      status: 'SCALED_SPONGE',
      allocatedNodeId: bestTargetNode.id,
      allocatedNodeName: bestTargetNode.name,
      gpusRequested: gpusCount,
    });
    if (onExecuteArbitrage) {
      onExecuteArbitrage();
    }
  };

  const generatedPassportToken = `0x9e8a7c6b5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a-${Date.now().toString().slice(-6)}`;

  return (
    <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold font-mono uppercase tracking-wide">
              AI Workload Transfer Suite
            </span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-slate-400 font-mono">Live Workload Transfer Journey</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1 flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <span>Customer Workload Onboarding &amp; SaaS Revenue Engine</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            See how AI teams transfer batch compute into REGEN-X, how autonomous routing shifts workloads into surplus renewable corridors, and how measurable cost savings create strong platform economics.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-stretch sm:self-auto">
          <button
            onClick={() => setActiveTab('TRANSFER_WIZARD')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'TRANSFER_WIZARD'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Interactive Demo Flow</span>
          </button>
          <button
            onClick={() => setActiveTab('REVENUE_ECONOMICS')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'REVENUE_ECONOMICS'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>Unit Economics &amp; Monetization</span>
          </button>
          <button
            onClick={() => setActiveTab('LIVE_SUBMIT')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'LIVE_SUBMIT'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-sky-400" />
            <span>Submit Live Workload</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: INTERACTIVE DEMO FLOW WIZARD                                       */}
      {/* ========================================================================= */}
      {activeTab === 'TRANSFER_WIZARD' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Enterprise Step-by-Step Progress Visualizer */}
          <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-3 sm:p-4 shadow-xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
              {[
                {
                  num: 1,
                  title: 'Connect Data',
                  subtitle: 'Framework & Ingestion',
                  icon: Terminal,
                },
                {
                  num: 2,
                  title: 'Define SLA',
                  subtitle: 'Sovereignty & Latency',
                  icon: Lock,
                },
                {
                  num: 3,
                  title: 'Optimization Mode',
                  subtitle: 'Gemini Grid Rerouting',
                  icon: Brain,
                },
                {
                  num: 4,
                  title: 'Green Passport & ROI',
                  subtitle: 'Certificate & Economics',
                  icon: ShieldCheck,
                },
              ].map((step) => {
                const isCurrent = wizardStep === step.num;
                const isCompleted = wizardStep > step.num;
                const IconComponent = step.icon;

                return (
                  <button
                    key={step.num}
                    type="button"
                    onClick={() => setWizardStep(step.num)}
                    className={`relative p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                      isCurrent
                        ? 'bg-gradient-to-r from-emerald-950/50 to-slate-900 border-emerald-400 text-white shadow-lg shadow-emerald-500/10'
                        : isCompleted
                        ? 'bg-slate-900/60 border-emerald-500/30 text-slate-200 hover:border-slate-700'
                        : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-mono font-bold text-xs transition-colors ${
                        isCurrent
                          ? 'bg-emerald-400 text-slate-950 font-black shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                          : isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-slate-900 text-slate-500 border border-slate-800'
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4 text-emerald-400" /> : step.num}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-bold text-xs truncate ${
                            isCurrent ? 'text-emerald-300' : isCompleted ? 'text-white' : 'text-slate-400'
                          }`}
                        >
                          {step.title}
                        </span>
                        {isCurrent && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse hidden sm:inline-block" />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5 font-sans">
                        {step.subtitle}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Connecting Chevron Path Indicator */}
            <div className="hidden md:flex items-center justify-between px-6 pt-2 text-[10px] font-mono text-slate-500">
              <span className={wizardStep >= 1 ? 'text-emerald-400 font-bold' : ''}>1. Connect Data</span>
              <span>→</span>
              <span className={wizardStep >= 2 ? 'text-emerald-400 font-bold' : ''}>2. Define SLA</span>
              <span>→</span>
              <span className={wizardStep >= 3 ? 'text-emerald-400 font-bold' : ''}>3. Optimization Mode</span>
              <span>→</span>
              <span className={wizardStep >= 4 ? 'text-emerald-400 font-bold' : ''}>4. Green Passport Certificate</span>
            </div>
          </div>

          {/* STEP 1: Connect Workload Payload */}
          {wizardStep === 1 && (
            <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-5 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xs text-emerald-400 font-mono">1</span>
                    Customer Workload Specification
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Clients register their asynchronous AI workloads via our Python SDK, Kubernetes Operator, or Slurm plugin.
                  </p>
                </div>
                <div className="text-right font-mono text-xs">
                  <span className="text-slate-400">Target Tenant:</span>
                  <div className="font-bold text-emerald-400">{clientOrgName}</div>
                </div>
              </div>

              {/* Customer Integration Channel Interface */}
              <div className="bg-[#070b14] border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>How Customer Connects Workloads to REGEN-X</span>
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Choose client integration interface to transfer training scripts &amp; container pods:
                    </p>
                  </div>
                  {/* Channel Toggle */}
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[10px] font-mono">
                    {[
                      { id: 'PYTHON_SDK', label: 'Python SDK' },
                      { id: 'KUBERNETES_CRD', label: 'Kubernetes CRD' },
                      { id: 'SLURM_PLUGIN', label: 'Slurm Plugin' },
                      { id: 'REST_WEBHOOK', label: 'REST / Webhook' },
                    ].map((ch) => (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => setConnectionChannel(ch.id as any)}
                        className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                          connectionChannel === ch.id
                            ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {ch.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Connection Code Snippet Preview */}
                <div className="relative bg-slate-950 p-3 rounded-lg border border-slate-800/80 font-mono text-[11px] overflow-x-auto text-slate-300">
                  <button
                    type="button"
                    onClick={() => {
                      let code = '';
                      if (connectionChannel === 'PYTHON_SDK') {
                        code = `import regenx\nclient = regenx.Client(api_key="rgx_live_99a8bc", cluster_id="${clientOrgName.toLowerCase().replace(/\\s+/g, '-')}")\n\n# Wrap PyTorch elastic trainer with autonomous clean grid dispatch\njob = client.submit_workload(\n    entrypoint="torchrun --nnodes=16 --nproc_per_node=8 train_llm.py",\n    framework="${selectedFramework}",\n    target_gpus=${gpusCount},\n    data_sovereignty="${dataSovereignty}",\n    routing_strategy="MAX_RENEWABLE_SPONGE", # Reroutes to negative-price solar/wind\n    sla_deadline_hours=${jobDurationHours}\n)\nprint(f"Dispatched job {job.id} to REGEN-X green grid conduit")`;
                      } else if (connectionChannel === 'KUBERNETES_CRD') {
                        code = `apiVersion: regenx.ai/v1alpha1\nkind: GreenComputeJob\nmetadata:\n  name: ${clientOrgName.toLowerCase().replace(/\\s+/g, '-')}-train\nspec:\n  framework: ${selectedFramework}\n  gpus: ${gpusCount}\n  sovereigntyPolicy: ${dataSovereignty}\n  energyOptimization:\n    preferNegativeTariffs: true\n    curtailmentAbsorbTier: A_PLUS\n    autoCheckpointOnGridDrop: true`;
                      } else if (connectionChannel === 'SLURM_PLUGIN') {
                        code = `#!/bin/bash\n#SBATCH --job-name=regenx_elastic_${gpusCount}gpu\n#SBATCH --nodes=16\n#SBATCH --gres=gpu:8\n#SBATCH --comment="regenx:sovereignty=${dataSovereignty}:opt=sponge"\n\n# REGEN-X Slurm Governor intercepts sbatch & routes nodes to greenest corridor\nregenx-slurm-hook --sync-grid-telemetry\nsrun python -m torch.distributed.run train.py`;
                      } else {
                        code = `curl -X POST "https://api.regenx.energy/v1/workloads/ingest" \\\n  -H "Authorization: Bearer rgx_live_99a8bc" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "tenant": "${clientOrgName}",\n    "framework": "${selectedFramework}",\n    "gpus": ${gpusCount},\n    "sovereignty": "${dataSovereignty}",\n    "sla_hours": ${jobDurationHours}\n  }'`;
                      }
                      navigator.clipboard.writeText(code);
                      setCopiedSnippet(true);
                      setTimeout(() => setCopiedSnippet(false), 2000);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer text-[10px] flex items-center gap-1"
                    title="Copy connection code"
                  >
                    {copiedSnippet ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>

                  <pre className="text-emerald-300/90 whitespace-pre leading-relaxed pr-20">
                    {connectionChannel === 'PYTHON_SDK' && (
`# 1. Install REGEN-X client library: pip install regenx-sdk
import regenx
client = regenx.Client(api_key="rgx_live_99a8bc", tenant="${clientOrgName}")

# 2. Submit training workload with autonomous clean power routing
job = client.submit_workload(
    entrypoint="torchrun --nnodes=16 --nproc_per_node=8 train_llm.py",
    framework="${selectedFramework}",
    target_gpus=${gpusCount},
    data_sovereignty="${dataSovereignty}",
    routing_strategy="MAX_RENEWABLE_SPONGE", # Absorb negative spot tariffs
    sla_hours=${jobDurationHours}
)
print(f"Connected to REGEN-X: Job {job.id} will execute during green surplus")`
                    )}
                    {connectionChannel === 'KUBERNETES_CRD' && (
`# Deploy REGEN-X Custom Resource Definition onto your k8s cluster
apiVersion: regenx.ai/v1alpha1
kind: GreenComputeJob
metadata:
  name: ${clientOrgName.toLowerCase().replace(/\\s+/g, '-')}-train
spec:
  framework: ${selectedFramework}
  gpus: ${gpusCount}
  sovereigntyPolicy: ${dataSovereignty}
  energyOptimization:
    preferNegativeTariffs: true
    curtailmentAbsorbTier: A_PLUS
    autoCheckpointOnGridDrop: true`
                    )}
                    {connectionChannel === 'SLURM_PLUGIN' && (
`# REGEN-X Slurm Dispatch Hook
#!/bin/bash
#SBATCH --job-name=regenx_${clientOrgName.toLowerCase().replace(/\\s+/g, '_')}
#SBATCH --nodes=16 --gres=gpu:8
#SBATCH --comment="regenx:sovereignty=${dataSovereignty}:opt=sponge"

# Slurm Governor synchronizes with Indian Renewable Grid feeds before dispatch
regenx-slurm-hook --sync-grid-telemetry
srun python -m torch.distributed.run train.py`
                    )}
                    {connectionChannel === 'REST_WEBHOOK' && (
`curl -X POST "https://api.regenx.energy/v1/workloads/ingest" \\
  -H "Authorization: Bearer rgx_live_99a8bc" \\
  -H "Content-Type: application/json" \\
  -d '{
    "tenant": "${clientOrgName}",
    "framework": "${selectedFramework}",
    "gpus": ${gpusCount},
    "sovereignty": "${dataSovereignty}",
    "sla_hours": ${jobDurationHours}
  }'`
                    )}
                  </pre>
                </div>
              </div>

              {/* Framework Selection */}
              <div>
                <label className="block text-[11px] font-mono text-slate-300 uppercase tracking-wider mb-2 font-bold">
                  Select AI Workload Framework
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'PYTORCH_DDP', name: 'PyTorch Elastic DDP', desc: 'LLM Multi-Node Pretraining' },
                    { id: 'NEMO_MEGATRON', name: 'NVIDIA NeMo Megatron', desc: 'Tensor & Pipeline Parallelism' },
                    { id: 'VLLM_BATCH', name: 'vLLM Offline Batch', desc: 'High-Throughput Synthetic Gen' },
                    { id: 'SYNTHETIC_DATA_GEN', name: 'Ray Distributed', desc: 'RLHF & Embedding Indexing' },
                  ].map((fw) => (
                    <button
                      key={fw.id}
                      onClick={() => setSelectedFramework(fw.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedFramework === fw.id
                          ? 'bg-emerald-950/40 border-emerald-400 text-white shadow-md'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-xs text-white">{fw.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{fw.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders for GPUs and Runtime */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">GPU Hardware Scale:</span>
                    <span className="font-mono font-bold text-emerald-400">{gpusCount}x NVIDIA H100s</span>
                  </div>
                  <input
                    type="range"
                    min="16"
                    max="512"
                    step="16"
                    value={gpusCount}
                    onChange={(e) => setGpusCount(Number(e.target.value))}
                    className="w-full accent-emerald-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>16 GPUs (Small Pod)</span>
                    <span>128 GPUs (Standard Cluster)</span>
                    <span>512 GPUs (Supercluster)</span>
                  </div>
                </div>

                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">Estimated Training Duration:</span>
                    <span className="font-mono font-bold text-sky-400">{jobDurationHours} Hours ({(jobDurationHours / 24).toFixed(1)} Days)</span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="336"
                    step="12"
                    value={jobDurationHours}
                    onChange={(e) => setJobDurationHours(Number(e.target.value))}
                    className="w-full accent-sky-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>12 Hours (Checkpoint)</span>
                    <span>72 Hours (3 Days)</span>
                    <span>336 Hours (2 Weeks)</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  className="px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-98"
                >
                  <span>Proceed to Define SLA (Step 2)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: DEFINE SLA & DATA SOVEREIGNTY                                     */}
          {/* ========================================================================= */}
          {wizardStep === 2 && (
            <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-5 space-y-5 animate-in fade-in duration-200">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xs text-emerald-400 font-mono">2</span>
                    Define Workload SLA, Sovereignty &amp; Fault Tolerance
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Configure execution urgency window, regional data residency compliance, and checkpoint recovery policies.
                  </p>
                </div>
                <div className="text-right font-mono text-xs">
                  <span className="text-slate-400">Target Tenant:</span>
                  <div className="font-bold text-emerald-400">{clientOrgName}</div>
                </div>
              </div>

              {/* 1. SLA Urgency & Execution Window Mode */}
              <div className="space-y-2">
                <label className="block text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>SLA Urgency &amp; Energy Window Optimization</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div
                    onClick={() => setSlaUrgency('FLEXIBLE_GREEN')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      slaUrgency === 'FLEXIBLE_GREEN'
                        ? 'bg-emerald-950/40 border-emerald-400 text-white shadow-lg ring-1 ring-emerald-500/40'
                        : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 font-bold text-xs text-white">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Flexible Green Sponging (Recommended)</span>
                      </div>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
                        Save ~70%
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                      Maximizes cost reduction by dynamically absorbing stranded negative-curtailment power. Workload automatically resumes during high-surplus hours with 100% clean energy guarantee.
                    </p>
                  </div>

                  <div
                    onClick={() => setSlaUrgency('URGENT_BASELINE')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      slaUrgency === 'URGENT_BASELINE'
                        ? 'bg-sky-950/40 border-sky-400 text-white shadow-lg ring-1 ring-sky-500/40'
                        : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 font-bold text-xs text-white">
                        <Scale className="w-3.5 h-3.5 text-sky-400" />
                        <span>Strict Time-Window SLA</span>
                      </div>
                      <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded font-mono font-bold">
                        Guaranteed Deadline
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                      Continuous high-priority execution with sub-30ms multi-corridor failover. If local curtailment dips, workload seamlessly bridges to the Global Grid Reserve.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Data Residency & Sovereignty Policy */}
              <div className="space-y-2">
                <label className="block text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Data Sovereignty &amp; Regulatory Jurisdiction Policy</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div
                    onClick={() => setDataSovereignty('DOMESTIC_ONLY')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      dataSovereignty === 'DOMESTIC_ONLY'
                        ? 'bg-emerald-950/40 border-emerald-400 text-white shadow-lg ring-1 ring-emerald-500/40'
                        : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-white mb-1">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Strict Domestic Sovereignty (India DPDPA Compliant)</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                      Zero cross-border egress. Workload is restricted exclusively to Indian clean corridors (Gujarat, Tamil Nadu, Rajasthan) with certified CERC regulatory compliance.
                    </p>
                  </div>

                  <div
                    onClick={() => setDataSovereignty('GLOBAL_FLUID')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      dataSovereignty === 'GLOBAL_FLUID'
                        ? 'bg-sky-950/40 border-sky-400 text-white shadow-lg ring-1 ring-sky-500/40'
                        : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-white mb-1">
                      <Globe className="w-3.5 h-3.5 text-sky-400" />
                      <span>Global Fluid Cross-Border</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                      Permits cross-border routing into the Global Grid Reserve to capture deepest international negative tariffs while maintaining cryptographic audit trails.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Checkpointing Cadence & Migration Fault Tolerance */}
              <div className="bg-[#070b14] border border-slate-800 rounded-xl p-4 space-y-3 font-mono">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                      <span>PyTorch Distributed Elastic Checkpoint Cadence</span>
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Controls frequency of state preservation for zero-loss container migration:
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[10px]">
                    {[
                      { id: '15_MIN', label: '15 Min (Critical)' },
                      { id: '30_MIN', label: '30 Min (Balanced)' },
                      { id: '60_MIN', label: '60 Min (Throughput)' },
                    ].map((cad) => (
                      <button
                        key={cad.id}
                        type="button"
                        onClick={() => setCheckpointCadence(cad.id as any)}
                        className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                          checkpointCadence === cad.id
                            ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {cad.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="text-[11px] text-emerald-400/90 flex items-center gap-2 pt-1 border-t border-slate-800/80">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>State migration downtime: &lt; 42 seconds via checkpoint memory stitch without cluster re-initialization.</span>
                </div>
              </div>

              {/* Step 2 Navigation Buttons */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setWizardStep(1)}
                  className="px-4 py-2 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Back to Connect Data
                </button>
                <button
                  type="button"
                  onClick={() => setWizardStep(3)}
                  className="px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-98"
                >
                  <span>Proceed to Optimization Mode (Step 3)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: OPTIMIZATION MODE & AUTONOMOUS GRID ROUTING                       */}
          {/* ========================================================================= */}
          {wizardStep === 3 && (
            <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-5 space-y-5 animate-in fade-in duration-200">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xs text-emerald-400 font-mono">3</span>
                    Optimization Mode &amp; Autonomous Gemini 3.8 Flash Grid Routing Engine
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Select energy arbitrage strategy and observe real-time spatial-temporal corridor matching.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs font-mono">
                  ACTIVE ROUTING
                </span>
              </div>

              {/* 1. Optimization Strategy Mode Selector */}
              <div>
                <label className="block text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-bold mb-2 flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5" />
                  <span>Select Autonomous Optimization Policy</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'NEGATIVE_TARIFF',
                      name: 'Deep Negative-Tariff Arbitrage',
                      badge: 'Max ROI - 70% Discount',
                      desc: 'Prioritizes corridors with lowest & negative tariffs (-$2.10/MWh) for maximum cash savings.',
                    },
                    {
                      id: 'MAX_CARBON',
                      name: '100% Curtailed Zero-Carbon',
                      badge: 'Scope 2 Zero Carbon',
                      desc: 'Directs compute exclusively to stranded clean power that would otherwise be curtailed by grid operators.',
                    },
                    {
                      id: 'BALANCED_SLA',
                      name: 'SLA-Guaranteed Low Latency',
                      badge: 'Sub-15ms Failover',
                      desc: 'Balances negative tariff absorption with tight SLA latency guarantees and reserve failover.',
                    },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setOptimizationPolicy(opt.id as any)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        optimizationPolicy === opt.id
                          ? 'bg-emerald-950/40 border-emerald-400 text-white shadow-lg ring-1 ring-emerald-500/40'
                          : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-white">{opt.name}</span>
                      </div>
                      <span className="text-[9.5px] px-1.5 py-0.5 rounded font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-block mb-1.5">
                        {opt.badge}
                      </span>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-sans">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. The Live Grid Analysis Matrix */}
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 font-bold">
                  Live Renewable Grid Feeds Analyzed
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {indianNodes.slice(0, 3).map((node) => {
                    const isSelectedForJob = node.id === bestTargetNode.id;
                    return (
                      <div
                        key={node.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isSelectedForJob
                            ? 'bg-emerald-950/30 border-emerald-400 ring-1 ring-emerald-500/40'
                            : 'bg-slate-900/60 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-xs text-white">{node.name}</span>
                          <span
                            className={`text-[9.5px] px-1.5 py-0.5 rounded font-mono font-bold ${
                              isSelectedForJob
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {isSelectedForJob ? 'OPTIMAL MATCH' : 'Candidate'}
                          </span>
                        </div>
                        <div className="space-y-1 text-xs font-mono text-slate-300">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Spot Tariff:</span>
                            <span className={node.spotPricePerMWh <= 0 ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                              ${node.spotPricePerMWh.toFixed(2)}/MWh
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Curtailed Power:</span>
                            <span className="text-emerald-400 font-bold">{node.curtailmentMWh} MW</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Hardware Containers:</span>
                            <span>{node.activeContainers} Active</span>
                          </div>
                        </div>
                        {isSelectedForJob && (
                          <div className="mt-2.5 pt-2 border-t border-emerald-500/20 text-[10px] text-emerald-300 font-mono flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-400" />
                            <span>Gemini Decision: SCALE_MAX_SPONGE</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Gemini Routing Decision Terminal Feed */}
              <div className="bg-[#070b14] border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-2">
                <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>Gemini 3.8 Flash Governor Telemetry Reasoning</span>
                </div>
                <div className="text-slate-300 text-[11px] leading-relaxed">
                  [INPUT]: Workload {clientOrgName} ({gpusCount} GPUs, {selectedFramework}, {dataSovereignty}, Mode: {optimizationPolicy}).
                  <br />
                  [EVALUATION]: Analyzing spot prices across Indian National Renewable Grid. Detected negative tariff surge at{' '}
                  <strong className="text-emerald-400">{bestTargetNode.name}</strong> (${bestTargetNode.spotPricePerMWh.toFixed(2)}/MWh, {bestTargetNode.curtailmentMWh} MW stranded wind/solar).
                  <br />
                  [DECISION]: Autonomous dispatch approved via PyTorch Distributed Elastic Controller. Rerouting batch workload to liquid-cooled container farm at {bestTargetNode.region}. Zero grid fossil emissions.
                </div>
              </div>

              {/* Step 3 Navigation Buttons */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  className="px-4 py-2 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Back to Define SLA
                </button>
                <button
                  type="button"
                  onClick={handleSimulateTransfer}
                  disabled={isRouting}
                  className="px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-98"
                >
                  {isRouting ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Gemini Routing Workload &amp; Sealing Passport...</span>
                    </>
                  ) : (
                    <>
                      <span>Execute Optimization &amp; Issue Green Passport Certificate</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: GREEN PASSPORT CERTIFICATE & ROI BREAKDOWN (FINAL STEP)            */}
          {/* ========================================================================= */}
          {wizardStep === 4 && (
            <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-5 space-y-5 animate-in fade-in duration-200">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center text-xs text-emerald-400 font-mono">4</span>
                    Cryptographic Green Compute Passport &amp; Platform Economics
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Audit-ready proof of zero-carbon execution and transparent 3-way cost arbitrage economics.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs font-mono">
                  VERIFIED A+
                </span>
              </div>

              {/* Official Green Compute Passport Certificate Card */}
              <div className="bg-gradient-to-br from-slate-950 via-[#08121e] to-emerald-950/30 border-2 border-emerald-500/40 rounded-2xl p-5 shadow-2xl relative overflow-hidden space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-500/30">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    <div>
                      <div className="text-sm font-bold text-white">REGEN-X GREEN COMPUTE PASSPORT</div>
                      <div className="text-[10px] text-emerald-400 font-mono">LEED-Equivalent Clean AI Workload Audit Certificate</div>
                    </div>
                  </div>
                  <div className="text-right font-mono text-[11px] text-slate-300">
                    <div>Standard: ISO 14064</div>
                    <div className="text-emerald-400 font-bold">GHG Scope 2 Zero-Carbon</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Client Organization</div>
                    <div className="font-bold text-white mt-0.5">{clientOrgName}</div>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Renewable Grid Corridor</div>
                    <div className="font-bold text-emerald-400 mt-0.5">{bestTargetNode.name}</div>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Hardware Scale</div>
                    <div className="font-bold text-white mt-0.5">{gpusCount} GPUs ({jobDurationHours}h)</div>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-slate-400 text-[10px]">CO₂ Emissions Avoided</div>
                    <div className="font-bold text-emerald-400 mt-0.5">{estimatedCO2AvoidedTons} Metric Tons</div>
                  </div>
                </div>

                {/* Scope 2 & Regulatory Verification Status Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] font-mono">
                  <div className="bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/30 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-emerald-200">100% Curtailed Wind / Solar Sourced</span>
                  </div>
                  <div className="bg-sky-950/40 p-2 rounded-lg border border-sky-500/30 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="text-sky-200">CERC Green Open Access Compliant</span>
                  </div>
                  <div className="bg-purple-950/40 p-2 rounded-lg border border-purple-500/30 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="text-purple-200">BigQuery Immutable Audit Ledger Sync</span>
                  </div>
                </div>

                {/* Cryptographic SHA-256 Token Display and Certificate Actions */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] text-slate-400 uppercase">Cryptographic Audit Signature (BigQuery Immutable Hash):</div>
                    <div className="text-emerald-300 font-bold truncate mt-0.5">{generatedPassportToken}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedPassportToken);
                        setCopiedToken(true);
                        setTimeout(() => setCopiedToken(false), 2000);
                      }}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer text-xs flex items-center gap-1.5 font-mono"
                      title="Copy hash signature"
                    >
                      {copiedToken ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedToken ? 'Copied' : 'Copy Hash'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const passportRecord = {
                          passportTokenId: generatedPassportToken,
                          targetJobId: `WL-${clientOrgName.toUpperCase().replace(/\s+/g, '_')}-${Date.now().toString().slice(-4)}`,
                          clientOwner: clientOrgName,
                          verifiedRenewableSource: `${bestTargetNode.name} (${bestTargetNode.ippSupplier || 'Clean Substation Feeder'})`,
                          executionGeoLocation: `${bestTargetNode.region} [${bestTargetNode.lat.toFixed(2)}, ${bestTargetNode.lng.toFixed(2)}]`,
                          regionId: bestTargetNode.id,
                          netCarbonAvoidedMetricTons: estimatedCO2AvoidedTons,
                          sustainabilityScoreRating: 'A+' as const,
                          routingDecision: 'REALTIME_STRANDED_ABSORPTION' as const,
                          sovereigntySignature: dataSovereignty === 'DOMESTIC_ONLY' ? ('PASSED_DOMESTIC_BOUNDARY' as const) : ('PASSED_GLOBAL_FLUID' as const),
                          executionTimestamp: new Date().toISOString(),
                          cryptographicSignature: `SIG_ED25519_IMMUTABLE_${generatedPassportToken.slice(0, 16)}`,
                        };
                        exportPassportToPDF(passportRecord as any);
                      }}
                      className="p-2 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 transition-colors cursor-pointer text-xs flex items-center gap-1.5 font-mono font-bold shadow-md"
                      title="Download Official Audit-Ready PDF Certificate"
                    >
                      <FileText className="w-4 h-4 text-slate-950" />
                      <span>Download PDF Certificate</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const passportData = {
                          passport_id: generatedPassportToken,
                          client_org: clientOrgName,
                          renewable_corridor: bestTargetNode.name,
                          region_id: bestTargetNode.id,
                          gpu_count: gpusCount,
                          duration_hours: jobDurationHours,
                          net_carbon_avoided_metric_tons: estimatedCO2AvoidedTons,
                          sustainability_score_rating: 'A+',
                          clean_energy_percentage: '100%',
                          ghg_protocol: 'Scope 2 Zero Market-Based Emission',
                          signed_at_utc: new Date().toISOString(),
                          cerc_regulatory_status: 'Compliant with CERC Green Open Access',
                        };
                        const blob = new Blob([JSON.stringify(passportData, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `REGEN_X_Passport_${clientOrgName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="p-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-colors cursor-pointer text-xs flex items-center gap-1.5 font-mono font-bold"
                      title="Download ISO 14064 Compliance JSON"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>Export JSON</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* The 3-Way Economic Split Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
                {/* 1. Client Baseline Cost */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="text-slate-400 text-xs font-semibold flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-slate-400" />
                    Standard Cloud Baseline
                  </div>
                  <div className="text-2xl font-bold text-slate-300 line-through">
                    ${standardTotalCost.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    ${standardCloudHourlyRatePerGpu}/GPU-hr fossil grid baseline for {gpusCount} GPUs ({jobDurationHours}h).
                  </div>
                </div>

                {/* 2. Client Net Savings */}
                <div className="bg-emerald-950/40 border-2 border-emerald-400 rounded-xl p-4 space-y-2 shadow-lg">
                  <div className="text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Client Net Savings (70% Split)
                  </div>
                  <div className="text-2xl font-bold text-emerald-400">
                    ${clientNetSavings.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-emerald-200">
                    Customer saves <strong>{clientSavingsPct}%</strong> on their AI compute bill while running on 100% clean power!
                  </div>
                </div>

                {/* 3. REGEN-X SaaS Revenue */}
                <div className="bg-sky-950/40 border-2 border-sky-400 rounded-xl p-4 space-y-2 shadow-lg">
                  <div className="text-sky-300 text-xs font-semibold flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-sky-400" />
                    REGEN-X SaaS Revenue (30% Split)
                  </div>
                  <div className="text-2xl font-bold text-sky-300">
                    ${regenXRevenueGenerated.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-sky-200">
                    Our platform revenue from this single job via the 30% clean energy arbitrage performance fee!
                  </div>
                </div>
              </div>

              {/* The Monetization Architecture Table */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs font-mono space-y-3">
                <div className="font-bold text-white uppercase text-[11px] tracking-wide flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-400" />
                  REGEN-X Sustainable Compute Unit Economics Breakdown
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Hyperscaler Price</div>
                    <div className="text-base font-bold text-slate-200">$3.60 / GPU-hr</div>
                    <div className="text-[10px] text-slate-500 mt-1">AWS / GCP / Azure Standard</div>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <div className="text-slate-400 text-[10px]">REGEN-X Power Cost</div>
                    <div className="text-base font-bold text-emerald-400">$0.80 / GPU-hr</div>
                    <div className="text-[10px] text-slate-500 mt-1">Curtailed Stranded Clean Power</div>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Total Arbitrage Spread</div>
                    <div className="text-base font-bold text-sky-400">$2.80 / GPU-hr</div>
                    <div className="text-[10px] text-sky-400/80 mt-1">70% to Client / 30% to REGEN-X</div>
                  </div>
                </div>

                {/* Bilateral Value Realization Flow */}
                <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px]">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>Customer Win:</strong> Gets premium H100 compute at $1.65/hr instead of $3.60/hr + receives an ESG Green Compute Passport</span>
                  </div>
                  <div className="flex items-center gap-2 text-sky-300">
                    <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                    <span><strong>REGEN-X Win:</strong> Pure software margin ($0.85/GPU-hr performance fee) with zero generation capex</span>
                  </div>
                </div>
              </div>

              {/* Commit Job Action Callout */}
              <div className="bg-gradient-to-r from-emerald-950/50 via-slate-900 to-sky-950/50 border border-emerald-500/40 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <Server className="w-4 h-4 text-emerald-400" />
                    <span>Deploy Workload into Live Operations</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-sans">
                    Adds this container job to active cluster orchestrations and streams telemetry to the Live Operations Dashboard.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCommitLiveJob}
                  className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shrink-0"
                >
                  <Server className="w-3.5 h-3.5 text-slate-950" />
                  <span>+ Commit Live Workload to Grid Operations</span>
                </button>
              </div>

              {/* Navigation & Restart Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setWizardStep(3)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold rounded-xl cursor-pointer border border-slate-800"
                >
                  Back to Optimization Mode
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Restart Onboarding Flow
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('REVENUE_ECONOMICS')}
                    className="px-5 py-2.5 bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg"
                  >
                    <span>Explore Full Annual Revenue Model</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: UNIT ECONOMICS & ANNUAL SAAS REVENUE SIMULATOR                     */}
      {/* ========================================================================= */}
      {activeTab === 'REVENUE_ECONOMICS' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-5 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Annual ARR &amp; Profit Engine for REGEN-X
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Demonstrates how our 30% clean energy arbitrage performance fee scales with cluster adoption.
              </p>
            </div>

            {/* Interactive Cluster Scale Tiers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
              {[
                {
                  tier: 'Seed AI Startup (128 GPUs)',
                  annualClientSavings: '$2,190,000',
                  annualRegenXArr: '$936,000',
                  co2Prevented: '1,420 Tons',
                  popular: false,
                },
                {
                  tier: 'Mid-Market LLM Lab (512 GPUs)',
                  annualClientSavings: '$8,760,000',
                  annualRegenXArr: '$3,744,000',
                  co2Prevented: '5,680 Tons',
                  popular: true,
                },
                {
                  tier: 'Foundation Model AI Lab (2,048 GPUs)',
                  annualClientSavings: '$35,040,000',
                  annualRegenXArr: '$14,976,000',
                  co2Prevented: '22,720 Tons',
                  popular: false,
                },
              ].map((tier, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border relative ${
                    tier.popular
                      ? 'bg-emerald-950/30 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  {tier.popular && (
                    <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-bold">
                      Target Platform Tier
                    </span>
                  )}
                  <div className="text-xs font-bold text-white mb-2">{tier.tier}</div>
                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Client Net Savings:</span>
                      <span className="text-emerald-400 font-bold">{tier.annualClientSavings}/yr</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">REGEN-X ARR:</span>
                      <span className="text-sky-300 font-bold">{tier.annualRegenXArr}/yr</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">CO₂ Avoided:</span>
                      <span className="text-emerald-300">{tier.co2Prevented}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Why This Beats Conventional Cloud */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Zero-Loss Clean IPP Payout</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Renewable power plants (Khavda, Muppandal, Bhadla) sell stranded power they would have had to curtail at zero price.
                </p>
              </div>

              <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>50-70% Cheaper for AI Labs</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Clients get premier H100 GPU compute at a fraction of legacy hyperscaler costs with guaranteed ISO 14064 certification.
                </p>
              </div>

              <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>High-Margin ARR for Us</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  We don't buy power plants; we monetize the arbitrage spread purely as software orchestration infrastructure.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: LIVE WORKLOAD SUBMISSION FORM                                      */}
      {/* ========================================================================= */}
      {activeTab === 'LIVE_SUBMIT' && (
        <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-5 space-y-4 animate-in fade-in duration-200">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              Direct Computational Workload Ingestion
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Submit your actual batch workload payload directly into the live cluster.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="block text-slate-400 mb-1">Client Organization / Tenant Name</label>
              <input
                type="text"
                value={clientOrgName}
                onChange={(e) => setClientOrgName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Target Clean Corridor</label>
              <select
                value={bestTargetNode.id}
                onChange={(e) => onSelectNode && onSelectNode(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {indianNodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name} (${n.spotPricePerMWh.toFixed(2)}/MWh · {n.curtailmentMWh}MW)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleCommitLiveJob}
              className="px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-98"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit Batch Job to Live Cluster</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
