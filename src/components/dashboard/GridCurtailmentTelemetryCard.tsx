import React, { useState } from 'react';
import {
  TrendingDown,
  Calendar,
  Layers,
  Sparkles,
  Gauge,
  LineChart,
  LayoutGrid,
} from 'lucide-react';
import { GridNode } from '../../types';
import { SustainabilityGauge } from './SustainabilityGauge';

interface GridCurtailmentTelemetryCardProps {
  selectedNode: GridNode;
  history: Array<{ time: string; price: number; curtailment: number }>;
}

export const GridCurtailmentTelemetryCard: React.FC<GridCurtailmentTelemetryCardProps> = ({
  selectedNode,
}) => {
  const [timeRange, setTimeRange] = useState<'24h' | '12h' | '1h'>('24h');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeTelemetryView, setActiveTelemetryView] = useState<'combined' | 'gauge' | 'curve'>('combined');

  // 24-hour simulation data points matching screenshot
  // Spot prices in INR (₹/MWh) or USD ($/MWh)
  const currencySymbol = '₹';
  const dataPoints = [
    { time: '00:00', price: 120, containers: 110 },
    { time: '02:00', price: 85, containers: 130 },
    { time: '04:00', price: 60, containers: 145 },
    { time: '06:00', price: 130, containers: 170 },
    { time: '08:00', price: 145, containers: 210 },
    { time: '10:00', price: 90, containers: 240 },
    { time: '11:00', price: -40, containers: 290 },
    { time: '12:00', price: -178, containers: 380, isPeakCurtailment: true },
    { time: '13:00', price: -145, containers: 360 },
    { time: '14:00', price: -95, containers: 310 },
    { time: '16:00', price: 80, containers: 220 },
    { time: '18:00', price: 140, containers: 180 },
    { time: '20:00', price: 120, containers: 150 },
    { time: '22:00', price: 40, containers: 190 },
    { time: '24:00', price: -25, containers: 260 },
  ];

  const svgWidth = 420;
  const svgHeight = 160;
  const padLeft = 35;
  const padRight = 35;
  const padTop = 20;
  const padBottom = 26;
  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  const minPrice = -200;
  const maxPrice = 200;
  const maxContainers = 400;

  const getX = (i: number) => padLeft + (i / (dataPoints.length - 1)) * chartW;
  const getYPrice = (val: number) => {
    const ratio = (val - minPrice) / (maxPrice - minPrice);
    return padTop + chartH - ratio * chartH;
  };
  const getYContainers = (val: number) => {
    const ratio = val / maxContainers;
    return padTop + chartH - ratio * chartH;
  };

  const zeroPriceY = getYPrice(0);

  // Line path for Spot Price
  const pricePath = dataPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getYPrice(p.price).toFixed(1)}`)
    .join(' ');

  // Peak curtailment point
  const peakPt = dataPoints.find((d) => d.isPeakCurtailment) || dataPoints[7];
  const peakIdx = dataPoints.indexOf(peakPt);
  const peakX = getX(peakIdx);
  const peakY = getYPrice(peakPt.price);

  const activePoint = hoveredIndex !== null ? dataPoints[hoveredIndex] : null;

  return (
    <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Grid Curtailment &amp; Sustainability</span>
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-bold">
              D3.js Real-Time
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Dynamic performance gauge &amp; diurnal negative pricing telemetry
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {/* View mode switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[11px] font-mono">
            <button
              onClick={() => setActiveTelemetryView('combined')}
              className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 ${
                activeTelemetryView === 'combined'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Combined view: Performance Gauge + 24h Diurnal Curve"
            >
              <LayoutGrid className="w-3 h-3" />
              <span className="hidden sm:inline">Both</span>
            </button>
            <button
              onClick={() => setActiveTelemetryView('gauge')}
              className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 ${
                activeTelemetryView === 'gauge'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Circular Performance Gauge Only"
            >
              <Gauge className="w-3 h-3" />
              <span className="hidden sm:inline">Gauge</span>
            </button>
            <button
              onClick={() => setActiveTelemetryView('curve')}
              className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 ${
                activeTelemetryView === 'curve'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="24h Diurnal Curtailment Curve Only"
            >
              <LineChart className="w-3 h-3" />
              <span className="hidden sm:inline">Curve</span>
            </button>
          </div>

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-300 font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="24h">24h View</option>
            <option value="12h">12h View</option>
            <option value="1h">1h Live</option>
          </select>
        </div>
      </div>

      {/* 1. D3.js Circular Performance Gauge (Dynamic Real-Time Sustainability Score) */}
      {(activeTelemetryView === 'combined' || activeTelemetryView === 'gauge') && (
        <div className="w-full">
          <SustainabilityGauge node={selectedNode} />
        </div>
      )}

      {/* 2. Diurnal Spot Price & Active Container Chart Canvas */}
      {(activeTelemetryView === 'combined' || activeTelemetryView === 'curve') && (
        <div className="flex flex-col gap-2">
          {/* Legend */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-1 bg-emerald-400 rounded-full" />
                <span>Spot Price ({currencySymbol}/MWh)</span>
              </span>
              <span className="flex items-center gap-1.5 text-sky-400">
                <span className="w-2 h-2 bg-sky-500 rounded-xs" />
                <span>Active Containers</span>
              </span>
            </div>
            <span className="text-[10px] text-slate-500">
              Corridor: {selectedNode.name.split(' ')[0]}
            </span>
          </div>

          {/* Chart Canvas */}
          <div className="relative bg-[#070b14] rounded-xl border border-slate-900 p-1 overflow-hidden select-none">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto overflow-visible"
              onMouseLeave={() => setHoveredIndex(null)}
            >
          {/* Zero Line (Negative Price Parity) */}
          <line
            x1={padLeft}
            y1={zeroPriceY}
            x2={svgWidth - padRight}
            y2={zeroPriceY}
            stroke="#334155"
            strokeWidth="1"
            strokeDasharray="2 2"
          />

          {/* Active Container Bars (Blue) */}
          {dataPoints.map((p, i) => {
            const barW = 10;
            const x = getX(i) - barW / 2;
            const y = getYContainers(p.containers);
            const h = padTop + chartH - y;
            return (
              <rect
                key={`bar-${i}`}
                x={x}
                y={y}
                width={barW}
                height={h}
                fill="#0284c7"
                opacity={0.45}
                rx={1.5}
              />
            );
          })}

          {/* Spot Price Line (Green Neon) */}
          <path
            d={pricePath}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Negative Curtailment Event Callout Banner */}
          <g transform={`translate(${peakX - 55}, ${peakY - 26})`}>
            <rect
              width="110"
              height="20"
              rx="4"
              fill="#064e3b"
              stroke="#10b981"
              strokeWidth="1"
              opacity="0.95"
            />
            <text
              x="55"
              y="13"
              fill="#a7f3d0"
              fontSize="9"
              fontFamily="monospace"
              fontWeight="bold"
              textAnchor="middle"
            >
              -{currencySymbol}178/MWh Event
            </text>
            {/* Arrow pointer */}
            <polygon
              points="51,20 59,20 55,25"
              fill="#10b981"
            />
          </g>

          {/* Peak Dot */}
          <circle
            cx={peakX}
            cy={peakY}
            r="4"
            fill="#10b981"
            stroke="#ffffff"
            strokeWidth="1.5"
          />

          {/* X Axis Labels */}
          {['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'].map((time, idx) => {
            const pos = padLeft + (idx / 6) * chartW;
            return (
              <text
                key={time}
                x={pos}
                y={padTop + chartH + 16}
                fill="#64748b"
                fontSize="8.5"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {time}
              </text>
            );
          })}

          {/* Left Y Axis (Price) */}
          <text x={padLeft - 6} y={padTop + 4} fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="end">
            200
          </text>
          <text x={padLeft - 6} y={zeroPriceY + 3} fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="end">
            0
          </text>
          <text x={padLeft - 6} y={padTop + chartH} fill="#ef4444" fontSize="8" fontFamily="monospace" textAnchor="end">
            -200
          </text>

          {/* Right Y Axis (Containers) */}
          <text x={svgWidth - padRight + 6} y={padTop + 4} fill="#38bdf8" fontSize="8" fontFamily="monospace" textAnchor="start">
            400
          </text>
          <text x={svgWidth - padRight + 6} y={padTop + chartH / 2} fill="#38bdf8" fontSize="8" fontFamily="monospace" textAnchor="start">
            200
          </text>
          <text x={svgWidth - padRight + 6} y={padTop + chartH} fill="#38bdf8" fontSize="8" fontFamily="monospace" textAnchor="start">
            0
          </text>

          {/* Interactive Hit Boxes */}
          {dataPoints.map((p, i) => {
            const colW = chartW / dataPoints.length;
            return (
              <rect
                key={`hit-${i}`}
                x={getX(i) - colW / 2}
                y={padTop}
                width={colW}
                height={chartH}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
              />
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {activePoint && (
          <div className="absolute top-2 left-2 bg-slate-950/95 border border-slate-700 rounded-lg p-2 text-[10px] font-mono shadow-xl pointer-events-none z-10">
            <div className="font-bold text-white mb-0.5">{activePoint.time}</div>
            <div className="text-emerald-400 font-bold">
              Spot Price: {activePoint.price < 0 ? '-' : ''}{currencySymbol}{Math.abs(activePoint.price)}/MWh
            </div>
            <div className="text-sky-400 font-bold">
              Containers: {activePoint.containers} scaled
            </div>
          </div>
        )}
      </div>
    </div>
  )}
</div>
);
};
