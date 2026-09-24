# API Documentation: AI-Assisted Ambulance Router

Base URL: `http://localhost:5000`

---

## 1. Health Check
`GET /api/health`

Returns backend operational status and uptime.

**Response**:
```json
{
  "status": "online",
  "service": "AI-Assisted Ambulance Router Backend",
  "version": "1.0.0",
  "uptime": 128.4
}
```

---

## 2. Default Routes & Facilities Data
`GET /api/routes-data`

Returns available origin stations, destination hospitals, and baseline corridor templates.

**Response**:
```json
{
  "startLocations": ["Fire Station 3", "Fire Station 7", "Downtown EMS Base"],
  "hospitals": ["City General", "St. Mary's Medical Center", "Riverside Hospital"],
  "routeOptions": [
    { "name": "Route A - Main St", "baseMinutes": 8, "passesSchoolZone": true, "passesHighway": false },
    { "name": "Route B - Highway Bypass", "baseMinutes": 11, "passesSchoolZone": false, "passesHighway": true },
    { "name": "Route C - Residential Shortcut", "baseMinutes": 13, "passesSchoolZone": false, "passesHighway": false }
  ]
}
```

---

## 3. Detailed Geospatial Corridor & EVP Signals
`GET /api/detailed-corridor`

Returns rich lat/lng waypoints, smart traffic signals, school zone geofences, and turn maneuvers.

**Response**:
```json
{
  "stations": { ... },
  "hospitals": { ... },
  "schoolZone": {
    "name": "Oakridge Elementary District Zone",
    "speedLimitMph": 20,
    "polygon": [ [37.7775, -122.4205], ... ]
  },
  "corridors": {
    "route-a-main-st": {
      "id": "route-a-main-st",
      "name": "Route A - Main St",
      "distanceMiles": 3.2,
      "baseMinutes": 8,
      "waypoints": [ [37.7858, -122.4285], ... ],
      "signals": [
        { "id": "SIG-101", "name": "Post & Van Ness", "coords": [37.7830, -122.4250], "state": "red", "carsQueued": 14 }
      ],
      "maneuvers": [ ... ]
    }
  }
}
```

---

## 4. Evaluate & Recommend Route
`POST /api/recommend-route`

Computes AI safety tradeoffs, travel times, and plain-language dispatcher explanations.

**Request Body**:
```json
{
  "startLocation": "Fire Station 3",
  "hospital": "City General",
  "patientCondition": "critical",
  "timeOfDay": "08:15",
  "weather": "clear",
  "traffic": "moderate",
  "notes": ""
}
```

**Response**:
```json
{
  "success": true,
  "timestamp": "2026-09-24T15:50:00.000Z",
  "recommendedRoute": {
    "id": "route-c-residential-shortcut",
    "name": "Route C - Residential Shortcut",
    "adjustedMinutes": 15,
    "safetyScore": 90,
    "safetyLevel": "High",
    "isRecommended": true
  },
  "allRoutes": [ ... ],
  "aiExplanation": {
    "headline": "Recommend Route C - Residential Shortcut (15 min ETA, Safety: 90/100)",
    "priorityLevel": "CRITICAL (Code 3)",
    "primaryReason": "Both Highway and Main St corridors present elevated volatility...",
    "crewAdvisory": "Advise unit to maintain moderate speed over speed humps...",
    "aiModel": "Antigravity EMS Heuristic Reasoning Engine v1.0"
  },
  "context": { ... }
}
```

---

## 5. Traffic Signal Preemption (EVP)
`POST /api/traffic-clearance`

Forces emergency preemption or resets signal cycling.

**Request Body**:
```json
{
  "signalId": "SIG-101",
  "action": "preempt"
}
```

**Response**:
```json
{
  "success": true,
  "signalId": "SIG-101",
  "action": "preempt",
  "activePreemptions": ["SIG-101"],
  "message": "Emergency preemption signal BROADCASTED (Green corridor locked)"
}
```
