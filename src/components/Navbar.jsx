import React from 'react';
import { RotateCcw, Download, Crosshair, Glasses, Plus, Minus, Home, LayoutDashboard, User } from 'lucide-react';
import OcularVisionLogo from './ui/OcularVisionLogo';

export default function Navbar({
  fps = 0,
  isReady = false,
  totalBlinks = 0,
  threshold = 0.220,
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
}) {
  return (
    <header className="navbar">
      {/* Brand Identity */}
      <div className="nav-brand">
        <div className="brand-icon-box" title="Ocular EAR Computer Vision System">
          <OcularVisionLogo size={19} />
        </div>
        <div className="brand-text">
          <div className="brand-title">Eye Blink Detection System</div>
          <div className="brand-subtitle">
            Real-Time EAR Oscilloscope • Jason Istioso
          </div>
        </div>
      </div>

      {/* View Switcher: Home vs Detection Studio */}
      <div className="nav-view-switcher">
        <button
          onClick={() => onViewChange?.('landing')}
          className={`view-tab-btn ${currentView === 'landing' ? 'active' : ''}`}
          title="Showcase & Overview"
        >
          <Home size={13} />
          <span>Home</span>
        </button>
        <button
          onClick={() => onViewChange?.('studio')}
          className={`view-tab-btn ${currentView === 'studio' ? 'active' : ''}`}
          title="Open Camera & Oscilloscope Studio"
        >
          <LayoutDashboard size={13} />
          <span>Detection Studio</span>
        </button>

        {/* Operator Profile Badge */}
        {username && (
          <button
            onClick={onEditUsername}
            className="nav-operator-pill"
            title="Operator username stored in LocalStorage. Click to edit."
            type="button"
          >
            <div className="nav-operator-dot" />
            <User size={12} className="text-crimson" />
            <span className="nav-operator-label">{username}</span>
          </button>
        )}

        {/* Live Blink & FPS Badges (Visible on Mobile) */}
        <div className="nav-fps nav-fps-mobile-only" style={{ borderColor: 'rgba(244, 63, 94, 0.4)', background: 'rgba(244, 63, 94, 0.1)' }}>
          <span className="live-dot" style={{ backgroundColor: '#f43f5e' }} />
          <span style={{ color: '#fb7185', fontWeight: 700 }}>{totalBlinks} Kedipan</span>
        </div>
        <div className="nav-fps nav-fps-mobile-only">
          <span className={`live-dot ${isReady ? 'ready' : ''}`} />
          <span>{fps} FPS</span>
        </div>
      </div>

      {/* Structured Control Hub */}
      <div className="nav-actions">
        {/* Hub 1: EAR Threshold & Calibration */}
        <div className="nav-hub">
          {/* Micro-Tuner EAR Threshold */}
          <div className="nav-tuner">
            <span className="nav-label">EAR Threshold</span>
            <div className="tuner-stepper">
              <button
                onClick={() => onAdjustThreshold(-0.01)}
                className="tuner-btn"
                title="Decrease EAR Threshold (-0.01)"
              >
                <Minus size={11} />
              </button>
              <span className="tuner-value">{threshold.toFixed(3)}</span>
              <button
                onClick={() => onAdjustThreshold(0.01)}
                className="tuner-btn"
                title="Increase EAR Threshold (+0.01)"
              >
                <Plus size={11} />
              </button>
            </div>
          </div>

          <div className="nav-divider" />

          {/* Preset Glasses / Normal */}
          <button
            onClick={() => onAdjustThreshold(threshold > 0.25 ? -0.06 : 0.06, true)}
            className={`nav-btn ${threshold <= 0.24 ? 'active' : ''}`}
            title="Quick toggle between Glasses profile (0.210) and Normal (0.280)"
          >
            <Glasses size={13} />
            <span>{threshold <= 0.24 ? 'Glasses' : 'Normal'}</span>
          </button>

          <div className="nav-divider" />

          {/* Automatic 3-Second Calibration */}
          <button
            onClick={onStartCalibration}
            disabled={isCalibrating}
            className={`nav-btn-accent ${isCalibrating ? 'calibrating' : ''}`}
            title="Automatic 3-second calibration of open eye baseline"
          >
            <Crosshair size={13} />
            <span>{isCalibrating ? `Calibrating (${calibrateCountdown}s)...` : 'Calibration (3s)'}</span>
          </button>
        </div>

        {/* Hub 2: System & Data Export */}
        <div className="nav-hub">
          {/* Total Blinks Counter Badge */}
          <div className="nav-fps" style={{ borderColor: 'rgba(244, 63, 94, 0.35)', background: 'rgba(244, 63, 94, 0.08)' }}>
            <span className="live-dot" style={{ backgroundColor: '#f43f5e', boxShadow: '0 0 6px rgba(244, 63, 94, 0.6)' }} />
            <span style={{ color: '#fb7185', fontWeight: 700 }}>{totalBlinks} Kedipan</span>
          </div>

          <div className="nav-divider" />

          {/* FPS Live Badge */}
          <div className="nav-fps">
            <span className={`live-dot ${isReady ? 'ready' : ''}`} />
            <span>{fps} FPS</span>
          </div>

          <div className="nav-divider" />

          {/* Reset Metrics */}
          <button
            onClick={onReset}
            className="nav-btn"
            title="Reset total blink counter & timer"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={onExportCSV}
            className="nav-btn"
            title="Export blink telemetry log to CSV file"
          >
            <Download size={12} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>
    </header>
  );
}
