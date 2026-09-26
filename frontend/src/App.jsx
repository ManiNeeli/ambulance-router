import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DispatchProvider, useDispatchContext } from './context/DispatchContext.jsx';
import Header from './components/Header.jsx';
import GlobalMissionHUD from './components/GlobalMissionHUD.jsx';
import DispatchPage from './pages/DispatchPage.jsx';
import RoutesPage from './pages/RoutesPage.jsx';
import VitalsPage from './pages/VitalsPage.jsx';
import RadioPage from './pages/RadioPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import EnterprisePage from './pages/EnterprisePage.jsx';
import LandingPage from './pages/LandingPage.jsx';

function AppLayout() {
  const { apiOnline } = useDispatchContext();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-page)' }}>
      {/* Persistent Navigation Header */}
      <Header apiOnline={apiOnline} />

      {/* Persistent Global Mission Status Bar across pages */}
      <GlobalMissionHUD />

      {/* Page Content Routed View */}
      <main style={{ flex: 1, width: '100%' }}>
        <Routes>
          <Route path="/" element={<DispatchPage />} />
          <Route path="/dispatch" element={<DispatchPage />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/vitals" element={<VitalsPage />} />
          <Route path="/radio" element={<RadioPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/enterprise" element={<EnterprisePage />} />
          <Route path="/overview" element={<LandingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Persistent Tactical Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '1.25rem 1rem',
        fontSize: '0.8rem',
        fontWeight: 600,
        color: 'var(--color-dark)',
        borderTop: '2px solid var(--color-dark)',
        background: 'var(--color-white)',
        marginTop: 'auto'
      }}>
        SwiftAid Dispatch Intelligence • Dynamic Green Wave Preemption (EVP) • High-Visibility Flat Avionics
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <DispatchProvider>
        <AppLayout />
      </DispatchProvider>
    </BrowserRouter>
  );
}
