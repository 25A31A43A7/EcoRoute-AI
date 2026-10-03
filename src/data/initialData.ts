import {
  CollectionPoint,
  Zone,
  Vehicle,
  Collector,
  CollectionRecord,
  Alert,
  AppSettings
} from '../types';

export const defaultSettings: AppSettings = {
  criticalFillThreshold: 85,
  highPriorityThreshold: 70,
  averageVehicleSpeed: 25, // km/h
  costPerKm: 2.4, // $ / km
  laborCostPerHour: 28.0, // $ / hr
  co2EmissionPerKm: 0.85, // kg CO2 / km
  collectionTimePerStop: 8 // minutes
};

export const initialZones: Zone[] = [
  {
    id: 'zone-1',
    name: 'Central Metro Core',
    code: 'CMC',
    description: 'High-density commercial centers, transit corridors, and municipal squares',
    color: '#3b82f6', // blue
    collectionPointIds: ['cp-01', 'cp-02', 'cp-03', 'cp-04', 'cp-05', 'cp-06']
  },
  {
    id: 'zone-2',
    name: 'Riverside Commercial',
    code: 'RVC',
    description: 'Waterfront dining, retail malls, tourist docks, and hospitality facilities',
    color: '#10b981', // emerald
    collectionPointIds: ['cp-07', 'cp-08', 'cp-09', 'cp-10', 'cp-11']
  },
  {
    id: 'zone-3',
    name: 'Highland Residential',
    code: 'HLR',
    description: 'Medium-density residential complexes, community parks, and schools',
    color: '#8b5cf6', // purple
    collectionPointIds: ['cp-12', 'cp-13', 'cp-14', 'cp-15', 'cp-16']
  },
  {
    id: 'zone-4',
    name: 'North Logistics & Tech',
    code: 'NLT',
    description: 'Industrial warehousing, manufacturing parks, and distribution centers',
    color: '#f59e0b', // amber
    collectionPointIds: ['cp-17', 'cp-18', 'cp-19', 'cp-20']
  }
];

