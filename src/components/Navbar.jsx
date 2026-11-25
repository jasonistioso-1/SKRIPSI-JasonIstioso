import React, { useState, useRef, useEffect } from 'react';
import {
  RotateCcw,
  Download,
  Crosshair,
  Glasses,
  Plus,
  Minus,
  Home,
  LayoutDashboard,
  User,
  FileBarChart2,
  Pause,
  Play,
  SlidersHorizontal,
  Eye,
  Scan,
  FlipHorizontal,
  PictureInPicture2,
} from 'lucide-react';
import OcularVisionLogo from './ui/OcularVisionLogo';

export default function Navbar({
  fps = 0,
  isReady = false,
  totalBlinks = 0,
  threshold = 0.22,
  onAdjustThreshold,
  isCalibrating = false,
  calibrateCountdown = 0,
  onStartCalibration,
  onReset,
  onExportCSV,
  currentView = 'landing',
  onViewChange,
  username = '',
  onEditUsername,
  isSessionPaused = false,
  onTogglePause,
  completedMinutesCount = 0,
  hasMinuteAlert = false,
  showLandmarks = true,
  onToggleLandmarks,
  showHaarRoi = false,
  onToggleHaarRoi,
  mirrorCamera = true,
  onToggleMirror,
  inputMode = 'webcam',
  onTogglePip,
}) {
  const [showSettings, setShowSettings] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    if (!showSettings) return;
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSettings]);

  return (
    <header className="navbar">
      {/* Brand */}
      <div className="nav-brand">
        <div className="brand-icon-box" title="Eye Blink Detection System">
          <OcularVisionLogo size={18} />
        </div>
        <div className="brand-text">
          <div className="brand-title">Eye Blink Detection System</div>
          <div className="brand-subtitle">Jason Istioso&apos;s Clinic</div>
        </div>
      </div>

      {/* 3-Tab Page Switcher + Name */}
      <div className="nav-view-switcher">
        <button
          type="button"
          onClick={() => onViewChange?.('landing')}
          className={`view-tab-btn ${currentView === 'landing' ? 'active' : ''}`}
        >
          <Home size={13} />
          <span>Home</span>
        </button>

        <button
          type="button"
          onClick={() => onViewChange?.('studio')}
          className={`view-tab-btn ${currentView === 'studio' ? 'active' : ''}`}
        >
          <LayoutDashboard size={13} />
          <span>Studio</span>
        </button>

        <button
          type="button"
          onClick={() => onViewChange?.('results')}
          className={`view-tab-btn ${currentView === 'results' ? 'active' : ''} ${hasMinuteAlert ? 'has-alert' : ''}`}
        >
          <FileBarChart2 size={13} />
          <span>Hasil</span>
          {(completedMinutesCount > 0 || hasMinuteAlert) && (
            <span className={`nav-tab-badge ${hasMinuteAlert ? 'alert' : ''}`}>
              {hasMinuteAlert ? '!' : completedMinutesCount}
            </span>
          )}
        </button>

        <button
          onClick={onEditUsername}
          className="nav-operator-pill"
          title="Ubah nama"
          type="button"
        >
          <User size={12} className="text-crimson" />
          <span className="nav-operator-label">
            {username ? username : 'Isi Nama'}
          </span>
        </button>

        <div
          className="nav-fps nav-fps-mobile-only"
          style={{
            borderColor: 'rgba(244, 63, 94, 0.4)',
            background: 'rgba(244, 63, 94, 0.1)',
          }}
        >
          <span style={{ color: '#fb7185', fontWeight: 700 }}>{totalBlinks}</span>
        </div>
      </div>

      {/* Minimal Right Controls */}
      <div className="nav-actions">
        {currentView === 'studio' && (
          <>
            <button
              type="button"
              onClick={onTogglePause}
              className={`nav-session-btn ${isSessionPaused ? 'paused' : 'running'}`}
            >
              {isSessionPaused ? <Play size={13} /> : <Pause size={13} />}
              <span>{isSessionPaused ? 'Lanjut' : 'Pause'}</span>
            </button>

            <button
              type="button"
              onClick={onStartCalibration}
              disabled={isCalibrating || isSessionPaused}
              className={`nav-btn-accent ${isCalibrating ? 'calibrating' : ''}`}
            >
              <Crosshair size={13} />
              <span>
                {isCalibrating ? `${calibrateCountdown}s...` : 'Kalibrasi'}
              </span>
            </button>
          </>
        )}

        {/* Single Settings Menu for Everything Else */}
        <div className="nav-advanced-wrap" ref={popoverRef}>
          <button
            type="button"
            onClick={() => setShowSettings((v) => !v)}
            className={`nav-btn nav-gear-btn ${showSettings ? 'active' : ''}`}
          >
            <SlidersHorizontal size={13} />
            <span>Pengaturan</span>
          </button>

          {showSettings && (
            <div className="nav-advanced-popover">
              <div className="popover-section">
                <div className="popover-row-head">
                  <span className="popover-label">Threshold EAR</span>
                  <span className="popover-fps">
                    <span className={`live-dot ${isReady ? 'ready' : ''}`} />
                    {fps} FPS
                  </span>
                </div>
                <div className="tuner-stepper popover-stepper">
                  <button
                    type="button"
                    onClick={() => onAdjustThreshold(-0.01)}
                    className="tuner-btn"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="tuner-value">{threshold.toFixed(3)}</span>
                  <button
                    type="button"
                    onClick={() => onAdjustThreshold(0.01)}
                    className="tuner-btn"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onAdjustThreshold(threshold > 0.25 ? -0.06 : 0.06, true)}
                className={`popover-item-btn ${threshold <= 0.24 ? 'active' : ''}`}
              >
                <Glasses size={14} />
                <span>Mode Kacamata ({threshold <= 0.24 ? '0.210' : '0.280'})</span>
              </button>

              {currentView === 'studio' && (
                <>
                  <div className="popover-divider" />
                  <button
                    type="button"
                    onClick={onToggleLandmarks}
                    className={`popover-item-btn ${showLandmarks ? 'active' : ''}`}
                  >
                    <Eye size={14} />
                    <span>Garis Landmark Mata</span>
                  </button>
                  <button
                    type="button"
                    onClick={onToggleHaarRoi}
                    className={`popover-item-btn ${showHaarRoi ? 'active' : ''}`}
                  >
                    <Scan size={14} />
                    <span>Kotak Haar ROI</span>
                  </button>
                  {inputMode === 'webcam' && (
                    <button
                      type="button"
                      onClick={onToggleMirror}
                      className={`popover-item-btn ${mirrorCamera ? 'active' : ''}`}
                    >
                      <FlipHorizontal size={14} />
                      <span>Cermin Kamera (Mirror)</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      onTogglePip?.();
                      setShowSettings(false);
                    }}
                    className="popover-item-btn"
                  >
                    <PictureInPicture2 size={14} />
                    <span>Mode Mengambang (PiP)</span>
                  </button>
                </>
              )}

              <div className="popover-divider" />

              <button
                type="button"
                onClick={() => {
                  onExportCSV?.();
                  setShowSettings(false);
                }}
                className="popover-item-btn"
              >
                <Download size={14} />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onReset?.();
                  setShowSettings(false);
                }}
                className="popover-item-btn danger"
              >
                <RotateCcw size={14} />
                <span>Reset Sesi</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
