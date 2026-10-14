import React from 'react';
import { Flame, TrendingDown, Zap, Sparkles, Activity, ShieldCheck, Eye, EyeOff, Brain } from 'lucide-react';
import { computeGeminiRoutingLogic } from './GeminiRoutingTooltip';

export interface ArbitrageZoneData {
  id: string;
  name: string;
  region: string;
  country: string;
  x: number;
  y: number;
  currentSpotPrice: number;
  baselinePrice: number;
  priceDelta: number;
  volatilityIndex: number; // 0 to 100
  arbitrageTier: 'CRITICAL_SURGE' | 'HIGH_OPPORTUNITY' | 'MODERATE' | 'LOW_BASELOAD';
  curtailmentMWh: number;
  heatRadius: number;
  heatColor: string;
  glowColor: string;
}

export const calculateVolatilityZone = (
  id: string,
  name: string,
  region: string,
  country: string,
  x: number,
  y: number,
  spotPrice: number,
  curtailmentMWh: number
): ArbitrageZoneData => {
  const baselinePrice = 48.0; // standard utility tariff
  const priceDelta = baselinePrice - spotPrice; // larger delta = deeper arbitrage discount
  
  // Volatility index calculation based on negative price plunge depth and curtailment volume
  const negativeDepth = Math.max(0, -spotPrice);
  const rawVolatility = Math.min(
    99,
    Math.round(40 + (negativeDepth * 15) + (curtailmentMWh / 350) * 35)
  );

  let arbitrageTier: ArbitrageZoneData['arbitrageTier'] = 'LOW_BASELOAD';
  let heatColor = '#3b82f6'; // Blue
  let glowColor = 'rgba(59, 130, 246, 0.4)';
  let heatRadius = 45;

  if (spotPrice <= -2.0) {
    arbitrageTier = 'CRITICAL_SURGE';
    heatColor = '#10b981'; // Emerald/Mint Neon
    glowColor = 'rgba(16, 185, 129, 0.75)';
    heatRadius = 85;
  } else if (spotPrice <= 0) {
    arbitrageTier = 'HIGH_OPPORTUNITY';
    heatColor = '#34d399'; // Bright Jade
    glowColor = 'rgba(52, 211, 153, 0.65)';
    heatRadius = 70;
  } else if (spotPrice <= 5.0) {
    arbitrageTier = 'MODERATE';
    heatColor = '#f59e0b'; // Amber
    glowColor = 'rgba(245, 158, 11, 0.55)';
    heatRadius = 55;
  } else {
    arbitrageTier = 'LOW_BASELOAD';
    heatColor = '#64748b'; // Slate
    glowColor = 'rgba(100, 116, 139, 0.35)';
    heatRadius = 40;
  }

  return {
    id,
    name,
    region,
    country,
    x,
    y,
    currentSpotPrice: spotPrice,
    baselinePrice,
    priceDelta: Number(priceDelta.toFixed(2)),
    volatilityIndex: rawVolatility,
    arbitrageTier,
    curtailmentMWh,
    heatRadius,
    heatColor,
    glowColor,
  };
};

/* =========================================================================
   SVG GLOBAL HEAT LAYER RENDERER
   ========================================================================= */
interface GlobalPriceVolatilityHeatLayerProps {
  zones: ArbitrageZoneData[];
  selectedZoneId: string;
  hoveredZoneId: string | null;
  onSelectZone: (id: string) => void;
  onHoverZone: (id: string | null) => void;
  filterMode: 'ALL' | 'HIGH_ARBITRAGE_ONLY' | 'SPREAD_SURGE';
  intensityOpacity: number;
}

