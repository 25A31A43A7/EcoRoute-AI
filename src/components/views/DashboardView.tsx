import React from 'react';
import { useApp } from '../../context/AppContext';
import { LeafletMap } from '../LeafletMap';
import {
  AlertTriangle,
  TrendingUp,
  Truck,
  CheckCircle2,
  Clock,
  Compass,
  Zap,
  ArrowUpRight,
  ShieldAlert,
  Leaf,
  DollarSign
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    points,
    vehicles,
    routes,
    records,
    alerts,
    zones,
    routeComparison,
    setActiveTab,
    setSelectedPointId,
    markPointCollected
  } = useApp();

  // Calculate high-level operational metrics strictly from centralized data
  const totalPoints = points.length;
  const criticalPoints = points.filter(p => p.status === 'Critical' || p.status === 'Overflow Risk');
  const highPriorityPoints = points.filter(p => p.status === 'High Priority');
  const activeVehicles = vehicles.filter(v => v.status === 'Assigned' || v.status === 'En Route' || v.status === 'Collecting');
  const availableVehicles = vehicles.filter(v => v.status === 'Available');
  const activeRoutes = routes.filter(r => r.status === 'Planned' || r.status === 'In Progress');

  const totalAssignedStops = routes.reduce((acc, r) => acc + r.stopIds.length, 0);
  const completedStops = routes.reduce((acc, r) => acc + r.completedStopsCount, 0);
  const pendingStops = Math.max(0, totalAssignedStops - completedStops);

  const avgFillLevel = Math.round(
    points.reduce((sum, p) => sum + p.fillPercentage, 0) / Math.max(1, points.length)
  );

  const avgVehicleUtil = vehicles.length > 0
    ? Math.round(
        (vehicles.reduce((sum, v) => sum + (v.currentLoad / v.capacity), 0) / vehicles.length) * 100
      )
    : 0;

  // Highest priority critical points sorted descending
  const urgentLocations = [...points].sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Operations Control Center</h2>
          <p className="text-xs text-slate-500">
            Intelligent waste collection dispatch, live bin fill forecasting, and fleet route orchestration.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            System Live & Optimized
          </span>
          <button
            onClick={() => setActiveTab('routes')}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition"
          >
            View Active Routes ({activeRoutes.length})
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* Total Points */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase">Total Bins</span>
            <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-mono">4 Zones</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalPoints}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Avg Fill: <b>{avgFillLevel}%</b></span>
            <span className="text-emerald-600 font-semibold">{points.filter(p => p.status === 'Collected').length} Cleared</span>
          </div>
        </div>

        {/* Critical & Overflow Risk */}
        <div className="bg-white p-3.5 rounded-xl border border-red-200 bg-red-50/20 shadow-xs">
          <div className="flex items-center justify-between text-red-600 mb-1">
            <span className="text-[11px] font-semibold uppercase">Urgent Overflow</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600">
            {criticalPoints.length}
            <span className="text-xs font-normal text-slate-500 ml-1.5">
              (+{highPriorityPoints.length} High)
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Prioritized in next dispatch
          </div>
        </div>

        {/* Fleet Deployment */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase">Vehicles</span>
            <Truck className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {activeVehicles.length}
            <span className="text-xs font-normal text-slate-500 ml-1.5">
              / {vehicles.length} Total
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {availableVehicles.length} Available in depot
          </div>
        </div>

        {/* Fleet Utilization */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase">Fleet Payload</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{avgVehicleUtil}%</div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full"
              style={{ width: `${Math.min(100, avgVehicleUtil)}%` }}
            />
          </div>
        </div>

        {/* Distance Saved */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase">Distance Saved</span>
            <Compass className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {routeComparison?.savings.distanceSavedKm || 14.8} km
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            <b>{routeComparison?.savings.distanceSavedPercent || 28}%</b> reduction vs naive
          </div>
        </div>

        {/* Estimated CO2 Avoided */}
        <div className="bg-white p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="text-[11px] font-semibold uppercase">CO₂ Avoided</span>
            <Leaf className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">
            {routeComparison?.savings.co2AvoidedKg || 12.6} kg
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-emerald-600" />
            <span>Saved ~${routeComparison?.savings.costSavedDollars || 42}</span>
          </div>
        </div>
      </div>

      {/* Main Map + Urgent Locations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map (2 cols) */}
        <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Live Operations Map</h3>
              <p className="text-xs text-slate-500">Real-time status indicators and active vehicle route paths</p>
            </div>
            <button
              onClick={() => setActiveTab('map')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Full Screen Map <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-[420px] rounded-lg overflow-hidden border border-slate-200">
            <LeafletMap
              points={points}
              vehicles={vehicles}
              routes={routes}
              zones={zones}
              height="420px"
              onSelectPoint={(pt) => {
                setSelectedPointId(pt.id);
                setActiveTab('points');
              }}
              onQuickCollect={(id) => markPointCollected(id)}
            />
          </div>
        </div>

        {/* Critical Locations & Urgent Attention (1 col) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                <h3 className="text-sm font-bold text-slate-900">Critical Locations</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                Urgent Attention
              </span>
            </div>

            <div className="space-y-3">
              {urgentLocations.map(pt => {
                const zone = zones.find(z => z.id === pt.zoneId);
                const isCritical = pt.status === 'Critical' || pt.status === 'Overflow Risk';

                return (
                  <div
                    key={pt.id}
                    className="p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50/50 transition cursor-pointer"
                    onClick={() => {
                      setSelectedPointId(pt.id);
                      setActiveTab('points');
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold text-xs text-slate-900 truncate">{pt.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {zone?.name || pt.zoneId} • {pt.wasteType}
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                        isCritical ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        Score {pt.priorityScore}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs">
                      <div>
                        Fill: <b className={isCritical ? 'text-red-600 font-bold' : 'text-slate-800'}>{pt.fillPercentage}%</b>
                        <span className="text-slate-400 text-[10px] ml-1">({pt.currentWaste} kg)</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        24h Forecast: <b>{pt.predictedFill}%</b>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${
                          pt.fillPercentage >= 85 ? 'bg-red-500' : pt.fillPercentage >= 70 ? 'bg-orange-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, pt.fillPercentage)}%` }}
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 truncate max-w-[160px] italic">
                        {pt.overflowRisk} Risk
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markPointCollected(pt.id);
                        }}
                        className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-semibold transition"
                      >
                        Quick Collect
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('points')}
            className="w-full mt-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
          >
            Manage All {points.length} Collection Points →
          </button>
        </div>
      </div>

      {/* Lower Row: Active Routes & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Routes Overview */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Active Fleet Routes</h3>
            </div>
            <button
              onClick={() => setActiveTab('routes')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Route Details →
            </button>
          </div>

          {routes.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No routes currently calculated. Click "Optimize Routes" above.
            </div>
          ) : (
            <div className="space-y-3">
              {routes.slice(0, 3).map(route => {
                const vehicle = vehicles.find(v => v.id === route.vehicleId);
                const progressPct = route.stops.length > 0
                  ? Math.round((route.completedStopsCount / route.stops.length) * 100)
                  : 0;

                return (
                  <div key={route.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-900">{route.id}</span>
                        <span className="text-xs text-slate-600 font-medium">({vehicle?.vehicleNumber})</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        route.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                        route.status === 'In Progress' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {route.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-[11px] text-slate-600 my-2">
                      <div>Stops: <b>{route.completedStopsCount}/{route.stopIds.length}</b></div>
                      <div>Dist: <b>{route.distance} km</b></div>
                      <div>Duration: <b>{route.estimatedDuration} min</b></div>
                      <div>Waste: <b>{route.estimatedWaste} kg</b></div>
                    </div>

                    {/* Route Progress */}
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                      <span>Progress: {progressPct}%</span>
                      <span>Payload Utilization: <b>{route.utilization}%</b></span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${progressPct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Collection Activity Log */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Recent Collection Activity</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Live Operations Log</span>
          </div>

          <div className="space-y-2.5 max-h-[310px] overflow-y-auto pr-1">
            {records.slice(0, 5).map(record => (
              <div
                key={record.id}
                className="p-2.5 rounded-lg border border-slate-100 bg-white hover:bg-slate-50 transition flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-900">{record.pointName}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Collected by <b>{record.collectorName}</b> ({record.vehicleNumber})
                  </div>
                  {record.notes && (
                    <div className="text-[10px] text-slate-400 italic mt-0.5">{record.notes}</div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">
                    +{record.quantityCollected} kg
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-end gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