export const initialCollectionPoints: CollectionPoint[] = [
  // Zone 1: Central Metro Core (Lat: 37.7749, Lng: -122.4194)
  {
    id: 'cp-01',
    name: 'Civic Center Plaza Smart Compactor',
    zoneId: 'zone-1',
    latitude: 37.7793,
    longitude: -122.4192,
    wasteType: 'General',
    capacity: 1200,
    currentWaste: 1140,
    fillPercentage: 95,
    lastCollection: new Date(Date.now() - 32 * 3600000).toISOString(),
    nextScheduledCollection: new Date(Date.now() + 2 * 3600000).toISOString(),
    predictedFill: 99,
    overflowRisk: 'Critical',
    priorityScore: 94,
    status: 'Overflow Risk',
    explanation: 'Priority is Critical (94/100) because current fill is 95%, predicted demand reaches 99% in 24h, and time since last collection is 32h.'
  },
  {
    id: 'cp-02',
    name: 'Market St & 4th Transit Hub',
    zoneId: 'zone-1',
    latitude: 37.7858,
    longitude: -122.4065,
    wasteType: 'Recyclable',
    capacity: 1000,
    currentWaste: 880,
    fillPercentage: 88,
    lastCollection: new Date(Date.now() - 24 * 3600000).toISOString(),
    nextScheduledCollection: new Date(Date.now() + 3 * 3600000).toISOString(),
    predictedFill: 96,
    overflowRisk: 'Critical',
    priorityScore: 89,
    status: 'Critical',
    explanation: 'Priority is Critical (89/100) as fill level is 88%, predicted to exceed capacity within 5 hours.'
  },
  {
    id: 'cp-03',
    name: 'Financial Tower East Drop',
    zoneId: 'zone-1',
    latitude: 37.7915,
    longitude: -122.3998,
    wasteType: 'General',
    capacity: 1500,
    currentWaste: 1080,
    fillPercentage: 72,
    lastCollection: new Date(Date.now() - 16 * 3600000).toISOString(),
    nextScheduledCollection: new Date(Date.now() + 6 * 3600000).toISOString(),
    predictedFill: 84,
    overflowRisk: 'High',
    priorityScore: 73,
    status: 'High Priority',
    explanation: 'Priority is High (73/100) as fill level is 72%, approaching critical threshold in approx. 10h.'
  },
  {
    id: 'cp-04',
    name: 'Union Square South EcoStation',
    zoneId: 'zone-1',
    latitude: 37.7879,
    longitude: -122.4074,
    wasteType: 'Organic',
    capacity: 800,
    currentWaste: 640,
    fillPercentage: 80,
    lastCollection: new Date(Date.now() - 20 * 3600000).toISOString(),
    nextScheduledCollection: new Date(Date.now() + 4 * 3600000).toISOString(),
    predictedFill: 92,
    overflowRisk: 'High',
    priorityScore: 82,
    status: 'High Priority',
    explanation: 'Priority is High (82/100) due to 80% organic waste fill and accelerated decomposition timeline.'
  },
  {
    id: 'cp-05',
    name: 'Montgomery Metro Concourse',
    zoneId: 'zone-1',
    latitude: 37.7891,
    longitude: -122.4014,
    wasteType: 'Recyclable',
    capacity: 900,
    currentWaste: 360,
    fillPercentage: 40,
    lastCollection: new Date(Date.now() - 8 * 3600000).toISOString(),
    nextScheduledCollection: new Date(Date.now() + 18 * 3600000).toISOString(),
    predictedFill: 55,
    overflowRisk: 'Low',
    priorityScore: 42,
    status: 'Normal',
    explanation: 'Low priority (42/100) — current fill is at a stable 40% with no immediate overflow risk.'
  },
  {
    id: 'cp-06',
    name: 'Powell St Cable Car Depot',
    zoneId: 'zone-1',
    latitude: 37.7842,
    longitude: -122.4079,
    wasteType: 'General',
    capacity: 1100,
    currentWaste: 660,
    fillPercentage: 60,
    lastCollection: new Date(Date.now() - 14 * 3600000).toISOString(),
    nextScheduledCollection: new Date(Date.now() + 10 * 3600000).toISOString(),
    predictedFill: 74,
    overflowRisk: 'Medium',
    priorityScore: 58,
    status: 'Attention',
    explanation: 'Moderate priority (58/100) — bin is 60% full with steady tourist foot-traffic accumulation.'
  },

  // Zone 2: Riverside Commercial
  {
    id: 'cp-07',
    name: 'Ferry Building Farmers Market Hub',
    zoneId: 'zone-2',
    latitude: 37.7955,
    longitude: -122.3937,
    wasteType: 'Organic',
    capacity: 1400,
    currentWaste: 1288,
    fillPercentage: 92,
    lastCollection: new Date(Date.now() - 28 * 3600000).toISOString(),
    nextScheduledCollection: new Date(Date.now() + 2 * 3600000).toISOString(),
    predictedFill: 98,
    overflowRisk: 'Critical',
    priorityScore: 93,
    status: 'Critical',
    explanation: 'Priority is Critical (93/100) because current fill is 92%, high restaurant food turnover.'
  },
  {
    id: 'cp-08',
    name: 'Pier 14 Boardwalk SmartBin',
    zoneId: 'zone-2',
    latitude: 37.7936,
    longitude: -122.3904,
    wasteType: 'Recyclable',
    capacity: 850,
    currentWaste: 697,
    fillPercentage: 82,
    lastCollection: new Date(Date.now() - 22 * 3600000).toISOString(),
    nextScheduledCollection: new Date(Date.now() + 5 * 3600000).toISOString(),
    predictedFill: 91,
    overflowRisk: 'High',
    priorityScore: 79,
    status: 'High Priority',
    explanation: 'Priority is High (79/100) as fill level is 82%, near bayside pedestrian trail.'
  },
  {
    id: 'cp-09',
    name: 'Embarcadero Center Plaza',
    zoneId: 'zone-2',
    latitude: 37.7951,
    longitude: -122.3982,
    wasteType: 'General',
    capacity: 1300,
    currentWaste: 455,
    fillPercentage: 35,
    lastCollection: new Date(Date.now() - 6 * 3600000).toISOString(),
    nextScheduledCollection: new Date(Date.now() + 20 * 3600000).toISOString(),
    predictedFill: 48,
    overflowRisk: 'Low',
    priorityScore: 36,
    status: 'Normal',
    explanation: 'Low priority (36/100) — current fill is at a stable 35% with ample remaining volume.'
  },
  {
    id: 'cp-10',
    name: 'South Beach Harbor Marina',
    zoneId: 'zone-2',
    latitude: 37.7816,
    longitude: -122.3878,
    wasteType: 'Hazardous',
    capacity: 600,
    currentWaste: 450,
    fillPercentage: 75,
    lastCollection: new Date(Date.now() - 40 * 3600000).toISOString(),
    nextScheduledCollection: new Date(Date.now() + 8 * 3600000).toISOString(),
    predictedFill: 83,
    overflowRisk: 'High',
    priorityScore: 81,
    status: 'High Priority',
    explanation: 'High priority (81/100) due to marine fuel/oil residue risk and 75% fill level.'
  },
  {
    id: 'cp-11',
    name: 'Oracle Park Waterfront Promenade',
    zoneId: 'zone-2',
    latitude: 37.7786,
    longitude: -122.3893,
    wasteType: 'General',
    capacity: 1500,
    currentWaste: 825,
    fillPercentage: 55,
    lastCollection: new Date(Date.now() - 15 * 3600000).toISOString(),
    nextScheduledCollection: new Date(Date.now() + 12 * 3600000).toISOString(),
    predictedFill: 70,
    overflowRisk: 'Medium',
    priorityScore: 56,
    status: 'Attention',
    explanation: 'Moderate priority (56/100) — bin is 55% full. Pre-game scheduled pickup suggested.'
  },

  // Zone 3: Highland Residential
  {
    id: 'cp-12',
    name: 'Twin Peaks Scenic Overlook Bin',
    zoneId: 'zone-3',
    latitude: 37.7544,
    longitude: -122.4477,
    wasteType: 'General',
    capacity: 1000,
    currentWaste: 890,
    fillPercentage: 89,
    lastCollection: new Date(Date.now() - 36 * 3600000).toISOString(),
    nextScheduledCollection: new Date(Date.now() + 3 * 3600000).toISOString(),
    predictedFill: 97,
    overflowRisk: 'Critical',
    priorityScore: 91,
    status: 'Critical',
    explanation: 'Priority is Critical (91/100) because current fill is 89% and high weekend tourism demand.'
  },
  {
    id: 'cp-13',
    name: 'Mission Dolores Park Community Hub',
    zoneId: 'zone-3',
    latitude: 37.7596,
    longitude: -122.4269,
    wasteType: 'Recyclable',
    capacity: 1600,
    currentWaste: 1200,
    fillPercentage: 75,
    lastCollection: new Date(Date.now() - 18 * 3600000).toISOString(),
    nextScheduledCollection: new Date(Date.now() + 6 * 3600000).toISOString(),
    predictedFill: 87,
    overflowRisk: 'High',
    priorityScore: 78,
    status: 'High Priority',
    explanation: 'Priority is High (78/100) — community park recycler with rapid beverage can accumulation.'
  },
  {
    id: 'cp-14',
    name: 'Castro Community Center Station',
    zoneId: 'zone-3',
    latitude: 37.7609,
    longitude: -122.435,
    wasteType: 'Organic',
    capacity: 800,
    currentWaste: 240,
    fillPercentage: 30,
    lastCollection: new Date(Date.now() - 5 * 3600000).toISOString(),
    nextScheduledCollection: new Date(Date.now() + 24 * 3600000).toISOString(),
    predictedFill: 42,
    overflowRisk: 'Low',
    priorityScore: 32,
    status: 'Normal',
    explanation: 'Low priority (32/100) — freshly cleared 5 hours ago.'
  },
  {
    id: 'cp-15',
    name: 'Noe Valley Town Square',
    zoneId: 'zone-3',
    latitude: 37.7516,
    longitude: -122.4312,
    wasteType: 'General',
    capacity: 900,
    currentWaste: 540,
    fillPercentage: 60,
    lastCollection: new Date(Date.now() - 12 * 3600000).toISOString(),
    nextScheduledCollection: new Date(Date.now() + 14 * 3600000).toISOString(),
    predictedFill: 72,
    overflowRisk: 'Medium',
    priorityScore: 57,
    status: 'Attention',
    explanation: 'Moderate priority (57/100) — steady residential foot traffic, normal fill.'
  },
  {
    id: 'cp-16',
    name: 'Glen Canyon Park Nature EcoDrop',
    zoneId: 'zone-3',
    latitude: 37.7397,
    longitude: -122.4411,
    wasteType: 'Organic',
    capacity: 700,
    currentWaste: 175,
    fillPercentage: 25,
    lastCollection: new Date(Date.now() - 4 * 3600000).toISOString(),
    nextScheduledCollection: new Date(Date.now() + 30 * 3600000).toISOString(),
    predictedFill: 36,
    overflowRisk: 'Low',
    priorityScore: 28,
    status: 'Normal',
    explanation: 'Low priority (28/100) — adequate headroom, minimal accumulation.'
  },

  // Zone 4: North Logistics & Tech Park
  {
    id: 'cp-17',
    name: 'Mission Bay BioTech Campus Dock',
    zoneId: 'zone-4',
    latitude: 37.7682,
    longitude: -122.3929,
    wasteType: 'Electronic',
    capacity: 1100,
    currentWaste: 935,
    fillPercentage: 85,
    lastCollection: new Date(Date.now() - 48 * 3600000).toISOString(),
    nextScheduledCollection: new Date(Date.now() + 1 * 3600000).toISOString(),
    predictedFill: 94,
    overflowRisk: 'Critical',
    priorityScore: 90,
    status: 'Critical',
    explanation: 'Priority is Critical (90/100) — e-waste facility at 85% capacity unserviced for 48h.'
  },
  {
    id: 'cp-18',
    name: 'Dogpatch Logistics Warehouse Gate 3',
    zoneId: 'zone-4',
    latitude: 37.7588,
    longitude: -122.3882,
    wasteType: 'Recyclable',
    capacity: 2000,
    currentWaste: 1560,
    fillPercentage: 78,
    lastCollection: new Date(Date.now() - 20 * 3600000).toISOString(),
    nextScheduledCollection: new Date(Date.now() + 4 * 3600000).toISOString(),
    predictedFill: 89,
    overflowRisk: 'High',
    priorityScore: 80,
    status: 'High Priority',
    explanation: 'Priority is High (80/100) — corrugated packaging accumulation at freight depot.'
  },
  {
    id: 'cp-19',
    name: 'Potrero Hill Distribution Center',
    zoneId: 'zone-4',
    latitude: 37.7552,
    longitude: -122.4011,
    wasteType: 'General',
    capacity: 1800,
    currentWaste: 1170,
    fillPercentage: 65,
    lastCollection: new Date(Date.now() - 17 * 3600000).toISOString(),
    nextScheduledCollection: new Date(Date.now() + 9 * 3600000).toISOString(),
    predictedFill: 79,
    overflowRisk: 'Medium',
    priorityScore: 66,
    status: 'Attention',
    explanation: 'Moderate priority (66/100) — commercial dock with steady waste generation.'
  },
  {
    id: 'cp-20',
    name: 'Pier 70 Maritime Fabrication Yard',
    zoneId: 'zone-4',
    latitude: 37.7599,
    longitude: -122.3831,
    wasteType: 'Hazardous',
    capacity: 800,
    currentWaste: 200,
    fillPercentage: 25,
    lastCollection: new Date(Date.now() - 10 * 3600000).toISOString(),
    nextScheduledCollection: new Date(Date.now() + 36 * 3600000).toISOString(),
    predictedFill: 35,
    overflowRisk: 'Low',
    priorityScore: 30,
    status: 'Normal',
    explanation: 'Low priority (30/100) — industrial containers inspected and low hazard level.'
  }
];

