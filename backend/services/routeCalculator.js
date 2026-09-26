const fs = require('fs');
const path = require('path');

// Load default route definitions
function loadDefaultRoutes() {
  const possiblePaths = [
    path.join(__dirname, '../data/routes.json'),
    path.join(__dirname, '../../data/routes.json'),
    path.resolve(process.cwd(), 'backend/data/routes.json'),
    path.resolve(process.cwd(), 'data/routes.json')
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        return JSON.parse(fs.readFileSync(p, 'utf8'));
      } catch (e) {
        console.warn(`[RouteCalculator] Failed parsing ${p}:`, e.message);
      }
    }
  }

  return {
    startLocations: [
      "Punjagutta Fire Station",
      "Madhapur Fire Station",
      "Telangana Secretariat Fire Command",
      "Secunderabad Fire Station",
      "Gowliguda Fire Station",
      "GVK EMRI 108 Central EMS Base"
    ],
    hospitals: [
      "Osmania General Hospital",
      "NIMS Hospital (Punjagutta)",
      "Apollo Hospitals (Jubilee Hills)",
      "Gandhi Hospital (Secunderabad)",
      "AIG Hospitals (Gachibowli)",
      "Cyber Towers Incident Zone",
      "Charminar Heritage Incident Zone"
    ],
    routeOptions: [
      { id: "route-a-main-st", name: "Route A - Lakdikapul & Abids Arterial", baseMinutes: 10, passesSchoolZone: true, passesHighway: false },
      { id: "route-b-highway-bypass", name: "Route B - PVNR Expressway Corridor", baseMinutes: 13, passesSchoolZone: false, passesHighway: true },
      { id: "route-c-residential-shortcut", name: "Route C - Secretariat & Tank Bund Bypass", baseMinutes: 15, passesSchoolZone: false, passesHighway: false }
    ]
  };
}

