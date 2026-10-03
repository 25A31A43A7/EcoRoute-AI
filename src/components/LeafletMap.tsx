import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { CollectionPoint, Vehicle, Route, Zone } from '../types';

interface LeafletMapProps {
  points: CollectionPoint[];
  vehicles: Vehicle[];
  routes: Route[];
  zones: Zone[];
  selectedPointId?: string | null;
  onSelectPoint?: (point: CollectionPoint) => void;
  onQuickCollect?: (pointId: string) => void;
  height?: string;
  showRoutes?: boolean;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  points,
  vehicles,
  routes,
  zones,
  selectedPointId,
  onSelectPoint,
  onQuickCollect,
  height = '500px',
  showRoutes = true
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default center around Metro area
      const map = L.map(mapContainerRef.current, {
        center: [37.7749, -122.4194],
        zoom: 13,
        zoomControl: true
      });

      // Free OpenStreetMap Tile Layer (Zero API keys needed, 100% free)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers and Routes whenever data changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    const routeColorPalette = ['#2563eb', '#16a34a', '#9333ea', '#ea580c', '#0284c7'];

    // 1. Draw Route Polylines
    if (showRoutes) {
      routes.forEach((route, rIdx) => {
        const vehicle = vehicles.find(v => v.id === route.vehicleId);
        if (!vehicle) return;

        const pathCoords: [number, number][] = [[vehicle.latitude, vehicle.longitude]];
        
        route.stopIds.forEach(stopId => {
          const pt = points.find(p => p.id === stopId);
          if (pt) {
            pathCoords.push([pt.latitude, pt.longitude]);
          }
        });

        if (pathCoords.length > 1) {
          const routeColor = routeColorPalette[rIdx % routeColorPalette.length];
          const polyline = L.polyline(pathCoords, {
            color: routeColor,
            weight: 4,
            opacity: 0.85,
            dashArray: route.status === 'Completed' ? undefined : '6, 8',
            smoothFactor: 1
          }).addTo(layerGroup);

          polyline.bindTooltip(
            `<b>${route.id}</b> (${vehicle.vehicleNumber})<br/>Stops: ${route.stopIds.length} | Dist: ${route.distance} km`,
            { sticky: true }
          );
        }
      });
    }

