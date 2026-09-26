/**
 * WebSocket Manager Service
 * Manages live real-time bidirectional communication between CAD dispatchers,
 * mobile ambulance AVL units, and municipal signal preemption controllers.
 */

const { WebSocketServer, WebSocket } = require('ws');

let wss = null;
const clients = new Set();

function initWebSocketServer(httpServer) {
  wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws, req) => {
    clients.add(ws);
    const clientIp = req.socket.remoteAddress;
    console.log(`[WebSocket] CAD Console connected from ${clientIp} (Total clients: ${clients.size})`);

    // Send initial welcome & connection confirmation
    ws.send(JSON.stringify({
      type: 'CONNECTION_ESTABLISHED',
      timestamp: new Date().toISOString(),
      activeClients: clients.size,
      message: 'CAD Real-Time Telemetry & EVP Feed Active'
    }));

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        handleClientMessage(ws, data);
      } catch (err) {
        console.warn('[WebSocket] Malformed message received:', err.message);
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
      console.log(`[WebSocket] Client disconnected (Remaining clients: ${clients.size})`);
    });

    ws.on('error', (err) => {
      console.error('[WebSocket] Socket error:', err.message);
      clients.delete(ws);
    });
  });

  return wss;
}

/**
 * Handle incoming real-time telemetry from client (e.g. tablet GPS or manual steering)
 */
function handleClientMessage(senderWs, data) {
  // If a mobile unit pushes real GPS coordinates, broadcast to all other dispatchers
  if (data.type === 'GPS_TELEMETRICS_PUSH') {
    broadcast({
      type: 'AMBULANCE_TELEMETRY',
      source: 'MOBILE_GPS_SENSOR',
      ...data.payload
    }, senderWs); // Broadcast to all other consoles
  } else if (data.type === 'PING') {
    senderWs.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
  }
}

/**
 * Broadcast payload to all connected CAD dashboards
 */
function broadcast(payload, excludeWs = null) {
  if (!wss) return;
  const messageStr = JSON.stringify(payload);
  for (const client of clients) {
    if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  }
}

function broadcastTelemetry(telemetry) {
  broadcast({
    type: 'AMBULANCE_TELEMETRY',
    timestamp: new Date().toISOString(),
    payload: telemetry
  });
}

function broadcastSignalState(signalId, state, clearedCount = 0) {
  broadcast({
    type: 'SIGNAL_STATE_UPDATE',
    timestamp: new Date().toISOString(),
    signalId,
    state,
    clearedCount
  });
}

function broadcastDispatchRecommendation(recommendation) {
  broadcast({
    type: 'DISPATCH_RECOMMENDATION',
    timestamp: new Date().toISOString(),
    payload: recommendation
  });
}

function getConnectedCount() {
  return clients.size;
}

module.exports = {
  initWebSocketServer,
  broadcast,
  broadcastTelemetry,
  broadcastSignalState,
  broadcastDispatchRecommendation,
  getConnectedCount
};
