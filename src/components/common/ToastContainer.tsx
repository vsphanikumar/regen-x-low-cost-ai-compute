import React, { useState, useEffect, useMemo } from 'react';
import {
  Zap,
  Sun,
  Wind,
  Droplets,
  X,
  ArrowRight,
  Sliders,
  Volume2,
  VolumeX,
  Bell,
  Activity,
  HelpCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  DollarSign,
  Cpu,
  ChevronDown,
  ChevronUp,
  Pause,
  Play,
  Layers,
  Award,
  Flame,
} from 'lucide-react';
import { CurtailmentToast, EnergyType } from '../../types';

interface ToastContainerProps {
  toasts: CurtailmentToast[];
  onDismiss: (id: string) => void;
  onClearAll: () => void;
  onSelectAndRoute: (nodeId: string, jobId?: string) => void;
  thresholdMWh: number;
  onUpdateThreshold: (val: number) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  intelligenceMode: 'AI_QUALIFIED' | 'BALANCED' | 'ALL_RAW';
  onChangeIntelligenceMode: (mode: 'AI_QUALIFIED' | 'BALANCED' | 'ALL_RAW') => void;
  onSnooze: (minutes?: number) => void;
  snoozeUntil: number;
  onSimulateMultiSurge?: () => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
  onClearAll,
  onSelectAndRoute,
  thresholdMWh,
  onUpdateThreshold,
  soundEnabled,
  onToggleSound,
  intelligenceMode,
  onChangeIntelligenceMode,
  onSnooze,
  snoozeUntil,
  onSimulateMultiSurge,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showConceptModal, setShowConceptModal] = useState(false);
  const [expandedExplanationId, setExpandedExplanationId] = useState<string | null>(null);
  const [toastHistory, setToastHistory] = useState<CurtailmentToast[]>([]);
  const [now, setNow] = useState(Date.now());

  // Smart Summary State
  const [summaryViewMode, setSummaryViewMode] = useState<'SMART_SUMMARY' | 'EXPANDED_CARDS'>('SMART_SUMMARY');
  const [sortBy, setSortBy] = useState<'ECONOMIC_ROI' | 'LOWEST_PRICE' | 'HIGHEST_VOLUME'>('ECONOMIC_ROI');
  const [expandedNodeDetailsId, setExpandedNodeDetailsId] = useState<string | null>(null);

  // Update clock every second for snooze countdown
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isSnoozed = snoozeUntil > now;
  const snoozeRemainingSec = isSnoozed ? Math.ceil((snoozeUntil - now) / 1000) : 0;

  // Append new toasts to history log (keep max 20)
  useEffect(() => {
    if (toasts.length > 0) {
      setToastHistory((prev) => {
        const newItems = toasts.filter((t) => !prev.some((p) => p.id === t.id));
        if (newItems.length === 0) return prev;
        return [...newItems, ...prev].slice(0, 20);
      });
    }
  }, [toasts]);

  // Economic Viability Ranking & Aggregation
  const isMultiNodeSurge = toasts.length > 1;

  const sortedToasts = useMemo(() => {
    const list = [...toasts];
    if (sortBy === 'LOWEST_PRICE') {
      return list.sort((a, b) => a.spotPricePerMWh - b.spotPricePerMWh);
    }
    if (sortBy === 'HIGHEST_VOLUME') {
      return list.sort((a, b) => b.curtailmentMWh - a.curtailmentMWh);
    }
    // Default: ECONOMIC_ROI (Highest opportunity score & highest margin)
    return list.sort((a, b) => {
      const scoreA = a.opportunityScore || 0;
      const scoreB = b.opportunityScore || 0;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return a.spotPricePerMWh - b.spotPricePerMWh;
    });
  }, [toasts, sortBy]);

  const primeNode = sortedToasts[0];

  const aggregates = useMemo(() => {
    if (toasts.length === 0) {
      return { totalVolume: 0, bestPrice: 0, totalSavings: 0, totalSaaSMargin: 0, avgScore: 0 };
    }
    const totalVolume = toasts.reduce((acc, t) => acc + t.curtailmentMWh, 0);
    const bestPrice = Math.min(...toasts.map((t) => t.spotPricePerMWh));
    const totalSavings = toasts.reduce(
      (acc, t) => acc + (t.customerSavingsEst || Math.round(t.curtailmentMWh * 115)),
      0
    );
    const totalSaaSMargin = toasts.reduce(
      (acc, t) => acc + (t.saasRevenueSpreadEst || Math.round(t.curtailmentMWh * 16.5)),
      0
    );
    const avgScore = Math.round(
      toasts.reduce((acc, t) => acc + (t.opportunityScore || 90), 0) / toasts.length
    );
    return { totalVolume, bestPrice, totalSavings, totalSaaSMargin, avgScore };
  }, [toasts]);

  const getEnergyIcon = (type: EnergyType) => {
    switch (type) {
      case 'SOLAR':
        return <Sun className="w-3.5 h-3.5 text-amber-400" />;
      case 'WIND':
        return <Wind className="w-3.5 h-3.5 text-sky-400" />;
      case 'HYDRO':
        return <Droplets className="w-3.5 h-3.5 text-blue-400" />;
      default:
        return <Zap className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <>
      {/* Floating Control Bar at Top-Right */}
      <div className="fixed top-16 sm:top-20 right-4 sm:right-6 z-50 flex flex-col items-end gap-2.5 max-w-lg w-full pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 px-3.5 py-1.5 rounded-full shadow-2xl text-[11px] text-slate-300">
          {/* Intelligence Mode Status Indicator */}
          <div className="flex items-center gap-1.5 font-semibold">
            {isSnoozed ? (
              <span className="flex items-center gap-1 text-amber-400 font-mono">
                <Pause className="w-3 h-3 animate-pulse" />
                <span>
                  Snoozed ({Math.floor(snoozeRemainingSec / 60)}m {snoozeRemainingSec % 60}s)
                </span>
              </span>
            ) : (
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-slate-400">HITL Gate:</span>
                <span className="font-mono bg-slate-950 px-1.5 py-0.5 rounded text-emerald-300 font-bold border border-emerald-500/30">
                  {intelligenceMode === 'AI_QUALIFIED'
                    ? 'AI Filtered'
                    : intelligenceMode === 'BALANCED'
                    ? 'Balanced'
                    : 'Raw Sensor'}
                </span>
              </div>
            )}
          </div>

          <div className="h-3 w-px bg-slate-700 mx-1" />

          {/* Active Surging Count Indicator */}
          {toasts.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
              <Flame className="w-3 h-3 text-amber-400" />
              <span>
                {toasts.length} {toasts.length === 1 ? 'Surge' : 'Surges'}
              </span>
            </div>
          )}

          {/* Concept Explainer Button */}
          <button
            onClick={() => setShowConceptModal(true)}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 font-semibold border border-sky-500/30 transition-colors cursor-pointer"
            title="Understand how Stranded Volume & Negative Tariffs create value"
          >
            <HelpCircle className="w-3 h-3 text-sky-400" />
            <span>ROI Concept</span>
          </button>

          {/* Snooze 5 Min Toggle */}
          <button
            onClick={() => onSnooze(isSnoozed ? 0 : 5)}
            title={isSnoozed ? 'Resume live alert stream' : 'Snooze alerts for 5 minutes'}
            className={`p-1 rounded-md transition-colors hover:text-white cursor-pointer ${
              isSnoozed ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400'
            }`}
          >
            {isSnoozed ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          {/* Quick Settings Toggle */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            title="Configure Intelligence Filter & Alert Threshold"
            className={`p-1 rounded-md transition-colors hover:text-white cursor-pointer ${
              showSettings ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute Alert Chimes' : 'Unmute Alert Chimes'}
            className={`p-1 rounded-md transition-colors hover:text-white cursor-pointer ${
              soundEnabled ? 'text-emerald-400' : 'text-slate-500'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* History Toggle */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            title="View Alert History"
            className={`p-1 rounded-md transition-colors hover:text-white relative cursor-pointer ${
              showHistory ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            {toasts.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-slate-950">
                {toasts.length}
              </span>
            )}
          </button>

          {toasts.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-[10px] text-slate-400 hover:text-rose-400 ml-1 transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Intelligence Settings Drawer Popover */}
        {showSettings && (
          <div className="pointer-events-auto bg-slate-950/95 border border-slate-700/80 rounded-xl p-4 shadow-2xl w-full text-xs space-y-3.5 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-slate-100 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                Intelligence Layer & Dispatch Controls
              </span>
              <button
                onClick={() => setShowSettings(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Filter Mode Selection */}
            <div>
              <label className="text-slate-300 font-semibold block mb-1.5">
                Intelligence Dispatch Filter
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => onChangeIntelligenceMode('AI_QUALIFIED')}
                  className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                    intelligenceMode === 'AI_QUALIFIED'
                      ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-[11px] flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    AI Qualified
                  </div>
                  <div className="text-[9px] text-slate-400 mt-0.5 leading-tight">
                    Score &ge; 70, throttled to 60s
                  </div>
                </button>
                <button
                  onClick={() => onChangeIntelligenceMode('BALANCED')}
                  className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                    intelligenceMode === 'BALANCED'
                      ? 'bg-sky-500/20 border-sky-500/60 text-sky-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-[11px] flex items-center gap-1">
                    <Activity className="w-3 h-3 text-sky-400" />
                    Balanced
                  </div>
                  <div className="text-[9px] text-slate-400 mt-0.5 leading-tight">
                    Throttled to 30s per corridor
                  </div>
                </button>
                <button
                  onClick={() => onChangeIntelligenceMode('ALL_RAW')}
                  className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                    intelligenceMode === 'ALL_RAW'
                      ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-[11px] flex items-center gap-1">
                    <Layers className="w-3 h-3 text-amber-400" />
                    Raw Sensor
                  </div>
                  <div className="text-[9px] text-slate-400 mt-0.5 leading-tight">
                    Every threshold breach
                  </div>
                </button>
              </div>
            </div>

            {/* Threshold Slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-400">Surplus Clean Energy Alert Threshold:</span>
                <span className="font-mono text-emerald-400 font-bold">{thresholdMWh} MWh</span>
              </div>
              <input
                type="range"
                min={50}
                max={300}
                step={10}
                value={thresholdMWh}
                onChange={(e) => onUpdateThreshold(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
              {onSimulateMultiSurge && (
                <button
                  onClick={() => {
                    onSimulateMultiSurge();
                    setShowSettings(false);
                  }}
                  className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 font-semibold rounded text-[11px] transition-colors cursor-pointer"
                >
                  Simulate Multi-Surge
                </button>
              )}
              <button
                onClick={() => {
                  onSnooze(isSnoozed ? 0 : 5);
                  setShowSettings(false);
                }}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold rounded text-[11px] transition-colors ml-auto cursor-pointer"
              >
                {isSnoozed ? 'Resume Alerts Now' : 'Snooze for 5 Mins'}
              </button>
            </div>
          </div>
        )}

        {/* Alert History Drawer */}
        {showHistory && (
          <div className="pointer-events-auto bg-slate-950/95 border border-slate-700/80 rounded-xl p-3.5 shadow-2xl w-full text-xs space-y-2.5 backdrop-blur-md max-h-72 overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                Recent Arbitrage Opportunities ({toastHistory.length})
              </span>
              <button
                onClick={() => setShowHistory(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {toastHistory.length === 0 ? (
              <div className="text-center py-4 text-slate-500 text-[11px]">
                No opportunities logged yet.
              </div>
            ) : (
              <div className="space-y-1.5">
                {toastHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-200 text-[11px] truncate flex items-center gap-1">
                        {getEnergyIcon(item.energyType)}
                        {item.nodeName}
                      </div>
                      <div className="text-[10px] font-mono text-emerald-400">
                        {item.curtailmentMWh} MWh · ${item.spotPricePerMWh.toFixed(2)}/MWh
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onSelectAndRoute(item.nodeId, item.matchedJobId);
                        setShowHistory(false);
                      }}
                      className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-mono text-[10px] rounded border border-emerald-500/30 shrink-0 cursor-pointer"
                    >
                      Divert
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW TYPE 1: SMART SUMMARY VIEW */}
        {isMultiNodeSurge && summaryViewMode === 'SMART_SUMMARY' && (
          <div
            role="status"
            aria-live="polite"
            className="pointer-events-auto bg-slate-900/98 border-2 border-emerald-500/60 rounded-xl p-4 shadow-2xl backdrop-blur-md relative overflow-hidden transition-all duration-300 w-full animate-in fade-in slide-in-from-right-4 hover:border-emerald-400"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-sky-400 to-amber-400 animate-pulse" />

            {/* Smart Summary Header */}
            <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0">
                  <Zap className="w-4 h-4" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-emerald-400">
                      MULTI-NODE SURGE SUMMARY
                    </span>
                    <span className="text-[9px] font-mono bg-emerald-950 px-1.5 py-0.5 rounded text-emerald-300 border border-emerald-500/40 font-bold">
                      {toasts.length} NODES SURGING
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-100 mt-0.5">
                    Coordinated Clean Generation Surges Detected
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSummaryViewMode('EXPANDED_CARDS')}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-mono transition-colors border border-slate-700 cursor-pointer"
                >
                  Cards ({toasts.length})
                </button>
                <button
                  onClick={onClearAll}
                  className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
                  aria-label="Dismiss All Alerts"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Aggregate Economic KPI Strip */}
            <div className="grid grid-cols-4 gap-2 my-3 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono">
              <div>
                <span className="text-[9px] text-slate-400 block font-sans uppercase">Total Power</span>
                <span className="text-amber-300 font-bold text-sm leading-tight block">
                  {aggregates.totalVolume}
                  <span className="text-[10px] text-slate-400 font-normal ml-0.5">MWh</span>
                </span>
                <span className="text-[9px] text-slate-500 block">Surplus Flux</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block font-sans uppercase">Energy Cost</span>
                <span
                  className={`font-bold text-sm leading-tight block ${
                    aggregates.bestPrice <= 0 ? 'text-emerald-400' : 'text-slate-100'
                  }`}
                >
                  ${aggregates.bestPrice.toFixed(2)}
                </span>
                <span className="text-[9px] text-emerald-400 block truncate font-semibold">
                  {aggregates.bestPrice <= 0 ? 'Sub-Zero' : 'Discount Rate'}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block font-sans uppercase">Savings</span>
                <span className="text-sky-300 font-bold text-sm leading-tight block truncate">
                  ${Math.round(aggregates.totalSavings / 1000)}k
                </span>
                <span className="text-[9px] text-slate-500 block truncate">~92% Cut</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block font-sans uppercase">SaaS Margin</span>
                <span className="text-emerald-300 font-bold text-sm leading-tight block truncate">
                  +${Math.round(aggregates.totalSaaSMargin / 1000)}k
                </span>
                <span className="text-[9px] text-emerald-400 block truncate">Net Profit</span>
              </div>
            </div>

            {/* Spotlight Prime Node */}
            {primeNode && (
              <div className="mb-3 p-3 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/40 rounded-xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      PRIME ARBITRAGE TARGET (#1 ROI)
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                      SCORE {primeNode.opportunityScore || 96}/100
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {primeNode.energyType} · {primeNode.curtailmentMWh} MWh
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h5 className="text-xs font-extrabold text-slate-100 flex items-center gap-1.5">
                      {getEnergyIcon(primeNode.energyType)}
                      <span>{primeNode.nodeName}</span>
                    </h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Target Job: <strong className="text-sky-300">{primeNode.matchedJobName || 'JOB-LLM-100B-09'}</strong> · Energy Cost: <strong className={primeNode.spotPricePerMWh <= 0 ? 'text-emerald-400' : 'text-slate-200'}>${primeNode.spotPricePerMWh.toFixed(2)}/MWh</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => onSelectAndRoute(primeNode.nodeId, primeNode.matchedJobId)}
                    className="px-3.5 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-md active:scale-98 shrink-0 whitespace-nowrap"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Auto-Route</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Ranked Node Comparison List */}
            <div className="space-y-1.5 mb-3">
              <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 font-mono">
                <span>SURGING CORRIDORS (RANKED)</span>
                <div className="flex items-center gap-2">
                  <span>Sort:</span>
                  <button
                    onClick={() => setSortBy('ECONOMIC_ROI')}
                    className={`cursor-pointer ${sortBy === 'ECONOMIC_ROI' ? 'text-emerald-400 font-bold' : 'hover:text-slate-200'}`}
                  >
                    ROI
                  </button>
                  <button
                    onClick={() => setSortBy('LOWEST_PRICE')}
                    className={`cursor-pointer ${sortBy === 'LOWEST_PRICE' ? 'text-emerald-400 font-bold' : 'hover:text-slate-200'}`}
                  >
                    Price
                  </button>
                  <button
                    onClick={() => setSortBy('HIGHEST_VOLUME')}
                    className={`cursor-pointer ${sortBy === 'HIGHEST_VOLUME' ? 'text-emerald-400 font-bold' : 'hover:text-slate-200'}`}
                  >
                    Volume
                  </button>
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1 pr-0.5">
                {sortedToasts.map((toast, index) => {
                  const isTop = index === 0;
                  const isExpanded = expandedNodeDetailsId === toast.id;
                  return (
                    <div
                      key={toast.id}
                      className={`p-2 rounded-lg border text-xs transition-all ${
                        isTop
                          ? 'bg-slate-950/90 border-emerald-500/30'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
                              isTop ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            #{index + 1}
                          </span>
                          <div className="truncate">
                            <span className="font-semibold text-slate-200 text-[11px] flex items-center gap-1">
                              {getEnergyIcon(toast.energyType)}
                              <span className="truncate">{toast.nodeName}</span>
                            </span>
                            <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
                              <span className={toast.spotPricePerMWh <= 0 ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                                ${toast.spotPricePerMWh.toFixed(2)}/MWh
                              </span>
                              <span className="text-amber-300 font-bold">{toast.curtailmentMWh} MWh</span>
                              <span className="text-sky-300">Score {toast.opportunityScore || 90}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => setExpandedNodeDetailsId(isExpanded ? null : toast.id)}
                            className="text-slate-400 hover:text-white p-1 rounded transition-colors text-[10px] cursor-pointer"
                            title="Inspect Opportunity Breakdown"
                          >
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                          <button
                            onClick={() => onSelectAndRoute(toast.nodeId, toast.matchedJobId)}
                            className="px-2.5 py-1 bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 hover:text-emerald-200 font-mono text-[10px] font-bold rounded border border-emerald-500/30 transition-all cursor-pointer flex items-center gap-1"
                          >
                            <span>Divert</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 font-mono grid grid-cols-3 gap-1 animate-in fade-in duration-150">
                          <div>
                            <span className="text-slate-500 block">Workload:</span>
                            <span className="text-slate-300 truncate block">
                              {toast.matchedJobName || 'Batch Job'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Est. Savings:</span>
                            <span className="text-sky-400 font-bold">
                              ${(toast.customerSavingsEst || Math.round(toast.curtailmentMWh * 115)).toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">SaaS Spread:</span>
                            <span className="text-emerald-400 font-bold">
                              +${(toast.saasRevenueSpreadEst || Math.round(toast.curtailmentMWh * 16.5)).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Smart Summary Footer */}
            <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/80 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSnooze(5)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Snooze 5m</span>
                </button>
                <button
                  onClick={onClearAll}
                  className="px-2.5 py-1.5 bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[11px] rounded-lg transition-colors cursor-pointer"
                >
                  Dismiss All
                </button>
              </div>
              <button
                onClick={() => setShowConceptModal(true)}
                className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium transition-colors cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Why Surges Occur</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW TYPE 2: EXPANDED CARDS VIEW */}
        {(!isMultiNodeSurge || summaryViewMode === 'EXPANDED_CARDS') && (
          <div className="space-y-2.5 w-full">
            {isMultiNodeSurge && summaryViewMode === 'EXPANDED_CARDS' && (
              <div className="pointer-events-auto bg-slate-900/95 border border-slate-800 rounded-lg px-3 py-1.5 flex items-center justify-between text-xs text-slate-300">
                <span className="font-mono text-[11px] text-slate-400">
                  Showing {toasts.length} individual cards
                </span>
                <button
                  onClick={() => setSummaryViewMode('SMART_SUMMARY')}
                  className="text-emerald-400 hover:text-emerald-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <Zap className="w-3 h-3" />
                  <span>Group into Summary</span>
                </button>
              </div>
            )}

            {toasts.map((toast) => {
              const isExpanded = expandedExplanationId === toast.id;
              const savingsDollars = toast.customerSavingsEst || Math.round(toast.curtailmentMWh * 115);
              const savingsPercent = toast.customerSavingsPct || 92;
              const saasProfit = toast.saasRevenueSpreadEst || Math.round(toast.curtailmentMWh * 16.5);
              const score = toast.opportunityScore || 94;

              return (
                <div
                  key={toast.id}
                  role="alert"
                  className="pointer-events-auto bg-slate-900/98 border-2 border-emerald-500/60 rounded-xl p-4 shadow-2xl backdrop-blur-md relative overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-right-4 hover:border-emerald-400"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-sky-400 to-amber-400 animate-pulse" />

                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-emerald-400">
                            HITL ARBITRAGE PROPOSAL
                          </span>
                          <span className="text-[9px] font-mono bg-emerald-950 px-1.5 py-0.5 rounded text-emerald-300 border border-emerald-500/40 font-bold">
                            SCORE {score}/100
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5 mt-0.5">
                          {getEnergyIcon(toast.energyType)}
                          {toast.nodeName}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setExpandedExplanationId(isExpanded ? null : toast.id)}
                        className="text-sky-400 hover:text-sky-300 p-1 rounded transition-colors text-[10px] flex items-center gap-0.5 font-mono cursor-pointer"
                        title="Explain economic rationale"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDismiss(toast.id)}
                        className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
                        aria-label="Dismiss Alert"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-2 my-2.5 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">SURPLUS ENERGY</span>
                      <span className="text-amber-300 font-bold text-sm">
                        {toast.curtailmentMWh} MWh
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1 block">
                        Clean Power
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">SPOT PRICE</span>
                      <span
                        className={`font-bold text-sm ${
                          toast.spotPricePerMWh <= 0 ? 'text-emerald-400' : 'text-slate-100'
                        }`}
                      >
                        ${toast.spotPricePerMWh.toFixed(2)} / MWh
                      </span>
                      <span className="text-[10px] text-emerald-400 ml-1 block font-semibold">
                        {toast.spotPricePerMWh <= 0 ? 'Sub-Zero Rate' : 'Discount Rate'}
                      </span>
                    </div>
                  </div>

                  {/* Workload context */}
                  <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 space-y-1 mb-2.5 text-[11px]">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Cpu className="w-3 h-3 text-sky-400" />
                        Target Workload:
                      </span>
                      <span className="font-mono font-bold text-sky-300">
                        {toast.matchedJobName || 'JOB-LLM-100B-09 (64x H100)'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1 text-slate-400">
                        <DollarSign className="w-3 h-3 text-emerald-400" />
                        Power Cost Savings:
                      </span>
                      <span className="font-mono font-bold text-emerald-400">
                        {savingsPercent}% (~${savingsDollars.toLocaleString()})
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Award className="w-3 h-3 text-amber-400" />
                        SaaS Revenue Spread:
                      </span>
                      <span className="font-mono font-bold text-amber-300">
                        +${saasProfit.toLocaleString()} margin
                      </span>
                    </div>
                  </div>

                  {/* Collapsible Explainer */}
                  {isExpanded && (
                    <div className="mb-3 p-2.5 bg-slate-950 border border-sky-500/30 rounded-lg text-[11px] space-y-1.5 text-slate-300 animate-in fade-in duration-150">
                      <div className="font-bold text-sky-300 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                        Economic Mechanics:
                      </div>
                      <p className="text-slate-400 leading-relaxed">
                        1. <strong className="text-amber-300">Surplus Clean Energy ({toast.curtailmentMWh} MWh)</strong>: Solar and wind generated beyond local transmission capacity.
                      </p>
                      <p className="text-slate-400 leading-relaxed">
                        2. <strong className="text-emerald-400">Sub-Zero Spot Price (${toast.spotPricePerMWh.toFixed(2)}/MWh)</strong>: Grid pays to absorb power rather than curtail generation.
                      </p>
                      <p className="text-slate-400 leading-relaxed">
                        3. <strong className="text-slate-200">Customer &amp; SaaS ROI</strong>: Customer saves {savingsPercent}%; REGEN-X collects +${saasProfit} software margin with verifiable Green Passports.
                      </p>
                    </div>
                  )}

                  {/* Action Controls */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
                    <button
                      onClick={() => onSelectAndRoute(toast.nodeId, toast.matchedJobId)}
                      className="flex-1 py-2 px-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-98"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Approve &amp; Divert Power</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onSnooze(5)}
                      className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      title="Snooze alerts for 5 minutes"
                    >
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Snooze</span>
                    </button>
                    <button
                      onClick={() => onDismiss(toast.id)}
                      className="px-2.5 py-2 bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Concept & ROI Modal */}
      {showConceptModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    Multi-Node Surges &amp; Arbitrage Clustering
                  </h3>
                  <p className="text-xs text-slate-400">
                    How Simultaneous Renewable Overproduction Creates Real Value
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowConceptModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Sun className="w-4 h-4" />
                  <span>1. Renewable Overproduction</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  During peak solar midday or strong wind regimes, renewable corridors generate more electricity than transmission grids can absorb.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 space-y-2">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <DollarSign className="w-4 h-4" />
                  <span>2. Sub-Zero Electricity Prices</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Generators offer negative spot pricing to avoid curtailment penalties, providing free clean power with generator credits.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-sky-500/30 space-y-2">
                <div className="flex items-center gap-1.5 text-sky-400 font-bold">
                  <Cpu className="w-4 h-4" />
                  <span>3. Compute As Energy Sponge</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Asynchronous AI batch workloads (fine-tuning, synthetic data, embedding indexing) flex to absorb clean wattage instantly.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-purple-500/30 space-y-2">
                <div className="flex items-center gap-1.5 text-purple-400 font-bold">
                  <Award className="w-4 h-4" />
                  <span>4. Cryptographic ESG Verification</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Every batch execution mints an immutable Green Compute Passport with SHA-256 tokens recorded to BigQuery for Scope 2 compliance.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowConceptModal(false)}
                className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Close Explanation
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