    // 2. Add Collection Points
    points.forEach(point => {
      const isSelected = point.id === selectedPointId;
      const zone = zones.find(z => z.id === point.zoneId);

      // Determine marker color based on status / fill
      let bgColor = '#10b981'; // Green (Normal)
      let ringColor = 'border-emerald-500';
      let pulseAnim = '';

      if (point.status === 'Overflow Risk' || point.status === 'Critical') {
        bgColor = '#ef4444'; // Red
        ringColor = 'border-red-600 ring-4 ring-red-200';
        pulseAnim = 'animate-pulse';
      } else if (point.status === 'High Priority') {
        bgColor = '#f97316'; // Orange
        ringColor = 'border-orange-500 ring-2 ring-orange-200';
      } else if (point.status === 'Attention') {
        bgColor = '#eab308'; // Yellow
        ringColor = 'border-yellow-500';
      } else if (point.status === 'Collected') {
        bgColor = '#3b82f6'; // Blue
        ringColor = 'border-blue-500';
      }

      const iconHtml = `
        <div class="relative cursor-pointer transition-transform hover:scale-110 ${pulseAnim}">
          <div style="background-color: ${bgColor};" class="w-8 h-8 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-xs ${isSelected ? 'ring-4 ring-blue-600 scale-125' : ''}">
            ${point.fillPercentage}%
          </div>
          ${point.priorityScore >= 80 ? '<span class="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full border border-white"></span>' : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-bin-marker',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([point.latitude, point.longitude], { icon: customIcon }).addTo(layerGroup);

      // Popup Content
      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 text-slate-800 text-xs min-w-[240px]';
      popupContent.innerHTML = `
        <div class="border-b border-slate-200 pb-1 mb-2">
          <div class="flex items-center justify-between gap-2">
            <span class="font-bold text-sm text-slate-900 leading-tight">${point.name}</span>
            <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold ${
              point.status === 'Critical' || point.status === 'Overflow Risk' ? 'bg-red-100 text-red-700' :
              point.status === 'High Priority' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'
            }">${point.status}</span>
          </div>
          <div class="text-[11px] text-slate-500 mt-0.5">Zone: <b>${zone?.name || point.zoneId}</b> | Waste: <b>${point.wasteType}</b></div>
        </div>

        <div class="grid grid-cols-2 gap-1.5 mb-2 bg-slate-50 p-1.5 rounded border border-slate-100">
          <div>Current Fill: <b class="text-slate-900">${point.fillPercentage}%</b> (${point.currentWaste}/${point.capacity} kg)</div>
          <div>Priority Score: <b class="${point.priorityScore >= 70 ? 'text-red-600 font-bold' : 'text-slate-900'}">${point.priorityScore}/100</b></div>
          <div>24h Prediction: <b class="text-slate-900">${point.predictedFill}%</b></div>
          <div>Overflow Risk: <b class="${point.overflowRisk === 'Critical' ? 'text-red-600 font-bold' : 'text-slate-700'}">${point.overflowRisk}</b></div>
        </div>

        <div class="text-[11px] text-slate-600 italic mb-2 leading-relaxed bg-blue-50/50 p-1.5 rounded border border-blue-100">
          💡 ${point.explanation || 'Optimal baseline schedule.'}
        </div>

        <div class="flex items-center gap-1.5 pt-1">
          <button id="btn-collect-${point.id}" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-1 px-2 rounded text-[11px] shadow-sm transition">
            Mark Collected
          </button>
          <button id="btn-inspect-${point.id}" class="bg-slate-800 hover:bg-slate-900 text-white font-medium py-1 px-2 rounded text-[11px] transition">
            Inspect
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const collectBtn = document.getElementById(`btn-collect-${point.id}`);
        if (collectBtn) {
          collectBtn.onclick = (e) => {
            e.stopPropagation();
            if (onQuickCollect) onQuickCollect(point.id);
            marker.closePopup();
          };
        }
        const inspectBtn = document.getElementById(`btn-inspect-${point.id}`);
        if (inspectBtn) {
          inspectBtn.onclick = (e) => {
            e.stopPropagation();
            if (onSelectPoint) onSelectPoint(point);
            marker.closePopup();
          };
        }
      });
    });

    // 3. Add Vehicles
    vehicles.forEach(veh => {
      const isOffline = veh.status === 'Offline' || veh.status === 'Maintenance';
      const utilPct = Math.round((veh.currentLoad / veh.capacity) * 100);

      const truckHtml = `
        <div class="relative cursor-pointer transition-transform hover:scale-110">
          <div class="w-9 h-9 rounded-lg ${isOffline ? 'bg-slate-400' : 'bg-slate-900'} border-2 border-white shadow-lg flex flex-col items-center justify-center text-white">
            <span class="text-xs">🚛</span>
            <span class="text-[9px] font-mono font-bold leading-none">${utilPct}%</span>
          </div>
          <span class="absolute -bottom-1 -right-1 w-3 h-3 ${isOffline ? 'bg-red-500' : 'bg-emerald-500'} rounded-full border border-white"></span>
        </div>
      `;

      const vehicleIcon = L.divIcon({
        className: 'custom-vehicle-marker',
        html: truckHtml,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const vMarker = L.marker([veh.latitude, veh.longitude], { icon: vehicleIcon }).addTo(layerGroup);
      vMarker.bindPopup(`
        <div class="p-1 text-xs">
          <div class="font-bold text-slate-900 text-sm">${veh.vehicleNumber}</div>
          <div class="text-slate-500">${veh.type}</div>
          <div class="mt-2 space-y-1">
            <div>Status: <span class="font-semibold text-emerald-600">${veh.status}</span></div>
            <div>Current Payload: <b>${veh.currentLoad} / ${veh.capacity} kg</b> (${utilPct}%)</div>
            <div>Operating Zone: <b>${veh.zoneId}</b></div>
          </div>
        </div>
      `);
    });

    // If selectedPointId changes, pan to that point
    if (selectedPointId) {
      const selected = points.find(p => p.id === selectedPointId);
      if (selected) {
        map.panTo([selected.latitude, selected.longitude], { animate: true });
      }
    }
  }, [points, vehicles, routes, zones, selectedPointId, showRoutes, onSelectPoint, onQuickCollect]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden shadow-sm border border-slate-200">
      <div ref={mapContainerRef} style={{ height }} className="w-full" />
      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm p-2 rounded-lg border border-slate-200 shadow-md text-[11px] z-[400] flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500"></span>
          <span>Critical / Overflow (&gt;85%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-orange-500"></span>
          <span>High Priority (&gt;70%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
          <span>Attention (&gt;50%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
          <span>Normal (&lt;50%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-500"></span>
          <span>Collected</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-slate-700">
          <span>🚛 Fleet Vehicle (Payload %)</span>
        </div>
      </div>
    </div>
  );
};
