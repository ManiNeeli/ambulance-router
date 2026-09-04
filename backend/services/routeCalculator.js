const fs = require('fs');
const path = require('path');

// Load default route definitions
function loadDefaultRoutes() {
  try {
    const raw = fs.readFileSync(path.join(__dirname, '../../data/routes.json'), 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load routes.json, using fallback:', err.message);
    return {
      startLocations: ["Fire Station 3", "Fire Station 7", "Downtown EMS Base"],
      hospitals: ["City General", "St. Mary's Medical Center", "Riverside Hospital"],
      routeOptions: [
        { name: "Route A - Main St", baseMinutes: 8, passesSchoolZone: true, passesHighway: false },
        { name: "Route B - Highway Bypass", baseMinutes: 11, passesSchoolZone: false, passesHighway: true },
        { name: "Route C - Residential Shortcut", baseMinutes: 13, passesSchoolZone: false, passesHighway: false }
      ]
    };
  }
}

/**
 * Calculates adjusted travel time, safety scores, and risk factors for all candidate routes.
 */
function evaluateRoutes({
  startLocation = "Fire Station 3",
  hospital = "City General",
  patientCondition = "critical",
  timeOfDay = "08:15",
  weather = "clear",
  traffic = "moderate"
}) {
  const routesData = loadDefaultRoutes();
  const candidates = routesData.routeOptions;

  // Parse time
  const [hoursStr, minutesStr] = (timeOfDay || "08:15").split(':');
  const hours = parseInt(hoursStr || 8, 10);
  const minutes = parseInt(minutesStr || 0, 10);
  const timeDecimal = hours + (minutes / 60);

  // Time-based condition flags
  const isSchoolHours = (timeDecimal >= 7.5 && timeDecimal <= 9.0) || (timeDecimal >= 14.5 && timeDecimal <= 16.0);
  const isMorningRush = (timeDecimal >= 7.5 && timeDecimal <= 9.5);
  const isEveningRush = (timeDecimal >= 16.5 && timeDecimal <= 18.75);
  const isRushHour = isMorningRush || isEveningRush;
  const isLateNight = (timeDecimal >= 22.0 || timeDecimal <= 5.0);

  const evaluated = candidates.map(route => {
    let adjustedMinutes = route.baseMinutes;
    let safetyScore = 95; // Base high safety score
    const riskFactors = [];
    const favorableFactors = [];

    // 1. School Zone Effect
    if (route.passesSchoolZone) {
      if (isSchoolHours) {
        adjustedMinutes += 6;
        safetyScore -= 38;
        riskFactors.push("Active School Zone: Flashing lights (20mph), student crosswalks, school bus halts");
      } else {
        safetyScore -= 5;
        favorableFactors.push("Outside active school hours, school zone flow is clear");
      }
    } else {
      favorableFactors.push("Avoids all school zones and school bus zones");
    }

    // 2. Highway Effect
    if (route.passesHighway) {
      if (isRushHour) {
        const rushPenalty = traffic === 'gridlock' ? 10 : traffic === 'heavy' ? 7 : 4;
        adjustedMinutes += rushPenalty;
        safetyScore -= 18;
        riskFactors.push(`Highway peak-hour congestion (+${rushPenalty}m delay risk)`);
      } else if (isLateNight) {
        adjustedMinutes = Math.max(5, adjustedMinutes - 2);
        favorableFactors.push("Uncongested highway allows rapid straight-line transit");
      } else {
        favorableFactors.push("Direct arterial corridor with high speed limit");
      }
    }

    // 3. Residential Effect
    if (!route.passesSchoolZone && !route.passesHighway) {
      adjustedMinutes += 1;
      favorableFactors.push("Predictable neighborhood roads, consistent speed, no highway pile-ups");
      if (patientCondition === 'routine' || patientCondition === 'emergent') {
        safetyScore += 5;
        favorableFactors.push("Low vibration / smooth pavement ideal for patient stabilization");
      }
    }

    // 4. Weather Impact
    if (weather === 'rain') {
      if (route.passesHighway) {
        adjustedMinutes += 3;
        safetyScore -= 22;
        riskFactors.push("Wet highway pavement: Hydroplaning hazard at high speeds");
      } else {
        adjustedMinutes += 1.5;
        safetyScore -= 8;
        riskFactors.push("Slick surface conditions");
      }
    } else if (weather === 'snow') {
      if (route.passesHighway) {
        adjustedMinutes += 6;
        safetyScore -= 35;
        riskFactors.push("Highway black ice danger & reduced stopping distances");
      } else if (!route.passesSchoolZone && !route.passesHighway) {
        adjustedMinutes += 4;
        safetyScore -= 20;
        riskFactors.push("Residential secondary roads may have unplowed snow accumulation");
      } else {
        adjustedMinutes += 3;
        safetyScore -= 15;
        riskFactors.push("Main arterial plowed, but slush reducing cornering grip");
      }
    } else if (weather === 'fog') {
      if (route.passesHighway) {
        adjustedMinutes += 4;
        safetyScore -= 25;
        riskFactors.push("Dense highway fog: High-speed multi-vehicle accident hazard");
      } else {
        adjustedMinutes += 2;
        safetyScore -= 12;
        riskFactors.push("Reduced intersection visibility");
      }
    } else {
      favorableFactors.push("Clear weather: optimal traction and visibility");
    }

    // 5. Traffic Impact
    if (traffic === 'light') {
      favorableFactors.push("Light traffic: free-flowing corridor");
    } else if (traffic === 'moderate') {
      adjustedMinutes += 1;
      safetyScore -= 5;
    } else if (traffic === 'heavy') {
      const heavyPenalty = route.passesHighway ? 5 : 3;
      adjustedMinutes += heavyPenalty;
      safetyScore -= 15;
      riskFactors.push(`Heavy traffic bottlenecks (+${heavyPenalty}m delay)`);
    } else if (traffic === 'gridlock') {
      const gridlockPenalty = route.passesHighway ? 11 : 6;
      adjustedMinutes += gridlockPenalty;
      safetyScore -= 28;
      riskFactors.push(`Severe gridlock: Sirens may struggle to clear lane clearance (+${gridlockPenalty}m delay)`);
    }

    // Rounding & Clamping
    adjustedMinutes = Math.round(adjustedMinutes * 10) / 10;
    safetyScore = Math.max(15, Math.min(100, Math.round(safetyScore)));

    // Safety classification
    let safetyLevel = "High";
    if (safetyScore < 45) safetyLevel = "Hazardous";
    else if (safetyScore < 65) safetyLevel = "Caution";
    else if (safetyScore < 85) safetyLevel = "Moderate";

    // Recommendation Score calculation
    // Critical (Code 3): High weight on speed, but avoids dangerous bottlenecks/pedestrians
    // Emergent (Code 2): Balanced
    // Routine (Code 1): High weight on safety/smooth ride
    let recommendationScore = 0;
    if (patientCondition === 'critical') {
      // Every minute delay is heavily penalized (-4 pts/min), safety penalized (-1 pt/lost safety)
      recommendationScore = (safetyScore * 0.4) + ((25 - adjustedMinutes) * 3.5);
      // Hard penalty if school zone during school hours with critical patient
      if (route.passesSchoolZone && isSchoolHours) {
        recommendationScore -= 25; // Don't risk running sirens through children crossing
      }
    } else if (patientCondition === 'emergent') {
      recommendationScore = (safetyScore * 0.6) + ((25 - adjustedMinutes) * 2.2);
    } else {
      // Routine
      recommendationScore = (safetyScore * 0.85) + ((25 - adjustedMinutes) * 1.0);
    }

    return {
      id: route.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: route.name,
      baseMinutes: route.baseMinutes,
      adjustedMinutes,
      safetyScore,
      safetyLevel,
      passesSchoolZone: route.passesSchoolZone,
      passesHighway: route.passesHighway,
      riskFactors,
      favorableFactors,
      recommendationScore: Math.round(recommendationScore * 10) / 10
    };
  });

  // Sort by recommendation score descending
  evaluated.sort((a, b) => b.recommendationScore - a.recommendationScore);

  // Mark the top one as recommended
  evaluated.forEach((r, idx) => {
    r.isRecommended = (idx === 0);
  });

  return {
    evaluatedRoutes: evaluated,
    recommendedRoute: evaluated[0],
    context: {
      startLocation,
      hospital,
      patientCondition,
      timeOfDay,
      weather,
      traffic,
      isSchoolHours,
      isRushHour,
      isLateNight
    }
  };
}

module.exports = {
  loadDefaultRoutes,
  evaluateRoutes
};