export const GlobalPriceVolatilityHeatLayer: React.FC<GlobalPriceVolatilityHeatLayerProps> = ({
  zones,
  selectedZoneId,
  hoveredZoneId,
  onSelectZone,
  onHoverZone,
  filterMode,
  intensityOpacity,
}) => {
  const visibleZones = zones.filter((zone) => {
    if (filterMode === 'HIGH_ARBITRAGE_ONLY') {
      return zone.arbitrageTier === 'CRITICAL_SURGE' || zone.arbitrageTier === 'HIGH_OPPORTUNITY';
    }
    if (filterMode === 'SPREAD_SURGE') {
      return zone.currentSpotPrice <= 0;
    }
    return true;
  });

  return (
    <g id="global-price-volatility-heat-layer" className="transition-opacity duration-300">
      <defs>
        {/* Radial Heat Gradient Filters */}
        {visibleZones.map((z) => (
          <radialGradient
            key={`heat-rad-${z.id}`}
            id={`heat-rad-${z.id}`}
            cx="50%"
            cy="50%"
            r="50%"
            fx="50%"
            fy="50%"
          >
            <stop offset="0%" stopColor={z.heatColor} stopOpacity={0.65 * intensityOpacity} />
            <stop offset="35%" stopColor={z.heatColor} stopOpacity={0.35 * intensityOpacity} />
            <stop offset="70%" stopColor={z.heatColor} stopOpacity={0.12 * intensityOpacity} />
            <stop offset="100%" stopColor={z.heatColor} stopOpacity="0" />
          </radialGradient>
        ))}

        {/* Global Gaussian Blur for Thermal Dispersion */}
        <filter id="thermalBlur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* 1. Thermal Field Halos (Overlapping price volatility radiation) */}
      {visibleZones.map((z) => {
        const isSelected = z.id === selectedZoneId;
        const isHovered = z.id === hoveredZoneId;
        const effectiveRadius = isSelected ? z.heatRadius * 1.25 : z.heatRadius;

        return (
          <g key={`field-${z.id}`} className="pointer-events-none">
            {/* Base Radial Heat Dispersion Dome */}
            <circle
              cx={z.x}
              cy={z.y}
              r={effectiveRadius}
              fill={`url(#heat-rad-${z.id})`}
            />

            {/* Isothermal Contour Rings for high-arbitrage zones */}
            {(z.arbitrageTier === 'CRITICAL_SURGE' || z.arbitrageTier === 'HIGH_OPPORTUNITY') && (
              <>
                <circle
                  cx={z.x}
                  cy={z.y}
                  r={effectiveRadius * 0.65}
                  fill="none"
                  stroke={z.heatColor}
                  strokeWidth="1.2"
                  strokeDasharray="3 4"
                  opacity={isSelected || isHovered ? 0.85 : 0.45}
                >
                  <animate
                    attributeName="r"
                    values={`${effectiveRadius * 0.4};${effectiveRadius * 0.85}`}
                    dur="3s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.6;0"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </circle>

                <circle
                  cx={z.x}
                  cy={z.y}
                  r={effectiveRadius * 0.35}
                  fill="none"
                  stroke={z.heatColor}
                  strokeWidth="1.5"
                  strokeOpacity={0.6}
                />
              </>
            )}
          </g>
        );
      })}

      {/* 2. Interactive Heat Core Markers & High-Arbitrage Tags */}
      {visibleZones.map((z) => {
        const isSelected = z.id === selectedZoneId;
        const isHovered = z.id === hoveredZoneId;
        const isCritical = z.arbitrageTier === 'CRITICAL_SURGE';

        return (
          <g
            key={`marker-${z.id}`}
            transform={`translate(${z.x}, ${z.y})`}
            className="cursor-pointer select-none"
            onClick={() => onSelectZone(z.id)}
            onMouseEnter={() => onHoverZone(z.id)}
            onMouseLeave={() => onHoverZone(null)}
          >
            {/* Heat Core Beacon */}
            <circle
              cx="0"
              cy="0"
              r={isSelected ? 10 : 7}
              fill={z.heatColor}
              stroke="#0b101d"
              strokeWidth="2"
              className={isCritical ? 'node-core-strobe' : ''}
              style={{
                filter: `drop-shadow(0 0 8px ${z.heatColor})`,
              }}
            />

            {/* Center Photon Dot */}
            <circle cx="0" cy="0" r="2.5" fill="#ffffff" />

            {/* High-Arbitrage Tactical Tag Header */}
            <g transform="translate(12, -26)">
              <rect
                width={isCritical ? 118 : 104}
                height="22"
                rx="5"
                fill="#070b14"
                stroke={isCritical ? '#10b981' : z.heatColor}
                strokeWidth={isSelected ? 1.8 : 1}
                opacity="0.95"
              />
              <text
                x="6"
                y="11"
                fill="#ffffff"
                fontSize="9"
                fontWeight="bold"
                fontFamily="sans-serif"
              >
                {z.name}
              </text>
              <text
                x="6"
                y="19"
                fill={z.currentSpotPrice <= 0 ? '#34d399' : '#f59e0b'}
                fontSize="8"
                fontWeight="bold"
                fontFamily="monospace"
              >
                {z.volatilityIndex}% VOL · ${z.currentSpotPrice.toFixed(2)}
              </text>
            </g>
          </g>
        );
      })}
    </g>
  );
};

