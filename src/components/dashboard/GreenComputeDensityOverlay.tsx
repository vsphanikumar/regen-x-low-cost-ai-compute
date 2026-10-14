import React from 'react';
import { GridNode } from '../../types';
import {
  Sun,
  Wind,
  Droplets,
  Zap,
  Cpu,
  Sparkles,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
} from 'lucide-react';

export type GreenDensityTier =
  | 'SUPER_SURGE'
  | 'ABUNDANT'
  | 'BALANCED'
  | 'CONSTRAINED'
  | 'CRITICAL_DEFICIT';

export interface GreenComputeDensityMetrics {
  nodeId: string;
  regionName: string;
  country: string;
  center: { x: number; y: number };
  energyType: 'SOLAR' | 'WIND' | 'HYDRO' | 'HYBRID';
  spotPricePerMWh: number;
  hardwareStatus: string;
  curtailmentMWh: number;
  availablePowerMWh: number;
  solarOutputMWh: number;
  windOutputMWh: number;
  hydroOutputMWh: number;
  totalRenewableOutputMWh: number;
  activeContainers: number;
  containerDrawMWh: number;
  localBaseloadDemandMWh: number;
  totalComputeDemandMWh: number;
  densityRatio: number;
  netSurplusMWh: number;
  densityScorePct: number;
  tier: GreenDensityTier;
  tierColor: string;
  tierBgRgba: string;
  tierBorderColor: string;
  tierBadgeClass: string;
  tierLabel: string;
  dispatchStatus: 'ABSORB_IMMEDIATELY' | 'ACCEPT_STANDARD' | 'MONITOR_CLOSELY' | 'DIVERT_AWAY';
  dispatchRecommendation: string;
  absorptiveHeadroomGpus: number;
  carbonAvoidanceRateKgPerMWh: number;
  polygonPath: string;
}

export const REGION_POLYGONS: Record<string, string> = {
  'USA-TEX-WIND': 'M 185,135 L 295,125 L 320,185 L 285,235 L 215,245 L 175,195 Z',
  'CHL-ATA-SOLAR': 'M 280,270 L 350,275 L 360,345 L 325,395 L 290,360 L 275,305 Z',
  'EUR-NOR-HYDRO': 'M 485,70 L 565,65 L 580,120 L 535,140 L 490,125 Z',
  'IND-GUJ-SOLAR': 'M 640,175 L 715,170 L 730,225 L 685,245 L 635,225 Z',
  'IND-TN-WIND': 'M 670,230 L 730,230 L 725,285 L 690,295 L 665,270 Z',
  'AUS-SA-HYBRID': 'M 805,315 L 895,310 L 910,375 L 855,405 L 800,365 Z',
};

export const REGIONAL_BASELOAD_DEMAND_MWH: Record<string, number> = {
  'USA-TEX-WIND': 55,
  'CHL-ATA-SOLAR': 30,
  'EUR-NOR-HYDRO': 50,
  'IND-GUJ-SOLAR': 45,
  'IND-TN-WIND': 110,
  'AUS-SA-HYBRID': 130,
};

