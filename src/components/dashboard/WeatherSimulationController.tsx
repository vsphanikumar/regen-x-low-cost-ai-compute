import React, { useState } from 'react';
import { Sliders, Sun, RefreshCw, Zap } from 'lucide-react';
import { SimulationState } from '../../types';

interface WeatherSimulationControllerProps {
  onApplyOverride: (params: {
    mock_curtailment_mwh?: number;
    mock_spot_price?: number;
    solar_irradiance_factor?: number;
    wind_gust_factor?: number;
  }) => Promise<void>;
  simulationState: SimulationState;
  onReset: () => void;
}

export const WeatherSimulationController: React.FC<WeatherSimulationControllerProps> = ({
  onApplyOverride,
  onReset,
}) => {
  const [curtailmentInput, setCurtailmentInput] = useState<number>(180);
  const [spotPriceInput, setSpotPriceInput] = useState<number>(-2.5);
  const [solarFactor, setSolarFactor] = useState<number>(1.2);
  const [windFactor, setWindFactor] = useState<number>(1.0);
  const [isApplying, setIsApplying] = useState(false);

  const handleApplySliders = async () => {
    setIsApplying(true);
    await onApplyOverride({
      mock_curtailment_mwh: curtailmentInput,
      mock_spot_price: spotPriceInput,
      solar_irradiance_factor: solarFactor,
      wind_gust_factor: windFactor,
    });
    setIsApplying(false);
  };

  const handlePreset = async (preset: 'SOLAR_SURGE' | 'WIND_PEAK' | 'CLOUD_SHADOW' | 'GRID_STRESS') => {
    setIsApplying(true);
    if (preset === 'SOLAR_SURGE') {
      setCurtailmentInput(240);
      setSpotPriceInput(-3.10);
      setSolarFactor(1.8);
      await onApplyOverride({
        mock_curtailment_mwh: 240,
        mock_spot_price: -3.10,
        solar_irradiance_factor: 1.8,
      });
    } else if (preset === 'WIND_PEAK') {
      setCurtailmentInput(280);
      setSpotPriceInput(-4.50);
      setWindFactor(1.9);
      await onApplyOverride({
        mock_curtailment_mwh: 280,
        mock_spot_price: -4.50,
        wind_gust_factor: 1.9,
      });
    } else if (preset === 'CLOUD_SHADOW') {
      setCurtailmentInput(60);
      setSpotPriceInput(3.80);
      setSolarFactor(0.4);
      await onApplyOverride({
        mock_curtailment_mwh: 60,
        mock_spot_price: 3.80,
        solar_irradiance_factor: 0.4,
      });
    } else if (preset === 'GRID_STRESS') {
      setCurtailmentInput(20);
      setSpotPriceInput(18.50);
      setSolarFactor(0.5);
      await onApplyOverride({
        mock_curtailment_mwh: 20,
        mock_spot_price: 18.50,
      });
    }
    setIsApplying(false);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-100">
              Weather &amp; Grid Simulator
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-emerald-400">
            Interactive Anomaly Levers
          </span>
        </div>

        {/* Quick Test Presets */}
        <div className="mb-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Preset Climate Scenarios
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handlePreset('SOLAR_SURGE')}
              disabled={isApplying}
              className="text-left px-3 py-2 bg-amber-950/20 hover:bg-amber-950/40 border border-amber-800/40 rounded-lg text-xs font-semibold text-amber-300 transition-all flex items-center justify-between group cursor-pointer"
            >
              <span className="truncate">Solar Surge (-$3.10)</span>
              <span className="text-[10px] text-amber-500 opacity-80 group-hover:opacity-100">Optimal</span>
            </button>
            <button
              onClick={() => handlePreset('WIND_PEAK')}
              disabled={isApplying}
              className="text-left px-3 py-2 bg-sky-950/20 hover:bg-sky-950/40 border border-sky-800/40 rounded-lg text-xs font-semibold text-sky-300 transition-all flex items-center justify-between group cursor-pointer"
            >
              <span className="truncate">Wind Peak (-$4.50)</span>
              <span className="text-[10px] text-sky-500 opacity-80 group-hover:opacity-100">Best ROI</span>
            </button>
            <button
              onClick={() => handlePreset('CLOUD_SHADOW')}
              disabled={isApplying}
              className="text-left px-3 py-2 bg-indigo-950/20 hover:bg-indigo-950/40 border border-indigo-800/40 rounded-lg text-xs font-semibold text-indigo-300 transition-all flex items-center justify-between group cursor-pointer"
            >
              <span className="truncate">Cloud Shadow (+$3.80)</span>
              <span className="text-[10px] text-indigo-500 opacity-80 group-hover:opacity-100">Normal</span>
            </button>
            <button
              onClick={() => handlePreset('GRID_STRESS')}
              disabled={isApplying}
              className="text-left px-3 py-2 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-800/40 rounded-lg text-xs font-semibold text-rose-300 transition-all flex items-center justify-between group cursor-pointer"
            >
              <span className="truncate">Peak Demand (+$18.50)</span>
              <span className="text-[10px] text-rose-500 opacity-80 group-hover:opacity-100">High</span>
            </button>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="space-y-3.5 bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Surplus Clean Energy
              </span>
              <span className="font-mono font-bold text-amber-400">
                {curtailmentInput} MWh
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="350"
              value={curtailmentInput}
              onChange={(e) => setCurtailmentInput(Number(e.target.value))}
              className="w-full accent-amber-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">Electricity Price</span>
              <span
                className={`font-mono font-bold ${
                  spotPriceInput <= 0 ? 'text-emerald-400' : 'text-slate-100'
                }`}
              >
                ${spotPriceInput.toFixed(2)} / MWh
              </span>
            </div>
            <input
              type="range"
              min="-5"
              max="25"
              step="0.25"
              value={spotPriceInput}
              onChange={(e) => setSpotPriceInput(Number(e.target.value))}
              className="w-full accent-emerald-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
              <span>-$5.00 (Grid pays us)</span>
              <span>+$25.00 (Standard rate)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" /> Solar Irradiance Multiplier
              </span>
              <span className="font-mono font-bold text-amber-400">
                {solarFactor.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.5"
              step="0.1"
              value={solarFactor}
              onChange={(e) => setSolarFactor(Number(e.target.value))}
              className="w-full accent-amber-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800">
        <button
          onClick={handleApplySliders}
          disabled={isApplying}
          className="flex-1 py-2 px-3 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-98 rounded-lg transition-all cursor-pointer"
        >
          {isApplying ? 'Injecting Anomaly...' : 'Inject Parameters'}
        </button>
        <button
          onClick={onReset}
          title="Reset Simulation"
          className="p-2 text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
