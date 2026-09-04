import React from 'react';
import { Gauge, Radio, ShieldCheck, Clock, Navigation, CheckCircle2, AlertTriangle, ArrowRight, CornerUpRight, CornerUpLeft } from 'lucide-react';

export default function LiveTelemetryBar({
  telemetry = {},
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

  // Turn arrow icon resolver
  const getTurnIcon = (text = '') => {
    const lower = text.toLowerCase();
    if (lower.includes('right')) return <CornerUpRight size={18} color="#38bdf8" />;
    if (lower.includes('left')) return <CornerUpLeft size={18} color="#38bdf8" />;
    return <ArrowRight size={18} color="#38bdf8" />;
  };

  return (
    <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Top Telemetry Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
        {/* Speedometer Card with Glow */}
        <div style={{
          background: inSchoolZone ? 'rgba(239, 68, 68, 0.12)' : 'rgba(10, 16, 29, 0.85)',
          border: inSchoolZone ? '1.5px solid #ef4444' : '1px solid #1f2d48',
          borderRadius: '10px',
          padding: '0.75rem 0.85rem',
          textAlign: 'center',
          boxShadow: inSchoolZone ? '0 0 16px rgba(239, 68, 68, 0.3)' : 'none',
          transition: 'all 0.25s ease'
        }}>
          <div style={{ fontSize: '0.65rem', color: inSchoolZone ? '#fca5a5' : '#94a3b8', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontWeight: 700 }}>
            <Gauge size={14} color={inSchoolZone ? '#ef4444' : '#38bdf8'} />
            {inSchoolZone ? 'SCHOOL LIMIT (20)' : 'TRANSIT SPEED'}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: inSchoolZone ? '#ef4444' : '#f8fafc', fontFamily: 'var(--font-mono)', lineHeight: 1.15, margin: '0.2rem 0' }}>
            {speedMph} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>MPH</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: inSchoolZone ? '#fca5a5' : '#10b981', fontWeight: 600 }}>
            {inSchoolZone ? '⚠️ Speed Throttled' : 'Code 3 Sirens Clear'}
          </div>
        </div>

        {/* ETA Countdown */}
        <div style={{
          background: 'rgba(10, 16, 29, 0.85)',
          border: '1px solid #1f2d48',
          borderRadius: '10px',
          padding: '0.75rem 0.85rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontWeight: 700 }}>
            <Clock size={14} color="#38bdf8" />
            TRANSIT ETA
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#38bdf8', fontFamily: 'var(--font-mono)', lineHeight: 1.15, margin: '0.2rem 0' }}>
            {formatTime(etaSeconds)}
          </div>
          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
            {distanceRemainingMiles.toFixed(1)} mi remaining
          </div>
        </div>

        {/* Green Wave Preemption Counter */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          borderRadius: '10px',
          padding: '0.75rem 0.85rem',
          textAlign: 'center',
          boxShadow: '0 0 16px rgba(16, 185, 129, 0.15)'
        }}>
          <div style={{ fontSize: '0.65rem', color: '#6ee7b7', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontWeight: 700 }}>
            <ShieldCheck size={14} color="#10b981" />
            GREEN WAVE CLEARANCE
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#10b981', fontFamily: 'var(--font-mono)', lineHeight: 1.15, margin: '0.2rem 0' }}>
            {preemptedCount} <span style={{ fontSize: '0.9rem', color: '#64748b' }}>/ {totalSignals}</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: '#34d399', fontWeight: 600 }}>
            {vehiclesCleared} vehicles cleared to curb
          </div>
        </div>

        {/* Transit Progress */}
        <div style={{
          background: 'rgba(10, 16, 29, 0.85)',
          border: '1px solid #1f2d48',
          borderRadius: '10px',
          padding: '0.75rem 0.85rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontWeight: 700 }}>
            <Navigation size={14} color="#38bdf8" />
            ROUTE PROGRESS
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#f8fafc', fontFamily: 'var(--font-mono)', lineHeight: 1.15, margin: '0.2rem 0' }}>
            {progressPercent}%
          </div>
          <div style={{ fontSize: '0.68rem', color: progressPercent >= 100 ? '#10b981' : '#64748b', fontWeight: 600 }}>
            {progressPercent >= 100 ? '✓ Arrived at Emergency Bay' : 'En Route Emergency'}
          </div>
        </div>
      </div>

      {/* Progress Track Bar */}
      <div style={{ width: '100%', height: '8px', background: '#090e1a', borderRadius: '9999px', overflow: 'hidden', border: '1px solid #1f2d48', position: 'relative' }}>
        <div style={{
          width: `${progressPercent}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #3b82f6 0%, #10b981 100%)',
          boxShadow: '0 0 12px #10b981',
          transition: 'width 0.2s linear'
        }} />
      </div>

      {/* Turn-by-Turn Instruction Banner */}
      {currentManeuver && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(30, 58, 138, 0.25) 0%, rgba(15, 23, 42, 0.4) 100%)',
          border: '1px solid rgba(59, 130, 246, 0.4)',
          borderRadius: '10px',
          padding: '0.75rem 1.1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              background: '#2563eb',
              color: '#ffffff',
              borderRadius: '8px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px rgba(37, 99, 235, 0.5)'
            }}>
              {getTurnIcon(currentManeuver.text)}
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#93c5fd', fontWeight: 700, textTransform: 'uppercase' }}>
                NEXT DISPATCH MANEUVER • STEP {currentManeuver.step}
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>
                {currentManeuver.text}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
            <div style={{ fontSize: '0.65rem', color: '#64748b' }}>SEGMENT</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
              {currentManeuver.dist}
            </div>
          </div>
        </div>
      )}

      {/* Live CAD Radio Incident Log */}
      <div>
        <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Radio size={14} color="#ef4444" className="strobe-red" />
          DISPATCH RADIO & SIGNAL PREEMPTION INCIDENT FEED
        </div>
        <div style={{
          maxHeight: '110px',
          overflowY: 'auto',
          background: '#070b14',
          border: '1px solid #1a253c',
          borderRadius: '8px',
          padding: '0.55rem 0.85rem',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.72rem',
          display: 'flex',
          flexDirection: 'column-reverse',
          gap: '0.35rem'
        }}>
          {eventLogs.map((log, index) => (
            <div key={index} style={{
              color: log.type === 'preempt' ? '#34d399' : log.type === 'alert' ? '#f87171' : log.type === 'arrive' ? '#38bdf8' : '#cbd5e1',
              display: 'flex',
              gap: '0.6rem'
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
