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
  ArrowRight,
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
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    if (!showAdvanced) return;
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setShowAdvanced(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAdvanced]);

  return (
    <header className="navbar">
      {/* Brand Identity */}
      <div className="nav-brand">
        <div className="brand-icon-box" title="OcularVision AI Computer Vision System">
          <OcularVisionLogo size={19} />
        </div>
        <div className="brand-text">
          <div className="brand-title">OcularVision AI</div>
          <div className="brand-subtitle">
            Eye Blink &amp; Clinical EAR Monitor
          </div>
        </div>
      </div>

      {/* Clean 3-Page View Switcher + Operator Badge */}
      <div className="nav-view-switcher">
        <button
          type="button"
          onClick={() => onViewChange?.('landing')}
          className={`view-tab-btn ${currentView === 'landing' ? 'active' : ''}`}
          title="Halaman Utama"
        >
          <Home size={13} />
          <span>Home</span>
        </button>

        <button
          type="button"
          onClick={() => onViewChange?.('studio')}
          className={`view-tab-btn ${currentView === 'studio' ? 'active' : ''}`}
          title="Detection Studio (Kamera & Grafik EAR)"
        >
          <LayoutDashboard size={13} />
          <span>Studio</span>
        </button>

        <button
          type="button"
          onClick={() => onViewChange?.('results')}
          className={`view-tab-btn ${currentView === 'results' ? 'active' : ''} ${hasMinuteAlert ? 'has-alert' : ''}`}
          title="Halaman Hasil Analisis Klinis AI"
        >
          <FileBarChart2 size={13} />
          <span>Hasil</span>
          {(completedMinutesCount > 0 || hasMinuteAlert) && (
            <span className={`nav-tab-badge ${hasMinuteAlert ? 'alert' : ''}`}>
              {completedMinutesCount || '!'}
            </span>
          )}
        </button>

        {/* Operator Profile Badge */}
        <button
          onClick={onEditUsername}
          className="nav-operator-pill"
          title="Klik untuk mengisi atau mengubah nama pasien / operator"
          type="button"
        >
          <div className="nav-operator-dot" />
          <User size={12} className="text-crimson" />
          <span className="nav-operator-label">
            {username ? username : 'Isi Nama'}
          </span>
        </button>

        {/* Live Blink Counter (Mobile compact) */}
        <div
          className="nav-fps nav-fps-mobile-only"
          style={{
            borderColor: 'rgba(244, 63, 94, 0.4)',
            background: 'rgba(244, 63, 94, 0.1)',
          }}
        >
          <span className="live-dot" style={{ backgroundColor: '#f43f5e' }} />
          <span style={{ color: '#fb7185', fontWeight: 700 }}>{totalBlinks}</span>
        </div>
      </div>

      {/* Streamlined Primary Actions */}
      <div className="nav-actions">
        {currentView === 'studio' && (
          <>
            {/* Primary Play / Pause Session */}
            <button
              type="button"
              onClick={onTogglePause}
              className={`nav-session-btn ${isSessionPaused ? 'paused' : 'running'}`}
              title={
                isSessionPaused
                  ? 'Lanjutkan deteksi & timer 1 menit'
                  : 'Jeda deteksi & hentikan sementara timer 1 menit'
              }
            >
              {isSessionPaused ? <Play size={13} /> : <Pause size={13} />}
              <span>{isSessionPaused ? 'Lanjutkan' : 'Pause'}</span>
            </button>

            {/* Calibration Button */}
            <button
              type="button"
              onClick={onStartCalibration}
              disabled={isCalibrating || isSessionPaused}
              className={`nav-btn-accent ${isCalibrating ? 'calibrating' : ''}`}
              title="Kalibrasi otomatis 3 detik sesuai mata Anda"
            >
              <Crosshair size={13} />
              <span>
                {isCalibrating ? `Kalibrasi (${calibrateCountdown}s)` : 'Kalibrasi (3s)'}
              </span>
            </button>

            {/* Next Page / View Clinical Result CTA */}
            <button
              type="button"
              onClick={() => onViewChange?.('results')}
              className="nav-results-cta"
              title="Lihat hasil analisis lengkap & kartu nama klinis"
            >
              <span>Lihat Hasil</span>
              <ArrowRight size={13} />
            </button>
          </>
        )}

        {currentView === 'results' && (
          <>
            <button
              type="button"
              onClick={() => onViewChange?.('studio')}
              className="nav-btn-accent"
            >
              <LayoutDashboard size={13} />
              <span>Kembali ke Studio</span>
            </button>
            <button type="button" onClick={onExportCSV} className="nav-btn">
              <Download size={13} />
              <span>Export CSV</span>
            </button>
          </>
        )}

        {/* Collapsible Advanced Settings Popover */}
        <div className="nav-advanced-wrap" ref={popoverRef}>
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className={`nav-btn nav-gear-btn ${showAdvanced ? 'active' : ''}`}
            title="Pengaturan lanjutan: Threshold EAR, Kacamata, Reset & Export"
          >
            <SlidersHorizontal size={13} />
            <span>Pengaturan</span>
          </button>

          {showAdvanced && (
            <div className="nav-advanced-popover">
              <div className="popover-section">
                <div className="popover-row-head">
                  <span className="popover-label">Sensitivitas EAR Threshold</span>
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
                    title="Turunkan Threshold (-0.01)"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="tuner-value">{threshold.toFixed(3)}</span>
                  <button
                    type="button"
                    onClick={() => onAdjustThreshold(0.01)}
                    className="tuner-btn"
                    title="Naikkan Threshold (+0.01)"
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
                <span>Mode Kacamata ({threshold <= 0.24 ? 'Aktif: 0.210' : 'Normal: 0.280'})</span>
              </button>

              <div className="popover-divider" />

              <button
                type="button"
                onClick={() => {
                  onExportCSV?.();
                  setShowAdvanced(false);
                }}
                className="popover-item-btn"
              >
                <Download size={14} />
                <span>Export Data CSV</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onReset?.();
                  setShowAdvanced(false);
                }}
                className="popover-item-btn danger"
              >
                <RotateCcw size={14} />
                <span>Reset Counter &amp; Timer</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
