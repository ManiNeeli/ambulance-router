import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, Clock, Zap, Info, Radio, Sparkles, AlertOctagon } from 'lucide-react';

export default function RecommendationDisplay({ recommendationData, selectedRouteId, onSelectRoute }) {
  if (!recommendationData) {
    return (
      <div className="panel-card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: '#64748b' }}>
        <Zap size={36} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
        <h3 style={{ fontSize: '1.05rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Awaiting Dispatch Evaluation</h3>
        <p style={{ fontSize: '0.85rem' }}>Select call parameters on the left and click "Evaluate & Recommend Route" to compute AI safety tradeoffs.</p>
      </div>
    );
  }

  const { recommendedRoute, allRoutes, aiExplanation, context } = recommendationData;

  const getSafetyBadge = (score, level) => {
    if (score >= 85) return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', text: level || 'High Safety' };
    if (score >= 65) return { color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', text: level || 'Moderate' };
    if (score >= 45) return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', text: level || 'Caution' };
    return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', text: level || 'Hazardous' };
  };

  const recSafety = getSafetyBadge(recommendedRoute.safetyScore, recommendedRoute.safetyLevel);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* HERO RECOMMENDATION CARD */}
      <div
        className="panel-card glow-box-emerald"
        style={{
          border: '2px solid #10b981',
          background: 'linear-gradient(135deg, #0d1a29 0%, #0d2320 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{
                background: '#10b981',
                color: '#06281e',
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '0.2rem 0.6rem',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}>
                <Sparkles size={12} /> RECOMMENDED OPTION
              </span>
              <span style={{ fontSize: '0.75rem', color: '#6ee7b7', fontFamily: 'var(--font-mono)' }}>
                {aiExplanation?.priorityLevel}
              </span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
              {recommendedRoute.name}
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            {/* ETA Counter */}
            <div style={{
              background: '#09131f',
              border: '1px solid #1b304c',
              padding: '0.5rem 0.85rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>Estimated ETA</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                {recommendedRoute.adjustedMinutes} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>min</span>
              </div>
              <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                base: {recommendedRoute.baseMinutes}m
              </div>
            </div>

            {/* Safety Score Meter */}
            <div style={{
              background: '#09131f',
              border: `1px solid ${recSafety.color}40`,
              padding: '0.5rem 0.85rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>Safety Index</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: recSafety.color, fontFamily: 'var(--font-mono)' }}>
                {recommendedRoute.safetyScore}<span style={{ fontSize: '0.8rem', color: '#64748b' }}>/100</span>
              </div>
              <div style={{ fontSize: '0.65rem', color: recSafety.color, fontWeight: 700 }}>
                {recSafety.text}
              </div>
            </div>
          </div>
        </div>

        {/* AI Plain-Language Tradeoff Explanation */}
        <div style={{
          background: 'rgba(9, 14, 26, 0.75)',
          borderRadius: '8px',
          padding: '0.9rem 1.1rem',
          border: '1px solid #1c2b46',
          marginBottom: '0.85rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#38bdf8', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem' }}>
            <Info size={15} />
            DISPATCHER TRADEOFF ANALYSIS
          </div>
          <p style={{ fontSize: '0.875rem', color: '#e2e8f0', lineHeight: 1.55 }}>
            {aiExplanation?.primaryReason}
          </p>
        </div>

        {/* Tactical Paramedic Crew Advisory */}
        {aiExplanation?.crewAdvisory && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            borderLeft: '3px solid #ef4444',
            padding: '0.65rem 0.9rem',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}>
            <Radio size={16} color="#f87171" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.8rem', color: '#fca5a5' }}>
              <b style={{ color: '#ffffff' }}>Paramedic Unit Advisory: </b>
              {aiExplanation.crewAdvisory}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.65rem' }}>
          <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
            Powered by {aiExplanation?.aiModel || 'CAD Route Engine'}
          </span>
        </div>
      </div>

      {/* SIDE-BY-SIDE ALL CANDIDATE ROUTES COMPARISON */}
      <div className="panel-card">
        <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <ShieldCheck size={16} color="#3b82f6" />
          ROUTE COMPARISON MATRIX
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {allRoutes.map(route => {
            const safety = getSafetyBadge(route.safetyScore, route.safetyLevel);
            const isSelected = selectedRouteId ? selectedRouteId === route.id : route.isRecommended;

            return (
              <div
                key={route.id}
                onClick={() => onSelectRoute(route.id)}
                style={{
                  background: isSelected ? '#152033' : '#0a101d',
                  border: route.isRecommended
                    ? '1.5px solid #10b981'
                    : isSelected
                    ? '1.5px solid #3b82f6'
                    : '1px solid #1b2842',
                  borderRadius: '8px',
                  padding: '0.85rem 1rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc' }}>
                      {route.name}
                    </span>
                    {route.isRecommended && (
                      <span style={{
                        background: '#10b98120',
                        color: '#34d399',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        border: '1px solid #10b98140'
                      }}>
                        TOP PICK
                      </span>
                    )}
                    {route.passesSchoolZone && (
                      <span style={{
                        background: '#ef444420',
                        color: '#f87171',
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px'
                      }}>
                        School Zone
                      </span>
                    )}
                    {route.passesHighway && (
                      <span style={{
                        background: '#3b82f620',
                        color: '#60a5fa',
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px'
                      }}>
                        Highway
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontFamily: 'var(--font-mono)' }}>
                    <span style={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 700 }}>
                      {route.adjustedMinutes} min
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      color: safety.color,
                      background: safety.bg,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontWeight: 700
                    }}>
                      {route.safetyScore}/100
                    </span>
                  </div>
                </div>

                {/* Risk or Favorable Factors */}
                <div style={{ fontSize: '0.76rem', marginTop: '0.35rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {route.riskFactors && route.riskFactors.map((risk, i) => (
                    <div key={i} style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <AlertTriangle size={12} /> {risk}
                    </div>
                  ))}
                  {route.favorableFactors && route.favorableFactors.map((fav, i) => (
                    <div key={i} style={{ color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <CheckCircle2 size={12} /> {fav}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
