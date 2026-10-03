import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  CollectionPoint,
  Zone,
  Vehicle,
  Collector,
  Route,
  CollectionRecord,
  Alert,
  AppSettings,
  Prediction,
  RouteComparison,
  AlertSeverity
} from '../types';
import {
  initialCollectionPoints,
  initialZones,
  initialVehicles,
  initialCollectors,
  initialHistoricalRecords,
  initialAlerts,
  defaultSettings
} from '../data/initialData';
import { calculateDemandPrediction, calculatePriorityScore } from '../services/aiEngine';
import { optimizeFleetRoutes } from '../services/routeOptimizer';

interface AppContextType {
  points: CollectionPoint[];
  zones: Zone[];
  vehicles: Vehicle[];
  collectors: Collector[];
  routes: Route[];
  records: CollectionRecord[];
  alerts: Alert[];
  settings: AppSettings;
  predictions: Record<string, Prediction>;
  routeComparison: RouteComparison | null;
  unassignedPoints: { point: CollectionPoint; reason: string }[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  rerouteNotice: string | null;
  dismissRerouteNotice: () => void;
  selectedPointId: string | null;
  setSelectedPointId: (id: string | null) => void;
  selectedVehicleId: string | null;
  setSelectedVehicleId: (id: string | null) => void;
  activeCollectorVehicleId: string;
  setActiveCollectorVehicleId: (id: string) => void;

  // Actions
  runOptimization: () => void;
  updatePoint: (id: string, updates: Partial<CollectionPoint>) => void;
  addPoint: (newPoint: Omit<CollectionPoint, 'id' | 'predictedFill' | 'overflowRisk' | 'priorityScore' | 'status'>) => void;
  deletePoint: (id: string) => void;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  updateCollector: (id: string, updates: Partial<Collector>) => void;
  acknowledgeAlert: (id: string) => void;
  resolveAlert: (id: string) => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  markPointCollected: (pointId: string, vehicleId?: string, notes?: string) => void;
  skipPoint: (pointId: string, vehicleId?: string, reason?: string) => void;
  startRoute: (routeId: string) => void;
  completeRoute: (routeId: string) => void;
  triggerDynamicReroute: (reason: string, triggerPointId?: string) => void;
  simulateScenario: (scenarioType: 'overflow_spike' | 'vehicle_breakdown' | 'emergency_point') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [zones] = useState<Zone[]>(initialZones);
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [collectors, setCollectors] = useState<Collector[]>(initialCollectors);
  const [records, setRecords] = useState<CollectionRecord[]>(initialHistoricalRecords);
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [rerouteNotice, setRerouteNotice] = useState<string | null>(null);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [activeCollectorVehicleId, setActiveCollectorVehicleId] = useState<string>('v-01');

  // Compute predictions & priority scores for all points
  const [points, setPoints] = useState<CollectionPoint[]>(() => {
    return initialCollectionPoints.map(pt => {
      const pred = calculateDemandPrediction(pt, initialHistoricalRecords, defaultSettings);
      const prio = calculatePriorityScore(pt, pred, defaultSettings);
      return {
        ...pt,
        predictedFill: pred.predicted24h,
        overflowRisk: pred.overflowRisk,
        priorityScore: prio.priorityScore,
        status: prio.status,
        explanation: prio.explanation
      };
    });
  });

  // Compute initial optimization once
  const initialOpt = useMemo(() => {
    return optimizeFleetRoutes(points, vehicles, collectors, settings);
  }, []);

  const [routes, setRoutes] = useState<Route[]>(() => initialOpt.routes);
  const [unassignedPoints, setUnassignedPoints] = useState<{ point: CollectionPoint; reason: string }[]>(() => initialOpt.unassignedPoints);
  const [routeComparison, setRouteComparison] = useState<RouteComparison | null>(() => initialOpt.comparison);

  // Predictions memo
  const predictions = useMemo(() => {
    const map: Record<string, Prediction> = {};
    points.forEach(p => {
      map[p.id] = calculateDemandPrediction(p, records, settings);
    });
    return map;
  }, [points, records, settings]);

  const dismissRerouteNotice = useCallback(() => setRerouteNotice(null), []);

  const runOptimization = useCallback(() => {
    const res = optimizeFleetRoutes(points, vehicles, collectors, settings);
    setRoutes(res.routes);
    setUnassignedPoints(res.unassignedPoints);
    setRouteComparison(res.comparison);

    // Update vehicle status
    setVehicles(prev =>
      prev.map(v => {
        const hasRoute = res.routes.some(r => r.vehicleId === v.id);
        if (v.status === 'Maintenance' || v.status === 'Offline') return v;
        return {
          ...v,
          status: hasRoute ? 'Assigned' : 'Available',
          routeId: res.routes.find(r => r.vehicleId === v.id)?.id || null
        };
      })
    );

    // If unassigned points exist, notify via alert
    if (res.unassignedPoints.length > 0) {
      const newAlert: Alert = {
        id: `alt-${Date.now()}`,
        type: 'capacity_warning',
        severity: 'high',
        message: `${res.unassignedPoints.length} high-priority collection points unassigned due to insufficient vehicle capacity.`,
        recommendedAction: 'Deploy auxiliary vehicle or adjust collection shifts in Settings.',
        timestamp: new Date().toISOString(),
        status: 'new'
      };
      setAlerts(prev => [newAlert, ...prev]);
    }
  }, [points, vehicles, collectors, settings]);

  const updatePoint = useCallback((id: string, updates: Partial<CollectionPoint>) => {
    setPoints(prev =>
      prev.map(p => {
        if (p.id !== id) return p;
        const updated = { ...p, ...updates };
        const pred = calculateDemandPrediction(updated, records, settings);
        const prio = calculatePriorityScore(updated, pred, settings);
        return {
          ...updated,
          predictedFill: pred.predicted24h,
          overflowRisk: pred.overflowRisk,
          priorityScore: prio.priorityScore,
          status: updates.status || prio.status,
          explanation: prio.explanation
        };
      })
    );
  }, [records, settings]);

  const addPoint = useCallback((newPointData: Omit<CollectionPoint, 'id' | 'predictedFill' | 'overflowRisk' | 'priorityScore' | 'status'>) => {
    const id = `cp-${Date.now().toString().slice(-4)}`;
    const tempPoint: CollectionPoint = {
      ...newPointData,
      id,
      predictedFill: newPointData.fillPercentage,
      overflowRisk: 'Low',
      priorityScore: 50,
      status: 'Normal'
    };
    const pred = calculateDemandPrediction(tempPoint, records, settings);
    const prio = calculatePriorityScore(tempPoint, pred, settings);
    const completePoint: CollectionPoint = {
      ...tempPoint,
      predictedFill: pred.predicted24h,
      overflowRisk: pred.overflowRisk,
      priorityScore: prio.priorityScore,
      status: prio.status,
      explanation: prio.explanation
    };

    setPoints(prev => [completePoint, ...prev]);
  }, [records, settings]);

  const deletePoint = useCallback((id: string) => {
    setPoints(prev => prev.filter(p => p.id !== id));
  }, []);

  const updateVehicle = useCallback((id: string, updates: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(v => (v.id === id ? { ...v, ...updates } : v)));
  }, []);

