import React, { useState, useEffect, useRef, useMemo } from 'react';
import Navbar from './components/Navbar';
import VideoCanvasFeed from './components/VideoCanvasFeed';
import RealtimeEARPlot from './components/RealtimeEARPlot';
import LandingPage from './components/LandingPage';
import UsernameModal from './components/UsernameModal';
import WelcomeOpening from './components/WelcomeOpening';
import MobileBottomNav from './components/MobileBottomNav';
import { BlinkTracker } from './lib/earMath';
import { audioFeedback } from './lib/audioFeedback';
import { ArrowLeft, ChevronRight, User } from 'lucide-react';

export default function App() {
  // Detector & Tracker States
  const [faceMeshInstance, setFaceMeshInstance] = useState(null);
  const [isReady, setIsReady] = useState(false);

  // Default threshold: 0.220 (Optimal for glasses & Asian eye anatomy)
  const [threshold, setThreshold] = useState(0.220);
  const consecFrames = 2;

  // Calibration State
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrateCountdown, setCalibrateCountdown] = useState(3);
  const [calibrationToast, setCalibrationToast] = useState(null);

  // Username & Local Storage Management
  const [username, setUsername] = useState(() => {
    try {
      return localStorage.getItem('ocular_username') || '';
    } catch {
      return '';
    }
  });
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isWelcomeOpeningOpen, setIsWelcomeOpeningOpen] = useState(false);

  // Real-time Telemetry
  const [fps, setFps] = useState(0);
  const [currentEar, setCurrentEar] = useState(0.280);
  const [leftEar, setLeftEar] = useState(0.280);
  const [rightEar, setRightEar] = useState(0.280);
  const [isBlinking, setIsBlinking] = useState(false);
  const [earHistory, setEarHistory] = useState([]);
  const [stats, setStats] = useState({
    totalBlinks: 0,
    bpm: 0,
    elapsedSeconds: 0,
    avgEar: 0.28,
  });

  // Navigation View State ('landing' | 'studio' | 'simple')
  const [currentView, setCurrentView] = useState('landing');
  const [selectedVideo, setSelectedVideo] = useState('/videos/blinking_1.mp4');
  const [initialMode, setInitialMode] = useState('sample');

  // Coordinated Mobile & Studio Controls
  const [inputMode, setInputMode] = useState('webcam');
  const [mirrorCamera, setMirrorCamera] = useState(true);
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [showHaarRoi, setShowHaarRoi] = useState(false);
  const [isPipActive, setIsPipActive] = useState(false);
  const togglePipRef = useRef(null);
  const fileUploadRef = useRef(null);

  const handleLaunchStudio = (videoPath, mode = 'sample') => {
    if (videoPath) setSelectedVideo(videoPath);
    if (mode) {
      setInitialMode(mode);
      setInputMode(mode);
    }
    setCurrentView('studio');
  };

  const handleSelectSampleVideo = (videoPath) => {
    tracker.reset();
    setEarHistory([]);
    if (videoPath) setSelectedVideo(videoPath);
    setInitialMode('sample');
    setCurrentView('simple');
  };

  // Launch Live Camera Test: prompt for username first
  const handleStartLiveCamera = () => {
    setIsEditingUsername(false);
    setIsUsernameModalOpen(true);
  };

  // Handle Username Submission
  const handleUsernameSubmit = (newUsername) => {
    setUsername(newUsername);
    setIsUsernameModalOpen(false);

    if (isEditingUsername) {
      setCalibrationToast(`Operator profile updated to: ${newUsername}`);
      setTimeout(() => setCalibrationToast(null), 3000);
      return;
    }

    // Trigger welcome opening screen
    setIsWelcomeOpeningOpen(true);
  };

  // Handle Welcome Opening Completion
  const handleWelcomeFinish = () => {
    setIsWelcomeOpeningOpen(false);
    handleLaunchStudio('/videos/blinking_1.mp4', 'webcam');
  };

  // Edit Username from Navbar
  const handleOpenEditUsername = () => {
    setIsEditingUsername(true);
    setIsUsernameModalOpen(true);
  };

  // FPS calculation refs
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  // Instantiate Tracker
  const tracker = useMemo(() => new BlinkTracker({
    earThreshold: threshold,
    consecFrames: consecFrames,
  }), []);

  // Sync threshold with tracker
  useEffect(() => {
    tracker.setThreshold(threshold);
  }, [threshold, tracker]);

  // Calibration Procedure (3-Second Sampling)
  const startCalibration = () => {
    if (isCalibrating) return;
    setIsCalibrating(true);
    setCalibrateCountdown(3);
    tracker.startCalibration();

    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      setCalibrateCountdown(count);
      if (count <= 0) {
        clearInterval(interval);
        const res = tracker.finishCalibration();
        setIsCalibrating(false);
        if (res.success) {
          setThreshold(res.newThreshold);
          setCalibrationToast(`Calibration Complete! Open Eye Baseline: ${res.baseline} → Auto EAR Threshold: ${res.newThreshold}`);
          setTimeout(() => setCalibrationToast(null), 5000);
        } else {
          setCalibrationToast('Face was not detected during calibration. Please look directly at the camera.');
          setTimeout(() => setCalibrationToast(null), 4000);
        }
      }
    }, 1000);
  };

  // Adjust threshold from Navbar micro-tuner or toggle
  const handleAdjustThreshold = (delta, isToggle = false) => {
    if (isToggle) {
      setThreshold(prev => (prev <= 0.24 ? 0.280 : 0.210));
    } else {
      setThreshold(prev => Math.max(0.14, Math.min(0.40, Number((prev + delta).toFixed(3)))));
    }
  };

  // Load MediaPipe FaceMesh from local assets
  useEffect(() => {
    const initFaceMesh = () => {
      const FaceMeshClass = typeof window !== 'undefined' ? window.FaceMesh : null;
      if (!FaceMeshClass) {
        setTimeout(initFaceMesh, 150);
        return;
      }

      try {
        const fm = new FaceMeshClass({
          locateFile: (file) => `/mediapipe/${file}`,
        });

        fm.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        setFaceMeshInstance(fm);
        setIsReady(true);
      } catch (err) {
        console.error('Inisialisasi MediaPipe FaceMesh gagal:', err);
      }
    };

    initFaceMesh();
  }, []);

  // Frame processed handler
  const handleFrameProcessed = (data) => {
    setCurrentEar(data.ear);
    setLeftEar(data.leftEar);
    setRightEar(data.rightEar);
    setIsBlinking(data.isBlinking);
    setEarHistory([...tracker.earHistory]);
    setStats(tracker.getStatistics());

    // FPS calculation
    frameCountRef.current += 1;
    const now = performance.now();
    if (now - lastTimeRef.current >= 1000) {
      setFps(Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current)));
      frameCountRef.current = 0;
      lastTimeRef.current = now;
    }
  };

  // Blink trigger handler (play chime)
  const handleBlinkTrigger = () => {
    audioFeedback.playBlinkChime();
  };

  // Reset handler
  const handleReset = () => {
    tracker.reset();
    setEarHistory([]);
    setStats(tracker.getStatistics());
  };

  // Export CSV handler
  const handleExportCSV = () => {
    tracker.exportCSV(username);
  };

  // Dynamic Tab Title update when user switches to other tabs in background
  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden) {
        document.title = 'Eye Blink Detection System - Jason Istioso';
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  useEffect(() => {
    if (document.hidden && currentView === 'studio') {
      document.title = `(${stats.totalBlinks} Kedipan) EAR: ${currentEar.toFixed(3)} • Eye Blink Detection`;
    }
  }, [stats.totalBlinks, currentEar, currentView]);

  return (
    <div className={`app-container ${currentView === 'landing' ? 'landing-mode' : ''}`}>
      {/* Navigation Header only in Studio Mode ('hilangkan navbar saat diawal') */}
      {currentView === 'studio' && (
        <Navbar
          fps={fps}
          isReady={isReady}
          totalBlinks={stats.totalBlinks}
          threshold={threshold}
          onAdjustThreshold={handleAdjustThreshold}
          isCalibrating={isCalibrating}
          calibrateCountdown={calibrateCountdown}
          onStartCalibration={startCalibration}
          onReset={handleReset}
          onExportCSV={handleExportCSV}
          currentView={currentView}
          onViewChange={setCurrentView}
          username={username}
          onEditUsername={handleOpenEditUsername}
        />
      )}

      {/* Main Content: Landing Page vs Simple Telemetry View vs Full Studio */}
      {currentView === 'landing' ? (
        <LandingPage
          onLaunchStudio={handleLaunchStudio}
          onSelectVideo={handleSelectSampleVideo}
          onStartLiveCamera={handleStartLiveCamera}
          username={username}
        />
      ) : currentView === 'simple' ? (
        <div className="simple-telemetry-container">
          {/* Streamlined Minimalist Header (Matching Image 2 Concept) */}
          <header className="simple-telemetry-topbar">
            <button
              onClick={() => setCurrentView('landing')}
              className="simple-back-btn"
              id="btn-back-to-landing"
              title="Back to Showcase"
            >
              <ArrowLeft size={16} />
              <span>Back to Showcase</span>
            </button>
            <div className="simple-telemetry-meta">
              <span className="live-dot ready" />
              <span className="simple-meta-title">Real-Time Ocular Telemetry</span>
              <span className="simple-meta-divider">•</span>
              <span className="simple-meta-sub">Haar Cascade Eye ROI & MediaPipe EAR Tracking</span>
              {username && (
                <>
                  <span className="simple-meta-divider">•</span>
                  <span className="simple-meta-operator" title="Current Operator Profile">
                    <User size={12} className="inline mr-1 text-crimson" />
                    <span>{username}</span>
                  </span>
                </>
              )}
            </div>
            <button
              onClick={() => setCurrentView('studio')}
              className="simple-studio-jump-btn"
              title="Open Full Calibration & Studio Controls"
            >
              <span>Full Studio</span>
              <ChevronRight size={14} />
            </button>
          </header>

          {/* Focused Dual Display (Matching Image 2 Exactly) */}
          <main className="main-content simple-telemetry-main">
            <div className="dashboard-grid simple-telemetry-grid">
              <VideoCanvasFeed
                key={`${selectedVideo}-simple`}
                faceMesh={faceMeshInstance}
                isReady={isReady}
                tracker={tracker}
                onFrameProcessed={handleFrameProcessed}
                onBlinkTrigger={handleBlinkTrigger}
                threshold={threshold}
                isCalibrating={false}
                calibrateCountdown={0}
                initialVideo={selectedVideo}
                initialMode="sample"
                isSimpleView={true}
              />

              <RealtimeEARPlot
                earHistory={earHistory}
                threshold={threshold}
                currentEar={currentEar}
                isBlinking={isBlinking}
                totalBlinks={stats.totalBlinks}
                bpm={stats.bpm}
                elapsedSeconds={stats.elapsedSeconds}
              />
            </div>
            <div className="mobile-scroll-spacer" />
          </main>
        </div>
      ) : (
        <main className="main-content">
          {/* Calibration Toast Banner */}
          {calibrationToast && (
            <div style={{
              padding: '10px 16px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: 'var(--radius-sm)',
              color: '#34d399',
              fontSize: '0.82rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span>{calibrationToast}</span>
              <button
                onClick={() => setCalibrationToast(null)}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Dual Screen Display: Video on Left, Oscilloscope on Right */}
          <div className="dashboard-grid">
            <VideoCanvasFeed
              key={`${selectedVideo}-${initialMode}`}
              faceMesh={faceMeshInstance}
              isReady={isReady}
              tracker={tracker}
              onFrameProcessed={handleFrameProcessed}
              onBlinkTrigger={handleBlinkTrigger}
              threshold={threshold}
              isCalibrating={isCalibrating}
              calibrateCountdown={calibrateCountdown}
              initialVideo={selectedVideo}
              initialMode={initialMode}
              isSimpleView={false}
              propInputMode={inputMode}
              onChangeInputMode={setInputMode}
              propSampleVideo={selectedVideo}
              onChangeSampleVideo={setSelectedVideo}
              propMirrorCamera={mirrorCamera}
              onToggleMirror={() => setMirrorCamera((p) => !p)}
              propShowLandmarks={showLandmarks}
              onToggleLandmarks={() => setShowLandmarks((p) => !p)}
              propShowHaarRoi={showHaarRoi}
              onToggleHaarRoi={() => setShowHaarRoi((p) => !p)}
              onRegisterTogglePip={(fn) => { togglePipRef.current = fn; }}
              onRegisterFileUpload={(fn) => { fileUploadRef.current = fn; }}
            />

            <RealtimeEARPlot
              earHistory={earHistory}
              threshold={threshold}
              currentEar={currentEar}
              isBlinking={isBlinking}
              totalBlinks={stats.totalBlinks}
              bpm={stats.bpm}
              elapsedSeconds={stats.elapsedSeconds}
            />
          </div>
          <div className="mobile-scroll-spacer" />
        </main>
      )}

      {/* Modern 5-Item Mobile Bottom Navigation Bar (Active in Studio on mobile) */}
      {currentView === 'studio' && (
        <MobileBottomNav
          onViewChange={setCurrentView}
          isCalibrating={isCalibrating}
          calibrateCountdown={calibrateCountdown}
          onStartCalibration={startCalibration}
          threshold={threshold}
          onAdjustThreshold={handleAdjustThreshold}
          inputMode={inputMode}
          onChangeInputMode={setInputMode}
          sampleVideo={selectedVideo}
          onChangeSampleVideo={setSelectedVideo}
          mirrorCamera={mirrorCamera}
          onToggleMirror={() => setMirrorCamera((p) => !p)}
          showLandmarks={showLandmarks}
          onToggleLandmarks={() => setShowLandmarks((p) => !p)}
          showHaarRoi={showHaarRoi}
          onToggleHaarRoi={() => setShowHaarRoi((p) => !p)}
          isPipActive={isPipActive}
          onTogglePip={() => togglePipRef.current?.()}
          onReset={handleReset}
          onExportCSV={handleExportCSV}
          onFileUpload={(e) => fileUploadRef.current?.(e)}
        />
      )}



      {/* Username Registration & Editing Modal */}
      <UsernameModal
        isOpen={isUsernameModalOpen}
        onClose={() => setIsUsernameModalOpen(false)}
        onSubmit={handleUsernameSubmit}
        currentUsername={username}
        isEditing={isEditingUsername}
      />

      {/* Welcome Opening Transition Screen */}
      {isWelcomeOpeningOpen && (
        <WelcomeOpening
          username={username}
          onFinish={handleWelcomeFinish}
        />
      )}
    </div>
  );
}
