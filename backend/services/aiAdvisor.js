/**
 * AI Advisor Service
 * Generates plain-language tradeoffs and EMS dispatcher recommendations.
 * Supports LLM API (Gemini / OpenAI) with intelligent heuristic generation.
 */

async function generateDispatcherExplanation(evaluationResult) {
  const { evaluatedRoutes, recommendedRoute, context } = evaluationResult;
  const { startLocation, hospital, patientCondition, timeOfDay, weather, traffic, isSchoolHours, isRushHour } = context;

  // Check if external LLM is configured
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (geminiApiKey) {
    try {
      const llmResponse = await callGemini(geminiApiKey, evaluationResult);
      if (llmResponse) return llmResponse;
    } catch (err) {
      console.warn("Gemini API call failed, using built-in reasoning engine:", err.message);
    }
  }

  if (openaiApiKey) {
    try {
      const llmResponse = await callOpenAI(openaiApiKey, evaluationResult);
      if (llmResponse) return llmResponse;
    } catch (err) {
      console.warn("OpenAI API call failed, using built-in reasoning engine:", err.message);
    }
  }

  // Built-in EMS Dispatcher Reasoning Engine
  return generateDeterministicExplanation(evaluationResult);
}

function generateDeterministicExplanation(evaluationResult) {
  const { evaluatedRoutes, recommendedRoute, context } = evaluationResult;
  const { startLocation, hospital, patientCondition, timeOfDay, weather, traffic, isSchoolHours, isRushHour } = context;

  const rejectedRoutes = evaluatedRoutes.filter(r => !r.isRecommended);
  const conditionLabel = patientCondition === 'critical' ? 'CRITICAL (Code 3)' : patientCondition === 'emergent' ? 'EMERGENT (Code 2)' : 'ROUTINE (Code 1)';

  // Key tradeoff deduction
  let tradeoffSummary = "";
  const schoolRoute = evaluatedRoutes.find(r => r.passesSchoolZone);
  const highwayRoute = evaluatedRoutes.find(r => r.passesHighway);
  const residentialRoute = evaluatedRoutes.find(r => !r.passesSchoolZone && !r.passesHighway);

  if (recommendedRoute.id === highwayRoute?.id) {
    if (isSchoolHours && schoolRoute) {
      tradeoffSummary = `Route A (Main St) is normally fast (8 min base), but active school hours at ${timeOfDay} impose severe pedestrian risks, 20mph limits, and school bus stops (+6m delay). Highway Bypass provides uninterrupted arterial velocity to ${hospital}.`;
    } else {
      tradeoffSummary = `Highway Bypass leverages uninterrupted grade-separated lanes, saving valuable transit minutes without residential intersection hazards.`;
    }
  } else if (recommendedRoute.id === residentialRoute?.id) {
    tradeoffSummary = `Both Highway and Main St corridors present elevated volatility due to ${weather !== 'clear' ? weather + ' conditions' : 'congestion'}. The Residential Shortcut offers the most predictable travel envelope (${recommendedRoute.adjustedMinutes} min) with superior safety metrics (${recommendedRoute.safetyScore}/100).`;
  } else {
    // School route or Main St
    if (!isSchoolHours) {
      tradeoffSummary = `Main St represents the fastest direct path (${recommendedRoute.adjustedMinutes} min) to ${hospital}. Outside of active school hours, pedestrian density is minimal and corridor traffic is moving smoothly.`;
    } else {
      tradeoffSummary = `Main St offers the absolute fastest response window (${recommendedRoute.adjustedMinutes} min). Drivers must maintain active siren vigilance through the school zone.`;
    }
  }

  // Format bulleted alternatives
  const alternativesAnalysis = rejectedRoutes.map(route => {
    let reason = "";
    if (route.passesSchoolZone && isSchoolHours) {
      reason = `Slower (${route.adjustedMinutes}m) due to active school zones, reduced speed limits, and extreme pedestrian hazard.`;
    } else if (route.passesHighway && (isRushHour || weather !== 'clear' || traffic === 'heavy' || traffic === 'gridlock')) {
      reason = `Elevated risk index (${route.safetyLevel}) due to ${weather !== 'clear' ? weather + ' hazards' : 'highway congestion'}; transit time estimated at ${route.adjustedMinutes}m.`;
    } else {
      reason = `Estimated transit is ${route.adjustedMinutes}m (${route.adjustedMinutes > recommendedRoute.adjustedMinutes ? `+${(route.adjustedMinutes - recommendedRoute.adjustedMinutes).toFixed(1)}m longer` : 'lower safety margin'}). Safety score: ${route.safetyScore}/100.`;
    }
    return {
      name: route.name,
      adjustedMinutes: route.adjustedMinutes,
      safetyScore: route.safetyScore,
      reason
    };
  });

  // Actionable advisory for ambulance crew
  let crewAdvisory = "";
  if (recommendedRoute.passesHighway) {
    crewAdvisory = weather === 'rain' || weather === 'snow'
      ? "Advise unit to watch bridge decks for slick surfaces and maintain 3-second trailing clearance."
      : "Advise unit to take direct on-ramp and coordinate with traffic management for highway lane clearance.";
  } else if (recommendedRoute.passesSchoolZone) {
    crewAdvisory = "Advise unit to throttle sirens if entering school zones to prevent panic, exercise extreme intersection caution.";
  } else {
    crewAdvisory = "Advise unit to maintain moderate speed over speed humps and yield to local neighborhood cross-traffic.";
  }

  return {
    headline: `Recommend ${recommendedRoute.name} (${recommendedRoute.adjustedMinutes} min ETA, Safety: ${recommendedRoute.safetyScore}/100)`,
    priorityLevel: conditionLabel,
    primaryReason: tradeoffSummary,
    crewAdvisory,
    alternativesAnalysis,
    aiModel: "Antigravity EMS Heuristic Reasoning Engine v1.0"
  };
}

async function callGemini(apiKey, evaluationResult) {
  // Optional Gemini API call implementation
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const prompt = `You are an expert 911 EMS ambulance dispatch supervisor. 
Given the following routing analysis:
${JSON.stringify(evaluationResult, null, 2)}

Provide a concise, realistic dispatcher briefing in JSON format with keys:
- headline (string)
- priorityLevel (string)
- primaryReason (string explaining why the recommended route was selected over faster or risky alternatives)
- crewAdvisory (string with operational tactical driving instruction for the paramedic unit)
- alternativesAnalysis (array of {name, adjustedMinutes, safetyScore, reason})
Return raw JSON only.`;

  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    })
  });

  if (!resp.ok) throw new Error(`Gemini HTTP ${resp.status}`);
  const data = await resp.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;
  const parsed = JSON.parse(text);
  parsed.aiModel = "Gemini 1.5 Flash";
  return parsed;
}

async function callOpenAI(apiKey, evaluationResult) {
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You are an expert 911 EMS dispatch supervisor explaining ambulance route tradeoffs.' },
        { role: 'user', content: JSON.stringify(evaluationResult) }
      ]
    })
  });

  if (!resp.ok) throw new Error(`OpenAI HTTP ${resp.status}`);
  const data = await resp.json();
  const parsed = JSON.parse(data.choices[0].message.content);
  parsed.aiModel = "OpenAI GPT-4o-mini";
  return parsed;
}

module.exports = {
  generateDispatcherExplanation
};
