import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import OcularVisionLogo from './ui/OcularVisionLogo';

export default function WelcomeOpening({ username, onFinish }) {
  const [progress, setProgress] = useState(25);
  const [status, setStatus] = useState('Menghubungkan kamera...');

  // Format username nicely: capitalize first letter
  const displayName = username
    ? username.charAt(0).toUpperCase() + username.slice(1)
    : 'Jason';

  useEffect(() => {
    const t1 = setTimeout(() => {
      setProgress(60);
      setStatus('Memuat model deteksi mata...');
    }, 400);

    const t2 = setTimeout(() => {
      setProgress(88);
      setStatus('Mengalibrasi deteksi kedipan...');
    }, 950);

    const t3 = setTimeout(() => {
      setProgress(100);
      setStatus('Sistem siap');
    }, 1450);

    const t4 = setTimeout(() => {
      onFinish();
    }, 2100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onFinish]);

  return (
    <div className="welcome-opening-stage" role="dialog" aria-modal="true" aria-label="Loading Screen">
      {/* Subtle ambient backglow */}
      <div className="welcome-ambient-soft" />

      {/* Clean Premium Modal Card */}
      <div className="welcome-modal-card">
        {/* Emblem Squircle */}
        <div className="welcome-squircle-icon">
          <OcularVisionLogo size={30} color="#f43f5e" />
        </div>

        {/* Greeting & Title */}
        <div className="welcome-text-group">
          <span className="welcome-greeting-label">Selamat Datang,</span>
          <h1 className="welcome-operator-name">{displayName}</h1>
          <p className="welcome-subtitle">
            Menyiapkan kamera live dan telemetri kedipan mata secara real-time.
          </p>
        </div>

        {/* Minimal Progress Meter */}
        <div className="welcome-meter-section">
          <div className="welcome-meter-header">
            <span className="welcome-status-text">{status}</span>
            <span className="welcome-pct-text">{progress}%</span>
          </div>
          <div className="welcome-track">
            <div
              className="welcome-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onFinish}
          className="welcome-action-btn"
          type="button"
          id="btn-skip-welcome-intro"
        >
          <span>Masuk ke Studio</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
