import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  RefreshCw,
  Sparkles,
  Smartphone,
  AlertTriangle,
  Zap,
  Truck,
  CheckCircle,
  X
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    alerts,
    rerouteNotice,
    dismissRerouteNotice,
    runOptimization,
    simulateScenario,
    activeTab,
    setActiveTab
  } = useApp();

  const [simMenuOpen, setSimMenuOpen] = useState(false);
  const unreadAlertsCount = alerts.filter(a => a.status === 'new').length;

  return (
    <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 shadow-sm">
      {/* Dynamic Reroute Alert Banner */}
      {rerouteNotice && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-inner animate-pulse">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 fill-current text-slate-950" />
            <span>{rerouteNotice}</span>
          </div>
          <button
            onClick={dismissRerouteNotice}
            className="hover:bg-amber-600/50 p-1 rounded transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-xl font-black text-slate-950 tracking-tighter">ER</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white">EcoRoute AI</h1>
              <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                AI-Assisted
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Predict. Prioritize. Optimize. Track.
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Simulation Dropdown */}
          <div className="relative">
            <button
              onClick={() => setSimMenuOpen(!simMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition"
              title="Simulate Real-time Operational Events"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Simulate Event</span>
            </button>

            {simMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-xl p-2 z-50 text-xs"
                onClick={() => setSimMenuOpen(false)}
              >
                <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                  Operational Simulations
                </div>
                <button
                  onClick={() => simulateScenario('overflow_spike')}
                  className="w-full text-left px-2.5 py-2 hover:bg-slate-800 rounded-lg transition flex items-start gap-2 mt-1"
                >
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">Bin Overflow Surge</div>
                    <div className="text-[10px] text-slate-400">Civic/Market bin surges to 98%</div>
                  </div>
                </button>
                <button
                  onClick={() => simulateScenario('vehicle_breakdown')}
                  className="w-full text-left px-2.5 py-2 hover:bg-slate-800 rounded-lg transition flex items-start gap-2"
                >
                  <Truck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">Vehicle V-02 Breakdown</div>
                    <div className="text-[10px] text-slate-400">Takes offline & reroutes stops</div>
                  </div>
                </button>
                <button
                  onClick={() => simulateScenario('emergency_point')}
                  className="w-full text-left px-2.5 py-2 hover:bg-slate-800 rounded-lg transition flex items-start gap-2"
                >
                  <Zap className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">Emergency Hazardous Call</div>
                    <div className="text-[10px] text-slate-400">Harbor dock urgent hazardous spill</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Run Route Optimizer */}
          <button
            onClick={() => {
              runOptimization();
              setActiveTab('routes');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm transition active:scale-95"
            title="Recalculate Multi-Vehicle Routes"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Optimize Routes</span>
          </button>

          {/* Collector Mobile View Toggle */}
          <button
            onClick={() => setActiveTab(activeTab === 'collector' ? 'dashboard' : 'collector')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
              activeTab === 'collector'
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title="Collector In-Cab View"
          >
            <Smartphone className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline">Collector Mode</span>
          </button>

          {/* Alerts Bell */}
          <button
            onClick={() => setActiveTab('alerts')}
            className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="View Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-slate-900 animate-pulse">
                {unreadAlertsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
