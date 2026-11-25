import React, { useState, useEffect, useRef, useMemo } from 'react';
import Navbar from './components/Navbar';
import VideoCanvasFeed from './components/VideoCanvasFeed';
import RealtimeEARPlot from './components/RealtimeEARPlot';
import LandingPage from './components/LandingPage';
import ResultsPage from './components/ResultsPage';
import UsernameModal from './components/UsernameModal';
import WelcomeOpening from './components/WelcomeOpening';
import MobileBottomNav from './components/MobileBottomNav';
import { BlinkTracker } from './lib/earMath';
import { audioFeedback } from './lib/audioFeedback';
import { BLINK_STANDARD, evaluateMinuteBlinkRate } from './lib/clinicalAnalysis';
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  User,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity,
  Pause,
  Play,
  FileBarChart2,
} from 'lucide-react';

function formatClockRange(minuteNumber) {
  const startMin = minuteNumber - 1;
  const endMin = minuteNumber;
  return `${String(startMin).padStart(2, '0')}:00 – ${String(endMin).padStart(2, '0')}:00`;
}

export default function App() {
  // Detector & Tracker States
  const [faceMeshInstance, setFaceMeshInstance] = useState(null);
  const [isReady, setIsReady] = useState(false);

  // Default threshold: 0.220 (Optimal for glasses & Asian eye anatomy)
  const [threshold, setThreshold] = useState(0.22);
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
  const [currentEar, setCurrentEar] = useState(0.28);
  const [leftEar, setLeftEar] = useState(0.28);
  const [rightEar, setRightEar] = useState(0.28);
  const [isBlinking, setIsBlinking] = useState(false);
  const [earHistory, setEarHistory] = useState([]);
  const [stats, setStats] = useState({
    totalBlinks: 0,
    bpm: 0,
    elapsedSeconds: 0,
    avgEar: 0.28,
    eventsCount: 0,
  });

  // Session Pause & 1-Minute Evaluation State
  const [isSessionPaused, setIsSessionPaused] = useState(false);
  const [minuteLogs, setMinuteLogs] = useState([]);
  const [minuteAlert, setMinuteAlert] = useState(null);
  const [currentCycleSeconds, setCurrentCycleSeconds] = useState(0);
  const [currentCycleBlinks, setCurrentCycleBlinks] = useState(0);

  // Refs for accurate 1-minute bucket tracking
  const minuteStartBlinkCountRef = useRef(0);
  const minuteEarSamplesRef = useRef([]);
  const minuteLogsRef = useRef([]);
  const lastTickRef = useRef(Date.now());

  // Navigation View State ('landing' | 'studio' | 'simple' | 'results')
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

  // FPS calculation refs
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  // Instantiate Tracker
  const tracker = useMemo(
    () =>
      new BlinkTracker({
        earThreshold: threshold,
        consecFrames: consecFrames,
      }),
    []
  );

  // Sync threshold with tracker
  useEffect(() => {
    tracker.setThreshold(threshold);
  }, [threshold, tracker]);

  // Keep minuteLogsRef synced
  useEffect(() => {
    minuteLogsRef.current = minuteLogs;
  }, [minuteLogs]);

  // Reset helper (clears tracker + 1-minute logs + alerts)
  const resetSessionData = () => {
    tracker.reset();
    setEarHistory([]);
    setStats(tracker.getStatistics());
    setMinuteLogs([]);
    minuteLogsRef.current = [];
    minuteStartBlinkCountRef.current = 0;
    minuteEarSamplesRef.current = [];
    setMinuteAlert(null);
    setCurrentCycleSeconds(0);
    setCurrentCycleBlinks(0);
    lastTickRef.current = Date.now();
  };

  const handleLaunchStudio = (videoPath, mode = 'sample') => {
    if (videoPath) setSelectedVideo(videoPath);
    if (mode) {
      setInitialMode(mode);
      setInputMode(mode);
    }
    setIsSessionPaused(false);
    lastTickRef.current = Date.now();
    setCurrentView('studio');
  };

  const handleSelectSampleVideo = (videoPath) => {
    resetSessionData();
    if (videoPath) setSelectedVideo(videoPath);
    setInitialMode('sample');
    setIsSessionPaused(false);
    lastTickRef.current = Date.now();
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
      setCalibrationToast(`Profil pasien / operator diperbarui: ${newUsername}`);
      setTimeout(() => setCalibrationToast(null), 3000);
      return;
    }

    // Trigger welcome opening screen
    setIsWelcomeOpeningOpen(true);
  };

  // Handle Welcome Opening Completion
  const handleWelcomeFinish = () => {
    setIsWelcomeOpeningOpen(false);
    resetSessionData();
    handleLaunchStudio('/videos/blinking_1.mp4', 'webcam');
  };

  // Edit Username from Navbar / Results
  const handleOpenEditUsername = () => {
    setIsEditingUsername(true);
    setIsUsernameModalOpen(true);
  };

  // Toggle Pause / Resume cleanly
  const handleTogglePause = () => {
    setIsSessionPaused((prev) => {
      const next = !prev;
      lastTickRef.current = Date.now();
      return next;
    });
  };

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
          setCalibrationToast(
            `Kalibrasi Selesai! Baseline Mata Terbuka: ${res.baseline} → Auto EAR Threshold: ${res.newThreshold}`
          );
          setTimeout(() => setCalibrationToast(null), 5000);
        } else {
          setCalibrationToast(
            'Wajah tidak terdeteksi saat kalibrasi. Hadapkan wajah langsung ke kamera.'
          );
          setTimeout(() => setCalibrationToast(null), 4000);
        }
      }
    }, 1000);
  };

  // Adjust threshold from Navbar micro-tuner or toggle
  const handleAdjustThreshold = (delta, isToggle = false) => {
    if (isToggle) {
      setThreshold((prev) => (prev <= 0.24 ? 0.28 : 0.21));
    } else {
      setThreshold((prev) =>
        Math.max(0.14, Math.min(0.4, Number((prev + delta).toFixed(3))))
      );
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

  // 1-Minute Active Session Timer & Automatic Insufficient-Blink Alert Engine
  useEffect(() => {
    const isTrackingView = currentView === 'studio' || currentView === 'simple';
    if (!isTrackingView || isSessionPaused || isCalibrating) {
      lastTickRef.current = Date.now();
      return;
    }

    lastTickRef.current = Date.now();
    const timer = setInterval(() => {
      const now = Date.now();
      const delta = Math.min(1000, Math.max(0, now - lastTickRef.current));
      lastTickRef.current = now;

      tracker.addActiveTime(delta);
      const nextStats = tracker.getStatistics();
      setStats(nextStats);

      const activeSec = nextStats.elapsedSeconds;
      const cycleSec = activeSec % BLINK_STANDARD.INTERVAL_SECONDS;
      const completedMinutes = Math.floor(activeSec / BLINK_STANDARD.INTERVAL_SECONDS);

      setCurrentCycleSeconds(cycleSec);
      setCurrentCycleBlinks(Math.max(0, tracker.blinkCounter - minuteStartBlinkCountRef.current));

      // Check if a new 1-minute cycle just completed while session is NOT paused
      if (completedMinutes > minuteLogsRef.current.length) {
        const minuteNum = minuteLogsRef.current.length + 1;
        const blinksInMinute = Math.max(0, tracker.blinkCounter - minuteStartBlinkCountRef.current);

        const samples = minuteEarSamplesRef.current;
        const avgEarMin =
          samples.length > 0
            ? Number((samples.reduce((a, b) => a + b, 0) / samples.length).toFixed(3))
            : nextStats.avgEar;
        const minEarMin =
          samples.length > 0 ? Number(Math.min(...samples).toFixed(3)) : nextStats.avgEar;

        // Average blink duration for events within the completed minute window
        const minWindowStartMs = (minuteNum - 1) * 60000;
        const minWindowEndMs = minuteNum * 60000;
        const eventsInMin = tracker.blinkEvents.filter(
          (ev) => ev.timestamp >= minWindowStartMs && ev.timestamp <= minWindowEndMs
        );
        const avgDurationMs =
          eventsInMin.length > 0
            ? Math.round(
                eventsInMin.reduce((s, e) => s + (e.durationMs || 160), 0) / eventsInMin.length
              )
            : 0;

        const evaluation = evaluateMinuteBlinkRate(
          blinksInMinute,
          avgEarMin,
          minEarMin,
          avgDurationMs
        );

        const logEntry = {
          minuteNumber: minuteNum,
          windowRange: formatClockRange(minuteNum),
          blinksInMinute,
          recordedAt: new Date().toLocaleTimeString('id-ID', { hour12: false }),
          ...evaluation,
        };

        const updatedLogs = [...minuteLogsRef.current, logEntry];
        minuteLogsRef.current = updatedLogs;
        setMinuteLogs(updatedLogs);

        // Reset counters for next 1-minute window
        minuteStartBlinkCountRef.current = tracker.blinkCounter;
        minuteEarSamplesRef.current = [];
        setCurrentCycleBlinks(0);

        // Trigger alert if unpaused and blink count < clinical standard (15/min)
        if (evaluation.alertTriggered) {
          audioFeedback.playAlertTone();
          setMinuteAlert({
            minuteNumber: minuteNum,
            blinksInMinute,
            severity: evaluation.severity,
            message: `Peringatan Menit ke-${minuteNum}: Jumlah kedipan hanya ${blinksInMinute} kali (Standar umum: ${BLINK_STANDARD.MIN_NORMAL}–${BLINK_STANDARD.MAX_NORMAL} kedipan/menit). Istirahatkan mata & berkedip secara sadar!`,
          });
        }
      }
    }, 250);

    return () => clearInterval(timer);
  }, [currentView, isSessionPaused, isCalibrating, tracker]);

  // Frame processed handler
  const handleFrameProcessed = (data) => {
    setCurrentEar(data.ear);
    setLeftEar(data.leftEar);
    setRightEar(data.rightEar);
    setIsBlinking(data.isBlinking);
    setEarHistory([...tracker.earHistory]);
    minuteEarSamplesRef.current.push(data.ear);

    const updatedStats = tracker.getStatistics();
    setStats(updatedStats);
    setCurrentCycleBlinks(Math.max(0, tracker.blinkCounter - minuteStartBlinkCountRef.current));

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
    resetSessionData();
  };

  // Export CSV handler
  const handleExportCSV = () => {
    tracker.exportCSV(username);
  };

  // Dynamic Tab Title update when user switches to other tabs in background
  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden) {
        document.title = "Eye Blink Detection System • Jason Istioso's Clinic";
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  useEffect(() => {
    if (document.hidden && currentView === 'studio') {
      document.title = `(${stats.totalBlinks} Kedipan • ${stats.bpm} BPM) EAR: ${currentEar.toFixed(3)}`;
    }
  }, [stats.totalBlinks, stats.bpm, currentEar, currentView]);

  const currentMinuteNumber = minuteLogs.length + 1;
  const liveCyclePct = Math.min(100, Math.round((currentCycleSeconds / 60) * 100));
  const targetRatioPct = Math.min(100, Math.round((currentCycleBlinks / BLINK_STANDARD.MIN_NORMAL) * 100));

  return (
    <div
      className={`app-container ${
        currentView === 'landing' || currentView === 'results' ? 'landing-mode' : ''
      }`}
    >
      {/* Navigation Header in Studio and Results Views */}
      {(currentView === 'studio' || currentView === 'results') && (
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
          isSessionPaused={isSessionPaused}
          onTogglePause={handleTogglePause}
          completedMinutesCount={minuteLogs.length}
          hasMinuteAlert={Boolean(minuteAlert)}
          showLandmarks={showLandmarks}
          onToggleLandmarks={() => setShowLandmarks((p) => !p)}
          showHaarRoi={showHaarRoi}
          onToggleHaarRoi={() => setShowHaarRoi((p) => !p)}
          mirrorCamera={mirrorCamera}
          onToggleMirror={() => setMirrorCamera((p) => !p)}
          inputMode={inputMode}
          onTogglePip={() => togglePipRef.current?.()}
        />
      )}

      {/* Main Content Router */}
      {currentView === 'landing' ? (
        <LandingPage
          onLaunchStudio={handleLaunchStudio}
          onSelectVideo={handleSelectSampleVideo}
          onStartLiveCamera={handleStartLiveCamera}
          username={username}
        />
      ) : currentView === 'results' ? (
        <ResultsPage
          username={username}
          onEditUsername={handleOpenEditUsername}
          stats={stats}
          minuteLogs={minuteLogs}
          blinkEvents={tracker.blinkEvents}
          currentCycleSeconds={currentCycleSeconds}
          currentCycleBlinks={currentCycleBlinks}
          threshold={threshold}
          baselineOpenEar={tracker.baselineOpenEar}
          onBackToStudio={() => setCurrentView('studio')}
          onReset={handleReset}
          onExportCSV={handleExportCSV}
        />
      ) : currentView === 'simple' ? (
        <div className="simple-telemetry-container">
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
              <span className="simple-meta-title">Eye Blink Detection System</span>
              <span className="simple-meta-divider">•</span>
              <span className="simple-meta-sub">
                Jason Istioso&apos;s Clinic • Menit #{currentMinuteNumber} ({currentCycleSeconds}s/60s)
              </span>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setCurrentView('results')}
                className="simple-studio-jump-btn"
                title="Lihat Hasil Analisis"
              >
                <FileBarChart2 size={14} />
                <span>Hasil</span>
              </button>
              <button
                onClick={() => setCurrentView('studio')}
                className="simple-studio-jump-btn"
                title="Open Full Calibration & Studio Controls"
              >
                <span>Full Studio</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </header>

          <main className="main-content simple-telemetry-main">
            {minuteAlert && (
              <div className={`minute-alert-banner ${minuteAlert.severity}`}>
                <div className="minute-alert-left">
                  <AlertTriangle size={18} />
                  <span>{minuteAlert.message}</span>
                </div>
                <div className="minute-alert-actions">
                  <button type="button" onClick={() => setCurrentView('results')} className="minute-alert-cta">
                    Lihat Hasil
                  </button>
                  <button type="button" onClick={() => setMinuteAlert(null)} className="minute-alert-close">
                    ✕
                  </button>
                </div>
              </div>
            )}

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
                propIsPaused={isSessionPaused}
                onTogglePause={handleTogglePause}
              />

              <RealtimeEARPlot
                earHistory={earHistory}
                threshold={threshold}
                currentEar={currentEar}
                isBlinking={isBlinking}
                totalBlinks={stats.totalBlinks}
                bpm={stats.bpm}
                elapsedSeconds={stats.elapsedSeconds}
                currentCycleSeconds={currentCycleSeconds}
                currentCycleBlinks={currentCycleBlinks}
                currentMinuteNumber={currentMinuteNumber}
                isSessionPaused={isSessionPaused}
              />
            </div>
            <div className="mobile-scroll-spacer" />
          </main>
        </div>
      ) : (
        <main className="main-content">
          {/* Calibration Toast Banner */}
          {calibrationToast && (
            <div className="studio-toast-banner">
              <span>{calibrationToast}</span>
              <button onClick={() => setCalibrationToast(null)} className="studio-toast-close">
                ✕
              </button>
            </div>
          )}

          {/* 1-Minute Insufficient Blink Alert Banner */}
          {minuteAlert && (
            <div className={`minute-alert-banner ${minuteAlert.severity}`}>
              <div className="minute-alert-left">
                <div className="minute-alert-icon-pulse">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <strong>Peringatan Kedipan (Menit ke-{minuteAlert.minuteNumber})</strong>
                  <p>{minuteAlert.message}</p>
                </div>
              </div>
              <div className="minute-alert-actions">
                <button
                  type="button"
                  onClick={() => setCurrentView('results')}
                  className="minute-alert-cta"
                >
                  <span>Lihat Hasil</span>
                  <ArrowRight size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setMinuteAlert(null)}
                  className="minute-alert-close"
                  title="Tutup"
                >
                  ✕
                </button>
              </div>
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
              propIsPaused={isSessionPaused}
              onTogglePause={handleTogglePause}
              onRegisterTogglePip={(fn) => {
                togglePipRef.current = fn;
              }}
              onRegisterFileUpload={(fn) => {
                fileUploadRef.current = fn;
              }}
            />

            <RealtimeEARPlot
              earHistory={earHistory}
              threshold={threshold}
              currentEar={currentEar}
              isBlinking={isBlinking}
              totalBlinks={stats.totalBlinks}
              bpm={stats.bpm}
              elapsedSeconds={stats.elapsedSeconds}
              currentCycleSeconds={currentCycleSeconds}
              currentCycleBlinks={currentCycleBlinks}
              currentMinuteNumber={currentMinuteNumber}
              isSessionPaused={isSessionPaused}
            />
          </div>
          <div className="mobile-scroll-spacer" />
        </main>
      )}

      {/* Modern 5-Item Mobile Bottom Navigation Bar (Active in Studio on mobile) */}
      {currentView === 'studio' && (
        <MobileBottomNav
          onViewChange={setCurrentView}
          isSessionPaused={isSessionPaused}
          onTogglePause={handleTogglePause}
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
        <WelcomeOpening username={username} onFinish={handleWelcomeFinish} />
      )}
    </div>
  );
}
