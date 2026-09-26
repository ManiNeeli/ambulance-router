import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Crosshair, ZoomIn, Navigation, CloudRain, Sun, Snowflake } from 'lucide-react';

export default function InteractiveLeafletMap({
  corridorData,
  activeRouteId,
  ambulancePosition, // { lat, lng, bearing }
  signalStates = {},
  onSignalClick,
  onSelectRoute,
  isSimulating,
  weather = 'clear',
  onManualProgressChange,
  vehicleType = 'ambulance'
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

  const [mapTheme, setMapTheme] = useState('dark');
  const [showTrafficFlow, setShowTrafficFlow] = useState(true);

  const tileUrls = {
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    streets: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [17.4100, 78.4600],
      zoom: 13,
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

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !tileLayerRef.current) return;

    map.removeLayer(tileLayerRef.current);
    tileLayerRef.current = L.tileLayer(tileUrls[mapTheme], {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);
  }, [mapTheme]);

  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    if (ambulancePosition) {
      mapInstanceRef.current.setView([ambulancePosition.lat, ambulancePosition.lng], 15, { animate: true });
    } else {
      mapInstanceRef.current.setView([17.4100, 78.4600], 13, { animate: true });
    }
  };

  const handleFitOverview = () => {
    const map = mapInstanceRef.current;
    const activeCorridor = corridorData?.corridors?.[activeRouteId];
    if (!map || !activeCorridor?.waypoints) return;
    const bounds = L.latLngBounds(activeCorridor.waypoints);
    map.fitBounds(bounds, { padding: [40, 40], animate: true });
  };

  // Render Map Layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !corridorData) return;

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
    if (corridorData.schoolZone?.polygon) {
      const schoolPoly = L.polygon(corridorData.schoolZone.polygon, {
        color: '#ff2a5f',
        weight: 1.8,
        dashArray: '6, 6',
        fillColor: '#ff2a5f',
        fillOpacity: 0.14
      }).addTo(map);

      schoolPoly.bindTooltip(`
        <div style="font-weight: 800; color: #ff2a5f;">⚠️ ${corridorData.schoolZone.name}</div>
        <div>Speed Limit: <b>20 MPH</b></div>
        <div style="font-size: 10px; color: #94a3b8;">Pedestrian Hazard Geofence</div>
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
              <div class="animate-greenwave-ring" style="position: absolute; width: 36px; height: 36px; border-radius: 50%; border: 2px solid rgba(255, 42, 95, 0.7);"></div>
              <div style="width: 26px; height: 26px; border-radius: 50%; background: #ff2a5f; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; font-size: 13px; box-shadow: 0 0 14px #ff2a5f;">
                🚒
              </div>
              <div style="position: absolute; top: 28px; white-space: nowrap; background: rgba(9, 12, 19, 0.95); border: 1px solid rgba(255, 42, 95, 0.5); color: #ff85a1; font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 4px; pointer-events: none; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
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
              <div class="animate-greenwave-ring" style="position: absolute; width: 40px; height: 40px; border-radius: 50%; border: 2px solid rgba(124, 58, 237, 0.7);"></div>
              <div style="width: 28px; height: 28px; border-radius: 50%; background: #7c3aed; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 0 16px #7c3aed;">
                🏥
              </div>
              <div style="position: absolute; top: 30px; white-space: nowrap; background: rgba(9, 12, 19, 0.95); border: 1px solid rgba(124, 58, 237, 0.5); color: #c4b5fd; font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 4px; pointer-events: none; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
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

    // 4. Corridors with Electric Hyper-Lime Highlight
    if (corridorData.corridors) {
      Object.entries(corridorData.corridors).forEach(([key, corridor]) => {
        const isActive = (key === activeRouteId);

        // Base route line
        const polyline = L.polyline(corridor.waypoints, {
          color: isActive ? '#08B7BA' : '#94A3B8',
          weight: isActive ? 7 : 3.5,
          opacity: isActive ? 1.0 : 0.5,
          dashArray: isActive ? null : '6, 6'
        }).addTo(map);

        polyline.on('click', (e) => {
          if (!isActive) {
            if (onSelectRoute) onSelectRoute(key);
            return;
          }
          if (onManualProgressChange && corridor.waypoints?.length > 1) {
            let closestIdx = 0;
            let minD = 999999;
            corridor.waypoints.forEach((wp, i) => {
              const d = Math.hypot(wp[0] - e.latlng.lat, wp[1] - e.latlng.lng);
              if (d < minD) {
                minD = d;
                closestIdx = i;
              }
            });
            const frac = closestIdx / (corridor.waypoints.length - 1);
            onManualProgressChange(frac);
          }
        });

        layersRef.current.polylines.push(polyline);

        // Flow overlay on active route
        if (isActive && showTrafficFlow) {
          const flowPolyline = L.polyline(corridor.waypoints, {
            color: '#FFB91A',
            weight: 3.5,
            opacity: 0.95,
            className: 'leaflet-corridor-flow'
          }).addTo(map);
          layersRef.current.flowLines.push(flowPolyline);
        }
      });
    }

    // 5. Traffic Signals with Preemption Rings
    const activeCorridor = corridorData.corridors?.[activeRouteId];
    if (activeCorridor?.signals) {
      activeCorridor.signals.forEach(sig => {
        const state = signalStates[sig.id] || sig.state || 'red';
        const isPreempted = (state === 'preempted' || state === 'green');

        const radiusCircle = L.circle(sig.coords, {
          radius: 400,
          color: isPreempted ? '#00f5a0' : '#ff2a5f',
          weight: 1,
          dashArray: '3, 4',
          fillColor: isPreempted ? '#00f5a0' : '#ff2a5f',
          fillOpacity: isPreempted ? 0.08 : 0.03
        }).addTo(map);
        layersRef.current.polylines.push(radiusCircle);

        const signalHtml = `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            ${isPreempted ? `
              <div class="animate-greenwave-ring" style="position: absolute; top: -10px; left: -10px; width: 44px; height: 44px; border-radius: 50%; border: 2px solid #00f5a0;"></div>
            ` : ''}
            <div style="
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background: ${isPreempted ? '#00f5a0' : '#ff2a5f'};
              border: 2px solid #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 0 14px ${isPreempted ? '#00f5a0' : '#ff2a5f'};
              font-size: 11px;
            ">
              ${isPreempted ? '🟢' : '🔴'}
            </div>
            <div style="
              margin-top: 4px;
              background: rgba(9, 12, 19, 0.95);
              border: 1px solid ${isPreempted ? '#00f5a0' : '#ff2a5f'};
              color: ${isPreempted ? '#00f5a0' : '#ff85a1'};
              font-size: 9px;
              font-weight: 800;
              padding: 2px 5px;
              border-radius: 4px;
              white-space: nowrap;
              box-shadow: 0 2px 8px rgba(0,0,0,0.6);
            ">
              ${isPreempted ? 'GREEN WAVE' : `${sig.carsQueued || 15} queued`}
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
            <b style="color: #ccff00;">🚦 Smart Signal: ${sig.name}</b><br/>
            <span style="color: #94a3b8;">Cross Street:</span> <b>${sig.crossStreet}</b><br/>
            <span style="color: #94a3b8;">Status:</span> <b style="color: ${isPreempted ? '#00f5a0' : '#ff2a5f'};">${isPreempted ? 'PREEMPTED (GREEN WAVE)' : 'RED / CONGESTED'}</b><br/>
            ${!isPreempted ? `
              <button onclick="window.dispatchPreempt('${sig.id}')" style="margin-top: 8px; width: 100%; background: #00f5a0; color: #04101e; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 800; box-shadow: 0 0 10px rgba(0,245,160,0.5);">
                ⚡ Force Clear Signal
              </button>
            ` : '<div style="margin-top: 6px; color: #00f5a0; font-weight: 800;">✓ Priority Corridor Active</div>'}
          </div>
        `);

        layersRef.current.markers.push(marker);
      });
    }

  }, [corridorData, activeRouteId, signalStates, showTrafficFlow]);

  useEffect(() => {
    window.dispatchPreempt = (sigId) => {
      if (onSignalClick) onSignalClick(sigId);
    };
    return () => {
      delete window.dispatchPreempt;
    };
  }, [onSignalClick]);

  // Vehicle Marker Update (Ambulance 🚑 or Fire Truck 🚒)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !ambulancePosition) return;

    const { lat, lng, bearing = 0 } = ambulancePosition;
    const isFire = (vehicleType === 'fire_truck');
    const ringColor = isFire ? '#D71920' : '#08B7BA';
    const emoji = isFire ? '🚒' : '🚑';
    const bg = isFire ? '#FFE8E8' : '#FFFFFF';

    if (layersRef.current.ambulanceMarker) {
      map.removeLayer(layersRef.current.ambulanceMarker);
      layersRef.current.ambulanceMarker = null;
    }

    const vehicleIcon = L.divIcon({
      className: 'emergency-vehicle-icon',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; transform: rotate(${bearing}deg); transition: transform 0.15s linear;">
          <div class="animate-greenwave-ring" style="position: absolute; width: 54px; height: 54px; border-radius: 50%; border: 2.5px solid ${ringColor};"></div>
          <div style="
            width: 40px;
            height: 40px;
            background: ${bg};
            border: 2.5px solid #222222;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 3px 3px 0px #222222;
            font-size: 21px;
          ">
            ${emoji}
          </div>
          <div class="strobe-red" style="position: absolute; top: -4px; left: 1px; width: 9px; height: 9px; border-radius: 50%; background: #D71920; border: 1.5px solid #222;"></div>
          <div class="${isFire ? 'strobe-red' : 'strobe-blue'}" style="position: absolute; top: -4px; right: 1px; width: 9px; height: 9px; border-radius: 50%; background: ${isFire ? '#FFB91A' : '#08B7BA'}; border: 1.5px solid #222;"></div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    layersRef.current.ambulanceMarker = L.marker([lat, lng], { icon: vehicleIcon, zIndexOffset: 1000 }).addTo(map);

    if (isSimulating) {
      map.panTo([lat, lng], { animate: true, duration: 0.25 });
    }
  }, [ambulancePosition, isSimulating, vehicleType]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '460px', borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Top Map Controls */}
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
          background: 'var(--bg-card)',
          backdropFilter: 'blur(10px)',
          border: '1px solid var(--border-subtle)',
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
          background: 'var(--bg-card)',
          backdropFilter: 'blur(10px)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '0.45rem 0.75rem',
          fontSize: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          color: 'var(--text-secondary)'
        }}>
          {weather === 'rain' ? <CloudRain size={14} color="#38bdf8" /> : weather === 'snow' ? <Snowflake size={14} color="#c084fc" /> : <Sun size={14} color="#ff9100" />}
          <span style={{ fontWeight: 800 }}>{weather.toUpperCase()} ATMOSPHERE</span>
        </div>
      </div>

      {/* Floating Action Buttons */}
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
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--accent-primary)',
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
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
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
            background: showTrafficFlow ? 'var(--signal-green-soft)' : 'var(--bg-card)',
            border: showTrafficFlow ? '1px solid var(--signal-green)' : '1px solid var(--border-subtle)',
            color: showTrafficFlow ? 'var(--signal-green)' : 'var(--text-muted)',
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

      {/* Bottom Status Bar */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        zIndex: 500,
        background: 'var(--bg-card)',
        backdropFilter: 'blur(10px)',
        border: '1px solid var(--border-card)',
        borderRadius: '8px',
        padding: '0.45rem 0.85rem',
        fontSize: '0.72rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        color: 'var(--text-primary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--signal-green)', boxShadow: '0 0 8px var(--signal-green)' }} />
          <span><b>EVP RADAR:</b> 400m Preemption Active</span>
        </div>
        <span style={{ color: 'var(--border-subtle)' }}>|</span>
        <div style={{ color: 'var(--text-secondary)' }}>
          Active Corridor: <b style={{ color: 'var(--accent-primary)' }}>{corridorData?.corridors?.[activeRouteId]?.name || 'Primary Corridor'}</b>
        </div>
      </div>
    </div>
  );
}