export const calculateGreenComputeDensity = (
  node: GridNode,
  coords: { x: number; y: number },
  demandScaleMultiplier: number = 1.0,
  solarFactor: number = 1.0,
  windFactor: number = 1.0
): GreenComputeDensityMetrics => {
  let solarOutput = 0;
  let windOutput = 0;
  let hydroOutput = 0;

  if (node.energyType === 'SOLAR') {
    solarOutput = Math.round(
      node.curtailmentMWh + node.availablePowerMWh * 0.44 * Math.max(0.2, solarFactor)
    );
  } else if (node.energyType === 'WIND') {
    windOutput = Math.round(
      node.curtailmentMWh + node.availablePowerMWh * 0.40 * Math.max(0.2, windFactor)
    );
  } else if (node.energyType === 'HYDRO') {
    hydroOutput = Math.round(node.curtailmentMWh + node.availablePowerMWh * 0.52);
  } else {
    solarOutput = Math.round(
      node.curtailmentMWh * 0.52 + node.availablePowerMWh * 0.22 * Math.max(0.2, solarFactor)
    );
    windOutput = Math.round(
      node.curtailmentMWh * 0.48 + node.availablePowerMWh * 0.22 * Math.max(0.2, windFactor)
    );
  }

  const totalRenewableOutputMWh = Math.max(10, solarOutput + windOutput + hydroOutput);
  const baseline = REGIONAL_BASELOAD_DEMAND_MWH[node.id] || 60;
  const containerDraw = Math.round((node.activeContainers || 32) * 2.85 * demandScaleMultiplier);
  const localBaseloadDemandMWh = Math.round(baseline * demandScaleMultiplier);
  const totalComputeDemandMWh = Math.max(20, containerDraw + localBaseloadDemandMWh);

  const densityRatio = Number((totalRenewableOutputMWh / totalComputeDemandMWh).toFixed(2));
  const netSurplusMWh = totalRenewableOutputMWh - totalComputeDemandMWh;
  const densityScorePct = Math.min(100, Math.max(5, Math.round((densityRatio / 2.5) * 100)));

  let tier: GreenDensityTier = 'BALANCED';
  let tierColor = '#eab308';
  let tierBgRgba = 'rgba(234, 179, 8, 0.22)';
  let tierBorderColor = 'rgba(234, 179, 8, 0.7)';
  let tierBadgeClass = 'bg-amber-950/80 text-amber-300 border-amber-500/70';
  let tierLabel = 'Balanced Equilibrium';
  let dispatchStatus: GreenComputeDensityMetrics['dispatchStatus'] = 'ACCEPT_STANDARD';
  let dispatchRecommendation = 'Balanced clean supply: absorb standard low-urgency batches.';
  let absorptiveHeadroomGpus = 32;

  if (densityRatio >= 2.0) {
    tier = 'SUPER_SURGE';
    tierColor = '#10b981';
    tierBgRgba = 'rgba(16, 185, 129, 0.28)';
    tierBorderColor = 'rgba(16, 185, 129, 0.85)';
    tierBadgeClass = 'bg-emerald-950/90 text-emerald-300 border-emerald-500/80';
    tierLabel = 'Super-Dense Clean Surplus';
    dispatchStatus = 'ABSORB_IMMEDIATELY';
    dispatchRecommendation = 'Prime Sink: 100% clean surplus available. Dispatch maximum GPU training clusters.';
    absorptiveHeadroomGpus = Math.max(128, Math.round(netSurplusMWh / 1.5));
  } else if (densityRatio >= 1.4) {
    tier = 'ABUNDANT';
    tierColor = '#22c55e';
    tierBgRgba = 'rgba(34, 197, 94, 0.24)';
    tierBorderColor = 'rgba(34, 197, 94, 0.75)';
    tierBadgeClass = 'bg-emerald-950/70 text-emerald-300 border-emerald-500/60';
    tierLabel = 'Abundant Green Density';
    dispatchStatus = 'ABSORB_IMMEDIATELY';
    dispatchRecommendation = 'Ample clean generation: safe to route long-running PyTorch DDP and synthetic jobs.';
    absorptiveHeadroomGpus = Math.max(64, Math.round(netSurplusMWh / 1.8));
  } else if (densityRatio >= 1.0) {
    tier = 'BALANCED';
    tierColor = '#eab308';
    tierBgRgba = 'rgba(234, 179, 8, 0.20)';
    tierBorderColor = 'rgba(234, 179, 8, 0.65)';
    tierBadgeClass = 'bg-amber-950/60 text-amber-300 border-amber-500/50';
    tierLabel = 'Balanced Equilibrium';
    dispatchStatus = 'ACCEPT_STANDARD';
    dispatchRecommendation = 'Grid balanced: local compute consumes nearly all clean output.';
    absorptiveHeadroomGpus = Math.max(16, Math.round(netSurplusMWh / 2.2));
  } else if (densityRatio >= 0.65) {
    tier = 'CONSTRAINED';
    tierColor = '#f97316';
    tierBgRgba = 'rgba(249, 115, 22, 0.26)';
    tierBorderColor = 'rgba(249, 115, 22, 0.75)';
    tierBadgeClass = 'bg-orange-950/70 text-orange-300 border-orange-500/60';
    tierLabel = 'Constrained Clean Supply';
    dispatchStatus = 'MONITOR_CLOSELY';
    dispatchRecommendation = 'Compute demand approaching clean supply. Modulating GPU power throttle.';
    absorptiveHeadroomGpus = 0;
  } else {
    tier = 'CRITICAL_DEFICIT';
    tierColor = '#f43f5e';
    tierBgRgba = 'rgba(244, 63, 94, 0.32)';
    tierBorderColor = 'rgba(244, 63, 94, 0.85)';
    tierBadgeClass = 'bg-rose-950/80 text-rose-300 border-rose-500/80';
    tierLabel = 'Critical Clean Deficit';
    dispatchStatus = 'DIVERT_AWAY';
    dispatchRecommendation = 'Deficit alert: high compute strain. Immediate workload diversion recommended.';
    absorptiveHeadroomGpus = -Math.round(Math.abs(netSurplusMWh) / 1.5);
  }

  const polygonPath =
    REGION_POLYGONS[node.id] ||
    `M ${coords.x - 45},${coords.y - 35} L ${coords.x + 45},${coords.y - 35} L ${coords.x + 55},${coords.y + 35} L ${coords.x - 45},${coords.y + 40} Z`;

  return {
    nodeId: node.id,
    regionName: node.name,
    country: node.country,
    center: coords,
    energyType: node.energyType,
    spotPricePerMWh: node.spotPricePerMWh,
    hardwareStatus: node.hardwareStatus,
    curtailmentMWh: node.curtailmentMWh,
    availablePowerMWh: node.availablePowerMWh,
    solarOutputMWh: solarOutput,
    windOutputMWh: windOutput,
    hydroOutputMWh: hydroOutput,
    totalRenewableOutputMWh,
    activeContainers: node.activeContainers,
    containerDrawMWh: containerDraw,
    localBaseloadDemandMWh,
    totalComputeDemandMWh,
    densityRatio,
    netSurplusMWh,
    densityScorePct,
    tier,
    tierColor,
    tierBgRgba,
    tierBorderColor,
    tierBadgeClass,
    tierLabel,
    dispatchStatus,
    dispatchRecommendation,
    absorptiveHeadroomGpus,
    carbonAvoidanceRateKgPerMWh: node.carbonAvoidanceRateKgPerMWh || 420,
    polygonPath,
  };
};

