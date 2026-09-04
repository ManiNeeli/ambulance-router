import React from 'react';
import { Gauge, Radio, ShieldCheck, Clock, Navigation, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function LiveTelemetryBar({
  telemetry,
  currentManeuver,
  eventLogs = []
}) {
  const {
    speedMph = 0,
    progressPercent = 0,
    etaSeconds = 0,
    distanceRemainingMiles = 0,
    preemptedCount = 0,
    totalSignals = 0,
    vehiclesCleared = 0,
    inSchoolZone = false
  } = telemetry;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Top Telemetry Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
        {/* Speedometer */}
        <div style={{
          background: '#0a101d',
          border: inSchoolZone ? '1px solid #ef4444' : '1px solid #1f2d48',
          padding: '0.65rem 0.85rem',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.65rem', color: inSchoolZone ? '#fca5a5' : '#94a3b8', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
            <Gauge size={13} color={inSchoolZone ? '#ef4444' : '#38bdf8'} />
            SPEED {inSchoolZone ? '(SCHOOL LIMIT)' : ''}
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: inSchoolZone ? '#ef4444' : '#f8fafc', fontFamily: 'var(--font-mono)' }}>
            {speedMph} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#64748b' }}>MPH</span>
          </div>
          <div style={{ fontSize: '0.65rem', color: inSchoolZone ? '#fca5a5' : '#6ee7b7' }}>
            {inSchoolZone ? '⚠️ 20 MPH Caution Zone' : 'Emergency Priority Speed'}
          </div>
        </div>

        {/* ETA Countdown */}
        <div style={{
          background: '#0a101d',
          border: '1px solid #1f2d48',
          padding: '0.65rem 0.85rem',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
            <Clock size={13} color="#38bdf8" />
            TRANSIT ETA
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
            {formatTime(etaSeconds)}
          </div>
          <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
            {distanceRemainingMiles.toFixed(1)} mi remaining
          </div>
        </div>

        {/* Green Wave Preemption */}
        <div style={{
          background: '#0a101d',
          border: '1px solid #10b98144',
          padding: '0.65rem 0.85rem',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.65rem', color: '#6ee7b7', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
            <ShieldCheck size={13} color="#10b981" />
            GREEN WAVE SIGNALS
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
            {preemptedCount} <span style={{ fontSize: '0.9rem', color: '#64748b' }}>/ {totalSignals}</span>
          </div>
          <div style={{ fontSize: '0.65rem', color: '#34d399', fontWeight: 600 }}>
            {vehiclesCleared} cars pulled right
          </div>
        </div>

        {/* Corridor Clearance Status */}
        <div style={{
          background: '#0a101d',
          border: '1px solid #1f2d48',
          padding: '0.65rem 0.85rem',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
            <Navigation size={13} color="#38bdf8" />
            COMPLETION
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>
            {progressPercent}%
          </div>
          <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
            {progressPercent >= 100 ? 'Arrived at Trauma Bay' : 'En Route Code 3'}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '8px', background: '#0a101d', borderRadius: '4px', overflow: 'hidden', border: '1px solid #1f2d48' }}>
        <div style={{
          width: `${progressPercent}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #3b82f6 0%, #10b981 100%)',
          boxShadow: '0 0 10px #10b981',
          transition: 'width 0.25s linear'
        }} />
      </div>

      {/* Current Turn-by-Turn Instruction Banner */}
      {currentManeuver && (
        <div style={{
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid #3b82f644',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: '#3b82f6',
              color: '#ffffff',
              borderRadius: '6px',
              padding: '0.35rem 0.6rem',
              fontWeight: 800,
              fontSize: '0.8rem'
            }}>
              STEP {currentManeuver.step}
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                {currentManeuver.text}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#93c5fd' }}>
                Distance segment: {currentManeuver.dist}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live CAD Radio Incident Log */}
      <div>
        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Radio size={13} color="#ef4444" className="animate-siren" />
          LIVE DISPATCH & TRAFFIC CLEARANCE RADIO LOG
        </div>
        <div style={{
          maxHeight: '105px',
          overflowY: 'auto',
          background: '#090e1a',
          border: '1px solid #1c273e',
          borderRadius: '6px',
          padding: '0.5rem 0.75rem',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.72rem',
          display: 'flex',
          flexDirection: 'column-reverse',
          gap: '0.3rem'
        }}>
          {eventLogs.map((log, index) => (
            <div key={index} style={{
              color: log.type === 'preempt' ? '#34d399' : log.type === 'alert' ? '#f87171' : log.type === 'arrive' ? '#38bdf8' : '#cbd5e1',
              display: 'flex',
              gap: '0.5rem'
            }}>
              <span style={{ color: '#64748b' }}>[{log.time}]</span>
              <span>{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
