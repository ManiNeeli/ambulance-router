import React from 'react';
import { ShieldCheck, Sparkles, Info, Radio, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function RecommendationDisplay({ recommendationData, selectedRouteId, onSelectRoute }) {
  if (!recommendationData) {
    return (
      <div className="panel-card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
        <Sparkles size={36} style={{ margin: '0 auto 1rem', opacity: 0.35, color: 'var(--accent-cyan)' }} />
        <h3 style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Awaiting Dispatch Evaluation</h3>
        <p style={{ fontSize: '0.85rem' }}>Configure call parameters on the left and click "Evaluate & Recommend Route" to compute AI safety tradeoffs.</p>
      </div>
    );
  }

  const { recommendedRoute, allRoutes = [], aiExplanation } = recommendationData;

  const getSafetyBadge = (score) => {
    if (score >= 85) return { color: 'var(--signal-green)', text: 'High Safety Margin' };
    if (score >= 65) return { color: 'var(--accent-cyan)', text: 'Moderate Risk' };
    if (score >= 45) return { color: 'var(--caution-amber)', text: 'Elevated Caution' };
    return { color: 'var(--alert-red)', text: 'Hazardous Corridor' };
  };

  const recSafety = getSafetyBadge(recommendedRoute.safetyScore);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* HERO RECOMMENDATION CARD */}
      <div
        className="panel-card"
        style={{
          border: '1.5px solid var(--signal-green)',
          background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(0, 230, 118, 0.08) 100%)',
          boxShadow: '0 0 26px var(--signal-green-glow)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{
                background: 'var(--signal-green)',
                color: '#062012',
                fontSize: '0.7rem',
                fontWeight: 900,
                padding: '0.2rem 0.6rem',
                borderRadius: '5px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                letterSpacing: '0.04em'
              }}>
                <Sparkles size={12} /> TOP AI RECOMMENDATION
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--signal-green)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                {aiExplanation?.priorityLevel}
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              {recommendedRoute.name}
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {/* ETA Counter */}
            <div className="cad-well" style={{ textAlign: 'center', minWidth: '105px' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Estimated ETA</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                {recommendedRoute.adjustedMinutes} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>min</span>
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                base: {recommendedRoute.baseMinutes}m
              </div>
            </div>

            {/* Safety Score Meter */}
            <div className="cad-well" style={{ textAlign: 'center', minWidth: '115px', border: `1px solid ${recSafety.color}` }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Safety Index</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: recSafety.color, fontFamily: 'var(--font-mono)' }}>
                {recommendedRoute.safetyScore}<span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/100</span>
              </div>
              <div style={{ fontSize: '0.65rem', color: recSafety.color, fontWeight: 700 }}>
                {recSafety.text}
              </div>
            </div>
          </div>
        </div>

        {/* AI Plain-Language Tradeoff Explanation */}
        <div className="cad-well" style={{ marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-cyan)', fontSize: '0.78rem', fontWeight: 800, marginBottom: '0.35rem' }}>
            <Info size={15} />
            DISPATCHER TRADEOFF ANALYSIS
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.55 }}>
            {aiExplanation?.primaryReason}
          </p>
        </div>

        {/* Tactical Paramedic Crew Advisory */}
        {aiExplanation?.crewAdvisory && (
          <div style={{
            background: 'var(--alert-red-soft)',
            borderLeft: '3px solid var(--alert-red)',
            padding: '0.65rem 0.9rem',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}>
            <Radio size={16} color="var(--alert-red)" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>
              <b style={{ color: 'var(--alert-red)' }}>Paramedic Unit Advisory: </b>
              {aiExplanation.crewAdvisory}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.65rem' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            Engine: {aiExplanation?.aiModel || 'CAD Decision Support v2.0'}
          </span>
        </div>
      </div>

      {/* CANDIDATE ROUTES COMPARISON MATRIX */}
      <div className="panel-card">
        <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <ShieldCheck size={16} color="var(--accent-cyan)" />
          ROUTE COMPARISON MATRIX
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {allRoutes.map(route => {
            const safety = getSafetyBadge(route.safetyScore);
            const isSelected = selectedRouteId ? selectedRouteId === route.id : route.isRecommended;

            return (
              <div
                key={route.id}
                onClick={() => onSelectRoute(route.id)}
                className="cad-well"
                style={{
                  cursor: 'pointer',
                  border: route.isRecommended
                    ? '1.5px solid var(--signal-green)'
                    : isSelected
                    ? '1.5px solid var(--accent-cyan)'
                    : '1px solid var(--border-subtle)',
                  background: isSelected ? 'var(--bg-well-active)' : 'var(--bg-well)',
                  padding: '0.85rem 1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {route.name}
                    </span>
                    {route.isRecommended && (
                      <span style={{
                        background: 'var(--signal-green-soft)',
                        color: 'var(--signal-green)',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        border: '1px solid var(--signal-green)'
                      }}>
                        RECOMMENDED
                      </span>
                    )}
                    {route.passesSchoolZone && (
                      <span style={{
                        background: 'var(--alert-red-soft)',
                        color: 'var(--alert-red)',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        border: '1px solid var(--alert-red)'
                      }}>
                        School Zone
                      </span>
                    )}
                    {route.passesHighway && (
                      <span style={{
                        background: 'rgba(0, 242, 254, 0.1)',
                        color: 'var(--accent-cyan)',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        border: '1px solid var(--accent-cyan)'
                      }}>
                        Highway Corridor
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontFamily: 'var(--font-mono)' }}>
                    <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 800 }}>
                      {route.adjustedMinutes} min
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      color: safety.color,
                      border: `1px solid ${safety.color}`,
                      padding: '0.18rem 0.5rem',
                      borderRadius: '5px',
                      fontWeight: 800
                    }}>
                      {route.safetyScore}/100
                    </span>
                  </div>
                </div>

                {/* Factors */}
                <div style={{ fontSize: '0.76rem', marginTop: '0.35rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {route.riskFactors?.map((risk, i) => (
                    <div key={i} style={{ color: 'var(--alert-red)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <AlertTriangle size={12} /> {risk}
                    </div>
                  ))}
                  {route.favorableFactors?.map((fav, i) => (
                    <div key={i} style={{ color: 'var(--signal-green)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
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
