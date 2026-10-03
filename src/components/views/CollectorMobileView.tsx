import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Smartphone,
  Truck,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Navigation,
  Clock,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';

export const CollectorMobileView: React.FC = () => {
  const {
    vehicles,
    collectors,
    routes,
    points,
    activeCollectorVehicleId,
    setActiveCollectorVehicleId,
    markPointCollected,
    skipPoint,
    startRoute,
    completeRoute
  } = useApp();

  const [issueModalStopId, setIssueModalStopId] = useState<string | null>(null);
  const [issueReason, setIssueReason] = useState('');

  const currentVehicle = vehicles.find(v => v.id === activeCollectorVehicleId) || vehicles[0];
  const currentCollector = collectors.find(c => c.vehicleId === currentVehicle.id) || collectors[0];
  const assignedRoute = routes.find(r => r.vehicleId === currentVehicle.id);

  const vehicleUtilPct = Math.round((currentVehicle.currentLoad / currentVehicle.capacity) * 100);

  // Identify next pending stop
  const pendingStops = assignedRoute?.stops.filter(s => s.status === 'Pending') || [];
  const nextStop = pendingStops[0] || null;
  const nextPoint = nextStop ? points.find(p => p.id === nextStop.pointId) : null;

  const completedCount = assignedRoute?.stops.filter(s => s.status === 'Completed').length || 0;
  const totalStopsCount = assignedRoute?.stops.length || 0;
  const routeProgressPct = totalStopsCount > 0 ? Math.round((completedCount / totalStopsCount) * 100) : 0;

  const handleReportIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueModalStopId) return;
    skipPoint(issueModalStopId, currentVehicle.id, issueReason || 'Access blocked / hazardous obstruction');
    setIssueModalStopId(null);
    setIssueReason('');
  };

  return (
    <div className="max-w-md mx-auto space-y-4 pb-12">
      {/* Mobile Frame Header */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-sm tracking-wide">In-Cab Mobile Terminal</span>
          </div>

          {/* Vehicle Switcher */}
          <select
            value={activeCollectorVehicleId}
            onChange={e => setActiveCollectorVehicleId(e.target.value)}
            className="bg-slate-800 text-xs font-semibold text-white px-2.5 py-1 rounded-lg border border-slate-700 focus:outline-none"
          >
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>
                {v.vehicleNumber}
              </option>
            ))}
          </select>
        </div>

        {/* Driver Profile */}
        <div className="flex items-center justify-between bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 text-xs">
          <div>
            <div className="font-bold text-white text-sm">{currentCollector.name}</div>
            <div className="text-[11px] text-slate-400">
              Vehicle: <b>{currentVehicle.vehicleNumber}</b> ({currentVehicle.type.split(' ')[0]})
            </div>
          </div>
          <div className="text-right">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {currentVehicle.status}
            </span>
          </div>
        </div>

        {/* Vehicle Payload Live Bar */}
        <div className="space-y-1 text-xs">
          <div className="flex justify-between text-slate-300">
            <span>Payload: <b>{currentVehicle.currentLoad.toLocaleString()} / {currentVehicle.capacity.toLocaleString()} kg</b></span>
            <span className="font-mono font-bold text-emerald-400">{vehicleUtilPct}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                vehicleUtilPct >= 90 ? 'bg-red-500' : vehicleUtilPct >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, vehicleUtilPct)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Active Route Section */}
      {!assignedRoute ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-400 space-y-2">
          <Truck className="w-8 h-8 mx-auto text-slate-300" />
          <div className="font-bold text-slate-700 text-sm">No Active Route Assigned</div>
          <div>All bins in this sector are currently collected or awaiting re-optimization.</div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Route Overview Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] text-slate-400 font-bold uppercase">{assignedRoute.id}</span>
                <div className="text-sm font-bold text-slate-900">
                  {completedCount} of {totalStopsCount} Stops Completed
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {assignedRoute.status === 'Planned' && (
                  <button
                    onClick={() => startRoute(assignedRoute.id)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1 shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Route</span>
                  </button>
                )}
                {assignedRoute.status === 'In Progress' && (
                  <button
                    onClick={() => completeRoute(assignedRoute.id)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center gap-1 shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Offload Depot</span>
                  </button>
                )}
              </div>
            </div>

            {/* Route Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${routeProgressPct}%` }}
              />
            </div>
          </div>

          {/* NEXT STOP HERO CARD */}
          {nextPoint && nextStop ? (
            <div className="bg-white p-5 rounded-2xl border-2 border-emerald-500 shadow-md space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                  <Navigation className="w-3 h-3 text-emerald-600" />
                  Next Stop #{nextStop.stopSequence}
                </span>
                <span className="font-mono text-slate-500 text-[11px]">
                  Est. +{nextStop.estimatedArrivalMin} min
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">{nextPoint.name}</h3>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{nextPoint.latitude.toFixed(4)}, {nextPoint.longitude.toFixed(4)}</span> • <span>{nextPoint.wasteType}</span>
                </div>
              </div>

              {/* Stop Telemetry Grid */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                <div>
                  <div className="text-[10px] text-slate-400">Sensor Fill</div>
                  <div className={`text-sm font-bold ${nextPoint.fillPercentage >= 85 ? 'text-red-600' : 'text-slate-900'}`}>
                    {nextPoint.fillPercentage}%
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Planned Waste</div>
                  <div className="text-sm font-bold text-slate-900">{nextStop.plannedWasteKg} kg</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Priority</div>
                  <div className="text-sm font-bold text-slate-900">{nextPoint.priorityScore}/100</div>
                </div>
              </div>

              {/* Collector Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => markPointCollected(nextPoint.id, currentVehicle.id)}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Mark Bin Collected & Compact</span>
                </button>

                <button
                  onClick={() => setIssueModalStopId(nextPoint.id)}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <AlertCircle className="w-4 h-4 text-slate-500" />
                  <span>Report Obstacle / Skip Stop</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <div className="font-bold text-slate-900 text-sm">All Assigned Stops Cleared!</div>
              <p className="text-xs text-slate-600">
                Proceed to the municipal transfer depot to unload compacted waste.
              </p>
              <button
                onClick={() => completeRoute(assignedRoute.id)}
                className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs"
              >
                Complete Route & Reset Payload
              </button>
            </div>
          )}

          {/* Remaining Itinerary Sequence */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2 text-xs">
            <div className="font-bold text-slate-900 mb-2">Upcoming Route Stops</div>
            <div className="space-y-1.5">
              {assignedRoute.stops.map(stop => {
                const pt = points.find(p => p.id === stop.pointId);
                if (!pt) return null;

                return (
                  <div
                    key={stop.pointId}
                    className={`p-2 rounded-lg border flex items-center justify-between transition ${
                      stop.status === 'Completed'
                        ? 'bg-blue-50/50 border-blue-200 text-blue-800'
                        : stop.status === 'Skipped'
                        ? 'bg-red-50/50 border-red-200 text-red-800'
                        : 'bg-slate-50/50 border-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate max-w-[240px]">
                      <span className="font-mono font-bold text-[10px] text-slate-400">#{stop.stopSequence}</span>
                      <span className="font-medium truncate">{pt.name}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-[10px] text-slate-500">{stop.plannedWasteKg} kg</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        stop.status === 'Completed' ? 'bg-blue-200 text-blue-900' :
                        stop.status === 'Skipped' ? 'bg-red-200 text-red-900' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {stop.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Skip / Report Issue Modal */}
      {issueModalStopId && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-3 text-xs shadow-xl">
            <div className="font-bold text-sm text-slate-900">Report Obstacle or Skip Point</div>
            <form onSubmit={handleReportIssue} className="space-y-3">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Select or enter reason:</label>
                <select
                  value={issueReason}
                  onChange={e => setIssueReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none mb-2"
                >
                  <option value="Road construction / access blocked">Road construction / access blocked</option>
                  <option value="Bin container damaged / locked">Bin container damaged / locked</option>
                  <option value="Hazardous / contaminated material detected">Hazardous / contaminated material detected</option>
                  <option value="Illegal parking obstruction">Illegal parking obstruction</option>
                </select>

                <input
                  type="text"
                  placeholder="Or custom explanation..."
                  value={issueReason}
                  onChange={e => setIssueReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIssueModalStopId(null)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Skip & Alert Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
