export type WasteType = 'General' | 'Recyclable' | 'Organic' | 'Hazardous' | 'Electronic';

export type PointStatus =
  | 'Normal'
  | 'Attention'
  | 'High Priority'
  | 'Critical'
  | 'Overflow Risk'
  | 'Collected'
  | 'Missed';

export type OverflowRisk = 'Low' | 'Medium' | 'High' | 'Critical';

export type VehicleStatus =
  | 'Available'
  | 'Assigned'
  | 'En Route'
  | 'Collecting'
  | 'Near Capacity'
  | 'Maintenance'
  | 'Offline';

export type CollectorStatus =
  | 'Available'
  | 'Assigned'
  | 'En Route'
  | 'Collecting'
  | 'Offline';

export type RouteStatus =
  | 'Planned'
  | 'Assigned'
  | 'Started'
  | 'In Progress'
  | 'Completed'
  | 'Delayed'
  | 'Cancelled';

export type AlertType =
  | 'predicted_overflow'
  | 'overflow'
  | 'critical_priority'
  | 'missed_collection'
  | 'capacity_warning'
  | 'vehicle_unavailable'
  | 'route_delay'
  | 'high_demand_zone';

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export type AlertStatus = 'new' | 'acknowledged' | 'resolved';

export interface CollectionPoint {
  id: string;
  name: string;
  zoneId: string;
  latitude: number;
  longitude: number;
  wasteType: WasteType;
  capacity: number; // in kg
  currentWaste: number; // in kg
  fillPercentage: number; // 0 - 100%
  lastCollection: string; // ISO string or human string
  nextScheduledCollection: string;
  predictedFill: number; // 24h prediction %
  overflowRisk: OverflowRisk;
  priorityScore: number; // 0 - 100
  status: PointStatus;
  explanation?: string;
  activeRouteId?: string | null;
  activeVehicleId?: string | null;
}

export interface Zone {
  id: string;
  name: string;
  code: string;
  description: string;
  color: string;
  collectionPointIds: string[];
}

export interface Vehicle {
  id: string;
  vehicleNumber: string;
  type: string;
  capacity: number; // in kg
  currentLoad: number; // in kg
  latitude: number;
  longitude: number;
  zoneId: string;
  collectorId: string | null;
  routeId: string | null;
  status: VehicleStatus;
}

export interface Collector {
  id: string;
  name: string;
  phone: string;
  vehicleId: string | null;
  zoneId: string;
  routeId: string | null;
  status: CollectorStatus;
  collectionsCompleted: number;
}

export interface RouteStop {
  pointId: string;
  stopSequence: number;
  estimatedArrivalMin: number;
  plannedWasteKg: number;
  status: 'Pending' | 'Completed' | 'Skipped';
  collectedAt?: string;
}

export interface Route {
  id: string;
  vehicleId: string;
  collectorId: string | null;
  stopIds: string[];
  stops: RouteStop[];
  distance: number; // in km (estimated)
  estimatedDuration: number; // in minutes
  estimatedWaste: number; // in kg
  utilization: number; // % (estimatedWaste / vehicle capacity * 100)
  priorityCoverage: number; // % of stops that were High/Critical
  explanation: string;
  status: RouteStatus;
  completedStopsCount: number;
}

export interface CollectionRecord {
  id: string;
  pointId: string;
  pointName: string;
  vehicleId: string;
  vehicleNumber: string;
  collectorId: string;
  collectorName: string;
  timestamp: string;
  quantityCollected: number; // in kg
  status: 'Completed' | 'Missed' | 'Skipped';
  notes?: string;
}

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  pointId?: string;
  pointName?: string;
  vehicleId?: string;
  vehicleNumber?: string;
  message: string;
  recommendedAction: string;
  timestamp: string;
  status: AlertStatus;
}

export interface Prediction {
  pointId: string;
  currentFill: number;
  predicted6h: number;
  predicted12h: number;
  predicted24h: number;
  predicted48h: number;
  confidence: number; // %
  estimatedTimeToCritical: number; // hours (or 0 if already critical)
  reasoning: string;
  overflowRisk: OverflowRisk;
}

export interface AppSettings {
  criticalFillThreshold: number; // e.g. 85%
  highPriorityThreshold: number; // e.g. 70%
  averageVehicleSpeed: number; // km/h, e.g. 25
  costPerKm: number; // e.g. $2.40
  laborCostPerHour: number; // e.g. $28.00
  co2EmissionPerKm: number; // kg CO2 per km, e.g. 0.85
  collectionTimePerStop: number; // minutes per stop, e.g. 8
}

export interface RouteComparison {
  standardRoute: {
    totalDistance: number;
    totalDuration: number;
    totalStops: number;
    avgUtilization: number;
    estimatedCost: number;
  };
  optimizedRoute: {
    totalDistance: number;
    totalDuration: number;
    totalStops: number;
    avgUtilization: number;
    estimatedCost: number;
  };
  savings: {
    distanceSavedKm: number;
    distanceSavedPercent: number;
    timeSavedMinutes: number;
    timeSavedPercent: number;
    costSavedDollars: number;
    co2AvoidedKg: number;
    fuelSavedLiters: number;
    tripsPrevented: number;
  };
  rationale: string;
}

export interface SimulationParameters {
  vehicleCount: number;
  capacityMultiplier: number; // 0.8 to 1.5
  priorityThreshold: number; // 50 to 90%
  selectedZoneId: string | 'ALL';
  vehicleSpeed: number;
  fuelCostPerKm: number;
}

export interface SimulationResult {
  current: {
    vehiclesUsed: number;
    totalDistance: number;
    totalDuration: number;
    totalStops: number;
    totalWasteCollected: number;
    unassignedPoints: number;
    avgUtilization: number;
    estimatedCost: number;
    co2Emissions: number;
  };
  simulated: {
    vehiclesUsed: number;
    totalDistance: number;
    totalDuration: number;
    totalStops: number;
    totalWasteCollected: number;
    unassignedPoints: number;
    avgUtilization: number;
    estimatedCost: number;
    co2Emissions: number;
  };
  delta: {
    distanceDiffKm: number;
    timeDiffMinutes: number;
    costDiffDollars: number;
    co2DiffKg: number;
    capacityCoveragePercent: number;
  };
}
