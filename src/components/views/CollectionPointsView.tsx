import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CollectionPoint, WasteType } from '../../types';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Eye,
  Sparkles,
  TrendingUp,
  X,
  MapPin
} from 'lucide-react';

export const CollectionPointsView: React.FC = () => {
  const {
    points,
    zones,
    predictions,
    updatePoint,
    addPoint,
    deletePoint,
    markPointCollected,
    selectedPointId
  } = useApp();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<CollectionPoint | null>(null);
  const [viewingPoint, setViewingPoint] = useState<CollectionPoint | null>(() => {
    return selectedPointId ? points.find(p => p.id === selectedPointId) || null : null;
  });

  // New Point Form State
  const [newPointForm, setNewPointForm] = useState({
    name: '',
    zoneId: 'zone-1',
    latitude: 37.7749,
    longitude: -122.4194,
    wasteType: 'General' as WasteType,
    capacity: 1000,
    currentWaste: 500,
    fillPercentage: 50,
    lastCollection: new Date().toISOString(),
    nextScheduledCollection: new Date(Date.now() + 12 * 3600000).toISOString()
  });

  const [formError, setFormError] = useState('');

  // Filtered Points
  const filteredPoints = useMemo(() => {
    return points.filter(p => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchZone = selectedZone === 'ALL' || p.zoneId === selectedZone;
      const matchStatus = selectedStatus === 'ALL' || p.status === selectedStatus;

      let matchPriority = true;
      if (priorityFilter === 'CRITICAL') matchPriority = p.priorityScore >= 85;
      else if (priorityFilter === 'HIGH') matchPriority = p.priorityScore >= 70 && p.priorityScore < 85;
      else if (priorityFilter === 'NORMAL') matchPriority = p.priorityScore < 70;

      return matchSearch && matchZone && matchStatus && matchPriority;
    });
  }, [points, searchTerm, selectedZone, selectedStatus, priorityFilter]);

  const handleCreatePoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPointForm.name.trim()) {
      setFormError('Please enter a location name');
      return;
    }
    if (newPointForm.capacity <= 0) {
      setFormError('Capacity must be greater than 0');
      return;
    }
    if (newPointForm.fillPercentage < 0 || newPointForm.fillPercentage > 100) {
      setFormError('Fill percentage must be between 0 and 100');
      return;
    }
    if (newPointForm.latitude < -90 || newPointForm.latitude > 90) {
      setFormError('Latitude must be between -90 and 90');
      return;
    }
    if (newPointForm.longitude < -180 || newPointForm.longitude > 180) {
      setFormError('Longitude must be between -180 and 180');
      return;
    }

    addPoint({
      name: newPointForm.name,
      zoneId: newPointForm.zoneId,
      latitude: Number(newPointForm.latitude),
      longitude: Number(newPointForm.longitude),
      wasteType: newPointForm.wasteType,
      capacity: Number(newPointForm.capacity),
      currentWaste: Math.round((newPointForm.fillPercentage / 100) * newPointForm.capacity),
      fillPercentage: Number(newPointForm.fillPercentage),
      lastCollection: newPointForm.lastCollection,
      nextScheduledCollection: newPointForm.nextScheduledCollection
    });

    setIsAddModalOpen(false);
    setFormError('');
    setNewPointForm({
      name: '',
      zoneId: 'zone-1',
      latitude: 37.7749,
      longitude: -122.4194,
      wasteType: 'General',
      capacity: 1000,
      currentWaste: 500,
      fillPercentage: 50,
      lastCollection: new Date().toISOString(),
      nextScheduledCollection: new Date(Date.now() + 12 * 3600000).toISOString()
    });
  };

  const handleUpdateFill = (point: CollectionPoint, newFill: number) => {
    const clampedFill = Math.min(100, Math.max(0, newFill));
    const newWaste = Math.round((clampedFill / 100) * point.capacity);
    updatePoint(point.id, {
      fillPercentage: clampedFill,
      currentWaste: newWaste
    });
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Collection Point Management</h2>
          <p className="text-xs text-slate-500">
            Real-time sensor telemetry, AI-assisted fill forecasting, and priority scoring across {points.length} nodes.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          Add Collection Point
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search points by name or ID (e.g. cp-01, Market St)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Zone Filter */}
          <select
            value={selectedZone}
            onChange={e => setSelectedZone(e.target.value)}
            className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
          >
            <option value="ALL">All Zones</option>
            {zones.map(z => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Critical">Critical</option>
            <option value="Overflow Risk">Overflow Risk</option>
            <option value="High Priority">High Priority</option>
            <option value="Attention">Attention</option>
            <option value="Normal">Normal</option>
            <option value="Collected">Collected</option>
            <option value="Missed">Missed</option>
          </select>

          {/* Priority Tier Filter */}
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Score &gt;= 85 (Urgent)</option>
            <option value="HIGH">Score 70 - 84 (High)</option>
            <option value="NORMAL">Score &lt; 70 (Normal)</option>
          </select>

          {(searchTerm || selectedZone !== 'ALL' || selectedStatus !== 'ALL' || priorityFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedZone('ALL');
                setSelectedStatus('ALL');
                setPriorityFilter('ALL');
              }}
              className="px-2.5 py-2 text-slate-500 hover:text-slate-800 underline text-xs"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Collection Points Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Node & Location</th>
                <th className="py-3 px-3">Zone & Type</th>
                <th className="py-3 px-3">Fill Level</th>
                <th className="py-3 px-3">24h Forecast</th>
                <th className="py-3 px-3">Overflow Risk</th>
                <th className="py-3 px-3 text-center">Priority</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPoints.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    No collection points found matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredPoints.map(point => {
                  const zone = zones.find(z => z.id === point.zoneId);
                  const pred = predictions[point.id];
                  const isCritical = point.status === 'Critical' || point.status === 'Overflow Risk';

                  return (
                    <tr
                      key={point.id}
                      className="hover:bg-slate-50/80 transition cursor-pointer"
                      onClick={() => setViewingPoint(point)}
                    >
                      {/* Name & ID */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{point.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{point.id}</span> • <span>{point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}</span>
                        </div>
                      </td>

                      {/* Zone & Waste Type */}
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-800">{zone?.name || point.zoneId}</div>
                        <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                          {point.wasteType}
                        </span>
                      </td>

                      {/* Fill Level */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${isCritical ? 'text-red-600' : 'text-slate-800'}`}>
                            {point.fillPercentage}%
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ({point.currentWaste}/{point.capacity} kg)
                          </span>
                        </div>
                        <div className="w-24 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              point.fillPercentage >= 85 ? 'bg-red-500' : point.fillPercentage >= 70 ? 'bg-orange-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, point.fillPercentage)}%` }}
                          />
                        </div>
                      </td>

                      {/* 24h Forecast */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 font-semibold text-slate-900">
                          <TrendingUp className="w-3 h-3 text-blue-500" />
                          <span>{pred ? `${pred.predicted24h}%` : `${point.predictedFill}%`}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {pred?.estimatedTimeToCritical ? `Crit in ~${pred.estimatedTimeToCritical}h` : 'At critical'}
                        </div>
                      </td>

                      {/* Overflow Risk */}
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          point.overflowRisk === 'Critical' ? 'bg-red-100 text-red-700' :
                          point.overflowRisk === 'High' ? 'bg-orange-100 text-orange-700' :
                          point.overflowRisk === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {point.overflowRisk}
                        </span>
                      </td>

                      {/* Priority Score */}
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-mono font-bold ${
                          point.priorityScore >= 85 ? 'bg-red-600 text-white' :
                          point.priorityScore >= 70 ? 'bg-orange-500 text-white' :
                          point.priorityScore >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {point.priorityScore}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          point.status === 'Critical' || point.status === 'Overflow Risk' ? 'bg-red-100 text-red-700' :
                          point.status === 'High Priority' ? 'bg-orange-100 text-orange-700' :
                          point.status === 'Attention' ? 'bg-amber-100 text-amber-700' :
                          point.status === 'Collected' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {point.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {point.status !== 'Collected' && (
                            <button
                              onClick={() => markPointCollected(point.id)}
                              className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded transition"
                              title="Mark Collected"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setViewingPoint(point)}
                            className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded transition"
                            title="Inspect Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingPoint(point)}
                            className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deletePoint(point.id)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition"
                            title="Deactivate"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Point Detail Modal */}
      {viewingPoint && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">{viewingPoint.id}</span>
                <h3 className="text-base font-bold text-slate-900">{viewingPoint.name}</h3>
              </div>
              <button
                onClick={() => setViewingPoint(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Decision Explanation Box */}
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-blue-900 font-bold">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>AI-Assisted Operational Explanation</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                {viewingPoint.explanation || 'Optimal baseline telemetry within tolerance margins.'}
              </p>
            </div>

            {/* AI Predictions Breakdown */}
            {predictions[viewingPoint.id] && (
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Demand Forecast Model (Next 48 Hours)
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="text-[10px] text-slate-400 font-medium">+6h</div>
                    <div className="text-sm font-bold text-slate-900">{predictions[viewingPoint.id].predicted6h}%</div>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="text-[10px] text-slate-400 font-medium">+12h</div>
                    <div className="text-sm font-bold text-slate-900">{predictions[viewingPoint.id].predicted12h}%</div>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="text-[10px] text-slate-400 font-medium">+24h</div>
                    <div className="text-sm font-bold text-slate-900">{predictions[viewingPoint.id].predicted24h}%</div>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="text-[10px] text-slate-400 font-medium">+48h</div>
                    <div className="text-sm font-bold text-slate-900">{predictions[viewingPoint.id].predicted48h}%</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Confidence Rating: <b>{predictions[viewingPoint.id].confidence}%</b></span>
                  <span>Time to Critical: <b>{predictions[viewingPoint.id].estimatedTimeToCritical} hrs</b></span>
                </div>
              </div>
            )}

            {/* Quick Live Fill Adjustment Slider for Testing */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                <span>Simulate Fill Sensor Level:</span>
                <span className="font-mono text-emerald-700 text-sm font-bold">{viewingPoint.fillPercentage}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={viewingPoint.fillPercentage}
                onChange={e => {
                  const val = Number(e.target.value);
                  handleUpdateFill(viewingPoint, val);
                  setViewingPoint(prev => (prev ? { ...prev, fillPercentage: val } : null));
                }}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0% Empty</span>
                <span>50%</span>
                <span className="text-red-500 font-bold">100% Overflow</span>
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setViewingPoint(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  markPointCollected(viewingPoint.id);
                  setViewingPoint(null);
                }}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs"
              >
                Mark Point Collected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Collection Point Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Collection Point</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 font-semibold text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreatePoint} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Point Name / Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Embarcadero Marina Smart Bin"
                  value={newPointForm.name}
                  onChange={e => setNewPointForm({ ...newPointForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Zone</label>
                  <select
                    value={newPointForm.zoneId}
                    onChange={e => setNewPointForm({ ...newPointForm, zoneId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none"
                  >
                    {zones.map(z => (
                      <option key={z.id} value={z.id}>
                        {z.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Waste Type</label>
                  <select
                    value={newPointForm.wasteType}
                    onChange={e => setNewPointForm({ ...newPointForm, wasteType: e.target.value as WasteType })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none"
                  >
                    <option value="General">General</option>
                    <option value="Recyclable">Recyclable</option>
                    <option value="Organic">Organic</option>
                    <option value="Hazardous">Hazardous</option>
                    <option value="Electronic">Electronic</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Latitude (-90 to 90)</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={newPointForm.latitude}
                    onChange={e => setNewPointForm({ ...newPointForm, latitude: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Longitude (-180 to 180)</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={newPointForm.longitude}
                    onChange={e => setNewPointForm({ ...newPointForm, longitude: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bin Capacity (kg)</label>
                  <input
                    type="number"
                    required
                    min="100"
                    value={newPointForm.capacity}
                    onChange={e => setNewPointForm({ ...newPointForm, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Initial Fill (%)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    value={newPointForm.fillPercentage}
                    onChange={e => setNewPointForm({ ...newPointForm, fillPercentage: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Create Point
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Point Modal */}
      {editingPoint && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Edit Collection Point</h3>
              <button
                onClick={() => setEditingPoint(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Point Name</label>
                <input
                  type="text"
                  value={editingPoint.name}
                  onChange={e => setEditingPoint({ ...editingPoint, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Capacity (kg)</label>
                  <input
                    type="number"
                    value={editingPoint.capacity}
                    onChange={e => setEditingPoint({ ...editingPoint, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fill Level (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingPoint.fillPercentage}
                    onChange={e => setEditingPoint({ ...editingPoint, fillPercentage: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingPoint(null)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const newWaste = Math.round((editingPoint.fillPercentage / 100) * editingPoint.capacity);
                    updatePoint(editingPoint.id, {
                      name: editingPoint.name,
                      capacity: editingPoint.capacity,
                      fillPercentage: editingPoint.fillPercentage,
                      currentWaste: newWaste
                    });
                    setEditingPoint(null);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
