import React from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, ShieldAlert, Zap, Radio, ChevronLeft, ChevronRight, Compass } from 'lucide-react';

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
  onForceClearAll,
  simProgress = 0,
  onManualProgressChange
}) {
  const percent = Math.round(simProgress * 100);

  const handleStep = (delta) => {
    if (onManualProgressChange) {
      const next = Math.max(0, Math.min(1.0, simProgress + delta));
      onManualProgressChange(next);
    }
  };

  return (
    <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid var(--color-dark)', paddingBottom: '0.65rem' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.92rem', fontWeight: 900, color: 'var(--color-dark)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Zap size={16} color="var(--color-red)" />
          MANUAL ROAD DRIVING & TRANSIT CONTROLS
        </h3>
        <span style={{
          backgroundColor: isSimulating ? 'var(--color-red)' : 'var(--color-yellow)',
          color: isSimulating ? '#FFFFFF' : 'var(--color-dark)',
          border: '1.5px solid var(--color-dark)',
          fontSize: '0.68rem',
          fontFamily: 'var(--font-heading)',
          fontWeight: 900,
          padding: '0.2rem 0.6rem',
          borderRadius: 'var(--radius-pill)',
          boxShadow: 'var(--shadow-solid-sm)'
        }}>
          {isSimulating ? '🚨 LIVE AUTO TRANSIT' : '🕹️ MANUAL DRIVE READY'}
        </span>
      </div>

      {/* Manual Road Scrubber Slider */}
      <div style={{
        backgroundColor: 'var(--bg-well)',
        border: '2px solid var(--color-dark)',
        borderRadius: '12px',
        padding: '0.8rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.45rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--color-dark)' }}>
            📍 ROAD WAYPOINT POSITION:
          </span>
          <span style={{
            fontSize: '0.8rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 800,
            color: 'var(--color-dark)',
            backgroundColor: 'var(--color-white)',
            border: '1px solid var(--color-dark)',
            borderRadius: '6px',
            padding: '0.1rem 0.5rem'
          }}>
            {percent}% Road Distance
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="1"
          step="0.005"
          value={simProgress}
          onChange={(e) => onManualProgressChange && onManualProgressChange(parseFloat(e.target.value))}
          style={{
            width: '100%',
            cursor: 'pointer',
            accentColor: 'var(--color-red)',
            height: '8px'
          }}
          aria-label="Manual route position scrubber"
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.66rem', color: 'var(--color-dark-muted)', fontWeight: 700 }}>
          <span>🚒 Fire Station (0%)</span>
          <span>🚦 Signal Intersections</span>
          <span>🏥 Hospital Bay (100%)</span>
        </div>
      </div>

      {/* Manual Step Driving Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.45rem' }}>
        <button
          type="button"
          onClick={() => handleStep(-0.1)}
          className="cad-well"
          style={{
            cursor: 'pointer',
            textAlign: 'center',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            color: 'var(--color-dark)',
            border: '1.5px solid var(--color-dark)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.2rem'
          }}
          title="Reverse ambulance 10% along road"
        >
          <ChevronLeft size={16} /> -10% Back
        </button>

        <button
          type="button"
          onClick={() => handleStep(-0.02)}
          className="cad-well"
          style={{
            cursor: 'pointer',
            textAlign: 'center',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            color: 'var(--color-dark)',
            border: '1.5px solid var(--color-dark)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.2rem'
          }}
          title="Reverse ambulance 2% along road (Left Arrow Key)"
        >
          <ChevronLeft size={14} /> -2% Step
        </button>

        <button
          type="button"
          onClick={() => handleStep(0.02)}
          className="cad-well"
          style={{
            cursor: 'pointer',
            textAlign: 'center',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            color: 'var(--color-dark)',
            border: '1.5px solid var(--color-dark)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.2rem'
          }}
          title="Drive ambulance 2% along road (Right Arrow Key)"
        >
          +2% Step <ChevronRight size={14} />
        </button>

        <button
          type="button"
          onClick={() => handleStep(0.1)}
          className="cad-well"
          style={{
            cursor: 'pointer',
            textAlign: 'center',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            color: 'var(--color-dark)',
            border: '1.5px solid var(--color-dark)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.2rem'
          }}
          title="Drive ambulance 10% along road"
        >
          +10% Fwd <ChevronRight size={16} />
        </button>
      </div>

      {/* Keyboard Driving Hint */}
      <div style={{
        fontSize: '0.68rem',
        color: 'var(--color-dark-muted)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        backgroundColor: 'var(--color-white)',
        padding: '0.35rem 0.6rem',
        borderRadius: '8px',
        border: '1px solid var(--border-subtle)'
      }}>
        <Compass size={14} color="var(--color-teal)" />
        <span><strong>Drive with Keyboard:</strong> Press <strong>[&larr;] / [&rarr;]</strong> or <strong>[A] / [D]</strong> keys anytime to manually steer along the road.</span>
      </div>

      {/* Auto Simulation Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.5rem' }}>
        {!isSimulating ? (
          <button
            type="button"
            className="btn-dispatch"
            onClick={onStart}
            style={{
              backgroundColor: 'var(--color-teal)',
              padding: '0.7rem 0.9rem'
            }}
          >
            <Play size={16} /> AUTO DRIVE RUN
          </button>
        ) : (
          <button
            type="button"
            className="btn-dispatch"
            onClick={onPause}
            style={{
              backgroundColor: 'var(--color-yellow)',
              color: 'var(--color-dark)',
              padding: '0.7rem 0.9rem'
            }}
          >
            <Pause size={16} /> PAUSE DRIVE
          </button>
        )}

        <button
          type="button"
          onClick={onReset}
          className="cad-well"
          style={{
            color: 'var(--color-dark)',
            border: '1.5px solid var(--color-dark)',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.3rem'
          }}
        >
          <RotateCcw size={14} /> Reset
        </button>

        <button
          type="button"
          onClick={onForceClearAll}
          className="cad-well"
          style={{
            backgroundColor: 'var(--color-yellow)',
            border: '1.5px solid var(--color-dark)',
            color: 'var(--color-dark)',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-heading)',
            fontWeight: 900,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.3rem',
            textAlign: 'center'
          }}
          title="Force all traffic signals along corridor to Green"
        >
          <ShieldAlert size={14} color="var(--color-red)" /> Clear All
        </button>
      </div>

      {/* Speed, Green Wave, Siren, and Voice Toggles */}
      <div className="cad-well" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.45rem', padding: '0.6rem' }}>
        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--color-dark-muted)', marginBottom: '0.25rem', fontWeight: 800 }}>
            AUTO SPEED:
          </div>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {[1, 2, 5].map(speed => (
              <button
                key={speed}
                type="button"
                onClick={() => onChangeSpeed(speed)}
                style={{
                  flex: 1,
                  backgroundColor: simSpeed === speed ? 'var(--color-teal)' : 'var(--color-white)',
                  border: '1px solid var(--color-dark)',
                  color: simSpeed === speed ? '#FFFFFF' : 'var(--color-dark)',
                  padding: '0.25rem 0.35rem',
                  borderRadius: '5px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--color-dark-muted)', marginBottom: '0.25rem', fontWeight: 800 }}>
            GREEN WAVE:
          </div>
          <button
            type="button"
            onClick={onToggleAutoPreempt}
            style={{
              width: '100%',
              backgroundColor: autoPreempt ? 'var(--color-yellow)' : 'var(--color-white)',
              border: '1px solid var(--color-dark)',
              color: 'var(--color-dark)',
              padding: '0.25rem 0.35rem',
              borderRadius: '5px',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            {autoPreempt ? '✓ Auto-EVP' : 'Manual EVP'}
          </button>
        </div>

        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--color-dark-muted)', marginBottom: '0.25rem', fontWeight: 800 }}>
            SIREN AUDIO:
          </div>
          <button
            type="button"
            onClick={onToggleAudio}
            style={{
              width: '100%',
              backgroundColor: audioEnabled ? 'var(--color-red)' : 'var(--color-white)',
              border: '1px solid var(--color-dark)',
              color: audioEnabled ? '#FFFFFF' : 'var(--color-dark)',
              padding: '0.25rem 0.35rem',
              borderRadius: '5px',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.25rem'
            }}
          >
            {audioEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
            {audioEnabled ? 'Active' : 'Muted'}
          </button>
        </div>

        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--color-dark-muted)', marginBottom: '0.25rem', fontWeight: 800 }}>
            VOICE CAD:
          </div>
          <button
            type="button"
            onClick={onToggleVoice}
            style={{
              width: '100%',
              backgroundColor: voiceEnabled ? 'var(--color-teal)' : 'var(--color-white)',
              border: '1px solid var(--color-dark)',
              color: voiceEnabled ? '#FFFFFF' : 'var(--color-dark)',
              padding: '0.25rem 0.35rem',
              borderRadius: '5px',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.25rem'
            }}
          >
            {voiceEnabled ? <Radio size={12} /> : <VolumeX size={12} />}
            {voiceEnabled ? 'On' : 'Off'}
          </button>
        </div>
      </div>

    </div>
  );
}