/* SVG OVERLAY LAYER */
interface GreenDensitySvgLayerProps {
  metrics: GreenComputeDensityMetrics[];
  selectedNodeId: string;
  hoveredNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  onHoverNode: (nodeId: string | null) => void;
  displayMode: 'all' | 'choropleth' | 'heatwaves' | 'ratios';
  opacity: number;
}

export const GreenDensitySvgLayer: React.FC<GreenDensitySvgLayerProps> = ({
  metrics,
  selectedNodeId,
  hoveredNodeId,
  onSelectNode,
  onHoverNode,
  displayMode,
  opacity,
}) => {
  return (
    <g id="green-compute-density-layer" className="transition-opacity duration-300">
      <defs>
        <pattern
          id="strainHatch"
          width="8"
          height="8"
          patternTransform="rotate(45 0 0)"
          patternUnits="userSpaceOnUse"
        >
          <line x1="0" y1="0" x2="0" y2="8" stroke="#f43f5e" strokeWidth="1.5" strokeOpacity="0.45" />
        </pattern>
        {metrics.map((m) => (
          <React.Fragment key={`defs-${m.nodeId}`}>
            <radialGradient
              id={`heatHalo-${m.nodeId}`}
              cx="50%"
              cy="50%"
              r="50%"
              fx="50%"
              fy="50%"
            >
              <stop offset="0%" stopColor={m.tierColor} stopOpacity={0.45 * opacity} />
              <stop offset="60%" stopColor={m.tierColor} stopOpacity={0.18 * opacity} />
              <stop offset="100%" stopColor={m.tierColor} stopOpacity={0} />
            </radialGradient>
            <linearGradient
              id={`polyGrad-${m.nodeId}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor={m.tierColor} stopOpacity={0.35 * opacity} />
              <stop offset="50%" stopColor={m.tierColor} stopOpacity={0.18 * opacity} />
              <stop offset="100%" stopColor={m.tierColor} stopOpacity={0.06 * opacity} />
            </linearGradient>
          </React.Fragment>
        ))}
      </defs>

      {/* 1. Atmospheric Heat Dispersion Waves */}
      {(displayMode === 'all' || displayMode === 'heatwaves') &&
        metrics.map((m) => {
          const isSelected = m.nodeId === selectedNodeId;
          const isHovered = m.nodeId === hoveredNodeId;
          const radius = Math.min(85, Math.max(45, 45 + m.densityRatio * 14));
          return (
            <g
              key={`heatwave-${m.nodeId}`}
              className="cursor-pointer pointer-events-none"
            >
              <circle
                cx={m.center.x}
                cy={m.center.y}
                r={radius}
                fill={`url(#heatHalo-${m.nodeId})`}
                className="transition-all duration-300"
              />
              {m.densityRatio >= 1.4 && (
                <circle
                  cx={m.center.x}
                  cy={m.center.y}
                  r={radius * 0.75}
                  fill="none"
                  stroke={m.tierColor}
                  strokeWidth="1"
                  strokeDasharray="4 6"
                  opacity={isSelected || isHovered ? 0.7 : 0.4}
                >
                  <animate
                    attributeName="r"
                    values={`${radius * 0.4};${radius * 0.95}`}
                    dur="3.5s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.6;0"
                    dur="3.5s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </g>
          );
        })}

      {/* 2. Color-Coded Regional Boundaries */}
      {(displayMode === 'all' || displayMode === 'choropleth') &&
        metrics.map((m) => {
          const isSelected = m.nodeId === selectedNodeId;
          const isHovered = m.nodeId === hoveredNodeId;
          return (
            <g
              key={`choropleth-${m.nodeId}`}
              onClick={() => onSelectNode(m.nodeId)}
              onMouseEnter={() => onHoverNode(m.nodeId)}
              onMouseLeave={() => onHoverNode(null)}
              className="cursor-pointer transition-all duration-200"
            >
              <path
                d={m.polygonPath}
                fill={`url(#polyGrad-${m.nodeId})`}
                stroke={m.tierColor}
                strokeWidth={isSelected ? '2.5' : isHovered ? '2.0' : '1.4'}
                strokeDasharray={m.tier === 'CRITICAL_DEFICIT' ? '4 3' : 'none'}
                strokeOpacity={isSelected ? 1 : isHovered ? 0.9 : 0.65}
                className="transition-all duration-200"
              />
              {m.tier === 'CRITICAL_DEFICIT' && (
                <path
                  d={m.polygonPath}
                  fill="url(#strainHatch)"
                  opacity={opacity * 0.8}
                />
              )}
            </g>
          );
        })}

      {/* 3. In-Map Green Compute Density Ratio Badges */}
      {(displayMode === 'all' || displayMode === 'ratios') &&
        metrics.map((m) => {
          const isSelected = m.nodeId === selectedNodeId;
          const isHovered = m.nodeId === hoveredNodeId;
          const badgeX = m.center.x - 48;
          const badgeY = m.center.y - 48;
          return (
            <g
              key={`ratio-badge-${m.nodeId}`}
              transform={`translate(${badgeX}, ${badgeY})`}
              className="cursor-pointer select-none"
              onClick={() => onSelectNode(m.nodeId)}
              onMouseEnter={() => onHoverNode(m.nodeId)}
              onMouseLeave={() => onHoverNode(null)}
            >
              <rect
                width="96"
                height="22"
                rx="4.5"
                fill="#070b14"
                stroke={isSelected ? '#ffffff' : m.tierColor}
                strokeWidth={isSelected ? '1.8' : isHovered ? '1.4' : '1'}
                opacity="0.94"
                className="transition-all duration-200"
              />
              <circle
                cx="10"
                cy="11"
                r="3.5"
                fill={m.tierColor}
                className={m.densityRatio >= 1.5 ? 'animate-pulse' : ''}
              />
              <text
                x="18"
                y="14.5"
                fill={m.tierColor}
                fontSize="9"
                fontWeight="bold"
                fontFamily="monospace"
              >
                {m.densityRatio}x DENSITY
              </text>
              <g transform="translate(6, 18)">
                <rect width="84" height="2" rx="1" fill="#1e293b" />
                <rect
                  width={Math.min(84, Math.round((m.densityScorePct / 100) * 84))}
                  height="2"
                  rx="1"
                  fill={m.tierColor}
                />
              </g>
            </g>
          );
        })}
    </g>
  );
};

/* OVERLAY CONTROL BAR */
interface GreenDensityControlBarProps {
  isOverlayEnabled: boolean;
  onToggleOverlay: () => void;
  displayMode: 'all' | 'choropleth' | 'heatwaves' | 'ratios';
  onChangeDisplayMode: (mode: 'all' | 'choropleth' | 'heatwaves' | 'ratios') => void;
  demandScaleMultiplier: number;
  onChangeDemandMultiplier: (mult: number) => void;
  showComparisonDrawer: boolean;
  onToggleComparisonDrawer: () => void;
  averageDensityRatio: number;
  surplusRegionCount: number;
  totalRegions: number;
}

export const GreenDensityControlBar: React.FC<GreenDensityControlBarProps> = ({
  isOverlayEnabled,
  onToggleOverlay,
  displayMode,
  onChangeDisplayMode,
  demandScaleMultiplier,
  onChangeDemandMultiplier,
  showComparisonDrawer,
  onToggleComparisonDrawer,
  averageDensityRatio,
  surplusRegionCount,
  totalRegions,
}) => {
  return (
    <div className="bg-slate-950/95 border-b border-slate-800 px-4 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleOverlay}
          className={`flex items-center gap-2 px-3 py-1 rounded-lg font-semibold transition-all border cursor-pointer ${
            isOverlayEnabled
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
          title="Toggle color-coded Green Compute Density overlay"
        >
          {isOverlayEnabled ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>Density Overlay</span>
          <span
            className={`w-2 h-2 rounded-full ${
              isOverlayEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
            }`}
          />
        </button>
        {isOverlayEnabled && (
          <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-400">
            <span className="font-mono text-slate-300">
              Avg: <strong className="text-emerald-400 font-bold">{averageDensityRatio}x</strong>
            </span>
            <span className="text-slate-600">·</span>
            <span className="font-mono text-slate-300">
              Surplus: <strong className="text-emerald-300">{surplusRegionCount}/{totalRegions}</strong>
            </span>
          </div>
        )}
      </div>

      {isOverlayEnabled && (
        <div className="flex items-center flex-wrap gap-2 text-[11px]">
          <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[11px]">
            <button
              onClick={() => onChangeDisplayMode('all')}
              className={`px-2 py-0.5 rounded transition-all font-medium cursor-pointer ${
                displayMode === 'all'
                  ? 'bg-slate-800 text-emerald-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Layers
            </button>
            <button
              onClick={() => onChangeDisplayMode('choropleth')}
              className={`px-2 py-0.5 rounded transition-all font-medium cursor-pointer ${
                displayMode === 'choropleth'
                  ? 'bg-slate-800 text-emerald-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Zones
            </button>
            <button
              onClick={() => onChangeDisplayMode('heatwaves')}
              className={`px-2 py-0.5 rounded transition-all font-medium cursor-pointer ${
                displayMode === 'heatwaves'
                  ? 'bg-slate-800 text-emerald-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Heat Halo
            </button>
            <button
              onClick={() => onChangeDisplayMode('ratios')}
              className={`px-2 py-0.5 rounded transition-all font-medium cursor-pointer ${
                displayMode === 'ratios'
                  ? 'bg-slate-800 text-emerald-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Ratios
            </button>
          </div>

          <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-800">
            <span className="text-slate-400 font-medium hidden lg:inline">Stress:</span>
            <div className="flex items-center bg-slate-900 p-0.5 rounded border border-slate-800 font-mono text-[10px]">
              {[0.5, 1.0, 1.5, 2.0].map((mult) => (
                <button
                  key={mult}
                  onClick={() => onChangeDemandMultiplier(mult)}
                  className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                    demandScaleMultiplier === mult
                      ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {mult === 1.0 ? '1.0x' : `${mult}x`}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={onToggleComparisonDrawer}
            className={`flex items-center gap-1 px-2.5 py-1 rounded border font-semibold transition-all cursor-pointer ${
              showComparisonDrawer
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Matrix</span>
            {showComparisonDrawer ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      )}
    </div>
  );
};

/* SPECTRUM COLOR LEGEND */
export const GreenDensityLegend: React.FC = () => {
  return (
    <div className="bg-slate-950/90 border-t border-slate-800/80 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-[11px]">
      <div className="flex items-center gap-2">
        <span className="font-bold text-slate-300">Density Scale:</span>
        <span className="text-slate-500 hidden sm:inline font-mono">
          (Renewable Output MWh / Local AI Demand MWh)
        </span>
      </div>
      <div className="flex items-center flex-wrap gap-2.5 font-mono text-[10px]">
        <div className="flex items-center gap-1.5" title="Deficit: Compute demand exceeds clean solar/wind supply.">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-rose-400" />
          <span className="text-rose-400">&lt;0.65x (Deficit)</span>
        </div>
        <div className="flex items-center gap-1.5" title="Constrained: Compute demand approaching clean capacity.">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 border border-orange-400" />
          <span className="text-orange-400">0.65x-1.0x (Tight)</span>
        </div>
        <div className="flex items-center gap-1.5" title="Balanced: Local compute consumes almost all clean generation.">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-amber-400" />
          <span className="text-amber-400">1.0x-1.4x (Balanced)</span>
        </div>
        <div className="flex items-center gap-1.5" title="Abundant: Ample clean headroom available.">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 border border-green-400" />
          <span className="text-green-400">1.4x-2.0x (Abundant)</span>
        </div>
        <div className="flex items-center gap-1.5" title="Super-Dense Surplus: Heavy clean curtailment. Free power.">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-emerald-300" />
          <span className="text-emerald-300 font-bold">&gt;2.0x (Surplus)</span>
        </div>
      </div>
    </div>
  );
};

/* REGIONAL INSPECTOR TOOLTIP HUD */
interface GreenDensityInspectorCardProps {
  metric: GreenComputeDensityMetrics;
}

export const GreenDensityInspectorCard: React.FC<GreenDensityInspectorCardProps> = ({
  metric,
}) => {
  return (
    <div className="bg-slate-950/95 border border-slate-700 rounded-xl p-3.5 shadow-2xl backdrop-blur-md text-xs z-30 min-w-[310px] max-w-[340px] pointer-events-none">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
        <div>
          <div className="font-bold text-slate-100 flex items-center gap-1.5">
            <span>{metric.regionName}</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
            <span>{metric.country} · {metric.energyType}</span>
            <span>·</span>
            <span className={metric.spotPricePerMWh <= 0 ? 'text-emerald-400 font-bold' : 'text-slate-300 font-bold'}>
              ${metric.spotPricePerMWh.toFixed(2)}/MWh
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${metric.tierBadgeClass}`}
          >
            {metric.tierLabel}
          </span>
          <span className="text-[9px] font-mono text-emerald-400 font-semibold uppercase">
            {metric.hardwareStatus}
          </span>
        </div>
      </div>

      <div
        className="p-2.5 rounded-lg border flex items-center justify-between mb-2.5"
        style={{
          backgroundColor: metric.tierBgRgba,
          borderColor: metric.tierBorderColor,
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full animate-ping"
            style={{ backgroundColor: metric.tierColor }}
          />
          <div>
            <div className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
              Green Compute Density
            </div>
            <div className="text-base font-bold font-mono text-white flex items-baseline gap-1">
              <span>{metric.densityRatio}x</span>
              <span className="text-[11px] font-normal text-slate-300">
                ({metric.densityScorePct}% score)
              </span>
            </div>
          </div>
        </div>
        <div className="text-right font-mono">
          <div className="text-[10px] text-slate-300">Net Clean Headroom</div>
          <div
            className={`text-xs font-bold ${
              metric.netSurplusMWh >= 0 ? 'text-emerald-300' : 'text-rose-400'
            }`}
          >
            {metric.netSurplusMWh >= 0 ? `+${metric.netSurplusMWh}` : metric.netSurplusMWh} MWh
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 mb-2.5">
        <div>
          <div className="text-slate-400 flex items-center gap-1 mb-0.5">
            {metric.energyType === 'SOLAR' ? (
              <Sun className="w-3 h-3 text-amber-400" />
            ) : (
              <Wind className="w-3 h-3 text-sky-400" />
            )}
            <span>Clean Generation</span>
          </div>
          <div className="font-mono font-bold text-emerald-400 text-xs">
            {metric.totalRenewableOutputMWh} MWh
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Curtailment: {metric.curtailmentMWh} MWh
          </div>
        </div>
        <div>
          <div className="text-slate-400 flex items-center gap-1 mb-0.5">
            <Cpu className="w-3 h-3 text-sky-400" />
            <span>Local AI Demand</span>
          </div>
          <div className="font-mono font-bold text-sky-300 text-xs">
            {metric.totalComputeDemandMWh} MWh
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {metric.activeContainers} Pods ({metric.containerDrawMWh} MWh)
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 pt-2 flex items-start gap-1.5 text-[10px] text-slate-300 leading-snug">
        <Sparkles className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
        <span>{metric.dispatchRecommendation}</span>
      </div>
    </div>
  );
};

/* REGIONAL COMPARISON MATRIX DRAWER */
interface GreenDensityComparisonDrawerProps {
  metrics: GreenComputeDensityMetrics[];
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
  onClose: () => void;
}

export const GreenDensityComparisonDrawer: React.FC<GreenDensityComparisonDrawerProps> = ({
  metrics,
  selectedNodeId,
  onSelectNode,
  onClose,
}) => {
  const sortedMetrics = [...metrics].sort((a, b) => b.densityRatio - a.densityRatio);

  return (
    <div className="bg-slate-950 border-t border-slate-800 p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100">
              Global Green Compute Density Matrix
            </h4>
            <p className="text-xs text-slate-400">
              Corridor ranking by clean energy generation vs local AI cluster demand.
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="px-2.5 py-1 text-xs text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          Close Drawer
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-900/60">
              <th className="py-2.5 px-3">Corridor & Origin</th>
              <th className="py-2.5 px-3">Clean Gen (MWh)</th>
              <th className="py-2.5 px-3">AI Draw (MWh)</th>
              <th className="py-2.5 px-3">Net Headroom</th>
              <th className="py-2.5 px-3">Density Ratio</th>
              <th className="py-2.5 px-3">Arbitrage Status</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
            {sortedMetrics.map((m) => {
              const isSelected = m.nodeId === selectedNodeId;
              return (
                <tr
                  key={m.nodeId}
                  className={`transition-colors hover:bg-slate-900/50 ${
                    isSelected ? 'bg-emerald-950/20 border-l-2 border-emerald-500' : ''
                  }`}
                >
                  <td className="py-3 px-3">
                    <div className="font-sans font-bold text-slate-100 flex items-center gap-1.5">
                      <span>{m.regionName}</span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans">
                      {m.country} · {m.energyType}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-emerald-400 font-bold">
                      {m.totalRenewableOutputMWh} MWh
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Curtailment: {m.curtailmentMWh} MWh
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-sky-300 font-bold">
                      {m.totalComputeDemandMWh} MWh
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {m.activeContainers} Pods
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`font-bold ${
                        m.netSurplusMWh >= 0 ? 'text-emerald-300' : 'text-rose-400'
                      }`}
                    >
                      {m.netSurplusMWh >= 0 ? `+${m.netSurplusMWh}` : m.netSurplusMWh} MWh
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold" style={{ color: m.tierColor }}>
                        {m.densityRatio}x
                      </span>
                      <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${m.densityScorePct}%`,
                            backgroundColor: m.tierColor,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-sans font-bold border ${m.tierBadgeClass}`}
                    >
                      {m.tierLabel}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onSelectNode(m.nodeId)}
                      className={`px-3 py-1 rounded-lg text-xs font-sans font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                          : 'bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-slate-700'
                      }`}
                    >
                      {isSelected ? 'Active Sink' : 'Route Here'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
