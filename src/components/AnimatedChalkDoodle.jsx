import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RotateCcw } from 'lucide-react';

const CHARACTERS_CONFIG = [
  {
    id: 'cat',
    name: 'Kucing Bajak Laut',
    src: '/doodles/cat.png',
    homeLeft: 88.9,
    homeTop: 57.3,
    widthPct: 10.6,
    speed: 1.0,
    phase: 0.2,
    ampX: 2.2,
    ampY: 3.5,
    maxRot: 4.5,
    reactionEmoji: '♥ ฅ^•ﻌ•^ฅ',
    reactionDesc: 'Meow purr!'
  },
  {
    id: 'bird',
    name: 'Burung Pesta',
    src: '/doodles/bird.png',
    homeLeft: 18.9,
    homeTop: 13.0,
    widthPct: 9.8,
    speed: 1.4,
    phase: 1.8,
    ampX: 3.0,
    ampY: 4.5,
    maxRot: 6.0,
    reactionEmoji: '♫ ♪ Chirp!',
    reactionDesc: 'Chirp hop!'
  },
  {
    id: 'kid',
    name: 'Anak Topi Jerami',
    src: '/doodles/kid.png',
    homeLeft: 60.7,
    homeTop: 11.1,
    widthPct: 9.8,
    speed: 0.85,
    phase: 3.2,
    ampX: 2.0,
    ampY: 3.0,
    maxRot: 4.0,
    reactionEmoji: '(≧◡≦) ★ Halo!',
    reactionDesc: 'Leg swing!'
  },
  {
    id: 'monster',
    name: 'Monster Ransel',
    src: '/doodles/monster.png',
    homeLeft: 3.3,
    homeTop: 52.1,
    widthPct: 14.8,
    speed: 0.75,
    phase: 4.5,
    ampX: 1.8,
    ampY: 2.5,
    maxRot: 3.0,
    reactionEmoji: '🥪 Crunch!',
    reactionDesc: 'Munching burger!'
  },
  {
    id: 'mushroom',
    name: 'Jamur Merah Ceria',
    src: '/doodles/mushroom.png',
    homeLeft: 32.7,
    homeTop: 69.7,
    widthPct: 6.9,
    speed: 1.25,
    phase: 2.5,
    ampX: 1.5,
    ampY: 3.8,
    maxRot: 5.0,
    reactionEmoji: '🍄 Boing!',
    reactionDesc: 'Squishy bounce!'
  },
  {
    id: 'peeker',
    name: 'Pengintip Huruf N',
    src: '/doodles/peeker.png',
    homeLeft: 78.5,
    homeTop: 18.9,
    widthPct: 8.7,
    speed: 1.1,
    phase: 5.1,
    ampX: 1.8,
    ampY: 4.2,
    maxRot: 3.5,
    reactionEmoji: '(★ω★) Peek!',
    reactionDesc: 'Peeking peekaboo!'
  },
  {
    id: 'lightning',
    name: 'Kilat Petir',
    src: '/doodles/lightning.png',
    homeLeft: 47.2,
    homeTop: 10.4,
    widthPct: 4.4,
    speed: 1.8,
    phase: 0.9,
    ampX: 2.5,
    ampY: 3.0,
    maxRot: 8.0,
    reactionEmoji: '⚡ ZAP!',
    reactionDesc: 'Thunder flash!'
  }
];

