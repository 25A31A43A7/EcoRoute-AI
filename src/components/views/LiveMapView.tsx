import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { LeafletMap } from '../LeafletMap';
import {
  Layers,
  Filter,
  CheckCircle,
  Truck,
  AlertTriangle,
  Compass,
  Sparkles,
  MapPin,
  RefreshCw
} from 'lucide-react';

export const LiveMapView: React.FC = () => {
  const {
    points,
    vehicles,
    routes,
    zones,
    selectedPointId,
    setSelectedPointId,
    markPointCollected,
    runOptimization
  } = useApp();

  const [selectedZone, setSelectedZone] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [showRoutes, setShowRoutes] = useState(true);

  const filteredPoints = useMemo(() => {
    return points.filter(p => {
      const matchZone = selectedZone === 'ALL' || p.zoneId === selectedZone;
      const matchStatus = selectedStatus === 'ALL' || p.status === selectedStatus;
      return matchZone && matchStatus;
    });
  }, [points, selectedZone, selectedStatus]);

  const activePoint = points.find(p => p.id === selectedPointId) || null;

  return (
    <div className="space-y-4">
      {/* Top Header & Map Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Live Operations Geospatial Map</h2>
          <p className="text-xs text-slate-500">
            Interactive OpenStreetMap monitoring with dynamic fill sensors, vehicle GPS trackers, and optimized route corridors.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Zone Selector */}
          <select
            value={selectedZone}
            onChange={e => setSelectedZone(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium shadow-xs"
          >
            <option value="ALL">All Operational Zones</option>
            {zones.map(z => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>

          {/* Status Selector */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium shadow-xs"
          >
            <option value="ALL">All Bin Statuses</option>
            <option value="Critical">Critical (&gt;85%)</option>
            <option value="Overflow Risk">Overflow Risk</option>
            <option value="High Priority">High Priority</option>
            <option value="Attention">Attention</option>
            <option value="Normal">Normal</option>
            <option value="Collected">Collected</option>
          </select>

          {/* Toggle Route Polylines */}
          <button
            onClick={() => setShowRoutes(!showRoutes)}
            className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition ${
              showRoutes
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{showRoutes ? 'Hide Routes' : 'Show Routes'}</span>
          </button>

          <button
            onClick={runOptimization}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-Route</span>
          </button>
        </div>
      </div>

      {/* Main Map + Side Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Map Container (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <LeafletMap
            points={filteredPoints}
            vehicles={vehicles}
            routes={routes}
            zones={zones}
            height="620px"
            showRoutes={showRoutes}
            selectedPointId={selectedPointId}
            onSelectPoint={pt => setSelectedPointId(pt.id)}
            onQuickCollect={id => markPointCollected(id)}
          />
        </div>

        {/* Sidebar Info Panel (1 col) */}
        <div className="space-y-4">
          {/* Active Selected Point Card */}
          {activePoint ? (
            <div className="bg-white p-4 rounded-xl border-2 border-blue-500 shadow-md space-y-3 text-xs">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono text-blue-600 font-bold uppercase">{activePoint.id}</span>
                  <h3 className="font-bold text-sm text-slate-900 leading-tight">{activePoint.name}</h3>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  activePoint.status === 'Critical' || activePoint.status === 'Overflow Risk' ? 'bg-red-100 text-red-700' :
                  activePoint.status === 'High Priority' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {activePoint.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div>Current Fill: <b className="text-slate-900">{activePoint.fillPercentage}%</b></div>
                <div>Priority Score: <b className="text-red-600">{activePoint.priorityScore}/100</b></div>
                <div>Waste: <b>{activePoint.currentWaste} kg</b></div>
                <div>Risk: <b>{activePoint.overflowRisk}</b></div>
              </div>

              <div className="p-2 bg-blue-50/70 border border-blue-100 rounded-lg text-slate-700 text-[11px] leading-relaxed">
                <span className="font-bold text-blue-900 flex items-center gap-1 mb-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  AI Explanation:
                </span>
                {activePoint.explanation || 'Optimal collection schedule.'}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => markPointCollected(activePoint.id)}
                  className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs shadow-xs transition"
                >
                  Mark Collected
                </button>
                <button
                  onClick={() => setSelectedPointId(null)}
                  className="px-2.5 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-xs"
                >
                  Deselect
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-slate-400 text-xs text-center">
              <MapPin className="w-6 h-6 mx-auto mb-1 text-slate-300" />
              Click any pin on the map to inspect live fill forecasts and instant collection controls.
            </div>
          )}

          {/* Active Fleet Tracker List */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-900">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-slate-700" />
                Fleet Vehicles ({vehicles.length})
              </span>
              <span className="text-[10px] text-emerald-600 font-mono">Live Telemetry</span>
            </div>

            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {vehicles.map(v => {
                const isOffline = v.status === 'Offline' || v.status === 'Maintenance';
                const utilPct = Math.round((v.currentLoad / v.capacity) * 100);

                return (
                  <div
                    key={v.id}
                    className="p-2 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${isOffline ? 'bg-red-500' : 'bg-emerald-500'}`} />
                        <span>{v.vehicleNumber}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {v.type.split(' ')[0]} • Payload: {v.currentLoad}/{v.capacity} kg
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isOffline ? 'bg-red-100 text-red-700' :
                        v.status === 'Near Capacity' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {v.status}
                      </span>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{utilPct}% full</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
