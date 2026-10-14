import React, { useState, useMemo } from 'react';
import {
  TrendingDown,
  TrendingUp,
  BarChart2,
  Activity,
  Sparkles,
  Calendar,
} from 'lucide-react';

export interface TelemetryPoint {
  time: string;
  price: number;
  curtailment: number;
}

export interface TelemetryChartsProps {
  history: TelemetryPoint[];
  currentPrice: number;
  currentCurtailment: number;
}

interface ProcessedPoint extends TelemetryPoint {
  isForecast: boolean;
  smaPrice: number;
  smaCurtailment: number;
  timeOffsetMin: number;
}

export const TelemetryCharts: React.FC<TelemetryChartsProps> = ({
  history,
  currentPrice,
  currentCurtailment,
}) => {
  const [showSMA, setShowSMA] = useState<boolean>(true);
  const [activeMetricView, setActiveMetricView] = useState<'COMBINED' | 'PRICE_SMA' | 'SURGE_SMA'>('COMBINED');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const width = 600;
  const height = 180;
  const paddingLeft = 40;
  const paddingRight = 30;
  const paddingTop = 26;
  const paddingBottom = 30;

  const normalizedHistory = useMemo<TelemetryPoint[]>(() => {
    const historicalIntervals = ['-60m', '-50m', '-40m', '-30m', '-20m', '-10m'];
    
    if (history && history.length >= 6) {
      const lastPoints = history.slice(-6);
      return [
        ...lastPoints.map((p, idx) => ({
          time: p.time.startsWith('-') || p.time === 'Now' ? p.time : historicalIntervals[idx] || p.time,
          price: p.price,
          curtailment: p.curtailment,
        })),
        { time: 'Now', price: currentPrice, curtailment: currentCurtailment },
      ];
    }

    const priceDeltaPerStep = (4.5 - currentPrice) / 6;
    const curtailmentDeltaPerStep = (currentCurtailment - 50) / 6;
    const syntheticHistory: TelemetryPoint[] = historicalIntervals.map((interval, i) => {
      const stepFactor = 6 - i;
      return {
        time: interval,
        price: Number((currentPrice + priceDeltaPerStep * stepFactor + (Math.sin(i * 1.2) * 0.4)).toFixed(2)),
        curtailment: Math.max(30, Math.round(currentCurtailment - curtailmentDeltaPerStep * stepFactor + (Math.cos(i * 1.5) * 6))),
      };
    });

    syntheticHistory.push({
      time: 'Now',
      price: currentPrice,
      curtailment: currentCurtailment,
    });
    return syntheticHistory;
  }, [history, currentPrice, currentCurtailment]);

  const { historicalWithSMA, smaPriceMomentum, smaCurtailmentMomentum } = useMemo(() => {
    const smaWindow = 3;
    const computed: Array<TelemetryPoint & { smaPrice: number; smaCurtailment: number; timeOffsetMin: number }> = [];

    for (let i = 0; i < normalizedHistory.length; i++) {
      const startIdx = Math.max(0, i - smaWindow + 1);
      const windowSlice = normalizedHistory.slice(startIdx, i + 1);
      
      const windowAvgPrice = windowSlice.reduce((acc, curr) => acc + curr.price, 0) / windowSlice.length;
      const windowAvgCurtailment = windowSlice.reduce((acc, curr) => acc + curr.curtailment, 0) / windowSlice.length;
      const offsetMin = (i - (normalizedHistory.length - 1)) * 10;

      computed.push({
        ...normalizedHistory[i],
        smaPrice: Number(windowAvgPrice.toFixed(2)),
        smaCurtailment: Math.round(windowAvgCurtailment),
        timeOffsetMin: offsetMin,
      });
    }

    const firstSMA = computed[0];
    const lastSMA = computed[computed.length - 1];
    const steps = computed.length - 1 || 1;
    const priceMomentum = (lastSMA.smaPrice - firstSMA.smaPrice) / steps;
    const curtailmentMomentum = (lastSMA.smaCurtailment - firstSMA.smaCurtailment) / steps;

    return {
      historicalWithSMA: computed,
      smaPriceMomentum: priceMomentum,
      smaCurtailmentMomentum: curtailmentMomentum,
    };
  }, [normalizedHistory]);

  const allPoints = useMemo<ProcessedPoint[]>(() => {
    const forecastIntervals = [
      { time: '+15m', offset: 15, step: 1.5 },
      { time: '+30m', offset: 30, step: 3.0 },
      { time: '+45m', offset: 45, step: 4.5 },
      { time: '+60m', offset: 60, step: 6.0 },
    ];

    const lastHistorical = historicalWithSMA[historicalWithSMA.length - 1];

    const points: ProcessedPoint[] = historicalWithSMA.map((h) => ({
      ...h,
      isForecast: false,
    }));

    forecastIntervals.forEach((forecast, fIdx) => {
      const crestFactor = Math.sin(((fIdx + 1) / forecastIntervals.length) * Math.PI * 0.95);
      const predictedCurtailmentSurge = Math.max(
        40,
        Math.round(
          lastHistorical.curtailment +
          smaCurtailmentMomentum * forecast.step +
          crestFactor * 28
        )
      );

      const predictedPrice = Number(
        Math.max(
          -5.5,
          Math.min(
            15.0,
            lastHistorical.price +
            smaPriceMomentum * forecast.step -
            crestFactor * 0.9
          )
        ).toFixed(2)
      );

      const projectedSMAPrice = Number(
        (lastHistorical.smaPrice + smaPriceMomentum * forecast.step * 0.85).toFixed(2)
      );
      const projectedSMACurtailment = Math.round(
        lastHistorical.smaCurtailment + smaCurtailmentMomentum * forecast.step * 0.9 + crestFactor * 22
      );

      points.push({
        time: forecast.time,
        price: predictedPrice,
        curtailment: predictedCurtailmentSurge,
        isForecast: true,
        smaPrice: projectedSMAPrice,
        smaCurtailment: projectedSMACurtailment,
        timeOffsetMin: forecast.offset,
      });
    });

    return points;
  }, [historicalWithSMA, smaPriceMomentum, smaCurtailmentMomentum]);

  const nowIndex = historicalWithSMA.length - 1;

  const minPrice = Math.min(...allPoints.map((p) => Math.min(p.price, p.smaPrice)), -4.5);
  const maxPrice = Math.max(...allPoints.map((p) => Math.max(p.price, p.smaPrice)), 12.0);
  const maxCurtailment = Math.max(...allPoints.map((p) => Math.max(p.curtailment, p.smaCurtailment)), 260);

  const getX = (index: number) => {
    return paddingLeft + (index / (allPoints.length - 1)) * (width - paddingLeft - paddingRight);
  };
  const getYPrice = (priceVal: number) => {
    const usableHeight = height - paddingTop - paddingBottom;
    const ratio = (priceVal - minPrice) / (maxPrice - minPrice);
    return height - paddingBottom - ratio * usableHeight;
  };
  const getYCurtailment = (curtailmentVal: number) => {
    const usableHeight = height - paddingTop - paddingBottom;
    const ratio = curtailmentVal / maxCurtailment;
    return height - paddingBottom - ratio * usableHeight;
  };

  const nowX = getX(nowIndex);
  const zeroY = getYPrice(0);

  const historicalPricePath = allPoints
    .slice(0, nowIndex + 1)
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getYPrice(p.price)}`)
    .join(' ');

  const forecastPricePath = allPoints
    .slice(nowIndex)
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(nowIndex + i)} ${getYPrice(p.price)}`)
    .join(' ');

  const fullSMAPricePath = allPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getYPrice(p.smaPrice)}`)
    .join(' ');

  const fullSMACurtailmentPath = allPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getYCurtailment(p.smaCurtailment)}`)
    .join(' ');

  const peakForecastPoint = useMemo(() => {
    const forecastOnly = allPoints.slice(nowIndex);
    return forecastOnly.reduce((max, curr) => (curr.curtailment > max.curtailment ? curr : max), forecastOnly[0]);
  }, [allPoints, nowIndex]);

  const peakForecastIdx = allPoints.findIndex((p) => p === peakForecastPoint);
  const peakForecastX = peakForecastIdx >= 0 ? getX(peakForecastIdx) : nowX;

  const activeHoverPoint = hoveredIndex !== null ? allPoints[hoveredIndex] : null;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
      {/* Component Header */}
      <div className="flex flex-wrap items-center justify-between pb-3 mb-2 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
            <BarChart2 className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <span>Energy Cost &amp; Surge Forecast</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Sparkles className="w-2.5 h-2.5" />
                60m SMA Trend
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Simple Moving Average of past 60m extrapolates future renewable surges
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSMA(!showSMA)}
            className={`px-2 py-1 rounded text-[11px] font-mono font-semibold transition-all flex items-center gap-1 border cursor-pointer ${
              showSMA
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Toggle Simple Moving Average Predictive Trendline"
          >
            <Activity className="w-3 h-3" />
            <span>SMA: {showSMA ? 'ON' : 'OFF'}</span>
          </button>

          <div className="bg-slate-950 p-0.5 rounded-lg border border-slate-800 flex items-center text-[10px] font-mono">
            <button
              onClick={() => setActiveMetricView('COMBINED')}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                activeMetricView === 'COMBINED' ? 'bg-slate-800 text-slate-100 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveMetricView('PRICE_SMA')}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                activeMetricView === 'PRICE_SMA' ? 'bg-sky-500/20 text-sky-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tariff
            </button>
            <button
              onClick={() => setActiveMetricView('SURGE_SMA')}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                activeMetricView === 'SURGE_SMA' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Surge
            </button>
          </div>
        </div>
      </div>

      {/* SVG Interactive Chart Canvas */}
      <div className="relative w-full h-[180px] bg-[#070b14] rounded-lg p-1 border border-slate-800/80 overflow-hidden group select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="forecastShade" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.02" />
              <stop offset="50%" stopColor="#10b981" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.12" />
            </linearGradient>
            <linearGradient id="curtailmentBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#15803d" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="forecastBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.2" />
            </linearGradient>
            <pattern id="forecastHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#334155" strokeWidth="1" strokeOpacity="0.4" />
            </pattern>
          </defs>

          {/* Forecast Horizon Background Shading */}
          <rect
            x={nowX}
            y={paddingTop}
            width={width - paddingRight - nowX}
            height={height - paddingTop - paddingBottom}
            fill="url(#forecastShade)"
          />
          <rect
            x={nowX}
            y={paddingTop}
            width={width - paddingRight - nowX}
            height={height - paddingTop - paddingBottom}
            fill="url(#forecastHatch)"
          />

          {/* Horizontal Grid Baseline Lines */}
          <line
            x1={paddingLeft}
            y1={paddingTop}
            x2={width - paddingRight}
            y2={paddingTop}
            stroke="#1e293b"
            strokeDasharray="3 3"
          />
          <line
            x1={paddingLeft}
            y1={(paddingTop + height - paddingBottom) / 2}
            x2={width - paddingRight}
            y2={(paddingTop + height - paddingBottom) / 2}
            stroke="#1e293b"
            strokeDasharray="3 3"
          />
          <line
            x1={paddingLeft}
            y1={height - paddingBottom}
            x2={width - paddingRight}
            y2={height - paddingBottom}
            stroke="#1e293b"
          />

          {/* Zero Tariff Parity Line ($0.00/MWh) */}
          {zeroY >= paddingTop && zeroY <= height - paddingBottom && (
            <g>
              <line
                x1={paddingLeft}
                y1={zeroY}
                x2={width - paddingRight}
                y2={zeroY}
                stroke="#ef4444"
                strokeWidth="1.2"
                strokeDasharray="3 2"
                opacity="0.75"
              />
              <text
                x={paddingLeft + 4}
                y={zeroY - 4}
                fill="#f87171"
                fontSize="8"
                fontFamily="monospace"
                fontWeight="bold"
              >
                $0.00 PARITY (FREE COMPUTE)
              </text>
            </g>
          )}

          {/* Vertical 'Now' Divider */}
          <line
            x1={nowX}
            y1={paddingTop - 6}
            x2={nowX}
            y2={height - paddingBottom + 4}
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeDasharray="4 2"
            opacity="0.9"
          />

          <text
            x={paddingLeft + 6}
            y={paddingTop + 10}
            fill="#64748b"
            fontSize="8"
            fontFamily="monospace"
            letterSpacing="0.05em"
          >
            LAST 60M (TELEMETRY)
          </text>
          <text
            x={nowX + 6}
            y={paddingTop + 10}
            fill="#10b981"
            fontSize="8"
            fontFamily="monospace"
            fontWeight="bold"
            letterSpacing="0.05em"
          >
            EXPECTED SURGE (+60M PREDICTION)
          </text>

          {/* Curtailment Stranded Energy Bars */}
          {activeMetricView !== 'PRICE_SMA' &&
            allPoints.map((p, i) => {
              const barW = 14;
              const x = getX(i) - barW / 2;
              const barH = (p.curtailment / maxCurtailment) * (height - paddingTop - paddingBottom);
              const y = height - paddingBottom - barH;
              return (
                <g key={`curtailment-bar-${i}`}>
                  <rect
                    x={x}
                    y={y}
                    width={barW}
                    height={barH}
                    fill={p.isForecast ? 'url(#forecastBarGrad)' : 'url(#curtailmentBarGrad)'}
                    stroke={p.isForecast ? '#34d399' : '#22c55e'}
                    strokeWidth={p.isForecast ? 1 : 0.5}
                    strokeDasharray={p.isForecast ? '2 2' : 'none'}
                    rx="2"
                    opacity={p.isForecast ? 0.75 : 0.85}
                  />
                </g>
              );
            })}

          {showSMA && activeMetricView === 'SURGE_SMA' && (
            <path
              d={fullSMACurtailmentPath}
              fill="none"
              stroke="#34d399"
              strokeWidth="2.5"
              strokeDasharray="4 3"
              strokeLinecap="round"
            />
          )}

          {activeMetricView !== 'SURGE_SMA' && (
            <>
              <path
                d={historicalPricePath}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                d={forecastPricePath}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeDasharray="4 3"
                strokeLinecap="round"
                opacity="0.75"
              />
              {allPoints.map((p, i) => {
                const x = getX(i);
                const y = getYPrice(p.price);
                const isNow = i === nowIndex;
                return (
                  <circle
                    key={`price-dot-${i}`}
                    cx={x}
                    cy={y}
                    r={isNow ? 4.5 : 3}
                    fill={p.price <= 0 ? '#ef4444' : '#38bdf8'}
                    stroke="#070b14"
                    strokeWidth="1.5"
                  />
                );
              })}
            </>
          )}

          {showSMA && activeMetricView !== 'SURGE_SMA' && (
            <g>
              <path
                d={fullSMAPricePath}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeDasharray="5 3"
                strokeLinecap="round"
              />
              {allPoints.map((p, i) => {
                const x = getX(i);
                const y = getYPrice(p.smaPrice);
                return (
                  <circle
                    key={`sma-dot-${i}`}
                    cx={x}
                    cy={y}
                    r="2"
                    fill="#fbbf24"
                    opacity="0.85"
                  />
                );
              })}
            </g>
          )}

          <g>
            <circle
              cx={nowX}
              cy={height - paddingBottom}
              r="4"
              fill="#38bdf8"
              className="animate-ping"
              opacity="0.6"
            />
            <circle
              cx={nowX}
              cy={height - paddingBottom}
              r="3"
              fill="#38bdf8"
            />
          </g>

          {/* Peak badge */}
          {peakForecastPoint && (
            <g>
              <rect
                x={peakForecastX - 44}
                y={paddingTop + 4}
                width="88"
                height="15"
                rx="3"
                fill="#064e3b"
                stroke="#34d399"
                strokeWidth="1"
              />
              <text
                x={peakForecastX}
                y={paddingTop + 14}
                fill="#6ee7b7"
                fontSize="8"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
              >
                SURGE PEAK: {peakForecastPoint.curtailment}MWh
              </text>
            </g>
          )}

          {allPoints.map((p, i) => {
            const x = getX(i);
            const isNow = i === nowIndex;
            return (
              <g key={`x-tick-${i}`}>
                <text
                  x={x}
                  y={height - paddingBottom + 14}
                  fill={isNow ? '#38bdf8' : p.isForecast ? '#34d399' : '#64748b'}
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight={isNow ? 'bold' : 'normal'}
                  textAnchor="middle"
                >
                  {p.time}
                </text>
              </g>
            );
          })}

          <text
            x={paddingLeft - 4}
            y={paddingTop + 4}
            fill="#64748b"
            fontSize="8"
            fontFamily="monospace"
            textAnchor="end"
          >
            ${maxPrice.toFixed(0)}
          </text>
          <text
            x={paddingLeft - 4}
            y={height - paddingBottom}
            fill="#64748b"
            fontSize="8"
            fontFamily="monospace"
            textAnchor="end"
          >
            ${minPrice.toFixed(0)}
          </text>
          <text
            x={width - paddingRight + 4}
            y={paddingTop + 4}
            fill="#10b981"
            fontSize="8"
            fontFamily="monospace"
            textAnchor="start"
          >
            {maxCurtailment}MWh
          </text>

          {allPoints.map((p, i) => {
            const stepW = (width - paddingLeft - paddingRight) / (allPoints.length - 1);
            const x = getX(i) - stepW / 2;
            return (
              <rect
                key={`hover-zone-${i}`}
                x={x}
                y={paddingTop}
                width={stepW}
                height={height - paddingTop - paddingBottom}
                fill="transparent"
                className="cursor-crosshair"
                onMouseEnter={() => setHoveredIndex(i)}
              />
            );
          })}

          {hoveredIndex !== null && activeHoverPoint && (
            <g>
              <line
                x1={getX(hoveredIndex)}
                y1={paddingTop}
                x2={getX(hoveredIndex)}
                y2={height - paddingBottom}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.8"
              />
              <circle
                cx={getX(hoveredIndex)}
                cy={getYPrice(activeHoverPoint.price)}
                r="4.5"
                fill="#38bdf8"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              {showSMA && (
                <circle
                  cx={getX(hoveredIndex)}
                  cy={getYPrice(activeHoverPoint.smaPrice)}
                  r="3.5"
                  fill="#f59e0b"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              )}
            </g>
          )}
        </svg>

        {activeHoverPoint && hoveredIndex !== null && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-950/95 border border-slate-700/80 rounded-lg p-2.5 shadow-2xl backdrop-blur-md text-[11px] font-mono"
            style={{
              left: `${Math.min(72, Math.max(8, (hoveredIndex / (allPoints.length - 1)) * 100))}%`,
              top: '18px',
              transform: hoveredIndex > 5 ? 'translateX(-85%)' : 'translateX(5%)',
            }}
          >
            <div className="flex items-center justify-between gap-3 pb-1 mb-1.5 border-b border-slate-800">
              <span className="font-bold text-slate-100 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-sky-400" />
                {activeHoverPoint.time}
              </span>
              <span
                className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                  activeHoverPoint.isForecast
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {activeHoverPoint.isForecast ? '60m SMA PROJECTION' : 'GRID TELEMETRY'}
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Spot Tariff:</span>
                <span
                  className={`font-bold ${
                    activeHoverPoint.price <= 0 ? 'text-emerald-400' : 'text-sky-300'
                  }`}
                >
                  ${activeHoverPoint.price.toFixed(2)}/MWh
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Surplus Clean Energy:</span>
                <span className="text-emerald-400 font-bold">
                  {activeHoverPoint.curtailment} MWh
                </span>
              </div>
              {showSMA && (
                <div className="flex justify-between gap-4 pt-0.5 border-t border-slate-800/80">
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <Activity className="w-2.5 h-2.5" />
                    SMA Trend:
                  </span>
                  <span className="text-amber-300 font-bold">
                    ${activeHoverPoint.smaPrice.toFixed(2)}/MWh
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Legend & Analytics */}
      <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-2">
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 gap-y-1">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-sky-400 rounded-full" />
              <span className="text-[11px] text-slate-300">Energy Cost ($/MWh)</span>
            </div>
            {showSMA && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-b border-amber-400 border-dashed" />
                <span className="text-[11px] text-amber-300 font-medium">SMA Predictive Trend</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-2 bg-emerald-500/40 rounded-xs border border-emerald-500/60" />
              <span className="text-[11px] text-slate-300">Surplus Clean Energy (MWh)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-2 bg-emerald-400/20 rounded-xs border border-dashed border-emerald-400" />
              <span className="text-[11px] text-emerald-400 font-medium">Surge Forecast (+60m)</span>
            </div>
          </div>
          <div className="font-mono text-[11px] text-slate-300">
            Window Spread: <span className="text-emerald-400 font-bold">${minPrice.toFixed(2)}</span> to{' '}
            <span className="text-sky-300 font-bold">${maxPrice.toFixed(2)}</span>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/90 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
              {smaPriceMomentum < 0 ? (
                <TrendingDown className="w-3.5 h-3.5" />
              ) : (
                <TrendingUp className="w-3.5 h-3.5" />
              )}
            </div>
            <div>
              <span className="text-slate-400">60m SMA Momentum: </span>
              <span className={smaCurtailmentMomentum >= 0 ? 'text-emerald-400 font-bold' : 'text-slate-200 font-bold'}>
                {smaCurtailmentMomentum >= 0 ? '+' : ''}{(smaCurtailmentMomentum * 6).toFixed(1)} MWh/hr
              </span>
              <span className="text-slate-500 mx-1.5">·</span>
              <span className={smaPriceMomentum <= 0 ? 'text-emerald-400 font-bold' : 'text-sky-300 font-bold'}>
                {smaPriceMomentum <= 0 ? '' : '+'}{(smaPriceMomentum * 6).toFixed(2)} $/hr
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Next Peak:</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold">
              {peakForecastPoint.curtailment} MWh @ {peakForecastPoint.time} (${peakForecastPoint.price.toFixed(2)}/MWh)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
