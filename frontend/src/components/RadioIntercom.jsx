import React, { useState } from 'react';
import { Radio, Send } from 'lucide-react';
import { speakDispatch } from '../utils/sirenAudio.js';

export default function RadioIntercom({ onBroadcastLog }) {
  const [activeChannel, setActiveChannel] = useState('CH 1');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [customMsg, setCustomMsg] = useState('');

  const channels = [
    { id: 'CH 1', name: 'EMS DISPATCH', freq: '155.340 MHz' },
    { id: 'CH 2', name: 'TRAFFIC COMMAND', freq: '460.125 MHz' },
    { id: 'CH 3', name: 'HOSPITAL DIRECT', freq: '154.280 MHz' }
  ];

  const presets = [
    { label: '🚨 Request Police Escort', text: 'Dispatch to Traffic Command: Request immediate traffic escort and intersection freeze on Van Ness.' },
    { label: '🏥 Hospital ETA Alert', text: 'Medic 41 to City General Trauma: ETA is under 4 minutes. Inbound with Code 3 patient, prep Trauma Bay 1.' },
    { label: '🏫 School Zone Advisory', text: 'Medic 41 to Dispatch: Entering Oakridge School Zone. Reducing velocity to 20 MPH, sirens modulated.' },
    { label: '🟢 All-Signals Clear', text: 'Command to Signal Operations: Preempt all remaining signals along corridor. Green wave confirmed.' }
  ];

  const transmitMessage = (text) => {
    setIsTransmitting(true);
    speakDispatch(text);
    if (onBroadcastLog) {
      onBroadcastLog(`[RADIO ${activeChannel}] ${text}`, 'alert');
    }
    setTimeout(() => {
      setIsTransmitting(false);
    }, 2800);
  };

  const handleCustomSend = (e) => {
    e.preventDefault();
    if (!customMsg.trim()) return;
    transmitMessage(`Dispatch to Unit: ${customMsg}`);
    setCustomMsg('');
  };

  return (
    <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Radio size={17} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            CAD TACTICAL RADIO & DISPATCH INTERCOM
          </h3>
        </div>

        {/* Audio Equalizer Bars when Transmitting */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {isTransmitting ? (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '20px' }}>
              <span className="wave-bar" />
              <span className="wave-bar" />
              <span className="wave-bar" />
              <span className="wave-bar" />
              <span className="wave-bar" />
            </div>
          ) : (
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>MONITORING</span>
          )}
          <span style={{
            background: isTransmitting ? 'var(--alert-red-soft)' : 'var(--signal-green-soft)',
            color: isTransmitting ? 'var(--alert-red)' : 'var(--signal-green)',
            border: `1px solid ${isTransmitting ? 'var(--alert-red)' : 'var(--signal-green)'}`,
            fontSize: '0.68rem',
            fontWeight: 800,
            padding: '0.15rem 0.45rem',
            borderRadius: '4px'
          }}>
            {isTransmitting ? 'TX ACTIVE' : 'RX STANDBY'}
          </span>
        </div>
      </div>

      {/* Channel Selector */}
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        {channels.map(ch => (
          <button
            key={ch.id}
            type="button"
            onClick={() => setActiveChannel(ch.id)}
            className="cad-well"
            style={{
              flex: 1,
              borderColor: activeChannel === ch.id ? 'var(--accent-cyan)' : 'var(--border-subtle)',
              background: activeChannel === ch.id ? 'var(--bg-well-active)' : 'var(--bg-well)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '0.45rem 0.5rem'
            }}
          >
            <span style={{ color: activeChannel === ch.id ? 'var(--accent-cyan)' : 'var(--text-primary)', fontWeight: 800, fontSize: '0.75rem' }}>
              {ch.id}: {ch.name}
            </span>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{ch.freq}</span>
          </button>
        ))}
      </div>

      {/* Preset Tactical Radio Transmissions */}
      <div>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.35rem', fontWeight: 700 }}>
          Direct Dispatch Tactical Broadcasts:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => transmitMessage(p.text)}
              disabled={isTransmitting}
              className="cad-well"
              style={{
                color: 'var(--text-primary)',
                fontSize: '0.75rem',
                fontWeight: 700,
                textAlign: 'left',
                cursor: 'pointer',
                padding: '0.5rem 0.7rem'
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Message Input */}
      <form onSubmit={handleCustomSend} style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Transmit custom CAD radio message..."
          value={customMsg}
          onChange={(e) => setCustomMsg(e.target.value)}
          style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}
        />
        <button
          type="submit"
          disabled={!customMsg.trim() || isTransmitting}
          style={{
            background: 'var(--accent-gradient)',
            border: 'none',
            color: '#04101e',
            borderRadius: '8px',
            padding: '0 1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.8rem',
            fontWeight: 800,
            boxShadow: '0 0 12px var(--accent-glow)'
          }}
        >
          <Send size={14} /> Transmit
        </button>
      </form>
    </div>
  );
}
