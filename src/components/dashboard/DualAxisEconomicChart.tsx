import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Zap,
  Cpu,
  ShieldCheck,
  Calendar,
  Info,
  ArrowUpRight,
  Activity,
} from 'lucide-react';
import { GridNode, ComputeJob } from '../../types';

export interface DualAxisEconomicChartProps {
  selectedNode: GridNode;
  selectedJob: ComputeJob;
  allNodes?: GridNode[];
  onExecuteArbitrage?: () => Promise<void>;
  isExecuting?: boolean;
}

interface HourlyEconomicDataPoint {
  hour: number;
  timeLabel: string;
  isPeakSurge: boolean;
  spotPricePerMWh: number;
  curtailmentMWh: number;
  clusterPowerMWh: number;
  baselineCostUSD: number;
  arbitrageCostUSD: number;
  customerSavingsUSD: number;
  saasRevenueSpreadUSD: number;
  saasSpreadRatePerMWh: number;
  cumulativeCustomerSavingsUSD: number;
  cumulativeSaaSRevenueSpreadUSD: number;
  avoidedCarbonKg: number;
}

export const DualAxisEconomicChart: React.FC<DualAxisEconomicChartProps> = ({
  selectedNode,
  selectedJob,
  onExecuteArbitrage,
  isExecuting = false,
}) => {
  const [viewMode, setViewMode] = useState<'HOURLY' | 'CUMULATIVE'>('HOURLY');
  const [clusterPreset, setClusterPreset] = useState<'JOB_DEFAULT' | 'POD_256' | 'CLUSTER_1024' | 'FACILITY_2MW'>('JOB_DEFAULT');
  const [simulateSurgeShift, setSimulateSurgeShift] = useState<boolean>(false);
  const [activeHourIndex, setActiveHourIndex] = useState<number>(12);
  const [hoveredHourIndex, setHoveredHourIndex] = useState<number | null>(null);

  const standardGridPricePerMWh = 48.0;

  const workloadMW = useMemo(() => {
    switch (clusterPreset) {
      case 'JOB_DEFAULT':
        return Math.max(0.045, (selectedJob.gpusRequested * 0.7) / 1000);
      case 'POD_256':
        return (256 * 0.7) / 1000;
      case 'CLUSTER_1024':
        return (1024 * 0.7) / 1000;
      case 'FACILITY_2MW':
        return 2.5;
    }
  }, [clusterPreset, selectedJob.gpusRequested]);

  const hourlyData = useMemo<HourlyEconomicDataPoint[]>(() => {
    const points: HourlyEconomicDataPoint[] = [];
    let cumCustomerSavings = 0;
    let cumSaaSRevenue = 0;
    const baseTariff = selectedNode.spotPricePerMWh + (simulateSurgeShift ? -2.5 : 0);
    const energyType = selectedNode.energyType;

    for (let h = 0; h < 24; h++) {
      let solarFactor = 0;
      let windFactor = 0;

      if (h >= 6 && h <= 18) {
        solarFactor = Math.sin(((h - 6) / 12) * Math.PI);
      }
      windFactor = 0.45 + 0.55 * Math.cos(((h - 1) / 12) * Math.PI);

      let hourlySpot = baseTariff;
      let hourlyCurtailment = selectedNode.curtailmentMWh;

      if (energyType === 'SOLAR') {
        if (solarFactor > 0.4) {
          hourlySpot = Number((baseTariff - solarFactor * 3.2).toFixed(2));
          hourlyCurtailment = Math.round(selectedNode.curtailmentMWh * (0.6 + solarFactor * 1.4));
        } else {
          hourlySpot = Number(Math.max(18.0, 38.0 - (1 - solarFactor) * 8).toFixed(2));
          hourlyCurtailment = Math.round(selectedNode.curtailmentMWh * 0.2);
        }
      } else if (energyType === 'WIND') {
        if (windFactor > 0.6) {
          hourlySpot = Number((baseTariff - windFactor * 2.8).toFixed(2));
          hourlyCurtailment = Math.round(selectedNode.curtailmentMWh * (0.7 + windFactor * 1.2));
        } else {
          hourlySpot = Number((baseTariff + 12.0).toFixed(2));
          hourlyCurtailment = Math.round(selectedNode.curtailmentMWh * 0.4);
        }
      } else {
        const hydroFactor = 0.5 + 0.5 * Math.sin(((h - 2) / 6) * Math.PI);
        hourlySpot = Number((baseTariff - hydroFactor * 1.5).toFixed(2));
        hourlyCurtailment = Math.round(selectedNode.curtailmentMWh * (0.8 + hydroFactor * 0.4));
      }

      const isPeakSurge = hourlySpot < 0;
      const clusterPowerMWh = workloadMW;
      const baselineCostUSD = clusterPowerMWh * standardGridPricePerMWh;

      const negativeTariffBonus = hourlySpot < 0 ? Math.abs(hourlySpot) * 0.45 : 0;
      const saasSpreadRatePerMWh = Number((8.5 + negativeTariffBonus).toFixed(2));
      const saasRevenueSpreadUSD = clusterPowerMWh * saasSpreadRatePerMWh;

      const landedCostPerMWh = Math.max(0, hourlySpot + saasSpreadRatePerMWh);
      const arbitrageCostUSD = clusterPowerMWh * landedCostPerMWh;
      const customerSavingsUSD = Math.max(0, baselineCostUSD - arbitrageCostUSD);

      cumCustomerSavings += customerSavingsUSD;
      cumSaaSRevenue += saasRevenueSpreadUSD;

      const avoidedCarbonKg = clusterPowerMWh * 460;
      const hourString = `${h.toString().padStart(2, '0')}:00`;

      points.push({
        hour: h,
        timeLabel: hourString,
        isPeakSurge,
        spotPricePerMWh: hourlySpot,
        curtailmentMWh: hourlyCurtailment,
        clusterPowerMWh,
        baselineCostUSD,
        arbitrageCostUSD,
        customerSavingsUSD,
        saasRevenueSpreadUSD,
        saasSpreadRatePerMWh,
        cumulativeCustomerSavingsUSD: cumCustomerSavings,
        cumulativeSaaSRevenueSpreadUSD: cumSaaSRevenue,
        avoidedCarbonKg,
      });
    }
    return points;
  }, [selectedNode, simulateSurgeShift, workloadMW]);

  const totals24h = useMemo(() => {
    const totalCustomerSavings = hourlyData.reduce((acc, p) => acc + p.customerSavingsUSD, 0);
    const totalSaaSRevenue = hourlyData.reduce((acc, p) => acc + p.saasRevenueSpreadUSD, 0);
    const totalBaselineCost = hourlyData.reduce((acc, p) => acc + p.baselineCostUSD, 0);
    const totalArbitrageCost = hourlyData.reduce((acc, p) => acc + p.arbitrageCostUSD, 0);
    const totalCarbonTons = (hourlyData.reduce((acc, p) => acc + p.avoidedCarbonKg, 0)) / 1000;
    const totalMWhAbsorbed = workloadMW * 24;
    const overallSavingsPct = totalBaselineCost > 0
      ? Math.round(((totalBaselineCost - totalArbitrageCost) / totalBaselineCost) * 100)
      : 0;
    const arbitrageRoiRatio = totalSaaSRevenue > 0
      ? (totalCustomerSavings / totalSaaSRevenue).toFixed(1)
      : '0.0';
    const negativeSurgeHours = hourlyData.filter((p) => p.isPeakSurge).length;

    return {
      totalCustomerSavings,
      totalSaaSRevenue,
      overallSavingsPct,
      arbitrageRoiRatio,
      totalCarbonTons,
      totalMWhAbsorbed,
      negativeSurgeHours,
    };
  }, [hourlyData, workloadMW]);

  const activePoint = hourlyData[hoveredHourIndex !== null ? hoveredHourIndex : activeHourIndex] || hourlyData[12];

  const svgWidth = 740;
  const svgHeight = 270;
  const padLeft = 60;
  const padRight = 60;
  const padTop = 32;
  const padBottom = 38;
  const chartAreaWidth = svgWidth - padLeft - padRight;
  const chartAreaHeight = svgHeight - padTop - padBottom;

  const { maxSaaSScale, maxCustomerScale } = useMemo(() => {
    if (viewMode === 'HOURLY') {
      const maxSaaS = Math.max(...hourlyData.map((d) => d.saasRevenueSpreadUSD));
      const maxCust = Math.max(...hourlyData.map((d) => d.customerSavingsUSD));
      return {
        maxSaaSScale: Math.max(10, Math.ceil(maxSaaS * 1.25)),
        maxCustomerScale: Math.max(25, Math.ceil(maxCust * 1.25)),
      };
    } else {
      const maxSaaS = totals24h.totalSaaSRevenue;
      const maxCust = totals24h.totalCustomerSavings;
      return {
        maxSaaSScale: Math.max(100, Math.ceil(maxSaaS * 1.15)),
        maxCustomerScale: Math.max(250, Math.ceil(maxCust * 1.15)),
      };
    }
  }, [viewMode, hourlyData, totals24h]);

  const getX = (hourIdx: number) => {
    return padLeft + (hourIdx / 23) * chartAreaWidth;
  };
  const getYSaaS = (val: number) => {
    const clamped = Math.max(0, Math.min(val, maxSaaSScale));
    return padTop + chartAreaHeight - (clamped / maxSaaSScale) * chartAreaHeight;
  };
  const getYCustomer = (val: number) => {
    const clamped = Math.max(0, Math.min(val, maxCustomerScale));
    return padTop + chartAreaHeight - (clamped / maxCustomerScale) * chartAreaHeight;
  };

  const buildSmoothPath = (getYFunc: (d: HourlyEconomicDataPoint) => number) => {
    return hourlyData.reduce((path, point, i, arr) => {
      const x = getX(i);
      const y = getYFunc(point);
      if (i === 0) return `M ${x.toFixed(1)} ${y.toFixed(1)}`;
      const prevX = getX(i - 1);
      const prevY = getYFunc(arr[i - 1]);
      const cpX1 = prevX + (x - prevX) / 2;
      const cpY1 = prevY;
      const cpX2 = prevX + (x - prevX) / 2;
      const cpY2 = y;
      return `${path} C ${cpX1.toFixed(1)} ${cpY1.toFixed(1)}, ${cpX2.toFixed(1)} ${cpY2.toFixed(1)}, ${x.toFixed(1)} ${y.toFixed(1)}`;
    }, '');
  };

  const saasPathD = useMemo(() => {
    return buildSmoothPath((d) =>
      getYSaaS(viewMode === 'HOURLY' ? d.saasRevenueSpreadUSD : d.cumulativeSaaSRevenueSpreadUSD)
    );
  }, [viewMode, hourlyData, maxSaaSScale]);

  const customerPathD = useMemo(() => {
    return buildSmoothPath((d) =>
      getYCustomer(viewMode === 'HOURLY' ? d.customerSavingsUSD : d.cumulativeCustomerSavingsUSD)
    );
  }, [viewMode, hourlyData, maxCustomerScale]);

  const saasAreaD = useMemo(() => {
    const baselineY = (padTop + chartAreaHeight).toFixed(1);
    const startX = getX(0).toFixed(1);
    const endX = getX(23).toFixed(1);
    return `${saasPathD} L ${endX} ${baselineY} L ${startX} ${baselineY} Z`;
  }, [saasPathD]);

  const customerAreaD = useMemo(() => {
    const baselineY = (padTop + chartAreaHeight).toFixed(1);
    const startX = getX(0).toFixed(1);
    const endX = getX(23).toFixed(1);
    return `${customerPathD} L ${endX} ${baselineY} L ${startX} ${baselineY} Z`;
  }, [customerPathD]);

  const yAxisTicks = [0, 0.25, 0.5, 0.75, 1.0];

  return (
    <div className="space-y-5 text-xs select-none">
      {/* Top Banner */}
      <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <TrendingUp className="w-4 h-4" />
            </span>
            <span className="font-bold text-slate-100 text-sm">
              24-Hour Dual-Axis Arbitrage Value Model
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              Diurnal Economics
            </span>
          </div>
          <p className="text-slate-400 text-xs max-w-2xl leading-relaxed">
            Correlates <strong className="text-emerald-400 font-medium">REGEN-X SaaS Revenue Spread</strong> (Left Axis) against <strong className="text-sky-400 font-medium">Customer Cost Savings</strong> (Right Axis). As spot tariffs turn negative, both metrics expand in tandem.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewMode('HOURLY')}
              className={`px-2.5 py-1 rounded font-semibold text-[11px] transition-colors cursor-pointer ${
                viewMode === 'HOURLY'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Hourly Run-Rate ($/h)
            </button>
            <button
              onClick={() => setViewMode('CUMULATIVE')}
              className={`px-2.5 py-1 rounded font-semibold text-[11px] transition-colors cursor-pointer ${
                viewMode === 'CUMULATIVE'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              24h Cumulative ($)
            </button>
          </div>

          <button
            onClick={() => setSimulateSurgeShift(!simulateSurgeShift)}
            className={`px-2.5 py-1.5 rounded font-mono text-[11px] font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
              simulateSurgeShift
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm shadow-amber-500/10'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Zap className={`w-3 h-3 ${simulateSurgeShift ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
            <span>{simulateSurgeShift ? 'Surge: -$2.50 Active' : 'Simulate -$2.50 Surge'}</span>
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-950 p-3.5 rounded-xl border border-sky-500/30 ring-1 ring-sky-500/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span className="font-semibold text-sky-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              Customer Savings (24h)
            </span>
            <span className="font-mono text-[10px] text-sky-300 bg-sky-950/70 px-1.5 py-0.5 rounded border border-sky-800">
              Right Axis
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-sky-300 tabular-nums">
            ${totals24h.totalCustomerSavings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-900">
            <span>vs Grid ($48/MWh):</span>
            <strong className="text-sky-300 font-mono">-{totals24h.overallSavingsPct}% Cut</strong>
          </div>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-emerald-500/30 ring-1 ring-emerald-500/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              SaaS Revenue Spread (24h)
            </span>
            <span className="font-mono text-[10px] text-emerald-300 bg-emerald-950/70 px-1.5 py-0.5 rounded border border-emerald-800">
              Left Axis
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
            ${totals24h.totalSaaSRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-900">
            <span>Spread Yield:</span>
            <strong className="text-emerald-300 font-mono">~$10.80 / MWh avg</strong>
          </div>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
              Arbitrage ROI
            </span>
            <span className="font-mono text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-900">
              Value Ratio
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-amber-300 tabular-nums">
            {totals24h.arbitrageRoiRatio}x
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-900">
            <span>Customer Return per $1 Fee:</span>
            <strong className="text-slate-200 font-mono">Customer keeps ~78%</strong>
          </div>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Clean MWh Absorbed
            </span>
            <span className="font-mono text-[10px] text-slate-400">
              {totals24h.negativeSurgeHours}h Subsidized
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-100 tabular-nums">
            {totals24h.totalMWhAbsorbed.toFixed(2)} MWh
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-900">
            <span>Avoided CO₂:</span>
            <strong className="text-emerald-300 font-mono">{totals24h.totalCarbonTons.toFixed(2)} MT Avoided</strong>
          </div>
        </div>
      </div>

      {/* Cluster Scale Configuration */}
      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <span className="font-medium">Active Cluster Scale Simulation:</span>
          <span className="font-mono font-bold text-emerald-300">
            {(workloadMW * 1000).toFixed(0)} kW ({workloadMW.toFixed(3)} MW Demand)
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setClusterPreset('JOB_DEFAULT')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              clusterPreset === 'JOB_DEFAULT'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {selectedJob.jobId} ({selectedJob.gpusRequested} GPUs)
          </button>
          <button
            onClick={() => setClusterPreset('POD_256')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              clusterPreset === 'POD_256'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            256 H100 Pod (0.18 MW)
          </button>
          <button
            onClick={() => setClusterPreset('CLUSTER_1024')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              clusterPreset === 'CLUSTER_1024'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            1,024 H100 Cluster (0.72 MW)
          </button>
          <button
            onClick={() => setClusterPreset('FACILITY_2MW')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              clusterPreset === 'FACILITY_2MW'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            2.5 MW Edge Substation
          </button>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-200 text-xs">
              24-Hour Diurnal Trajectory: {selectedNode.name} ({selectedNode.energyType})
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Baseline: ${standardGridPricePerMWh.toFixed(2)}/MWh
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-1.5 rounded-sm bg-emerald-400" />
              <span className="font-semibold text-emerald-400">
                SaaS Revenue Spread ({viewMode === 'HOURLY' ? '$/hr' : '$ Cum'})
              </span>
              <span className="text-[10px] font-mono text-emerald-500/80">(Left Axis)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1.5 rounded-sm bg-sky-400" />
              <span className="font-semibold text-sky-400">
                Customer Cost Savings ({viewMode === 'HOURLY' ? '$/hr' : '$ Cum'})
              </span>
              <span className="text-[10px] font-mono text-sky-500/80">(Right Axis)</span>
            </div>
          </div>
        </div>

        <div className="relative w-full overflow-hidden bg-[#070b14] rounded-lg border border-slate-900 p-2">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto overflow-visible select-none"
            onMouseLeave={() => setHoveredHourIndex(null)}
          >
            <defs>
              <linearGradient id="saasSpreadGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.32" />
                <stop offset="70%" stopColor="#10b981" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.00" />
              </linearGradient>
              <linearGradient id="customerSavingsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.30" />
                <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.00" />
              </linearGradient>
            </defs>

            {yAxisTicks.map((tickRatio, idx) => {
              const yPos = padTop + chartAreaHeight * (1 - tickRatio);
              const saasVal = (maxSaaSScale * tickRatio).toFixed(0);
              const custVal = (maxCustomerScale * tickRatio).toFixed(0);
              return (
                <g key={`grid-${idx}`}>
                  <line
                    x1={padLeft}
                    y1={yPos}
                    x2={svgWidth - padRight}
                    y2={yPos}
                    stroke="#1e293b"
                    strokeDasharray={idx === 0 ? 'none' : '3 3'}
                    strokeWidth={idx === 0 ? 1.5 : 1}
                    opacity={idx === 0 ? 0.9 : 0.4}
                  />
                  <text
                    x={padLeft - 8}
                    y={yPos + 4}
                    fill="#10b981"
                    fontSize="9.5"
                    fontFamily="monospace"
                    textAnchor="end"
                    fontWeight="600"
                  >
                    ${saasVal}
                  </text>
                  <text
                    x={svgWidth - padRight + 8}
                    y={yPos + 4}
                    fill="#38bdf8"
                    fontSize="9.5"
                    fontFamily="monospace"
                    textAnchor="start"
                    fontWeight="600"
                  >
                    ${custVal}
                  </text>
                </g>
              );
            })}

            {hourlyData.map((d, i) => {
              if (!d.isPeakSurge) return null;
              const xStart = Math.max(padLeft, getX(i) - chartAreaWidth / 46);
              const xEnd = Math.min(svgWidth - padRight, getX(i) + chartAreaWidth / 46);
              const bandWidth = xEnd - xStart;
              return (
                <rect
                  key={`surge-band-${i}`}
                  x={xStart}
                  y={padTop}
                  width={bandWidth}
                  height={chartAreaHeight}
                  fill="#064e3b"
                  fillOpacity="0.22"
                />
              );
            })}

            <path d={customerAreaD} fill="url(#customerSavingsGrad)" />
            <path d={saasAreaD} fill="url(#saasSpreadGrad)" />

            <path
              d={customerPathD}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={saasPathD}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {hourlyData.map((d, i) => {
              const x = getX(i);
              const ySaaS = getYSaaS(viewMode === 'HOURLY' ? d.saasRevenueSpreadUSD : d.cumulativeSaaSRevenueSpreadUSD);
              const yCust = getYCustomer(viewMode === 'HOURLY' ? d.customerSavingsUSD : d.cumulativeCustomerSavingsUSD);
              const isSelected = i === activePoint.hour;
              return (
                <g key={`dots-${i}`}>
                  {(i % 3 === 0 || d.isPeakSurge || isSelected) && (
                    <>
                      <circle
                        cx={x}
                        cy={yCust}
                        r={isSelected ? 5 : d.isPeakSurge ? 3.5 : 2}
                        fill="#38bdf8"
                        stroke="#0f172a"
                        strokeWidth="1.5"
                      />
                      <circle
                        cx={x}
                        cy={ySaaS}
                        r={isSelected ? 5 : d.isPeakSurge ? 3.5 : 2}
                        fill="#10b981"
                        stroke="#0f172a"
                        strokeWidth="1.5"
                      />
                    </>
                  )}
                </g>
              );
            })}

            {activePoint && (
              <g>
                <line
                  x1={getX(activePoint.hour)}
                  y1={padTop}
                  x2={getX(activePoint.hour)}
                  y2={padTop + chartAreaHeight}
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  opacity="0.85"
                />
                <circle
                  cx={getX(activePoint.hour)}
                  cy={padTop + chartAreaHeight}
                  r="4"
                  fill="#f8fafc"
                />
              </g>
            )}

            {hourlyData.map((d, i) => {
              if (i % 3 !== 0 && i !== 23) return null;
              const x = getX(i);
              const y = padTop + chartAreaHeight + 16;
              return (
                <g key={`x-axis-${i}`}>
                  <text
                    x={x}
                    y={y}
                    fill={i === activePoint.hour ? '#38bdf8' : '#64748b'}
                    fontSize="9.5"
                    fontFamily="monospace"
                    textAnchor="middle"
                    fontWeight={i === activePoint.hour ? 'bold' : 'normal'}
                  >
                    {d.timeLabel}
                  </text>
                </g>
              );
            })}

            {hourlyData.map((d, i) => {
              const x = getX(i);
              const colWidth = chartAreaWidth / 24;
              return (
                <rect
                  key={`hitbox-${i}`}
                  x={x - colWidth / 2}
                  y={padTop}
                  width={colWidth}
                  height={chartAreaHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredHourIndex(i)}
                  onClick={() => setActiveHourIndex(i)}
                />
              );
            })}

            <text
              x={padLeft - 6}
              y={padTop - 12}
              fill="#10b981"
              fontSize="10"
              fontWeight="bold"
              fontFamily="sans-serif"
              textAnchor="end"
            >
              SaaS Spread ($)
            </text>
            <text
              x={svgWidth - padRight + 6}
              y={padTop - 12}
              fill="#38bdf8"
              fontSize="10"
              fontWeight="bold"
              fontFamily="sans-serif"
              textAnchor="start"
            >
              Customer Savings ($)
            </text>
          </svg>
        </div>

        {/* 24-Hour Scrubber Slider */}
        <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Interactive 24-Hour Timeline Scrubber:</span>
            </span>
            <span className="font-mono text-xs font-bold text-slate-100 flex items-center gap-2">
              <span className="text-sky-400">{activePoint.timeLabel}</span>
              <span className="text-slate-500">·</span>
              <span className={activePoint.isPeakSurge ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                Spot Tariff: ${activePoint.spotPricePerMWh.toFixed(2)}/MWh
              </span>
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="23"
            value={activePoint.hour}
            onChange={(e) => {
              setActiveHourIndex(Number(e.target.value));
              setHoveredHourIndex(null);
            }}
            className="w-full accent-emerald-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-0.5">
            <span>00:00 (Midnight Off-Peak)</span>
            <span>06:00 (Morning Ramp)</span>
            <span>12:00 (Solar Peak)</span>
            <span>18:00 (Evening)</span>
            <span>23:00 (Night Wind)</span>
          </div>
        </div>

        {/* Inspected Hour Card */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800/90 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-slate-800 pb-3 md:pb-0 md:pr-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                Hour {activePoint.timeLabel} Telemetry
              </span>
              {activePoint.isPeakSurge ? (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/40 animate-pulse">
                  Negative Tariff Surge
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-800">
                  Standard Window
                </span>
              )}
            </div>
            <div className="text-lg font-bold font-mono text-slate-100 tabular-nums">
              ${activePoint.spotPricePerMWh.toFixed(2)}
              <span className="text-xs font-normal text-slate-400 ml-1">/MWh</span>
            </div>
            <div className="text-[11px] text-slate-400 space-y-0.5 font-mono">
              <div>Surplus: <strong className="text-amber-400">{activePoint.curtailmentMWh} MWh</strong></div>
              <div>Draw: <strong className="text-slate-200">{activePoint.clusterPowerMWh.toFixed(3)} MWh/h</strong></div>
              <div>Avoided CO₂: <strong className="text-emerald-400">{activePoint.avoidedCarbonKg.toFixed(1)} kg</strong></div>
            </div>
          </div>

          <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-slate-800 pb-3 md:pb-0 md:pr-3">
            <div className="flex items-center justify-between">
              <span className="text-sky-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                Customer Savings ({activePoint.timeLabel})
              </span>
            </div>
            <div className="text-lg font-bold font-mono text-sky-300 tabular-nums">
              ${activePoint.customerSavingsUSD.toFixed(2)}
              <span className="text-xs font-normal text-slate-400 ml-1">/ hour</span>
            </div>
            <div className="text-[11px] text-slate-400 space-y-0.5 font-mono">
              <div>Baseline Cost: <strong className="text-slate-300">${activePoint.baselineCostUSD.toFixed(2)}</strong></div>
              <div>Arbitraged Cost: <strong className="text-sky-200">${activePoint.arbitrageCostUSD.toFixed(2)}</strong></div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-emerald-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                SaaS Revenue Spread ({activePoint.timeLabel})
              </span>
            </div>
            <div className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
              ${activePoint.saasRevenueSpreadUSD.toFixed(2)}
              <span className="text-xs font-normal text-slate-400 ml-1">/ hour</span>
            </div>
            <div className="text-[11px] text-slate-400 space-y-0.5 font-mono">
              <div>Spread Velocity: <strong className="text-emerald-300">${activePoint.saasSpreadRatePerMWh.toFixed(2)} / MWh</strong></div>
              <div>24h Total SaaS: <strong className="text-emerald-400">${activePoint.cumulativeSaaSRevenueSpreadUSD.toFixed(2)}</strong></div>
            </div>
          </div>
        </div>

        {onExecuteArbitrage && (
          <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="space-y-0.5 text-xs">
              <span className="font-bold text-slate-200">
                Lock In Hour {activePoint.timeLabel} Negative Arbitrage Spread:
              </span>
              <p className="text-slate-400 text-[11px]">
                Dispatches Cloud Run autoscaling containers behind-the-meter at <strong className="text-emerald-300 font-mono">${activePoint.spotPricePerMWh.toFixed(2)}/MWh</strong>.
              </p>
            </div>
            <button
              onClick={onExecuteArbitrage}
              disabled={isExecuting}
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 rounded-lg transition-all flex items-center gap-2 shrink-0 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Activity className={`w-3.5 h-3.5 ${isExecuting ? 'animate-spin' : ''}`} />
              <span>{isExecuting ? 'Dispatching Power Divert...' : 'Capture Window'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Economic Value Thesis */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-slate-200 font-bold text-xs">
          <Info className="w-4 h-4 text-emerald-400" />
          <span>Why This Dual-Axis Model Creates Real Value</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400 leading-relaxed">
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 space-y-1.5">
            <strong className="text-sky-300 block font-semibold">
              1. Customer Cost Savings ($48.00 → $0.00 / Free Power)
            </strong>
            <p>
              By intercepting uncurtailed clean electrons at negative spot tariffs, REGEN-X slashes electricity costs by 70% to 100%, saving tens of thousands of dollars each month.
            </p>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 space-y-1.5">
            <strong className="text-emerald-300 block font-semibold">
              2. SaaS Revenue Spread Monetization
            </strong>
            <p>
              REGEN-X earns a dynamic software spread ($8.50 - $14.50/MWh) plus shares in negative-pricing generator subsidies, creating a recurring high-margin business model.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
