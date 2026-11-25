import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import OcularVisionLogo from './ui/OcularVisionLogo';

export default function WelcomeOpening({ username, isEngineReady = true, onFinish }) {
  const [progress, setProgress] = useState(0);

  const displayName = username
    ? username.charAt(0).toUpperCase() + username.slice(1)
    : 'Jason';

  useEffect(() => {
    const duration = 1800;
    const start = performance.now();
    let rafId;
    let finishTimer;

    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(Math.round(eased * 100));

      if (t < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        finishTimer = setTimeout(() => {
          onFinish();
        }, 320);
      }
    };

    rafId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(rafId);
      if (finishTimer) clearTimeout(finishTimer);
    };
  }, [onFinish]);

  const isComplete = progress >= 100;
  const statusLabel = isComplete
    ? 'Siap'
    : isEngineReady
      ? 'Menyiapkan kamera...'
      : 'Memuat deteksi wajah...';

  return (
    <div
      className="lux-welcome-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Memuat Eye Blink Detection System"
    >
      <div className="lux-welcome-card">
        <div className="lux-clinic-label">Jason Istioso&apos;s Clinic</div>

        <div className={`lux-eye-mark ${isComplete ? 'ready' : ''}`}>
          <OcularVisionLogo size={26} color={isComplete ? '#34d399' : '#f8fafc'} />
        </div>

        <h1 className="lux-welcome-name">Halo, {displayName}</h1>
        <p className="lux-welcome-desc">{statusLabel}</p>

        <div className="lux-progress-rail">
          <div
            className={`lux-progress-bar ${isComplete ? 'ready' : ''}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <button
          onClick={onFinish}
          className="lux-skip-btn"
          type="button"
          id="btn-skip-welcome-intro"
        >
          <span>Masuk ke Studio</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