  const updateCollector = useCallback((id: string, updates: Partial<Collector>) => {
    setCollectors(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
  }, []);

  const acknowledgeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => (a.id === id ? { ...a, status: 'acknowledged' } : a)));
  }, []);

  const resolveAlert = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => (a.id === id ? { ...a, status: 'resolved' } : a)));
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Collection Action by driver
  const markPointCollected = useCallback((pointId: string, vehicleId?: string, notes?: string) => {
    const pt = points.find(p => p.id === pointId);
    if (!pt) return;

    const vId = vehicleId || pt.activeVehicleId || vehicles[0].id;
    const veh = vehicles.find(v => v.id === vId);
    const col = collectors.find(c => c.vehicleId === vId) || collectors[0];

    const collectedKg = Math.round((pt.fillPercentage / 100) * pt.capacity);

    // 1. Update point state
    const updatedPoint: CollectionPoint = {
      ...pt,
      fillPercentage: 5,
      currentWaste: Math.round(pt.capacity * 0.05),
      lastCollection: new Date().toISOString(),
      status: 'Collected',
      predictedFill: 12,
      overflowRisk: 'Low',
      priorityScore: 15,
      explanation: 'Recently serviced. Safe operational volume.'
    };

    setPoints(prev => prev.map(p => (p.id === pointId ? updatedPoint : p)));

    // 2. Add collection record
    const newRecord: CollectionRecord = {
      id: `rec-${Date.now()}`,
      pointId: pt.id,
      pointName: pt.name,
      vehicleId: vId,
      vehicleNumber: veh?.vehicleNumber || 'Municipal Hauler',
      collectorId: col.id,
      collectorName: col.name,
      timestamp: new Date().toISOString(),
      quantityCollected: collectedKg,
      status: 'Completed',
      notes: notes || 'Emptied via automated compactor cycle.'
    };
    setRecords(prev => [newRecord, ...prev]);

    // 3. Update vehicle current load
    setVehicles(prev =>
      prev.map(v => {
        if (v.id !== vId) return v;
        const newLoad = Math.min(v.capacity, v.currentLoad + collectedKg);
        return {
          ...v,
          currentLoad: newLoad,
          status: newLoad >= v.capacity * 0.9 ? 'Near Capacity' : v.status
        };
      })
    );

    // 4. Update route stop progress
    setRoutes(prev =>
      prev.map(r => {
        const stopIndex = r.stops.findIndex(s => s.pointId === pointId);
        if (stopIndex === -1) return r;

        const updatedStops = r.stops.map((s, idx) =>
          idx === stopIndex ? { ...s, status: 'Completed' as const, collectedAt: new Date().toLocaleTimeString() } : s
        );
        const completedCount = updatedStops.filter(s => s.status === 'Completed').length;
        const allDone = completedCount === updatedStops.length;

        return {
          ...r,
          stops: updatedStops,
          completedStopsCount: completedCount,
          status: allDone ? ('Completed' as const) : ('In Progress' as const)
        };
      })
    );

    // 5. Increment collector stats
    setCollectors(prev =>
      prev.map(c => (c.id === col.id ? { ...c, collectionsCompleted: c.collectionsCompleted + 1 } : c))
    );

    // 6. Auto-resolve associated critical alerts
    setAlerts(prev =>
      prev.map(a => (a.pointId === pointId ? { ...a, status: 'resolved' as const } : a))
    );
  }, [points, vehicles, collectors]);

  // Skip point
  const skipPoint = useCallback((pointId: string, vehicleId?: string, reason?: string) => {
    const pt = points.find(p => p.id === pointId);
    if (!pt) return;

    setPoints(prev =>
      prev.map(p => (p.id === pointId ? { ...p, status: 'Missed' } : p))
    );

    setRoutes(prev =>
      prev.map(r => {
        const stopIndex = r.stops.findIndex(s => s.pointId === pointId);
        if (stopIndex === -1) return r;
        const updatedStops = r.stops.map((s, idx) =>
          idx === stopIndex ? { ...s, status: 'Skipped' as const } : s
        );
        return { ...r, stops: updatedStops };
      })
    );

    const newAlert: Alert = {
      id: `alt-${Date.now()}`,
      type: 'missed_collection',
      severity: 'medium',
      pointId: pt.id,
      pointName: pt.name,
      vehicleId,
      message: `Collection missed at ${pt.name}. Reason: ${reason || 'Access blocked or obstacle'}.`,
      recommendedAction: 'Reschedule stop in next dynamic routing window.',
      timestamp: new Date().toISOString(),
      status: 'new'
    };
    setAlerts(prev => [newAlert, ...prev]);
  }, [points]);

  const startRoute = useCallback((routeId: string) => {
    setRoutes(prev =>
      prev.map(r => {
        if (r.id !== routeId) return r;
        return { ...r, status: 'In Progress' };
      })
    );
    const targetRoute = routes.find(r => r.id === routeId);
    if (targetRoute) {
      setVehicles(prev =>
        prev.map(v => (v.id === targetRoute.vehicleId ? { ...v, status: 'En Route' } : v))
      );
    }
  }, [routes]);

  const completeRoute = useCallback((routeId: string) => {
    const targetRoute = routes.find(r => r.id === routeId);
    setRoutes(prev =>
      prev.map(r => (r.id === routeId ? { ...r, status: 'Completed' } : r))
    );
    if (targetRoute) {
      // Empty vehicle at processing depot
      setVehicles(prev =>
        prev.map(v => (v.id === targetRoute.vehicleId ? { ...v, currentLoad: 0, status: 'Available' } : v))
      );
    }
  }, [routes]);

  // Dynamic Rerouting trigger
  const triggerDynamicReroute = useCallback((reason: string, triggerPointId?: string) => {
    const res = optimizeFleetRoutes(points, vehicles, collectors, settings);
    setRoutes(res.routes);
    setUnassignedPoints(res.unassignedPoints);
    setRouteComparison(res.comparison);

    const pt = triggerPointId ? points.find(p => p.id === triggerPointId) : null;
    const msg = pt
      ? `Dynamic Reroute Triggered: Routes re-optimized because ${pt.name} reached ${pt.fillPercentage}% fill. (${reason})`
      : `Dynamic Reroute Triggered: Fleet routes re-optimized. (${reason})`;

    setRerouteNotice(msg);

    const alertItem: Alert = {
      id: `alt-${Date.now()}`,
      type: 'route_delay',
      severity: 'medium',
      pointId: triggerPointId,
      pointName: pt?.name,
      message: msg,
      recommendedAction: 'Review updated vehicle assignments on Route Optimization tab.',
      timestamp: new Date().toISOString(),
      status: 'new'
    };
    setAlerts(prev => [alertItem, ...prev]);
  }, [points, vehicles, collectors, settings]);

  // One-click scenario simulations
  const simulateScenario = useCallback((scenarioType: 'overflow_spike' | 'vehicle_breakdown' | 'emergency_point') => {
    if (scenarioType === 'overflow_spike') {
      const target = points.find(p => p.id === 'cp-02') || points[0];
      const updatedPoint: CollectionPoint = {
        ...target,
        fillPercentage: 98,
        currentWaste: Math.round(target.capacity * 0.98),
        status: 'Overflow Risk',
        overflowRisk: 'Critical',
        priorityScore: 99,
        explanation: 'CRITICAL SPIKE: Rapid sensor surge detected 98% capacity. Immediate reroute required.'
      };
      setPoints(prev => prev.map(p => (p.id === target.id ? updatedPoint : p)));

      // Add immediate alert
      const newAlert: Alert = {
        id: `alt-${Date.now()}`,
        type: 'overflow',
        severity: 'critical',
        pointId: target.id,
        pointName: target.name,
        message: `EMERGENCY: Immediate overflow surge at ${target.name} (98% full).`,
        recommendedAction: 'Triggered automated dynamic rerouting to divert closest vehicle.',
        timestamp: new Date().toISOString(),
        status: 'new'
      };
      setAlerts(prev => [newAlert, ...prev]);

      // Trigger dynamic reroute
      setTimeout(() => {
        triggerDynamicReroute(`Emergency overflow spike at ${target.name}`, target.id);
      }, 300);

    } else if (scenarioType === 'vehicle_breakdown') {
      const targetVehicle = vehicles.find(v => v.id === 'v-02') || vehicles[1];
      setVehicles(prev =>
        prev.map(v => (v.id === targetVehicle.id ? { ...v, status: 'Offline', currentLoad: 0 } : v))
      );

      const newAlert: Alert = {
        id: `alt-${Date.now()}`,
        type: 'vehicle_unavailable',
        severity: 'critical',
        vehicleId: targetVehicle.id,
        vehicleNumber: targetVehicle.vehicleNumber,
        message: `${targetVehicle.vehicleNumber} reported mechanical fault and is taken OFFLINE.`,
        recommendedAction: 'Stops automatically redistributed to V-01 and V-05.',
        timestamp: new Date().toISOString(),
        status: 'new'
      };
      setAlerts(prev => [newAlert, ...prev]);

      setTimeout(() => {
        triggerDynamicReroute(`Vehicle ${targetVehicle.vehicleNumber} unavailable; fleet stops redistributed.`);
      }, 300);

    } else if (scenarioType === 'emergency_point') {
      const target = points.find(p => p.id === 'cp-10') || points[3];
      const updatedPoint: CollectionPoint = {
        ...target,
        fillPercentage: 94,
        wasteType: 'Hazardous',
        status: 'Critical',
        priorityScore: 96,
        explanation: 'HAZARDOUS ALERT: Harbor inspection reported container overflow risk.'
      };
      setPoints(prev => prev.map(p => (p.id === target.id ? updatedPoint : p)));

      const newAlert: Alert = {
        id: `alt-${Date.now()}`,
        type: 'critical_priority',
        severity: 'critical',
        pointId: target.id,
        pointName: target.name,
        message: `High-urgency hazardous waste pickup requested at ${target.name}.`,
        recommendedAction: 'Inserted at priority 1 on active maritime sector route.',
        timestamp: new Date().toISOString(),
        status: 'new'
      };
      setAlerts(prev => [newAlert, ...prev]);

      setTimeout(() => {
        triggerDynamicReroute(`Hazardous waste surge at ${target.name}`, target.id);
      }, 300);
    }
  }, [points, vehicles, triggerDynamicReroute]);

  return (
    <AppContext.Provider
      value={{
        points,
        zones,
        vehicles,
        collectors,
        routes,
        records,
        alerts,
        settings,
        predictions,
        routeComparison,
        unassignedPoints,
        activeTab,
        setActiveTab,
        rerouteNotice,
        dismissRerouteNotice,
        selectedPointId,
        setSelectedPointId,
        selectedVehicleId,
        setSelectedVehicleId,
        activeCollectorVehicleId,
        setActiveCollectorVehicleId,
        runOptimization,
        updatePoint,
        addPoint,
        deletePoint,
        updateVehicle,
        updateCollector,
        acknowledgeAlert,
        resolveAlert,
        updateSettings,
        markPointCollected,
        skipPoint,
        startRoute,
        completeRoute,
        triggerDynamicReroute,
        simulateScenario
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
