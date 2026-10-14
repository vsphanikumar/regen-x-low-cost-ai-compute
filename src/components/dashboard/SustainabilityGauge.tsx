import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { GridNode } from '../../types';
import { Leaf, Gauge, Zap, ShieldCheck, Info } from 'lucide-react';

interface SustainabilityGaugeProps {
  node: GridNode;
}

export const SustainabilityGauge: React.FC<SustainabilityGaugeProps> = ({ node }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const prevAngleRef = useRef<number>(-135);
  const [showFormulaTooltip, setShowFormulaTooltip] = useState(false);

  // Spot price: negative or very low spot price means curtailed green power (boosts score up to 100)
  const spotPrice = node.spotPricePerMWh ?? 0;
  
  // Efficiency components
  const thermalEfficiency = node.healthMetrics?.thermalEfficiencyPct ?? 94.5;
  const coolingPue = node.healthMetrics?.coolingPue ?? 1.09;
  const carbonRate = node.carbonAvoidanceRateKgPerMWh ?? 450;
  
  // 1. Spot price component (0-40 pts): Negative spot prices indicate high curtailment absorption
  let priceScore = 30;
  if (spotPrice <= -2.0) {
    priceScore = 40;
  } else if (spotPrice < 0) {
    priceScore = 32 + Math.abs(spotPrice) * 4;
  } else {
    priceScore = Math.max(8, 28 - spotPrice * 3.5);
  }

  // 2. Efficiency component (0-35 pts): PUE near 1.0 and high thermal efficiency
  const pueNormalized = Math.max(0, Math.min(1, (1.35 - coolingPue) / 0.28));
  const thermalNormalized = Math.max(0, Math.min(1, (thermalEfficiency - 80) / 18));
  const efficiencyScore = pueNormalized * 20 + thermalNormalized * 15;

  // 3. Carbon Avoidance component (0-25 pts): 400-500 kg/MWh
  const carbonNormalized = Math.max(0, Math.min(1, (carbonRate - 300) / 180));
  const carbonScore = carbonNormalized * 25;

  const rawScore = priceScore + efficiencyScore + carbonScore;
  const sustainabilityScore = Math.min(99.4, Math.max(35, parseFloat(rawScore.toFixed(1))));

  // Rating grade
  const ratingGrade = sustainabilityScore >= 90 ? 'A+' : sustainabilityScore >= 78 ? 'A' : 'B';
  const ratingColor =
    sustainabilityScore >= 90
      ? '#10b981' // Emerald
      : sustainabilityScore >= 78
      ? '#06b6d4' // Cyan
      : '#f59e0b'; // Amber

  const statusLabel =
    sustainabilityScore >= 92
      ? 'Ultra-Green Sponge Active'
      : sustainabilityScore >= 80
      ? 'High Renewable Efficiency'
      : 'Baseline Grid Draw';

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 230;
    const height = 142;
    const radius = 88;
    const innerRadius = 68;

    // Gauge covers from -135 deg to +135 deg (270 deg total)
    const minAngle = -135;
    const maxAngle = 135;
    
    // Scale from score 0-100 to angle in degrees
    const scale = d3.scaleLinear().domain([0, 100]).range([minAngle, maxAngle]).clamp(true);
    const targetAngle = scale(sustainabilityScore);
    const fromAngle = prevAngleRef.current;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Defs for gradients & filters
    const defs = svg.append('defs');

    // Glow filter
    const filter = defs
      .append('filter')
      .attr('id', 'gauge-glow')
      .attr('x', '-30%')
      .attr('y', '-30%')
      .attr('width', '160%')
      .attr('height', '160%');
    filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Gauge track gradient
    const gradient = defs
      .append('linearGradient')
      .attr('id', 'gauge-track-gradient')
      .attr('x1', '0%')
      .attr('y1', '100%')
      .attr('x2', '100%')
      .attr('y2', '0%');
    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#f59e0b');
    gradient.append('stop').attr('offset', '40%').attr('stop-color', '#06b6d4');
    gradient.append('stop').attr('offset', '80%').attr('stop-color', '#10b981');
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#34d399');

    // Needle gradient
    const needleGrad = defs
      .append('linearGradient')
      .attr('id', 'needle-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');
    needleGrad.append('stop').attr('offset', '0%').attr('stop-color', '#ffffff');
    needleGrad.append('stop').attr('offset', '100%').attr('stop-color', ratingColor);

    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height - 18})`);

    // 1. Background Track Arc
    const backgroundArc = d3
      .arc()
      .innerRadius(innerRadius)
      .outerRadius(radius)
      .startAngle((minAngle * Math.PI) / 180)
      .endAngle((maxAngle * Math.PI) / 180)
      .cornerRadius(4);

    g.append('path')
      .attr('d', backgroundArc as any)
      .attr('fill', '#1e293b')
      .attr('opacity', 0.45);

    // 2. Colored Track Segment with gradient
    const activeArcGenerator = d3
      .arc()
      .innerRadius(innerRadius)
      .outerRadius(radius)
      .startAngle((minAngle * Math.PI) / 180)
      .cornerRadius(4);

    const activeTrack = g
      .append('path')
      .datum({ endAngle: (fromAngle * Math.PI) / 180 })
      .attr('fill', 'url(#gauge-track-gradient)')
      .attr('filter', 'url(#gauge-glow)')
      .attr('opacity', 0.95);

    activeTrack
      .transition()
      .duration(1100)
      .ease(d3.easeCubicOut)
      .attrTween('d', function (d: any) {
        const interpolate = d3.interpolate(d.endAngle, (targetAngle * Math.PI) / 180);
        return function (t) {
          d.endAngle = interpolate(t);
          return activeArcGenerator(d) || '';
        };
      });

    // 3. Tick Marks & Numbers
    const tickValues = [0, 25, 50, 75, 100];
    const tickGroup = g.append('g').attr('class', 'ticks');

    tickValues.forEach((val) => {
      const angleDeg = scale(val);
      const angleRad = ((angleDeg - 90) * Math.PI) / 180;
      
      const rInner = innerRadius - 4;
      const rOuter = radius + 3;
      const x1 = Math.cos(angleRad) * rInner;
      const y1 = Math.sin(angleRad) * rInner;
      const x2 = Math.cos(angleRad) * rOuter;
      const y2 = Math.sin(angleRad) * rOuter;

      tickGroup
        .append('line')
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2)
        .attr('stroke', val <= sustainabilityScore ? ratingColor : '#475569')
        .attr('stroke-width', val % 50 === 0 ? 1.5 : 1)
        .attr('opacity', 0.75);

      // Label
      const rLabel = innerRadius - 12;
      const lx = Math.cos(angleRad) * rLabel;
      const ly = Math.sin(angleRad) * rLabel;

      tickGroup
        .append('text')
        .attr('x', lx)
        .attr('y', ly + 3)
        .attr('fill', val <= sustainabilityScore ? '#94a3b8' : '#475569')
        .attr('font-size', '8px')
        .attr('font-family', 'monospace')
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'middle')
        .text(val);
    });

    // 4. Needle Group (Center pivot + animated needle triangle)
    const needleGroup = g.append('g').attr('class', 'needle');

    // Initial angle
    needleGroup.attr('transform', `rotate(${fromAngle})`);

    // Draw the needle pointing straight up (length: 74px)
    const needlePath = 'M -3.5 0 L 0 -75 L 3.5 0 L 0 9 Z';

    needleGroup
      .append('path')
      .attr('d', needlePath)
      .attr('fill', 'url(#needle-gradient)')
      .attr('filter', 'url(#gauge-glow)')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 0.6);

    // Center pin / hub
    needleGroup
      .append('circle')
      .attr('r', 7)
      .attr('fill', '#0b1329')
      .attr('stroke', ratingColor)
      .attr('stroke-width', 2);

    needleGroup
      .append('circle')
      .attr('r', 2.8)
      .attr('fill', '#ffffff');

    // D3 Transition for the needle
    needleGroup
      .transition()
      .duration(1100)
      .ease(d3.easeCubicOut)
      .attrTween('transform', function () {
        const interpolate = d3.interpolate(fromAngle, targetAngle);
        return function (t) {
          return `rotate(${interpolate(t)})`;
        };
      });

    // Sub-arc highlight dot at tip of needle
    const tipAngleRad = ((targetAngle - 90) * Math.PI) / 180;
    const tipX = Math.cos(tipAngleRad) * (radius - 1);
    const tipY = Math.sin(tipAngleRad) * (radius - 1);

    g.append('circle')
      .attr('cx', tipX)
      .attr('cy', tipY)
      .attr('r', 3)
      .attr('fill', '#ffffff')
      .attr('stroke', ratingColor)
      .attr('stroke-width', 1.5)
      .attr('opacity', 0)
      .transition()
      .delay(800)
      .duration(300)
      .attr('opacity', 1);

    prevAngleRef.current = targetAngle;
  }, [sustainabilityScore, ratingColor]);

  return (
    <div className="bg-[#080d19]/95 border border-slate-800/80 rounded-xl p-3 flex flex-col items-center relative overflow-hidden shadow-inner">
      {/* Top Header & Micro Badges */}
      <div className="w-full flex items-center justify-between text-[11px] font-mono mb-1">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-bold text-slate-200 flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sustainability Score</span>
          </span>
          <button
            onClick={() => setShowFormulaTooltip(!showFormulaTooltip)}
            title="Inspect dynamic score calculation formula"
            className="text-slate-500 hover:text-slate-300 transition-colors p-0.5"
          >
            <Info className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className="px-2 py-0.5 rounded text-[10px] font-bold border"
            style={{
              backgroundColor: `${ratingColor}20`,
              borderColor: `${ratingColor}60`,
              color: ratingColor,
            }}
          >
            {ratingGrade} Rating
          </span>
        </div>
      </div>

      {/* D3.js Live Canvas */}
      <div className="relative flex justify-center items-center my-1 w-full">
        <svg
          ref={svgRef}
          width={230}
          height={142}
          className="overflow-visible select-none max-w-full"
        />

        {/* Center score readout */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-center pointer-events-none">
          <div className="flex items-baseline justify-center gap-0.5">
            <span
              className="text-2xl font-black font-mono tracking-tight"
              style={{ color: ratingColor }}
            >
              {sustainabilityScore}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">/100</span>
          </div>
          <div className="text-[9px] font-mono text-emerald-400 font-semibold tracking-wide uppercase">
            {statusLabel}
          </div>
        </div>
      </div>

      {/* Real-time telemetry driver chips */}
      <div className="w-full grid grid-cols-3 gap-1.5 mt-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono">
        <div className="bg-slate-900/90 p-1.5 rounded-lg border border-slate-800 flex flex-col justify-between">
          <div className="text-[9px] text-slate-400 flex items-center gap-1">
            <Zap className="w-2.5 h-2.5 text-emerald-400" />
            <span>Spot Price</span>
          </div>
          <div className="font-bold text-emerald-300 truncate mt-0.5">
            {spotPrice < 0 ? `₹${spotPrice}` : `+₹${spotPrice}`}/MWh
          </div>
          <div className="text-[8px] text-slate-500">
            {spotPrice <= 0 ? 'Stranded RE: +40 pts' : 'Grid Cost: +15 pts'}
          </div>
        </div>

        <div className="bg-slate-900/90 p-1.5 rounded-lg border border-slate-800 flex flex-col justify-between">
          <div className="text-[9px] text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-2.5 h-2.5 text-sky-400" />
            <span>PUE / Therm</span>
          </div>
          <div className="font-bold text-sky-300 truncate mt-0.5">
            {coolingPue.toFixed(2)} · {thermalEfficiency.toFixed(0)}%
          </div>
          <div className="text-[8px] text-slate-500">
            Eco Hardware: +{efficiencyScore.toFixed(0)} pts
          </div>
        </div>

        <div className="bg-slate-900/90 p-1.5 rounded-lg border border-slate-800 flex flex-col justify-between">
          <div className="text-[9px] text-slate-400 flex items-center gap-1">
            <Leaf className="w-2.5 h-2.5 text-emerald-400" />
            <span>Avoidance</span>
          </div>
          <div className="font-bold text-slate-200 truncate mt-0.5">
            {carbonRate} kg/MWh
          </div>
          <div className="text-[8px] text-slate-500">
            Carbon Offset: +{carbonScore.toFixed(0)} pts
          </div>
        </div>
      </div>

      {/* Formula Explanation Tooltip modal / popover */}
      {showFormulaTooltip && (
        <div className="absolute inset-2 bg-slate-950/95 border border-emerald-500/40 rounded-xl p-3 text-[10px] font-mono z-20 overflow-y-auto backdrop-blur-sm">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-emerald-400" />
              D3.js Dynamic Sustainability Score Model
            </span>
            <button
              onClick={() => setShowFormulaTooltip(false)}
              className="text-slate-400 hover:text-white px-1 font-bold"
            >
              ✕
            </button>
          </div>
          <div className="space-y-1.5 text-slate-300">
            <p>
              <span className="text-emerald-400 font-bold">1. Spot Price Arbitrage (0–40 pts):</span> Negative electricity rates (curtailed solar/wind) reward immediate container sponge scaling.
            </p>
            <p>
              <span className="text-sky-400 font-bold">2. Thermal PUE Efficiency (0–35 pts):</span> Sub-1.10 immersion PUE and &gt;94% GPU thermal efficiency ensure zero parasitic cooling waste.
            </p>
            <p>
              <span className="text-emerald-300 font-bold">3. Scope 2 Carbon Offset (0–25 pts):</span> Real-time carbon avoidance rate (kg CO₂e/MWh) certified via POSOCO/SLDC telemetry.
            </p>
            <div className="mt-2 p-1.5 bg-emerald-950/40 border border-emerald-500/30 rounded text-[9px] text-emerald-200 font-mono">
              Total Score = Spot Score ({priceScore.toFixed(1)}) + Efficiency Score ({efficiencyScore.toFixed(1)}) + Avoidance Score ({carbonScore.toFixed(1)}) = <strong className="text-white">{sustainabilityScore}/100</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
