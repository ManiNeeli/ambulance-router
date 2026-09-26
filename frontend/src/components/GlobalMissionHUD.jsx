import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatchContext } from '../context/DispatchContext.jsx';
import { Gauge, Clock, ShieldCheck, Navigation, Play, Pause, RotateCcw, AlertTriangle } from 'lucide-react';

export default function GlobalMissionHUD() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    telemetry,
    currentManeuver,
    isSimulating,
    handleStart,
    handlePause,
    handleReset,
    formData,
    activeCorridor
  } = useDispatchContext();

  // Don't show HUD on landing/overview page
  if (location.pathname === '/overview') {
    return null;
  }

  const {
    speedMph = 0,
    progressPercent = 0,
    etaSeconds = 0,
    preemptedCount = 0,
    totalSignals = 0,
    inSchoolZone = false
  } = telemetry;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const unitTitle = formData.vehicleType === 'fire_truck' ? 'Fire Tender 01' : '108 ALS Unit';

  return (
    <aside className="global-mission-hud" aria-label="Live Mission Status Bar">
      {/* Left: Mission Unit & Status */}
      <div className="global-mission-hud-metrics">
        <div className="global-mission-hud-tag">
          <span
            className="status-dot"
            style={{
              backgroundColor: isSimulating ? 'var(--color-red)' : progressPercent >= 100 ? 'var(--color-teal)' : 'var(--color-yellow)',
              boxShadow: isSimulating ? '0 0 8px var(--color-red)' : 'none'
            }}
          />
          <span>{unitTitle}</span>
          <span style={{ color: 'var(--color-dark-muted)', fontWeight: 500 }}>
            → {formData.hospital}
          </span>
        </div>

        {/* Speed */}
        <div className="global-mission-hud-tag" style={{ color: inSchoolZone ? 'var(--color-red)' : 'inherit' }}>
          <Gauge size={14} color={inSchoolZone ? 'var(--color-red)' : 'var(--color-teal)'} />
          <span>{speedMph} MPH</span>
          {inSchoolZone && <span style={{ fontSize: '0.7rem', color: 'var(--color-red)', fontWeight: 800 }}>(SCHOOL ZONE)</span>}
        </div>

        {/* ETA */}
        <div className="global-mission-hud-tag">
          <Clock size={14} color="var(--color-teal)" />
          <span>ETA: <strong>{formatTime(etaSeconds)}</strong></span>
        </div>

        {/* Green Wave */}
        <div className="global-mission-hud-tag">
          <ShieldCheck size={14} color="#16A34A" />
          <span>EVP: <strong>{preemptedCount}/{totalSignals}</strong></span>
        </div>

        {/* Progress */}
        <div className="global-mission-hud-tag">
          <Navigation size={14} color="var(--color-yellow)" />
          <span>{progressPercent}%</span>
        </div>

        {/* Current Next Step */}
        {currentManeuver && (
          <div className="global-mission-hud-tag" style={{ display: 'none', lg: 'inline-flex' }}>
            <span style={{ color: 'var(--color-dark-muted)', fontSize: '0.75rem' }}>Next:</span>
            <span style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentManeuver.text}
            </span>
          </div>
        )}
      </div>

      {/* Right: Quick Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
        {isSimulating ? (
          <button
            type="button"
            onClick={handlePause}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.65rem',
              borderRadius: '6px',
              border: '1.5px solid var(--color-dark)',
              background: 'var(--color-yellow)',
              color: 'var(--color-dark)',
              fontWeight: 800,
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            <Pause size={13} /> Pause
          </button>
        ) : (
          <button
            type="button"
            onClick={handleStart}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.65rem',
              borderRadius: '6px',
              border: '1.5px solid var(--color-dark)',
              background: 'var(--color-red)',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            <Play size={13} /> {progressPercent > 0 && progressPercent < 100 ? 'Resume' : 'Launch'}
          </button>
        )}

        <button
          type="button"
          onClick={handleReset}
          title="Reset transit to origin station"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.3rem 0.55rem',
            borderRadius: '6px',
            border: '1.5px solid var(--border-subtle)',
            background: 'var(--bg-well)',
            color: 'var(--color-dark)',
            fontWeight: 700,
            fontSize: '0.75rem',
            cursor: 'pointer'
          }}
        >
          <RotateCcw size={12} />
        </button>
      </div>
    </aside>
  );
}
