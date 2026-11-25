import React, { useState, useEffect } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import OcularVisionLogo from './ui/OcularVisionLogo';

export default function WelcomeOpening({ username, onFinish }) {
  const [progress, setProgress] = useState(0);

  const displayName = username
    ? username.charAt(0).toUpperCase() + username.slice(1)
    : 'Jason';

  useEffect(() => {
    const duration = 2200;
    const start = performance.now();
    let rafId;
    let finishTimer;

    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      // Smooth easeOutCubic curve
      const eased = 1 - Math.pow(1 - t, 3);
      const pct = Math.round(eased * 100);
      setProgress(pct);

      if (t < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        finishTimer = setTimeout(() => {
          onFinish();
        }, 420);
      }
    };

    rafId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(rafId);
      if (finishTimer) clearTimeout(finishTimer);
    };
  }, [onFinish]);

  const statusText =
    progress < 35
      ? 'Menghubungkan perangkat kamera...'
      : progress < 72
        ? 'Memuat model deteksi wajah & EAR...'
        : progress < 98
          ? 'Menyiapkan timer evaluasi 1 menit...'
          : 'Sistem siap digunakan';

  const steps = [
    { label: 'Kamera Live', done: progress >= 32 },
    { label: 'Deteksi EAR', done: progress >= 68 },
    { label: 'Timer 1 Menit', done: progress >= 95 },
  ];

  const isComplete = progress >= 100;

  return (
    <div
      className="welcome-opening-stage"
      role="dialog"
      aria-modal="true"
      aria-label="Memuat Eye Blink Detection System"
    >
      <div className="welcome-ambient-soft" />

      <div className="welcome-modal-card">
        {/* Top Clinic / System Pill */}
        <div className="welcome-clinic-pill">
          <span>Jason Istioso&apos;s Clinic</span>
          <span className="welcome-pill-sep">•</span>
          <span>Eye Blink Detection System</span>
        </div>

        {/* Animated Precision Eye Reticle */}
        <div className={`welcome-reticle-wrap ${isComplete ? 'ready' : ''}`}>
          <div className="welcome-reticle-ring outer" />
          <div className="welcome-reticle-ring inner" />
          <div className="welcome-squircle-icon">
            <OcularVisionLogo size={30} color={isComplete ? '#34d399' : '#38bdf8'} />
          </div>
        </div>

        {/* Greeting & Title */}
        <div className="welcome-text-group">
          <span className="welcome-greeting-label">Selamat Datang</span>
          <h1 className="welcome-operator-name">{displayName}</h1>
          <p className="welcome-subtitle">
            Menyiapkan sesi pemantauan kedipan mata dan analisis standar per menit.
          </p>
        </div>

        {/* Smooth Progress Meter */}
        <div className="welcome-meter-section">
          <div className="welcome-meter-header">
            <span className="welcome-status-text">{statusText}</span>
            <span className={`welcome-pct-text ${isComplete ? 'ready' : ''}`}>
              {progress}%
            </span>
          </div>
          <div className="welcome-track">
            <div
              className={`welcome-fill ${isComplete ? 'ready' : ''}`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Minimal 3-Step Readiness Pills */}
          <div className="welcome-steps-row">
            {steps.map((s) => (
              <div key={s.label} className={`welcome-step-chip ${s.done ? 'done' : ''}`}>
                <span className="welcome-step-dot">
                  {s.done ? <Check size={10} strokeWidth={3} /> : null}
                </span>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onFinish}
          className={`welcome-action-btn ${isComplete ? 'ready' : ''}`}
          type="button"
          id="btn-skip-welcome-intro"
        >
          <span>{isComplete ? 'Masuk ke Studio' : 'Lewati & Masuk Studio'}</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
