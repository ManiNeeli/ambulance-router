# 🚑 Ambulance Router — AI-Assisted Safe Transit & Green-Wave Preemption

> **Every second counts in emergency response — but the fastest route on paper isn’t always the safest route on the streets.**

Built as a next-generation Computer-Aided Dispatch (CAD) prototype, **Ambulance Router** is an intelligent navigation copilot designed for 911/EMS dispatchers and paramedic crews. It evaluates candidate corridors not just by raw minutes, but by real-world safety hazards — active school zones, weather hydroplaning, traffic gridlock, and patient urgency.

When seconds matter, it actively clears the path ahead using **Emergency Vehicle Preemption (EVP)**, locking traffic signals green and moving traffic to the curb before the ambulance even reaches the intersection.

---

## 💡 Why We Built This

Standard consumer GPS apps (Google Maps, Waze) are built for everyday drivers. They don’t know that:
- A route that saves 2 minutes by cutting through a school district at **08:15 AM** puts children at risk and forces a 7-ton ambulance to crawl at 20 MPH behind stopped school buses.
- A sudden thunderstorm turns high-speed freeway overpasses into dangerous hydroplaning zones for top-heavy emergency rigs.
- A patient in critical cardiac arrest (Code 3) needs a predictable, hazard-free corridor with green lights locked ahead — while a spinal injury transfer (Code 1) needs a smooth, bump-free ride over raw speed.

We built Ambulance Router to bridge the gap between **dispatch decision-making**, **city traffic infrastructure**, and **patient survival**.

---

## ✨ What It Does

### 🧠 1. Safe-Route AI & Tradeoff Engine
- Evaluates candidate routes side-by-side using dynamic penalty models.
- **Active School Zone Detection**: Identifies school bell hours (07:30–09:00 & 14:30–16:00), applies speed limits (20 MPH), and penalizes dangerous pedestrian corridors.
- **Weather & Traction Modeling**: Adjusts stopping distances and accident risks for rain, snow, and dense fog.
- **Plain-Language Dispatcher Briefings**: Explains the rationale in natural English (e.g., *"Route A is 3 minutes faster on paper, but active school drop-off creates severe pedestrian hazards. Route C is recommended for a predictable 15-minute window with a 90/100 safety margin"*).

### 🚦 2. Emergency Vehicle Preemption (EVP) & Green Wave
- Detects the ambulance approaching within **400 meters** of an intersection.
- Automatically broadcasts preemption commands to municipal traffic controllers:
  - Cross-traffic gets red lights.
  - The ambulance corridor locks into a **Green Wave**.
  - Queued cars pull over to the shoulder, clearing bottlenecks to zero delay.
- Manual Dispatcher Override: Click any signal on the tactical map or hit **"Clear All"** to force the entire corridor green.

### 🗺️ 3. Real-World GIS Tactical Map
- Interactive **Leaflet** map with three switchable cartography styles:
  - 🌑 **Dark Tactical** (CartoDB DarkMatter) for low-glare dispatch rooms.
  - 🛰️ **Satellite Imagery** (Esri World Imagery) to inspect real overpasses and buildings.
  - 🗺️ **Streets View** (OpenStreetMap) for clear urban navigation.
- Real-time animated ambulance with compass heading rotation and alternating emergency strobes.
- Visual school district geofence and animated traffic flow polylines that change from congested red to cleared emerald green.

### 🩺 4. Live Biometric Patient Telemetry & CAD Radio
- **Diagnostic ECG Monitor**: Synchronized Lead II heart rhythm tracing that pulses dynamically with patient condition.
- **Acuity Indicators**: Blood pressure (NIBP), oxygen saturation ($SpO_2$), and Glasgow Coma Scale (GCS).
- **Tactical Intercom**: Push-to-Talk audio dispatch with frequency channel selector (`EMS PRIMARY`, `TRAFFIC COMMAND`, `HOSPITAL DIRECT`) and realistic two-tone siren synthesizer.

### 🎨 5. Multi-Palette Workstation Themes
Switch between four tailored palettes right from the header:
- 🌌 **Cobalt Cyberpunk** — Electric cyan and deep navy (default).
- 🌲 **Tactical Emerald** — Phosphor green night-vision HUD.
- 🚨 **Crimson Apex** — High-intensity emergency red.
- ☀️ **Nordic Medical Light** — High-contrast clinical day mode.

---

## ⚡ Quick Start (Get up and running in 2 minutes)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer)
- npm (v9 or newer)

### 1. Clone & Install
```bash
git clone https://github.com/ManiNeeli/ambulance-router.git
cd ambulance-router

# Install dependencies for both backend and frontend in one shot
npm run install:all
```

### 2. Run the Application
You can run the full project in development mode or as a compiled production server:

