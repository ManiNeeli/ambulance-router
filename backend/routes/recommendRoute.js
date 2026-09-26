const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');

const { evaluateRoutes, loadDefaultRoutes } = require('../services/routeCalculator');
const { generateDispatcherExplanation } = require('../services/aiAdvisor');
const { getRealRoutes } = require('../services/realRoutingEngine');
const { requestMunicipalPreemption, terminateMunicipalPreemption } = require('../services/municipalEvpGateway');
const stateStore = require('../services/stateStore');
const websocketManager = require('../services/websocketManager');

// Production Rate Limiter: Prevent abuse/DDoS on emergency calculation routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this client, please try again later.' }
});

router.use(apiLimiter);

function loadDetailedData() {
  try {
    const raw = fs.readFileSync(path.join(__dirname, '../data/detailedRoutes.json'), 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load detailedRoutes.json:', err.message);
    return null;
  }
}

// GET /api/routes-data
router.get('/routes-data', (req, res) => {
  try {
    const data = loadDefaultRoutes();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve routes data', details: err.message });
  }
});

// GET /api/detailed-corridor
router.get('/detailed-corridor', (req, res) => {
  try {
    const data = loadDetailedData();
    if (!data) return res.status(500).json({ error: 'Detailed corridor data unavailable' });

    // Overlay persisted preemption states from stateStore
    const activePreemptions = stateStore.getActivePreemptions();
    for (const corridorKey in data.corridors) {
      data.corridors[corridorKey].signals.forEach(sig => {
        if (activePreemptions.includes(sig.id)) {
          sig.state = 'preempted';
          sig.carsQueued = 0;
        } else {
          sig.state = sig.defaultState || 'red';
        }
      });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve corridor details', details: err.message });
  }
});

// GET /api/live-routes (Point 1 & 2: Real Routing Engine & Live Traffic)
router.get('/live-routes', async (req, res) => {
  try {
    const { start = "17.4278,78.4503", end = "17.3785,78.4735" } = req.query;
    const startCoords = start.split(',').map(Number);
    const endCoords = end.split(',').map(Number);

    const routingResult = await getRealRoutes({ startCoords, endCoords });
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      startCoords,
      endCoords,
      provider: routingResult.provider,
      routes: routingResult.routes
    });
  } catch (err) {
    res.status(500).json({ error: 'Real routing engine query failed', details: err.message });
  }
});

// POST /api/telematics/gps (Point 3: Real GPS Telematics from device or phone)
router.post('/telematics/gps', (req, res) => {
  try {
    const {
      unitId = 'MED-4',
      lat,
      lng,
      speedMph = 0,
      heading = 0,
      altitude = 0,
      accuracy = 5
    } = req.body;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'lat and lng coordinates are required for GPS telemetry' });
    }

    // Persist in stateStore
    const telemetryRecord = stateStore.saveVehicleTelemetry(unitId, {
      lat,
      lng,
      speedMph,
      heading,
      altitude,
      accuracy
    });

    // Broadcast live over WebSocket to all connected CAD consoles
    websocketManager.broadcastTelemetry({
      unitId,
      lat,
      lng,
      speedMph,
      heading,
      accuracy,
      source: 'REAL_DEVICE_GPS',
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: `GPS telemetry ingested for unit ${unitId}`,
      record: telemetryRecord
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to ingest GPS telemetry', details: err.message });
  }
});

