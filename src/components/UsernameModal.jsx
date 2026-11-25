import React, { useState, useEffect, useRef } from 'react';
import { User, X, ArrowRight, RotateCcw } from 'lucide-react';

const INITIAL_BADGES = [
  {
    id: 'google',
    name: 'Google',
    anim: 'floating-anim-1',
    defaultPos: { top: '8%', left: '6%' },
    renderIcon: () => (
      <svg viewBox="0 0 24 24" className="floating-svg-icon" fill="none">
        <path d="M21.9999 12.24C21.9999 11.4933 21.9333 10.76 21.8066 10.0533H12.3333V14.16H17.9533C17.7333 15.3467 17.0133 16.3733 15.9666 17.08V19.68H19.5266C21.1933 18.16 21.9999 15.4533 21.9999 12.24Z" fill="#4285F4"/>
        <path d="M12.3333 22C15.2333 22 17.6866 21.0533 19.5266 19.68L15.9666 17.08C15.0199 17.7333 13.7933 18.16 12.3333 18.16C9.52659 18.16 7.14659 16.28 6.27992 13.84H2.59326V16.5133C4.38659 20.0267 8.05992 22 12.3333 22Z" fill="#34A853"/>
        <path d="M6.2799 13.84C6.07324 13.2267 5.9599 12.58 5.9599 11.92C5.9599 11.26 6.07324 10.6133 6.2799 10L2.59326 7.32667C1.86659 8.78667 1.45326 10.32 1.45326 11.92C1.45326 13.52 1.86659 15.0533 2.59326 16.5133L6.2799 13.84Z" fill="#FBBC05"/>
        <path d="M12.3333 5.68C13.8933 5.68 15.3133 6.22667 16.3866 7.24L19.6 4.02667C17.68 2.29333 15.2266 1.33333 12.3333 1.33333C8.05992 1.33333 4.38659 3.97333 2.59326 7.32667L6.2799 10C7.14659 7.56 9.52659 5.68 12.3333 5.68Z" fill="#EA4335"/>
      </svg>
    )
  },
  {
    id: 'github',
    name: 'GitHub',
    anim: 'floating-anim-2',
    defaultPos: { top: '30%', left: '12%' },
    renderIcon: () => (
      <svg viewBox="0 0 24 24" className="floating-svg-icon" fill="currentColor" color="#ffffff">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
      </svg>
    )
  },
  {
    id: 'speech',
    name: 'Messages',
    anim: 'floating-anim-3',
    defaultPos: { top: '53%', left: '6%' },
    renderIcon: () => (
      <svg viewBox="0 0 24 24" className="floating-svg-icon" fill="#6366f1">
        <rect x="2" y="3.5" width="20" height="13" rx="4" fill="#6366f1"/>
        <path d="M6 7.5h12M6 11.5h8" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
        <polygon points="6,16.5 6,20.5 11,16.5" fill="#6366f1"/>
      </svg>
    )
  },
  {
    id: 'youtube',
    name: 'YouTube',
    anim: 'floating-anim-1',
    defaultPos: { top: '74%', left: '13%' },
    renderIcon: () => (
      <svg viewBox="0 0 24 24" className="floating-svg-icon" fill="#FF0000">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    )
  },
  {
    id: 'spotify',
    name: 'Spotify',
    anim: 'floating-anim-2',
    defaultPos: { bottom: '8%', left: '5%' },
    renderIcon: () => (
      <svg viewBox="0 0 24 24" className="floating-svg-icon" fill="#1DB954">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.503 17.308a.747.747 0 0 1-1.028.248c-2.813-1.718-6.353-2.107-10.523-1.155a.75.75 0 0 1-.336-1.462c4.568-1.042 8.49-.6 11.64 1.341a.749.749 0 0 1 .247 1.028zm1.47-3.264a.936.936 0 0 1-1.287.308c-3.22-1.979-8.128-2.55-11.936-1.394a.936.936 0 1 1-.546-1.791c4.354-1.321 9.77-.682 13.46 1.589a.937.937 0 0 1 .309 1.288zm.126-3.401c-3.86-2.292-10.228-2.504-13.896-1.39a1.122 1.122 0 1 1-.65-2.146c4.223-1.282 11.246-1.034 15.688 1.602a1.122 1.122 0 0 1-1.142 1.934z"/>
      </svg>
    )
  },
  {
    id: 'slack',
    name: 'Slack',
    anim: 'floating-anim-1',
    defaultPos: { top: '8%', right: '6%' },
    renderIcon: () => (
      <svg viewBox="0 0 24 24" className="floating-svg-icon">
        <path d="M6 15a2 2 0 0 1-2-2 2 2 0 0 1 2-2h2v2a2 2 0 0 1-2 2zm1 0a2 2 0 0 1 2-2 2 2 0 0 1 2 2v5a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-5z" fill="#E01E5A"/>
        <path d="M9 6a2 2 0 0 1 2-2 2 2 0 0 1 2 2v2H11a2 2 0 0 1-2-2zm0 1a2 2 0 0 1 2 2 2 2 0 0 1-2 2H4a2 2 0 0 1-2-2 2 2 0 0 1 2-2h5z" fill="#36C5F0"/>
        <path d="M18 9a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-2V11a2 2 0 0 1 2-2zm-1 0a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2 2 2 0 0 1 2 2v5z" fill="#2EB67D"/>
        <path d="M15 18a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-2h2a2 2 0 0 1 2 2zm0-1a2 2 0 0 1-2-2 2 2 0 0 1 2-2h5a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-5z" fill="#ECB22E"/>
      </svg>
    )
  },
  {
    id: 'diamond',
    name: 'Linear',
    anim: 'floating-anim-2',
    defaultPos: { top: '30%', right: '12%' },
    renderIcon: () => (
      <svg viewBox="0 0 24 24" className="floating-svg-icon" fill="#38bdf8">
        <path d="M12 2.5L2.5 12 12 21.5 21.5 12 12 2.5zm0 5.2l4.3 4.3-4.3 4.3-4.3-4.3L12 7.7z" />
      </svg>
    )
  },
  {
    id: 'minus',
    name: 'Minus',
    anim: 'floating-anim-3',
    defaultPos: { top: '53%', right: '6%' },
    renderIcon: () => (
      <svg viewBox="0 0 24 24" className="floating-svg-icon">
        <circle cx="12" cy="12" r="10" fill="#6366f1"/>
        <path d="M7.5 12h9" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round"/>
      </svg>
    )
  }
];

