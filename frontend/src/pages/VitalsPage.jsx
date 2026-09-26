import React from 'react';
import { useDispatchContext } from '../context/DispatchContext.jsx';
import PatientVitalsMonitor from '../components/PatientVitalsMonitor.jsx';
import RecommendationDisplay from '../components/RecommendationDisplay.jsx';
import { Activity, Heart, ShieldAlert, Thermometer, UserCheck } from 'lucide-react';

export default function VitalsPage() {
  const {
    formData,
    setFormData,
    telemetry,
    recommendationData,
    activeRouteId,
    setActiveRouteId,
    activeCorridor
  } = useDispatchContext();

  const handleConditionChange = (cond) => {
    setFormData(prev => ({ ...prev, patientCondition: cond }));
  };

  return (
    <div style={{
      maxWidth: '1720px',
      margin: '0 auto',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem'
    }}>
      {/* Vitals Command Header */}
      <div className="panel-card" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F5 100%)',
        borderLeft: '6px solid var(--color-red)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            background: 'var(--color-red)',
            color: '#FFFFFF',
            padding: '0.6rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(215, 25, 32, 0.4)'
          }}>
            <Activity size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-dark)' }}>
              In-Transit Paramedic Telemetry & ICU Monitoring
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-dark-muted)' }}>
              Live ECG Lead II Waveform, Hemodynamics, and Green Wave Transit Smoothness Feedback
            </p>
          </div>
        </div>

        {/* Rapid Patient Triage Quick-Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-dark-muted)' }}>
            Patient Triage:
          </span>
          {[
            { id: 'critical', label: 'Critical / Red', color: 'var(--color-red)' },
            { id: 'urgent', label: 'Urgent / Amber', color: 'var(--color-yellow)' },
            { id: 'stable', label: 'Stable / Green', color: 'var(--color-teal)' }
          ].map(lvl => (
            <button
              key={lvl.id}
              type="button"
              onClick={() => handleConditionChange(lvl.id)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                border: formData.patientCondition === lvl.id ? '2px solid var(--color-dark)' : '1px solid var(--border-subtle)',
                background: formData.patientCondition === lvl.id ? lvl.color : '#FFFFFF',
                color: formData.patientCondition === lvl.id && lvl.id === 'critical' ? '#FFFFFF' : 'var(--color-dark)',
                fontWeight: 800,
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {lvl.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Patient Vitals Monitor */}
      <PatientVitalsMonitor
        patientCondition={formData.patientCondition}
        inSchoolZone={telemetry.inSchoolZone}
      />

      {/* Transit Shock Mitigation Metrics */}
      <div className="panel-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        <div className="cad-well">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Heart size={16} color="var(--color-red)" />
            <span style={{ fontSize: '0.82rem', fontWeight: 800 }}>EVP Green Wave Shock Reduction</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-dark-muted)' }}>
            Signals preempted: <strong>{telemetry.preemptedCount} of {telemetry.totalSignals}</strong>.
            Zero stop-and-go jerks detected, preserving hemodynamic clot stability.
          </p>
        </div>

        <div className="cad-well">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <ShieldAlert size={16} color="var(--color-yellow)" />
            <span style={{ fontSize: '0.82rem', fontWeight: 800 }}>School Zone Speed Governor</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-dark-muted)' }}>
            Status: <strong>{telemetry.inSchoolZone ? 'ACTIVE (20 MPH CAP)' : 'Inactive (Normal Speed)'}</strong>.
            Prevents sudden accelerations near pediatric zones.
          </p>
        </div>

        <div className="cad-well">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <UserCheck size={16} color="var(--color-teal)" />
            <span style={{ fontSize: '0.82rem', fontWeight: 800 }}>Destination Hospital Alert</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-dark-muted)' }}>
            Target: <strong>{formData.hospital}</strong> Emergency Trauma Bay notified via CAD HL7 bridge.
          </p>
        </div>
      </div>

      {/* Route & ETA Context */}
      <RecommendationDisplay
        recommendationData={recommendationData}
        selectedRouteId={activeRouteId}
        onSelectRoute={setActiveRouteId}
      />
    </div>
  );
}