export default function AnimatedChalkDoodle({ className = '', style = {} }) {
  const stageRef = useRef(null);
  const charRefs = useRef({});
  const particlesRef = useRef([]);

  // Physics & Animation State for 60-120fps direct DOM manipulation
  const physicsRef = useRef(
    CHARACTERS_CONFIG.reduce((acc, c) => {
      acc[c.id] = {
        // Dropped / moved base offset in px
        droppedX: 0,
        droppedY: 0,
        // Current rendered offset in px
        currX: 0,
        currY: 0,
        // Velocity for momentum & spring settle
        vx: 0,
        vy: 0,
        // Current rotation & scale
        rot: 0,
        scaleX: 1,
        scaleY: 1,
        // Click impulse timer
        clickJump: 0,
        // Is actively dragging
        isDragging: false
      };
      return acc;
    }, {})
  );

  // Mouse / cursor position tracking relative to stage
  const mouseStateRef = useRef({
    isOnStage: false,
    x: 0,
    y: 0,
    stageWidth: 1,
    stageHeight: 1
  });

  // Drag interaction state
  const dragRef = useRef(null);
  const [hasMoved, setHasMoved] = useState(false);
  const [activeReactions, setActiveReactions] = useState({});

  // 60-120 FPS Physics & Motion Loop
  useEffect(() => {
    let animId;
    let lastTime = performance.now();

    const updateLoop = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.033);
      lastTime = now;

      const mouse = mouseStateRef.current;
      const physics = physicsRef.current;
      const t = now * 0.001;

      CHARACTERS_CONFIG.forEach((char) => {
        const state = physics[char.id];
        const el = charRefs.current[char.id];
        if (!state || !el) return;

        // 1. Organic Idle Harmonic Sway (Otomatis & Buttery Smooth)
        const idleX = Math.sin(t * 1.5 * char.speed + char.phase) * char.ampX;
        const idleY = Math.cos(t * 1.9 * char.speed + char.phase) * char.ampY;
        const idleRot = Math.sin(t * 1.2 * char.speed + char.phase) * char.maxRot;
        const idleScaleX = 1 + Math.sin(t * 2.2 * char.speed + char.phase) * 0.035;
        const idleScaleY = 1 - Math.sin(t * 2.2 * char.speed + char.phase) * 0.035;

        // 2. Cursor Attraction & Gaze Tracking (Bisa Pake Cursor)
        let cursorInfluenceX = 0;
        let cursorInfluenceY = 0;
        let cursorInfluenceRot = 0;
        let cursorInfluenceScale = 0;

        if (mouse.isOnStage && !state.isDragging) {
          // Approximate character center in stage coordinates
          const charCenterX = (char.homeLeft / 100) * mouse.stageWidth + state.droppedX;
          const charCenterY = (char.homeTop / 100) * mouse.stageHeight + state.droppedY;

          const dx = mouse.x - charCenterX;
          const dy = mouse.y - charCenterY;
          const dist = Math.hypot(dx, dy);

          // Proximity effect radius (170px)
          const radius = 170;
          if (dist < radius) {
            const factor = Math.pow(1 - dist / radius, 2);
            // Gentle lean & pull towards the cursor
            cursorInfluenceX = dx * 0.16 * factor;
            cursorInfluenceY = dy * 0.16 * factor;
            cursorInfluenceRot = Math.max(-18, Math.min(18, dx * 0.12 * factor));
            cursorInfluenceScale = factor * 0.10;
          }
        }

        // 3. Click Jump Impulse Decay
        let jumpOffsetY = 0;
        if (state.clickJump > 0) {
          jumpOffsetY = -Math.sin(state.clickJump * Math.PI) * 18;
          state.clickJump = Math.max(0, state.clickJump - dt * 2.6);
        }

        // 4. Position & Physics Integration
        if (state.isDragging) {
          // Immediate responsive cursor tracking during drag
          state.currX += (state.droppedX - state.currX) * 0.35;
          state.currY += (state.droppedY - state.currY) * 0.35;
          state.rot += (Math.max(-20, Math.min(20, state.vx * 0.06)) - state.rot) * 0.25;
          state.scaleX = 1.18;
          state.scaleY = 1.18;
        } else {
          // Target position combines dropped placement + idle sway + cursor pull
          const targetX = state.droppedX + idleX + cursorInfluenceX;
          const targetY = state.droppedY + idleY + cursorInfluenceY + jumpOffsetY;
          const targetRot = idleRot + cursorInfluenceRot;
          const targetScaleX = idleScaleX + cursorInfluenceScale;
          const targetScaleY = idleScaleY + cursorInfluenceScale;

          // Momentum & Spring Settle
          state.vx *= 0.85;
          state.vy *= 0.85;
          state.droppedX += state.vx * dt;
          state.droppedY += state.vy * dt;

          // Smooth exponential ease-out to target position (60-120fps)
          state.currX += (targetX - state.currX) * 0.18;
          state.currY += (targetY - state.currY) * 0.18;
          state.rot += (targetRot - state.rot) * 0.16;
          state.scaleX += (targetScaleX - state.scaleX) * 0.18;
          state.scaleY += (targetScaleY - state.scaleY) * 0.18;
        }

        // 5. Update DOM Transform Directly (Zero React re-render lag)
        el.style.transform = `translate3d(${state.currX}px, ${state.currY}px, 0) rotate(${state.rot}deg) scale(${state.scaleX}, ${state.scaleY})`;
      });

      animId = requestAnimationFrame(updateLoop);
    };

    animId = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Update mouse position relative to the stage
  const handleStagePointerMove = (e) => {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();

    mouseStateRef.current = {
      isOnStage: true,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      stageWidth: rect.width,
      stageHeight: rect.height
    };

    // If dragging an animal, update its dropped destination
    if (dragRef.current) {
      const { id, startPointerX, startPointerY, origDroppedX, origDroppedY } = dragRef.current;
      const deltaX = e.clientX - startPointerX;
      const deltaY = e.clientY - startPointerY;

      const state = physicsRef.current[id];
      if (state) {
        const prevX = state.droppedX;
        const prevY = state.droppedY;

        state.droppedX = origDroppedX + deltaX;
        state.droppedY = origDroppedY + deltaY;

        // Calculate drag velocity for release momentum
        state.vx = (state.droppedX - prevX) * 35;
        state.vy = (state.droppedY - prevY) * 35;
      }

      dragRef.current.draggedDist += Math.hypot(deltaX, deltaY);
      if (!hasMoved) setHasMoved(true);
    }
  };

  const handleStagePointerLeave = () => {
    mouseStateRef.current.isOnStage = false;
  };

  // Drag start on a character
  const handleCharPointerDown = (id, e) => {
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}

    const state = physicsRef.current[id];
    if (!state) return;

    state.isDragging = true;
    state.vx = 0;
    state.vy = 0;

    dragRef.current = {
      id,
      startPointerX: e.clientX,
      startPointerY: e.clientY,
      origDroppedX: state.droppedX,
      origDroppedY: state.droppedY,
      draggedDist: 0,
      pointerId: e.pointerId
    };
  };

  // Drag end / Click detection
  const handleCharPointerUp = (id, e) => {
    e.stopPropagation();
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    const state = physicsRef.current[id];
    if (state) {
      state.isDragging = false;
    }

    if (dragRef.current && dragRef.current.id === id) {
      const isClick = dragRef.current.draggedDist < 6;
      dragRef.current = null;

      if (isClick) {
        // Trigger fun click bounce + sound popup
        triggerClickReaction(id);
      }
    }
  };

  // Click Reaction
  const triggerClickReaction = (id) => {
    const state = physicsRef.current[id];
    const charMeta = CHARACTERS_CONFIG.find((c) => c.id === id);
    if (!state || !charMeta) return;

    state.clickJump = 1.0;

    // Show reaction speech bubble
    setActiveReactions((prev) => ({
      ...prev,
      [id]: charMeta.reactionEmoji
    }));

    setTimeout(() => {
      setActiveReactions((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }, 1300);
  };

  // Reset all characters smoothly to home
  const handleResetPositions = (e) => {
    e.stopPropagation();
    CHARACTERS_CONFIG.forEach((char) => {
      const state = physicsRef.current[char.id];
      if (state) {
        state.droppedX = 0;
        state.droppedY = 0;
        state.vx = 0;
        state.vy = 0;
        state.clickJump = 1.0;
      }
    });
    setHasMoved(false);
  };

  return (
    <div className={`chalk-doodle-interactive-container ${className}`} style={style}>
      {/* 16:9 Interactive Stage */}
      <div
        ref={stageRef}
        className="chalk-doodle-aspect-wrapper"
        onPointerMove={handleStagePointerMove}
        onPointerLeave={handleStagePointerLeave}
      >
        {/* Reset Positions Floating Pill Button */}
        {hasMoved && (
          <button
            onClick={handleResetPositions}
            className="chalk-doodle-reset-btn"
            title="Kembalikan semua hewan ke posisi awal"
          >
            <RotateCcw size={12} />
            <span>Kembalikan Posisi</span>
          </button>
        )}

        {/* Clean Chalk Letters Base (100% True RGBA Transparency) */}
        <img
          src="/jason_clean_text.png"
          alt="Jason Istioso Chalk Text"
          className="chalk-doodle-base-img"
        />

        {/* ========================================================
            FLUID SPRING-PHYSICS INTERACTIVE CHARACTERS
            ======================================================== */}
        {CHARACTERS_CONFIG.map((char) => {
          const reaction = activeReactions[char.id];

          return (
            <div
              key={char.id}
              ref={(el) => { charRefs.current[char.id] = el; }}
              className="doodle-physics-character"
              style={{
                left: `${char.homeLeft}%`,
                top: `${char.homeTop}%`,
                width: `${char.widthPct}%`
              }}
              onPointerDown={(e) => handleCharPointerDown(char.id, e)}
              onPointerUp={(e) => handleCharPointerUp(char.id, e)}
              onPointerCancel={(e) => handleCharPointerUp(char.id, e)}
            >
              {/* Click reaction bubble */}
              {reaction && (
                <div className="char-reaction-bubble">
                  <span>{reaction}</span>
                </div>
              )}

              {/* Character Sticker Image */}
              <img
                src={char.src}
                alt=""
                className="char-sticker-img"
                draggable={false}
              />
            </div>
          );
        })}

        {/* Ambient Twinkling Stars */}
        <div className="chalk-star star-1">✦</div>
        <div className="chalk-star star-2">★</div>
        <div className="chalk-star star-3">✦</div>
        <div className="chalk-star star-4">★</div>
      </div>
    </div>
  );
}
