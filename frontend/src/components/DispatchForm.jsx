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

      {/* Emergency Responder Fleet Toggle */}
      <div>
        <label style={{ fontSize: '0.7rem', color: 'var(--color-dark-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, display: 'block', marginBottom: '0.45rem' }}>
          RESPONDING EMERGENCY FLEET:
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, vehicleType: 'ambulance' }))}
            style={{
              padding: '0.55rem 0.75rem',
              borderRadius: '8px',
              border: '2px solid var(--color-dark)',
              backgroundColor: (formData.vehicleType !== 'fire_truck') ? 'var(--color-yellow)' : 'var(--bg-well)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              boxShadow: (formData.vehicleType !== 'fire_truck') ? 'var(--shadow-solid-sm)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>🚑</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: 'var(--color-dark)' }}>
                108 ALS Ambulance
              </div>
              <div style={{ fontSize: '0.64rem', color: 'var(--color-dark-muted)' }}>
                Medical Trauma & Critical Care
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, vehicleType: 'fire_truck' }))}
            style={{
              padding: '0.55rem 0.75rem',
              borderRadius: '8px',
              border: '2px solid var(--color-dark)',
              backgroundColor: (formData.vehicleType === 'fire_truck') ? 'var(--color-red)' : 'var(--bg-well)',
              color: (formData.vehicleType === 'fire_truck') ? '#FFFFFF' : 'var(--color-dark)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              boxShadow: (formData.vehicleType === 'fire_truck') ? 'var(--shadow-solid-sm)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>🚒</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: (formData.vehicleType === 'fire_truck') ? '#FFFFFF' : 'var(--color-dark)' }}>
                Fire Station Tender
              </div>
              <div style={{ fontSize: '0.64rem', color: (formData.vehicleType === 'fire_truck') ? '#FFD4D7' : 'var(--color-dark-muted)' }}>
                Fire Command & Heavy Rescue
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Quick Test Presets (Hyderabad Context) */}
      <div>
        <label style={{ fontSize: '0.7rem', color: 'var(--color-dark-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, display: 'block', marginBottom: '0.45rem' }}>
          Hyderabad Incident Scenarios:
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.45rem' }}>
          <button
            type="button"
            onClick={() => applyPreset({
              startLocation: 'Punjagutta Fire Station',
              hospital: 'Osmania General Hospital',
              timeOfDay: '08:15',
              weather: 'clear',
              traffic: 'heavy',
              patientCondition: 'critical',
              vehicleType: 'ambulance'
            })}
            className="cad-well"
            style={{
              color: 'var(--text-primary)',
              cursor: 'pointer',
              textAlign: 'left',
              padding: '0.5rem 0.65rem'
            }}
          >
            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--color-dark)' }}>🏫 08:15 AM School Rush</div>
            <div style={{ fontSize: '0.66rem', color: 'var(--color-dark-muted)' }}>HPS Begumpet & Somajiguda</div>
          </button>
          <button
            type="button"
            onClick={() => applyPreset({
              startLocation: 'Madhapur Fire Station',
              hospital: 'Cyber Towers Incident Zone',
              timeOfDay: '17:30',
              weather: 'clear',
              traffic: 'heavy',
              patientCondition: 'critical',
              vehicleType: 'fire_truck'
            })}
            className="cad-well"
            style={{
              color: 'var(--text-primary)',
              cursor: 'pointer',
              textAlign: 'left',
              padding: '0.5rem 0.65rem'
            }}
          >
            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--color-red)' }}>🚒 IT Corridor Fire</div>
            <div style={{ fontSize: '0.66rem', color: 'var(--color-dark-muted)' }}>Madhapur / Cyber Towers</div>
          </button>
          <button
            type="button"
            onClick={() => applyPreset({
              startLocation: 'Punjagutta Fire Station',
              hospital: 'Osmania General Hospital',
              timeOfDay: '18:30',
              weather: 'rain',
              traffic: 'heavy',
              patientCondition: 'critical',
              vehicleType: 'ambulance'
            })}
            className="cad-well"
            style={{
              color: 'var(--text-primary)',
              cursor: 'pointer',
              textAlign: 'left',
              padding: '0.5rem 0.65rem'
            }}
          >
            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--color-teal)' }}>🌧️ Monsoon Waterlogging</div>
            <div style={{ fontSize: '0.66rem', color: 'var(--color-dark-muted)' }}>Masab Tank & Lakdikapul</div>
          </button>
          <button
            type="button"
            onClick={() => applyPreset({
              startLocation: 'Gowliguda Fire Station',
              hospital: 'Charminar Heritage Incident Zone',
              timeOfDay: '02:30',
              weather: 'clear',
              traffic: 'light',
              patientCondition: 'critical',
              vehicleType: 'fire_truck'
            })}
            className="cad-well"
            style={{
              color: 'var(--text-primary)',
              cursor: 'pointer',
              textAlign: 'left',
              padding: '0.5rem 0.65rem'
            }}
          >
            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--color-dark)' }}>🌙 02:30 AM Old City Run</div>
            <div style={{ fontSize: '0.66rem', color: 'var(--color-dark-muted)' }}>Charminar Emergency Zone</div>
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
