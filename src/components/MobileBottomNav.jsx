import React, { useState } from 'react';
import {
  Home,
  Camera,
  Crosshair,
  Sliders,
  Layers,
  X,
  FlipHorizontal,
  Glasses,
  Plus,
  Minus,
  RotateCcw,
  Download,
  Eye,
  Scan,
  Video,
  Upload,
  PictureInPicture2,
  ChevronRight,
  Check,
  FileBarChart2,
  Pause,
  Play
} from 'lucide-react';

export default function MobileBottomNav({
  onViewChange,
  // Pause / Session
  isSessionPaused = false,
  onTogglePause,
  // Calibration
  isCalibrating,
  calibrateCountdown,
  onStartCalibration,
  // Threshold & Sensitivity
  threshold,
  onAdjustThreshold,
  // Camera & Mode
  inputMode,
  onChangeInputMode,
  sampleVideo,
  onChangeSampleVideo,
  mirrorCamera,
  onToggleMirror,
  showLandmarks,
  onToggleLandmarks,
  showHaarRoi,
  onToggleHaarRoi,
  // PiP & Data
  isPipActive,
  onTogglePip,
  onReset,
  onExportCSV,
  onFileUpload
}) {
  const [activeSheet, setActiveSheet] = useState(null); // 'camera' | 'sensitivity' | 'data' | null

  const handleTabClick = (sheetName) => {
    if (activeSheet === sheetName) {
      setActiveSheet(null);
    } else {
      setActiveSheet(sheetName);
    }
  };

  const closeSheet = () => setActiveSheet(null);

  return (
    <>
      {/* Bottom Sheet Backdrop & Drawer */}
      {activeSheet && (
        <div className="mobile-sheet-overlay" onClick={closeSheet}>
          <div
            className="mobile-sheet-drawer"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Sheet Handle Bar */}
            <div className="mobile-sheet-drag-handle" />

            {/* Sheet Header */}
            <div className="mobile-sheet-header">
              <div className="sheet-header-title-wrap">
                <div className="sheet-header-icon-box">
                  {activeSheet === 'camera' && <Camera size={16} className="text-rose-400" />}
                  {activeSheet === 'sensitivity' && <Sliders size={16} className="text-cyan-400" />}
                  {activeSheet === 'data' && <Layers size={16} className="text-indigo-400" />}
                </div>
                <div>
                  <h3 className="mobile-sheet-title">
                    {activeSheet === 'camera' && 'Pengaturan Kamera & Input'}
                    {activeSheet === 'sensitivity' && 'Sensitivitas EAR & Visualisasi'}
                    {activeSheet === 'data' && 'PiP, Metrik & Ekspor Data'}
                  </h3>
                  <span className="mobile-sheet-subtitle">
                    {activeSheet === 'camera' && 'Konfigurasi sumber video dan orientasi cermin'}
                    {activeSheet === 'sensitivity' && 'Tuning ambang batas kedipan & overlay kontur'}
                    {activeSheet === 'data' && 'Mode latar belakang & manajemen log telemetri'}
                  </span>
                </div>
              </div>
              <button
                onClick={closeSheet}
                className="mobile-sheet-close-btn"
                type="button"
                title="Tutup menu"
              >
                <X size={15} />
              </button>
            </div>

            {/* Sheet Body Content */}
            <div className="mobile-sheet-body">
              {/* TAB 2 CONTENT: KAMERA & INPUT */}
              {activeSheet === 'camera' && (
                <div className="sheet-content-group">
                  <span className="sheet-group-label">Pilih Sumber Video</span>
                  <div className="sheet-grid-3">
                    <button
                      type="button"
                      onClick={() => {
                        onChangeInputMode('webcam');
                        closeSheet();
                      }}
                      className={`sheet-source-card ${inputMode === 'webcam' ? 'active' : ''}`}
                    >
                      <div className="source-card-icon-box">
                        <Camera size={18} />
                      </div>
                      <span className="source-card-name">Webcam Live</span>
                      {inputMode === 'webcam' && <span className="source-active-dot" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onChangeInputMode('sample');
                        closeSheet();
                      }}
                      className={`sheet-source-card ${inputMode === 'sample' ? 'active' : ''}`}
                    >
                      <div className="source-card-icon-box">
                        <Video size={18} />
                      </div>
                      <span className="source-card-name">Video Sampel</span>
                      {inputMode === 'sample' && <span className="source-active-dot" />}
                    </button>

                    <label className={`sheet-source-card ${inputMode === 'upload' ? 'active' : ''}`}>
                      <div className="source-card-icon-box">
                        <Upload size={18} />
                      </div>
                      <span className="source-card-name">Upload File</span>
                      {inputMode === 'upload' && <span className="source-active-dot" />}
                      <input
                        type="file"
                        accept="video/mp4,video/webm"
                        onChange={(e) => {
                          onFileUpload?.(e);
                          closeSheet();
                        }}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>

                  {inputMode === 'sample' && (
                    <div className="sheet-subgroup">
                      <span className="sheet-group-label">Pilih Klip Sampel Dataset (13 Video)</span>
                      <div className="sheet-select-wrapper">
                        <select
                          value={sampleVideo}
                          onChange={(e) => onChangeSampleVideo?.(e.target.value)}
                          className="sheet-select-input"
                        >
                          <option value="/videos/blinking_0.mp4">blinking_0.mp4 (Subject 0)</option>
                          <option value="/videos/blinking_1.mp4">blinking_1.mp4 (Subject 1)</option>
                          <option value="/videos/blinking_2.mp4">blinking_2.mp4 (Subject 2 - Male)</option>
                          <option value="/videos/blinking_3.mp4">blinking_3.mp4 (Subject 3 - Female)</option>
                          <option value="/videos/blinking_4.mp4">blinking_4.mp4 (Subject 4)</option>
                          <option value="/videos/blinking_5.mp4">blinking_5.mp4 (Subject 5)</option>
                          <option value="/videos/blinking_6.mp4">blinking_6.mp4 (Subject 6)</option>
                          <option value="/videos/blinking_7.mp4">blinking_7.mp4 (Subject 7)</option>
                          <option value="/videos/blinking_8.mp4">blinking_8.mp4 (Subject 8)</option>
                          <option value="/videos/blinking_9.mp4">blinking_9.mp4 (Subject 9)</option>
                          <option value="/videos/blinking_10.mp4">blinking_10.mp4 (Subject 10)</option>
                          <option value="/videos/blinking_11.mp4">blinking_11.mp4 (Subject 11)</option>
                          <option value="/videos/blinking_12.mp4">blinking_12.mp4 (Subject 12)</option>
                        </select>
                        <ChevronRight size={14} className="select-arrow-icon" />
                      </div>
                    </div>
                  )}

                  {inputMode === 'webcam' && (
                    <div className="sheet-vertical-actions" style={{ marginTop: 6 }}>
                      <button
                        type="button"
                        onClick={onToggleMirror}
                        className={`sheet-action-card ${mirrorCamera ? 'active' : ''}`}
                      >
                        <div className="sheet-card-left">
                          <div className="sheet-icon-pill tint-rose">
                            <FlipHorizontal size={18} />
                          </div>
                          <div className="sheet-card-text">
                            <span className="sheet-card-title">Cerminkan Kamera (Mirror)</span>
                            <span className="sheet-card-desc">Tampilan kamera seperti cermin selfie natural</span>
                          </div>
                        </div>
                        <div className={`sheet-toggle-switch ${mirrorCamera ? 'on' : 'off'}`}>
                          <div className="switch-thumb" />
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4 CONTENT: SENSITIVITAS & OVERLAY */}
              {activeSheet === 'sensitivity' && (
                <div className="sheet-content-group">
                  <span className="sheet-group-label">Ambang Batas EAR (Threshold Cutoff)</span>
                  <div className="sheet-stepper-box">
                    <button
                      type="button"
                      onClick={() => onAdjustThreshold(-0.01)}
                      className="sheet-stepper-btn minus"
                      title="Turunkan Threshold (-0.01)"
                    >
                      <Minus size={20} />
                    </button>
                    <div className="sheet-stepper-display">
                      <span className="sheet-stepper-val">{threshold.toFixed(3)}</span>
                      <span className="sheet-stepper-sub">Default: 0.220 • Presisi ±0.01</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onAdjustThreshold(0.01)}
                      className="sheet-stepper-btn plus"
                      title="Naikkan Threshold (+0.01)"
                    >
                      <Plus size={20} />
                    </button>
                  </div>

                  <span className="sheet-group-label" style={{ marginTop: 14 }}>Preset Khusus & Visualisasi</span>
                  <div className="sheet-vertical-actions">
                    <button
                      type="button"
                      onClick={() => onAdjustThreshold(threshold > 0.25 ? -0.06 : 0.06, true)}
                      className={`sheet-action-card ${threshold <= 0.24 ? 'active' : ''}`}
                    >
                      <div className="sheet-card-left">
                        <div className="sheet-icon-pill tint-cyan">
                          <Glasses size={18} />
                        </div>
                        <div className="sheet-card-text">
                          <span className="sheet-card-title">Profil Pengguna Kacamata</span>
                          <span className="sheet-card-desc">Threshold dioptimalkan untuk bingkai lensa (0.210)</span>
                        </div>
                      </div>
                      <div className={`sheet-toggle-switch ${threshold <= 0.24 ? 'on' : 'off'}`}>
                        <div className="switch-thumb" />
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={onToggleLandmarks}
                      className={`sheet-action-card ${showLandmarks ? 'active' : ''}`}
                    >
                      <div className="sheet-card-left">
                        <div className="sheet-icon-pill tint-emerald">
                          <Eye size={18} />
                        </div>
                        <div className="sheet-card-text">
                          <span className="sheet-card-title">Visualisasi Landmark Mata</span>
                          <span className="sheet-card-desc">Garis kontur 6-titik dan chord vertikal/horizontal</span>
                        </div>
                      </div>
                      <div className={`sheet-toggle-switch ${showLandmarks ? 'on' : 'off'}`}>
                        <div className="switch-thumb" />
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={onToggleHaarRoi}
                      className={`sheet-action-card ${showHaarRoi ? 'active' : ''}`}
                    >
                      <div className="sheet-card-left">
                        <div className="sheet-icon-pill tint-purple">
                          <Scan size={18} />
                        </div>
                        <div className="sheet-card-text">
                          <span className="sheet-card-title">Haar Cascade ROI Box</span>
                          <span className="sheet-card-desc">Bounding box deteksi mata (Algoritma Klasik)</span>
                        </div>
                      </div>
                      <div className={`sheet-toggle-switch ${showHaarRoi ? 'on' : 'off'}`}>
                        <div className="switch-thumb" />
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 5 CONTENT: PiP & DATA */}
              {activeSheet === 'data' && (
                <div className="sheet-content-group">
                  <span className="sheet-group-label">Hasil Analisis &amp; Kontrol Sesi</span>
                  <div className="sheet-vertical-actions">
                    {/* Item 0: Lihat Hasil Analisis (Next Page) */}
                    <button
                      type="button"
                      onClick={() => {
                        closeSheet();
                        onViewChange?.('results');
                      }}
                      className="sheet-action-card hover-emerald"
                    >
                      <div className="sheet-card-left">
                        <div className="sheet-icon-pill tint-cyan">
                          <FileBarChart2 size={18} />
                        </div>
                        <div className="sheet-card-text">
                          <span className="sheet-card-title">Lihat Hasil Analisis (Next Page)</span>
                          <span className="sheet-card-desc">Buka kartu nama pasien, tabel per menit &amp; diagnosa AI</span>
                        </div>
                      </div>
                      <div className="sheet-action-pill emerald">
                        <span>Buka</span>
                        <ChevronRight size={13} />
                      </div>
                    </button>

                    {/* Pause / Resume Session */}
                    <button
                      type="button"
                      onClick={() => {
                        onTogglePause?.();
                        closeSheet();
                      }}
                      className={`sheet-action-card ${isSessionPaused ? 'active' : ''}`}
                    >
                      <div className="sheet-card-left">
                        <div className="sheet-icon-pill tint-amber">
                          {isSessionPaused ? <Play size={18} /> : <Pause size={18} />}
                        </div>
                        <div className="sheet-card-text">
                          <span className="sheet-card-title">
                            {isSessionPaused ? 'Lanjutkan Sesi Deteksi' : 'Jeda Sesi (Pause)'}
                          </span>
                          <span className="sheet-card-desc">
                            {isSessionPaused ? 'Aktifkan kembali timer 1 menit & kamera' : 'Hentikan sementara timer 1 menit & alert'}
                          </span>
                        </div>
                      </div>
                      <div className="sheet-action-pill amber">
                        <span>{isSessionPaused ? 'Lanjut' : 'Pause'}</span>
                      </div>
                    </button>

                    {/* Item 1: PiP Background Toggle */}
                    <button
                      type="button"
                      onClick={() => {
                        onTogglePip?.();
                        closeSheet();
                      }}
                      className={`sheet-action-card ${isPipActive ? 'active' : ''}`}
                    >
                      <div className="sheet-card-left">
                        <div className="sheet-icon-pill tint-indigo">
                          <PictureInPicture2 size={18} />
                        </div>
                        <div className="sheet-card-text">
                          <span className="sheet-card-title">Mode Mengambang (PiP Background)</span>
                          <span className="sheet-card-desc">Deteksi tetap aktif di layar kecil saat membuka tab/aplikasi lain</span>
                        </div>
                      </div>
                      <div className={`sheet-toggle-switch ${isPipActive ? 'on' : 'off'}`}>
                        <div className="switch-thumb" />
                      </div>
                    </button>

                    {/* Item 2: Reset Metrics */}
                    <button
                      type="button"
                      onClick={() => {
                        onReset?.();
                        closeSheet();
                      }}
                      className="sheet-action-card hover-amber"
                    >
                      <div className="sheet-card-left">
                        <div className="sheet-icon-pill tint-amber">
                          <RotateCcw size={18} />
                        </div>
                        <div className="sheet-card-text">
                          <span className="sheet-card-title">Reset Metrik & Hitungan Kedipan</span>
                          <span className="sheet-card-desc">Kembalikan counter kedipan dan durasi waktu ke 0</span>
                        </div>
                      </div>
                      <div className="sheet-action-pill amber">
                        <span>Reset</span>
                      </div>
                    </button>

                    {/* Item 3: Export CSV */}
                    <button
                      type="button"
                      onClick={() => {
                        onExportCSV?.();
                        closeSheet();
                      }}
                      className="sheet-action-card hover-emerald"
                    >
                      <div className="sheet-card-left">
                        <div className="sheet-icon-pill tint-emerald">
                          <Download size={18} />
                        </div>
                        <div className="sheet-card-text">
                          <span className="sheet-card-title">Ekspor Telemetri CSV</span>
                          <span className="sheet-card-desc">Unduh log data rasio EAR dan catatan kedipan per frame</span>
                        </div>
                      </div>
                      <div className="sheet-action-pill emerald">
                        <span>Unduh CSV</span>
                        <ChevronRight size={13} />
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modern 5-Item Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-navbar" aria-label="Mobile Navigation">
        {/* Item 1: Home */}
        <button
          type="button"
          onClick={() => {
            closeSheet();
            onViewChange?.('landing');
          }}
          className="mobile-nav-btn"
          id="m-nav-home"
        >
          <Home size={19} />
          <span className="mobile-nav-label">Home</span>
        </button>

        {/* Item 2: Kamera & Mode */}
        <button
          type="button"
          onClick={() => handleTabClick('camera')}
          className={`mobile-nav-btn ${activeSheet === 'camera' ? 'active' : ''}`}
          id="m-nav-camera"
        >
          <Camera size={19} />
          <span className="mobile-nav-label">Kamera</span>
        </button>

        {/* Item 3: Center Elevated Calibration Action */}
        <button
          type="button"
          onClick={() => {
            closeSheet();
            onStartCalibration?.();
          }}
          disabled={isCalibrating}
          className={`mobile-nav-btn mobile-nav-center-item ${isCalibrating ? 'calibrating' : ''}`}
          title="Mulai kalibrasi otomatis 3 detik"
          id="m-nav-calibrate"
        >
          <div className="mobile-nav-fab-bubble">
            {isCalibrating ? (
              <span className="fab-countdown-num">{calibrateCountdown}s</span>
            ) : (
              <Crosshair size={22} className="fab-icon" />
            )}
          </div>
          <span className="mobile-nav-label center-label">
            {isCalibrating ? `${calibrateCountdown}s...` : 'Kalibrasi'}
          </span>
        </button>

        {/* Item 4: Sensitivitas & EAR */}
        <button
          type="button"
          onClick={() => handleTabClick('sensitivity')}
          className={`mobile-nav-btn ${activeSheet === 'sensitivity' ? 'active' : ''}`}
          id="m-nav-sensitivity"
        >
          <Sliders size={19} />
          <span className="mobile-nav-label">Sensitivitas</span>
        </button>

        {/* Item 5: PiP & Data */}
        <button
          type="button"
          onClick={() => handleTabClick('data')}
          className={`mobile-nav-btn ${activeSheet === 'data' ? 'active' : ''}`}
          id="m-nav-data"
        >
          <Layers size={19} />
          <span className="mobile-nav-label">Data & PiP</span>
        </button>
      </nav>
    </>
  );
}
