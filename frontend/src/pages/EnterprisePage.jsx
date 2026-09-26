import React from 'react';
import { useDispatchContext } from '../context/DispatchContext.jsx';
import EnterpriseCadPanel from '../components/EnterpriseCadPanel.jsx';
import InteractiveLeafletMap from '../components/InteractiveLeafletMap.jsx';
import { Server, Database, ShieldCheck, Cpu } from 'lucide-react';

export default function EnterprisePage() {
  const {
    wsConnected,
    isRealGpsActive,
    handleToggleRealGps,
    realGpsCoordinates,
    corridorData,
    activeRouteId,
    ambulancePos,
    signalStates,
    handlePreemptSignal,
    setActiveRouteId,
    isSimulating,
    formData,
    handleManualProgressChange
  } = useDispatchContext();

  return (
    <div style={{
      maxWidth: '1720px',
      margin: '0 auto',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem'
    }}>
      {/* Enterprise Header Banner */}
      <div className="panel-card" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #EFF6FF 100%)',
        borderLeft: '6px solid #2563EB'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            background: '#2563EB',
            color: '#FFFFFF',
            padding: '0.6rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Server size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-dark)' }}>
              Enterprise CAD, NTCIP 1211 & AVL Telematics Gateway
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-dark-muted)' }}>
              Mission-Critical Dispatch Ingestion: Municipal SCATS/SCOOT Sync, CJIS Forensic Audit Trail & Hardware Telemetry
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="cad-well" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Cpu size={15} color="#2563EB" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>
              WebSocket Gateway: {wsConnected ? 'Connected (Port 5000)' : 'Reconnecting...'}
            </span>
          </div>
        </div>
      </div>

      {/* Enterprise CAD Panel Component */}
      <EnterpriseCadPanel
        wsConnected={wsConnected}
        isRealGpsActive={isRealGpsActive}
        onToggleRealGps={handleToggleRealGps}
        realGpsCoordinates={realGpsCoordinates}
        onRefreshLogs={() => {}}
      />

      {/* Live Map Telematics Reference */}
      <div style={{ marginTop: '0.5rem' }}>
        <h3 style={{
          fontSize: '1rem',
          fontWeight: 800,
          marginBottom: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          🛰️ Live Mapbox Telematics GIS Reference
        </h3>
        <InteractiveLeafletMap
          corridorData={corridorData}
          activeRouteId={activeRouteId}
          ambulancePosition={ambulancePos}
          signalStates={signalStates}
          onSignalClick={handlePreemptSignal}
          onSelectRoute={setActiveRouteId}
          isSimulating={isSimulating}
          weather={formData.weather}
          onManualProgressChange={handleManualProgressChange}
          vehicleType={formData.vehicleType || 'ambulance'}
        />
      </div>
    </div>
  );
}
