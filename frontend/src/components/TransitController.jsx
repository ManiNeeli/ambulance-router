import React from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, ShieldAlert, Zap, Radio, Bell, FastForward } from 'lucide-react';

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1f2d48', paddingBottom: '0.65rem' }}>
        <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Zap size={16} color="#ef4444" />
          EMERGENCY TRANSIT & TRAFFIC PREEMPTION CONTROLLER
        </h3>
        <span style={{
          background: isSimulating ? '#ef444422' : '#1e293b',
          color: isSimulating ? '#f87171' : '#94a3b8',
          border: isSimulating ? '1px solid #ef444455' : '1px solid #334155',
          fontSize: '0.68rem',
          fontWeight: 700,
          padding: '0.15rem 0.5rem',
          borderRadius: '4px'
        }}>
          {isSimulating ? '🚨 CODE 3 IN TRANSIT' : 'STANDBY'}
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
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
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
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)',
              padding: '0.7rem 1rem'
            }}
          >
            <Pause size={16} /> PAUSE TRANSIT
          </button>
        )}

        <button
          type="button"
          onClick={onReset}
          style={{
            background: '#152033',
            border: '1px solid #283a5c',
            color: '#cbd5e1',
            borderRadius: '8px',
            fontSize: '0.8rem',
            fontWeight: 600,
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
          style={{
            background: '#132e26',
            border: '1px solid #10b98188',
            color: '#6ee7b7',
            borderRadius: '8px',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
            textAlign: 'center'
          }}
          title="Force all traffic signals along route to Green"
        >
          <ShieldAlert size={14} color="#10b981" /> Clear All
        </button>
      </div>

      {/* Speed & Automation Options */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem', background: '#090e1a', padding: '0.65rem', borderRadius: '8px', border: '1px solid #1c273e' }}>
        {/* Speed Multiplier */}
        <div>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginBottom: '0.3rem', fontWeight: 600 }}>
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
                  background: simSpeed === speed ? '#3b82f6' : '#151f33',
                  border: simSpeed === speed ? '1px solid #60a5fa' : '1px solid #23334f',
                  color: simSpeed === speed ? '#ffffff' : '#94a3b8',
                  padding: '0.3rem 0.4rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
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
          <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginBottom: '0.3rem', fontWeight: 600 }}>
            GREEN WAVE MODE:
          </div>
          <button
            type="button"
            onClick={onToggleAutoPreempt}
            style={{
              width: '100%',
              background: autoPreempt ? '#10b98122' : '#151f33',
              border: autoPreempt ? '1px solid #10b981' : '1px solid #23334f',
              color: autoPreempt ? '#34d399' : '#94a3b8',
              padding: '0.3rem 0.4rem',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {autoPreempt ? '✓ AI Auto-EVP' : 'Manual Signal'}
          </button>
        </div>

        {/* Siren Audio Toggle */}
        <div>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginBottom: '0.3rem', fontWeight: 600 }}>
            SIREN AUDIO:
          </div>
          <button
            type="button"
            onClick={onToggleAudio}
            style={{
              width: '100%',
              background: audioEnabled ? '#ef444422' : '#151f33',
              border: audioEnabled ? '1px solid #ef4444' : '1px solid #23334f',
              color: audioEnabled ? '#f87171' : '#94a3b8',
              padding: '0.3rem 0.4rem',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 700,
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
          <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginBottom: '0.3rem', fontWeight: 600 }}>
            VOICE GUIDANCE:
          </div>
          <button
            type="button"
            onClick={onToggleVoice}
            style={{
              width: '100%',
              background: voiceEnabled ? '#3b82f622' : '#151f33',
              border: voiceEnabled ? '1px solid #3b82f6' : '1px solid #23334f',
              color: voiceEnabled ? '#60a5fa' : '#94a3b8',
              padding: '0.3rem 0.4rem',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 700,
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
