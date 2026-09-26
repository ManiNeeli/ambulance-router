import React from 'react';
import { useDispatchContext } from '../context/DispatchContext.jsx';
import ShortestRoadMap from '../components/ShortestRoadMap.jsx';
import InteractiveLeafletMap from '../components/InteractiveLeafletMap.jsx';
import { Navigation, Compass, MapPin } from 'lucide-react';

export default function RoutesPage() {
  const {
    corridorData,
    activeRouteId,
    setActiveRouteId,
    simProgress,
    handleManualProgressChange,
    formData,
    ambulancePos,
    signalStates,
    handlePreemptSignal,
    isSimulating
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
      {/* Route Overview Header Banner */}
      <div className="panel-card" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
        borderLeft: '6px solid var(--color-teal)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            background: 'var(--color-teal)',
            color: '#FFFFFF',
            padding: '0.6rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Navigation size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-dark)' }}>
              Turn-by-Turn Road Network & Shortest Path Engine
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-dark-muted)' }}>
              Dijkstra / A* Topo-Graph with Real-Time Turn Maneuvers, Intersections, and Hyderabad Road Grid
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="cad-well" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem' }}>
            <MapPin size={15} color="var(--color-red)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>
              From: {formData.startLocation}
            </span>
          </div>
          <div className="cad-well" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem' }}>
            <Compass size={15} color="var(--color-teal)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>
              To: {formData.hospital}
            </span>
          </div>
        </div>
      </div>

      {/* Main Turn-by-Turn Road Map */}
      <ShortestRoadMap
        corridorData={corridorData}
        activeRouteId={activeRouteId}
        simProgress={simProgress}
        onJumpToProgress={handleManualProgressChange}
        onSelectRoute={setActiveRouteId}
        startLocation={formData.startLocation}
        hospital={formData.hospital}
        vehicleType={formData.vehicleType || 'ambulance'}
      />

      {/* GIS Verification Map View */}
      <div style={{ marginTop: '0.5rem' }}>
        <h3 style={{
          fontSize: '1rem',
          fontWeight: 800,
          marginBottom: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          🗺️ Synchronized Mapbox Live Traffic Road Context
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
