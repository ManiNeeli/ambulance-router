import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function InteractiveLeafletMap({
  corridorData,
  activeRouteId,
  ambulancePosition, // { lat, lng, bearing, currentStepIndex }
  signalStates,      // { [sigId]: 'red' | 'green' | 'preempted' }
  onSignalClick,
  onSelectRoute,
  isSimulating
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef({
    markers: [],
    polylines: [],
    ambulanceMarker: null,
    schoolZoneLayer: null
  });

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Centered around city center [37.772, -122.415]
    const map = L.map(mapContainerRef.current, {
      center: [37.772, -122.415],
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Dark carto tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Render Polylines, Signals, Stations & School Zone
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !corridorData) return;

    // Clear previous static layers
    layersRef.current.polylines.forEach(l => map.removeLayer(l));
    layersRef.current.polylines = [];
    layersRef.current.markers.forEach(m => map.removeLayer(m));
    layersRef.current.markers = [];
    if (layersRef.current.schoolZoneLayer) {
      map.removeLayer(layersRef.current.schoolZoneLayer);
    }

    // 1. School Zone Polygon
    if (corridorData.schoolZone?.polygon) {
      const schoolPoly = L.polygon(corridorData.schoolZone.polygon, {
        color: '#ef4444',
        weight: 1.5,
        dashArray: '5, 5',
        fillColor: '#ef4444',
        fillOpacity: 0.12
      }).addTo(map);

      schoolPoly.bindTooltip(`<b>⚠️ ${corridorData.schoolZone.name}</b><br/>Speed Limit: 20 MPH<br/>Active: ${corridorData.schoolZone.activeHours}`, {
        sticky: true,
        className: 'custom-leaflet-tooltip'
      });
      layersRef.current.schoolZoneLayer = schoolPoly;
    }

    // 2. Station Markers
    if (corridorData.stations) {
      Object.entries(corridorData.stations).forEach(([key, stn]) => {
        const icon = L.divIcon({
          className: 'station-marker-icon',
          html: `
            <div style="position: relative; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: rgba(239, 68, 68, 0.25); animation: pulse-ring 2s infinite;"></div>
              <div style="width: 22px; height: 22px; border-radius: 50%; background: #ef4444; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; font-size: 11px; box-shadow: 0 0 10px #ef4444;">
                🚒
              </div>
              <div style="position: absolute; top: 24px; white-space: nowrap; background: rgba(15, 23, 42, 0.9); border: 1px solid #ef444488; color: #fca5a5; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; pointer-events: none;">
                ${stn.name}
              </div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        const marker = L.marker(stn.coords, { icon }).addTo(map);
        marker.bindPopup(`<b>${stn.name}</b><br/>${stn.address}`);
        layersRef.current.markers.push(marker);
      });
    }

    // 3. Hospital Markers
    if (corridorData.hospitals) {
      Object.entries(corridorData.hospitals).forEach(([key, hosp]) => {
        const icon = L.divIcon({
          className: 'hospital-marker-icon',
          html: `
            <div style="position: relative; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; width: 38px; height: 38px; border-radius: 50%; background: rgba(59, 130, 246, 0.25); animation: pulse-ring 2.5s infinite;"></div>
              <div style="width: 24px; height: 24px; border-radius: 50%; background: #2563eb; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; font-size: 12px; box-shadow: 0 0 12px #3b82f6;">
                🏥
              </div>
              <div style="position: absolute; top: 26px; white-space: nowrap; background: rgba(15, 23, 42, 0.9); border: 1px solid #3b82f688; color: #93c5fd; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; pointer-events: none;">
                ${hosp.name}
              </div>
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });
        const marker = L.marker(hosp.coords, { icon }).addTo(map);
        marker.bindPopup(`<b>${hosp.name}</b><br/>${hosp.address}`);
        layersRef.current.markers.push(marker);
      });
    }

    // 4. Render Corridors (Polylines)
    if (corridorData.corridors) {
      Object.entries(corridorData.corridors).forEach(([key, corridor]) => {
        const isActive = (key === activeRouteId);
        const polyline = L.polyline(corridor.waypoints, {
          color: isActive ? '#10b981' : '#334155',
          weight: isActive ? 5.5 : 2.5,
          opacity: isActive ? 0.95 : 0.4,
          dashArray: isActive ? null : '6, 6'
        }).addTo(map);

        polyline.on('click', () => {
          if (onSelectRoute) onSelectRoute(key);
        });

        polyline.bindTooltip(`<b>${corridor.name}</b><br/>${corridor.distanceMiles} mi • ${corridor.baseMinutes} min base`, {
          sticky: true,
          className: 'custom-leaflet-tooltip'
        });

        layersRef.current.polylines.push(polyline);
      });
    }

    // 5. Render Traffic Signals on Active Route
    const activeCorridor = corridorData.corridors?.[activeRouteId];
    if (activeCorridor?.signals) {
      activeCorridor.signals.forEach(sig => {
        const state = signalStates[sig.id] || sig.state || 'red';
        const isPreempted = (state === 'preempted' || state === 'green');

        const signalHtml = `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            ${isPreempted ? `
              <div style="position: absolute; top: -6px; left: -6px; width: 32px; height: 32px; border-radius: 50%; background: rgba(16, 185, 129, 0.4); animation: pulse-ring 1s infinite;"></div>
            ` : ''}
            <div style="
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: ${isPreempted ? '#10b981' : '#ef4444'};
              border: 2px solid #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 0 10px ${isPreempted ? '#10b981' : '#ef4444'};
              font-size: 10px;
            ">
              ${isPreempted ? '🟢' : '🔴'}
            </div>
            <div style="
              margin-top: 3px;
              background: rgba(11, 15, 25, 0.95);
              border: 1px solid ${isPreempted ? '#10b981' : '#ef4444'};
              color: ${isPreempted ? '#6ee7b7' : '#fca5a5'};
              font-size: 9px;
              font-weight: 700;
              padding: 1px 4px;
              border-radius: 3px;
              white-space: nowrap;
            ">
              ${isPreempted ? 'GREEN WAVE' : (sig.carsQueued ? `${sig.carsQueued} cars` : 'STOPPED')}
            </div>
          </div>
        `;

        const icon = L.divIcon({
          className: 'traffic-signal-icon',
          html: signalHtml,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        const marker = L.marker(sig.coords, { icon }).addTo(map);
        marker.on('click', () => {
          if (onSignalClick) onSignalClick(sig.id);
        });

        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; color: #0f172a;">
            <b>🚦 Traffic Signal: ${sig.name}</b><br/>
            Cross Street: ${sig.crossStreet}<br/>
            Status: <b>${isPreempted ? 'PREEMPTED (GREEN WAVE ACTIVE)' : 'RED / CONGESTED'}</b><br/>
            ${!isPreempted ? `<button onclick="window.dispatchPreempt('${sig.id}')" style="margin-top: 5px; background: #10b981; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: bold;">Force Clear Traffic Signal</button>` : '<span style="color: #059669; font-weight: bold;">✓ Traffic Cleared</span>'}
          </div>
        `);

        layersRef.current.markers.push(marker);
      });
    }

  }, [corridorData, activeRouteId, signalStates]);

  // Window bridge for popup button
  useEffect(() => {
    window.dispatchPreempt = (sigId) => {
      if (onSignalClick) onSignalClick(sigId);
    };
    return () => {
      delete window.dispatchPreempt;
    };
  }, [onSignalClick]);

  // Update Ambulance Marker position and heading
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !ambulancePosition) return;

    const { lat, lng, bearing = 0 } = ambulancePosition;

    if (!layersRef.current.ambulanceMarker) {
      const ambulanceIcon = L.divIcon({
        className: 'ambulance-vehicle-icon',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; transform: rotate(${bearing}deg); transition: transform 0.2s linear;">
            <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(239, 68, 68, 0.3); animation: pulse-ring 0.8s infinite;"></div>
            <div style="
              width: 32px;
              height: 32px;
              background: #0f172a;
              border: 2px solid #ef4444;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 0 16px rgba(239, 68, 68, 0.8);
              font-size: 17px;
            ">
              🚑
            </div>
            <!-- Flashing Strobe -->
            <div style="position: absolute; top: -2px; right: -2px; width: 7px; height: 7px; border-radius: 50%; background: #38bdf8; box-shadow: 0 0 8px #38bdf8; animation: strobe 0.4s infinite alternate;"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      layersRef.current.ambulanceMarker = L.marker([lat, lng], { icon: ambulanceIcon, zIndexOffset: 1000 }).addTo(map);
    } else {
      layersRef.current.ambulanceMarker.setLatLng([lat, lng]);
      const iconEl = layersRef.current.ambulanceMarker.getElement();
      if (iconEl) {
        const vehicleInner = iconEl.querySelector('div');
        if (vehicleInner) {
          vehicleInner.style.transform = `rotate(${bearing}deg)`;
        }
      }
    }

    if (isSimulating) {
      map.panTo([lat, lng], { animate: true, duration: 0.3 });
    }
  }, [ambulancePosition, isSimulating]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '440px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #1e293b' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Map Overlay Badge */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        zIndex: 500,
        background: 'rgba(11, 15, 25, 0.88)',
        backdropFilter: 'blur(8px)',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '0.5rem 0.85rem',
        fontSize: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: '#f8fafc'
      }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
        <span><b>LIVE GIS MAP:</b> OpenStreetMap + Carto DarkMatter Navigation</span>
      </div>

      {/* Interactive Signal Help */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        zIndex: 500,
        background: 'rgba(11, 15, 25, 0.88)',
        backdropFilter: 'blur(8px)',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '0.4rem 0.75rem',
        fontSize: '0.7rem',
        color: '#94a3b8'
      }}>
        💡 Click any 🔴 traffic signal to manually force <b>Green Wave Emergency Preemption</b>
      </div>
    </div>
  );
}
