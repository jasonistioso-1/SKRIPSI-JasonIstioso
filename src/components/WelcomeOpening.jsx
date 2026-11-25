import React, { useState, useEffect } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import OcularVisionLogo from './ui/OcularVisionLogo';

export default function WelcomeOpening({ username, isEngineReady = true, onFinish }) {
  const [progress, setProgress] = useState(0);

  const displayName = username
    ? username.charAt(0).toUpperCase() + username.slice(1)
    : 'Jason';

  useEffect(() => {
    const duration = 2400;
    const start = performance.now();
    let rafId;
    let finishTimer;

    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      // Smooth quintic ease-out for luxury deceleration
      const eased = 1 - Math.pow(1 - t, 4);
      const pct = Math.round(eased * 100);
      setProgress(pct);

      if (t < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        finishTimer = setTimeout(() => {
          onFinish();
        }, 480);
      }
    };

    rafId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(rafId);
      if (finishTimer) clearTimeout(finishTimer);
    };
  }, [onFinish]);

  const isComplete = progress >= 100;

  const statusText =
    progress < 34
      ? 'Menghubungkan kamera live...'
      : progress < 72
        ? isEngineReady
          ? 'Mengkalibrasi deteksi landmark mata...'
          : 'Memuat model deteksi wajah...'
        : progress < 100
          ? 'Mengaktifkan monitor 1 menit...'
          : 'Semua sistem siap';

  const stages = [
    { label: 'Kamera', done: progress >= 30 },
    { label: 'Face Mesh', done: progress >= 68 },
    { label: 'Standar 1 Menit', done: progress >= 95 },
  ];

  // SVG circular gauge geometry
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <div
      className="lux-welcome-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Memuat Eye Blink Detection System"
    >
      {/* Architectural ambient light & hairline grid */}
      <div className="lux-welcome-grid" />
      <div className="lux-welcome-glow" />

      <div className={`lux-welcome-card ${isComplete ? 'is-ready' : ''}`}>
        {/* Top Monogram Clinic Pill */}
        <div className="lux-clinic-tag">
          <span className={`lux-status-dot ${isComplete ? 'ready' : ''}`} />
          <span>JASON ISTIOSO&apos;S CLINIC</span>
          <span className="lux-tag-sep">/</span>
          <span>EYE BLINK DETECTION SYSTEM</span>
        </div>

        {/* Precision SVG Radial Iris Gauge */}
        <div className={`lux-iris-stage ${isComplete ? 'ready' : ''}`}>
          <svg className="lux-iris-svg" viewBox="0 0 100 100" aria-hidden="true">
            {/* Subtle outer track */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="rgba(255, 255, 255, 0.07)"
              strokeWidth="2.5"
            />
            {/* Tick marks */}
            <circle
              cx="50"
              cy="50"
              r="34"
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
              strokeDasharray="1.5 4.5"
            />
            {/* Animated progress arc */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={isComplete ? '#34d399' : '#38bdf8'}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 50 50)"
              style={{
                filter: isComplete
                  ? 'drop-shadow(0 0 8px rgba(52, 211, 153, 0.55))'
                  : 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.5))',
                transition: 'stroke 0.3s ease',
              }}
            />
          </svg>

          <div className="lux-iris-core">
            <OcularVisionLogo size={28} color={isComplete ? '#34d399' : '#e2e8f0'} />
          </div>
        </div>

        {/* Personalized Greeting */}
        <div className="lux-welcome-copy">
          <span className="lux-welcome-kicker">Selamat Datang</span>
          <h1 className="lux-welcome-name">{displayName}</h1>
          <p className="lux-welcome-desc">
            Menyiapkan sesi kamera live dan analisis kedipan mata secara real-time.
          </p>
        </div>

        {/* Progress Meter & Connected Pipeline */}
        <div className="lux-progress-block">
          <div className="lux-progress-head">
            <span className="lux-progress-status">{statusText}</span>
            <span className={`lux-progress-pct ${isComplete ? 'ready' : ''}`}>{progress}%</span>
          </div>

          <div className="lux-progress-rail">
            <div
              className={`lux-progress-bar ${isComplete ? 'ready' : ''}`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="lux-pipeline-row">
            {stages.map((st, idx) => (
              <React.Fragment key={st.label}>
                <div className={`lux-stage-pill ${st.done ? 'done' : ''}`}>
                  <span className="lux-stage-icon">
                    {st.done ? <Check size={9} strokeWidth={3} /> : <span className="lux-stage-num">{idx + 1}</span>}
                  </span>
                  <span>{st.label}</span>
                </div>
                {idx < stages.length - 1 && (
                  <div className={`lux-stage-line ${st.done ? 'done' : ''}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Platinum Contrast CTA */}
        <button
          onClick={onFinish}
          className={`lux-enter-btn ${isComplete ? 'ready' : ''}`}
          type="button"
          id="btn-skip-welcome-intro"
        >
          <span>{isComplete ? 'Masuk ke Studio' : 'Lewati & Masuk Studio'}</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
