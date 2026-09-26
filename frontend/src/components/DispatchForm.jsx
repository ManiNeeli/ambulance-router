import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navigation, AlertTriangle, CloudRain, Car, Clock, Zap, MapPin, Building2, LocateFixed, Search, X, Loader2 } from 'lucide-react';

export default function DispatchForm({
  formData,
  setFormData,
  startLocations,
  hospitals,
  onSubmit,
  loading
}) {
  // ─── Origin geocode autocomplete state ───
  const [originQuery, setOriginQuery] = useState(formData.startLocation || '');
  const [originResults, setOriginResults] = useState([]);
  const [originSearching, setOriginSearching] = useState(false);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const originTimerRef = useRef(null);
  const originDropdownRef = useRef(null);

  // ─── Destination nearby places state ───
  const [destQuery, setDestQuery] = useState(formData.hospital || '');
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [destSearchResults, setDestSearchResults] = useState([]);
  const [destSearching, setDestSearching] = useState(false);
  const destTimerRef = useRef(null);
  const destDropdownRef = useRef(null);

  // Sync external formData changes
  useEffect(() => {
    if (formData.startLocation && formData.startLocation !== originQuery) {
      setOriginQuery(formData.startLocation);
    }
  }, [formData.startLocation]);

  useEffect(() => {
    if (formData.hospital && formData.hospital !== destQuery) {
      setDestQuery(formData.hospital);
    }
  }, [formData.hospital]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (originDropdownRef.current && !originDropdownRef.current.contains(e.target)) {
        setShowOriginDropdown(false);
      }
      if (destDropdownRef.current && !destDropdownRef.current.contains(e.target)) {
        setShowDestDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ─── Origin: Geocode search with debounce ───
  const searchOrigin = useCallback((query) => {
    if (!query || query.length < 3) {
      setOriginResults([]);
      return;
    }
    setOriginSearching(true);
    fetch(`/api/geocode?q=${encodeURIComponent(query)}`)
      .then(r => r.json())
      .then(data => {
        setOriginResults(data.results || []);
        setShowOriginDropdown(true);
      })
      .catch(() => setOriginResults([]))
      .finally(() => setOriginSearching(false));
  }, []);

  const handleOriginInput = (e) => {
    const val = e.target.value;
    setOriginQuery(val);
    if (originTimerRef.current) clearTimeout(originTimerRef.current);
    originTimerRef.current = setTimeout(() => searchOrigin(val), 350);
  };

  const selectOriginResult = (result) => {
    setOriginQuery(result.name);
    setShowOriginDropdown(false);
    setFormData(prev => ({
      ...prev,
      startLocation: result.name,
      startCoords: result.coords
    }));
    // Auto-fetch nearby destinations for this origin
    fetchNearbyPlaces(result.coords[0], result.coords[1]);
  };

  // ─── "Use My Location" GPS ───
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const label = `📍 My Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
        setOriginQuery(label);
        setFormData(prev => ({
          ...prev,
          startLocation: label,
          startCoords: [latitude, longitude]
        }));
        setGpsLoading(false);
        // Auto-fetch nearby destinations
        fetchNearbyPlaces(latitude, longitude);
      },
      (err) => {
        alert(`Location error: ${err.message}`);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  };

  // ─── Destination: Fetch nearby emergency places ───
  const fetchNearbyPlaces = (lat, lng) => {
    setNearbyLoading(true);
    fetch(`/api/nearby-places?lat=${lat}&lng=${lng}&radius=8000`)
      .then(r => r.json())
      .then(data => {
        setNearbyPlaces(data.places || []);
      })
      .catch(() => setNearbyPlaces([]))
      .finally(() => setNearbyLoading(false));
  };

  // ─── Destination: Geocode search with debounce ───
  const searchDest = useCallback((query) => {
    if (!query || query.length < 3) {
      setDestSearchResults([]);
      return;
    }
    setDestSearching(true);
    fetch(`/api/geocode?q=${encodeURIComponent(query)}`)
      .then(r => r.json())
      .then(data => {
        setDestSearchResults(data.results || []);
        setShowDestDropdown(true);
      })
      .catch(() => setDestSearchResults([]))
      .finally(() => setDestSearching(false));
  }, []);

  const handleDestInput = (e) => {
    const val = e.target.value;
    setDestQuery(val);
    if (destTimerRef.current) clearTimeout(destTimerRef.current);
    destTimerRef.current = setTimeout(() => searchDest(val), 350);
  };

  const selectDestResult = (result) => {
    setDestQuery(result.name);
    setShowDestDropdown(false);
    setFormData(prev => ({
      ...prev,
      hospital: result.name,
      endCoords: result.coords
    }));
  };

  const selectNearbyPlace = (place) => {
    setDestQuery(place.name);
    setShowDestDropdown(false);
    setFormData(prev => ({
      ...prev,
      hospital: place.name,
      endCoords: place.coords
    }));
  };

  const applyPreset = (preset) => {
    setFormData(prev => ({ ...prev, ...preset }));
    if (preset.startLocation) setOriginQuery(preset.startLocation);
    if (preset.hospital) setDestQuery(preset.hospital);
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
          Quick Dispatch Scenarios:
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.45rem' }}>
          <button
            type="button"
            onClick={() => applyPreset({
              startLocation: 'Punjagutta Fire Station',
              hospital: 'Osmania General Hospital',
              timeOfDay: '08:15', weather: 'clear', traffic: 'heavy',
              patientCondition: 'critical', vehicleType: 'ambulance',
              startCoords: [17.4278, 78.4503], endCoords: [17.3785, 78.4735]
            })}
            className="cad-well"
            style={{ color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left', padding: '0.5rem 0.65rem' }}
          >
            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--color-dark)' }}>🏫 08:15 AM School Rush</div>
            <div style={{ fontSize: '0.66rem', color: 'var(--color-dark-muted)' }}>Punjagutta → Osmania</div>
          </button>
          <button
            type="button"
            onClick={() => applyPreset({
              startLocation: 'Madhapur Fire Station',
              hospital: 'Cyber Towers Incident Zone',
              timeOfDay: '17:30', weather: 'clear', traffic: 'heavy',
              patientCondition: 'critical', vehicleType: 'fire_truck',
              startCoords: [17.4485, 78.3812], endCoords: [17.4435, 78.3773]
            })}
            className="cad-well"
            style={{ color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left', padding: '0.5rem 0.65rem' }}
          >
            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--color-red)' }}>🚒 IT Corridor Fire</div>
            <div style={{ fontSize: '0.66rem', color: 'var(--color-dark-muted)' }}>Madhapur → Cyber Towers</div>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
         ORIGIN - Manual Text Input with Geocode + GPS "Use My Location"
         ═══════════════════════════════════════════════════════════════════ */}
      <div ref={originDropdownRef} style={{ position: 'relative' }}>
        <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}>
          <MapPin size={14} color="var(--alert-red)" /> ORIGIN (Type address or use GPS)
        </label>
        <div style={{ display: 'flex', gap: '0.45rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Type any address, place, or area..."
              value={originQuery}
              onChange={handleOriginInput}
              onFocus={() => { if (originResults.length > 0) setShowOriginDropdown(true); }}
              style={{ paddingRight: '2.5rem' }}
            />
            {originSearching && (
              <div style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)' }}>
                <Loader2 size={16} color="var(--color-teal)" className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} />
              </div>
            )}
            {originQuery && !originSearching && (
              <button
                type="button"
                onClick={() => { setOriginQuery(''); setOriginResults([]); setFormData(prev => ({ ...prev, startLocation: '', startCoords: null })); }}
                style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <X size={15} color="var(--color-dark-muted)" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={gpsLoading}
            title="Use my current device GPS location"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.55rem 0.75rem',
              borderRadius: '8px',
              border: '2px solid var(--color-dark)',
              background: formData.startCoords && originQuery.includes('My Location') ? 'var(--color-teal)' : 'var(--bg-well)',
              color: formData.startCoords && originQuery.includes('My Location') ? '#FFFFFF' : 'var(--color-dark)',
              fontWeight: 800,
              fontSize: '0.78rem',
              cursor: gpsLoading ? 'wait' : 'pointer',
              boxShadow: 'var(--shadow-solid-sm)',
              whiteSpace: 'nowrap'
            }}
          >
            <LocateFixed size={16} />
            {gpsLoading ? '...' : 'GPS'}
          </button>
        </div>

        {/* Geocode Results Dropdown */}
        {showOriginDropdown && originResults.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 100,
            background: 'var(--color-white)',
            border: '2px solid var(--color-dark)',
            borderRadius: '10px',
            boxShadow: 'var(--shadow-md)',
            maxHeight: '240px',
            overflowY: 'auto',
            marginTop: '0.25rem'
          }}>
            {originResults.map((r, i) => (
              <button
                key={i}
                type="button"
                onClick={() => selectOriginResult(r)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.6rem',
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  border: 'none',
                  borderBottom: i < originResults.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.1s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-well)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <MapPin size={15} color="var(--color-red)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-dark)' }}>{r.name}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--color-dark-muted)' }}>{r.type}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
         DESTINATION - Nearby Hospitals/Fire Stations + Search
         ═══════════════════════════════════════════════════════════════════ */}
      <div ref={destDropdownRef} style={{ position: 'relative' }}>
        <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}>
          <Building2 size={14} color="var(--accent-cyan)" /> DESTINATION (Nearby facilities or search)
        </label>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search hospital, fire station, or any place..."
            value={destQuery}
            onChange={handleDestInput}
            onFocus={() => {
              if (destSearchResults.length > 0) setShowDestDropdown(true);
              else if (nearbyPlaces.length > 0) setShowDestDropdown(true);
            }}
            style={{ paddingRight: '2.5rem' }}
          />
          {destQuery && (
            <button
              type="button"
              onClick={() => { setDestQuery(''); setDestSearchResults([]); setFormData(prev => ({ ...prev, hospital: '', endCoords: null })); }}
              style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <X size={15} color="var(--color-dark-muted)" />
            </button>
          )}
        </div>

        {/* Dest Search Results / Nearby Places Dropdown */}
        {showDestDropdown && (destSearchResults.length > 0 || nearbyPlaces.length > 0) && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 100,
            background: 'var(--color-white)',
            border: '2px solid var(--color-dark)',
            borderRadius: '10px',
            boxShadow: 'var(--shadow-md)',
            maxHeight: '320px',
            overflowY: 'auto',
            marginTop: '0.25rem'
          }}>
            {/* Search results (if user typed something) */}
            {destSearchResults.length > 0 && (
              <>
                <div style={{ padding: '0.4rem 0.85rem', fontSize: '0.68rem', fontWeight: 800, color: 'var(--color-dark-muted)', textTransform: 'uppercase', background: 'var(--bg-well)' }}>
                  Search Results
                </div>
                {destSearchResults.map((r, i) => (
                  <button
                    key={`s-${i}`}
                    type="button"
                    onClick={() => selectDestResult(r)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: '0.6rem', width: '100%',
                      padding: '0.55rem 0.85rem', border: 'none', borderBottom: '1px solid var(--border-subtle)',
                      background: 'transparent', cursor: 'pointer', textAlign: 'left'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-well)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Search size={14} color="var(--color-teal)" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{r.name}</div>
                      <div style={{ fontSize: '0.66rem', color: 'var(--color-dark-muted)' }}>{r.type}</div>
                    </div>
                  </button>
                ))}
              </>
            )}

            {/* Nearby emergency facilities (auto-discovered) */}
            {nearbyPlaces.length > 0 && (
              <>
                <div style={{ padding: '0.4rem 0.85rem', fontSize: '0.68rem', fontWeight: 800, color: 'var(--color-dark-muted)', textTransform: 'uppercase', background: 'var(--bg-well)', borderTop: destSearchResults.length > 0 ? '2px solid var(--border-subtle)' : 'none' }}>
                  📍 Nearby Emergency Facilities
                </div>
                {nearbyPlaces.map((p, i) => (
                  <button
                    key={`n-${i}`}
                    type="button"
                    onClick={() => selectNearbyPlace(p)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.6rem', width: '100%',
                      padding: '0.5rem 0.85rem', border: 'none', borderBottom: i < nearbyPlaces.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                      background: 'transparent', cursor: 'pointer', textAlign: 'left'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-well)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                      <span style={{ fontSize: '1.1rem' }}>{p.icon}</span>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-dark)' }}>{p.name}</div>
                        <div style={{ fontSize: '0.66rem', color: 'var(--color-dark-muted)' }}>{p.typeLabel}{p.address ? ` • ${p.address}` : ''}</div>
                      </div>
                    </div>
                    {p.distanceKm > 0 && (
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-teal)', whiteSpace: 'nowrap' }}>
                        {p.distanceKm} km
                      </span>
                    )}
                  </button>
                ))}
              </>
            )}
          </div>
        )}

        {/* Auto-fetch nearby button */}
        {formData.startCoords && nearbyPlaces.length === 0 && !nearbyLoading && (
          <button
            type="button"
            onClick={() => fetchNearbyPlaces(formData.startCoords[0], formData.startCoords[1])}
            style={{
              marginTop: '0.35rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-teal)',
              background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline'
            }}
          >
            🔍 Find nearby hospitals, fire stations & police
          </button>
        )}
        {nearbyLoading && (
          <div style={{ marginTop: '0.35rem', fontSize: '0.72rem', color: 'var(--color-dark-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Discovering nearby emergency facilities...
          </div>
        )}
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
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
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
                <input type="radio" name="patientCondition" checked={isSelected} onChange={() => {}} style={{ accentColor: opt.color, width: '16px', height: '16px', cursor: 'pointer' }} />
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
          <input type="time" className="form-input" value={formData.timeOfDay} onChange={(e) => setFormData({ ...formData, timeOfDay: e.target.value })} />
        </div>

        <div>
          <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.3rem' }}>
            <CloudRain size={13} color="var(--accent-cyan)" /> WEATHER
          </label>
          <select className="form-select" value={formData.weather} onChange={(e) => setFormData({ ...formData, weather: e.target.value })}>
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
          <select className="form-select" value={formData.traffic} onChange={(e) => setFormData({ ...formData, traffic: e.target.value })}>
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
