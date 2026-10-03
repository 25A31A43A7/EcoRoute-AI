import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

// Views
import { DashboardView } from './components/views/DashboardView';
import { CollectionPointsView } from './components/views/CollectionPointsView';
import { LiveMapView } from './components/views/LiveMapView';
import { RouteOptimizationView } from './components/views/RouteOptimizationView';
import { VehiclesView } from './components/views/VehiclesView';
import { CollectorsView } from './components/views/CollectorsView';
import { AlertsView } from './components/views/AlertsView';
import { ZonesView } from './components/views/ZonesView';
import { CollectorMobileView } from './components/views/CollectorMobileView';
import { WhatIfSimulatorView } from './components/views/WhatIfSimulatorView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { SettingsView } from './components/views/SettingsView';

import {
  LayoutDashboard,
  MapPin,
  Map,
  Route as RouteIcon,
  Smartphone,
  AlertTriangle,
  Menu,
  X
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab, alerts, points } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const criticalPointsCount = points.filter(p => p.status === 'Critical' || p.status === 'Overflow Risk').length;
  const newAlertsCount = alerts.filter(a => a.status === 'new').length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans text-slate-800 antialiased">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Content View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'points' && <CollectionPointsView />}
          {activeTab === 'map' && <LiveMapView />}
          {activeTab === 'routes' && <RouteOptimizationView />}
          {activeTab === 'vehicles' && <VehiclesView />}
          {activeTab === 'collectors' && <CollectorsView />}
          {activeTab === 'alerts' && <AlertsView />}
          {activeTab === 'zones' && <ZonesView />}
          {activeTab === 'collector' && <CollectorMobileView />}
          {activeTab === 'simulator' && <WhatIfSimulatorView />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Responsive Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden sticky bottom-0 z-40 bg-white border-t border-slate-200 shadow-lg px-2 py-1.5 flex items-center justify-around text-[10px]">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center p-1 font-medium ${
            activeTab === 'dashboard' ? 'text-emerald-600 font-bold' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 mb-0.5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('points')}
          className={`flex flex-col items-center p-1 font-medium relative ${
            activeTab === 'points' ? 'text-emerald-600 font-bold' : 'text-slate-500'
          }`}
        >
          <MapPin className="w-4 h-4 mb-0.5" />
          <span>Bins</span>
          {criticalPointsCount > 0 && (
            <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center p-1 font-medium ${
            activeTab === 'map' ? 'text-emerald-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Map className="w-4 h-4 mb-0.5" />
          <span>Map</span>
        </button>

        <button
          onClick={() => setActiveTab('routes')}
          className={`flex flex-col items-center p-1 font-medium ${
            activeTab === 'routes' ? 'text-emerald-600 font-bold' : 'text-slate-500'
          }`}
        >
          <RouteIcon className="w-4 h-4 mb-0.5" />
          <span>Routes</span>
        </button>

        <button
          onClick={() => setActiveTab('collector')}
          className={`flex flex-col items-center p-1 font-medium ${
            activeTab === 'collector' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Smartphone className="w-4 h-4 mb-0.5" />
          <span>In-Cab</span>
        </button>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center p-1 font-medium text-slate-500"
        >
          <Menu className="w-4 h-4 mb-0.5" />
          <span>More</span>
        </button>
      </nav>

      {/* Mobile Drawer for other sections */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-64 bg-white h-full p-4 space-y-2 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
              <span className="font-bold text-sm text-slate-900">EcoRoute AI Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {[
              { id: 'vehicles', label: 'Vehicles Fleet' },
              { id: 'collectors', label: 'Collectors Roster' },
              { id: 'alerts', label: 'Alert Center', badge: newAlertsCount },
              { id: 'zones', label: 'Zone Intelligence' },
              { id: 'simulator', label: 'What-If Simulator' },
              { id: 'analytics', label: 'Analytics & Impact' },
              { id: 'settings', label: 'Admin Settings' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold ${
                  activeTab === item.id ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{item.label}</span>
                {item.badge ? (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-red-100 text-red-700 font-bold">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;
