import React from 'react';
import { useDispatchContext } from '../context/DispatchContext.jsx';
import RadioIntercom from '../components/RadioIntercom.jsx';
import RecommendationDisplay from '../components/RecommendationDisplay.jsx';
import { Radio, Volume2, VolumeX, Mic, RadioTower } from 'lucide-react';

export default function RadioPage() {
  const {
    activeCorridor,
    addLog,
    audioEnabled,
    setAudioEnabled,
    voiceEnabled,
    setVoiceEnabled,
    recommendationData,
    activeRouteId,
    setActiveRouteId,
    formData
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
      {/* Radio Console Header */}
      <div className="panel-card" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F7FA 100%)',
        borderLeft: '6px solid var(--color-yellow)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            background: 'var(--color-yellow)',
            color: 'var(--color-dark)',
            padding: '0.6rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Radio size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-dark)' }}>
              CAD Tactical Radio & Two-Way Voice Intercom
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-dark-muted)' }}>
              Push-to-Talk (PTT), Hyderabad EMS Dispatch Band 154.280 MHz, Emergency Hospital Bridge
            </p>
          </div>
        </div>

        {/* Audio / Voice Quick Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="cad-well"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.8rem',
              border: audioEnabled ? '1.5px solid var(--color-red)' : '1.5px solid var(--border-subtle)',
              color: audioEnabled ? 'var(--color-red)' : 'var(--color-dark-muted)'
            }}
          >
            {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span>Siren Audio: {audioEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <button
            type="button"
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className="cad-well"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.8rem',
              border: voiceEnabled ? '1.5px solid var(--color-teal)' : '1.5px solid var(--border-subtle)',
              color: voiceEnabled ? 'var(--color-teal)' : 'var(--color-dark-muted)'
            }}
          >
            <RadioTower size={16} />
            <span>TTS Voice Synth: {voiceEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Main Radio Intercom Module */}
      <RadioIntercom
        onBroadcastLog={addLog}
        activeRouteName={activeCorridor?.name}
      />

      {/* Mission Recommendation Context */}
      <RecommendationDisplay
        recommendationData={recommendationData}
        selectedRouteId={activeRouteId}
        onSelectRoute={setActiveRouteId}
      />
    </div>
  );
}
