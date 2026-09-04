import React, { useState, useEffect } from 'react';
import { Activity, Heart, Wind, Droplets, AlertCircle, User } from 'lucide-react';

export default function PatientVitalsMonitor({ patientCondition = 'critical' }) {
  const isCritical = patientCondition === 'critical';
  const isEmergent = patientCondition === 'emergent';

  const [bpm, setBpm] = useState(isCritical ? 116 : isEmergent ? 92 : 74);
  const [spo2, setSpo2] = useState(isCritical ? 93 : 98);
  const [pulseScale, setPulseScale] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseScale(1.25);
      setTimeout(() => setPulseScale(1), 220);

      const baseBpm = isCritical ? 114 : isEmergent ? 90 : 74;
      setBpm(baseBpm + Math.floor(Math.sin(Date.now() / 1500) * 4));
      setSpo2(isCritical ? (92 + Math.floor(Math.random() * 3)) : 98);
    }, isCritical ? 520 : 800);

    return () => clearInterval(interval);
  }, [isCritical, isEmergent]);

  return (
    <div className="panel-card" style={{
      border: isCritical ? '1.5px solid var(--alert-red)' : '1px solid var(--border-subtle)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem', marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={17} color={isCritical ? 'var(--alert-red)' : 'var(--accent-cyan)'} />
          <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            PATIENT BIOMETRIC TELEMETRY & ON-BOARD VITALS
          </h3>
        </div>
        <span style={{
          background: isCritical ? 'var(--alert-red-soft)' : 'var(--signal-green-soft)',
          color: isCritical ? 'var(--alert-red)' : 'var(--signal-green)',
          border: `1px solid ${isCritical ? 'var(--alert-red)' : 'var(--signal-green)'}`,
          fontSize: '0.7rem',
          fontWeight: 800,
          padding: '0.15rem 0.5rem',
          borderRadius: '4px'
        }}>
          {isCritical ? 'CODE 3: CRITICAL' : isEmergent ? 'CODE 2: URGENT' : 'CODE 1: STABLE'}
        </span>
      </div>

      {/* Main Vitals Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '0.85rem' }}>
        {/* Heart Rate */}
        <div className="cad-well" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', textTransform: 'uppercase', fontWeight: 700 }}>
            <Heart size={13} color="var(--alert-red)" style={{ transform: `scale(${pulseScale})`, transition: 'transform 0.15s ease' }} />
            HEART RATE
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: isCritical ? 'var(--alert-red)' : 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {bpm} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>BPM</span>
          </div>
          <div style={{ fontSize: '0.65rem', color: isCritical ? 'var(--alert-red)' : 'var(--signal-green)', fontWeight: 600 }}>
            {isCritical ? 'Sinus Tachycardia' : 'Normal Sinus Rhythm'}
          </div>
        </div>

        {/* Blood Pressure */}
        <div className="cad-well" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', textTransform: 'uppercase', fontWeight: 700 }}>
            <Droplets size={13} color="var(--accent-cyan)" />
            NIBP
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
            {isCritical ? '142/92' : '120/80'}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
            mmHg (Mean: 108)
          </div>
        </div>

        {/* SpO2 */}
        <div className="cad-well" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', textTransform: 'uppercase', fontWeight: 700 }}>
            <Wind size={13} color="var(--signal-green)" />
            O2 SAT (SpO2)
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: spo2 < 95 ? 'var(--caution-amber)' : 'var(--signal-green)', fontFamily: 'var(--font-mono)' }}>
            {spo2}%
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
            15L Non-Rebreather
          </div>
        </div>

        {/* Glasgow Coma Scale */}
        <div className="cad-well" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', textTransform: 'uppercase', fontWeight: 700 }}>
            <AlertCircle size={13} color="var(--accent-cyan)" />
            GCS SCORE
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
            {isCritical ? '13/15' : '15/15'}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
            Eye: 4 • Verbal: 4 • Motor: 5
          </div>
        </div>
      </div>

      {/* Electrocardiogram (ECG) Animated Tracing */}
      <div className="cad-well" style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '0.5rem 0.75rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.2rem', fontFamily: 'var(--font-mono)' }}>
          <span>LEAD II • 25mm/s • 10mm/mV • FILTER: DIAGNOSTIC</span>
          <span style={{ color: 'var(--signal-green)', fontWeight: 700 }}>● LIVE SYNCHRONOUS TRACE</span>
        </div>

        <svg width="100%" height="52" viewBox="0 0 600 52" style={{ display: 'block' }}>
          <defs>
            <linearGradient id="ecgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--signal-green)" stopOpacity="0.3" />
              <stop offset="85%" stopColor="var(--signal-green)" stopOpacity="1" />
              <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity="1" />
            </linearGradient>
            <filter id="ecgGlow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <line x1="0" y1="26" x2="600" y2="26" stroke="var(--border-subtle)" strokeWidth="1" strokeDasharray="3 3" />

          <path
            d="
              M 0 26 L 30 26 L 35 24 L 40 26 L 45 26 L 50 10 L 55 46 L 60 22 L 65 26 L 80 26 L 88 19 L 98 26 L 120 26
              L 150 26 L 155 24 L 160 26 L 165 26 L 170 10 L 175 46 L 180 22 L 185 26 L 200 26 L 208 19 L 218 26 L 240 26
              L 270 26 L 275 24 L 280 26 L 285 26 L 290 10 L 295 46 L 300 22 L 305 26 L 320 26 L 328 19 L 338 26 L 360 26
              L 390 26 L 395 24 L 400 26 L 405 26 L 410 10 L 415 46 L 420 22 L 425 26 L 440 26 L 448 19 L 458 26 L 480 26
              L 510 26 L 515 24 L 520 26 L 525 26 L 530 10 L 535 46 L 540 22 L 545 26 L 560 26 L 568 19 L 578 26 L 600 26
            "
            fill="none"
            stroke="url(#ecgGrad)"
            strokeWidth="2.2"
            filter="url(#ecgGlow)"
            className="ecg-path"
          />
        </svg>
      </div>

      {/* Crew Info Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.65rem', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <User size={13} color="var(--accent-cyan)" />
          <span><b>PARAMEDIC IN CHARGE:</b> Officer J. Morales (EMS #4810)</span>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>UNIT: </span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>MEDIC-41 (TYPE-I ALS AMBULANCE)</span>
        </div>
      </div>
    </div>
  );
}
