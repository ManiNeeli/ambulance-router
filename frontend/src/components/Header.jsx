import React, { useState, useEffect } from 'react';
import { Siren, Clock, ShieldCheck, Zap } from 'lucide-react';

export default function Header({ apiOnline }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="main-app-header">
      {/* Brand & CAD Title */}
      <div className="header-brand-block">
        <div className="header-icon-box">
          <Siren size={22} color="#FFFFFF" />
        </div>
        <div>
          <div className="header-title-row">
            <h1 className="header-main-title">
              PULSE-WAVE CAD
            </h1>
            <span className="header-badge-tag">
              EVP v2.5
            </span>
          </div>
          <p className="header-subtitle">
            Autonomous Safe-Corridor & Green-Wave Traffic Preemption System
          </p>
        </div>
      </div>

      {/* Operational Stats & Engine Status */}
      <div className="header-status-controls">
        {/* Preemption Protocol Badge */}
        <div className="header-pill-info">
          <Zap size={14} color="#D71920" />
          <span>EVP Geofence: <strong>400m Active</strong></span>
        </div>

        {/* Engine status indicator */}
        <div className="header-pill-info">
          <span
            className="status-dot"
            style={{
              backgroundColor: apiOnline ? '#08B7BA' : '#D71920',
            }}
          />
          <span style={{ fontWeight: 800, color: apiOnline ? '#08B7BA' : '#D71920' }}>
            {apiOnline ? 'ROUTER ONLINE' : 'ENGINE OFFLINE'}
          </span>
        </div>

        {/* Live CAD Clock */}
        <div className="header-pill-info header-clock">
          <Clock size={14} color="#222222" />
          <span>{time.toLocaleTimeString()}</span>
        </div>
      </div>
    </header>
  );
}
