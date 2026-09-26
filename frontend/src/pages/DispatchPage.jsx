import React from 'react';
import { useDispatchContext } from '../context/DispatchContext.jsx';
import DispatchForm from '../components/DispatchForm.jsx';
import TransitController from '../components/TransitController.jsx';
import InteractiveLeafletMap from '../components/InteractiveLeafletMap.jsx';
import LiveTelemetryBar from '../components/LiveTelemetryBar.jsx';
import RecommendationDisplay from '../components/RecommendationDisplay.jsx';

export default function DispatchPage() {
  const {
    startLocations,
    hospitals,
    formData,
    setFormData,
    corridorData,
    activeRouteId,
    setActiveRouteId,
    ambulancePos,
    signalStates,
    isSimulating,
    simSpeed,
    setSimSpeed,
    autoPreempt,
    setAutoPreempt,
    audioEnabled,
    setAudioEnabled,
    voiceEnabled,
    setVoiceEnabled,
    simProgress,
    loading,
    recommendationData,
    telemetry,
    currentManeuver,
    eventLogs,
    handleEvaluate,
    handlePreemptSignal,
    handleForceClearAll,
    handleStart,
    handlePause,
    handleReset,
    handleManualProgressChange
  } = useDispatchContext();

  return (
    <div style={{
      maxWidth: '1720px',
      margin: '0 auto',
      padding: '1.25rem',
      display: 'grid',
      gridTemplateColumns: 'minmax(340px, 420px) 1fr',
      gap: '1.25rem',
      alignItems: 'start'
    }}>
      {/* Left Column: Mission Dispatch Controls */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <DispatchForm
          formData={formData}
          setFormData={setFormData}
          startLocations={startLocations}
          hospitals={hospitals}
          onSubmit={handleEvaluate}
          loading={loading}
        />

        <TransitController
          isSimulating={isSimulating}
          onStart={handleStart}
          onPause={handlePause}
          onReset={handleReset}
          simSpeed={simSpeed}
          onChangeSpeed={setSimSpeed}
          autoPreempt={autoPreempt}
          onToggleAutoPreempt={() => setAutoPreempt(!autoPreempt)}
          audioEnabled={audioEnabled}
          onToggleAudio={() => setAudioEnabled(!audioEnabled)}
          voiceEnabled={voiceEnabled}
          onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
          onForceClearAll={handleForceClearAll}
          simProgress={simProgress}
          onManualProgressChange={handleManualProgressChange}
        />
      </section>

      {/* Right Column: Tactical Live Map, Telemetry & Recommendations */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Real-time Telemetry Dashboard */}
        <LiveTelemetryBar
          telemetry={telemetry}
          currentManeuver={currentManeuver}
          eventLogs={eventLogs}
        />

        {/* Mapbox Live Traffic & EVP Map */}
        <InteractiveLeafletMap
          corridorData={corridorData}
          activeRouteId={activeRouteId}
          ambulancePosition={ambulancePos}
          signalStates={signalStates}
          onSignalClick={handlePreemptSignal}
          onSelectRoute={setActiveRouteId}
          isSimulating={isSimulating}
          weather={formData.weather}
          onManualProgressChange={handleManualProgressChange}
          vehicleType={formData.vehicleType || 'ambulance'}
          onSelectStation={(stn) => setFormData(prev => ({ ...prev, startLocation: stn }))}
          onSelectHospital={(hosp) => setFormData(prev => ({ ...prev, hospital: hosp }))}
        />

        {/* AI Route Recommendation Cards */}
        <RecommendationDisplay
          recommendationData={recommendationData}
          selectedRouteId={activeRouteId}
          onSelectRoute={setActiveRouteId}
        />
      </section>
    </div>
  );
}
