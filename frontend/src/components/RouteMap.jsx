import React, { useState } from 'react';
import { MapPin, Navigation, School, ShieldAlert, Sparkles, Building2, AlertTriangle, CloudRain } from 'lucide-react';

export default function RouteMap({
  selectedRouteId,
  onSelectRoute,
  allRoutes = [],
  recommendedRoute,
  context = {}
}) {
  const [hoveredRoute, setHoveredRoute] = useState(null);

  // Active route ID (either user clicked or currently recommended)
  const activeId = selectedRouteId || recommendedRoute?.id || 'route-c-residential-shortcut';

  const isSchoolActive = context.isSchoolHours;

  // Path SVG coordinates (Start at 80, 240 -> Hospital at 520, 100)
  // Route A (Main St): Direct through center (80, 240) -> (250, 190) -> (380, 150) -> (520, 100)
  const pathA = "M 90 240 Q 220 220 300 180 T 510 110";
  // Route B (Highway): Big north curve (90, 240) -> (180, 60) -> (420, 50) -> (510, 110)
  const pathB = "M 90 240 C 140 70, 390 40, 510 110";
  // Route C (Residential): South curve (90, 240) -> (210, 330) -> (430, 260) -> (510, 110)
  const pathC = "M 90 240 C 190 350, 390 290, 510 110";

  const getRouteColor = (routeId) => {
    if (!recommendedRoute) return '#3b82f6';
    if (routeId === recommendedRoute.id) return '#10b981'; // Green for recommended
    if (routeId.includes('main') && isSchoolActive) return '#ef4444'; // Red for hazardous school zone
    if (routeId.includes('highway') && (context.traffic === 'heavy' || context.traffic === 'gridlock' || context.weather !== 'clear')) return '#f59e0b';
    return '#60a5fa';
  };

  const getRouteData = (keyword) => {
    return allRoutes.find(r => r.id.includes(keyword)) || {};
  };

  const routeAData = getRouteData('main');
  const routeBData = getRouteData('highway');
  const routeCData = getRouteData('residential');

  return (
    <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1f2d48', paddingBottom: '0.65rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Navigation size={18} color="#06b6d4" />
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9' }}>
            GIS TACTICAL ROUTE RADAR
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.7rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#10b981' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
            Recommended
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#f59e0b' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
            Alternative
          </span>
          {isSchoolActive && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#ef4444' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
              Active Hazard
            </span>
          )}
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '340px',
        background: 'radial-gradient(ellipse at center, #10192e 0%, #080d19 100%)',
        borderRadius: '8px',
        border: '1px solid #1c2b48',
        overflow: 'hidden'
      }}>
        {/* Radar grid backdrop */}
        <svg width="100%" height="100%" viewBox="0 0 600 360" style={{ position: 'absolute', top: 0, left: 0 }}>
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#18233c" strokeWidth="0.8" />
            </pattern>
            <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid background */}
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* School Zone Perimeter Boundary (Mid Corridor) */}
          <rect
            x="240"
            y="145"
            width="120"
            height="70"
            rx="8"
            fill={isSchoolActive ? "rgba(239, 68, 68, 0.12)" : "rgba(59, 130, 246, 0.05)"}
            stroke={isSchoolActive ? "#ef4444" : "#2e456e"}
            strokeDasharray={isSchoolActive ? "4 3" : "none"}
            strokeWidth="1.5"
          />
          <text x="300" y="162" textAnchor="middle" fill={isSchoolActive ? "#fca5a5" : "#64748b"} fontSize="9" fontWeight="700" fontFamily="sans-serif">
            {isSchoolActive ? "⚠️ ACTIVE SCHOOL ZONE (20 MPH)" : "OAKRIDGE SCHOOL DISTRICT"}
          </text>

          {/* Highway Perimeter Label */}
          <text x="320" y="32" textAnchor="middle" fill="#475569" fontSize="10" fontWeight="600" letterSpacing="1">
            INTERSTATE I-80 ARTERIAL BYPASS
          </text>

          {/* Residential Zone Label */}
          <text x="320" y="345" textAnchor="middle" fill="#475569" fontSize="10" fontWeight="600" letterSpacing="1">
            SOUTHERN RESIDENTIAL DISTRICT (SPEED TABLETS)
          </text>

          {/* Route B: Highway Bypass (North arc) */}
          <path
            d={pathB}
            fill="none"
            stroke={getRouteColor(routeBData.id || 'route-b')}
            strokeWidth={activeId === routeBData.id ? 5 : 2.5}
            strokeOpacity={activeId === routeBData.id ? 1 : 0.45}
            strokeDasharray={routeBData.id === recommendedRoute?.id ? "none" : "6 4"}
            filter={activeId === routeBData.id ? "url(#glow-green)" : undefined}
            style={{ cursor: 'pointer', transition: 'all 0.2s' }}
            onClick={() => onSelectRoute(routeBData.id)}
            onMouseEnter={() => setHoveredRoute(routeBData.id)}
            onMouseLeave={() => setHoveredRoute(null)}
          />

          {/* Route A: Main St (Center through school zone) */}
          <path
            d={pathA}
            fill="none"
            stroke={getRouteColor(routeAData.id || 'route-a')}
            strokeWidth={activeId === routeAData.id ? 5 : 2.5}
            strokeOpacity={activeId === routeAData.id ? 1 : 0.45}
            strokeDasharray={routeAData.id === recommendedRoute?.id ? "none" : "6 4"}
            filter={activeId === routeAData.id ? (isSchoolActive ? "url(#glow-red)" : "url(#glow-green)") : undefined}
            style={{ cursor: 'pointer', transition: 'all 0.2s' }}
            onClick={() => onSelectRoute(routeAData.id)}
            onMouseEnter={() => setHoveredRoute(routeAData.id)}
            onMouseLeave={() => setHoveredRoute(null)}
          />

          {/* Route C: Residential Shortcut (South arc) */}
          <path
            d={pathC}
            fill="none"
            stroke={getRouteColor(routeCData.id || 'route-c')}
            strokeWidth={activeId === routeCData.id ? 5 : 2.5}
            strokeOpacity={activeId === routeCData.id ? 1 : 0.45}
            strokeDasharray={routeCData.id === recommendedRoute?.id ? "none" : "6 4"}
            filter={activeId === routeCData.id ? "url(#glow-green)" : undefined}
            style={{ cursor: 'pointer', transition: 'all 0.2s' }}
            onClick={() => onSelectRoute(routeCData.id)}
            onMouseEnter={() => setHoveredRoute(routeCData.id)}
            onMouseLeave={() => setHoveredRoute(null)}
          />

          {/* Active Ambulance Marker Animation along the recommended route */}
          {recommendedRoute && (
            <circle r="7" fill="#ef4444" stroke="#ffffff" strokeWidth="2">
              <animateMotion
                path={recommendedRoute.id.includes('highway') ? pathB : recommendedRoute.id.includes('main') ? pathA : pathC}
                dur="4.5s"
                repeatCount="indefinite"
              />
            </circle>
          )}

          {/* ORIGIN STATION MARKER */}
          <g transform="translate(90, 240)">
            <circle r="18" fill="rgba(239, 68, 68, 0.2)" />
            <circle r="9" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
            <text x="0" y="24" textAnchor="middle" fill="#f87171" fontSize="11" fontWeight="700">
              {context.startLocation || "EMS Station"}
            </text>
          </g>

          {/* DESTINATION HOSPITAL MARKER */}
          <g transform="translate(510, 110)">
            <circle r="20" fill="rgba(59, 130, 246, 0.2)" />
            <circle r="11" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
            {/* Hospital Cross */}
            <rect x="-2" y="-6" width="4" height="12" fill="#ffffff" />
            <rect x="-6" y="-2" width="12" height="4" fill="#ffffff" />
            <text x="0" y="26" textAnchor="middle" fill="#60a5fa" fontSize="11" fontWeight="700">
              {context.hospital || "General Hospital"}
            </text>
          </g>

          {/* Route Clickable Chips on the Map */}
          <g transform="translate(240, 50)" style={{ cursor: 'pointer' }} onClick={() => onSelectRoute(routeBData.id)}>
            <rect width="130" height="24" rx="4" fill="#0c1527" stroke="#2563eb" strokeWidth="1" />
            <text x="65" y="16" textAnchor="middle" fill="#93c5fd" fontSize="10" fontWeight="600">
              Route B (Hwy): {routeBData.adjustedMinutes || 11}m
            </text>
          </g>

          <g transform="translate(240, 195)" style={{ cursor: 'pointer' }} onClick={() => onSelectRoute(routeAData.id)}>
            <rect width="130" height="24" rx="4" fill="#0c1527" stroke={isSchoolActive ? "#ef4444" : "#2563eb"} strokeWidth="1" />
            <text x="65" y="16" textAnchor="middle" fill={isSchoolActive ? "#fca5a5" : "#93c5fd"} fontSize="10" fontWeight="600">
              Route A (Main): {routeAData.adjustedMinutes || 8}m {isSchoolActive ? "⚠️" : ""}
            </text>
          </g>

          <g transform="translate(240, 305)" style={{ cursor: 'pointer' }} onClick={() => onSelectRoute(routeCData.id)}>
            <rect width="130" height="24" rx="4" fill="#0c1527" stroke="#2563eb" strokeWidth="1" />
            <text x="65" y="16" textAnchor="middle" fill="#93c5fd" fontSize="10" fontWeight="600">
              Route C (Res): {routeCData.adjustedMinutes || 13}m
            </text>
          </g>
        </svg>

        {/* Floating Route Indicator */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '12px',
          background: 'rgba(9, 14, 26, 0.88)',
          border: '1px solid #1e2c47',
          backdropFilter: 'blur(6px)',
          borderRadius: '6px',
          padding: '0.4rem 0.75rem',
          fontSize: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{ color: '#94a3b8' }}>Selected Route:</span>
          <span style={{ color: '#38bdf8', fontWeight: 700 }}>
            {allRoutes.find(r => r.id === activeId)?.name || "Recommended Route"}
          </span>
        </div>
      </div>
    </div>
  );
}
