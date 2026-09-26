import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { playSirenSound, stopSirenSound, speakDispatch } from '../utils/sirenAudio.js';
import { cadSocket } from '../utils/cadWebSocket.js';

const DispatchContext = createContext(null);

export function DispatchProvider({ children }) {
  const [startLocations, setStartLocations] = useState([
    "Punjagutta Fire Station", "Madhapur Fire Station", "Telangana Secretariat Fire Command", "Secunderabad Fire Station", "Gowliguda Fire Station", "GVK EMRI 108 Central EMS Base"
  ]);
  const [hospitals, setHospitals] = useState([
    "Osmania General Hospital", "NIMS Hospital (Punjagutta)", "Apollo Hospitals (Jubilee Hills)", "Gandhi Hospital (Secunderabad)", "AIG Hospitals (Gachibowli)", "Cyber Towers Incident Zone", "Charminar Heritage Incident Zone"
  ]);
  const [formData, setFormData] = useState({
    vehicleType: "ambulance",
    startLocation: "",
    hospital: "",
    patientCondition: "critical",
    timeOfDay: "08:15",
    weather: "clear",
    traffic: "moderate",
    startCoords: null, // [lat, lng] from geocode or GPS
    endCoords: null    // [lat, lng] from nearby place selection
  });

  const [recommendationData, setRecommendationData] = useState(null);
  const [corridorData, setCorridorData] = useState(null);
  const [activeRouteId, setActiveRouteId] = useState('route-a-main-st');
  const [loading, setLoading] = useState(false);
  const [apiOnline, setApiOnline] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [isRealGpsActive, setIsRealGpsActive] = useState(false);
  const [realGpsCoordinates, setRealGpsCoordinates] = useState(null);
  const gpsWatchIdRef = useRef(null);

  // Transit Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simSpeed, setSimSpeed] = useState(2);
  const [autoPreempt, setAutoPreempt] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [signalStates, setSignalStates] = useState({});
  const [eventLogs, setEventLogs] = useState([]);

  // Vehicle Position & Navigation State
  const [simProgress, setSimProgress] = useState(0);
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

  // Resilient corridor resolver
  const resolveCorridor = (cData, routeId) => {
    if (!cData?.corridors) return null;
    if (routeId && cData.corridors[routeId]) return cData.corridors[routeId];
    if (routeId) {
      const lower = String(routeId).toLowerCase();
      for (const [k, v] of Object.entries(cData.corridors)) {
        if (k.toLowerCase() === lower) return v;
        if (lower.includes('route-a') && k.includes('route-a')) return v;
        if (lower.includes('route-b') && k.includes('route-b')) return v;
        if (lower.includes('route-c') && k.includes('route-c')) return v;
      }
    }
    return Object.values(cData.corridors)[0] || null;
  };

  const activeCorridor = resolveCorridor(corridorData, activeRouteId);

  const addLog = (message, type = 'info') => {
    const time = new Date().toLocaleTimeString();
    setEventLogs(prev => [{ time, message, type }, ...prev.slice(0, 50)]);
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
        console.warn("Initialization fetch error:", err);
      }
      handleEvaluate();
    }
    loadData();
  }, []);

  // 2. Live WebSocket Connection Layer
  useEffect(() => {
    cadSocket.connect();

    const unsubStatus = cadSocket.on('connection_status', (data) => {
      setWsConnected(data.connected);
      if (data.connected) addLog('WebSocket live push connected: ws://localhost:5000/ws', 'info');
    });

    const unsubTelemetry = cadSocket.on('AMBULANCE_TELEMETRY', (msg) => {
      const data = msg.payload || msg;
      if (data.lat && data.lng) {
        setAmbulancePos(prev => ({
          ...prev,
          lat: data.lat,
          lng: data.lng,
          bearing: data.heading || data.bearing || prev?.bearing || 0
        }));
        setTelemetry(prev => ({
          ...prev,
          speedMph: data.speedMph || data.speed || prev.speedMph,
          progressPercent: data.progressPercent !== undefined ? data.progressPercent : prev.progressPercent
        }));
      }
    });

    const unsubSignal = cadSocket.on('SIGNAL_STATE_UPDATE', (msg) => {
      if (msg.signalId) {
        if (msg.signalId === 'ALL') {
          setSignalStates({});
        } else {
          setSignalStates(prev => ({ ...prev, [msg.signalId]: msg.state }));
        }
      }
    });

    const unsubRec = cadSocket.on('DISPATCH_RECOMMENDATION', (msg) => {
      if (msg.payload?.recommendedRoute) {
        setRecommendationData(msg.payload);
      }
    });

    return () => {
      unsubStatus();
      unsubTelemetry();
      unsubSignal();
      unsubRec();
    };
  }, []);

  // Toggle Live Device GPS
  const handleToggleRealGps = () => {
    if (isRealGpsActive) {
      if (gpsWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(gpsWatchIdRef.current);
        gpsWatchIdRef.current = null;
      }
      setIsRealGpsActive(false);
      addLog("Live Device GPS tracking disabled. Switched back to GIS routing.", 'info');
    } else {
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser/device.");
        return;
      }

      setIsRealGpsActive(true);
      addLog("🛰️ Live Device GPS tracking engaged. Streaming device coordinates to /api/telematics/gps...", 'alert');

      gpsWatchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, speed, heading, altitude, accuracy } = position.coords;
          const speedMph = speed ? Math.round(speed * 2.23694) : 0;
          setRealGpsCoordinates({ lat: latitude, lng: longitude, speedMph });

          setAmbulancePos({
            lat: latitude,
            lng: longitude,
            bearing: heading || 0
          });

          fetch('/api/telematics/gps', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              unitId: 'MED-4',
              lat: latitude,
              lng: longitude,
              speedMph,
              heading: heading || 0,
              altitude: altitude || 0,
              accuracy
            })
          }).catch(err => console.warn('GPS push error:', err));
        },
        (err) => {
          console.warn('Geolocation watch error:', err.message);
          setIsRealGpsActive(false);
          addLog(`Device GPS error: ${err.message}`, 'alert');
        },
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
      );
    }
  };

  // Initialize ambulance at origin station whenever active corridor changes
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

  // Evaluate AI Routes
  const handleEvaluate = async (overrideForm = null) => {
    setLoading(true);
    const postBody = overrideForm || formData;
    try {
      const res = await fetch('/api/recommend-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postBody)
      });
      if (res.ok) {
        const data = await res.json();
        setRecommendationData(data);
        if (data.corridors && Object.keys(data.corridors).length > 0) {
          setCorridorData(prev => ({
            ...prev,
            corridors: data.corridors
          }));
        }
        const topId = data.recommendedRoute?.id || 'route-a-main-st';
        setActiveRouteId(topId);
        if (data.recommendedRoute?.name) {
          addLog(`AI Recommendation: ${data.recommendedRoute.name} (${data.recommendedRoute.adjustedMinutes}m ETA)`, 'arrive');
        }
        setApiOnline(true);
      }
    } catch (err) {
      console.error("Evaluation error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-evaluate when user modifies locations or dispatch conditions
  const prevFormRef = useRef(formData);
  const isFirstMountRef = useRef(true);

  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }

    const prev = prevFormRef.current;
    const hasChanged = prev.startLocation !== formData.startLocation ||
      prev.hospital !== formData.hospital ||
      prev.patientCondition !== formData.patientCondition ||
      prev.weather !== formData.weather ||
      prev.traffic !== formData.traffic ||
      prev.timeOfDay !== formData.timeOfDay ||
      prev.vehicleType !== formData.vehicleType;

    prevFormRef.current = formData;

    if (!hasChanged) return;

    if (corridorData?.stations?.[formData.startLocation]?.coords) {
      const stn = corridorData.stations[formData.startLocation].coords;
      setAmbulancePos(prevPos => ({
        lat: stn[0],
        lng: stn[1],
        bearing: prevPos?.bearing || 0
      }));
    }

    const timer = setTimeout(() => {
      handleEvaluate(formData);
    }, 250);

    return () => clearTimeout(timer);
  }, [formData.startLocation, formData.hospital, formData.patientCondition, formData.weather, formData.traffic, formData.timeOfDay, formData.vehicleType]);

  // Preempt signal
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
      speakDispatch(`Signal at ${sig?.crossStreet || ''} cleared. Green wave locked.`);
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
      totalCars += (s.carsQueued || 14);
    });
    setSignalStates(updated);
    setTelemetry(prev => ({
      ...prev,
      preemptedCount: activeCorridor.signals.length,
      vehiclesCleared: prev.vehiclesCleared + totalCars
    }));
    addLog(`DISPATCH OVERRIDE: All corridor traffic signals forced to GREEN WAVE. Complete corridor cleared.`, 'preempt');
    if (voiceEnabled) {
      speakDispatch("All traffic signals along corridor preempted. Full green wave corridor cleared.");
    }
  };

  // Transit Simulation Loop
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
    const intervalMs = 60;

    simIntervalRef.current = setInterval(() => {
      setSimProgress(prevProgress => {
        const progressIncrement = (0.0008 * simSpeed);
        const nextProgress = Math.min(1.0, prevProgress + progressIncrement);

        const exactIndex = nextProgress * totalSegments;
        const segIdx = Math.min(totalSegments - 1, Math.floor(exactIndex));
        const segFrac = exactIndex - segIdx;

        const p1 = waypoints[segIdx];
        const p2 = waypoints[segIdx + 1] || p1;

        const curLat = p1[0] + (p2[0] - p1[0]) * segFrac;
        const curLng = p1[1] + (p2[1] - p1[1]) * segFrac;
        const bearing = calculateBearing(p1[0], p1[1], p2[0], p2[1]);

        setAmbulancePos({ lat: curLat, lng: curLng, bearing });

        const inSchool = isPointInSchoolZone(curLat, curLng, corridorData?.schoolZone?.polygon);
        const currentSpeed = inSchool ? 20 : (48 + Math.floor(Math.sin(nextProgress * 20) * 5));

        // Proximity Signal Preemption (400m radius check)
        if (autoPreempt && activeCorridor?.signals) {
          activeCorridor.signals.forEach(sig => {
            const distKm = getDistanceFromLatLonInKm(curLat, curLng, sig.coords[0], sig.coords[1]);
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

        // Maneuver check
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

        if (nextProgress >= 1.0) {
          const unitTitle = formData.vehicleType === 'fire_truck' ? 'Fire Tender 01' : '108 ALS Ambulance';
          setIsSimulating(false);
          stopSirenSound();
          addLog(`MISSION COMPLETE: ${unitTitle} arrived at ${formData.hospital}. Emergency mission completed safely.`, 'arrive');
          if (voiceEnabled) {
            speakDispatch(`${unitTitle} has arrived at ${formData.hospital}. Mission completed safely.`);
          }
        }

        return nextProgress;
      });
    }, intervalMs);

    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [isSimulating, simSpeed, autoPreempt, audioEnabled, voiceEnabled, activeCorridor, formData.vehicleType, formData.hospital]);

  const handleStart = () => {
    if (simProgress >= 0.99) {
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
    }
    setIsSimulating(true);
    const unitTitle = formData.vehicleType === 'fire_truck' ? 'Fire Tender 01' : '108 ALS Ambulance';
    addLog(`🚨 EMERGENCY TRANSIT LAUNCHED: ${unitTitle} dispatched to ${formData.hospital} under Code 3 Priority.`, 'alert');
    if (voiceEnabled) {
      speakDispatch(`${unitTitle} dispatched to ${formData.hospital}. Code 3 priority sirens engaged. Hyderabad traffic preemption online.`);
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

  const handleManualProgressChange = (newVal) => {
    const clamped = Math.max(0, Math.min(1.0, newVal));
    setSimProgress(clamped);

    const waypoints = activeCorridor?.waypoints || [];
    if (waypoints.length < 2) return;

    const totalSegments = waypoints.length - 1;
    const exactIndex = clamped * totalSegments;
    const segIdx = Math.min(totalSegments - 1, Math.floor(exactIndex));
    const segFrac = exactIndex - segIdx;

    const p1 = waypoints[segIdx];
    const p2 = waypoints[segIdx + 1] || p1;

    const curLat = p1[0] + (p2[0] - p1[0]) * segFrac;
    const curLng = p1[1] + (p2[1] - p1[1]) * segFrac;
    const bearing = calculateBearing(p1[0], p1[1], p2[0], p2[1]);

    setAmbulancePos({ lat: curLat, lng: curLng, bearing });

    const inSchool = isPointInSchoolZone(curLat, curLng, corridorData?.schoolZone?.polygon);
    const speed = inSchool ? 20 : (48 + Math.floor(Math.sin(clamped * 20) * 5));
    const totalDist = activeCorridor.distanceMiles || 3.2;
    const distRemaining = Math.max(0, Math.round(totalDist * (1 - clamped) * 10) / 10);
    const totalTimeSecs = (activeCorridor.baseMinutes || 8) * 60;
    const etaSecs = Math.max(0, Math.round(totalTimeSecs * (1 - clamped) / (simSpeed >= 2 ? 1.5 : 1)));

    // Proximity Signal Preemption (400m radius check)
    if (activeCorridor?.signals) {
      activeCorridor.signals.forEach(sig => {
        const distKm = getDistanceFromLatLonInKm(curLat, curLng, sig.coords[0], sig.coords[1]);
        if (distKm <= 0.45) {
          setSignalStates(prev => {
            if (prev[sig.id] !== 'preempted') {
              const cleared = sig.carsQueued || 16;
              addLog(`MANUAL ROAD DRIVE: Signal at ${sig.name} cleared to Green Wave (400m EVP).`, 'preempt');
              setTelemetry(t => ({
                ...t,
                preemptedCount: t.preemptedCount + 1,
                vehiclesCleared: t.vehiclesCleared + cleared
              }));
              return { ...prev, [sig.id]: 'preempted' };
            }
            return prev;
          });
        }
      });
    }

    // Maneuver check
    if (activeCorridor?.maneuvers) {
      const maneuverIdx = Math.min(activeCorridor.maneuvers.length - 1, Math.floor(clamped * activeCorridor.maneuvers.length));
      const m = activeCorridor.maneuvers[maneuverIdx];
      setCurrentManeuver(prevM => {
        if (prevM?.step !== m.step) {
          addLog(`MANUAL ROAD STEP: ${m.text}`, 'info');
        }
        return m;
      });
    }

    setTelemetry(t => ({
      ...t,
      speedMph: speed,
      progressPercent: Math.round(clamped * 100),
      etaSeconds: etaSecs,
      distanceRemainingMiles: distRemaining,
      inSchoolZone: inSchool
    }));

    if (clamped >= 1.0) {
      setIsSimulating(false);
      stopSirenSound();
      addLog(`MANUAL ROAD DRIVE COMPLETE: Unit arrived at ${formData.hospital} Emergency Bay.`, 'arrive');
    }
  };

  // Keyboard navigation: Arrow Left/Right and A/D to drive ambulance on road
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target?.tagName)) return;

      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setSimProgress(curr => {
          const next = Math.min(1.0, curr + 0.02);
          handleManualProgressChange(next);
          return next;
        });
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        setSimProgress(curr => {
          const prev = Math.max(0, curr - 0.02);
          handleManualProgressChange(prev);
          return prev;
        });
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsSimulating(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCorridor, corridorData, simSpeed]);

  const value = {
    startLocations,
    hospitals,
    formData,
    setFormData,
    recommendationData,
    setRecommendationData,
    corridorData,
    setCorridorData,
    activeRouteId,
    setActiveRouteId,
    activeCorridor,
    loading,
    apiOnline,
    wsConnected,
    isRealGpsActive,
    realGpsCoordinates,
    handleToggleRealGps,
    isSimulating,
    simSpeed,
    setSimSpeed,
    autoPreempt,
    setAutoPreempt,
    audioEnabled,
    setAudioEnabled,
    voiceEnabled,
    setVoiceEnabled,
    signalStates,
    eventLogs,
    addLog,
    simProgress,
    ambulancePos,
    setAmbulancePos,
    currentManeuver,
    telemetry,
    handleEvaluate,
    handlePreemptSignal,
    handleForceClearAll,
    handleStart,
    handlePause,
    handleReset,
    handleManualProgressChange
  };

  return (
    <DispatchContext.Provider value={value}>
      {children}
    </DispatchContext.Provider>
  );
}

export function useDispatchContext() {
  const context = useContext(DispatchContext);
  if (!context) {
    throw new Error('useDispatchContext must be used within a DispatchProvider');
  }
  return context;
}

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
  const R = 6371;
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
  let minLat = 999, maxLat = -999, minLng = 999, maxLng = -999;
  polygon.forEach(pt => {
    if (pt[0] < minLat) minLat = pt[0];
    if (pt[0] > maxLat) maxLat = pt[0];
    if (pt[1] < minLng) minLng = pt[1];
    if (pt[1] > maxLng) maxLng = pt[1];
  });
  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
}
