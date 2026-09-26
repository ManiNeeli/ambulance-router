/**
 * CAD Real-Time WebSocket Client
 * Connects to the backend WebSocket layer (ws://localhost:5000/ws)
 * Receives live GPS telematics, signal state transitions, and dispatch updates.
 */

class CadWebSocketClient {
  constructor() {
    this.ws = null;
    this.listeners = new Map();
    this.reconnectTimer = null;
    this.isConnected = false;
  }

  connect(url = null) {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const wsUrl = url || `ws://${window.location.hostname}:5000/ws`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.emit('connection_status', { connected: true });
        console.log('[CAD WebSocket] Connected to real-time dispatch server:', wsUrl);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.emit(data.type, data);
          this.emit('all', data);
        } catch (err) {
          console.warn('[CAD WebSocket] Failed to parse message:', err);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.emit('connection_status', { connected: false });
        this.scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        console.warn('[CAD WebSocket] Connection error:', err);
        this.ws.close();
      };
    } catch (err) {
      console.warn('[CAD WebSocket] Init failed, retrying in 3s:', err);
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 3000);
  }

  on(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type).add(callback);
    return () => this.off(type, callback);
  }

  off(type, callback) {
    if (this.listeners.has(type)) {
      this.listeners.get(type).delete(callback);
    }
  }

  emit(type, data) {
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      callbacks.forEach(cb => {
        try { cb(data); } catch (e) { console.error('[CAD WS Callback Error]', e); }
      });
    }
  }

  send(type, payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload, timestamp: Date.now() }));
    }
  }

  pushGps(gpsData) {
    this.send('GPS_TELEMETRICS_PUSH', gpsData);
  }
}

export const cadSocket = new CadWebSocketClient();