export const initialVehicles: Vehicle[] = [
  {
    id: 'v-01',
    vehicleNumber: 'V-01 (EcoMaster)',
    type: 'Compactor Truck (Bio-CNG)',
    capacity: 5000,
    currentLoad: 1200,
    latitude: 37.7812,
    longitude: -122.4145,
    zoneId: 'zone-1',
    collectorId: 'col-01',
    routeId: null,
    status: 'Available'
  },
  {
    id: 'v-02',
    vehicleNumber: 'V-02 (VoltCarrier)',
    type: 'Electric Heavy Van (Zero Emission)',
    capacity: 3500,
    currentLoad: 800,
    latitude: 37.7928,
    longitude: -122.3951,
    zoneId: 'zone-2',
    collectorId: 'col-02',
    routeId: null,
    status: 'Available'
  },
  {
    id: 'v-03',
    vehicleNumber: 'V-03 (HighlandHaul)',
    type: 'Side Loader Truck',
    capacity: 4500,
    currentLoad: 600,
    latitude: 37.7582,
    longitude: -122.4318,
    zoneId: 'zone-3',
    collectorId: 'col-03',
    routeId: null,
    status: 'Available'
  },
  {
    id: 'v-04',
    vehicleNumber: 'V-04 (TechFreight)',
    type: 'Heavy Automated Compactor',
    capacity: 6000,
    currentLoad: 1500,
    latitude: 37.7631,
    longitude: -122.3912,
    zoneId: 'zone-4',
    collectorId: 'col-04',
    routeId: null,
    status: 'Available'
  },
  {
    id: 'v-05',
    vehicleNumber: 'V-05 (CityVolt-Aux)',
    type: 'Electric Rapid Hauler',
    capacity: 3000,
    currentLoad: 0,
    latitude: 37.7845,
    longitude: -122.4089,
    zoneId: 'zone-1',
    collectorId: 'col-05',
    routeId: null,
    status: 'Available'
  }
];

