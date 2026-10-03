import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Route as RouteIcon,
  RefreshCw,
  Zap,
  CheckCircle,
  Clock,
  Compass,
  TrendingDown,
  Leaf,
  DollarSign,
  AlertTriangle,
  Play,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  MapPin,
  Truck
} from 'lucide-react';

export const RouteOptimizationView: React.FC = () => {
  const {
    routes,
    unassignedPoints,
    routeComparison,
    vehicles,
    collectors,
    points,
    runOptimization,
    startRoute,
    completeRoute,
    triggerDynamicReroute,
    markPointCollected,
    skipPoint
  } = useApp();

  const [expandedRouteId, setExpandedRouteId] = useState<string | null>(routes[0]?.id || null);
  const [rerouteReasonInput, setRerouteReasonInput] = useState('');
  const [isRerouting, setIsRerouting] = useState(false);

  const handleManualReroute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rerouteReasonInput.trim()) return;
    setIsRerouting(true);
    triggerDynamicReroute(rerouteReasonInput);
    setRerouteReasonInput('');
    setTimeout(() => setIsRerouting(false), 500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Multi-Vehicle Route Optimization</h2>
          <p className="text-xs text-slate-500">
            Priority-first, capacity-constrained dispatch algorithm with 2-opt nearest-neighbor clustering.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => runOptimization()}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-Run Optimizer</span>
          </button>
        </div>
      </div>

      {/* Route Comparison Card (Standard vs AI-Optimized) */}
      {routeComparison && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-5 rounded-2xl shadow-lg border border-slate-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-slate-700/60 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h3 className="text-base font-bold tracking-tight">AI Route Performance & Savings Benchmark</h3>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Deterministic comparison of standard naive FIFO sequence versus EcoRoute AI multi-vehicle clustering.
              </p>
            </div>
            <div className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
              Zero External Paid Routing APIs Required
            </div>
          </div>

          {/* Comparison Side-by-Side Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Standard Route Baseline */}
            <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Standard Baseline (Un-optimized)
              </div>
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Estimated Distance:</span>
                  <span className="font-mono font-bold text-white">{routeComparison.standardRoute.totalDistance} km</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Duration:</span>
                  <span className="font-mono font-bold text-white">{routeComparison.standardRoute.totalDuration} min</span>
                </div>
                <div className="flex justify-between">
                  <span>Fleet Utilization:</span>
                  <span className="font-mono font-bold text-white">{routeComparison.standardRoute.avgUtilization}%</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-700">
                  <span>Estimated Cost:</span>
                  <span className="font-mono font-bold text-rose-400">${routeComparison.standardRoute.estimatedCost}</span>
                </div>
              </div>
            </div>

            {/* AI Optimized Route */}
            <div className="bg-emerald-950/40 p-3.5 rounded-xl border border-emerald-500/30">
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>EcoRoute AI Optimized</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Estimated Distance:</span>
                  <span className="font-mono font-bold text-emerald-400">{routeComparison.optimizedRoute.totalDistance} km</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Duration:</span>
                  <span className="font-mono font-bold text-emerald-400">{routeComparison.optimizedRoute.totalDuration} min</span>
                </div>
                <div className="flex justify-between">
                  <span>Fleet Utilization:</span>
                  <span className="font-mono font-bold text-emerald-400">{routeComparison.optimizedRoute.avgUtilization}%</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-emerald-900/60">
                  <span>Estimated Cost:</span>
                  <span className="font-mono font-bold text-emerald-400">${routeComparison.optimizedRoute.estimatedCost}</span>
                </div>
              </div>
            </div>

            {/* Total Operational & Ecological Savings */}
            <div className="bg-blue-950/40 p-3.5 rounded-xl border border-blue-500/30 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
                  Net Impact Savings
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-slate-900/60 rounded-lg">
                    <div className="text-[10px] text-slate-400">Distance Saved</div>
                    <div className="text-base font-bold text-blue-400">
                      -{routeComparison.savings.distanceSavedKm} km
                    </div>
                    <div className="text-[10px] text-slate-400">({routeComparison.savings.distanceSavedPercent}%)</div>
                  </div>
                  <div className="p-2 bg-slate-900/60 rounded-lg">
                    <div className="text-[10px] text-slate-400">Time Saved</div>
                    <div className="text-base font-bold text-blue-400">
                      -{routeComparison.savings.timeSavedMinutes} min
                    </div>
                    <div className="text-[10px] text-slate-400">({routeComparison.savings.timeSavedPercent}%)</div>
                  </div>
                  <div className="p-2 bg-slate-900/60 rounded-lg">
                    <div className="text-[10px] text-slate-400">CO₂ Avoided</div>
                    <div className="text-base font-bold text-emerald-400">
                      {routeComparison.savings.co2AvoidedKg} kg
                    </div>
                    <div className="text-[10px] text-slate-400">Fuel: ~{routeComparison.savings.fuelSavedLiters} L</div>
                  </div>
                  <div className="p-2 bg-slate-900/60 rounded-lg">
                    <div className="text-[10px] text-slate-400">Cost Saved</div>
                    <div className="text-base font-bold text-emerald-400">
                      ${routeComparison.savings.costSavedDollars}
                    </div>
                    <div className="text-[10px] text-slate-400">Operational net</div>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-300 italic mt-2 border-t border-blue-900/50 pt-1.5">
                💡 {routeComparison.rationale}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Rerouting Trigger Box */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Simulate Dynamic Rerouting Event
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Simulate an ad-hoc road closure, urgent bin spike, or schedule recalculation on the fly.
            </p>
          </div>

          <form onSubmit={handleManualReroute} className="flex items-center gap-2 flex-1 max-w-md">
            <input
              type="text"
              placeholder="e.g. Market St traffic detour / CP-01 urgent spike"
              value={rerouteReasonInput}
              onChange={e => setRerouteReasonInput(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              disabled={isRerouting}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition shrink-0"
            >
              {isRerouting ? 'Recalculating...' : 'Trigger Reroute'}
            </button>
          </form>
        </div>
      </div>

      {/* Unassigned Points Notice (Rule 16: Must Never Silently Ignore Points) */}
      {unassignedPoints.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-xl text-xs space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Unassigned High-Priority Points ({unassignedPoints.length})</span>
          </div>
          <p className="text-amber-800">
            The following points require service but could not fit into active vehicle capacities:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {unassignedPoints.map(({ point, reason }) => (
              <div key={point.id} className="p-2 bg-white rounded-lg border border-amber-200 shadow-xs">
                <div className="font-semibold text-slate-900">{point.name}</div>
                <div className="text-[11px] text-slate-500">
                  Fill: <b>{point.fillPercentage}%</b> ({point.currentWaste} kg) • Priority: <b>{point.priorityScore}</b>
                </div>
                <div className="text-[10px] text-red-600 font-medium mt-1">
                  ⚠️ {reason}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generated Fleet Routes List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Generated Fleet Routes ({routes.length} Active Corridors)
        </h3>

        {routes.map(route => {
          const vehicle = vehicles.find(v => v.id === route.vehicleId);
          const collector = collectors.find(c => c.id === route.collectorId);
          const isExpanded = expandedRouteId === route.id;
          const progressPct = route.stops.length > 0
            ? Math.round((route.completedStopsCount / route.stops.length) * 100)
            : 0;

          return (
            <div
              key={route.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden text-xs"
            >
              {/* Route Summary Header */}
              <div
                className="p-4 bg-slate-50/70 hover:bg-slate-100/60 transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200"
                onClick={() => setExpandedRouteId(isExpanded ? null : route.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm font-mono shrink-0">
                    <RouteIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 font-mono">{route.id}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-800">
                        {vehicle?.vehicleNumber}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        route.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                        route.status === 'In Progress' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {route.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Driver: <b>{collector?.name || 'Unassigned'}</b> • Operating Zone: <b>{vehicle?.zoneId}</b>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex flex-wrap items-center gap-4 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Stops</span>
                    <span className="font-mono font-bold text-sm">
                      {route.completedStopsCount} / {route.stopIds.length}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Estimated Dist</span>
                    <span className="font-mono font-bold text-sm">{route.distance} km</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Duration</span>
                    <span className="font-mono font-bold text-sm">{route.estimatedDuration} min</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Payload</span>
                    <span className="font-mono font-bold text-sm">{route.estimatedWaste} kg</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Utilization</span>
                    <span className="font-mono font-bold text-sm text-emerald-700">{route.utilization}%</span>
                  </div>

                  {/* Route Status Controls */}
                  <div className="flex items-center gap-2 pl-2 border-l border-slate-200" onClick={e => e.stopPropagation()}>
                    {route.status === 'Planned' && (
                      <button
                        onClick={() => startRoute(route.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1 shadow-xs"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Start</span>
                      </button>
                    )}
                    {route.status === 'In Progress' && (
                      <button
                        onClick={() => completeRoute(route.id)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1 shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Complete</span>
                      </button>
                    )}
                    <button className="p-1 text-slate-400 hover:text-slate-700">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Stop-by-Stop Itinerary */}
              {isExpanded && (
                <div className="p-4 bg-white space-y-4">
                  {/* AI Route Explanation */}
                  <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl text-[11px] text-slate-700 leading-relaxed flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-blue-900">AI Dispatch Rationale: </span>
                      {route.explanation}
                    </div>
                  </div>

                  {/* Stops Timeline Table */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3">Sequence</th>
                          <th className="py-2.5 px-3">Collection Stop</th>
                          <th className="py-2.5 px-3">Est. Arrival</th>
                          <th className="py-2.5 px-3">Planned Waste</th>
                          <th className="py-2.5 px-3">Fill / Priority</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 text-right">Quick Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {route.stops.map(stop => {
                          const pt = points.find(p => p.id === stop.pointId);
                          if (!pt) return null;

                          return (
                            <tr key={stop.pointId} className="hover:bg-slate-50/50">
                              <td className="py-2.5 px-3 font-mono font-bold text-slate-500">
                                #{stop.stopSequence}
                              </td>
                              <td className="py-2.5 px-3 font-semibold text-slate-900">
                                {pt.name}
                              </td>
                              <td className="py-2.5 px-3 text-slate-600">
                                +{stop.estimatedArrivalMin} min
                              </td>
                              <td className="py-2.5 px-3 font-mono">
                                {stop.plannedWasteKg} kg
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="font-semibold text-slate-900">{pt.fillPercentage}%</span>
                                <span className="text-[10px] text-slate-400 ml-1">
                                  (Score: {pt.priorityScore})
                                </span>
                              </td>
                              <td className="py-2.5 px-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  stop.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                                  stop.status === 'Skipped' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {stop.status}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                {stop.status === 'Pending' && (
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => markPointCollected(pt.id, route.vehicleId)}
                                      className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-semibold"
                                    >
                                      Collect
                                    </button>
                                    <button
                                      onClick={() => skipPoint(pt.id, route.vehicleId, 'Driver skipped on route')}
                                      className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[10px]"
                                    >
                                      Skip
                                    </button>
                                  </div>
                                )}
                                {stop.status === 'Completed' && (
                                  <span className="text-[10px] text-blue-600 font-mono">
                                    Done {stop.collectedAt || ''}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
