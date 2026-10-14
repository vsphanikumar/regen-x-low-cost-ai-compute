import React from 'react';
import { Play, Menu, Zap, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onExecuteArbitrage: () => void;
  isExecuting: boolean;
  onOpenMobileSidebar: () => void;
  onOpenWorkloadTransferModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onExecuteArbitrage,
  isExecuting,
  onOpenMobileSidebar,
  onOpenWorkloadTransferModal,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#090d16]/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5 transition-all">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
        {/* Brand and product context */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
            aria-label="Open navigation sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-semibold text-white tracking-tight">
                REGEN-X
              </h1>
              <span className="hidden sm:inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-700">
                Renewable surplus → AI compute
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              Renewable-aware placement for flexible AI workloads.
            </p>
          </div>
        </div>

        {/* Preview status and routing actions */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-300 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span>Interactive preview</span>
          </div>

          {onOpenWorkloadTransferModal && (
            <button
              onClick={onOpenWorkloadTransferModal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-sky-300 bg-sky-950/40 hover:bg-sky-900/60 border border-sky-500/40 rounded-xl transition-all whitespace-nowrap cursor-pointer shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 text-sky-400" />
              <span>Workload routing</span>
            </button>
          )}

          <button
            onClick={onExecuteArbitrage}
            disabled={isExecuting}
            className="flex items-center gap-2 px-4 py-1.5 text-xs font-extrabold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md shadow-emerald-500/20 transition-all whitespace-nowrap cursor-pointer"
          >
            {isExecuting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Evaluating placement...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run routing preview</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
