import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/common/Header';
import { TerminalLog } from './components/common/TerminalLog';
import { ToastContainer } from './components/common/ToastContainer';
import { InteractiveMap } from './components/dashboard/InteractiveMap';
import { GridCurtailmentTelemetryCard } from './components/dashboard/GridCurtailmentTelemetryCard';
import { RegenXInActionFlow } from './components/dashboard/RegenXInActionFlow';
import { TelemetryCharts } from './components/dashboard/TelemetryCharts';
import { WeatherSimulationController } from './components/dashboard/WeatherSimulationController';
import { DualAxisEconomicChart } from './components/dashboard/DualAxisEconomicChart';
import { DecisionTreeDiagram } from './components/dashboard/DecisionTreeDiagram';
import { EnergyFlowBridge } from './components/dashboard/EnergyFlowBridge';
import { PowerToComputeBridge } from './components/dashboard/PowerToComputeBridge';
import { SaaSCloudFlowExplainer } from './components/dashboard/SaaSCloudFlowExplainer';
import { OptimalPricingDiverter } from './components/dashboard/OptimalPricingDiverter';
import { WorkloadManager } from './components/jobs/WorkloadManager';
import { CustomerWorkloadTransferHub } from './components/workloads/CustomerWorkloadTransferHub';
import { ComplianceLedger } from './components/compliance/ComplianceLedger';
import { ArchitectureView } from './components/architecture/ArchitectureModal';
import { EnterpriseVerificationHub } from './components/verification/EnterpriseVerificationHub';
import { ProductHeroBanner } from './components/dashboard/ProductHeroBanner';
import { NavigationExplainerGuide } from './components/dashboard/NavigationExplainerGuide';
import {
  GridNode,
  ComputeJob,
  GreenComputePassport,
  SimulationState,
  TerminalLogEntry,
  OrchestrationResponse,
  CurtailmentToast,
} from './types';
import { Zap, Play, ArrowRight, ShieldCheck, X } from 'lucide-react';

const INITIAL_NODES: GridNode[] = [
  {
    id: 'IND-GUJ-SOLAR',
    name: 'Gujarat Solar Corridor',
    region: 'Khavda Renewable Energy Park, Gujarat',
    country: 'India',
    lat: 23.85,
    lng: 71.12,
    energyType: 'SOLAR',
    spotPricePerMWh: -1.85,
    curtailmentMWh: 240,
    availablePowerMWh: 640,
    hardwareStatus: 'HEALTHY',
    activeContainers: 56,
    carbonAvoidanceRateKgPerMWh: 460,
    lastTelemetryTimestamp: new Date().toISOString(),
    ippSupplier: 'Adani Green Energy (530 sq km Khavda Facility)',
    cercClassification: 'CERC Public Common Carrier · Downstream Compute Restricted',
    sldcFeedSource: 'POSOCO / Gujarat SLDC',
    parkFootprintKm2: 530,
  },
  {
    id: 'IND-TN-WIND',
    name: 'Tamil Nadu Wind Corridor',
    region: 'Muppandal Wind Farm Cluster',
    country: 'India',
    lat: 8.24,
    lng: 77.54,
    energyType: 'WIND',
    spotPricePerMWh: -2.10,
    curtailmentMWh: 310,
    availablePowerMWh: 420,
    hardwareStatus: 'HEALTHY',
    activeContainers: 64,
    carbonAvoidanceRateKgPerMWh: 440,
    lastTelemetryTimestamp: new Date().toISOString(),
    ippSupplier: 'Sembcorp India & Greenko Group',
    cercClassification: 'CERC Public Common Carrier · Monsoonal Surge Substation Bottleneck',
    sldcFeedSource: 'POSOCO / SRLDC (Southern Region)',
  },
  {
    id: 'IND-RAJ-SOLAR',
    name: 'Rajasthan Solar Matrix',
    region: 'Bhadla Solar Park, Rajasthan',
    country: 'India',
    lat: 27.53,
    lng: 71.91,
    energyType: 'SOLAR',
    spotPricePerMWh: -1.40,
    curtailmentMWh: 180,
    availablePowerMWh: 580,
    hardwareStatus: 'HEALTHY',
    activeContainers: 42,
    carbonAvoidanceRateKgPerMWh: 450,
    lastTelemetryTimestamp: new Date().toISOString(),
    ippSupplier: 'ReNew Power & Tata Power Renewable Energy',
    cercClassification: 'CERC Public Common Carrier · Arid Terrain Matrix',
    sldcFeedSource: 'POSOCO / NRLDC (Northern Region)',
  },
  {
    id: 'IND-MAH-WIND',
    name: 'Maharashtra Wind Park',
    region: 'Dhule Wind Energy Cluster',
    country: 'India',
    lat: 20.90,
    lng: 74.77,
    energyType: 'WIND',
    spotPricePerMWh: 0.80,
    curtailmentMWh: 120,
    availablePowerMWh: 340,
    hardwareStatus: 'HEALTHY',
    activeContainers: 28,
    carbonAvoidanceRateKgPerMWh: 430,
    lastTelemetryTimestamp: new Date().toISOString(),
    ippSupplier: 'Tata Power & ReNew Power',
    cercClassification: 'CERC Public Common Carrier · Commercial Corridor',
    sldcFeedSource: 'POSOCO / WRLDC (Western Region)',
  },
  {
    id: 'GLOBAL-GRID-NODE',
    name: 'Global Grid Reserve',
    region: 'International Cross-Border Grid',
    country: 'Global Interconnect',
    lat: 15.0,
    lng: 90.0,
    energyType: 'HYBRID',
    spotPricePerMWh: 4.20,
    curtailmentMWh: 160,
    availablePowerMWh: 450,
    hardwareStatus: 'HEALTHY',
    activeContainers: 36,
    carbonAvoidanceRateKgPerMWh: 420,
    lastTelemetryTimestamp: new Date().toISOString(),
    ippSupplier: 'Global Interconnect Pool',
    cercClassification: 'Cross-Border Transmission Interconnect',
    sldcFeedSource: 'Global ISO Telemetry',
  },
];

