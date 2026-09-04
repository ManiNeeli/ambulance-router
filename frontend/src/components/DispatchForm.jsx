import React from 'react';
import { Navigation, AlertTriangle, CloudRain, Car, Clock, Zap, MapPin, Building2, Flame } from 'lucide-react';

export default function DispatchForm({
  formData,
  setFormData,
  startLocations,
  hospitals,
  onSubmit,
  loading
}) {
  const applyPreset = (preset) => {
    setFormData(prev => ({
      ...prev,
      ...preset
    }));
  };

  const urgencyOptions = [
    { value: 'critical', label: 'Code 3: Critical', desc: 'Lights & Siren (Life-threatening)', color: '#ef4444' },
    { value: 'emergent', label: 'Code 2: Emergent', desc: 'Urgent transit, no sirens', color: '#f59e0b' },
    { value: 'routine', label: 'Code 1: Routine', desc: 'Stable patient transfer', color: '#10b981' }
  ];

  return (
    <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1f2d48', paddingBottom: '0.75rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Navigation size={18} color="#3b82f6" />
          DISPATCH CALL PARAMETERS
        </h2>
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>CAD INCIDENT #941</span>
      </div>

      {/* Quick Test Presets */}
      <div>
        <label style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
          Simulated Emergency Scenarios:
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
          <button
            type="button"
            onClick={() => applyPreset({ timeOfDay: '08:15', weather: 'clear', traffic: 'moderate', patientCondition: 'critical' })}
            style={{
              background: '#151f33',
              border: '1px solid #263859',
              color: '#93c5fd',
              padding: '0.45rem 0.5rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            🏫 <b>08:15 AM School Rush</b>
          </button>
          <button
            type="button"
            onClick={() => applyPreset({ timeOfDay: '17:30', weather: 'rain', traffic: 'heavy', patientCondition: 'critical' })}
            style={{
              background: '#151f33',
              border: '1px solid #263859',
              color: '#93c5fd',
              padding: '0.45rem 0.5rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            🌧️ <b>Rain & Highway Jam</b>
          </button>
          <button
            type="button"
            onClick={() => applyPreset({ timeOfDay: '15:00', weather: 'snow', traffic: 'moderate', patientCondition: 'emergent' })}
            style={{
              background: '#151f33',
              border: '1px solid #263859',
              color: '#93c5fd',
              padding: '0.45rem 0.5rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            ❄️ <b>Winter Slush Pickup</b>
          </button>
          <button
            type="button"
            onClick={() => applyPreset({ timeOfDay: '02:30', weather: 'clear', traffic: 'light', patientCondition: 'critical' })}
            style={{
              background: '#151f33',
              border: '1px solid #263859',
              color: '#93c5fd',
              padding: '0.45rem 0.5rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            🌙 <b>02:30 AM Night Express</b>
          </button>
        </div>
      </div>

      {/* Origin & Destination */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
        <div>
          <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}>
            <MapPin size={14} color="#ef4444" /> ORIGIN
          </label>
          <select
            className="form-select"
            value={formData.startLocation}
            onChange={(e) => setFormData({ ...formData, startLocation: e.target.value })}
          >
            {startLocations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}>
            <Building2 size={14} color="#3b82f6" /> DESTINATION
          </label>
          <select
            className="form-select"
            value={formData.hospital}
            onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
          >
            {hospitals.map(hosp => (
              <option key={hosp} value={hosp}>{hosp}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Patient Urgency */}
      <div>
        <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.45rem' }}>
          PATIENT ACUITY / DISPATCH CODE
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {urgencyOptions.map(opt => {
            const isSelected = formData.patientCondition === opt.value;
            return (
              <div
                key={opt.value}
                onClick={() => setFormData({ ...formData, patientCondition: opt.value })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.55rem 0.85rem',
                  borderRadius: '8px',
                  border: isSelected ? `2px solid ${opt.color}` : '1px solid #1f2d48',
                  background: isSelected ? `${opt.color}15` : '#0a0f1d',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isSelected ? '#ffffff' : '#cbd5e1' }}>
                    {opt.label}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{opt.desc}</div>
                </div>
                <input
                  type="radio"
                  name="patientCondition"
                  checked={isSelected}
                  onChange={() => {}}
                  style={{ accentColor: opt.color, width: '16px', height: '16px' }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Environmental & Temporal Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
        <div>
          <label style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.3rem' }}>
            <Clock size={13} color="#38bdf8" /> TIME
          </label>
          <input
            type="time"
            className="form-input"
            value={formData.timeOfDay}
            onChange={(e) => setFormData({ ...formData, timeOfDay: e.target.value })}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.3rem' }}>
            <CloudRain size={13} color="#60a5fa" /> WEATHER
          </label>
          <select
            className="form-select"
            value={formData.weather}
            onChange={(e) => setFormData({ ...formData, weather: e.target.value })}
          >
            <option value="clear">☀️ Clear</option>
            <option value="rain">🌧️ Rain</option>
            <option value="snow">❄️ Snow</option>
            <option value="fog">🌫️ Fog</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.3rem' }}>
            <Car size={13} color="#fbbf24" /> TRAFFIC
          </label>
          <select
            className="form-select"
            value={formData.traffic}
            onChange={(e) => setFormData({ ...formData, traffic: e.target.value })}
          >
            <option value="light">🟢 Light</option>
            <option value="moderate">🟡 Moderate</option>
            <option value="heavy">🟠 Heavy</option>
            <option value="gridlock">🔴 Gridlock</option>
          </select>
        </div>
      </div>

      {/* Dispatch Action */}
      <button
        type="button"
        className="btn-dispatch"
        onClick={onSubmit}
        disabled={loading}
      >
        {loading ? (
          <>ANALYZING ROUTE SAFETY...</>
        ) : (
          <>
            <Zap size={18} />
            EVALUATE & RECOMMEND ROUTE
          </>
        )}
      </button>
    </div>
  );
}
