import React, { useState, useMemo } from 'react';
import { GridNode, HardwareStatus } from '../../types';
import {
  Map as MapIcon,
  Activity,
  Server,
  Zap,
  Globe,
  Radio,
  Sliders,
  CheckCircle2,
  Flame,
} from 'lucide-react';
import { InfrastructureHealthInspector } from './InfrastructureHealthInspector';
import {
  GlobalPriceVolatilityHeatLayer,
  VolatilityControlBar,
  VolatilityLegend,
  VolatilityZoneHoverCard,
  calculateVolatilityZone,
  ArbitrageZoneData,
} from './GlobalPriceVolatilityHeatLayer';
import { GridVitalityBadge } from './GridVitalityBadge';
import {
  GeminiRoutingTooltipCard,
  computeGeminiRoutingLogic,
} from './GeminiRoutingTooltip';

interface InteractiveMapProps {
  nodes: GridNode[];
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
  isExecuting: boolean;
  onUpdateNodeStatus?: (nodeId: string, newStatus: HardwareStatus) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  nodes,
  selectedNodeId,
  onSelectNode,
  isExecuting,
  onUpdateNodeStatus,
}) => {
  const [activeView, setActiveView] = useState<'map' | 'health'>('map');
  const [hoveredNode, setHoveredNode] = useState<any | null>(null);

  // Global Price Volatility Heat Layer States
  const [isHeatLayerActive, setIsHeatLayerActive] = useState<boolean>(true);
  const [volatilityFilterMode, setVolatilityFilterMode] = useState<
    'ALL' | 'HIGH_ARBITRAGE_ONLY' | 'SPREAD_SURGE'
  >('ALL');
  const [heatIntensityOpacity, setHeatIntensityOpacity] = useState<number>(0.75);
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null);

  // Live Arbitration Pulse Animation State (visualizes active data packet flows between regional nodes)
  const [isArbitrationPulseManual, setIsArbitrationPulseManual] = useState<boolean>(true);
  const showArbitrationPulse = isExecuting || isArbitrationPulseManual;

  // Regional energy nodes: 4 Indian suppliers + 1 Global entity (Zero overlap)
  const mapNodes = useMemo(() => [
    {
      id: 'IND-RAJ-SOLAR',
      name: 'Rajasthan Solar',
      region: 'Bhadla Solar Park',
      country: 'India',
      subtext: 'Surplus: 180 MW',
      type: 'Solar',
      x: 270,
      y: 130,
      labelOffsetX: -124,
      labelOffsetY: -18,
      surplusMW: 180,
      spotPrice: -1.40,
      activeContainers: 42,
    },
    {
      id: 'IND-GUJ-SOLAR',
      name: 'Gujarat Solar',
      region: 'Khavda Renewable Energy Park',
      country: 'India',
      subtext: 'Surplus: 240 MW',
      type: 'Solar',
      x: 200,
      y: 220,
      labelOffsetX: -124,
      labelOffsetY: -18,
      surplusMW: 240,
      spotPrice: -1.85,
      activeContainers: 56,
    },
    {
      id: 'IND-MAH-WIND',
      name: 'Maharashtra Wind',
      region: 'Dhule Wind Energy Cluster',
      country: 'India',
      subtext: 'Surplus: 120 MW',
      type: 'Wind',
      x: 280,
      y: 290,
      labelOffsetX: -124,
      labelOffsetY: -18,
      surplusMW: 120,
      spotPrice: 0.80,
      activeContainers: 28,
    },
    {
      id: 'IND-TN-WIND',
      name: 'Tamil Nadu Wind',
      region: 'Muppandal Wind Farm',
      country: 'India',
      subtext: 'Surplus: 310 MW',
      type: 'Wind',
      x: 350,
      y: 360,
      labelOffsetX: 16,
      labelOffsetY: -18,
      surplusMW: 310,
      spotPrice: -2.10,
      activeContainers: 64,
    },
    {
      id: 'GLOBAL-GRID-NODE',
      name: 'Global Grid Reserve',
      region: 'International Cross-Border Grid',
      country: 'Global Interconnect',
      subtext: 'Reserve: 160 MW',
      type: 'Hybrid',
      x: 615,
      y: 240,
      labelOffsetX: -130,
      labelOffsetY: -18,
      surplusMW: 160,
      spotPrice: 4.20,
      activeContainers: 36,
    },
  ], []);

  // Compute rich volatility and arbitrage data for every zone across the surface
  const volatilityZones: ArbitrageZoneData[] = useMemo(() => {
    return mapNodes.map((node) => {
      // Find matching live node data if available to keep metrics reactive
      const liveNode = nodes.find((n) => n.id === node.id);
      const effectiveSpotPrice = liveNode ? liveNode.spotPricePerMWh : node.spotPrice;
      const effectiveCurtailment = liveNode ? liveNode.curtailmentMWh : node.surplusMW;

      return calculateVolatilityZone(
        node.id,
        node.name,
        node.region,
        node.country,
        node.x,
        node.y,
        effectiveSpotPrice,
        effectiveCurtailment
      );
    });
  }, [mapNodes, nodes]);

  const criticalZoneCount = useMemo(() => {
    return volatilityZones.filter(
      (z) => z.arbitrageTier === 'CRITICAL_SURGE' || z.arbitrageTier === 'HIGH_OPPORTUNITY'
    ).length;
  }, [volatilityZones]);

  // Central Hub position
  const centralHub = {
    x: 430,
    y: 210,
    name: 'AI Compute Network',
  };

  const totalSurplusMW = mapNodes
    .filter((n) => n.id.startsWith('IND'))
    .reduce((acc, n) => acc + n.surplusMW, 0); // 850 MW
  const utilizationRatePct = 78;

  const currentSelectedNode =
    mapNodes.find((n) => n.id === selectedNodeId) || mapNodes[1];

  const liveSelectedNode: GridNode = useMemo(() => {
    const found = nodes.find((n) => n.id === selectedNodeId);
    if (found) return found;
    const fallback = mapNodes.find((n) => n.id === selectedNodeId) || mapNodes[1];
    return {
      id: fallback.id,
      name: fallback.name,
      region: fallback.region,
      country: fallback.country,
      lat: 20.0,
      lng: 75.0,
      energyType: (fallback.type.toUpperCase() as any) || 'SOLAR',
      spotPricePerMWh: fallback.spotPrice,
      curtailmentMWh: fallback.surplusMW,
      availablePowerMWh: fallback.surplusMW * 2,
      hardwareStatus: 'HEALTHY',
      activeContainers: fallback.activeContainers,
      carbonAvoidanceRateKgPerMWh: 450,
      lastTelemetryTimestamp: new Date().toISOString(),
    };
  }, [nodes, selectedNodeId, mapNodes]);

  const activeHoveredZone = useMemo(() => {
    if (!hoveredZoneId) return null;
    return volatilityZones.find((z) => z.id === hoveredZoneId) || null;
  }, [hoveredZoneId, volatilityZones]);

  return (
    <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl overflow-hidden flex flex-col relative shadow-2xl">
      {/* Header Bar */}
      <div className="px-5 py-3.5 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 bg-[#080d18]">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Live Renewable Energy Map</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </h3>
          <p className="text-[11px] text-slate-400">
            Real-time clean energy availability, price volatility heat fields &amp; workload routing
          </p>
        </div>

        {/* Legend & Switcher */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          {/* Live Arbitration Pulse Toggle Button */}
          <button
            onClick={() => setIsArbitrationPulseManual(!isArbitrationPulseManual)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
              showArbitrationPulse
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Toggle Live Arbitration Pulse spatial-temporal network orchestration"
          >
            <Radio className={`w-3.5 h-3.5 ${showArbitrationPulse ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            <span>Live Arbitration Pulse</span>
            <span className={`w-2 h-2 rounded-full ${showArbitrationPulse ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
          </button>

          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="text-[11px]">Surplus</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
            <span className="text-[11px]">Workloads</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300 hidden sm:flex">
            <span className="w-4 h-0.5 bg-emerald-400/80" />
            <span className="text-[11px]">Conduit</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300 hidden sm:flex">
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px]">Data Center</span>
          </div>
        </div>
      </div>

      {/* Global Price Volatility Heat Layer Interactive Control Bar */}
      <VolatilityControlBar
        isHeatLayerActive={isHeatLayerActive}
        onToggleHeatLayer={() => setIsHeatLayerActive(!isHeatLayerActive)}
        filterMode={volatilityFilterMode}
        onChangeFilterMode={setVolatilityFilterMode}
        intensityOpacity={heatIntensityOpacity}
        onChangeIntensityOpacity={setHeatIntensityOpacity}
        criticalZoneCount={criticalZoneCount}
        totalZones={volatilityZones.length}
      />

      {/* SVG Interactive Canvas */}
      <div className="relative w-full h-[360px] sm:h-[400px] bg-[#070b14] overflow-hidden select-none">
        <svg
          viewBox="0 0 740 420"
          className="w-full h-full object-cover"
        >
          <defs>
            {/* Ambient Radial Gradient for nighttime atmosphere */}
            <radialGradient id="satelliteNight" cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor="#0d1b2a" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#080e1a" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#04070d" stopOpacity="1" />
            </radialGradient>

            {/* Glowing route conduit */}
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.7" />
            </linearGradient>

            {/* Live Arbitration Mesh Gradient */}
            <linearGradient id="arbitrationGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#10b981" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.95" />
            </linearGradient>

            <filter id="hubGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="pulseGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Map Canvas */}
          <rect width="740" height="420" fill="url(#satelliteNight)" />

          {/* Global Geographic Grid Lat/Lng Guidelines */}
          <g stroke="#1a2436" strokeWidth="0.5" strokeDasharray="3 4" opacity="0.6">
            <line x1="0" y1="105" x2="740" y2="105" />
            <line x1="0" y1="210" x2="740" y2="210" stroke="#253347" strokeWidth="0.8" />
            <line x1="0" y1="315" x2="740" y2="315" />
            <line x1="185" y1="0" x2="185" y2="420" />
            <line x1="370" y1="0" x2="370" y2="420" stroke="#253347" strokeWidth="0.8" />
            <line x1="555" y1="0" x2="555" y2="420" />
          </g>

          {/* Global Continents Silhouettes */}
          <g fill="#09121f" stroke="#172233" strokeWidth="1" opacity="0.55">
            {/* Americas */}
            <path d="M 60,80 L 160,70 L 190,140 L 130,220 L 90,260 L 150,330 L 120,390 L 70,300 Z" />
            {/* Europe & Africa */}
            <path d="M 520,70 L 630,60 L 640,120 L 580,180 L 600,290 L 530,340 L 510,210 Z" />
          </g>

          {/* Night Map City Lights Simulation (Organic glowing points) */}
          <g opacity="0.35">
            {[
              [240, 190], [250, 180], [280, 210], [330, 150], [350, 140],
              [310, 260], [300, 280], [340, 290], [420, 340], [440, 360],
              [480, 230], [500, 240], [460, 210], [380, 190], [400, 220],
              [210, 220], [220, 240], [260, 310], [450, 310], [410, 370],
              [100, 160], [120, 180], [130, 320], [610, 90], [620, 110]
            ].map(([cx, cy], i) => (
              <circle key={`light-${i}`} cx={cx} cy={cy} r="1.5" fill="#fde047" opacity="0.6" />
            ))}
          </g>

          {/* Regional Contour Boundary Path (India Subcontinental silhouette) */}
          <path
            d="M 170,120 Q 280,70 380,80 Q 480,100 520,160 Q 560,240 500,320 Q 440,390 410,400 Q 380,380 320,320 Q 250,290 200,230 Q 160,180 170,120 Z"
            fill="#0a1526"
            stroke="#1e293b"
            strokeWidth="1.2"
            opacity="0.8"
          />

          {/* =============================================================== */}
          {/* TOGGLEABLE GLOBAL PRICE VOLATILITY HEAT LAYER                   */}
          {/* =============================================================== */}
          {isHeatLayerActive && (
            <GlobalPriceVolatilityHeatLayer
              zones={volatilityZones}
              selectedZoneId={selectedNodeId}
              hoveredZoneId={hoveredZoneId}
              onSelectZone={(id) => onSelectNode(id)}
              onHoverZone={(id) => {
                setHoveredZoneId(id);
                if (id) {
                  const node = mapNodes.find((n) => n.id === id);
                  if (node) setHoveredNode(node);
                } else {
                  setHoveredNode(null);
                }
              }}
              filterMode={volatilityFilterMode}
              intensityOpacity={heatIntensityOpacity}
            />
          )}

          {/* Animated Energy Flow Laser Routes to Central Hub */}
          {mapNodes.map((node) => {
            const isSelected = node.id === selectedNodeId;
            const midX = (node.x + centralHub.x) / 2;
            const midY = (node.y + centralHub.y) / 2 - 20;
            return (
              <g key={`route-${node.id}`}>
                {/* Background conduit line */}
                <path
                  d={`M ${node.x} ${node.y} Q ${midX} ${midY} ${centralHub.x} ${centralHub.y}`}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth={isSelected ? 2.5 : 1.4}
                  strokeOpacity={isSelected ? 0.7 : 0.25}
                />
                {/* Flowing Dash Beam */}
                <path
                  d={`M ${node.x} ${node.y} Q ${midX} ${midY} ${centralHub.x} ${centralHub.y}`}
                  fill="none"
                  stroke="#34d399"
                  strokeWidth={isSelected ? 2.8 : 1.8}
                  strokeDasharray="8 6"
                  className={isExecuting || isSelected ? 'energy-flow-fast-line' : 'energy-flow-active-line'}
                  filter="url(#hubGlow)"
                />
                {/* Flowing Photon Particle */}
                <circle cx={node.x} cy={node.y} r="3" fill="#ffffff" filter="url(#hubGlow)">
                  <animate
                    attributeName="cx"
                    values={`${node.x};${midX};${centralHub.x}`}
                    dur="1.6s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="cy"
                    values={`${node.y};${midY};${centralHub.y}`}
                    dur="1.6s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            );
          })}

          {/* Central AI Compute Network Hub */}
          <g transform={`translate(${centralHub.x}, ${centralHub.y})`}>
            {/* Outer Pulsing Aura */}
            <circle
              cx="0"
              cy="0"
              r="34"
              fill="none"
              stroke="#10b981"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              className="animate-spin"
              style={{ animationDuration: '14s' }}
              opacity="0.6"
            />
            {/* Core Box */}
            <rect
              x="-24"
              y="-24"
              width="48"
              height="48"
              rx="12"
              fill="#064e3b"
              stroke="#34d399"
              strokeWidth="2"
              filter="url(#hubGlow)"
            />
            {/* Server Layer Stack Icon Inside */}
            <g transform="translate(-10, -10)">
              <path d="M 0,4 L 10,0 L 20,4 L 10,8 Z" fill="#34d399" />
              <path d="M 0,9 L 10,13 L 20,9" fill="none" stroke="#34d399" strokeWidth="1.5" />
              <path d="M 0,14 L 10,18 L 20,14" fill="none" stroke="#34d399" strokeWidth="1.5" />
            </g>
            {/* Central Hub Label */}
            <text
              x="34"
              y="4"
              fill="#ffffff"
              fontSize="12"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              AI Compute
            </text>
            <text
              x="34"
              y="18"
              fill="#34d399"
              fontSize="10"
              fontFamily="sans-serif"
              fontWeight="600"
            >
              Network
            </text>
          </g>

          {/* =============================================================== */}
          {/* LIVE ARBITRATION PULSE: REGIONAL MESH CONDUITS & ACTIVE PACKETS  */}
          {/* =============================================================== */}
          {showArbitrationPulse && (
            <g id="live-arbitration-pulse-mesh">
              {/* Mesh Conduit 1: Rajasthan (270, 130) <-> Gujarat (200, 220) */}
              <g>
                <path
                  d="M 270,130 Q 215,165 200,220"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.2"
                  strokeOpacity="0.45"
                />
                <path
                  d="M 270,130 Q 215,165 200,220"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.8"
                  className="arbitration-pulse-conduit"
                  filter="url(#pulseGlow)"
                />
                {/* Active Data Packet 1: Checkpoint Stream */}
                <g filter="url(#pulseGlow)">
                  <animateMotion
                    path="M 270,130 Q 215,165 200,220"
                    dur="1.7s"
                    repeatCount="indefinite"
                  />
                  <circle cx="0" cy="0" r="4.5" fill="#38bdf8" className="arbitration-packet-glow" />
                  <circle cx="0" cy="0" r="2" fill="#ffffff" />
                  <rect x="-24" y="-16" width="48" height="12" rx="3" fill="#040b17" stroke="#38bdf8" strokeWidth="0.8" opacity="0.9" />
                  <text x="0" y="-8" fill="#7dd3fc" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                    16.2 GB/s
                  </text>
                </g>
                {/* Active Data Packet 1-Reverse: Arbitrage Bid */}
                <g filter="url(#pulseGlow)">
                  <animateMotion
                    path="M 200,220 Q 215,165 270,130"
                    dur="2.2s"
                    repeatCount="indefinite"
                  />
                  <circle cx="0" cy="0" r="3.5" fill="#10b981" />
                  <circle cx="0" cy="0" r="1.5" fill="#ffffff" />
                  <rect x="-18" y="6" width="36" height="11" rx="3" fill="#040b17" stroke="#10b981" strokeWidth="0.8" opacity="0.9" />
                  <text x="0" y="14" fill="#34d399" fontSize="6.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                    BID -$1.85
                  </text>
                </g>
              </g>

              {/* Mesh Conduit 2: Gujarat (200, 220) <-> Maharashtra (280, 290) */}
              <g>
                <path
                  d="M 200,220 Q 230,265 280,290"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.2"
                  strokeOpacity="0.45"
                />
                <path
                  d="M 200,220 Q 230,265 280,290"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="2.8"
                  className="arbitration-pulse-conduit"
                  filter="url(#pulseGlow)"
                />
                {/* Active Data Packet 2: Solar-Wind Hedge */}
                <g filter="url(#pulseGlow)">
                  <animateMotion
                    path="M 200,220 Q 230,265 280,290"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                  <circle cx="0" cy="0" r="4.5" fill="#10b981" className="arbitration-packet-glow" />
                  <circle cx="0" cy="0" r="2" fill="#ffffff" />
                  <rect x="-25" y="-16" width="50" height="12" rx="3" fill="#040b17" stroke="#10b981" strokeWidth="0.8" opacity="0.9" />
                  <text x="0" y="-8" fill="#6ee7b7" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                    HEDGE 240MW
                  </text>
                </g>
              </g>

              {/* Mesh Conduit 3: Maharashtra (280, 290) <-> Tamil Nadu (350, 360) */}
              <g>
                <path
                  d="M 280,290 Q 300,335 350,360"
                  fill="none"
                  stroke="#818cf8"
                  strokeWidth="2.2"
                  strokeOpacity="0.45"
                />
                <path
                  d="M 280,290 Q 300,335 350,360"
                  fill="none"
                  stroke="#818cf8"
                  strokeWidth="2.8"
                  className="arbitration-pulse-conduit"
                  filter="url(#pulseGlow)"
                />
                {/* Active Data Packet 3: Latency & State Sync */}
                <g filter="url(#pulseGlow)">
                  <animateMotion
                    path="M 280,290 Q 300,335 350,360"
                    dur="1.8s"
                    repeatCount="indefinite"
                  />
                  <circle cx="0" cy="0" r="4.5" fill="#818cf8" className="arbitration-packet-glow" />
                  <circle cx="0" cy="0" r="2" fill="#ffffff" />
                  <rect x="-20" y="-16" width="40" height="12" rx="3" fill="#040b17" stroke="#818cf8" strokeWidth="0.8" opacity="0.9" />
                  <text x="0" y="-8" fill="#a5b4fc" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                    SLA 8.4ms
                  </text>
                </g>
              </g>

              {/* Mesh Conduit 4: Tamil Nadu (350, 360) <-> Central Hub (430, 210) */}
              <g>
                <path
                  d="M 350,360 Q 425,310 430,210"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeOpacity="0.6"
                />
                <path
                  d="M 350,360 Q 425,310 430,210"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="3.2"
                  className="arbitration-pulse-conduit"
                  filter="url(#pulseGlow)"
                />
                {/* Active Data Packet 4: Curtailed Power Absorption */}
                <g filter="url(#pulseGlow)">
                  <animateMotion
                    path="M 350,360 Q 425,310 430,210"
                    dur="1.4s"
                    repeatCount="indefinite"
                  />
                  <circle cx="0" cy="0" r="5" fill="#34d399" className="arbitration-packet-glow" />
                  <circle cx="0" cy="0" r="2.5" fill="#ffffff" />
                  <rect x="-26" y="-16" width="52" height="12" rx="3" fill="#040b17" stroke="#34d399" strokeWidth="0.8" opacity="0.9" />
                  <text x="0" y="-8" fill="#34d399" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                    ABSORB 310MW
                  </text>
                </g>
              </g>

              {/* Mesh Conduit 5: Rajasthan (270, 130) <-> Central Hub (430, 210) */}
              <g>
                <path
                  d="M 270,130 Q 360,150 430,210"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.4"
                  strokeOpacity="0.5"
                />
                <path
                  d="M 270,130 Q 360,150 430,210"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="3"
                  className="arbitration-pulse-conduit"
                  filter="url(#pulseGlow)"
                />
                {/* Active Data Packet 5: Solar Surplus Inflow */}
                <g filter="url(#pulseGlow)">
                  <animateMotion
                    path="M 270,130 Q 360,150 430,210"
                    dur="1.9s"
                    repeatCount="indefinite"
                  />
                  <circle cx="0" cy="0" r="4.5" fill="#38bdf8" className="arbitration-packet-glow" />
                  <circle cx="0" cy="0" r="2" fill="#ffffff" />
                  <rect x="-26" y="-16" width="52" height="12" rx="3" fill="#040b17" stroke="#38bdf8" strokeWidth="0.8" opacity="0.9" />
                  <text x="0" y="-8" fill="#7dd3fc" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                    SOLAR 180MW
                  </text>
                </g>
              </g>

              {/* Mesh Conduit 6: Central Hub (430, 210) <-> Global Grid Reserve (615, 240) */}
              <g>
                <path
                  d="M 430,210 Q 520,195 615,240"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="2.2"
                  strokeOpacity="0.5"
                />
                <path
                  d="M 430,210 Q 520,195 615,240"
                  fill="none"
                  stroke="#c084fc"
                  strokeWidth="2.8"
                  className="arbitration-pulse-conduit"
                  filter="url(#pulseGlow)"
                />
                {/* Active Data Packet 6: Cross-Border Fluid Reserve */}
                <g filter="url(#pulseGlow)">
                  <animateMotion
                    path="M 430,210 Q 520,195 615,240"
                    dur="2.3s"
                    repeatCount="indefinite"
                  />
                  <circle cx="0" cy="0" r="4.5" fill="#c084fc" className="arbitration-packet-glow" />
                  <circle cx="0" cy="0" r="2" fill="#ffffff" />
                  <rect x="-24" y="-16" width="48" height="12" rx="3" fill="#040b17" stroke="#c084fc" strokeWidth="0.8" opacity="0.9" />
                  <text x="0" y="-8" fill="#d8b4fe" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                    GLOBAL RES
                  </text>
                </g>
              </g>

              {/* Concentric Sonic Pulse Waves expanding from regional nodes */}
              {mapNodes.map((n) => (
                <g key={`arbitration-sonar-${n.id}`} transform={`translate(${n.x}, ${n.y})`} pointerEvents="none">
                  <circle cx="0" cy="0" r="8" fill="none" stroke="#38bdf8" strokeWidth="1.8" opacity="0.85">
                    <animate attributeName="r" values="8;44" dur="2.2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.85;0" dur="2.2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="0" cy="0" r="8" fill="none" stroke="#10b981" strokeWidth="1.4" opacity="0.75">
                    <animate attributeName="r" values="8;44" dur="2.2s" begin="1.1s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.75;0" dur="2.2s" begin="1.1s" repeatCount="indefinite" />
                  </circle>
                </g>
              ))}
            </g>
          )}

          {/* Regional Renewable Nodes (Rendered with interactive hover triggers) */}
          {mapNodes.map((node) => {
            const isSelected = node.id === selectedNodeId;
            const isHovered = hoveredNode?.id === node.id;
            const routing = computeGeminiRoutingLogic(node);
            const isGreenFlow = routing.status === 'Green-Flow Optimized';
            const accentColor = isGreenFlow ? '#10b981' : '#38bdf8';

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-pointer select-none"
                onClick={() => onSelectNode(node.id)}
                onMouseEnter={() => {
                  setHoveredNode(node);
                  setHoveredZoneId(node.id);
                }}
                onMouseLeave={() => {
                  setHoveredNode(null);
                  setHoveredZoneId(null);
                }}
              >
                {/* Large transparent hover target */}
                <circle cx="0" cy="0" r="32" fill="transparent" />

                <circle
                  cx="0"
                  cy="0"
                  r={isSelected || isHovered ? 24 : 16}
                  fill="none"
                  stroke={accentColor}
                  strokeWidth="2"
                  className="node-wave-pulse"
                  style={{ animationDuration: isSelected ? '1.2s' : '2.4s' }}
                />
                <circle
                  cx="0"
                  cy="0"
                  r={isSelected || isHovered ? 16 : 11}
                  fill="none"
                  stroke={isGreenFlow ? '#34d399' : '#7dd3fc'}
                  strokeWidth="1.5"
                  className="node-wave-pulse"
                  style={{ animationDuration: '1.8s' }}
                />
                <circle
                  cx="0"
                  cy="0"
                  r={isSelected || isHovered ? 9 : 6}
                  fill={accentColor}
                  filter="url(#hubGlow)"
                  className="node-core-strobe"
                />
                <circle cx="0" cy="0" r="2.5" fill="#ffffff" />

                {/* Regional Capsule Label */}
                <g transform={`translate(${node.labelOffsetX ?? (node.x > 350 ? 14 : -122)}, ${node.labelOffsetY ?? -18})`}>
                  <rect
                    width="122"
                    height="38"
                    rx="6"
                    fill="#080e1a"
                    stroke={isSelected || isHovered ? (isGreenFlow ? '#34d399' : '#38bdf8') : '#1e293b'}
                    strokeWidth={isSelected || isHovered ? 1.8 : 1}
                    opacity="0.95"
                  />
                  <text
                    x="8"
                    y="14"
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="sans-serif"
                  >
                    {node.name}
                  </text>
                  <text
                    x="8"
                    y="27"
                    fill={isGreenFlow ? '#10b981' : '#38bdf8'}
                    fontSize="9.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {isGreenFlow ? '● Green-Flow' : '○ Std-Grid'} · {node.type}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Real-time Grid Vitality Notification Badge Overlay */}
        <GridVitalityBadge
          selectedNode={liveSelectedNode}
          onOpenHardwareInspector={() => setActiveView('health')}
          onUpdateStatus={onUpdateNodeStatus}
        />

        {/* Right Floating Metric Card: Total Surplus & Utilization Rate */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-slate-950/90 border border-slate-800 rounded-xl p-3 sm:p-3.5 backdrop-blur-md shadow-2xl min-w-[190px] sm:min-w-[210px] space-y-2.5 sm:space-y-3 z-10 pointer-events-none hidden md:block">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400 font-medium">Total Surplus (India)</span>
              <span className="text-emerald-400 font-bold font-mono text-sm">
                {totalSurplusMW} MW
              </span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: '85%' }} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400 font-medium">Utilization Rate</span>
              <span className="text-emerald-400 font-bold font-mono text-sm">
                {utilizationRatePct}%
              </span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${utilizationRatePct}%` }} />
            </div>
          </div>
        </div>

        {/* Spatial-Temporal Live Arbitration Pulse HUD Badge */}
        {showArbitrationPulse && (
          <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="bg-slate-950/90 border border-emerald-500/40 rounded-xl px-3 py-2 backdrop-blur-md shadow-2xl flex items-center gap-3 font-mono">
              <div className="relative flex items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="absolute w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black text-white tracking-wide">LIVE ARBITRATION PULSE</span>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold border border-emerald-500/30">
                    ORCHESTRATING
                  </span>
                </div>
                <div className="text-[9.5px] text-slate-400 flex items-center gap-2 mt-0.5">
                  <span className="text-emerald-300 font-bold">1,840 pkts/s</span>
                  <span>·</span>
                  <span className="text-sky-300">54.2 GB/s Mesh</span>
                  <span>·</span>
                  <span className="text-purple-300">8.4ms Sync</span>
                  <span className="hidden sm:inline text-slate-500">· Intra-Grid State Migration</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hover-Triggered Tooltip: Gemini-Based Routing Logic Status */}
        {hoveredNode && (
          <div
            className="absolute z-30 pointer-events-none transition-all duration-150 animate-in fade-in zoom-in-95"
            style={{
              left: `${(hoveredNode.x / 740) * 100}%`,
              top: `${(hoveredNode.y / 420) * 100}%`,
              transform:
                hoveredNode.x > 380
                  ? hoveredNode.y > 260
                    ? 'translate(-104%, -90%)'
                    : 'translate(-104%, -30%)'
                  : hoveredNode.y > 260
                  ? 'translate(18px, -90%)'
                  : 'translate(18px, -30%)',
            }}
          >
            <GeminiRoutingTooltipCard
              node={{
                id: hoveredNode.id,
                name: hoveredNode.name,
                region: hoveredNode.region,
                country: hoveredNode.country,
                type: hoveredNode.type,
                spotPrice: hoveredNode.spotPrice,
                surplusMW: hoveredNode.surplusMW,
                activeContainers: hoveredNode.activeContainers,
                hardwareStatus:
                  nodes.find((n) => n.id === hoveredNode.id)?.hardwareStatus || 'HEALTHY',
                ippSupplier: nodes.find((n) => n.id === hoveredNode.id)?.ippSupplier,
                cercClassification: nodes.find((n) => n.id === hoveredNode.id)?.cercClassification,
              }}
            />
          </div>
        )}

        {/* Volatility Zone HUD Card (if heat zone hovered without direct node match) */}
        {!hoveredNode && isHeatLayerActive && activeHoveredZone && (
          <div className="absolute bottom-4 left-4 z-20 pointer-events-none animate-in fade-in duration-150">
            <VolatilityZoneHoverCard zone={activeHoveredZone} />
          </div>
        )}
      </div>

      {/* Volatility Legend (shown when heat layer is toggled ON) */}
      {isHeatLayerActive && <VolatilityLegend />}

      {/* Selected Corridor Status Bar */}
      <div className="bg-[#080d18] px-5 py-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="text-slate-400">Focused Hub:</span>
          <span className="font-bold text-white bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
            {currentSelectedNode.name} ({currentSelectedNode.subtext})
          </span>
          {nodes.find((n) => n.id === currentSelectedNode.id)?.ippSupplier && (
            <span className="text-amber-300 font-mono text-[11px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              IPP: {nodes.find((n) => n.id === currentSelectedNode.id)?.ippSupplier}
            </span>
          )}
          <span className="text-emerald-400 font-mono text-[11px] hidden sm:inline">
            Substation Co-Location Active (CERC Carrier)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView(activeView === 'map' ? 'health' : 'map')}
            className="px-3 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-semibold rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>{activeView === 'map' ? 'Inspect Corridor Hardware Health' : 'Back to Map'}</span>
          </button>
        </div>
      </div>

      {activeView === 'health' && (
        <div className="border-t border-slate-800">
          <InfrastructureHealthInspector
            selectedNode={nodes.find((n) => n.id === selectedNodeId) || nodes[0]}
            allNodes={nodes}
            onSelectNode={onSelectNode}
            onUpdateNodeStatus={onUpdateNodeStatus}
          />
        </div>
      )}
    </div>
  );
};
