import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { runWhatIfSimulation } from '../../services/routeOptimizer';
import { SimulationParameters } from '../../types';
import {
  SlidersHorizontal,
  Play,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Truck,
  Leaf,
  DollarSign,
  Compass,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const WhatIfSimulatorView: React.FC = () => {
  const { points, vehicles, collectors, settings, zones, updateSettings, runOptimization, setActiveTab } = useApp();

  const [simParams, setSimParams] = useState<SimulationParameters>({
    vehicleCount: 4,
    capacityMultiplier: 1.0,
    priorityThreshold: 70,
    selectedZoneId: 'ALL',
    vehicleSpeed: 25,
    fuelCostPerKm: 2.4
  });

  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  // Compute simulation deterministically
  const simResult = useMemo(() => {
    return runWhatIfSimulation(points, vehicles, collectors, settings, simParams);
  }, [points, vehicles, collectors, settings, simParams]);

  const handleApplyScenario = () => {
    updateSettings({
      highPriorityThreshold: simParams.priorityThreshold,
      averageVehicleSpeed: simParams.vehicleSpeed,
      costPerKm: simParams.fuelCostPerKm
    });
    runOptimization();
    setAppliedNotice('Simulated parameters successfully applied to live operations!');
    setTimeout(() => {
      setAppliedNotice(null);
      setActiveTab('routes');
    }, 1200);
  };

  const handleReset = () => {
    setSimParams({
      vehicleCount: 4,
      capacityMultiplier: 1.0,
      priorityThreshold: 70,
      selectedZoneId: 'ALL',
      vehicleSpeed: 25,
      fuelCostPerKm: 2.4
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">What-If Fleet Simulator</h2>
            <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-purple-100 text-purple-800 border border-purple-200">
              SANDBOX SIMULATION
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Model hypothetical scenario changes (fleet count, vehicle capacity, priority thresholds) without altering live dispatch data.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={handleApplyScenario}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Apply Scenario to Operations</span>
          </button>
        </div>
      </div>

      {appliedNotice && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-semibold animate-pulse">
          {appliedNotice}
        </div>
      )}

      {/* Simulator Controls & Sandbox Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
        <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
          <SlidersHorizontal className="w-4 h-4 text-purple-600" />
          <span>Simulation Parameter Levers</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Lever 1: Active Vehicles */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-slate-700 font-semibold">
              <span>Simulated Fleet Vehicles:</span>
              <span className="font-mono text-purple-700 font-bold">{simParams.vehicleCount} trucks</span>
            </div>
            <input
              type="range"
              min="1"
              max="6"
              value={simParams.vehicleCount}
              onChange={e => setSimParams({ ...simParams, vehicleCount: Number(e.target.value) })}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>1 (Minimal)</span>
              <span>3</span>
              <span>6 (Max Fleet)</span>
            </div>
          </div>

          {/* Lever 2: Vehicle Capacity Multiplier */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-slate-700 font-semibold">
              <span>Truck Capacity Multiplier:</span>
              <span className="font-mono text-purple-700 font-bold">{(simParams.capacityMultiplier * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.6"
              max="1.5"
              step="0.1"
              value={simParams.capacityMultiplier}
              onChange={e => setSimParams({ ...simParams, capacityMultiplier: Number(e.target.value) })}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>60% (Downsized)</span>
              <span>100% (Standard)</span>
              <span>150% (High-Capacity)</span>
            </div>
          </div>

          {/* Lever 3: Priority Threshold */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-slate-700 font-semibold">
              <span>Priority Collection Threshold:</span>
              <span className="font-mono text-purple-700 font-bold">{simParams.priorityThreshold}%</span>
            </div>
            <input
              type="range"
              min="40"
              max="90"
              step="5"
              value={simParams.priorityThreshold}
              onChange={e => setSimParams({ ...simParams, priorityThreshold: Number(e.target.value) })}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>40% (Proactive)</span>
              <span>70% (Standard)</span>
              <span>90% (Urgent only)</span>
            </div>
          </div>

          {/* Lever 4: Zone Restriction */}
          <div className="space-y-1.5">
            <label className="block text-slate-700 font-semibold">Selected Operational Zone:</label>
            <select
              value={simParams.selectedZoneId}
              onChange={e => setSimParams({ ...simParams, selectedZoneId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none"
            >
              <option value="ALL">All Operational Zones Combined</option>
              {zones.map(z => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          </div>

          {/* Lever 5: Simulated Fuel/Energy Cost */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-slate-700 font-semibold">
              <span>Fuel / Cost per Km:</span>
              <span className="font-mono text-purple-700 font-bold">${simParams.fuelCostPerKm.toFixed(2)} / km</span>
            </div>
            <input
              type="range"
              min="1.2"
              max="4.0"
              step="0.2"
              value={simParams.fuelCostPerKm}
              onChange={e => setSimParams({ ...simParams, fuelCostPerKm: Number(e.target.value) })}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>$1.20</span>
              <span>$2.40 (Current)</span>
              <span>$4.00 (Peak)</span>
            </div>
          </div>

          {/* Lever 6: Average Transit Speed */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-slate-700 font-semibold">
              <span>Transit Speed:</span>
              <span className="font-mono text-purple-700 font-bold">{simParams.vehicleSpeed} km/h</span>
            </div>
            <input
              type="range"
              min="15"
              max="45"
              step="5"
              value={simParams.vehicleSpeed}
              onChange={e => setSimParams({ ...simParams, vehicleSpeed: Number(e.target.value) })}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>15 km/h (Traffic)</span>
              <span>25 km/h</span>
              <span>45 km/h (Clear)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Comparison Table & Results */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="font-bold text-slate-900 text-sm">
            Scenario Benchmark: Live Operations vs Simulated Model
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Calculated Deterministically
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Current Live Baseline */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-2">
              Current Live Dispatch
            </div>
            <div className="space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>Vehicles Deployed:</span>
                <b className="text-slate-900">{simResult.current.vehiclesUsed} trucks</b>
              </div>
              <div className="flex justify-between">
                <span>Estimated Distance:</span>
                <b className="text-slate-900">{simResult.current.totalDistance} km</b>
              </div>
              <div className="flex justify-between">
                <span>Total Duration:</span>
                <b className="text-slate-900">{simResult.current.totalDuration} min</b>
              </div>
              <div className="flex justify-between">
                <span>Bins Serviced:</span>
                <b className="text-slate-900">{simResult.current.totalStops} stops</b>
              </div>
              <div className="flex justify-between">
                <span>Waste Collected:</span>
                <b className="text-slate-900">{simResult.current.totalWasteCollected.toLocaleString()} kg</b>
              </div>
              <div className="flex justify-between">
                <span>Average Utilization:</span>
                <b className="text-slate-900">{simResult.current.avgUtilization}%</b>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span>Estimated Cost:</span>
                <b className="text-slate-900">${simResult.current.estimatedCost}</b>
              </div>
              <div className="flex justify-between">
                <span>CO₂ Emissions:</span>
                <b className="text-slate-900">{simResult.current.co2Emissions} kg</b>
              </div>
            </div>
          </div>

          {/* Simulated Scenario */}
          <div className="bg-purple-50/40 p-4 rounded-xl border border-purple-200 space-y-2">
            <div className="font-bold text-purple-900 text-xs uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Simulated Scenario</span>
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping"></span>
            </div>
            <div className="space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>Vehicles Deployed:</span>
                <b className="text-purple-900">{simResult.simulated.vehiclesUsed} trucks</b>
              </div>
              <div className="flex justify-between">
                <span>Estimated Distance:</span>
                <b className="text-purple-900">{simResult.simulated.totalDistance} km</b>
              </div>
              <div className="flex justify-between">
                <span>Total Duration:</span>
                <b className="text-purple-900">{simResult.simulated.totalDuration} min</b>
              </div>
              <div className="flex justify-between">
                <span>Bins Serviced:</span>
                <b className="text-purple-900">{simResult.simulated.totalStops} stops</b>
              </div>
              <div className="flex justify-between">
                <span>Waste Collected:</span>
                <b className="text-purple-900">{simResult.simulated.totalWasteCollected.toLocaleString()} kg</b>
              </div>
              <div className="flex justify-between">
                <span>Average Utilization:</span>
                <b className="text-purple-900">{simResult.simulated.avgUtilization}%</b>
              </div>
              <div className="flex justify-between pt-1 border-t border-purple-200">
                <span>Estimated Cost:</span>
                <b className="text-purple-900">${simResult.simulated.estimatedCost}</b>
              </div>
              <div className="flex justify-between">
                <span>CO₂ Emissions:</span>
                <b className="text-purple-900">{simResult.simulated.co2Emissions} kg</b>
              </div>
            </div>
          </div>

          {/* Variance & Differential Impact */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3">
            <div>
              <div className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">
                Differential Variance
              </div>
              <div className="space-y-2">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <div className="text-[10px] text-slate-400">Distance Variance</div>
                  <div className={`text-base font-bold ${simResult.delta.distanceDiffKm <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {simResult.delta.distanceDiffKm > 0 ? `+${simResult.delta.distanceDiffKm}` : simResult.delta.distanceDiffKm} km
                  </div>
                </div>

                <div className="p-2 bg-slate-50 rounded-lg">
                  <div className="text-[10px] text-slate-400">Cost Variance</div>
                  <div className={`text-base font-bold ${simResult.delta.costDiffDollars <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {simResult.delta.costDiffDollars > 0 ? `+$${simResult.delta.costDiffDollars}` : `-$${Math.abs(simResult.delta.costDiffDollars)}`}
                  </div>
                </div>

                <div className="p-2 bg-slate-50 rounded-lg">
                  <div className="text-[10px] text-slate-400">CO₂ Variance</div>
                  <div className={`text-base font-bold ${simResult.delta.co2DiffKg <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {simResult.delta.co2DiffKg > 0 ? `+${simResult.delta.co2DiffKg}` : simResult.delta.co2DiffKg} kg CO₂
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleApplyScenario}
              className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-xs shadow-xs transition"
            >
              Commit This Scenario
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