export const initialCollectors: Collector[] = [
  {
    id: 'col-01',
    name: 'Marcus Vance',
    phone: '+1 (555) 392-1084',
    vehicleId: 'v-01',
    zoneId: 'zone-1',
    routeId: null,
    status: 'Available',
    collectionsCompleted: 142
  },
  {
    id: 'col-02',
    name: 'Elena Rodriguez',
    phone: '+1 (555) 481-9201',
    vehicleId: 'v-02',
    zoneId: 'zone-2',
    routeId: null,
    status: 'Available',
    collectionsCompleted: 198
  },
  {
    id: 'col-03',
    name: 'David Chen',
    phone: '+1 (555) 219-4509',
    vehicleId: 'v-03',
    zoneId: 'zone-3',
    routeId: null,
    status: 'Available',
    collectionsCompleted: 167
  },
  {
    id: 'col-04',
    name: 'Amina Al-Mansoor',
    phone: '+1 (555) 762-3390',
    vehicleId: 'v-04',
    zoneId: 'zone-4',
    routeId: null,
    status: 'Available',
    collectionsCompleted: 215
  },
  {
    id: 'col-05',
    name: 'Lucas Silva',
    phone: '+1 (555) 884-1234',
    vehicleId: 'v-05',
    zoneId: 'zone-1',
    routeId: null,
    status: 'Available',
    collectionsCompleted: 88
  }
];

