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
  vehicleType = 'ambulance',
  onSelectStation,
  onSelectHospital
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const layersRef = useRef({
    markers: [],
    polylines: [],
    flowLines: [],
    trafficSegments: [],
    ambulanceMarker: null,
    schoolZoneLayer: null
  });

  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';

  const [mapTheme, setMapTheme] = useState('traffic');
  const [showTrafficFlow, setShowTrafficFlow] = useState(true);

  const activeCorridor = corridorData?.corridors?.[activeRouteId]
    || (corridorData?.corridors && Object.values(corridorData.corridors).find(c => c.id === activeRouteId))
    || (corridorData?.corridors && Object.values(corridorData.corridors)[0])
    || null;

  const tileUrls = {
    traffic: MAPBOX_TOKEN
      ? `https://api.mapbox.com/styles/v1/mapbox/traffic-day-v2/tiles/512/{z}/{x}/{y}@2x?access_token=${MAPBOX_TOKEN}`
      : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    streets: MAPBOX_TOKEN
      ? `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/512/{z}/{x}/{y}@2x?access_token=${MAPBOX_TOKEN}`
      : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: MAPBOX_TOKEN
      ? `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/512/{z}/{x}/{y}@2x?access_token=${MAPBOX_TOKEN}`
      : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    osm: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
  };

  const createTileLayer = (theme) => {
    const isMapbox = Boolean(MAPBOX_TOKEN) && (theme === 'traffic' || theme === 'streets' || theme === 'satellite');
    return L.tileLayer(tileUrls[theme] || tileUrls.traffic, {
      maxZoom: 19,
      tileSize: isMapbox ? 512 : 256,
      zoomOffset: isMapbox ? -1 : 0,
      attribution: isMapbox
        ? '© <a href="https://www.mapbox.com/">Mapbox</a> © <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        : '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
    });
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

    tileLayerRef.current = createTileLayer(mapTheme).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }
    tileLayerRef.current = createTileLayer(mapTheme).addTo(map);
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
    if (!map || !corridorData?.corridors) return;
    const activeCorridor = corridorData.corridors[activeRouteId]
      || Object.values(corridorData.corridors).find(c => c.id === activeRouteId)
      || Object.values(corridorData.corridors)[0];
    if (!activeCorridor?.waypoints?.length) return;
    const bounds = L.latLngBounds(activeCorridor.waypoints);
    map.fitBounds(bounds, { padding: [40, 40], animate: true });
  };

  // Auto-fit bounds when active route or corridor waypoints change significantly
  const prevWaypointsRef = useRef(null);
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !corridorData?.corridors) return;
    const activeCorridor = corridorData.corridors[activeRouteId]
      || Object.values(corridorData.corridors).find(c => c.id === activeRouteId)
      || Object.values(corridorData.corridors)[0];
    if (!activeCorridor?.waypoints?.length) return;

    const firstPt = activeCorridor.waypoints[0];
    const lastPt = activeCorridor.waypoints[activeCorridor.waypoints.length - 1];
    const prev = prevWaypointsRef.current;
    const hasOriginDestChanged = !prev ||
      Math.hypot(prev.first[0] - firstPt[0], prev.first[1] - firstPt[1]) > 0.003 ||
      Math.hypot(prev.last[0] - lastPt[0], prev.last[1] - lastPt[1]) > 0.003;

    prevWaypointsRef.current = { first: firstPt, last: lastPt };

    if (hasOriginDestChanged) {
      const bounds = L.latLngBounds(activeCorridor.waypoints);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, animate: true });
    }
  }, [corridorData, activeRouteId]);

  // Render Map Layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !corridorData) return;

    layersRef.current.polylines.forEach(l => map.removeLayer(l));
    layersRef.current.polylines = [];
    layersRef.current.flowLines.forEach(l => map.removeLayer(l));
    layersRef.current.flowLines = [];
    layersRef.current.trafficSegments.forEach(l => map.removeLayer(l));
    layersRef.current.trafficSegments = [];
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
        const safeStnKey = key.replace(/[^a-zA-Z0-9]/g, '_');
        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; line-height: 1.4; min-width: 170px;">
            <div style="font-weight: 800; color: #ff2a5f; margin-bottom: 2px;">🚒 ${stn.name}</div>
            <div style="color: #64748b; font-size: 11px; margin-bottom: 8px;">${stn.address}</div>
            <button id="btn-stn-${safeStnKey}" style="
              width: 100%;
              padding: 5px 8px;
              background: #ff2a5f;
              color: white;
              border: none;
              border-radius: 5px;
              font-size: 11px;
              font-weight: 800;
              cursor: pointer;
              box-shadow: 0 2px 6px rgba(255,42,95,0.4);
            ">📍 Set as Origin Station</button>
          </div>
        `);
        marker.on('popupopen', () => {
          const btn = document.getElementById(`btn-stn-${safeStnKey}`);
          if (btn && onSelectStation) {
            btn.onclick = () => {
              onSelectStation(key);
              marker.closePopup();
            };
          }
        });
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
        const safeHospKey = key.replace(/[^a-zA-Z0-9]/g, '_');
        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; line-height: 1.4; min-width: 170px;">
            <div style="font-weight: 800; color: #7c3aed; margin-bottom: 2px;">🏥 ${hosp.name}</div>
            <div style="color: #64748b; font-size: 11px; margin-bottom: 8px;">${hosp.address}</div>
            <button id="btn-hosp-${safeHospKey}" style="
              width: 100%;
              padding: 5px 8px;
              background: #7c3aed;
              color: white;
              border: none;
              border-radius: 5px;
              font-size: 11px;
              font-weight: 800;
              cursor: pointer;
              box-shadow: 0 2px 6px rgba(124,58,237,0.4);
            ">🎯 Set as Incident Destination</button>
          </div>
        `);
        marker.on('popupopen', () => {
          const btn = document.getElementById(`btn-hosp-${safeHospKey}`);
          if (btn && onSelectHospital) {
            btn.onclick = () => {
              onSelectHospital(key);
              marker.closePopup();
            };
          }
        });
        layersRef.current.markers.push(marker);
      });
    }

    // 4. Corridors with Live Traffic Congestion & Route Outlines
    if (corridorData.corridors) {
      const congestionPalette = {
        low: '#00f5a0',      // Free flow (lime-green)
        moderate: '#FFB91A', // Moderate slowdown (amber-yellow)
        heavy: '#ff7a00',    // Heavy congestion (deep orange)
        severe: '#ff2a5f',   // Severe gridlock (bright red)
        unknown: '#08B7BA'   // Nominal arterial (cyan)
      };

      Object.entries(corridorData.corridors).forEach(([key, corridor]) => {
        const isActive = (key === activeRouteId) ||
          (corridor.id && corridor.id === activeRouteId) ||
          (key.includes('route-a') && String(activeRouteId).includes('route-a')) ||
          (key.includes('route-b') && String(activeRouteId).includes('route-b')) ||
          (key.includes('route-c') && String(activeRouteId).includes('route-c'));

        if (isActive) {
          // Dark underlay casing for high-contrast visibility against map tiles
          const underlay = L.polyline(corridor.waypoints, {
            color: '#080d1a',
            weight: 9.5,
            opacity: 0.92,
            lineCap: 'round',
            lineJoin: 'round'
          }).addTo(map);

          underlay.on('click', (e) => {
            if (onManualProgressChange && corridor.waypoints?.length > 1) {
              let closestIdx = 0;
              let minD = 999999;
              corridor.waypoints.forEach((wp, i) => {
                const d = Math.hypot(wp[0] - e.latlng.lat, wp[1] - e.latlng.lng);
                if (d < minD) { minD = d; closestIdx = i; }
              });
              onManualProgressChange(closestIdx / (corridor.waypoints.length - 1));
            }
          });
          layersRef.current.polylines.push(underlay);

          // If live traffic segments are available, render color-coded real-time congestion
          if (corridor.trafficSegments && corridor.trafficSegments.length > 0) {
            corridor.trafficSegments.forEach(seg => {
              if (!seg.coords || seg.coords.length < 2) return;
              const segColor = congestionPalette[seg.congestion] || '#00f5a0';
              const segPoly = L.polyline(seg.coords, {
                color: segColor,
                weight: 6.5,
                opacity: 1.0,
                lineCap: 'round',
                lineJoin: 'round'
              }).addTo(map);

              const desc = seg.congestion === 'severe' ? '🔴 Severe Bottleneck (Stop & Go)' :
                           seg.congestion === 'heavy' ? '🟠 Heavy Traffic Congestion' :
                           seg.congestion === 'moderate' ? '🟡 Moderate Queueing / Slowdown' :
                           '🟢 Free Flowing Live Traffic';

              segPoly.bindTooltip(`
                <div style="font-family: inherit; font-size: 11px; padding: 2px;">
                  <div style="font-weight: 800; color: ${segColor};">${desc}</div>
                  <div style="font-size: 10px; color: #94a3b8;">Mapbox Live Traffic Telematics</div>
                </div>
              `, { sticky: true, className: 'custom-leaflet-tooltip' });

              segPoly.on('click', (e) => {
                if (onManualProgressChange && corridor.waypoints?.length > 1) {
                  let closestIdx = 0;
                  let minD = 999999;
                  corridor.waypoints.forEach((wp, i) => {
                    const d = Math.hypot(wp[0] - e.latlng.lat, wp[1] - e.latlng.lng);
                    if (d < minD) { minD = d; closestIdx = i; }
                  });
                  onManualProgressChange(closestIdx / (corridor.waypoints.length - 1));
                }
              });

              layersRef.current.trafficSegments.push(segPoly);
            });
          } else {
            // Fallback solid active route line
            const activeLine = L.polyline(corridor.waypoints, {
              color: '#08B7BA',
              weight: 6.5,
              opacity: 1.0
            }).addTo(map);
            layersRef.current.polylines.push(activeLine);
          }

          // Flow pulse overlay on active route
          if (showTrafficFlow) {
            const flowPolyline = L.polyline(corridor.waypoints, {
              color: '#ffffff',
              weight: 2.5,
              opacity: 0.9,
              dashArray: '8, 12',
              className: 'leaflet-corridor-flow'
            }).addTo(map);
            layersRef.current.flowLines.push(flowPolyline);
          }
        } else {
          // Inactive candidate route
          const polyline = L.polyline(corridor.waypoints, {
            color: '#64748b',
            weight: 3.5,
            opacity: 0.55,
            dashArray: '5, 6'
          }).addTo(map);

          polyline.on('click', () => {
            if (onSelectRoute) onSelectRoute(key);
          });

          polyline.bindTooltip(`
            <div style="font-family: inherit; font-size: 11px;">
              <div style="font-weight: 800; color: #94a3b8;">Click to switch to ${corridor.name}</div>
              <div style="font-size: 10px; color: #cbd5e1;">${corridor.distanceMiles} mi • ~${corridor.adjustedMinutes || corridor.baseMinutes} min</div>
            </div>
          `, { sticky: true, className: 'custom-leaflet-tooltip' });

          layersRef.current.polylines.push(polyline);
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

      {/* Top Map Controls & Live Traffic Telematics */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        zIndex: 500,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.45rem',
        maxWidth: 'calc(100% - 70px)'
      }}>
        {/* Row 1: Themes & Atmosphere */}
        <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{
            background: 'var(--bg-card)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '0.25rem',
            display: 'flex',
            gap: '0.25rem'
          }}>
            <button
              type="button"
              onClick={() => setMapTheme('traffic')}
              className={`tab-btn ${mapTheme === 'traffic' ? 'active' : ''}`}
              style={{
                padding: '0.35rem 0.65rem',
                fontSize: '0.74rem',
                fontWeight: 800,
                backgroundColor: mapTheme === 'traffic' ? '#00f5a0' : 'transparent',
                color: mapTheme === 'traffic' ? '#080d1a' : 'inherit'
              }}
            >
              🚦 Mapbox Live Traffic HD
            </button>
            <button
              type="button"
              onClick={() => setMapTheme('streets')}
              className={`tab-btn ${mapTheme === 'streets' ? 'active' : ''}`}
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.72rem' }}
            >
              🗺️ Streets HD
            </button>
            <button
              type="button"
              onClick={() => setMapTheme('satellite')}
              className={`tab-btn ${mapTheme === 'satellite' ? 'active' : ''}`}
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.72rem' }}
            >
              🛰️ Satellite HD
            </button>
            <button
              type="button"
              onClick={() => setMapTheme('osm')}
              className={`tab-btn ${mapTheme === 'osm' ? 'active' : ''}`}
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.72rem' }}
            >
              🌐 OSM
            </button>
          </div>

          {/* Weather Indicator */}
          <div style={{
            background: 'var(--bg-card)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '0.4rem 0.65rem',
            fontSize: '0.72rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            color: 'var(--text-secondary)'
          }}>
            {weather === 'rain' ? <CloudRain size={13} color="#38bdf8" /> : weather === 'snow' ? <Snowflake size={13} color="#c084fc" /> : <Sun size={13} color="#ff9100" />}
            <span style={{ fontWeight: 800 }}>{weather.toUpperCase()} ATMOSPHERE</span>
          </div>
        </div>

        {/* Row 2: Live Traffic Telematics HUD Bar */}
        {activeCorridor && (
          <div style={{
            background: 'rgba(8, 13, 26, 0.94)',
            backdropFilter: 'blur(12px)',
            border: '1.5px solid rgba(0, 245, 160, 0.35)',
            borderRadius: '8px',
            padding: '0.45rem 0.8rem',
            fontSize: '0.72rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            color: '#ffffff',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span className="animate-ping" style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#00f5a0' }} />
              <strong style={{ color: '#00f5a0', letterSpacing: '0.04em' }}>MAPBOX LIVE TRAFFIC:</strong>
              <span style={{ color: activeCorridor.congestionSummary?.heavyPercent > 10 ? '#ff7a00' : activeCorridor.congestionSummary?.moderatePercent > 20 ? '#FFB91A' : '#00f5a0', fontWeight: 800 }}>
                {activeCorridor.congestionSummary?.status || 'Real-Time Dynamic Feed'}
              </span>
            </div>

            <span style={{ color: '#334155' }}>|</span>

            {/* Delay & Flow Speed */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Delay: <strong style={{ color: (activeCorridor.liveDelayMinutes || 0) > 0 ? '#ff7a00' : '#00f5a0' }}>+{(activeCorridor.liveDelayMinutes || 0).toFixed(1)}m</strong></span>
              <span>Flow Speed: <strong>{activeCorridor.congestionSummary?.avgSpeedMph || 22} MPH</strong></span>
            </div>

            {/* Congestion Segments Legend */}
            <span style={{ color: '#334155' }}>|</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.67rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#00f5a0' }} />
                Clear {activeCorridor.congestionSummary?.freeFlowPercent ? `(${activeCorridor.congestionSummary.freeFlowPercent}%)` : ''}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#FFB91A' }} />
                Moderate
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#ff2a5f' }} />
                Congested
              </span>
            </div>
          </div>
        )}
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