/* =========================================================================
   VOLATILITY HEAT LAYER CONTROL BAR (Pills & Filters)
   ========================================================================= */
interface VolatilityControlBarProps {
  isHeatLayerActive: boolean;
  onToggleHeatLayer: () => void;
  filterMode: 'ALL' | 'HIGH_ARBITRAGE_ONLY' | 'SPREAD_SURGE';
  onChangeFilterMode: (mode: 'ALL' | 'HIGH_ARBITRAGE_ONLY' | 'SPREAD_SURGE') => void;
  intensityOpacity: number;
  onChangeIntensityOpacity: (val: number) => void;
  criticalZoneCount: number;
  totalZones: number;
}

export const VolatilityControlBar: React.FC<VolatilityControlBarProps> = ({
  isHeatLayerActive,
  onToggleHeatLayer,
  filterMode,
  onChangeFilterMode,
  intensityOpacity,
  onChangeIntensityOpacity,
  criticalZoneCount,
  totalZones,
}) => {
  return (
    <div className="bg-[#070b14] border-b border-slate-800/90 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Left: Main Toggle Button */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onToggleHeatLayer}
          className={`flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
            isHeatLayerActive
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
          title="Toggle Global Renewable Price Volatility Heat Layer"
        >
          {isHeatLayerActive ? (
            <Flame className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          ) : (
            <EyeOff className="w-3.5 h-3.5" />
          )}
          <span>Price Volatility Heat Layer</span>
          <span
            className={`w-2 h-2 rounded-full ${
              isHeatLayerActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'
            }`}
          />
        </button>

        {isHeatLayerActive && (
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
            <span>High-Arbitrage Corridors:</span>
            <span className="text-emerald-400 font-bold bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-800">
              {criticalZoneCount}/{totalZones} Hot
            </span>
          </div>
        )}
      </div>

      {/* Right: Heat Controls (Filter pills & Intensity slider) */}
      {isHeatLayerActive && (
        <div className="flex items-center flex-wrap gap-2 text-[11px]">
          {/* Filter Mode Selector */}
          <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => onChangeFilterMode('ALL')}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                filterMode === 'ALL'
                  ? 'bg-slate-800 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Full Surface
            </button>
            <button
              onClick={() => onChangeFilterMode('HIGH_ARBITRAGE_ONLY')}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                filterMode === 'HIGH_ARBITRAGE_ONLY'
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Show only zones with high or critical negative price volatility"
            >
              High-Arbitrage Only
            </button>
            <button
              onClick={() => onChangeFilterMode('SPREAD_SURGE')}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                filterMode === 'SPREAD_SURGE'
                  ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Show only sub-zero negative price plunge basins"
            >
              Sub-Zero Tariffs
            </button>
          </div>

          {/* Opacity Slider */}
          <div className="hidden md:flex items-center gap-1.5 pl-2 border-l border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-mono">Heat Glow:</span>
            <input
              type="range"
              min="0.3"
              max="1.0"
              step="0.05"
              value={intensityOpacity}
              onChange={(e) => onChangeIntensityOpacity(Number(e.target.value))}
              className="w-16 accent-emerald-400 bg-slate-800 h-1 rounded cursor-pointer"
              title="Adjust heat map glow opacity"
            />
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   VOLATILITY & ARBITRAGE SPECTRUM LEGEND
   ========================================================================= */
export const VolatilityLegend: React.FC = () => {
  return (
    <div className="bg-[#080d18] border-t border-slate-800/80 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono">
      <div className="flex items-center gap-2">
        <Flame className="w-3.5 h-3.5 text-emerald-400" />
        <span className="font-bold text-slate-300">Price Volatility &amp; Arbitrage Spectrum:</span>
      </div>
      <div className="flex items-center flex-wrap gap-3 text-[10px]">
        <div className="flex items-center gap-1.5" title="Stable baseload, low price variance, positive spot rates">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-500 border border-slate-400" />
          <span className="text-slate-400">&lt;45% (Stable / Low Yield)</span>
        </div>
        <div className="flex items-center gap-1.5" title="Moderate diurnal price swings, tariff $0 to $5/MWh">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-300" />
          <span className="text-amber-400">45-75% (Moderate Arbitrage)</span>
        </div>
        <div className="flex items-center gap-1.5" title="Negative spot tariff surge, high curtailment, prime compute sink">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span className="text-emerald-300 font-bold">&gt;75% (Prime Arbitrage Sink)</span>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   VOLATILITY HOVER HUD CARD
   ========================================================================= */
export const VolatilityZoneHoverCard: React.FC<{ zone: ArbitrageZoneData }> = ({ zone }) => {
  const isSurge = zone.arbitrageTier === 'CRITICAL_SURGE' || zone.arbitrageTier === 'HIGH_OPPORTUNITY';
  const baselineRate = 48.0;
  const savingsPct = Math.round(((baselineRate - Math.max(0, zone.currentSpotPrice)) / baselineRate) * 100);

  const routing = computeGeminiRoutingLogic({
    id: zone.id,
    name: zone.name,
    spotPrice: zone.currentSpotPrice,
    surplusMW: zone.curtailmentMWh,
    type: zone.name.includes('Solar') ? 'Solar' : zone.name.includes('Wind') ? 'Wind' : 'Hydro',
  });

  return (
    <div className="bg-slate-950/98 border border-emerald-500/40 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs font-mono min-w-[280px] pointer-events-none">
      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800">
        <div className="font-bold text-white flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-emerald-400" />
          <span>{zone.name} Basin</span>
        </div>
        <span
          className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold border ${routing.statusBadgeColor}`}
        >
          {routing.status}
        </span>
      </div>

      <div className="space-y-1 text-[11px]">
        <div className="flex justify-between">
          <span className="text-slate-400">Gemini Routing Engine:</span>
          <span className="text-emerald-400 font-bold">{routing.actionDecision}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Current Spot Tariff:</span>
          <span className={zone.currentSpotPrice <= 0 ? 'text-emerald-400 font-bold' : 'text-slate-200'}>
            ${zone.currentSpotPrice.toFixed(2)}/MWh
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Arbitrage Spread (Δ):</span>
          <span className="text-sky-300 font-bold">+${zone.priceDelta.toFixed(2)}/MWh</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Cost Slashing:</span>
          <span className="text-emerald-300 font-bold">~{savingsPct}% vs Grid</span>
        </div>
      </div>

      {/* Gemini Rationale summary */}
      <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-slate-300 leading-tight font-sans">
        <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wider block mb-0.5">
          Gemini Rationale:
        </span>
        {routing.reasoning}
      </div>

      <div className="mt-1.5 pt-1 border-t border-slate-800/80 text-[9.5px] text-slate-400 flex items-center gap-1">
        <Sparkles className="w-3 h-3 text-emerald-400" />
        <span>Click to route AI compute into this corridor</span>
      </div>
    </div>
  );
};
