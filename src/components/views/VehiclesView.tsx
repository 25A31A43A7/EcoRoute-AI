import React from 'react';
import { useApp } from '../../context/AppContext';
import { VehicleStatus } from '../../types';
import { Truck, Gauge } from 'lucide-react';

export const VehiclesView: React.FC = () => {
  const { vehicles, collectors, updateVehicle, zones } = useApp();

  const handleStatusChange = (vehicleId: string, newStatus: VehicleStatus) => {
    updateVehicle(vehicleId, { status: newStatus });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Fleet Management</h2>
          <p className="text-xs text-slate-500">
            Real-time payload capacity tracking, maintenance status, and zone assignment dispatch.
          </p>
        </div>

        <div className="text-xs text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
          Fleet Capacity: <b>{vehicles.reduce((s, v) => s + v.capacity, 0).toLocaleString()} kg total</b>
        </div>
      </div>

      {/* Vehicle Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map(vehicle => {
          const collector = collectors.find(c => c.vehicleId === vehicle.id);
          const zone = zones.find(z => z.id === vehicle.zoneId);
          const utilPct = Math.round((vehicle.currentLoad / vehicle.capacity) * 100);
          const isOffline = vehicle.status === 'Offline' || vehicle.status === 'Maintenance';

          return (
            <div
              key={vehicle.id}
              className={`bg-white rounded-xl border p-4 shadow-xs space-y-3 text-xs transition ${
                isOffline ? 'border-red-200 bg-red-50/10' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold ${
                    isOffline ? 'bg-slate-200 text-slate-600' : 'bg-slate-900 text-white'
                  }`}>
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-tight">{vehicle.vehicleNumber}</h3>
                    <div className="text-[11px] text-slate-500">{vehicle.type}</div>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  vehicle.status === 'Available' ? 'bg-emerald-100 text-emerald-700' :
                  vehicle.status === 'Assigned' ? 'bg-blue-100 text-blue-700' :
                  vehicle.status === 'En Route' ? 'bg-indigo-100 text-indigo-700' :
                  vehicle.status === 'Near Capacity' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                }`}>
                  {vehicle.status}
                </span>
              </div>

              {/* Payload Gauge */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-1 font-medium">
                    <Gauge className="w-3.5 h-3.5 text-slate-400" />
                    Payload Utilization:
                  </span>
                  <span className="font-mono font-bold text-slate-900">{utilPct}%</span>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      utilPct >= 90 ? 'bg-red-500' : utilPct >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, utilPct)}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Current: {vehicle.currentLoad.toLocaleString()} kg</span>
                  <span>Max: {vehicle.capacity.toLocaleString()} kg</span>
                </div>
              </div>

              {/* Details List */}
              <div className="space-y-1 text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span>Assigned Driver:</span>
                  <span className="font-semibold text-slate-800">{collector?.name || 'Unassigned'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Operating Sector:</span>
                  <span className="font-semibold text-slate-800">{zone?.name || vehicle.zoneId}</span>
                </div>
                <div className="flex justify-between">
                  <span>GPS Coordinates:</span>
                  <span className="font-mono text-slate-500">{vehicle.latitude.toFixed(4)}, {vehicle.longitude.toFixed(4)}</span>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                <button
                  onClick={() => handleStatusChange(vehicle.id, 'Available')}
                  className={`flex-1 py-1 rounded text-[10px] font-semibold transition ${
                    vehicle.status === 'Available'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Available
                </button>
                <button
                  onClick={() => handleStatusChange(vehicle.id, 'En Route')}
                  className={`flex-1 py-1 rounded text-[10px] font-semibold transition ${
                    vehicle.status === 'En Route'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  En Route
                </button>
                <button
                  onClick={() => handleStatusChange(vehicle.id, 'Maintenance')}
                  className={`flex-1 py-1 rounded text-[10px] font-semibold transition ${
                    vehicle.status === 'Maintenance'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Service
                </button>
                <button
                  onClick={() => handleStatusChange(vehicle.id, vehicle.status === 'Offline' ? 'Available' : 'Offline')}
                  className={`flex-1 py-1 rounded text-[10px] font-semibold transition ${
                    vehicle.status === 'Offline'
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {vehicle.status === 'Offline' ? 'Online' : 'Offline'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
