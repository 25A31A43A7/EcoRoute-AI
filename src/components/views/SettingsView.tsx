import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AppSettings } from '../../types';
import {
  Settings as SettingsIcon,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Sliders,
  DollarSign,
  Leaf,
  Truck
} from 'lucide-react';
import { defaultSettings } from '../../data/initialData';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, runOptimization } = useApp();
  const [formSettings, setFormSettings] = useState<AppSettings>(settings);
  const [saveNotice, setSaveNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formSettings);
    runOptimization();
    setSaveNotice(true);
    setTimeout(() => setSaveNotice(false), 2000);
  };

  const handleReset = () => {
    setFormSettings(defaultSettings);
    updateSettings(defaultSettings);
    runOptimization();
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Admin Dispatch Settings</h2>
          <p className="text-xs text-slate-500">
            Configure system thresholds, baseline routing speeds, operational labor rates, and ecological factors.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {saveNotice && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Settings saved and fleet routes re-optimized!</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-xs">
        {/* Section 1: Fill Thresholds */}
        <div className="space-y-4">
          <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-2 border-b border-slate-100 pb-2">
            <Sliders className="w-4 h-4 text-emerald-600" />
            <span>Telemetry Sensor Thresholds</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">Critical Fill Threshold (%)</label>
              <input
                type="number"
                min="50"
                max="99"
                value={formSettings.criticalFillThreshold}
                onChange={e => setFormSettings({ ...formSettings, criticalFillThreshold: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-400">Triggers urgent critical overflow alerts.</span>
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">High-Priority Threshold (%)</label>
              <input
                type="number"
                min="30"
                max="90"
                value={formSettings.highPriorityThreshold}
                onChange={e => setFormSettings({ ...formSettings, highPriorityThreshold: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-400">Triggers priority dispatch inclusion in next batch.</span>
            </div>
          </div>
        </div>

        {/* Section 2: Fleet & Speed Assumptions */}
        <div className="space-y-4">
          <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-2 border-b border-slate-100 pb-2">
            <Truck className="w-4 h-4 text-blue-600" />
            <span>Transit & Collection Time Parameters</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">Average Transit Speed (km/h)</label>
              <input
                type="number"
                min="10"
                max="80"
                value={formSettings.averageVehicleSpeed}
                onChange={e => setFormSettings({ ...formSettings, averageVehicleSpeed: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[10px] text-slate-400">Used for Haversine travel time estimations.</span>
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">Collection Time per Stop (min)</label>
              <input
                type="number"
                min="2"
                max="30"
                value={formSettings.collectionTimePerStop}
                onChange={e => setFormSettings({ ...formSettings, collectionTimePerStop: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[10px] text-slate-400">Duration required to empty container into compactor.</span>
            </div>
          </div>
        </div>

        {/* Section 3: Cost & Sustainability Factors */}
        <div className="space-y-4">
          <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-2 border-b border-slate-100 pb-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Financial & Sustainability Factors</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">Cost per Km ($)</label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="10"
                value={formSettings.costPerKm}
                onChange={e => setFormSettings({ ...formSettings, costPerKm: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400">Vehicle wear, fuel & maintenance.</span>
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">Labor Cost ($/hr)</label>
              <input
                type="number"
                step="1"
                min="10"
                max="100"
                value={formSettings.laborCostPerHour}
                onChange={e => setFormSettings({ ...formSettings, laborCostPerHour: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400">Operator wage rate.</span>
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">CO₂ Emission (kg/km)</label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                max="3.0"
                value={formSettings.co2EmissionPerKm}
                onChange={e => setFormSettings({ ...formSettings, co2EmissionPerKm: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400">Commercial diesel emission factor.</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition"
          >
            Save & Update Fleet Schedule
          </button>
        </div>
      </form>
    </div>
  );
};
