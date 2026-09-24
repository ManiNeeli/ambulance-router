# AI-Assisted Ambulance Routing & Traffic Preemption System (Build Specification)

## Objective
Build a production-grade hackathon prototype for an **AI-Assisted Emergency Vehicle Routing & Preemption (EVP) System** that serves 911 / EMS dispatchers and paramedic crews. The application calculates the fastest *safe* route among candidate options, explains the tradeoffs in plain language, clears traffic along the corridor using smart traffic signal preemption, and visualizes the transit in real-time on interactive tactical maps.

---

## Core Capabilities & Requirements

### 1. Dynamic Routing & Safety Penalty Engine
- **Corridor Evaluation**:
  - Compare multiple real-world corridors (e.g. Main St, Highway Bypass, Residential Shortcut).
  - Dynamically compute travel times and safety index (0–100) based on:
    - **Active School Zones**: Throttles speed to 20 MPH during school hours (07:30–09:00 & 14:30–16:00), applies pedestrian safety penalties.
    - **Weather Hazards**: Models hydroplaning risks on highways during rain, black ice/slush during snow, and reduced visibility in dense fog.
    - **Peak Traffic Congestion**: Multipliers for rush hour and gridlock.
    - **Patient Acuity / Urgency Codes**:
      - Code 3 (Critical Priority: Lights & Sirens)
      - Code 2 (Emergent Urgent: Urgent, no sirens)
      - Code 1 (Routine Transfer: Non-acute, smooth ride preferred)

### 2. AI Dispatcher Advisor & Plain-Language Tradeoff Briefings
- Explain why the recommended route was selected and why alternatives were rejected.
- Generate actionable tactical driving advisories for the ambulance crew.
- Support optional Gemini / OpenAI API keys via environment variables, while maintaining an instant, zero-dependency heuristic reasoning engine.

### 3. Emergency Vehicle Preemption (EVP) / Green Wave System
- Smart traffic signals placed at key intersections along each corridor.
- **AI Automated Green Wave**: Detects ambulance approaching within 400m radius and switches signals to green wave priority, clearing queued vehicles to the shoulder.
- **Manual Dispatcher Override**: Allows operators to manually force green wave clearance on specific signals or clear the entire corridor.

### 4. Interactive GIS Real-World Tactical Map
- Built with **Leaflet** supporting multi-layer cartography:
  - 🌑 **Dark Tactical** (CartoDB DarkMatter)
  - 🛰️ **Satellite Imagery** (Esri World Imagery)
  - 🗺️ **Streets View** (OpenStreetMap)
- Real-time animated ambulance marker with compass heading rotation and emergency strobe flashers.
- Visual school zone geofence boundaries and 400m signal preemption radar rings.
- Animated traffic flow polylines illustrating corridor clearance.

### 5. Biometric Telemetry & Dispatch Communications
- Live patient biometric monitor with simulated diagnostic ECG tracing, heart rate, blood pressure, SpO2, and GCS acuity score.
- CAD tactical radio intercom with channel switching, Push-to-Talk audio synthesis, and tactical message presets.
- Real-time speedometer, ETA countdown timer, and cleared vehicles counter.
