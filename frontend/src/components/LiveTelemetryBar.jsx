import React from 'react';
import { Gauge, Radio, ShieldCheck, Clock, Navigation, CornerUpRight, CornerUpLeft, ArrowRight } from 'lucide-react';

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

  const getTurnIcon = (text = '') => {
    const lower = text.toLowerCase();
    if (lower.includes('right')) return <CornerUpRight size={18} color="var(--accent-cyan)" />;
    if (lower.includes('left')) return <CornerUpLeft size={18} color="var(--accent-cyan)" />;
    return <ArrowRight size={18} color="var(--accent-cyan)" />;
  };

  return (
    <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Top Telemetry Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
        {/* Speedometer */}
        <div className="cad-well" style={{
          textAlign: 'center',
          borderColor: inSchoolZone ? 'var(--alert-red)' : 'var(--border-subtle)',
          boxShadow: inSchoolZone ? '0 0 16px var(--alert-red-glow)' : 'none'
        }}>
          <div style={{ fontSize: '0.65rem', color: inSchoolZone ? 'var(--alert-red)' : 'var(--text-secondary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontWeight: 800 }}>
            <Gauge size={14} color={inSchoolZone ? 'var(--alert-red)' : 'var(--accent-cyan)'} />
            {inSchoolZone ? 'SCHOOL LIMIT (20)' : 'TRANSIT SPEED'}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: inSchoolZone ? 'var(--alert-red)' : 'var(--text-primary)', fontFamily: 'var(--font-mono)', lineHeight: 1.15, margin: '0.2rem 0' }}>
            {speedMph} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>MPH</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: inSchoolZone ? 'var(--alert-red)' : 'var(--signal-green)', fontWeight: 700 }}>
            {inSchoolZone ? '⚠️ Speed Throttled' : 'Code 3 Sirens Clear'}
          </div>
        </div>

        {/* ETA Countdown */}
        <div className="cad-well" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontWeight: 800 }}>
            <Clock size={14} color="var(--accent-cyan)" />
            TRANSIT ETA
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', lineHeight: 1.15, margin: '0.2rem 0' }}>
            {formatTime(etaSeconds)}
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            {distanceRemainingMiles.toFixed(1)} mi remaining
          </div>
        </div>

        {/* Green Wave Preemption Counter */}
        <div className="cad-well" style={{
          textAlign: 'center',
          borderColor: 'rgba(0, 230, 118, 0.35)',
          background: 'var(--signal-green-soft)'
        }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--signal-green)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontWeight: 800 }}>
            <ShieldCheck size={14} color="var(--signal-green)" />
            GREEN WAVE CLEARANCE
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--signal-green)', fontFamily: 'var(--font-mono)', lineHeight: 1.15, margin: '0.2rem 0' }}>
            {preemptedCount} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ {totalSignals}</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--signal-green)', fontWeight: 700 }}>
            {vehiclesCleared} vehicles cleared to curb
          </div>
        </div>

        {/* Transit Progress */}
        <div className="cad-well" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontWeight: 800 }}>
            <Navigation size={14} color="var(--accent-cyan)" />
            ROUTE PROGRESS
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', lineHeight: 1.15, margin: '0.2rem 0' }}>
            {progressPercent}%
          </div>
          <div style={{ fontSize: '0.68rem', color: progressPercent >= 100 ? 'var(--signal-green)' : 'var(--text-muted)', fontWeight: 700 }}>
            {progressPercent >= 100 ? '✓ Arrived at Emergency Bay' : 'En Route Emergency'}
          </div>
        </div>
      </div>

      {/* Progress Track Bar */}
      <div style={{ width: '100%', height: '8px', background: 'var(--bg-well)', borderRadius: '9999px', overflow: 'hidden', border: '1px solid var(--border-subtle)', position: 'relative' }}>
        <div style={{
          width: `${progressPercent}%`,
          height: '100%',
          background: 'var(--accent-gradient)',
          boxShadow: '0 0 14px var(--accent-glow)',
          transition: 'width 0.2s linear'
        }} />
      </div>

      {/* Turn-by-Turn Instruction Banner */}
      {currentManeuver && (
        <div className="cad-well" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          border: '1.5px solid var(--border-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              background: 'var(--accent-cyan)',
              color: '#04101e',
              borderRadius: '8px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px var(--accent-glow)'
            }}>
              {getTurnIcon(currentManeuver.text)}
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', fontWeight: 800, textTransform: 'uppercase' }}>
                NEXT DISPATCH MANEUVER • STEP {currentManeuver.step}
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {currentManeuver.text}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>SEGMENT</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
              {currentManeuver.dist}
            </div>
          </div>
        </div>
      )}

      {/* Live CAD Radio Incident Log */}
      <div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Radio size={14} color="var(--alert-red)" className="strobe-red" />
          DISPATCH RADIO & SIGNAL PREEMPTION INCIDENT FEED
        </div>
        <div className="cad-well" style={{
          maxHeight: '110px',
          overflowY: 'auto',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.72rem',
          display: 'flex',
          flexDirection: 'column-reverse',
          gap: '0.35rem',
          padding: '0.65rem 0.85rem'
        }}>
          {eventLogs.map((log, index) => (
            <div key={index} style={{
              color: log.type === 'preempt' ? 'var(--signal-green)' : log.type === 'alert' ? 'var(--alert-red)' : log.type === 'arrive' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              display: 'flex',
              gap: '0.6rem'
            }}>
              <span style={{ color: 'var(--text-muted)' }}>[{log.time}]</span>
              <span>{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
