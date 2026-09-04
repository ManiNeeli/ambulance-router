import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, Crosshair, ZoomIn, Eye, ShieldAlert, Navigation, CloudRain, Sun, Snowflake } from 'lucide-react';

export default function InteractiveLeafletMap({
  corridorData,
  activeRouteId,
  ambulancePosition, // { lat, lng, bearing, currentStepIndex }
  signalStates = {}, // { [sigId]: 'red' | 'green' | 'preempted' }
  onSignalClick,
  onSelectRoute,
  isSimulating,
  weather = 'clear'
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const layersRef = useRef({
    markers: [],
    polylines: [],
    flowLines: [],
    ambulanceMarker: null,
    schoolZoneLayer: null
  });

  const [mapTheme, setMapTheme] = useState('dark'); // 'dark' | 'satellite' | 'streets'
  const [showTrafficFlow, setShowTrafficFlow] = useState(true);
  const [showSchoolZone, setShowSchoolZone] = useState(true);

  // Map Tile Layers
  const tileUrls = {
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    streets: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [37.772, -122.415],
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    tileLayerRef.current = L.tileLayer(tileUrls.dark, {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Layer on mapTheme change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !tileLayerRef.current) return;

    map.removeLayer(tileLayerRef.current);
    tileLayerRef.current = L.tileLayer(tileUrls[mapTheme], {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);
  }, [mapTheme]);

  // Recenter actions
  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    if (ambulancePosition) {
      mapInstanceRef.current.setView([ambulancePosition.lat, ambulancePosition.lng], 15, { animate: true });
    } else {
      mapInstanceRef.current.setView([37.772, -122.415], 14, { animate: true });
    }
  };

  const handleFitOverview = () => {
    const map = mapInstanceRef.current;
    const activeCorridor = corridorData?.corridors?.[activeRouteId];
    if (!map || !activeCorridor?.waypoints) return;
    const bounds = L.latLngBounds(activeCorridor.waypoints);
    map.fitBounds(bounds, { padding: [40, 40], animate: true });
  };

  // Render Routes, Signals, Stations & School Zone
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !corridorData) return;

    // Clear previous layers
    layersRef.current.polylines.forEach(l => map.removeLayer(l));
    layersRef.current.polylines = [];
    layersRef.current.flowLines.forEach(l => map.removeLayer(l));
    layersRef.current.flowLines = [];
    layersRef.current.markers.forEach(m => map.removeLayer(m));
    layersRef.current.markers = [];
    if (layersRef.current.schoolZoneLayer) {
      map.removeLayer(layersRef.current.schoolZoneLayer);
    }

    // 1. School Zone Polygon
    if (showSchoolZone && corridorData.schoolZone?.polygon) {
      const schoolPoly = L.polygon(corridorData.schoolZone.polygon, {
        color: '#ef4444',
        weight: 1.8,
        dashArray: '6, 6',
        fillColor: '#ef4444',
        fillOpacity: 0.15
      }).addTo(map);

      schoolPoly.bindTooltip(`
        <div style="font-weight: 700; color: #fca5a5;">⚠️ ${corridorData.schoolZone.name}</div>
        <div>School Zone Max Speed: <b>20 MPH</b></div>
        <div style="font-size: 10px; color: #94a3b8;">Pedestrian Hazard Geofence Active</div>
      `, {
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
              <div class="animate-greenwave-ring" style="position: absolute; width: 36px; height: 36px; border-radius: 50%; border: 2px solid rgba(239, 68, 68, 0.6);"></div>
              <div style="width: 26px; height: 26px; border-radius: 50%; background: #ef4444; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; font-size: 13px; box-shadow: 0 0 14px #ef4444;">
                🚒
              </div>
              <div style="position: absolute; top: 28px; white-space: nowrap; background: rgba(9, 14, 26, 0.94); border: 1px solid rgba(239, 68, 68, 0.5); color: #fca5a5; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px; pointer-events: none; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
                ${stn.name}
              </div>
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
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
              <div class="animate-greenwave-ring" style="position: absolute; width: 40px; height: 40px; border-radius: 50%; border: 2px solid rgba(59, 130, 246, 0.6);"></div>
              <div style="width: 28px; height: 28px; border-radius: 50%; background: #2563eb; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 0 16px #3b82f6;">
                🏥
              </div>
              <div style="position: absolute; top: 30px; white-space: nowrap; background: rgba(9, 14, 26, 0.94); border: 1px solid rgba(59, 130, 246, 0.5); color: #93c5fd; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px; pointer-events: none; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
                ${hosp.name}
              </div>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });
        const marker = L.marker(hosp.coords, { icon }).addTo(map);
        marker.bindPopup(`<b>${hosp.name}</b><br/>${hosp.address}`);
        layersRef.current.markers.push(marker);
      });
    }

    // 4. Corridors (Polylines + Animated Traffic Flow)
    if (corridorData.corridors) {
      Object.entries(corridorData.corridors).forEach(([key, corridor]) => {
        const isActive = (key === activeRouteId);

        // Base route line
        const polyline = L.polyline(corridor.waypoints, {
          color: isActive ? '#10b981' : '#334155',
          weight: isActive ? 6 : 2.5,
          opacity: isActive ? 0.9 : 0.45,
          dashArray: isActive ? null : '6, 6'
        }).addTo(map);

        polyline.on('click', () => {
          if (onSelectRoute) onSelectRoute(key);
        });

        layersRef.current.polylines.push(polyline);

        // Flow overlay on active route
        if (isActive && showTrafficFlow) {
          const flowPolyline = L.polyline(corridor.waypoints, {
            color: '#34d399',
            weight: 3,
            opacity: 0.9,
            className: 'leaflet-corridor-flow'
          }).addTo(map);
          layersRef.current.flowLines.push(flowPolyline);
        }
      });
    }

    // 5. Traffic Signals with EVP Preemption Radii
    const activeCorridor = corridorData.corridors?.[activeRouteId];
    if (activeCorridor?.signals) {
      activeCorridor.signals.forEach(sig => {
        const state = signalStates[sig.id] || sig.state || 'red';
        const isPreempted = (state === 'preempted' || state === 'green');

        // Preemption Radius Circle (400m)
        const radiusCircle = L.circle(sig.coords, {
          radius: 400,
          color: isPreempted ? '#10b981' : '#ef4444',
          weight: 1,
          dashArray: '3, 4',
          fillColor: isPreempted ? '#10b981' : '#ef4444',
          fillOpacity: isPreempted ? 0.08 : 0.03
        }).addTo(map);
        layersRef.current.polylines.push(radiusCircle);

        const signalHtml = `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            ${isPreempted ? `
              <div class="animate-greenwave-ring" style="position: absolute; top: -10px; left: -10px; width: 44px; height: 44px; border-radius: 50%; border: 2px solid #10b981;"></div>
            ` : ''}
            <div style="
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background: ${isPreempted ? '#10b981' : '#ef4444'};
              border: 2px solid #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 0 14px ${isPreempted ? '#10b981' : '#ef4444'};
              font-size: 11px;
            ">
              ${isPreempted ? '🟢' : '🔴'}
            </div>
            <div style="
              margin-top: 4px;
              background: rgba(9, 14, 26, 0.95);
              border: 1px solid ${isPreempted ? '#10b981' : '#ef4444'};
              color: ${isPreempted ? '#6ee7b7' : '#fca5a5'};
              font-size: 9px;
              font-weight: 800;
              padding: 2px 5px;
              border-radius: 4px;
              white-space: nowrap;
              box-shadow: 0 2px 8px rgba(0,0,0,0.6);
            ">
              ${isPreempted ? 'GREEN WAVE' : `${sig.carsQueued || 15} cars queued`}
            </div>
          </div>
        `;

        const icon = L.divIcon({
          className: 'traffic-signal-icon',
          html: signalHtml,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker(sig.coords, { icon }).addTo(map);
        marker.on('click', () => {
          if (onSignalClick) onSignalClick(sig.id);
        });

        marker.bindPopup(`
          <div style="font-family: var(--font-sans); font-size: 12px; color: #f8fafc; padding: 4px;">
            <b style="color: #38bdf8;">🚦 Smart Intersection Signal: ${sig.name}</b><br/>
            <span style="color: #94a3b8;">Cross Street:</span> <b>${sig.crossStreet}</b><br/>
            <span style="color: #94a3b8;">EVP Status:</span> <b style="color: ${isPreempted ? '#10b981' : '#ef4444'};">${isPreempted ? 'PREEMPTED (GREEN WAVE CORRIDOR)' : 'RED / CONGESTED'}</b><br/>
            ${!isPreempted ? `
              <button onclick="window.dispatchPreempt('${sig.id}')" style="margin-top: 8px; width: 100%; background: #10b981; color: #ffffff; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 700; box-shadow: 0 0 10px rgba(16,185,129,0.5);">
                ⚡ Force Clear Traffic Signal
              </button>
            ` : '<div style="margin-top: 6px; color: #10b981; font-weight: 700;">✓ Intersection Priority Active</div>'}
          </div>
        `);

        layersRef.current.markers.push(marker);
      });
    }

  }, [corridorData, activeRouteId, signalStates, showTrafficFlow, showSchoolZone]);

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
          <div style="position: relative; display: flex; align-items: center; justify-content: center; transform: rotate(${bearing}deg); transition: transform 0.15s linear;">
            <!-- Outer Pulsing Emergency Aura -->
            <div class="animate-greenwave-ring" style="position: absolute; width: 50px; height: 50px; border-radius: 50%; border: 2px solid rgba(239, 68, 68, 0.7);"></div>
            
            <!-- Vehicle Body -->
            <div style="
              width: 36px;
              height: 36px;
              background: #090e1a;
              border: 2px solid #ef4444;
              border-radius: 9px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 0 20px rgba(239, 68, 68, 0.85);
              font-size: 19px;
            ">
              🚑
            </div>

            <!-- Alternating Strobe Lights -->
            <div class="strobe-red" style="position: absolute; top: -3px; left: 1px; width: 8px; height: 8px; border-radius: 50%; background: #ef4444;"></div>
            <div class="strobe-blue" style="position: absolute; top: -3px; right: 1px; width: 8px; height: 8px; border-radius: 50%; background: #38bdf8;"></div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
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
      map.panTo([lat, lng], { animate: true, duration: 0.25 });
    }
  }, [ambulancePosition, isSimulating]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '460px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #1e293b' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Weather Particle Simulation Overlay */}
      {weather === 'rain' && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          pointerEvents: 'none',
          zIndex: 400,
          background: 'linear-gradient(180deg, rgba(30, 58, 138, 0.1) 0%, rgba(15, 23, 42, 0.25) 100%)',
          backgroundImage: 'radial-gradient(ellipse at 50% 50%, rgba(56, 189, 248, 0.05) 0%, transparent 60%)'
        }} />
      )}
      {weather === 'snow' && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          pointerEvents: 'none',
          zIndex: 400,
          background: 'rgba(241, 245, 249, 0.05)'
        }} />
      )}
      {weather === 'fog' && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          pointerEvents: 'none',
          zIndex: 400,
          backdropFilter: 'blur(1.5px)',
          background: 'rgba(148, 163, 184, 0.12)'
        }} />
      )}

      {/* Top Map Layer Switcher & Status Controls */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        zIndex: 500,
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center'
      }}>
        <div style={{
          background: 'rgba(9, 14, 26, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '8px',
          padding: '0.3rem',
          display: 'flex',
          gap: '0.25rem'
        }}>
          <button
            type="button"
            onClick={() => setMapTheme('dark')}
            className={`tab-btn ${mapTheme === 'dark' ? 'active' : ''}`}
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
          >
            🌑 Tactical Dark
          </button>
          <button
            type="button"
            onClick={() => setMapTheme('satellite')}
            className={`tab-btn ${mapTheme === 'satellite' ? 'active' : ''}`}
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
          >
            🛰️ Satellite
          </button>
          <button
            type="button"
            onClick={() => setMapTheme('streets')}
            className={`tab-btn ${mapTheme === 'streets' ? 'active' : ''}`}
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
          >
            🗺️ Streets
          </button>
        </div>

        {/* Weather Indicator */}
        <div style={{
          background: 'rgba(9, 14, 26, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          padding: '0.45rem 0.75rem',
          fontSize: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          color: '#cbd5e1'
        }}>
          {weather === 'rain' ? <CloudRain size={14} color="#60a5fa" /> : weather === 'snow' ? <Snowflake size={14} color="#93c5fd" /> : <Sun size={14} color="#fbbf24" />}
          <span>{weather.toUpperCase()} VISIBILITY</span>
        </div>
      </div>

      {/* Floating Action Controls on Right */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        zIndex: 500,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem'
      }}>
        <button
          type="button"
          onClick={handleRecenter}
          title="Recenter on Ambulance"
          style={{
            background: 'rgba(9, 14, 26, 0.9)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            color: '#38bdf8',
            borderRadius: '6px',
            padding: '0.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Crosshair size={16} />
        </button>

        <button
          type="button"
          onClick={handleFitOverview}
          title="Fit Corridor Overview"
          style={{
            background: 'rgba(9, 14, 26, 0.9)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            color: '#93c5fd',
            borderRadius: '6px',
            padding: '0.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ZoomIn size={16} />
        </button>

        <button
          type="button"
          onClick={() => setShowTrafficFlow(!showTrafficFlow)}
          title="Toggle Traffic Flow Layer"
          style={{
            background: showTrafficFlow ? 'rgba(16, 185, 129, 0.25)' : 'rgba(9, 14, 26, 0.9)',
            border: showTrafficFlow ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
            color: showTrafficFlow ? '#34d399' : '#94a3b8',
            borderRadius: '6px',
            padding: '0.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Navigation size={16} />
        </button>
      </div>

      {/* Bottom Dispatcher Status Bar */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        zIndex: 500,
        background: 'rgba(9, 14, 26, 0.92)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '8px',
        padding: '0.45rem 0.85rem',
        fontSize: '0.72rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        color: '#f8fafc'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
          <span><b>EVP RADAR:</b> 400m Preemption Active</span>
        </div>
        <span style={{ color: '#64748b' }}>|</span>
        <div style={{ color: '#94a3b8' }}>
          Corridor: <b style={{ color: '#38bdf8' }}>{corridorData?.corridors?.[activeRouteId]?.name || 'Primary Corridor'}</b>
        </div>
      </div>
    </div>
  );
}