export const initialHistoricalRecords: CollectionRecord[] = [
  {
    id: 'rec-101',
    pointId: 'cp-01',
    pointName: 'Civic Center Plaza Smart Compactor',
    vehicleId: 'v-01',
    vehicleNumber: 'V-01 (EcoMaster)',
    collectorId: 'col-01',
    collectorName: 'Marcus Vance',
    timestamp: new Date(Date.now() - 32 * 3600000).toISOString(),
    quantityCollected: 1120,
    status: 'Completed',
    notes: 'Routine morning clearing. Heavy packaging waste.'
  },
  {
    id: 'rec-102',
    pointId: 'cp-07',
    pointName: 'Ferry Building Farmers Market Hub',
    vehicleId: 'v-02',
    vehicleNumber: 'V-02 (VoltCarrier)',
    collectorId: 'col-02',
    collectorName: 'Elena Rodriguez',
    timestamp: new Date(Date.now() - 28 * 3600000).toISOString(),
    quantityCollected: 1250,
    status: 'Completed',
    notes: 'Food scraps and compost collected.'
  },
  {
    id: 'rec-103',
    pointId: 'cp-12',
    pointName: 'Twin Peaks Scenic Overlook Bin',
    vehicleId: 'v-03',
    vehicleNumber: 'V-03 (HighlandHaul)',
    collectorId: 'col-03',
    collectorName: 'David Chen',
    timestamp: new Date(Date.now() - 36 * 3600000).toISOString(),
    quantityCollected: 940,
    status: 'Completed',
    notes: 'Cleared high-fill tourist bin.'
  },
  {
    id: 'rec-104',
    pointId: 'cp-02',
    pointName: 'Market St & 4th Transit Hub',
    vehicleId: 'v-01',
    vehicleNumber: 'V-01 (EcoMaster)',
    collectorId: 'col-01',
    collectorName: 'Marcus Vance',
    timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
    quantityCollected: 890,
    status: 'Completed'
  },
  {
    id: 'rec-105',
    pointId: 'cp-17',
    pointName: 'Mission Bay BioTech Campus Dock',
    vehicleId: 'v-04',
    vehicleNumber: 'V-04 (TechFreight)',
    collectorId: 'col-04',
    collectorName: 'Amina Al-Mansoor',
    timestamp: new Date(Date.now() - 48 * 3600000).toISOString(),
    quantityCollected: 1040,
    status: 'Completed'
  },
  {
    id: 'rec-106',
    pointId: 'cp-04',
    pointName: 'Union Square South EcoStation',
    vehicleId: 'v-05',
    vehicleNumber: 'V-05 (CityVolt-Aux)',
    collectorId: 'col-05',
    collectorName: 'Lucas Silva',
    timestamp: new Date(Date.now() - 20 * 3600000).toISOString(),
    quantityCollected: 610,
    status: 'Completed'
  },
  {
    id: 'rec-107',
    pointId: 'cp-18',
    pointName: 'Dogpatch Logistics Warehouse Gate 3',
    vehicleId: 'v-04',
    vehicleNumber: 'V-04 (TechFreight)',
    collectorId: 'col-04',
    collectorName: 'Amina Al-Mansoor',
    timestamp: new Date(Date.now() - 20 * 3600000).toISOString(),
    quantityCollected: 1480,
    status: 'Completed'
  }
];

