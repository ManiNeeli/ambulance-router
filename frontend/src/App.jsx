import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import DispatchForm from './components/DispatchForm.jsx';
import RouteMap from './components/RouteMap.jsx';
import RecommendationDisplay from './components/RecommendationDisplay.jsx';

export default function App() {
  const [startLocations, setStartLocations] = useState([
    "Fire Station 3", "Fire Station 7", "Downtown EMS Base"
  ]);
  const [hospitals, setHospitals] = useState([
    "City General", "St. Mary's Medical Center", "Riverside Hospital"
  ]);
  const [formData, setFormData] = useState({
    startLocation: "Fire Station 3",
    hospital: "City General",
    patientCondition: "critical",
    timeOfDay: "08:15",
    weather: "clear",
    traffic: "moderate"
  });
  const [recommendationData, setRecommendationData] = useState(null);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiOnline, setApiOnline] = useState(false);

  // Fetch initial config & trigger first recommendation
  useEffect(() => {
    async function init() {
      try {
        const res = await fetch('/api/routes-data');
        if (res.ok) {
          const data = await res.json();
          if (data.startLocations) setStartLocations(data.startLocations);
          if (data.hospitals) setHospitals(data.hospitals);
          setApiOnline(true);
        }
      } catch (err) {
        console.warn("Could not connect to backend /api/routes-data:", err);
      }
      handleEvaluate();
    }
    init();
  }, []);

  const handleEvaluate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/recommend-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const data = await res.json();
        setRecommendationData(data);
        setSelectedRouteId(data.recommendedRoute?.id);
        setApiOnline(true);
      } else {
        console.error("Backend returned error status:", res.status);
      }
    } catch (err) {
      console.error("Failed to fetch recommendation:", err);
      setApiOnline(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0b0f19' }}>
      <Header apiOnline={apiOnline} />

      <main style={{
        flex: 1,
        maxWidth: '1500px',
        width: '100%',
        margin: '0 auto',
        padding: '1.25rem',
        display: 'grid',
        gridTemplateColumns: 'minmax(340px, 420px) 1fr',
        gap: '1.25rem',
        alignItems: 'start'
      }}>
        {/* Left: Dispatch Parameters */}
        <section>
          <DispatchForm
            formData={formData}
            setFormData={setFormData}
            startLocations={startLocations}
            hospitals={hospitals}
            onSubmit={handleEvaluate}
            loading={loading}
          />
        </section>

        {/* Right: Map & Recommendation Display */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <RouteMap
            selectedRouteId={selectedRouteId}
            onSelectRoute={(id) => setSelectedRouteId(id)}
            allRoutes={recommendationData?.allRoutes || []}
            recommendedRoute={recommendationData?.recommendedRoute}
            context={recommendationData?.context || formData}
          />

          <RecommendationDisplay
            recommendationData={recommendationData}
            selectedRouteId={selectedRouteId}
            onSelectRoute={(id) => setSelectedRouteId(id)}
          />
        </section>
      </main>

      <footer style={{
        textAlign: 'center',
        padding: '1rem',
        fontSize: '0.75rem',
        color: '#64748b',
        borderTop: '1px solid #1e293b',
        background: '#090e1a'
      }}>
        Ambulance Router Dispatch Intelligence System • Built for Hackathon Prototype • Powered by AI Safety Tradeoff Engine
      </footer>
    </div>
  );
}
