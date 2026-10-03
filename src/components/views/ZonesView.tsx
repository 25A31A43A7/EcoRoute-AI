import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Globe2,
  TrendingUp,
  AlertTriangle,
  Truck,
  CheckCircle2,
  Clock,
  Compass,
  MapPin
} from 'lucide-react';

export const ZonesView: React.FC = () => {
  const { zones, points, vehicles, routes, setActiveTab } = useApp();
  const [selectedZoneId, setSelectedZoneId] = useState<string>('ALL');

  const filteredZones = selectedZoneId === 'ALL'
    ? zones
    : zones.filter(z => z.id === selectedZoneId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Zone Intelligence & Capacity Balancing</h2>
          <p className="text-xs text-slate-500">
            District-level waste generation analytics, vehicle coverage balancing, and overflow mitigation.
          </p>
        </div>

        <select
          value={selectedZoneId}
          onChange={e => setSelectedZoneId(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold text-xs shadow-xs focus:outline-none"
        >
          <option value="ALL">All Zones ({zones.length})</option>
          {zones.map(z => (
            <option key={z.id} value={z.id}>
              {z.name}
            </option>
          ))}
        </select>
      </div>

      {/* Zone Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredZones.map(zone => {
          const zonePoints = points.filter(p => p.zoneId === zone.id);
          const criticalPoints = zonePoints.filter(p => p.status === 'Critical' || p.status === 'Overflow Risk');
          const highPriorityPoints = zonePoints.filter(p => p.status === 'High Priority');
          const completedPoints = zonePoints.filter(p => p.status === 'Collected');
          const pendingPoints = zonePoints.length - completedPoints.length;

          const avgFill = zonePoints.length > 0
            ? Math.round(zonePoints.reduce((s, p) => s + p.fillPercentage, 0) / zonePoints.length)
            : 0;

          const totalWasteKg = zonePoints.reduce((s, p) => s + p.currentWaste, 0);
          const totalCapacityKg = zonePoints.reduce((s, p) => s + p.capacity, 0);

          const zoneVehicles = vehicles.filter(v => v.zoneId === zone.id);
          const availableVehicles = zoneVehicles.filter(v => v.status === 'Available');

          // Required vehicles estimated by total current waste / average vehicle capacity (~4500kg)
          const requiredVehicles = Math.max(1, Math.ceil(totalWasteKg / 4500));

          return (
            <div
              key={zone.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 text-xs"
            >
              {/* Zone Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: zone.color }}
                    />
                    <h3 className="text-base font-bold text-slate-900">{zone.name}</h3>
                    <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {zone.code}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{zone.description}</p>
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold text-slate-900">{avgFill}%</div>
                  <div className="text-[10px] text-slate-400">Avg Fill Level</div>
                </div>
              </div>

              {/* Aggregated Fill Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>Aggregated Load: <b>{totalWasteKg.toLocaleString()} kg</b></span>
                  <span>Total Zone Volume: <b>{totalCapacityKg.toLocaleString()} kg</b></span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full ${
                      avgFill >= 75 ? 'bg-red-500' : avgFill >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, avgFill)}%` }}
                  />
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-[10px] text-slate-400">Total Bins</div>
                  <div className="text-sm font-bold text-slate-900">{zonePoints.length}</div>
                </div>

                <div className="p-2 bg-red-50/50 rounded-lg border border-red-100">
                  <div className="text-[10px] text-red-600">Critical</div>
                  <div className="text-sm font-bold text-red-700">{criticalPoints.length}</div>
                </div>

                <div className="p-2 bg-orange-50/50 rounded-lg border border-orange-100">
                  <div className="text-[10px] text-orange-600">High Prio</div>
                  <div className="text-sm font-bold text-orange-700">{highPriorityPoints.length}</div>
                </div>

                <div className="p-2 bg-emerald-50/50 rounded-lg border border-emerald-100">
                  <div className="text-[10px] text-emerald-600">Collected</div>
                  <div className="text-sm font-bold text-emerald-700">{completedPoints.length}</div>
                </div>
              </div>

              {/* Fleet & Resource Balancing */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2 text-[11px]">
                <div className="font-semibold text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-slate-600" />
                    Fleet Resource Allocation
                  </span>
                  <span className={zoneVehicles.length >= requiredVehicles ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                    {zoneVehicles.length >= requiredVehicles ? '✓ Adequate Fleet' : '⚠️ Fleet Deficit'}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Assigned Fleet: <b>{zoneVehicles.length} vehicles</b></span>
                  <span>Required Fleet: <b>{requiredVehicles} vehicles</b></span>
                  <span>Available in Depot: <b>{availableVehicles.length}</b></span>
                </div>
              </div>

              {/* Collection points list in zone */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-semibold text-slate-700">Monitored Bins in Zone:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {zonePoints.map(p => (
                    <div
                      key={p.id}
                      className="p-1.5 bg-white border border-slate-200 rounded-md text-[11px] flex items-center justify-between"
                    >
                      <span className="truncate max-w-[150px] font-medium text-slate-800">{p.name}</span>
                      <span className={`px-1 rounded text-[10px] font-bold ${
                        p.status === 'Critical' || p.status === 'Overflow Risk' ? 'bg-red-100 text-red-700' :
                        p.status === 'Collected' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {p.fillPercentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