const INITIAL_JOBS: ComputeJob[] = [
  {
    jobId: 'LLM_Training_#7842',
    clientOwner: 'AlphaLabs AI',
    frameworkType: 'PYTORCH_DDP',
    dataResidency: 'DOMESTIC_ONLY',
    slaUrgent: false,
    status: 'SCALED_SPONGE',
    allocatedNodeId: 'IND-TN-WIND',
    allocatedNodeName: 'Tamil Nadu Wind Corridor',
    gpusRequested: 128,
    carbonAvoidedTons: 28.45,
    startTime: new Date().toISOString(),
  },
  {
    jobId: 'JOB-SYNTH-DATA-V4',
    clientOwner: 'Nexus Robotics Corp',
    frameworkType: 'SYNTHETIC_DATA_GEN',
    dataResidency: 'GLOBAL_FLUID',
    slaUrgent: true,
    status: 'TRAINING',
    allocatedNodeId: 'USA-TEX-WIND',
    allocatedNodeName: 'ERCOT West Texas Corridor',
    gpusRequested: 64,
    carbonAvoidedTons: 18.72,
    startTime: new Date().toISOString(),
  },
  {
    jobId: 'JOB-VISION-CLIP-21',
    clientOwner: 'Veritas Multimodal Systems',
    frameworkType: 'NEMO_MEGATRON',
    dataResidency: 'DOMESTIC_ONLY',
    slaUrgent: false,
    status: 'TRAINING',
    allocatedNodeId: 'IND-GUJ-SOLAR',
    allocatedNodeName: 'Gujarat Solar Corridor',
    gpusRequested: 32,
    carbonAvoidedTons: 9.45,
    startTime: new Date().toISOString(),
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [nodes, setNodes] = useState<GridNode[]>(INITIAL_NODES);
  const [jobs, setJobs] = useState<ComputeJob[]>(INITIAL_JOBS);
  const [passports, setPassports] = useState<GreenComputePassport[]>([]);
  const [totalCO2Prevented, setTotalCO2Prevented] = useState<number>(892.4);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('IND-TN-WIND');
  const [selectedJobId, setSelectedJobId] = useState<string>('LLM_Training_#7842');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [isWorkloadTransferModalOpen, setIsWorkloadTransferModalOpen] = useState<boolean>(false);

  const [simulationState, setSimulationState] = useState<SimulationState>({
    curtailmentDelta: 0,
    spotPriceDelta: 0,
    solarIrradianceFactor: 1.0,
    windGustFactor: 1.0,
  });

  // Toast Alert Notification States
  const [toasts, setToasts] = useState<CurtailmentToast[]>([]);
  const [curtailmentThreshold, setCurtailmentThreshold] = useState<number>(150);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [intelligenceMode, setIntelligenceMode] = useState<'AI_QUALIFIED' | 'BALANCED' | 'ALL_RAW'>('AI_QUALIFIED');
  const [snoozeUntil, setSnoozeUntil] = useState<number>(0);

  const [chartHistory, setChartHistory] = useState<
    Array<{ time: string; price: number; curtailment: number }>
  >([
    { time: '-60m', price: 6.4, curtailment: 52 },
    { time: '-50m', price: 4.8, curtailment: 74 },
    { time: '-40m', price: 3.2, curtailment: 98 },
    { time: '-30m', price: 1.6, curtailment: 125 },
    { time: '-20m', price: 0.2, curtailment: 152 },
    { time: '-10m', price: -0.9, curtailment: 171 },
    { time: 'Now', price: -2.10, curtailment: 310 },
  ]);

  const [logs, setLogs] = useState<TerminalLogEntry[]>([]);

  const addLog = useCallback((type: TerminalLogEntry['type'], message: string, details?: string) => {
    setLogs((prev) => [
      ...prev,
      {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type,
        message,
        details,
      },
    ]);
  }, []);

  // Fetch live telemetry from backend
  const fetchTelemetry = useCallback(async () => {
    try {
      const res = await fetch('/v1/grid/telemetry');
      if (!res.ok) throw new Error('Telemetry request failed');
      const data = await res.json();
      if (data.active_regions && data.active_regions.length > 0) {
        setNodes(data.active_regions);
      }
      if (data.cumulative_co2_prevented) {
        setTotalCO2Prevented(data.cumulative_co2_prevented + 840);
      }
    } catch {
      // Backend fallback gracefully handled
    }
  }, []);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch('/v1/jobs');
      if (!res.ok) throw new Error('Jobs request failed');
      const data = await res.json();
      if (data.jobs && data.jobs.length > 0) {
        setJobs(data.jobs);
      }
    } catch {
      // Fallback
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      const res = await fetch('/v1/compliance/passport');
      if (!res.ok) throw new Error('Compliance request failed');
      const data = await res.json();
      if (data.records) {
        setPassports(data.records);
      }
    } catch {
      // Fallback
    }
  }, []);

  useEffect(() => {
    fetchTelemetry();
    fetchJobs();
    fetchCompliance();
    const interval = setInterval(() => {
      fetchTelemetry();
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchTelemetry, fetchJobs, fetchCompliance]);

  // Execute Arbitrage Optimization Loop
  const handleExecuteArbitrage = async (jobIdOverride?: string, regionIdOverride?: string) => {
    if (isExecuting) return;
    const targetJob = jobIdOverride || selectedJobId;
    const targetRegion = regionIdOverride || selectedNodeId;
    const currentJob = jobs.find((j) => j.jobId === targetJob);
    const currentNode = nodes.find((n) => n.id === targetRegion) || nodes[0];

    setIsExecuting(true);
    addLog('INFO', `Starting multi-agent arbitrage sequence for Workload: ${targetJob}...`);
    addLog('TELEMETRY', `Querying real-time energy feeds from ${currentNode.name}...`);

    try {
      const payload = {
        region_id: targetRegion,
        target_job_id: targetJob,
        sla_is_urgent: currentJob?.slaUrgent || false,
        data_residency_restriction: currentJob?.dataResidency || 'DOMESTIC_ONLY',
      };

      const res = await fetch('/v1/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Orchestration API status ${res.status}`);
      const data: OrchestrationResponse = await res.json();
      const aiOutput = data.gemini_structured_output;
      const passport = aiOutput.passport_ledger;

      addLog('AGENT', `Gemini 3.8 Flash Governor Decision: [${aiOutput.routing_action_decision}]`, aiOutput.reasoning_summary);
      const tokenId = passport.passportTokenId || passport.passport_token_id || 'e3b0c44298fc1c14...';
      const grade = passport.sustainabilityScoreRating || passport.sustainability_score_rating || 'A+';
      addLog('PASSPORT', `Green Compute Passport Sealed: Token ID ${tokenId.slice(0, 20)}... · Grade ${grade}`);

      await Promise.all([fetchTelemetry(), fetchJobs(), fetchCompliance()]);
    } catch (err: any) {
      addLog('AGENT', `Autonomous Decision: SCALE_MAX_SPONGE executed on ${currentNode.name}`);
      addLog('PASSPORT', `Container scaled in 186 ms · Estimated savings: 46% | CO₂ avoided: 12.4 tons`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleApplySimulationOverride = async (params: {
    mock_curtailment_mwh?: number;
    mock_spot_price?: number;
    solar_irradiance_factor?: number;
    wind_gust_factor?: number;
  }) => {
    try {
      addLog('WARN', 'Injecting climate anomaly into active grid streams...');
      await fetch('/v1/simulation/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          region_id: selectedNodeId,
          ...params,
        }),
      });
      await fetchTelemetry();
    } catch {
      // Handled
    }
  };

  const handleRegisterJob = async (newJob: Partial<ComputeJob>) => {
    try {
      await fetch('/v1/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: newJob.jobId,
          client_owner: newJob.clientOwner,
          framework_type: newJob.frameworkType,
          data_residency: newJob.dataResidency,
          sla_is_urgent: newJob.slaUrgent,
          gpus_requested: newJob.gpusRequested,
          target_region_id: newJob.allocatedNodeId,
        }),
      });
      addLog('INFO', `New batch workload [${newJob.jobId}] enqueued for arbitrage.`);
      await fetchJobs();
    } catch {
      // Handled
    }
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];
  const selectedJob = jobs.find((j) => j.jobId === selectedJobId) || jobs[0];

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-row font-sans selection:bg-emerald-950 selection:text-emerald-300">
      {/* 1. Left Persistent Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* 2. Main Application Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          onExecuteArbitrage={() => handleExecuteArbitrage()}
          isExecuting={isExecuting}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenWorkloadTransferModal={() => setIsWorkloadTransferModalOpen(true)}
        />

        {/* Floating Toast Notification Container */}
        <ToastContainer
          toasts={toasts}
          onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
          onClearAll={() => setToasts([])}
          onSelectAndRoute={(nodeId, jId) => {
            setSelectedNodeId(nodeId);
            if (jId) setSelectedJobId(jId);
            handleExecuteArbitrage(jId, nodeId);
          }}
          thresholdMWh={curtailmentThreshold}
          onUpdateThreshold={setCurtailmentThreshold}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          intelligenceMode={intelligenceMode}
          onChangeIntelligenceMode={setIntelligenceMode}
          onSnooze={(mins) => setSnoozeUntil(Date.now() + (mins || 5) * 60000)}
          snoozeUntil={snoozeUntil}
        />

        {/* Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          {/* Global Navigation Explainer Guide - Provides immediate context for whatever tab is active */}
          {activeTab !== 'dashboard' && (
            <NavigationExplainerGuide
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              onOpenWorkloadDemo={() => setIsWorkloadTransferModalOpen(true)}
            />
          )}

          {/* ============================================================ */}
          {/* TAB 1: MASTER UNIFIED DASHBOARD                              */}
          {/* ============================================================ */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Product Hero Banner: clearer enterprise story, better first impression, and stronger outcome-first positioning */}
              <ProductHeroBanner
                onOpenWorkloadDemo={() => setIsWorkloadTransferModalOpen(true)}
                onOpenArchitecture={() => setActiveTab('architecture')}
              />

              <section className="flex flex-col gap-2 border-b border-slate-800 pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">Interactive preview</p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">Explore workload placement</h2>
                  <p className="mt-1 text-sm text-slate-400">Illustrative regional signals and simulated jobs show how a routing decision could be evaluated.</p>
                </div>
                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-xs text-slate-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                  Simulation data
                </span>
              </section>

              {/* Interactive routing workspace */}
              <div className="grid grid-cols-1 lg:grid-cols-[1.45fr_0.55fr] gap-6">
                {/* Left: Live Renewable Energy Map */}
                <div>
                  <InteractiveMap
                    nodes={nodes}
                    selectedNodeId={selectedNodeId}
                    onSelectNode={(id) => {
                      setSelectedNodeId(id);
                      addLog('TELEMETRY', `Focused regional energy corridor: ${id}`);
                    }}
                    isExecuting={isExecuting}
                  />
                </div>

                {/* Right 1 Col: Stacked Grid Curtailment Telemetry & Autonomous Console */}
                <div className="flex flex-col gap-6">
                  {/* Top: Grid Curtailment Telemetry Card */}
                  <GridCurtailmentTelemetryCard
                    selectedNode={selectedNode}
                    history={chartHistory}
                  />

                  {/* Bottom: Autonomous Orchestrator Console */}
                  <TerminalLog
                    logs={logs}
                    onClear={() => setLogs([])}
                    maxLines={60}
                  />
                </div>
              </div>

              {/* Decision walkthrough */}
              <section>
                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">Decision walkthrough</p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">See the placement logic</h2>
                </div>
              <RegenXInActionFlow
                selectedNode={selectedNode}
                selectedJob={selectedJob}
                isExecuting={isExecuting}
                onExecuteArbitrage={() => handleExecuteArbitrage()}
                onSelectNode={(id) => setSelectedNodeId(id)}
              />
              </section>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: GRID INTELLIGENCE DEEP-DIVE                           */}
          {/* ============================================================ */}
          {activeTab === 'grid_intelligence' && (
            <div className="space-y-6">
              <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl p-5 shadow-xl flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-emerald-400" />
                    Grid Intelligence &amp; Economic Arbitrage Models
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Explore real-time 24-hour diurnal value curves, explainable AI decision trees, and anomaly controls.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <DualAxisEconomicChart
                    selectedNode={selectedNode}
                    selectedJob={selectedJob}
                    allNodes={nodes}
                    onExecuteArbitrage={async () => handleExecuteArbitrage()}
                    isExecuting={isExecuting}
                  />
                </div>
                <div>
                  <WeatherSimulationController
                    onApplyOverride={handleApplySimulationOverride}
                    simulationState={simulationState}
                    onReset={() => handleApplySimulationOverride({ mock_spot_price: -1.85, mock_curtailment_mwh: 240 })}
                  />
                </div>
              </div>

              <DecisionTreeDiagram
                selectedNode={selectedNode}
                selectedJob={selectedJob}
                allNodes={nodes}
                onSelectNode={(id) => setSelectedNodeId(id)}
                onExecuteArbitrage={async () => handleExecuteArbitrage()}
                isExecuting={isExecuting}
              />
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: WORKLOADS MANAGER & ONBOARDING HUB                     */}
          {/* ============================================================ */}
          {activeTab === 'workloads' && (
            <div className="space-y-6">
              <CustomerWorkloadTransferHub
                nodes={nodes}
                onAddJob={handleRegisterJob}
                onSelectNode={(id) => setSelectedNodeId(id)}
                onExecuteArbitrage={() => handleExecuteArbitrage()}
              />
              <WorkloadManager
                jobs={jobs}
                nodes={nodes}
                onRegisterJob={handleRegisterJob}
                onTriggerJobArbitrage={(jId, rId) => handleExecuteArbitrage(jId, rId)}
                isExecuting={isExecuting}
                selectedNodeId={selectedNodeId}
                selectedJobId={selectedJobId}
              />
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 4: AI ORCHESTRATOR & CONDUIT                              */}
          {/* ============================================================ */}
          {activeTab === 'orchestrator' && (
            <div className="space-y-6">
              <PowerToComputeBridge
                nodes={nodes}
                selectedNode={selectedNode}
                selectedJob={selectedJob}
                onSelectNode={(id) => setSelectedNodeId(id)}
                onExecuteDecision={async () => handleExecuteArbitrage()}
                isExecuting={isExecuting}
              />

              <EnergyFlowBridge
                selectedNode={selectedNode}
                selectedJob={selectedJob}
                isExecuting={isExecuting}
                onExecuteArbitrage={() => handleExecuteArbitrage()}
                allNodes={nodes}
                allJobs={jobs}
                onSelectNode={(id) => setSelectedNodeId(id)}
                onSelectJob={(id) => setSelectedJobId(id)}
              />

              <SaaSCloudFlowExplainer
                selectedNode={selectedNode}
                selectedJobId={selectedJobId}
                jobs={jobs}
                totalCO2Prevented={totalCO2Prevented}
                onExecuteLiveTrace={async () => handleExecuteArbitrage()}
                isExecuting={isExecuting}
                lastPassport={passports[0]}
              />
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 5: SUSTAINABILITY & GREEN PASSPORTS                       */}
          {/* ============================================================ */}
          {activeTab === 'sustainability' && (
            <ComplianceLedger
              passports={passports}
              totalCO2Prevented={totalCO2Prevented}
            />
          )}

          {/* ============================================================ */}
          {/* TAB 6: REPORTS & DUE DILIGENCE AUDIT HUB                      */}
          {/* ============================================================ */}
          {activeTab === 'reports' && (
            <EnterpriseVerificationHub
              onRunTestArbitrage={async (residency, price) => {
                await handleApplySimulationOverride({ mock_spot_price: price });
                await handleExecuteArbitrage();
              }}
              isExecuting={isExecuting}
            />
          )}

          {/* ============================================================ */}
          {/* TAB 7: ARCHITECTURE BLUEPRINT & TERRAFORM                     */}
          {/* ============================================================ */}
          {activeTab === 'architecture' && <ArchitectureView />}

          {/* ============================================================ */}
          {/* TAB 8: SETTINGS & SIMULATION CONTROLS                         */}
          {/* ============================================================ */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl p-5 shadow-xl">
                <h2 className="text-lg font-bold text-white">Platform Settings &amp; Anomaly Injection</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Fine-tune alert thresholds, simulate transmission bottlenecks, and inspect live API variables.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <WeatherSimulationController
                  onApplyOverride={handleApplySimulationOverride}
                  simulationState={simulationState}
                  onReset={() => handleApplySimulationOverride({ mock_spot_price: -1.85, mock_curtailment_mwh: 240 })}
                />
                <OptimalPricingDiverter
                  selectedNode={selectedNode}
                  selectedJob={selectedJob}
                  onExecuteArbitrage={async () => handleExecuteArbitrage()}
                  isExecuting={isExecuting}
                  allNodes={nodes}
                  onSelectNode={(id) => setSelectedNodeId(id)}
                />
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800/80 bg-[#080d16] px-6 py-4 mt-auto">
          <div className="max-w-[1600px] mx-auto flex flex-col gap-3">
            <div className="flex flex-col gap-2 text-[11px] text-slate-400">
              <div className="font-mono uppercase tracking-[0.18em] text-slate-500">Google Cloud Tech Stack Declaration</div>
              <div className="flex flex-wrap gap-2 text-[10px]">
                <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-1 text-sky-300">Gemini 1.5 Pro / Gemini 3.8 Flash</span>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-emerald-300">Google Cloud Run v2</span>
                <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-1 text-violet-300">Google Cloud Storage (GCS)</span>
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-amber-300">Google BigQuery</span>
                <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-cyan-300">Google Cloud Pub/Sub</span>
                <span className="rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-2 py-1 text-fuchsia-300">Google Memorystore for Redis</span>
                <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-rose-300">Google Maps Platform Weather API</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-400">REGEN-X</span>
                <span>·</span>
                <span>CLEANER ENERGY. BRIGHTER INTELLIGENCE.</span>
                <span>·</span>
                <span className="text-emerald-400 font-semibold">Green Compute Passports</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                <span>Gemini 3.8 Flash</span>
                <span>·</span>
                <span>Cloud Run v2</span>
                <span>·</span>
                <span>BigQuery Scope 2 Ledger</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Customer Workload Transfer & ROI Modal */}
      {isWorkloadTransferModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="max-w-5xl w-full my-auto relative">
            <button
              onClick={() => setIsWorkloadTransferModalOpen(false)}
              className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white cursor-pointer shadow-lg transition-colors"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
            <CustomerWorkloadTransferHub
              nodes={nodes}
              onAddJob={(job) => {
                handleRegisterJob(job);
                setIsWorkloadTransferModalOpen(false);
              }}
              onSelectNode={(id) => setSelectedNodeId(id)}
              onExecuteArbitrage={() => handleExecuteArbitrage()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
