import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header.jsx';
import DispatchForm from './components/DispatchForm.jsx';
import InteractiveLeafletMap from './components/InteractiveLeafletMap.jsx';
import TransitController from './components/TransitController.jsx';
import LiveTelemetryBar from './components/LiveTelemetryBar.jsx';
import RecommendationDisplay from './components/RecommendationDisplay.jsx';
import { playSirenSound, stopSirenSound, speakDispatch } from './utils/sirenAudio.js';
import { Navigation, MapPin, Layers } from 'lucide-react';

export default function App() {
  const [startLocations, setStartLocations] = useState([
    "Fire Station 3", "Fire Station 7", "Downtown EMS Base"
  ]);
  const [hospitals, setHospitals] = useState([
    "City General", "St. Mary's Medical Center", "Riverside Hospital"
  ]);
  const [formData, setFormData] = useState({
    startLocation: "Fire Station 3",
    hospital: "City General",
    patientCondition: "critical",
    timeOfDay: "08:15",
    weather: "clear",
    traffic: "moderate"
  });

  const [recommendationData, setRecommendationData] = useState(null);
  const [corridorData, setCorridorData] = useState(null);
  const [activeRouteId, setActiveRouteId] = useState('route-a-main-st');
  const [loading, setLoading] = useState(false);
  const [apiOnline, setApiOnline] = useState(false);

  // Transit Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simSpeed, setSimSpeed] = useState(2);
  const [autoPreempt, setAutoPreempt] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [signalStates, setSignalStates] = useState({});
  const [eventLogs, setEventLogs] = useState([]);

  // Vehicle Position & Navigation State
  const [simProgress, setSimProgress] = useState(0); // 0.0 to 1.0
  const [ambulancePos, setAmbulancePos] = useState(null);
  const [currentManeuver, setCurrentManeuver] = useState(null);
  const [telemetry, setTelemetry] = useState({
    speedMph: 0,
    progressPercent: 0,
    etaSeconds: 0,
    distanceRemainingMiles: 0,
    preemptedCount: 0,
    totalSignals: 0,
    vehiclesCleared: 0,
    inSchoolZone: false
  });

  // Track active corridor & waypoints
  const activeCorridor = corridorData?.corridors?.[activeRouteId];

  // Helper to add radio event logs
  const addLog = (message, type = 'info') => {
    const time = new Date().toLocaleTimeString();
    setEventLogs(prev => [{ time, message, type }, ...prev.slice(0, 40)]);
  };

  // 1. Initial Load: Fetch corridor & routes data
  useEffect(() => {
    async function loadData() {
      try {
        const [routesRes, corridorRes] = await Promise.all([
          fetch('/api/routes-data'),
          fetch('/api/detailed-corridor')
        ]);

        if (routesRes.ok) {
          const rData = await routesRes.json();
          if (rData.startLocations) setStartLocations(rData.startLocations);
          if (rData.hospitals) setHospitals(rData.hospitals);
        }

        if (corridorRes.ok) {
          const cData = await corridorRes.json();
          setCorridorData(cData);
          setApiOnline(true);
        }
      } catch (err) {
        console.warn("Error initializing data:", err);
      }
      handleEvaluate();
    }
    loadData();
  }, []);

  // 2. Initialize ambulance at station whenever active corridor changes
  useEffect(() => {
    if (!activeCorridor || !activeCorridor.waypoints?.length) return;
    const firstPoint = activeCorridor.waypoints[0];
    const secondPoint = activeCorridor.waypoints[1] || firstPoint;
    const bearing = calculateBearing(firstPoint[0], firstPoint[1], secondPoint[0], secondPoint[1]);

    setAmbulancePos({
      lat: firstPoint[0],
      lng: firstPoint[1],
      bearing
    });
    setSimProgress(0);

    // Reset signal states
    const initSignals = {};
    activeCorridor.signals?.forEach(s => {
      initSignals[s.id] = s.defaultState || 'red';
    });
    setSignalStates(initSignals);

    setCurrentManeuver(activeCorridor.maneuvers?.[0] || null);

    setTelemetry(prev => ({
      ...prev,
      speedMph: 0,
      progressPercent: 0,
      etaSeconds: Math.round((activeCorridor.baseMinutes || 10) * 60),
      distanceRemainingMiles: activeCorridor.distanceMiles || 3.5,
      totalSignals: activeCorridor.signals?.length || 0,
      preemptedCount: 0,
      vehiclesCleared: 0,
      inSchoolZone: false
    }));

    addLog(`Active corridor set to ${activeCorridor.name}. Unit standing by at origin.`, 'info');
  }, [activeRouteId, corridorData]);

  // 3. Evaluate AI Routes
  const handleEvaluate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/recommend-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const data = await res.json();
        setRecommendationData(data);
        const topId = data.recommendedRoute?.id;
        if (topId) {
          setActiveRouteId(topId);
          addLog(`AI Recommendation updated: ${data.recommendedRoute.name} (${data.recommendedRoute.adjustedMinutes}m ETA)`, 'arrive');
        }
        setApiOnline(true);
      }
    } catch (err) {
      console.error("Evaluation error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 4. Force Clear a specific signal or all
  const handlePreemptSignal = async (sigId) => {
    setSignalStates(prev => ({ ...prev, [sigId]: 'preempted' }));
    const sig = activeCorridor?.signals?.find(s => s.id === sigId);
    const clearedCars = sig?.carsQueued || 15;

    setTelemetry(prev => ({
      ...prev,
      preemptedCount: prev.preemptedCount + 1,
      vehiclesCleared: prev.vehiclesCleared + clearedCars
    }));

    addLog(`SIGNAL PREEMPTION: ${sig?.name || sigId} switched to GREEN WAVE. ${clearedCars} vehicles cleared.`, 'preempt');
    if (voiceEnabled) {
      speakDispatch(`Traffic signal ${sig?.crossStreet || ''} cleared. Green wave locked.`);
    }

    try {
      await fetch('/api/traffic-clearance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signalId: sigId, action: 'preempt' })
      });
    } catch (e) {
      console.warn("Backend preemption notify error:", e);
    }
  };

  const handleForceClearAll = async () => {
    if (!activeCorridor?.signals) return;
    const updated = {};
    let totalCars = 0;
    activeCorridor.signals.forEach(s => {
      updated[s.id] = 'preempted';
      totalCars += (s.carsQueued || 12);
    });
    setSignalStates(updated);
    setTelemetry(prev => ({
      ...prev,
      preemptedCount: activeCorridor.signals.length,
      vehiclesCleared: prev.vehiclesCleared + totalCars
    }));
    addLog(`DISPATCH OVERRIDE: All corridor traffic signals forced to GREEN WAVE. Complete corridor cleared.`, 'preempt');
    if (voiceEnabled) {
      speakDispatch("All traffic signals along route preempted. Full green corridor cleared.");
    }
  };

  // 5. Transit Simulation Loop
  const simIntervalRef = useRef(null);

  useEffect(() => {
    if (!isSimulating) {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      stopSirenSound();
      return;
    }

    if (audioEnabled) {
      playSirenSound();
    } else {
      stopSirenSound();
    }

    const waypoints = activeCorridor?.waypoints || [];
    if (waypoints.length < 2) return;

    const totalSegments = waypoints.length - 1;
    const intervalMs = 60; // 16-20 updates/sec

    simIntervalRef.current = setInterval(() => {
      setSimProgress(prevProgress => {
        // Increment progress based on speed
        const progressIncrement = (0.0008 * simSpeed);
        const nextProgress = Math.min(1.0, prevProgress + progressIncrement);

        // Calculate position along multi-segment polyline
        const exactIndex = nextProgress * totalSegments;
        const segIdx = Math.min(totalSegments - 1, Math.floor(exactIndex));
        const segFrac = exactIndex - segIdx;

        const p1 = waypoints[segIdx];
        const p2 = waypoints[segIdx + 1] || p1;

        const curLat = p1[0] + (p2[0] - p1[0]) * segFrac;
        const curLng = p1[1] + (p2[1] - p1[1]) * segFrac;
        const bearing = calculateBearing(p1[0], p1[1], p2[0], p2[1]);

        setAmbulancePos({ lat: curLat, lng: curLng, bearing });

        // School Zone Check
        const inSchool = isPointInSchoolZone(curLat, curLng, corridorData?.schoolZone?.polygon);
        const currentSpeed = inSchool ? 20 : (48 + Math.floor(Math.sin(nextProgress * 20) * 5));

        // Proximity Signal Preemption (400m radius check)
        if (autoPreempt && activeCorridor?.signals) {
          activeCorridor.signals.forEach(sig => {
            const distKm = getDistanceFromLatLonInKm(curLat, curLng, sig.coords[0], sig.coords[1]);
            // Preempt if within 400m (~0.4km)
            setSignalStates(currentStates => {
              if (distKm <= 0.45 && currentStates[sig.id] !== 'preempted') {
                const cleared = sig.carsQueued || 16;
                addLog(`AUTO-EVP: Unit within 400m of ${sig.name}. Green wave engaged, ${cleared} vehicles moved to curb.`, 'preempt');
                if (voiceEnabled) {
                  speakDispatch(`Signal at ${sig.crossStreet} preempted. Proceed through green wave.`);
                }
                setTelemetry(t => ({
                  ...t,
                  preemptedCount: t.preemptedCount + 1,
                  vehiclesCleared: t.vehiclesCleared + cleared
                }));
                return { ...currentStates, [sig.id]: 'preempted' };
              }
              return currentStates;
            });
          });
        }

        // Maneuver index check
        if (activeCorridor?.maneuvers) {
          const maneuverIdx = Math.min(activeCorridor.maneuvers.length - 1, Math.floor(nextProgress * activeCorridor.maneuvers.length));
          const m = activeCorridor.maneuvers[maneuverIdx];
          setCurrentManeuver(prevM => {
            if (prevM?.step !== m.step) {
              addLog(`DISPATCH MANEUVER: ${m.text}`, 'info');
              if (voiceEnabled) speakDispatch(m.text);
            }
            return m;
          });
        }

        // Telemetry calculation
        const totalDist = activeCorridor.distanceMiles || 3.5;
        const distRemaining = Math.max(0, totalDist * (1 - nextProgress));
        const totalTimeSecs = (activeCorridor.baseMinutes || 10) * 60;
        const etaSecs = Math.max(0, Math.round(totalTimeSecs * (1 - nextProgress) / (simSpeed >= 2 ? 1.5 : 1)));

        setTelemetry(t => ({
          ...t,
          speedMph: currentSpeed,
          progressPercent: Math.round(nextProgress * 100),
          etaSeconds: etaSecs,
          distanceRemainingMiles: distRemaining,
          inSchoolZone: inSchool
        }));

        // Completion Check
        if (nextProgress >= 1.0) {
          setIsSimulating(false);
          stopSirenSound();
          addLog(`MISSION COMPLETE: Unit arrived at ${formData.hospital} Emergency Bay. Patient delivered safely.`, 'arrive');
          if (voiceEnabled) {
            speakDispatch(`Unit has arrived at ${formData.hospital} Emergency Bay. Transit completed safely.`);
          }
        }

        return nextProgress;
      });
    }, intervalMs);

    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [isSimulating, simSpeed, autoPreempt, audioEnabled, voiceEnabled, activeCorridor]);

  const handleStart = () => {
    setIsSimulating(true);
    addLog(`🚨 EMERGENCY TRANSIT LAUNCHED: Unit dispatched to ${formData.hospital} under Code 3 Priority.`, 'alert');
    if (voiceEnabled) {
      speakDispatch(`Unit 4 dispatched to ${formData.hospital}. Code 3 priority sirens engaged. Traffic preemption online.`);
    }
  };

  const handlePause = () => {
    setIsSimulating(false);
    stopSirenSound();
    addLog("Transit paused by dispatcher.", 'info');
  };

  const handleReset = () => {
    setIsSimulating(false);
    stopSirenSound();
    setSimProgress(0);
    if (activeCorridor?.waypoints?.length) {
      const p1 = activeCorridor.waypoints[0];
      const p2 = activeCorridor.waypoints[1] || p1;
      setAmbulancePos({
        lat: p1[0],
        lng: p1[1],
        bearing: calculateBearing(p1[0], p1[1], p2[0], p2[1])
      });
    }
    const resetSigs = {};
    activeCorridor?.signals?.forEach(s => {
      resetSigs[s.id] = s.defaultState || 'red';
    });
    setSignalStates(resetSigs);
    setTelemetry(t => ({
      ...t,
      speedMph: 0,
      progressPercent: 0,
      etaSeconds: Math.round((activeCorridor?.baseMinutes || 10) * 60),
      distanceRemainingMiles: activeCorridor?.distanceMiles || 3.5,
      preemptedCount: 0,
      vehiclesCleared: 0,
      inSchoolZone: false
    }));
    addLog("Transit run reset to origin station.", 'info');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0b0f19' }}>
      <Header apiOnline={apiOnline} />

      <main style={{
        flex: 1,
        maxWidth: '1600px',
        width: '100%',
        margin: '0 auto',
        padding: '1.2rem',
        display: 'grid',
        gridTemplateColumns: 'minmax(340px, 400px) 1fr',
        gap: '1.25rem',
        alignItems: 'start'
      }}>
        {/* Left Column: Form & Controller */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <DispatchForm
            formData={formData}
            setFormData={setFormData}
            startLocations={startLocations}
            hospitals={hospitals}
            onSubmit={handleEvaluate}
            loading={loading}
          />

          <TransitController
            isSimulating={isSimulating}
            onStart={handleStart}
            onPause={handlePause}
            onReset={handleReset}
            simSpeed={simSpeed}
            onChangeSpeed={(s) => setSimSpeed(s)}
            autoPreempt={autoPreempt}
            onToggleAutoPreempt={() => setAutoPreempt(!autoPreempt)}
            audioEnabled={audioEnabled}
            onToggleAudio={() => setAudioEnabled(!audioEnabled)}
            voiceEnabled={voiceEnabled}
            onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
            onForceClearAll={handleForceClearAll}
          />
        </section>

        {/* Right Column: Map, Telemetry, and Recommendations */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Real-time Telemetry Dashboard */}
          <LiveTelemetryBar
            telemetry={telemetry}
            currentManeuver={currentManeuver}
            eventLogs={eventLogs}
          />

          {/* Interactive Leaflet Map with Traffic Signals & Preemption */}
          <InteractiveLeafletMap
            corridorData={corridorData}
            activeRouteId={activeRouteId}
            ambulancePosition={ambulancePos}
            signalStates={signalStates}
            onSignalClick={handlePreemptSignal}
            onSelectRoute={(rId) => setActiveRouteId(rId)}
            isSimulating={isSimulating}
          />

          {/* AI Recommendation Briefing & Route Comparison */}
          <RecommendationDisplay
            recommendationData={recommendationData}
            selectedRouteId={activeRouteId}
            onSelectRoute={(rId) => setActiveRouteId(rId)}
          />
        </section>
      </main>

      <footer style={{
        textAlign: 'center',
        padding: '1rem',
        fontSize: '0.75rem',
        color: '#64748b',
        borderTop: '1px solid #1e293b',
        background: '#090e1a'
      }}>
        Ambulance Router Dispatch Intelligence System • Dynamic Green Wave Preemption (EVP) & GIS Navigation
      </footer>
    </div>
  );
}

// Coordinate math helpers
function calculateBearing(lat1, lon1, lat2, lon2) {
  const toRad = deg => (deg * Math.PI) / 180;
  const toDeg = rad => (rad * 180) / Math.PI;
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const deltaLam = toRad(lon2 - lon1);

  const y = Math.sin(deltaLam) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLam);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function isPointInSchoolZone(lat, lng, polygon) {
  if (!polygon || polygon.length < 3) return false;
  // Simple bounding box check
  let minLat = 999, maxLat = -999, minLng = 999, maxLng = -999;
  polygon.forEach(pt => {
    if (pt[0] < minLat) minLat = pt[0];
    if (pt[0] > maxLat) maxLat = pt[0];
    if (pt[1] < minLng) minLng = pt[1];
    if (pt[1] > maxLng) maxLng = pt[1];
  });
  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
}
