import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  MapPin,
  Map,
  Route as RouteIcon,
  Truck,
  Users,
  AlertTriangle,
  Globe2,
  SlidersHorizontal,
  BarChart3,
  Settings as SettingsIcon,
  Smartphone
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, alerts, points, vehicles } = useApp();

  const criticalPointsCount = points.filter(p => p.status === 'Critical' || p.status === 'Overflow Risk').length;
  const newAlertsCount = alerts.filter(a => a.status === 'new').length;
  const activeVehiclesCount = vehicles.filter(v => v.status !== 'Offline' && v.status !== 'Maintenance').length;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'points', label: 'Collection Points', icon: MapPin, badge: criticalPointsCount > 0 ? `${criticalPointsCount} Crit` : undefined },
    { id: 'map', label: 'Live Map', icon: Map },
    { id: 'routes', label: 'Route Optimization', icon: RouteIcon },
    { id: 'vehicles', label: 'Vehicles', icon: Truck, badge: `${activeVehiclesCount} Active` },
    { id: 'collectors', label: 'Collectors', icon: Users },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle, badge: newAlertsCount > 0 ? newAlertsCount : undefined },
    { id: 'zones', label: 'Zone Intelligence', icon: Globe2 },
    { id: 'collector', label: 'Collector Mobile', icon: Smartphone },
    { id: 'simulator', label: 'What-If Simulator', icon: SlidersHorizontal },
    { id: 'analytics', label: 'Analytics & Impact', icon: BarChart3 },
    { id: 'settings', label: 'Admin Settings', icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 hidden lg:flex">
      <div className="p-4 space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Operations Management
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                isActive
                  ? 'bg-emerald-50 text-emerald-800 font-semibold border-l-4 border-emerald-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    item.id === 'alerts' || item.id === 'points'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* System Health / Free-tier friendly badge */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs">
          <div className="flex items-center justify-between font-semibold text-slate-800 mb-1">
            <span>EcoRoute Core</span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              ACTIVE
            </span>
          </div>
          <div className="text-[11px] text-slate-500 space-y-0.5">
            <div>Algorithms: <b>Local Heuristic</b></div>
            <div>External Paid API: <b>$0.00 (Zero)</b></div>
            <div>Maps: <b>OpenStreetMap</b></div>
          </div>
        </div>
      </div>
    </aside>
  );
};
