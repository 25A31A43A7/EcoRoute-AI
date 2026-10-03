import React from 'react';
import { useApp } from '../../context/AppContext';
import { Collector, CollectorStatus } from '../../types';
import {
  Users,
  Phone,
  Truck,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Smartphone
} from 'lucide-react';

export const CollectorsView: React.FC = () => {
  const { collectors, vehicles, zones, updateCollector, setActiveCollectorVehicleId, setActiveTab } = useApp();

  const handleStatusChange = (collectorId: string, newStatus: CollectorStatus) => {
    updateCollector(collectorId, { status: newStatus });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Collector Workforce Operations</h2>
          <p className="text-xs text-slate-500">
            Field operator rosters, vehicle link assignments, and real-time route execution metrics.
          </p>
        </div>

        <div className="text-xs text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
          Total Completed Pickups: <b>{collectors.reduce((s, c) => s + c.collectionsCompleted, 0)} stops</b>
        </div>
      </div>

      {/* Collector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {collectors.map(collector => {
          const vehicle = vehicles.find(v => v.id === collector.vehicleId);
          const zone = zones.find(z => z.id === collector.zoneId);

          return (
            <div
              key={collector.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 text-xs"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm flex items-center justify-center border border-emerald-200">
                    {collector.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{collector.name}</h3>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{collector.phone}</span>
                    </div>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  collector.status === 'Available' ? 'bg-emerald-100 text-emerald-700' :
                  collector.status === 'En Route' || collector.status === 'Collecting' ? 'bg-blue-100 text-blue-700' :
                  collector.status === 'Assigned' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {collector.status}
                </span>
              </div>

              {/* Assignment details */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1.5 text-[11px] text-slate-700">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Truck className="w-3.5 h-3.5" /> Assigned Vehicle:
                  </span>
                  <span className="font-semibold text-slate-900">{vehicle?.vehicleNumber || 'None'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <MapPin className="w-3.5 h-3.5" /> Sector:
                  </span>
                  <span className="font-semibold text-slate-900">{zone?.name || collector.zoneId}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                  <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Shift Completions:
                  </span>
                  <span className="font-mono font-bold text-slate-900">{collector.collectionsCompleted} nodes</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                {vehicle && (
                  <button
                    onClick={() => {
                      setActiveCollectorVehicleId(vehicle.id);
                      setActiveTab('collector');
                    }}
                    className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center justify-center gap-1.5 shadow-xs transition"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Open In-Cab View</span>
                  </button>
                )}

                <select
                  value={collector.status}
                  onChange={e => handleStatusChange(collector.id, e.target.value as CollectorStatus)}
                  className="px-2 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 text-xs font-medium focus:outline-none"
                >
                  <option value="Available">Available</option>
                  <option value="Assigned">Assigned</option>
                  <option value="En Route">En Route</option>
                  <option value="Collecting">Collecting</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
