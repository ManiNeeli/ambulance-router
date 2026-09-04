import React, { useState, useEffect } from 'react';
import { Siren, Activity, Radio, Clock, ShieldCheck } from 'lucide-react';

export default function Header({ apiOnline }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header style={{
      background: 'linear-gradient(180deg, #101728 0%, #0c1220 100%)',
      borderBottom: '1px solid #1e293b',
      padding: '0.9rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '1rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div style={{
          background: 'radial-gradient(circle, #ef4444 0%, #991b1b 100%)',
          padding: '0.55rem',
          borderRadius: '10px',
          boxShadow: '0 0 16px rgba(239, 68, 68, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Siren className="animate-siren" size={24} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#f8fafc' }}>
              AMBULANCE ROUTE NAVIGATOR
            </h1>
            <span style={{
              background: '#1e3a8a',
              color: '#93c5fd',
              fontSize: '0.65rem',
              fontWeight: 700,
              padding: '0.15rem 0.45rem',
              borderRadius: '4px',
              letterSpacing: '0.05em'
            }}>
              AI-ASSISTED CAD v1.0
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Dynamic safe-routing optimization for emergency dispatch & rapid patient transport
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* System telemetry indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.75rem',
          background: '#090e1a',
          padding: '0.4rem 0.75rem',
          borderRadius: '6px',
          border: '1px solid #1f2d48'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: apiOnline ? '#10b981' : '#ef4444',
            boxShadow: apiOnline ? '0 0 8px #10b981' : '0 0 8px #ef4444'
          }} />
          <span style={{ color: apiOnline ? '#6ee7b7' : '#fca5a5', fontWeight: 600 }}>
            {apiOnline ? 'ENGINE ONLINE (PORT 5000)' : 'ENGINE RECONNECTING'}
          </span>
        </div>

        {/* Live Clock */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.8rem',
          fontFamily: 'var(--font-mono)',
          color: '#e2e8f0',
          background: '#090e1a',
          padding: '0.4rem 0.75rem',
          borderRadius: '6px',
          border: '1px solid #1f2d48'
        }}>
          <Clock size={14} color="#38bdf8" />
          <span>{time.toLocaleTimeString()}</span>
        </div>
      </div>
    </header>
  );
}
