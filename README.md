# 🚑 AI-Assisted Ambulance Router & Green-Wave Preemption (CAD-ITS)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v22.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-purple.svg)](https://vitejs.dev/)
[![Leaflet](https://img.shields.io/badge/Leaflet-GIS-brightgreen.svg)](https://leafletjs.com/)

> **Next-Generation Computer-Aided Dispatch (CAD) & Intelligent Transportation System (ITS)**: An AI layer that evaluates transit safety tradeoffs for emergency vehicles, explains decisions in plain language, clears city traffic using **Emergency Vehicle Preemption (EVP) / Green Wave Corridor**, and visualizes real-time transit on interactive GIS tactical maps.

---

## 🌟 Key Capabilities

### 1. Dynamic Routing & Safety Penalty Engine
- **Corridor Evaluation**: Evaluates multiple arterial paths against real-time hazards.
- **School Zone Geofencing**: Detects active school zones (20 MPH limits, pedestrian hazards, school bus queues) and applies dynamic delay (+6m) and safety index penalties.
- **Weather Physics Modeling**: Accounts for hydroplaning on highways during rain, black ice/slush during snow, and reduced visibility in dense fog.
- **Patient Acuity Priority**: Custom optimization based on dispatch priority code (Code 3 Critical vs Code 2 Emergent vs Code 1 Routine).

### 2. Emergency Vehicle Preemption (EVP) / Green Wave Traffic Clearance
- **Smart Intersections**: Real-world traffic signal nodes placed along corridors with queue tracking.
- **AI Automated Green Wave**: Detects ambulance approaching within 400m radius and switches signals to green wave priority, clearing queued vehicles to the shoulder.
- **Dispatcher Override**: Operators can manually force preemption on individual intersections or invoke full-corridor clearance.

### 3. Interactive GIS Real-World Tactical Map
- **Multi-Base Layer Cartography**: Switch seamlessly between **🌑 Dark Tactical**, **🛰️ Satellite Imagery**, and **🗺️ Streets View**.
- **Dynamic Vehicle Animation**: Real-time ambulance marker with compass heading rotation and alternating red/blue emergency strobes.
- **Traffic Flow Polylines**: Animated flowing lines visualizing vehicular transit velocity.
- **Weather Overlays**: Real-time atmospheric particle effects (rain, snow, fog).

### 4. Patient Biometric Telemetry & Dynamic ECG Monitor
- **Live Electrocardiogram (ECG)**: Diagnostic Lead II tracing with real-time waveform glow.
- **Dynamic Vitals**: Pulsing Heart Rate (BPM), Non-Invasive Blood Pressure (NIBP), $SpO_2$ Oxygen Saturation, and Glasgow Coma Scale (GCS).
- **Crew Identifiers**: Rig callsign (`MEDIC-41`) and Paramedic Lead in charge.

### 5. CAD Tactical Radio Intercom
- **Push-to-Talk (PTT)**: Transmits simulated voice dispatch audio with animated audio equalizer waveform bars.
- **Channels**: Switch between `CH 1: EMS PRIMARY`, `CH 2: TRAFFIC COMMAND`, and `CH 3: HOSPITAL DIRECT`.
- **Tactical Presets**: Immediate traffic escort requests, hospital trauma bay alerts, and all-signals clear commands.

### 6. Multi-Palette Dynamic Theme System
- 🌌 **Cobalt Cyberpunk** (High-Tech Electric Cyan & Deep Navy)
- 🌲 **Tactical Emerald** (Matrix Green Phosphor Night Vision)
- 🚨 **Crimson Apex** (High-Intensity Emergency Response)
- ☀️ **Nordic Medical Light** (Daylight Clinical Mode)

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ (tested on v22.14.0)
- npm v9+

### One-Command Setup & Run
```bash
# Clone the repository
git clone https://github.com/ManiNeeli/ambulance-router.git
cd ambulance-router

# Install all dependencies (backend + frontend)
npm run install:all

# Option A: Run Full Application in Production Mode (Port 5000)
npm run build
npm start

# Option B: Run in Development Mode with Live Hot Reload (Port 5173 + 5000)
# Terminal 1:
npm run dev:backend

# Terminal 2:
npm run dev:frontend
```

Open your browser to:
- **Development Workstation**: [http://localhost:5173](http://localhost:5173)
- **Production Full-Stack**: [http://localhost:5000](http://localhost:5000)

---

## 📁 Repository Structure

```
ambulance-router/
├── backend/
│   ├── data/
│   │   └── detailedRoutes.json    # Geospatial waypoints, signals, and school zones
│   ├── routes/
│   │   └── recommendRoute.js      # REST API endpoints
│   ├── services/
│   │   ├── aiAdvisor.js           # Tradeoff reasoning & LLM advisor
│   │   └── routeCalculator.js     # Routing physics & safety index engine
│   ├── package.json
│   └── server.js                  # Express application on port 5000
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DispatchForm.jsx           # Incident parameters & scenario presets
│   │   │   ├── Header.jsx                 # Tactical header with theme selector
│   │   │   ├── InteractiveLeafletMap.jsx  # Multi-layer Leaflet GIS tactical map
│   │   │   ├── LiveTelemetryBar.jsx       # Speedometer HUD & event log ticker
│   │   │   ├── PatientVitalsMonitor.jsx   # ECG waveform & patient vitals
│   │   │   ├── RadioIntercom.jsx          # Push-to-talk CAD radio panel
│   │   │   ├── RecommendationDisplay.jsx  # AI briefing & comparison matrix
│   │   │   └── TransitController.jsx      # Green wave controls & speed options
│   │   ├── utils/
│   │   │   └── sirenAudio.js              # Native Web Audio siren & speech synthesis
│   │   ├── App.jsx                        # Main CAD workstation orchestrator
│   │   ├── index.css                      # Harmonious design system & keyframe animations
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── data/
│   └── routes.json                        # Baseline corridor templates
├── docs/
│   ├── ARCHITECTURE.md                    # System architecture & physics formulas
│   └── API_DOCUMENTATION.md               # Complete REST API reference
├── PROMPT.md                              # Hackathon project specification
├── package.json                           # Root convenience scripts
└── README.md
```

---

## 📡 API Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status and uptime |
| `GET` | `/api/routes-data` | Default facility and route templates |
| `GET` | `/api/detailed-corridor` | Geospatial waypoints, signals, and maneuvers |
| `POST` | `/api/recommend-route` | AI route evaluation and plain-language briefing |
| `POST` | `/api/traffic-clearance` | Emergency Vehicle Preemption signal trigger |

See [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) for full request/response schemas.

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
