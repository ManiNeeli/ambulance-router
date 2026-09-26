import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Siren,
  Clock,
  Zap,
  Map,
  Navigation,
  Activity,
  Radio,
  BarChart3,
  Server,
  Sparkles
} from 'lucide-react';

export default function Header({ apiOnline }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { to: '/', label: 'Live Map', icon: <Map size={15} />, end: true },
    { to: '/routes', label: 'Turn-by-Turn', icon: <Navigation size={15} /> },
    { to: '/vitals', label: 'Patient Vitals', icon: <Activity size={15} /> },
    { to: '/radio', label: 'CAD Intercom', icon: <Radio size={15} /> },
    { to: '/analytics', label: 'Safety Matrix', icon: <BarChart3 size={15} /> },
    { to: '/enterprise', label: 'Enterprise CAD', icon: <Server size={15} /> },
    { to: '/overview', label: 'Overview', icon: <Sparkles size={15} /> }
  ];

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
              SwiftAid
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

      {/* Primary Page Navigation Bar */}
      <nav className="header-nav-bar" aria-label="Main Navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `nav-page-link ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Operational Stats & Engine Status */}
      <div className="header-status-controls">
        {/* Preemption Protocol Badge */}
        <div className="header-pill-info">
          <Zap size={14} color="#D71920" />
          <span>EVP: <strong>400m Active</strong></span>
        </div>

        {/* Live Traffic Badge */}
        <div className="header-pill-info" style={{ border: '1.5px solid rgba(0, 245, 160, 0.4)' }}>
          <span
            className="status-dot"
            style={{
              backgroundColor: '#00f5a0',
              boxShadow: '0 0 8px #00f5a0'
            }}
          />
          <span style={{ fontWeight: 800, color: '#00b875' }}>
            LIVE TRAFFIC
          </span>
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
            {apiOnline ? 'ONLINE' : 'OFFLINE'}
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
