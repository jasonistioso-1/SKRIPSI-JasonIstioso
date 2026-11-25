import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  ArrowRight,
  Eye,
  Home,
  IdCard
} from 'lucide-react';
import LandingFooter from './LandingFooter';
import AnimatedChalkDoodle from './AnimatedChalkDoodle';
import BusinessCard from './ui/holographic-business-card';
import OcularVisionLogo from './ui/OcularVisionLogo';

// Marvel Style Moving Video Card (Panel Film / Komik Marvel - Berjalan Otomatis, Murni Video Bergerak)
// Moving Video Panel - Clicking any video opens simple real-time tracking & EAR wave
function MarvelVideoPanel({ previewPath, fullVideoPath, onSelectVideo }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    el.defaultMuted = true;
    el.muted = true;
    el.playsInline = true;

    const ensurePlay = () => {
      if (el.paused) {
        const p = el.play();
        if (p !== undefined) {
          p.catch(() => {});
        }
      }
    };

    ensurePlay();
    const timer = setInterval(ensurePlay, 1000);
    return () => clearInterval(timer);
  }, [previewPath]);

  return (
    <div
      className="stream-card marvel-card marvel-card-active"
      onClick={() => onSelectVideo?.(fullVideoPath)}
      onMouseEnter={() => {
        const el = videoRef.current;
        if (el && el.paused) el.play().catch(() => {});
      }}
      title="Click to view real-time eye tracking & EAR oscilloscope"
      style={{ cursor: 'pointer' }}
    >
      <div className="marvel-film-sprockets top" />
      <video
        ref={videoRef}
        src={previewPath}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="stream-card-video"
        onCanPlay={(e) => {
          e.currentTarget.muted = true;
          e.currentTarget.play().catch(() => {});
        }}
        onLoadedData={(e) => {
          e.currentTarget.muted = true;
          e.currentTarget.play().catch(() => {});
        }}
      />
      <div className="marvel-card-frame" />
      <div className="marvel-film-sprockets bottom" />
    </div>
  );
}

// Signature Jason Istioso Living Chalk Doodle Brand Showcase
function JasonIstiosoDoodleLockup() {
  return (
    <div className="hero-jason-doodle-wrapper">
      <AnimatedChalkDoodle className="hero-chalk-doodle" />
    </div>
  );
}

const HERO_TITLE_CONFIG = [
  { word: 'EYE', baseDelay: 0.22 },
  { word: 'BLINK', baseDelay: 0.50 },
  { word: 'DETECTION', baseDelay: 0.80 },
  { word: 'SYSTEM', baseDelay: 1.18 },
];

