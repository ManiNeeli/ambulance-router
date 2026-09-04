const express = require('express');
const router = express.Router();
const { evaluateRoutes, loadDefaultRoutes } = require('../services/routeCalculator');
const { generateDispatcherExplanation } = require('../services/aiAdvisor');

// GET /api/routes-data
router.get('/routes-data', (req, res) => {
  try {
    const data = loadDefaultRoutes();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve routes data', details: err.message });
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