#### Option A: Development Mode (Live Hot Reload)
Open two terminal tabs:
```bash
# Tab 1: Start Backend (Port 5000)
npm run dev:backend

# Tab 2: Start Frontend (Port 5173)
npm run dev:frontend
```
👉 Open your browser to **`http://localhost:5173`**

#### Option B: Production Server
```bash
# Build frontend and serve everything from Express on Port 5000
npm run build
npm start
```
👉 Open your browser to **`http://localhost:5000`**

---

## 🕹️ A Walkthrough of a Typical Dispatch Run

1. **Pick the Incident Details**: Choose your origin fire station (e.g. *Fire Station 3*) and destination trauma center (e.g. *City General*).
2. **Simulate Conditions**: Try the quick scenario presets — like **08:15 AM School Rush** with a **Code 3 Critical** patient.
3. **Read the AI Briefing**: Notice how the engine warns you away from Route A (Main St) because children are arriving at Oakridge Elementary, recommending Route C instead.
4. **Hit "Start Transit Run"**:
   - Toggle **Siren Audio** and **Voice Guidance** on.
   - Watch the ambulance navigate the streets on the map, turning its heading around corners.
   - Observe red traffic signals 400m ahead switch to glowing **Green Wave** beacons.
   - Watch the speedometer drop to 20 MPH inside the school zone and accelerate back up on the open avenue.
   - Hear the dispatch voice announce cleared signals until arrival at the emergency trauma bay!

---

## 🛠️ Tech Stack & Why We Chose It

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | React 18 + Vite | Lightning-fast reactivity, zero build lag, and modular UI structure. |
| **Mapping** | Leaflet + CartoDB / Esri | Lightweight, responsive GIS without costly per-request Google Maps API bills. |
| **Backend** | Node.js + Express | Fast asynchronous I/O for real-time telemetry and signal preemption APIs. |
| **Styling** | Handcrafted CSS Glassmorphism | Custom design tokens, dark mode control center aesthetic, and hardware-accelerated animations. |
| **Audio** | Web Audio API + SpeechSynthesis | Native browser APIs for authentic sirens and voice dispatch — zero external MP3 dependencies. |
| **AI Layer** | Deterministic Heuristic + LLM ready | Instant, reliable fallback reasoning out-of-the-box, with optional Gemini/OpenAI API plug-ins. |

---

## 📂 Project Structure

```
ambulance-router/
├── backend/
│   ├── data/detailedRoutes.json       # Geospatial coordinates, signals & school zones
│   ├── routes/recommendRoute.js       # REST endpoints (/recommend-route, /traffic-clearance)
│   ├── services/routeCalculator.js    # Routing physics & safety index penalty formulas
│   ├── services/aiAdvisor.js          # Plain-language dispatcher briefings & LLM integration
│   └── server.js                      # Express backend on port 5000
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DispatchForm.jsx           # Incident setup & emergency scenario presets
│   │   │   ├── Header.jsx                 # System header with theme switcher & clock
│   │   │   ├── InteractiveLeafletMap.jsx  # Multi-layer GIS map with traffic clearance
│   │   │   ├── LiveTelemetryBar.jsx       # Digital speedometer & live radio feed
│   │   │   ├── PatientVitalsMonitor.jsx   # Dynamic ECG heartbeat & patient vitals
│   │   │   ├── RadioIntercom.jsx          # Push-to-talk CAD radio transmitter
│   │   │   ├── RecommendationDisplay.jsx  # AI briefing & route comparison matrix
│   │   │   └── TransitController.jsx      # Simulation speed, siren & preemption controls
│   │   ├── utils/sirenAudio.js            # Native browser siren synthesizer & speech
│   │   ├── App.jsx                        # Dispatcher workstation orchestrator
│   │   └── index.css                      # Unified design system & animations
├── docs/
│   ├── ARCHITECTURE.md                # System design & mathematical penalty models
│   └── API_DOCUMENTATION.md           # Complete REST API reference
├── package.json                       # Root convenience scripts
├── PROMPT.md                          # Hackathon build specification
└── README.md
```

---

## 🔮 Future Roadmap

- [ ] **V2X DSRC Hardware Integration**: Connect with real physical OBU (On-Board Unit) transmitters.
- [ ] **Hospital ER Bed Capacity Sync**: Automatically divert to alternate facilities if the primary ER is on trauma diversion.
- [ ] **Multi-Unit Fleet Tracking**: Dispatch multiple EMS ambulances and fire engines simultaneously with mutual signal coordination.

---

## 👨‍💻 Author

Crafted by **Mani Neeli** — [GitHub](https://github.com/ManiNeeli)

If you find this project helpful or inspiring, feel free to star ⭐ the repository!
