/**
 * Real Routing Engine Service
 * Fetches real road-network routes, actual distances, durations, and live traffic data
 * Supports OSRM (Open Source Routing Machine), Mapbox Directions, and Google Maps API.
 */

const https = require('https');
const http = require('http');

/**
 * Fetch JSON helper using native Node.js HTTP/HTTPS with timeout
 */
function fetchJson(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const client = parsed.protocol === 'https:' ? https : http;
    const reqOptions = {
      timeout: options.timeout || 7000,
      headers: {
        'User-Agent': 'AmbulanceRouter/2.0 (CAD-ITS-Emergency-Routing)',
        'Accept': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = client.get(url, reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            reject(new Error(`Failed to parse JSON response: ${err.message}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 150)}`));
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Routing request timed out after ${options.timeout || 6000}ms`));
    });

    req.on('error', err => reject(err));
  });
}

/**
 * Request real road-network route from OSRM
 */
async function fetchOsrmRoutes(startCoords, endCoords) {
  // startCoords: [lat, lng], endCoords: [lat, lng]
  // OSRM expects: {lng},{lat};{lng},{lat}
  const url = `https://router.project-osrm.org/route/v1/driving/${startCoords[1]},${startCoords[0]};${endCoords[1]},${endCoords[0]}?overview=full&geometries=geojson&steps=true&alternatives=true&annotations=true`;

  const json = await fetchJson(url, { timeout: 7000 });
  if (!json.routes || json.routes.length === 0) {
    throw new Error('No road route found in OSRM network');
  }

  return json.routes.map((r, idx) => {
    // Convert GeoJSON [lng, lat] to Leaflet [lat, lng]
    const waypoints = r.geometry.coordinates.map(pt => [pt[1], pt[0]]);
    const distanceMiles = Math.round((r.distance * 0.000621371) * 10) / 10;
    const baseMinutes = Math.round((r.duration / 60) * 10) / 10;

    // Extract real turn-by-turn road steps
    const maneuvers = [];
    if (r.legs && r.legs[0] && r.legs[0].steps) {
      r.legs[0].steps.forEach((st, sIdx) => {
        if (st.maneuver && st.maneuver.type !== 'depart') {
          const stepDist = (st.distance * 0.000621371).toFixed(1) + ' mi';
          const roadName = st.name || 'Connector';
          const type = st.maneuver.modifier ? `${st.maneuver.modifier} onto ${roadName}` : `Continue on ${roadName}`;
          maneuvers.push({
            step: sIdx + 1,
            text: `${type}`,
            dist: stepDist,
            coords: [st.maneuver.location[1], st.maneuver.location[0]]
          });
        }
      });
    }

    // Default route names
    const routeNames = [
      "Route A - Direct Arterial",
      "Route B - Highway Corridor",
      "Route C - Secondary Bypass"
    ];

    return {
      provider: "OSRM (OpenStreetMap Road Network)",
      routeIndex: idx,
      name: routeNames[idx] || `Route Option ${idx + 1}`,
      distanceMiles,
      baseMinutes,
      waypoints,
      maneuvers: maneuvers.length > 0 ? maneuvers : undefined
    };
  });
}

/**
 * Request traffic-aware routes from Mapbox if MAPBOX_ACCESS_TOKEN is configured
 */
async function fetchMapboxTrafficRoutes(startCoords, endCoords, token) {
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${startCoords[1]},${startCoords[0]};${endCoords[1]},${endCoords[0]}?geometries=geojson&steps=true&alternatives=true&overview=full&access_token=${token}`;
  const json = await fetchJson(url, { timeout: 8000 });
  if (!json.routes || json.routes.length === 0) throw new Error('No Mapbox routes returned');

  const routeIds = ["route-a-main-st", "route-b-highway-bypass", "route-c-residential-shortcut"];
  const routeNames = [
    "Route A - Mapbox Live Traffic Arterial",
    "Route B - Mapbox Expressway Corridor",
    "Route C - Mapbox Alternate Bypass"
  ];

  return json.routes.map((r, idx) => {
    const waypoints = r.geometry.coordinates.map(pt => [pt[1], pt[0]]);
    const distanceMiles = Math.round((r.distance * 0.000621371) * 10) / 10;
    const durationMinutes = Math.round((r.duration / 60) * 10) / 10;
    const durationTypical = r.duration_typical ? Math.round((r.duration_typical / 60) * 10) / 10 : durationMinutes;
    const liveDelayMinutes = Math.max(0, Math.round((durationMinutes - durationTypical) * 10) / 10);

    const maneuvers = [];
    if (r.legs && r.legs[0] && r.legs[0].steps) {
      r.legs[0].steps.forEach((st, sIdx) => {
        if (st.maneuver && st.maneuver.type !== 'depart') {
          const stepDist = (st.distance * 0.000621371).toFixed(1) + ' mi';
          const roadName = st.name || 'Connector';
          const text = st.maneuver.instruction || (st.maneuver.modifier ? `${st.maneuver.modifier} onto ${roadName}` : `Continue on ${roadName}`);
          maneuvers.push({
            step: sIdx + 1,
            text,
            dist: stepDist,
            coords: [st.maneuver.location[1], st.maneuver.location[0]]
          });
        }
      });
    }

    return {
      id: routeIds[idx] || `route-${idx + 1}`,
      provider: "Mapbox Traffic-Aware Directions API",
      routeIndex: idx,
      name: routeNames[idx] || `Mapbox Corridor Option ${idx + 1}`,
      distanceMiles,
      baseMinutes: durationTypical,
      trafficDurationMinutes: durationMinutes,
      liveDelayMinutes,
      waypoints,
      maneuvers: maneuvers.length > 0 ? maneuvers : undefined
    };
  });
}

/**
 * Main routing resolver: checks real routing engines with graceful fallback
 */
async function getRealRoutes({ startCoords, endCoords, startName, endName }) {
  const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN;
  let realRoutes = null;
  let providerUsed = 'Local Calibrated Network';

  // 1. Check Mapbox if token configured
  if (mapboxToken) {
    try {
      realRoutes = await fetchMapboxTrafficRoutes(startCoords, endCoords, mapboxToken);
      providerUsed = 'Mapbox Live Traffic';
      return { success: true, provider: providerUsed, routes: realRoutes };
    } catch (err) {
      console.warn('[RoutingEngine] Mapbox call failed, falling back to OSRM:', err.message);
    }
  }

  // 2. Query Open Source Routing Machine (OSRM)
  try {
    realRoutes = await fetchOsrmRoutes(startCoords, endCoords);
    providerUsed = 'OSRM (OpenStreetMap Road Network)';
    return {
      success: true,
      provider: providerUsed,
      routes: realRoutes
    };
  } catch (err) {
    console.warn('[RoutingEngine] OSRM call failed or offline, using fallback:', err.message);
  }

  // 3. Fallback to calibrated local geometry
  return {
    success: false,
    provider: 'Local Calibrated GIS Corridors (Offline Fallback)',
    routes: null
  };
}

module.exports = {
  getRealRoutes,
  fetchOsrmRoutes,
  fetchMapboxTrafficRoutes
};