// POST /api/traffic-clearance (Point 5 & 6: Persistent Store & Municipal NTCIP EVP Gateway)
router.post('/traffic-clearance', async (req, res) => {
  try {
    const { signalId, action = 'preempt', unitId = 'MED-4', vehicleSpeedMph = 45, distanceRemainingMeters = 350 } = req.body;
    if (!signalId && action !== 'reset-all') {
      return res.status(400).json({ error: 'signalId is required' });
    }

    let result;
    if (action === 'preempt') {
      // Dispatches via Municipal NTCIP 1202 Gateway
      result = await requestMunicipalPreemption({
        signalId,
        unitId,
        vehicleSpeedMph,
        distanceRemainingMeters,
        sirenActive: true
      });
      // Broadcast state update to WebSockets
      websocketManager.broadcastSignalState(signalId, 'preempted', 18);
    } else if (action === 'reset') {
      result = await terminateMunicipalPreemption({ signalId, unitId });
      websocketManager.broadcastSignalState(signalId, 'red', 0);
    } else if (action === 'reset-all') {
      stateStore.clearAllPreemptions();
      websocketManager.broadcastSignalState('ALL', 'red', 0);
      result = { success: true, message: 'All signal preemptions cleared across municipal grid' };
    }

    res.json({
      success: true,
      signalId,
      action,
      activePreemptions: stateStore.getActivePreemptions(),
      preemptionDetails: stateStore.getPreemptionDetails(),
      gatewayResult: result
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to execute traffic clearance', details: err.message });
  }
});

// GET /api/cad-logs (Forensic Audit Trail)
router.get('/cad-logs', (req, res) => {
  try {
    const limit = parseInt(req.query.limit || 50, 10);
    const logs = stateStore.getDispatchLogs(limit);
    res.json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve CAD logs', details: err.message });
  }
});

/**
 * Intelligently places traffic preemption signals along the actual waypoints of a route
 */
function generateSignalsForRoute(corridorKey, routeName, waypoints, maneuvers) {
  if (!waypoints || waypoints.length < 3) return [];
  const signals = [];
  const targetFractions = [0.22, 0.48, 0.72, 0.90];
  const routeLetter = corridorKey.includes('route-a') ? 'A' : corridorKey.includes('route-b') ? 'B' : 'C';

  targetFractions.forEach((frac, i) => {
    const idx = Math.min(waypoints.length - 1, Math.floor(waypoints.length * frac));
    const pt = waypoints[idx];
    
    let name = '';
    if (maneuvers && maneuvers.length > 0) {
      const closeManeuver = maneuvers.find(m => {
        if (!m.coords) return false;
        const d = Math.hypot(m.coords[0] - pt[0], m.coords[1] - pt[1]);
        return d < 0.015;
      });
      if (closeManeuver) {
        name = closeManeuver.text.replace(/^(Turn left onto |Turn right onto |Continue on |Head \w+ on )/i, '');
      }
    }
    if (!name || name.length > 30) {
      const cleanRouteName = routeName.replace(/^Route [ABC] - /, '').split(' ')[0] || 'Corridor';
      name = `${cleanRouteName} Junction ${i + 1}`;
    }

    signals.push({
      id: `SIG-HYD-${routeLetter}${i + 1}`,
      name: `${name} Signal`,
      coords: [Number(pt[0].toFixed(5)), Number(pt[1].toFixed(5))],
      crossStreet: name,
      carsQueued: Math.floor(12 + Math.random() * 18),
      defaultState: 'red'
    });
  });

  return signals;
}

// POST /api/recommend-route
router.post('/recommend-route', async (req, res) => {
  try {
    const {
      startLocation,
      hospital,
      patientCondition = 'critical',
      timeOfDay,
      weather = 'clear',
      traffic = 'moderate',
      useLiveTraffic = true,
      notes = ''
    } = req.body;

    const corridorData = loadDetailedData();
    const startCoords = corridorData?.stations?.[startLocation]?.coords || [17.4278, 78.4503];
    const endCoords = corridorData?.hospitals?.[hospital]?.coords || [17.3785, 78.4735];

    // 1. Fetch real road routes for the selected coordinates
    let liveRouting = null;
    if (useLiveTraffic !== false) {
      try {
        liveRouting = await getRealRoutes({
          startCoords,
          endCoords,
          startName: startLocation,
          endName: hospital
        });
      } catch (e) {
        console.warn('[RecommendRoute] Live routing fetch non-blocking error:', e.message);
      }
    }

    // 2. Prepare candidates from liveRouting or fallback
    let candidateRoutes = [];
    if (liveRouting && liveRouting.success && liveRouting.routes?.length > 0) {
      candidateRoutes = liveRouting.routes;
    }

    // 3. Evaluate candidate routes with deterministic and traffic scoring
    const evaluation = evaluateRoutes({
      candidateRoutes,
      startLocation,
      hospital,
      patientCondition,
      timeOfDay,
      weather,
      traffic,
      schoolZonePolygon: corridorData?.schoolZone?.polygon
    });

    // 4. Build dynamic corridors with exact road geometry and signals
    const dynamicCorridors = {};
    const routeKeys = ["route-a-main-st", "route-b-highway-bypass", "route-c-residential-shortcut"];
    const activePreemptions = stateStore.getActivePreemptions();

    evaluation.evaluatedRoutes.forEach((evaluatedRoute, idx) => {
      const k = routeKeys[idx] || evaluatedRoute.id || `route-${idx + 1}`;
      const matchingLive = liveRouting?.routes?.find(r => r.id === evaluatedRoute.id) || liveRouting?.routes?.[idx];
      
      const waypoints = evaluatedRoute.waypoints?.length ? evaluatedRoute.waypoints : (matchingLive?.waypoints || []);
      const maneuvers = evaluatedRoute.maneuvers?.length ? evaluatedRoute.maneuvers : (matchingLive?.maneuvers || []);

      // Generate or retrieve signals for this corridor
      let signals = [];
      const isDefaultPunjaguttaOsmania = (startLocation === "Punjagutta Fire Station" && hospital === "Osmania General Hospital");
      if (isDefaultPunjaguttaOsmania && corridorData?.corridors?.[k]?.signals) {
        signals = JSON.parse(JSON.stringify(corridorData.corridors[k].signals));
      } else {
        signals = generateSignalsForRoute(k, evaluatedRoute.name, waypoints, maneuvers);
      }

      // Apply active preemption states
      signals.forEach(sig => {
        if (activePreemptions.includes(sig.id)) {
          sig.state = 'preempted';
          sig.carsQueued = 0;
        } else {
          sig.state = sig.defaultState || 'red';
        }
      });

      dynamicCorridors[k] = {
        id: k,
        name: evaluatedRoute.name,
        distanceMiles: evaluatedRoute.distanceMiles || matchingLive?.distanceMiles || 4.0,
        baseMinutes: evaluatedRoute.baseMinutes || matchingLive?.baseMinutes || 10,
        adjustedMinutes: evaluatedRoute.adjustedMinutes,
        trafficDurationMinutes: matchingLive?.trafficDurationMinutes || evaluatedRoute.baseMinutes,
        liveDelayMinutes: matchingLive?.liveDelayMinutes || 0,
        safetyScore: evaluatedRoute.safetyScore,
        safetyLevel: evaluatedRoute.safetyLevel,
        passesSchoolZone: evaluatedRoute.passesSchoolZone,
        passesHighway: evaluatedRoute.passesHighway,
        waypoints,
        trafficSegments: matchingLive?.trafficSegments || [],
        congestionSummary: matchingLive?.congestionSummary || null,
        maneuvers,
        signals
      };
    });

    // 5. Generate plain-language dispatcher explanation (real LLM or heuristic fallback)
    const aiExplanation = await generateDispatcherExplanation(evaluation);

    // Save to persistent audit log
    stateStore.addDispatchLog({
      type: "ROUTE_RECOMMENDATION_ISSUED",
      startLocation,
      hospital,
      patientCondition,
      recommendedRoute: evaluation.recommendedRoute?.name,
      safetyScore: evaluation.recommendedRoute?.safetyScore,
      adjustedMinutes: evaluation.recommendedRoute?.adjustedMinutes
    });

    const responsePayload = {
      success: true,
      timestamp: new Date().toISOString(),
      recommendedRoute: evaluation.recommendedRoute,
      allRoutes: evaluation.evaluatedRoutes,
      corridors: dynamicCorridors,
      aiExplanation,
      liveRouting: liveRouting ? {
        provider: liveRouting.provider,
        active: liveRouting.success
      } : null,
      context: evaluation.context,
      notes
    };

    // Broadcast recommendation over WebSocket to connected dispatch screens
    websocketManager.broadcastDispatchRecommendation(responsePayload);

    res.json(responsePayload);
  } catch (err) {
    console.error('Error processing route recommendation:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to compute route recommendation',
      details: err.message
    });
  }
});

module.exports = router;