export default function UsernameModal({
  isOpen,
  onClose,
  onSubmit,
  currentUsername = '',
  isEditing = false
}) {
  const [username, setUsername] = useState(currentUsername || '');
  const [error, setError] = useState('');
  const [offsets, setOffsets] = useState({});
  const [draggingId, setDraggingId] = useState(null);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, origX: 0, origY: 0 });

  useEffect(() => {
    if (isOpen) {
      setUsername(currentUsername || '');
      setError('');
    }
  }, [isOpen, currentUsername]);

  const handlePointerDown = (e, id) => {
    e.preventDefault();
    setDraggingId(id);
    const curr = offsets[id] || { x: 0, y: 0 };
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      origX: curr.x,
      origY: curr.y
    };
  };

  useEffect(() => {
    if (!draggingId) return;

    const handlePointerMove = (e) => {
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;
      setOffsets((prev) => ({
        ...prev,
        [draggingId]: {
          x: dragStartRef.current.origX + dx,
          y: dragStartRef.current.origY + dy
        }
      }));
    };

    const handlePointerUp = () => {
      setDraggingId(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [draggingId]);

  const resetPositions = (e) => {
    e?.stopPropagation();
    setOffsets({});
  };

  const hasMoved = Object.values(offsets).some((o) => o && (o.x !== 0 || o.y !== 0));

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e?.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) {
      setError('Masukkan nama atau username untuk melanjutkan');
      return;
    }
    if (trimmed.length > 30) {
      setError('Maksimal 30 karakter untuk nama username');
      return;
    }

    try {
      localStorage.setItem('ocular_username', trimmed);
    } catch (err) {
      console.warn('LocalStorage save failed:', err);
    }

    onSubmit(trimmed);
  };

  return (
    <div className="floating-hero-modal-overlay" onClick={onClose}>
      <div
        className="floating-hero-modal-stage"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Reset Positions Button (Shown if badges were moved) */}
        {hasMoved && (
          <button
            onClick={resetPositions}
            className="floating-hero-reset-btn"
            title="Kembalikan posisi semua icon"
            type="button"
          >
            <RotateCcw size={13} />
            <span>Reset Posisi Icon</span>
          </button>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="floating-hero-close-btn"
          title="Tutup dialog"
          type="button"
        >
          <X size={18} />
        </button>

        {/* Ambient Radial Lights */}
        <div className="floating-hero-radial-glow top" />
        <div className="floating-hero-radial-glow bottom" />

        {/* Interactive Floating Tech Icons (Draggable) */}
        {INITIAL_BADGES.map((badge) => {
          const offset = offsets[badge.id] || { x: 0, y: 0 };
          const isDragging = draggingId === badge.id;

          return (
            <div
              key={badge.id}
              className={`floating-badge-box ${isDragging ? 'is-dragging' : ''}`}
              style={{
                ...badge.defaultPos,
                transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${isDragging ? 1.14 : 1})`,
                zIndex: isDragging ? 100 : 5
              }}
              onPointerDown={(e) => handlePointerDown(e, badge.id)}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              title={badge.name}
            >
              <div className={`floating-badge-inner ${isDragging ? 'drag-paused' : badge.anim}`}>
                {badge.renderIcon()}
              </div>
            </div>
          );
        })}

        {/* Center Invitation Headline & Username Input Form */}
        <div className="floating-hero-center-content">
          <h1 className="floating-hero-main-title">
            {isEditing ? 'Ubah Profil Operator' : 'Siap Uji Kedipan Matamu?'}
          </h1>

          <p className="floating-hero-sub-description">
            {isEditing
              ? 'Perbarui username operator kamu untuk dicatat dalam sesi pengujian deteksi kedipan.'
              : 'Masukkan nama atau username kamu untuk memulai pengujian kamera dan kalibrasi deteksi kedipan mata.'}
          </p>

          <form onSubmit={handleSubmit} className="floating-hero-form">
            <div className="floating-hero-input-wrap">
              <span className="floating-hero-input-icon">
                <User size={18} />
              </span>
              <input
                type="text"
                className="floating-hero-input-field"
                placeholder="Ketik username / nama kamu..."
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError('');
                }}
                autoFocus
                maxLength={30}
                id="input-operator-username"
              />
            </div>

            {error && <div className="floating-hero-error">{error}</div>}

            <button
              type="submit"
              className="floating-hero-submit-btn"
              id="btn-confirm-username"
            >
              <span>{isEditing ? 'Simpan Username' : 'Mulai Live Camera Test'}</span>
              <ArrowRight size={16} style={{ marginLeft: 8 }} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
