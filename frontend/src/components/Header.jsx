import React, { useState, useEffect } from 'react';
import { Siren, Clock, Palette, Check } from 'lucide-react';

export default function Header({ apiOnline, currentTheme = 'cobalt', onThemeChange }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const themes = [
    { id: 'cobalt', label: 'Cobalt', color: '#06b6d4', icon: '🌌' },
    { id: 'emerald', label: 'Emerald', color: '#10b981', icon: '🌲' },
    { id: 'crimson', label: 'Crimson', color: '#ef4444', icon: '🚨' },
    { id: 'light', label: 'Light', color: '#2563eb', icon: '☀️' }
  ];

  return (
    <header style={{
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '0.85rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '1rem',
      transition: 'all 0.3s ease'
    }}>
      {/* Brand & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--alert-red) 0%, #991b1b 100%)',
          padding: '0.55rem',
          borderRadius: '10px',
          boxShadow: '0 0 16px var(--alert-red-glow, rgba(239, 68, 68, 0.4))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Siren className="strobe-red" size={24} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              AMBULANCE ROUTE NAVIGATOR
            </h1>
            <span style={{
              background: 'var(--accent-glow, rgba(59, 130, 246, 0.2))',
              color: 'var(--accent-highlight, #93c5fd)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.65rem',
              fontWeight: 800,
              padding: '0.15rem 0.5rem',
              borderRadius: '4px',
              letterSpacing: '0.05em'
            }}>
              CAD-ITS v2.0
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Dynamic safe-routing optimization for emergency dispatch & rapid green-wave transit
          </p>
        </div>
      </div>

      {/* Right Controls: Theme Switcher, Engine Status, Clock */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        {/* Color Palette Switcher */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          background: 'var(--bg-deep)',
          padding: '0.3rem 0.5rem',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)'
        }}>
          <Palette size={14} color="var(--accent-primary)" style={{ marginRight: '0.2rem' }} />
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700, marginRight: '0.3rem' }}>
            THEME:
          </span>
          {themes.map(t => {
            const isActive = currentTheme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onThemeChange(t.id)}
                title={`Switch to ${t.label} Theme`}
                style={{
                  background: isActive ? 'var(--border-subtle)' : 'transparent',
                  border: isActive ? `1.5px solid ${t.color}` : '1px solid transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  borderRadius: '6px',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.72rem',
                  fontWeight: isActive ? 800 : 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Engine status indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.75rem',
          background: 'var(--bg-deep)',
          padding: '0.4rem 0.75rem',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: apiOnline ? 'var(--signal-green)' : 'var(--alert-red)',
            boxShadow: `0 0 8px ${apiOnline ? 'var(--signal-green)' : 'var(--alert-red)'}`
          }} />
          <span style={{ color: apiOnline ? 'var(--signal-green)' : 'var(--alert-red)', fontWeight: 700 }}>
            {apiOnline ? 'ONLINE' : 'CONNECTING'}
          </span>
        </div>

        {/* Live Clock */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.8rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-primary)',
          background: 'var(--bg-deep)',
          padding: '0.4rem 0.75rem',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)'
        }}>
          <Clock size={14} color="var(--accent-highlight)" />
          <span>{time.toLocaleTimeString()}</span>
        </div>
      </div>
    </header>
  );
}
