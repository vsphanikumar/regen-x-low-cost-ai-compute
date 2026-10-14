import React from 'react';
import {
  LayoutDashboard,
  Radio,
  Cpu,
  Sparkles,
  ShieldCheck,
  Settings,
  Zap,
  Leaf,
  Layers,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'grid_intelligence'
  | 'workloads'
  | 'orchestrator'
  | 'sustainability'
  | 'reports'
  | 'architecture'
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Overview', icon: LayoutDashboard, tag: 'CONCEPT' },
    { id: 'workloads' as NavTab, label: 'Workload placement', icon: Cpu },
    { id: 'grid_intelligence' as NavTab, label: 'Grid & energy signals', icon: Radio },
    { id: 'orchestrator' as NavTab, label: 'Routing decisions', icon: Sparkles },
    { id: 'sustainability' as NavTab, label: 'Impact records', icon: Leaf },
    { id: 'reports' as NavTab, label: 'Readiness checks', icon: ShieldCheck },
    { id: 'architecture' as NavTab, label: 'Architecture & model', icon: Layers },
    { id: 'settings' as NavTab, label: 'Scenario controls', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-[#070b13] border-r border-slate-800/80 flex flex-col justify-between z-50 transition-transform duration-300 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 flex flex-col h-full justify-between">
          <div>
            {/* Brand Logo & Wordmark */}
            <div className="pb-6 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 font-black text-lg shadow-[0_0_15px_rgba(16,185,129,0.35)]">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="flex items-center">
                    <span className="text-xl font-extrabold tracking-tight text-white">REGEN</span>
                    <span className="text-xl font-extrabold text-emerald-400 ml-0.5">X</span>
                  </div>
                  <div className="text-[9px] font-mono tracking-wider text-slate-400 uppercase">
                    Clean Energy · AI Router
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 font-medium mt-2 leading-tight">
                CLEAN ENERGY. INTELLIGENCE. A BRIGHTER TOMORROW.
              </p>
            </div>

            {/* Navigation Menu */}
            <nav className="mt-5 space-y-1" aria-label="Sidebar Navigation">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)] font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Workload entry point and prototype status */}
          <div className="pt-4 border-t border-slate-800/80 space-y-3">
            <button
              onClick={() => {
                onSelectTab('workloads');
                onCloseMobile();
              }}
              className="w-full p-2.5 rounded-xl bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-sky-500/15 border border-emerald-500/30 hover:border-emerald-400 text-left transition-all cursor-pointer group shadow-sm hover:shadow-[0_0_12px_rgba(16,185,129,0.2)]"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  <span>Explore the concept</span>
                </span>
              </div>
              <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                Workload placement
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                Review a sample routing scenario
              </div>
            </button>

            <p className="px-1 text-[10px] leading-4 text-slate-500">
              Prototype workspace · sample data · no live utility connection
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
