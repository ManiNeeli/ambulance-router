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

    // Evaluate candidate routes with deterministic and traffic scoring
    const evaluation = evaluateRoutes({
      startLocation,
      hospital,
      patientCondition,
      timeOfDay,
      weather,
      traffic
    });

    // Check real routing engine for live traffic data if requested
    const corridorData = loadDetailedData();
    const startCoords = corridorData?.stations?.[startLocation]?.coords || [17.4278, 78.4503];
    const endCoords = corridorData?.hospitals?.[hospital]?.coords || [17.3785, 78.4735];

    let liveRouting = null;
    if (useLiveTraffic) {
      try {
        liveRouting = await getRealRoutes({ startCoords, endCoords });
      } catch (e) {
        console.warn('[RecommendRoute] Live routing fetch non-blocking error:', e.message);
      }
    }

    // Generate plain-language dispatcher explanation (real LLM or heuristic fallback)
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
