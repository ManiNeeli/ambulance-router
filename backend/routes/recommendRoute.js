const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { evaluateRoutes, loadDefaultRoutes } = require('../services/routeCalculator');
const { generateDispatcherExplanation } = require('../services/aiAdvisor');

// In-memory preemption state tracking
let activePreemptions = new Set();

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

    // Overlay live preemption states
    for (const corridorKey in data.corridors) {
      data.corridors[corridorKey].signals.forEach(sig => {
        if (activePreemptions.has(sig.id)) {
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

// POST /api/traffic-clearance
router.post('/traffic-clearance', (req, res) => {
  try {
    const { signalId, action = 'preempt' } = req.body;
    if (!signalId) {
      return res.status(400).json({ error: 'signalId is required' });
    }

    if (action === 'preempt') {
      activePreemptions.add(signalId);
    } else if (action === 'reset') {
      activePreemptions.delete(signalId);
    } else if (action === 'reset-all') {
      activePreemptions.clear();
    }

    res.json({
      success: true,
      signalId,
      action,
      activePreemptions: Array.from(activePreemptions),
      message: `Emergency preemption signal ${action === 'preempt' ? 'BROADCASTED (Green corridor locked)' : 'RESTORED to normal cycling'}`
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to execute traffic clearance', details: err.message });
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
      notes = ''
    } = req.body;

    // Evaluate candidate routes
    const evaluation = evaluateRoutes({
      startLocation,
      hospital,
      patientCondition,
      timeOfDay,
      weather,
      traffic
    });

    // Generate plain-language dispatcher explanation
    const aiExplanation = await generateDispatcherExplanation(evaluation);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      recommendedRoute: evaluation.recommendedRoute,
      allRoutes: evaluation.evaluatedRoutes,
      aiExplanation,
      context: evaluation.context,
      notes
    });
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
