import React from 'react';
import { Navigation, AlertTriangle, CloudRain, Car, Clock, Zap, MapPin, Building2 } from 'lucide-react';

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
    { value: 'critical', label: 'Code 3: Critical Priority', desc: 'Lights & Sirens (Immediate life-threat)', color: 'var(--alert-red)' },
    { value: 'emergent', label: 'Code 2: Emergent Urgent', desc: 'Urgent transit, no sirens required', color: 'var(--caution-amber)' },
    { value: 'routine', label: 'Code 1: Routine Transfer', desc: 'Stable patient transport / non-acute', color: 'var(--signal-green)' }
  ];

  return (
    <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
        <h2 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Navigation size={17} color="var(--accent-cyan)" />
          DISPATCH INCIDENT PARAMETERS
        </h2>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>CAD #941</span>
      </div>

      {/* Quick Test Presets */}
      <div>
        <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, display: 'block', marginBottom: '0.45rem' }}>
          Simulated Emergency Scenarios:
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.45rem' }}>
          <button
            type="button"
            onClick={() => applyPreset({ timeOfDay: '08:15', weather: 'clear', traffic: 'moderate', patientCondition: 'critical' })}
            className="cad-well"
            style={{
              color: 'var(--text-primary)',
              cursor: 'pointer',
              textAlign: 'left',
              padding: '0.5rem 0.65rem'
            }}
          >
            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>🏫 08:15 AM School Rush</div>
            <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>Active 20 MPH geofence</div>
          </button>
          <button
            type="button"
            onClick={() => applyPreset({ timeOfDay: '17:30', weather: 'rain', traffic: 'heavy', patientCondition: 'critical' })}
            className="cad-well"
            style={{
              color: 'var(--text-primary)',
              cursor: 'pointer',
              textAlign: 'left',
              padding: '0.5rem 0.65rem'
            }}
          >
            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>🌧️ Rain & Highway Jam</div>
            <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>Hydroplaning & gridlock</div>
          </button>
          <button
            type="button"
            onClick={() => applyPreset({ timeOfDay: '15:00', weather: 'snow', traffic: 'moderate', patientCondition: 'emergent' })}
            className="cad-well"
            style={{
              color: 'var(--text-primary)',
              cursor: 'pointer',
              textAlign: 'left',
              padding: '0.5rem 0.65rem'
            }}
          >
            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>❄️ Winter Slush Run</div>
            <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>Black ice hazards</div>
          </button>
          <button
            type="button"
            onClick={() => applyPreset({ timeOfDay: '02:30', weather: 'clear', traffic: 'light', patientCondition: 'critical' })}
            className="cad-well"
            style={{
              color: 'var(--text-primary)',
              cursor: 'pointer',
              textAlign: 'left',
              padding: '0.5rem 0.65rem'
            }}
          >
            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>🌙 02:30 AM Night Run</div>
            <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>Rapid open corridors</div>
          </button>
        </div>
      </div>

      {/* Origin & Destination */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
        <div>
          <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}>
            <MapPin size={14} color="var(--alert-red)" /> ORIGIN STATION
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
          <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}>
            <Building2 size={14} color="var(--accent-cyan)" /> DESTINATION
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

      {/* Patient Urgency Radio Buttons */}
      <div>
        <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'block', marginBottom: '0.45rem' }}>
          PATIENT ACUITY / DISPATCH CODE
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {urgencyOptions.map(opt => {
            const isSelected = formData.patientCondition === opt.value;
            return (
              <div
                key={opt.value}
                onClick={() => setFormData({ ...formData, patientCondition: opt.value })}
                className="cad-well"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  border: isSelected ? `1.5px solid ${opt.color}` : '1px solid var(--border-subtle)',
                  background: isSelected ? 'var(--bg-well-active)' : 'var(--bg-well)'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {opt.label}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{opt.desc}</div>
                </div>
                <input
                  type="radio"
                  name="patientCondition"
                  checked={isSelected}
                  onChange={() => {}}
                  style={{ accentColor: opt.color, width: '16px', height: '16px', cursor: 'pointer' }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Environmental & Temporal Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
        <div>
          <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.3rem' }}>
            <Clock size={13} color="var(--accent-cyan)" /> TIME
          </label>
          <input
            type="time"
            className="form-input"
            value={formData.timeOfDay}
            onChange={(e) => setFormData({ ...formData, timeOfDay: e.target.value })}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.3rem' }}>
            <CloudRain size={13} color="var(--accent-cyan)" /> WEATHER
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
          <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.3rem' }}>
            <Car size={13} color="var(--caution-amber)" /> TRAFFIC
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

      {/* Submit Action */}
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