export const initialAlerts: Alert[] = [
  {
    id: 'alt-01',
    type: 'critical_priority',
    severity: 'critical',
    pointId: 'cp-01',
    pointName: 'Civic Center Plaza Smart Compactor',
    message: 'Civic Center Plaza Compactor reached 95% critical threshold.',
    recommendedAction: 'Dispatch immediate collection vehicle to prevent pedestrian waste spillover.',
    timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
    status: 'new'
  },
  {
    id: 'alt-02',
    type: 'predicted_overflow',
    severity: 'high',
    pointId: 'cp-07',
    pointName: 'Ferry Building Farmers Market Hub',
    message: 'High overflow risk — estimated to reach critical level within 2 hours.',
    recommendedAction: 'Include in next active route batch before evening market peak.',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    status: 'new'
  },
  {
    id: 'alt-03',
    type: 'critical_priority',
    severity: 'critical',
    pointId: 'cp-12',
    pointName: 'Twin Peaks Scenic Overlook Bin',
    message: 'Twin Peaks bin reached 89% fill with elevated tourist accumulation.',
    recommendedAction: 'Assign HighlandHaul (V-03) on priority circuit.',
    timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
    status: 'acknowledged'
  },
  {
    id: 'alt-04',
    type: 'capacity_warning',
    severity: 'medium',
    vehicleId: 'v-04',
    vehicleNumber: 'V-04 (TechFreight)',
    message: 'Vehicle load is currently at 1,500 kg (25% capacity).',
    recommendedAction: 'Route optimizer will allocate up to 4,500 kg additional payload.',
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
    status: 'acknowledged'
  }
];
