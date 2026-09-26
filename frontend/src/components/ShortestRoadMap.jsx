import React from 'react';
import { Navigation, MapPin, Building2, CheckCircle2, AlertTriangle, ArrowRight, Zap, Car, Compass } from 'lucide-react';

export default function ShortestRoadMap({
  corridorData,
  activeRouteId,
  simProgress,
  onJumpToProgress,
  onSelectRoute,
  startLocation = "Punjagutta Fire Station",
  hospital = "Osmania General Hospital",
  vehicleType = "ambulance"
}) {
  const activeCorridor = corridorData?.corridors?.[activeRouteId];
  const allCorridors = corridorData?.corridors ? Object.values(corridorData.corridors) : [];

  const originStation = corridorData?.stations?.[startLocation] || Object.values(corridorData?.stations || {})[0] || { name: startLocation, address: "Station Base" };
  const destHospital = corridorData?.hospitals?.[hospital] || Object.values(corridorData?.hospitals || {})[0] || { name: hospital, address: "Emergency Ward" };
  const isFire = (vehicleType === 'fire_truck');

  // Sort corridors by distance to verify the shortest road route
  const sortedByDistance = [...allCorridors].sort((a, b) => (a.distanceMiles || 0) - (b.distanceMiles || 0));
  const shortestCorridor = sortedByDistance[0] || activeCorridor;

  // Determine which step is currently active
  const maneuvers = activeCorridor?.maneuvers || [];
  const currentStepIndex = maneuvers.length > 0
    ? Math.min(maneuvers.length - 1, Math.floor(simProgress * maneuvers.length))
    : 0;

  return (
    <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* Title & Shortest Route Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid var(--color-dark)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Navigation size={18} color="var(--color-red)" />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 900, color: 'var(--color-dark)' }}>
              BEST SHORTEST ROAD MAP & TURN-BY-TURN
            </h3>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--color-dark-muted)', marginTop: '0.15rem' }}>
            Interactive road corridor connecting Source Station to Emergency Destination
          </p>
        </div>

        {/* Shortest Route Indicator Badge */}
        <span style={{
          backgroundColor: 'var(--color-yellow)',
          color: 'var(--color-dark)',
          border: '2px solid var(--color-dark)',
          borderRadius: 'var(--radius-pill)',
          padding: '0.25rem 0.65rem',
          fontSize: '0.72rem',
          fontFamily: 'var(--font-heading)',
          fontWeight: 800,
          boxShadow: 'var(--shadow-solid-sm)'
        }}>
          ⭐ SHORTEST: {shortestCorridor?.name || 'Route A'} ({shortestCorridor?.distanceMiles || 3.2} mi)
        </span>
      </div>

      {/* Origin -> Destination Route Comparison Pill */}
      <div style={{
        backgroundColor: 'var(--bg-well)',
        border: '2px solid var(--color-dark)',
        borderRadius: '12px',
        padding: '0.75rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '0.75rem'
      }}>
        {/* Source Station */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: isFire ? 'var(--color-red)' : 'var(--color-yellow)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid var(--color-dark)',
            fontSize: '15px'
          }}>
            {isFire ? '🚒' : '🚑'}
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--color-dark-muted)', fontWeight: 700 }}>
              {isFire ? 'SOURCE FIRE STATION' : 'SOURCE EMS ORIGIN'}
            </div>
            <strong style={{ fontSize: '0.82rem', fontFamily: 'var(--font-heading)', color: 'var(--color-dark)' }}>
              {originStation.name}
            </strong>
            <div style={{ fontSize: '0.68rem', color: '#666' }}>{originStation.address}</div>
          </div>
        </div>

        {/* Direction Arrow */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            backgroundColor: 'var(--color-white)',
            border: '1.5px solid var(--color-dark)',
            borderRadius: 'var(--radius-pill)',
            padding: '0.2rem 0.6rem',
            fontSize: '0.7rem',
            fontWeight: 800
          }}>
            <span>{activeCorridor?.distanceMiles || 3.2} mi</span>
            <ArrowRight size={14} color="var(--color-red)" />
            <span>~{activeCorridor?.baseMinutes || 8} min</span>
          </div>
        </div>

        {/* Destination Hospital */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-teal)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid var(--color-dark)',
            fontSize: '15px'
          }}>
            🏥
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--color-dark-muted)', fontWeight: 700 }}>DESTINATION</div>
            <strong style={{ fontSize: '0.82rem', fontFamily: 'var(--font-heading)', color: 'var(--color-dark)' }}>
              {destHospital.name}
            </strong>
            <div style={{ fontSize: '0.68rem', color: '#666' }}>{destHospital.address}</div>
          </div>
        </div>
      </div>

      {/* Road Corridor Comparison Selector */}
      <div>
        <label style={{ fontSize: '0.7rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--color-dark)', display: 'block', marginBottom: '0.35rem' }}>
          SELECT ROAD CORRIDOR TO NAVIGATE:
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
          {allCorridors.map(c => {
            const isSelected = c.id === activeRouteId;
            const isShortest = c.id === shortestCorridor?.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelectRoute && onSelectRoute(c.id)}
                style={{
                  backgroundColor: isSelected ? 'var(--color-yellow)' : 'var(--color-white)',
                  border: isSelected ? '2px solid var(--color-dark)' : '1.5px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '0.55rem 0.5rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxShadow: isSelected ? 'var(--shadow-solid-sm)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.78rem', fontFamily: 'var(--font-heading)', color: 'var(--color-dark)' }}>
                    {c.name.split(' - ')[0]}
                  </strong>
                  {isShortest && (
                    <span style={{ fontSize: '0.6rem', background: 'var(--color-red)', color: '#fff', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: 900 }}>
                      SHORTEST
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--color-dark-muted)', marginTop: '0.2rem' }}>
                  {c.distanceMiles} mi • {c.baseMinutes}m base
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Turn-by-Turn Road Maneuvers (Interactive Step-by-Step Driving) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <label style={{ fontSize: '0.7rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--color-dark)' }}>
            TURN-BY-TURN ROAD DIRECTIONS (CLICK TO MANUALLY DRIVE):
          </label>
          <span style={{ fontSize: '0.68rem', color: 'var(--color-dark-muted)', fontWeight: 600 }}>
            Step {currentStepIndex + 1} of {maneuvers.length}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          {maneuvers.map((m, idx) => {
            const isCurrent = idx === currentStepIndex;
            const progressForStep = idx / Math.max(1, maneuvers.length - 1);

            return (
              <div
                key={m.step}
                onClick={() => onJumpToProgress(progressForStep)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: isCurrent ? 'var(--color-yellow)' : 'var(--color-white)',
                  border: isCurrent ? '2px solid var(--color-dark)' : '1.5px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '0.6rem 0.8rem',
                  cursor: 'pointer',
                  boxShadow: isCurrent ? 'var(--shadow-solid-sm)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: isCurrent ? 'var(--color-red)' : 'var(--bg-well)',
                    color: isCurrent ? '#FFFFFF' : 'var(--color-dark)',
                    border: '1.5px solid var(--color-dark)',
                    fontSize: '0.72rem',
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {m.step}
                  </span>
                  <div>
                    <strong style={{ fontSize: '0.8rem', fontFamily: 'var(--font-heading)', color: 'var(--color-dark)' }}>
                      {m.text}
                    </strong>
                    <div style={{ fontSize: '0.68rem', color: 'var(--color-dark-muted)' }}>
                      Distance: <strong>{m.dist}</strong> {m.text.includes('School') ? '• 🏫 20 MPH Speed Limit' : ''}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  style={{
                    backgroundColor: isCurrent ? 'var(--color-dark)' : 'var(--bg-well)',
                    color: isCurrent ? '#FFFFFF' : 'var(--color-dark)',
                    border: '1.5px solid var(--color-dark)',
                    borderRadius: 'var(--radius-pill)',
                    padding: '0.25rem 0.6rem',
                    fontSize: '0.68rem',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <Compass size={12} />
                  <span>{isCurrent ? 'Driving Here' : 'Drive Here'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
