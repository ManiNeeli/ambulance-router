import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatchContext } from '../context/DispatchContext.jsx';
import HeroLanding from '../components/HeroLanding.jsx';
import { Siren, Shield, Zap, Activity, Navigation, Radio, Server } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { handleStart, isSimulating } = useDispatchContext();

  const handleLaunch = () => {
    navigate('/');
    if (!isSimulating) {
      handleStart();
    }
  };

  const handleExplore = () => {
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
      {/* Hero Banner Component */}
      <HeroLanding
        onLaunchDemo={handleLaunch}
        onExploreMap={handleExplore}
      />

      {/* Feature Showcase Grid */}
      <div style={{
        maxWidth: '1540px',
        margin: '0 auto',
        padding: '0 1.5rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.25rem',
        width: '100%'
      }}>
        <div className="panel-card" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ background: 'var(--color-red)', color: '#FFFFFF', padding: '0.5rem', borderRadius: '10px' }}>
              <Siren size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900 }}>Live Tactical GIS Dispatch</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-dark-muted)', lineHeight: 1.6 }}>
            Mapbox live traffic integration with dynamic congestion color coding, automated 400m emergency signal preemption, and real-time corridor navigation.
          </p>
        </div>

        <div className="panel-card" onClick={() => navigate('/routes')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ background: 'var(--color-teal)', color: '#FFFFFF', padding: '0.5rem', borderRadius: '10px' }}>
              <Navigation size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900 }}>Turn-by-Turn Road Network</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-dark-muted)', lineHeight: 1.6 }}>
            Dijkstra shortest path algorithm across Hyderabad arterial corridors, with step-by-step turn maneuvers and interactive road progression.
          </p>
        </div>

        <div className="panel-card" onClick={() => navigate('/vitals')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ background: 'var(--color-yellow)', color: 'var(--color-dark)', padding: '0.5rem', borderRadius: '10px' }}>
              <Activity size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900 }}>In-Transit Paramedic Telemetry</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-dark-muted)', lineHeight: 1.6 }}>
            Live animated ECG Lead II waveform, hemodynamics tracking, and transit shock mitigation algorithms safeguarding patient stability.
          </p>
        </div>

        <div className="panel-card" onClick={() => navigate('/radio')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ background: 'var(--color-dark)', color: '#FFFFFF', padding: '0.5rem', borderRadius: '10px' }}>
              <Radio size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900 }}>CAD Tactical Intercom</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-dark-muted)', lineHeight: 1.6 }}>
            Two-way Push-to-Talk (PTT) radio console, multi-agency frequency channels, and automated emergency audio dispatch synthesis.
          </p>
        </div>

        <div className="panel-card" onClick={() => navigate('/analytics')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ background: '#16A34A', color: '#FFFFFF', padding: '0.5rem', borderRadius: '10px' }}>
              <Zap size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900 }}>AI Route Tradeoff Matrix</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-dark-muted)', lineHeight: 1.6 }}>
            Multi-objective route scoring factoring in traffic delay, weather surface hazards, green wave availability, and pedestrian safety zones.
          </p>
        </div>

        <div className="panel-card" onClick={() => navigate('/enterprise')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ background: '#2563EB', color: '#FFFFFF', padding: '0.5rem', borderRadius: '10px' }}>
              <Server size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900 }}>Enterprise CAD & Telematics</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-dark-muted)', lineHeight: 1.6 }}>
            7 Pillars of Enterprise CAD architecture, NTCIP 1211 traffic gateway, live device GPS stream, and forensic CJIS event audit trail.
          </p>
        </div>
      </div>
    </div>
  );
}