export default function LandingPage({ onLaunchStudio, onSelectVideo, onStartLiveCamera, username = '' }) {
  const [isStreamPaused, setIsStreamPaused] = useState(false);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Global watchdog to ensure all videos awaken on any user scroll or touch
  useEffect(() => {
    const playAllVideos = () => {
      document.querySelectorAll('.stream-card-video').forEach((v) => {
        if (v && v.paused) {
          v.defaultMuted = true;
          v.muted = true;
          v.play().catch(() => {});
        }
      });
    };

    window.addEventListener('pointerdown', playAllVideos, { passive: true });
    window.addEventListener('touchstart', playAllVideos, { passive: true });
    window.addEventListener('scroll', playAllVideos, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', playAllVideos);
      window.removeEventListener('touchstart', playAllVideos);
      window.removeEventListener('scroll', playAllVideos);
    };
  }, []);

  // Rel Kiri: 7 Video Unik (Subjek berbeda-beda, 0 duplikasi, klip aktif bergerak dan berkedip, ter-crop ke wajah & mata)
  const leftRailVideos = [
    { id: 'left_0', previewPath: '/videos/preview_blinking_0.mp4?v=4', fullVideoPath: '/videos/blinking_0.mp4' },
    { id: 'left_1', previewPath: '/videos/preview_blinking_1.mp4?v=4', fullVideoPath: '/videos/blinking_1.mp4' },
    { id: 'left_3', previewPath: '/videos/preview_blinking_3.mp4?v=4', fullVideoPath: '/videos/blinking_3.mp4' },
    { id: 'left_5', previewPath: '/videos/preview_blinking_5.mp4?v=4', fullVideoPath: '/videos/blinking_5.mp4' },
    { id: 'left_7', previewPath: '/videos/preview_blinking_7.mp4?v=4', fullVideoPath: '/videos/blinking_7.mp4' },
    { id: 'left_9', previewPath: '/videos/preview_blinking_9.mp4?v=4', fullVideoPath: '/videos/blinking_9.mp4' },
    { id: 'left_11', previewPath: '/videos/preview_blinking_11.mp4?v=4', fullVideoPath: '/videos/blinking_11.mp4' },
  ];

  // Rel Kanan: 6 Video Unik Lainnya (100% berbeda dari sisi kiri, klip aktif bergerak dan berkedip, ter-crop ke wajah & mata)
  const rightRailVideos = [
    { id: 'right_2', previewPath: '/videos/preview_blinking_2.mp4?v=4', fullVideoPath: '/videos/blinking_2.mp4' },
    { id: 'right_4', previewPath: '/videos/preview_blinking_4.mp4?v=4', fullVideoPath: '/videos/blinking_4.mp4' },
    { id: 'right_6', previewPath: '/videos/preview_blinking_6.mp4?v=4', fullVideoPath: '/videos/blinking_6.mp4' },
    { id: 'right_8', previewPath: '/videos/preview_blinking_8.mp4?v=4', fullVideoPath: '/videos/blinking_8.mp4' },
    { id: 'right_10', previewPath: '/videos/preview_blinking_10.mp4?v=4', fullVideoPath: '/videos/blinking_10.mp4' },
    { id: 'right_12', previewPath: '/videos/preview_blinking_12.mp4?v=4', fullVideoPath: '/videos/blinking_12.mp4' },
  ];

  // Loop continuous stream
  const leftStreamLoop = [...leftRailVideos, ...leftRailVideos];
  const rightStreamLoop = [...rightRailVideos, ...rightRailVideos];

  return (
    <div className="landing-fullpage-wrapper marvel-universe-wrapper">
      {/* ========================================================
          STICKY CINEMATIC LANDING NAVBAR
          ======================================================== */}
      <header className="landing-top-navbar">
        <div className="landing-nav-brand" onClick={() => scrollToSection('hero')}>
          <div className="landing-brand-icon" title="Ocular EAR Computer Vision System">
            <OcularVisionLogo size={20} />
          </div>
          <div className="landing-brand-text">
            <span className="brand-name">JASON ISTIOSO</span>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="landing-nav-menu">
          <button
            onClick={() => scrollToSection('hero')}
            className="landing-nav-item"
            id="nav-link-home"
          >
            <Home size={14} />
            <span>Home</span>
          </button>
          <button
            onClick={() => scrollToSection('creator-card')}
            className="landing-nav-item"
            id="nav-link-card"
          >
            <IdCard size={14} />
            <span>Namecard</span>
          </button>
        </nav>
      </header>

      {/* ========================================================
          CINEMATIC 3D PERSPECTIVE STREAM HERO STAGE
          ======================================================== */}
      <section id="hero" className="image-stream-hero-section pure-hero-view marvel-stage">
        {/* Cinematic Ambient Glow Backdrops & Lens Flare */}
        <div className="hero-radial-glow jason-glow-cyan" />
        <div className="hero-radial-glow jason-glow-indigo" />
        <div className="jason-anamorphic-flare" />
        <div className="hero-grid-pattern marvel-grid" />

        {/* 3D Perspective Stage Layout (Dual-Sided Corridor) */}
        <div className="stream-perspective-wrapper">
          {/* Left Streaming Perspective Rail (Dataset Panels Moving Upwards) */}
          <div
            className={`stream-rail stream-rail-left ${isStreamPaused ? 'paused' : ''}`}
            title="Left Rail (Active dataset video panels)"
          >
            <div className="stream-track stream-track-up">
              {leftStreamLoop.map((card, idx) => (
                <MarvelVideoPanel
                  key={`${card.id}-left-${idx}`}
                  previewPath={card.previewPath}
                  fullVideoPath={card.fullVideoPath}
                  onSelectVideo={onSelectVideo}
                />
              ))}
            </div>
          </div>

          {/* Center Jason Istioso Signature Branding & Main Title */}
          <div className="stream-hero-center-content marvel-center-content relative z-10">
            {/* The Signature Jason Istioso Chalk Doodle Artwork */}
            <JasonIstiosoDoodleLockup />

            {/* Main Cinematic Title with Word & Character Staggered Fade-In Reveal */}
            <div className="marvel-main-title-wrap">
              <h1 className="marvel-title-heavy" aria-label="EYE BLINK DETECTION SYSTEM">
                {HERO_TITLE_CONFIG.map((item) => (
                  <span
                    key={item.word}
                    className="hero-fade-word"
                    style={{ animationDelay: `${item.baseDelay}s` }}
                  >
                    <span className="hero-word-inner">
                      {item.word.split('').map((char, charIdx) => (
                        <span
                          key={`${item.word}-${charIdx}`}
                          className="hero-fade-char"
                          style={{
                            animationDelay: `${(item.baseDelay + charIdx * 0.035).toFixed(3)}s`,
                          }}
                        >
                          {char}
                        </span>
                      ))}
                    </span>
                  </span>
                ))}
              </h1>
              <div className="marvel-title-sheen" />
            </div>

            {/* Hero Action Buttons */}
            <div className="stream-hero-actions marvel-action-group">
              <button
                onClick={() => onStartLiveCamera ? onStartLiveCamera() : onLaunchStudio('/videos/blinking_1.mp4', 'webcam')}
                className="stream-cta-primary marvel-btn-primary"
                id="btn-start-camera"
              >
                <Camera size={19} />
                <span>START LIVE CAMERA TEST</span>
                <ArrowRight size={17} />
              </button>
            </div>
          </div>

          {/* Right Streaming Perspective Rail (Dataset Panels Moving Downwards) */}
          <div
            className={`stream-rail stream-rail-right ${isStreamPaused ? 'paused' : ''}`}
            title="Right Rail (Active dataset video panels)"
          >
            <div className="stream-track stream-track-down">
              {rightStreamLoop.map((card, idx) => (
                <MarvelVideoPanel
                  key={`${card.id}-right-${idx}`}
                  previewPath={card.previewPath}
                  fullVideoPath={card.fullVideoPath}
                  onSelectVideo={onSelectVideo}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          HOLOGRAPHIC BUSINESSCARD & GITHUB QR SECTION
          ======================================================== */}
      <section id="creator-card" className="creator-card-section">
        <div className="creator-card-ambient-glow" />
        <div className="creator-card-container">
          <div className="creator-card-stage">
            <BusinessCard effect="shards" intensity={0.38} />
          </div>
        </div>
      </section>

      {/* ========================================================
          CINEMATIC LANDING FOOTER
          ======================================================== */}
      <LandingFooter onStartLiveCamera={onStartLiveCamera} />
    </div>
  );
}
