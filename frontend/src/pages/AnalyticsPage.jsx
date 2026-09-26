import React from 'react';
import { useDispatchContext } from '../context/DispatchContext.jsx';
import RecommendationDisplay from '../components/RecommendationDisplay.jsx';
import { BarChart3, TrendingUp, ShieldCheck, Clock, AlertTriangle, Zap } from 'lucide-react';

export default function AnalyticsPage() {
  const {
    recommendationData,
    activeRouteId,
    setActiveRouteId,
    corridorData,
    formData,
    telemetry
  } = useDispatchContext();

  const routes = recommendationData?.allRoutes || [];
  const topRoute = recommendationData?.recommendedRoute || null;

  return (
    <div style={{
      maxWidth: '1720px',
      margin: '0 auto',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem'
    }}>
      {/* Analytics Banner */}
      <div className="panel-card" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F0FDF4 100%)',
        borderLeft: '6px solid #16A34A'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            background: '#16A34A',
            color: '#FFFFFF',
            padding: '0.6rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <BarChart3 size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-dark)' }}>
              AI Route Analytics & Safety Tradeoff Matrix
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-dark-muted)' }}>
              Multi-Objective Optimization: Travel Time vs Preemption Reliability vs Incident Congestion
            </p>
          </div>
        </div>

        {/* Quick Summary Pill */}
        <div className="cad-well" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Zap size={16} color="var(--color-red)" />
          <span style={{ fontSize: '0.82rem', fontWeight: 800 }}>
            EVP Time Savings: ~4.5 mins vs standard traffic
          </span>
        </div>
      </div>

      {/* High-Level Comparison KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1rem'
      }}>
        <div className="panel-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Clock size={18} color="var(--color-teal)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Recommended ETA</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-dark)' }}>
            {topRoute?.adjustedMinutes || '8.2'} <span style={{ fontSize: '1rem', fontWeight: 600 }}>min</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-dark-muted)', marginTop: '0.25rem' }}>
            Corridor: {topRoute?.name || 'Primary Corridor'}
          </p>
        </div>

        <div className="panel-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <ShieldCheck size={18} color="#16A34A" />
            <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Safety Rating</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#16A34A' }}>
            {topRoute?.safetyScore ? `${Math.round(topRoute.safetyScore * 100)}%` : '96%'}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-dark-muted)', marginTop: '0.25rem' }}>
            Based on intersection crash risk & road topology
          </p>
        </div>

        <div className="panel-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Zap size={18} color="var(--color-yellow)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Preemptable Signals</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-dark)' }}>
            {topRoute?.signalCount || '5'} <span style={{ fontSize: '1rem', fontWeight: 600 }}>Junctions</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-dark-muted)', marginTop: '0.25rem' }}>
            Active NTCIP 1211 green wave controllers
          </p>
        </div>

        <div className="panel-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <TrendingUp size={18} color="var(--color-red)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Active Congestion</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-dark)', textTransform: 'capitalize' }}>
            {formData.traffic || 'Moderate'}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-dark-muted)', marginTop: '0.25rem' }}>
            Weather condition: {formData.weather}
          </p>
        </div>
      </div>

      {/* Detailed Recommendation & Tradeoff Cards */}
      <RecommendationDisplay
        recommendationData={recommendationData}
        selectedRouteId={activeRouteId}
        onSelectRoute={setActiveRouteId}
      />
    </div>
  );
}
