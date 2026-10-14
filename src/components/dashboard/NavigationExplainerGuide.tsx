import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  TrendingDown,
  ShieldCheck,
  Cpu,
  ArrowRight,
  Layers,
  ChevronRight,
  HelpCircle,
  X,
  FileText
} from 'lucide-react';
import { NavTab } from '../layout/Sidebar';

interface NavigationExplainerGuideProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenWorkloadDemo: () => void;
}

export const NavigationExplainerGuide: React.FC<NavigationExplainerGuideProps> = ({
  activeTab,
  onSelectTab,
  onOpenWorkloadDemo,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const tabGuides: Record<
    NavTab,
    { title: string; subtitle: string; solves: string; keyMetric: string; actionCTA?: string; actionTab?: NavTab }
  > = {
    dashboard: {
      title: 'Unified platform overview',
      subtitle: 'Live telemetry across renewable corridors, AI workload demand, and cost-aware routing decisions',
      solves: 'Provides a clear operational view of where surplus energy exists, how workloads are matched to it, and what impact is delivered.',
      keyMetric: 'Live renewable surplus & avoided carbon',
    },
    grid_intelligence: {
      title: 'Grid intelligence & weather simulation',
      subtitle: 'Diurnal pricing signals, explainable decision logic, and transmission bottleneck analysis',
      solves: 'Shows how weather and grid conditions influence workload placement and cost efficiency across renewable-rich regions.',
      keyMetric: '24-hour pricing and surplus sensitivity',
    },
    workloads: {
      title: 'Workload transfer hub',
      subtitle: 'Where AI teams connect training and inference pipelines, compare savings, and review platform economics',
      solves: 'Answer the key business question: how workloads can move to cleaner, lower-cost compute without compromising performance or compliance.',
      keyMetric: 'Up to 70% savings & measurable ROI',
      actionCTA: 'Launch Workload Demo',
    },
    orchestrator: {
      title: 'AI orchestration layer',
      subtitle: 'Decision pipeline for signal gathering, grid evaluation, and workload dispatch',
      solves: 'Shows how the system evaluates renewable availability, latency SLAs, and regional constraints before routing AI jobs.',
      keyMetric: 'Reasoning trace & routing confidence',
    },
    sustainability: {
      title: 'ESG compliance ledger & green passports',
      subtitle: 'Cryptographic proof and audit-ready carbon verification for compute execution',
      solves: 'Provides evidence that the workload ran on previously curtailed renewable power and that the carbon impact was measured and recorded.',
      keyMetric: 'Audit-grade emissions proof',
    },
    reports: {
      title: 'Verification & readiness hub',
      subtitle: 'Review checks, compliance attestations, and platform readiness indicators',
      solves: 'Gives stakeholders a clear view of operational readiness, governance, and traceability.',
      keyMetric: 'Deployment readiness checks',
    },
    architecture: {
      title: 'Infrastructure & regional routing blueprint',
      subtitle: 'System layout, compute-site strategy, and the operating model behind renewable-powered AI infrastructure',
      solves: 'Explains the physical and regulatory logic needed to match surplus renewable energy with AI compute demand.',
      keyMetric: 'Regional routing design',
    },
    settings: {
      title: 'Platform calibration & anomaly simulation',
      subtitle: 'Stress-test the system under grid volatility, weather swings, and operational disruption',
      solves: 'Helps validate resilience and decision quality when real-world conditions shift unexpectedly.',
      keyMetric: 'Simulation state delta',
    },
  };

  const currentGuide = tabGuides[activeTab] || tabGuides.dashboard;

  return (
    <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
      <div className="flex items-start sm:items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 font-bold">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm">{currentGuide.title}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">
              Active Section Guide
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-0.5">
            <strong className="text-slate-300">Purpose:</strong> {currentGuide.solves}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
        {currentGuide.actionCTA && (
          <button
            onClick={onOpenWorkloadDemo}
            className="px-3 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{currentGuide.actionCTA}</span>
          </button>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs transition-colors flex items-center gap-1 cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
          <span>{isOpen ? 'Close Nav Map' : 'Explore All Sections'}</span>
        </button>
      </div>

      {/* Expanded Quick-Nav Map Modal / Drawer */}
      {isOpen && (
        <div className="w-full pt-3 mt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 animate-fadeIn">
          {Object.entries(tabGuides).map(([tabKey, guide]) => {
            const isCurrent = activeTab === tabKey;
            return (
              <button
                key={tabKey}
                onClick={() => {
                  onSelectTab(tabKey as NavTab);
                  setIsOpen(false);
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/80 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-between">
                  <span className={isCurrent ? 'text-emerald-300' : 'text-slate-100'}>{guide.title}</span>
                  {isCurrent && <span className="text-[10px] text-emerald-400 font-mono">Current</span>}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-tight">
                  {guide.solves}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
