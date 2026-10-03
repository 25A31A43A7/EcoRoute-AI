import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AlertSeverity, AlertStatus } from '../../types';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Check,
  Search,
  Filter,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export const AlertsView: React.FC = () => {
  const { alerts, acknowledgeAlert, resolveAlert, points, setActiveTab, setSelectedPointId } = useApp();

  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAlerts = alerts.filter(alert => {
    const matchSeverity = severityFilter === 'ALL' || alert.severity === severityFilter;
    const matchStatus = statusFilter === 'ALL' || alert.status === statusFilter;
    const matchSearch =
      alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.recommendedAction.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (alert.pointName && alert.pointName.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchSeverity && matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Incident & Alert Management</h2>
          <p className="text-xs text-slate-500">
            Real-time telemetry monitoring for predicted overflows, high-risk bins, capacity threshold warnings, and route exceptions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-100 text-red-800 border border-red-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
            {alerts.filter(a => a.status === 'new').length} Active Unresolved
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search alerts by location or message..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="new">New (Unread)</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
            No alerts found matching current filter criteria.
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const isCritical = alert.severity === 'critical';
            const isHigh = alert.severity === 'high';

            return (
              <div
                key={alert.id}
                className={`bg-white rounded-xl border p-4 shadow-xs transition space-y-2 text-xs ${
                  alert.status === 'resolved'
                    ? 'border-slate-200 bg-slate-50/50 opacity-60'
                    : isCritical
                    ? 'border-red-300 bg-red-50/20'
                    : isHigh
                    ? 'border-orange-300 bg-orange-50/15'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      alert.severity === 'critical' ? 'bg-red-600 text-white' :
                      alert.severity === 'high' ? 'bg-orange-500 text-white' :
                      alert.severity === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-800'
                    }`}>
                      {alert.severity}
                    </span>

                    <span className="text-slate-400 font-mono text-[10px]">{alert.id}</span>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      alert.status === 'new' ? 'bg-red-100 text-red-700' :
                      alert.status === 'acknowledged' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {alert.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <div className="text-slate-900 font-semibold text-sm">
                  {alert.message}
                </div>

                {/* Recommended Action Box */}
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-slate-700 text-[11px] leading-relaxed">
                    <span className="font-bold text-slate-900">Recommended Action: </span>
                    {alert.recommendedAction}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="text-[11px] text-slate-500">
                    {alert.pointId && (
                      <button
                        onClick={() => {
                          setSelectedPointId(alert.pointId || null);
                          setActiveTab('points');
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium underline"
                      >
                        Inspect Location ({alert.pointName}) →
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {alert.status === 'new' && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-[11px] transition"
                      >
                        Acknowledge
                      </button>
                    )}

                    {alert.status !== 'resolved' && (
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-[11px] flex items-center gap-1 shadow-xs transition"
                      >
                        <Check className="w-3 h-3" />
                        <span>Mark Resolved</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
