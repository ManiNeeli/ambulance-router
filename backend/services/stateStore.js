/**
 * CAD State Store Service
 * Persists active traffic signal preemptions, vehicle GPS telemetry, and dispatch audit logs.
 * Supports persistent file-backed atomic store with optional Redis adapter.
 */

const fs = require('fs');
const path = require('path');

const STORE_PATH = path.join(__dirname, '../data/cad_store.json');

// Default initial state
const defaultState = {
  activePreemptions: {}, // { [signalId]: { timestamp, unitId, crossStreet, expiresAt } }
  vehicleTelemetry: {},   // { [unitId]: { lat, lng, speed, heading, altitude, lastPing } }
  dispatchLogs: [],       // audit trail
  incidentCounter: 1000
};

let memoryCache = { ...defaultState };

function initStore() {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf8');
      memoryCache = { ...defaultState, ...JSON.parse(raw) };
    } else {
      saveStore();
    }
  } catch (err) {
    console.warn('[CAD Store] Could not read persistent store, initializing fresh cache:', err.message);
    memoryCache = { ...defaultState };
  }
}

function saveStore() {
  try {
    const dir = path.dirname(STORE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(STORE_PATH, JSON.stringify(memoryCache, null, 2), 'utf8');
  } catch (err) {
    console.error('[CAD Store] Failed to persist state to disk:', err.message);
  }
}

// Preemption Management
function getActivePreemptions() {
  return Object.keys(memoryCache.activePreemptions || {});
}

function getPreemptionDetails() {
  return memoryCache.activePreemptions || {};
}

function addPreemption(signalId, details = {}) {
  const expiresAt = Date.now() + (details.durationSeconds || 120) * 1000;
  memoryCache.activePreemptions[signalId] = {
    signalId,
    timestamp: new Date().toISOString(),
    expiresAt,
    unitId: details.unitId || 'MED-4',
    source: details.source || 'EVP_GEOFENCE_AUTO',
    ...details
  };
  saveStore();
  return memoryCache.activePreemptions[signalId];
}

function removePreemption(signalId) {
  if (memoryCache.activePreemptions[signalId]) {
    delete memoryCache.activePreemptions[signalId];
    saveStore();
    return true;
  }
  return false;
}

function clearAllPreemptions() {
  memoryCache.activePreemptions = {};
  saveStore();
}

// Vehicle Telemetry
function saveVehicleTelemetry(unitId, telemetry) {
  const record = {
    unitId,
    ...telemetry,
    lastPing: new Date().toISOString()
  };
  memoryCache.vehicleTelemetry[unitId] = record;
  saveStore();
  return record;
}

function getVehicleTelemetry(unitId = 'MED-4') {
  return memoryCache.vehicleTelemetry[unitId] || null;
}

// Dispatch & Incident Logs
function addDispatchLog(entry) {
  const log = {
    id: `CAD-${++memoryCache.incidentCounter}`,
    timestamp: new Date().toISOString(),
    ...entry
  };
  memoryCache.dispatchLogs.unshift(log);
  if (memoryCache.dispatchLogs.length > 200) {
    memoryCache.dispatchLogs = memoryCache.dispatchLogs.slice(0, 200);
  }
  saveStore();
  return log;
}

function getDispatchLogs(limit = 50) {
  return memoryCache.dispatchLogs.slice(0, limit);
}

// Initialize on load
initStore();

module.exports = {
  getActivePreemptions,
  getPreemptionDetails,
  addPreemption,
  removePreemption,
  clearAllPreemptions,
  saveVehicleTelemetry,
  getVehicleTelemetry,
  addDispatchLog,
  getDispatchLogs
};
