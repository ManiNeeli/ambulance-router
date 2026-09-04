import React from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, ShieldAlert, Zap, Radio } from 'lucide-react';

export default function TransitController({
  isSimulating,
  onStart,
  onPause,
  onReset,
  simSpeed,
  onChangeSpeed,
  autoPreempt,
  onToggleAutoPreempt,
  audioEnabled,
  onToggleAudio,
  voiceEnabled,
  onToggleVoice,
  onForceClearAll
}) {
  return (
    <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
        <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Zap size={16} color="var(--alert-red)" />
          TRANSIT & TRAFFIC PREEMPTION CONTROLLER
        </h3>
        <span style={{
          background: isSimulating ? 'var(--alert-red-soft)' : 'var(--bg-well)',
          color: isSimulating ? 'var(--alert-red)' : 'var(--text-secondary)',
          border: isSimulating ? '1px solid var(--alert-red)' : '1px solid var(--border-subtle)',
          fontSize: '0.68rem',
          fontWeight: 800,
          padding: '0.15rem 0.5rem',
          borderRadius: '4px'
        }}>
          {isSimulating ? '🚨 CODE 3 IN TRANSIT' : 'STANDBY READY'}
        </span>
      </div>

      {/* Main Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.6rem' }}>
        {!isSimulating ? (
          <button
            type="button"
            className="btn-dispatch"
            onClick={onStart}
            style={{
              background: 'linear-gradient(135deg, var(--signal-green) 0%, #059669 100%)',
              boxShadow: '0 4px 18px var(--signal-green-glow)',
              padding: '0.7rem 1rem'
            }}
          >
            <Play size={16} /> START TRANSIT RUN
          </button>
        ) : (
          <button
            type="button"
            className="btn-dispatch"
            onClick={onPause}
            style={{
              background: 'linear-gradient(135deg, var(--caution-amber) 0%, #d97706 100%)',
              boxShadow: '0 4px 18px var(--caution-amber-glow)',
              padding: '0.7rem 1rem'
            }}
          >
            <Pause size={16} /> PAUSE TRANSIT
          </button>
        )}

        <button
          type="button"
          onClick={onReset}
          className="cad-well"
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem'
          }}
        >
          <RotateCcw size={14} /> Reset
        </button>

        <button
          type="button"
          onClick={onForceClearAll}
          className="cad-well"
          style={{
            borderColor: 'var(--signal-green)',
            color: 'var(--signal-green)',
            fontSize: '0.75rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
            textAlign: 'center'
          }}
          title="Force all traffic signals along corridor to Green"
        >
          <ShieldAlert size={14} color="var(--signal-green)" /> Clear All
        </button>
      </div>

      {/* Speed & Automation Options */}
      <div className="cad-well" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem', padding: '0.65rem' }}>
        {/* Speed Multiplier */}
        <div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: 700 }}>
            SIMULATION SPEED:
          </div>
          <div style={{ display: 'flex', gap: '0.3rem' }}>
            {[1, 2, 5].map(speed => (
              <button
                key={speed}
                type="button"
                onClick={() => onChangeSpeed(speed)}
                style={{
                  flex: 1,
                  background: simSpeed === speed ? 'var(--accent-cyan)' : 'var(--bg-well)',
                  border: simSpeed === speed ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                  color: simSpeed === speed ? '#04101e' : 'var(--text-secondary)',
                  padding: '0.3rem 0.4rem',
                  borderRadius: '5px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Auto Preemption Toggle */}
        <div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: 700 }}>
            GREEN WAVE MODE:
          </div>
          <button
            type="button"
            onClick={onToggleAutoPreempt}
            style={{
              width: '100%',
              background: autoPreempt ? 'var(--signal-green-soft)' : 'var(--bg-well)',
              border: autoPreempt ? '1px solid var(--signal-green)' : '1px solid var(--border-subtle)',
              color: autoPreempt ? 'var(--signal-green)' : 'var(--text-secondary)',
              padding: '0.3rem 0.4rem',
              borderRadius: '5px',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            {autoPreempt ? '✓ AI Auto-EVP' : 'Manual Signal'}
          </button>
        </div>

        {/* Siren Audio Toggle */}
        <div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: 700 }}>
            SIREN AUDIO:
          </div>
          <button
            type="button"
            onClick={onToggleAudio}
            style={{
              width: '100%',
              background: audioEnabled ? 'var(--alert-red-soft)' : 'var(--bg-well)',
              border: audioEnabled ? '1px solid var(--alert-red)' : '1px solid var(--border-subtle)',
              color: audioEnabled ? 'var(--alert-red)' : 'var(--text-secondary)',
              padding: '0.3rem 0.4rem',
              borderRadius: '5px',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.3rem'
            }}
          >
            {audioEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
            {audioEnabled ? 'Siren Active' : 'Muted'}
          </button>
        </div>

        {/* Voice Guidance Toggle */}
        <div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: 700 }}>
            VOICE GUIDANCE:
          </div>
          <button
            type="button"
            onClick={onToggleVoice}
            style={{
              width: '100%',
              background: voiceEnabled ? 'rgba(0, 242, 254, 0.12)' : 'var(--bg-well)',
              border: voiceEnabled ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
              color: voiceEnabled ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              padding: '0.3rem 0.4rem',
              borderRadius: '5px',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.3rem'
            }}
          >
            {voiceEnabled ? <Radio size={13} /> : <VolumeX size={13} />}
            {voiceEnabled ? 'Voice On' : 'Voice Off'}
          </button>
        </div>
      </div>
    </div>
  );
}