// Point-in-polygon GIS geofencing check
function isPointInPolygon(point, vs) {
  if (!vs || vs.length < 3 || !point) return false;
  const x = point[0], y = point[1];
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0], yi = vs[i][1];
    const xj = vs[j][0], yj = vs[j][1];
    const intersect = ((yi > y) !== (yj > y))
        && (x < (xj - x) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Calculates adjusted travel time, safety scores, and risk factors for all candidate routes.
 * Supports dynamic live candidate routes from Mapbox/OSRM.
 */
function evaluateRoutes({
  candidateRoutes = null,
  startLocation = "Punjagutta Fire Station",
  hospital = "Osmania General Hospital",
  patientCondition = "critical",
  timeOfDay = "08:15",
  weather = "clear",
  traffic = "moderate",
  schoolZonePolygon = null
}) {
  const routesData = loadDefaultRoutes();
  const candidates = (candidateRoutes && candidateRoutes.length > 0)
    ? candidateRoutes
    : routesData.routeOptions;

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

  // Dynamic baseline for relative speed comparison regardless of physical trip distance
  const minBaseMinutes = Math.min(...candidates.map(c => Number(c.baseMinutes) || 10));
  const timeBaseline = minBaseMinutes + 12;

  const evaluated = candidates.map((route, idx) => {
    let baseMinutes = Number(route.baseMinutes) || 10;
    let distanceMiles = Number(route.distanceMiles) || 3.5;
    let adjustedMinutes = baseMinutes;
    let safetyScore = 95; // Base high safety score
    const riskFactors = [];
    const favorableFactors = [];

    // Dynamically detect school zone if not explicitly set
    let passesSchoolZone = route.passesSchoolZone;
    if (passesSchoolZone === undefined) {
      if (schoolZonePolygon && route.waypoints && route.waypoints.length > 0) {
        passesSchoolZone = route.waypoints.some((pt, pIdx) => pIdx % 5 === 0 && isPointInPolygon(pt, schoolZonePolygon));
      } else {
        passesSchoolZone = (idx === 0 && route.name?.toLowerCase().includes('arterial'));
      }
    }

    // Dynamically detect highway/expressway if not explicitly set
    let passesHighway = route.passesHighway;
    if (passesHighway === undefined) {
      const text = `${route.name || ''} ${route.id || ''}`.toLowerCase();
      passesHighway = text.includes('highway') || text.includes('expressway') || text.includes('bypass') || text.includes('pvnr') || idx === 1;
    }

    // 1. School Zone Effect
    if (passesSchoolZone) {
      if (isSchoolHours) {
        adjustedMinutes += 6;
        safetyScore -= 38;
        riskFactors.push("Active School Zone: Flashing lights (20mph), student crosswalks, school bus halts");
      } else {
        safetyScore -= 5;
        favorableFactors.push("Outside active school hours, school zone flow is clear");
      }
    } else {
      favorableFactors.push("Avoids all school zones and student crosswalk hazards");
    }

    // 2. Highway Effect
    if (passesHighway) {
      if (isRushHour) {
        const rushPenalty = traffic === 'gridlock' ? 10 : traffic === 'heavy' ? 7 : 4;
        adjustedMinutes += rushPenalty;
        safetyScore -= 18;
        riskFactors.push(`Highway peak-hour congestion (+${rushPenalty}m delay risk)`);
      } else if (isLateNight) {
        adjustedMinutes = Math.max(3, adjustedMinutes - 2);
        favorableFactors.push("Uncongested highway allows rapid straight-line transit");
      } else {
        favorableFactors.push("Direct arterial corridor with high speed limit");
      }
    }

    // 3. Residential / Secondary Effect
    if (!passesSchoolZone && !passesHighway) {
      adjustedMinutes += 1;
      favorableFactors.push("Predictable neighborhood roads, consistent speed, no highway pile-ups");
      if (patientCondition === 'routine' || patientCondition === 'emergent') {
        safetyScore += 5;
        favorableFactors.push("Low vibration / smooth pavement ideal for patient stabilization");
      }
    }

    // 4. Weather Impact
    if (weather === 'rain') {
      if (passesHighway) {
        adjustedMinutes += 3;
        safetyScore -= 22;
        riskFactors.push("Wet highway pavement: Hydroplaning hazard at high speeds");
      } else {
        adjustedMinutes += 1.5;
        safetyScore -= 8;
        riskFactors.push("Slick surface conditions");
      }
    } else if (weather === 'snow') {
      if (passesHighway) {
        adjustedMinutes += 6;
        safetyScore -= 35;
        riskFactors.push("Highway black ice danger & reduced stopping distances");
      } else if (!passesSchoolZone && !passesHighway) {
        adjustedMinutes += 4;
        safetyScore -= 20;
        riskFactors.push("Residential secondary roads may have unplowed snow accumulation");
      } else {
        adjustedMinutes += 3;
        safetyScore -= 15;
        riskFactors.push("Main arterial plowed, but slush reducing cornering grip");
      }
    } else if (weather === 'fog') {
      if (passesHighway) {
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
      const heavyPenalty = passesHighway ? 5 : 3;
      adjustedMinutes += heavyPenalty;
      safetyScore -= 15;
      riskFactors.push(`Heavy traffic bottlenecks (+${heavyPenalty}m delay)`);
    } else if (traffic === 'gridlock') {
      const gridlockPenalty = passesHighway ? 11 : 6;
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

    // Recommendation Score calculation (relative to timeBaseline)
    let recommendationScore = 0;
    if (patientCondition === 'critical') {
      recommendationScore = (safetyScore * 0.4) + ((timeBaseline - adjustedMinutes) * 3.5);
      if (passesSchoolZone && isSchoolHours) {
        recommendationScore -= 25;
      }
    } else if (patientCondition === 'emergent') {
      recommendationScore = (safetyScore * 0.6) + ((timeBaseline - adjustedMinutes) * 2.2);
    } else {
      recommendationScore = (safetyScore * 0.85) + ((timeBaseline - adjustedMinutes) * 1.0);
    }

    const defaultIds = ['route-a-main-st', 'route-b-highway-bypass', 'route-c-residential-shortcut'];
    const resolvedId = route.id || defaultIds[idx] || (
      route.name?.includes('Route A') ? 'route-a-main-st' :
      route.name?.includes('Route B') ? 'route-b-highway-bypass' :
      route.name?.includes('Route C') ? 'route-c-residential-shortcut' :
      `route-${idx + 1}`
    );

    return {
      id: resolvedId,
      name: route.name,
      distanceMiles,
      baseMinutes,
      adjustedMinutes,
      safetyScore,
      safetyLevel,
      passesSchoolZone,
      passesHighway,
      riskFactors,
      favorableFactors,
      recommendationScore: Math.round(recommendationScore * 10) / 10,
      waypoints: route.waypoints || [],
      maneuvers: route.maneuvers || []
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
