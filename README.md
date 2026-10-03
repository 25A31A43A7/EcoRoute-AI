# EcoRoute AI
> **Predict. Prioritize. Optimize. Track.**  
> *AI-Powered Waste Collection Optimization Platform*

EcoRoute AI is a full-stack, enterprise-grade smart-city operations platform designed to solve the municipal waste collection optimization problem through deterministic, explainable AI-assisted heuristics and real-time fleet dispatch.

---

## 🌟 Key Features

1. **Operations Dashboard**:
   - High-level KPIs: Total points, critical overflow nodes, active vs. available vehicles, fleet utilization gauge, distance saved, and estimated greenhouse gas avoided.
   - Live interactive geospatial map overview, urgent attention list, and real-time collection logs.

2. **Collection Point Management**:
   - Centralized management of 20 realistic collection points across 4 urban zones (*Central Metro Core*, *Riverside Commercial*, *Highland Residential*, *North Logistics & Tech*).
   - Real-time sensor telemetry, fill levels (0-100%), waste types (*General*, *Recyclable*, *Organic*, *Hazardous*, *Electronic*), and coordinates.
   - Full CRUD, search, zone/status/priority filters, and manual fill simulation sliders.

3. **Explainable AI Engines (Free & Lightweight)**:
   - **Demand Prediction Engine**: 6h, 12h, 24h, and 48h fill forecasts with confidence ratings and time-to-critical hours.
   - **Priority Scoring Engine (0-100)**: Transparent weighted heuristic evaluating current fill (35%), 24h trajectory (25%), overflow risk (20%), idle time (15%), and waste sensitivity (5%).
   - **Decision Explainability**: Natural language justifications displaying the exact numbers that produced each priority or route choice.

4. **Multi-Vehicle Route Optimization**:
   - Priority-first, capacity-constrained dispatch algorithm utilizing 2-opt nearest-neighbor clustering.
   - Real Haversine estimated distance and travel time calculations (no paid Google Maps API needed).
   - Capacity constraint safeguarding: Never overloads a vehicle; flags unassigned points with *"Unassigned — insufficient vehicle capacity"*.
   - Route Performance Benchmark: Compares standard unclustered FIFO routing against EcoRoute AI optimization (distance saved, time saved, cost saved, CO₂ avoided).

5. **Dynamic Rerouting Simulation**:
   - Interactive one-click triggers: *Bin Overflow Surge*, *Vehicle Mechanical Breakdown*, and *Emergency Hazardous Spill*.
   - Recalculates fleet corridors dynamically and displays high-visibility alert banners.

6. **Collector Mobile Interface (Responsive)**:
   - In-cab operator interface for drivers: vehicle switcher, live payload gauge, route progress, next-stop hero card with arrival ETA.
   - Interactive actions: *Start Route*, *Mark Bin Collected & Compact*, *Report Obstacle / Skip Stop*, and *Complete Route & Offload*.
   - Updates all shared application state instantaneously (points, vehicles, alerts, analytics).

7. **What-If Fleet Simulator (Sandbox)**:
   - Safe simulation environment to model changes to fleet size, vehicle capacity multipliers, priority thresholds, speed assumptions, and fuel costs.
   - Side-by-side benchmark table with variance metrics, plus an *Apply Scenario to Operations* button.

8. **Operations Analytics & Sustainability**:
   - Time filters: *Today*, *7 Days*, *30 Days*, *3 Months*.
   - ISO 14064 factor model for CO₂ avoided, diesel saved, off-road kilometers avoided, and deadhead trips prevented.
   - Cost analysis: Labor rates, per-kilometer costs, and net dollar savings.
   - Weekly volume & clearance SVG trend visualizations.

9. **Admin Dispatch Settings**:
   - Configurable critical thresholds, average vehicle speeds, cost per km, labor rates, and environmental assumptions.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- NPM

### Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### Production Build
```bash
npm run build
npm run preview
```

---

## 🛡️ Free-Tier & Quota-Friendly Architecture
EcoRoute AI was engineered strictly under the **Antigravity Free-Account Rule**:
- **$0 External API Costs**: Operates 100% locally with free OpenStreetMap tiles.
- **Zero Heavy ML Frameworks**: Deterministic, explainable statistical forecasting algorithms without TensorFlow/PyTorch bloat.
- **Centralized Reactive State**: One single source of truth across all modules with zero duplicate data.
