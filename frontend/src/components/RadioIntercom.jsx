import React, { useState } from 'react';
import { Mic, Radio, Volume2, Shield, PhoneCall, Send } from 'lucide-react';
import { speakDispatch } from '../utils/sirenAudio.js';

export default function RadioIntercom({ onBroadcastLog, activeRouteName = 'Active Route' }) {
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
      {/* Intercom Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1c273e', paddingBottom: '0.65rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Radio size={17} color="#06b6d4" />
          <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#f8fafc' }}>
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
            <span style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>IDLE / MONITORING</span>
          )}
          <span style={{
            background: isTransmitting ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
            color: isTransmitting ? '#f87171' : '#34d399',
            border: isTransmitting ? '1px solid #ef4444' : '1px solid #10b981',
            fontSize: '0.68rem',
            fontWeight: 700,
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
            style={{
              flex: 1,
              background: activeChannel === ch.id ? 'rgba(59, 130, 246, 0.25)' : '#090e1a',
              border: activeChannel === ch.id ? '1px solid #3b82f6' : '1px solid #1f2d48',
              color: activeChannel === ch.id ? '#93c5fd' : '#94a3b8',
              padding: '0.4rem 0.5rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <span>{ch.id}: {ch.name}</span>
            <span style={{ fontSize: '0.62rem', color: '#64748b' }}>{ch.freq}</span>
          </button>
        ))}
      </div>

      {/* Preset Tactical Radio Transmissions */}
      <div>
        <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.35rem', fontWeight: 600 }}>
          Direct Dispatch Tactical Broadcasts:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => transmitMessage(p.text)}
              disabled={isTransmitting}
              style={{
                background: '#0a101d',
                border: '1px solid #1c2b48',
                color: '#e2e8f0',
                padding: '0.45rem 0.65rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Push-to-Talk Message Input */}
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
            background: '#2563eb',
            border: 'none',
            color: '#ffffff',
            borderRadius: '8px',
            padding: '0 1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.8rem',
            fontWeight: 700
          }}
        >
          <Send size={14} /> Transmit
        </button>
      </form>
    </div>
  );
}
