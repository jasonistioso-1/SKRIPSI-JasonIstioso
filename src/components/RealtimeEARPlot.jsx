import React, { useRef, useState, useEffect } from 'react';
import { Activity } from 'lucide-react';

export default function RealtimeEARPlot({
  earHistory = [],
  threshold = 0.220,
  currentEar = 0.28,
  isBlinking = false,
  totalBlinks = 0,
  bpm = 0,
  elapsedSeconds = 0,
  currentCycleSeconds = 0,
  currentCycleBlinks = 0,
  currentMinuteNumber = 1,
  isSessionPaused = false,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Dynamically measure container dimensions for 100% full-screen fit
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 50 && height > 50) {
          setDimensions({
            width: Math.floor(width),
            height: Math.floor(height),
          });
        }
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = dimensions.width;
    const height = dimensions.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Deep matte background
    ctx.fillStyle = '#09090c';
    ctx.fillRect(0, 0, width, height);

    // Coordinate mapping
    const minEar = 0.12;
    const maxEar = 0.44;
    const paddingLeft = 42;
    const paddingRight = 16;
    const paddingTop = 16;
    const paddingBottom = 22;

    const plotW = width - paddingLeft - paddingRight;
    const plotH = height - paddingTop - paddingBottom;

    const earToY = (val) => {
      const clamped = Math.max(minEar, Math.min(maxEar, val));
      const norm = (clamped - minEar) / (maxEar - minEar);
      return height - paddingBottom - norm * plotH;
    };

    // Draw horizontal reference grid lines
    ctx.lineWidth = 1;
    [0.15, 0.20, 0.25, 0.30, 0.35, 0.40].forEach((level) => {
      const y = earToY(level);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(width - paddingRight, y);
      ctx.stroke();

      // Axis Tick Label
      ctx.fillStyle = '#52525b';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(level.toFixed(2), paddingLeft - 8, y + 3);
    });

    // Draw Threshold Line (Clean Dashed Red)
    const thresholdY = earToY(threshold);
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(paddingLeft, thresholdY);
    ctx.lineTo(width - paddingRight, thresholdY);
    ctx.stroke();

    // Threshold Badge
    ctx.fillStyle = '#f43f5e';
    ctx.font = '600 10px JetBrains Mono, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`THR: ${threshold.toFixed(3)}`, width - paddingRight - 4, thresholdY - 6);

    // Draw Smooth Waveform
    if (earHistory.length > 1) {
      const stepX = plotW / Math.max(earHistory.length - 1, 1);
      const points = earHistory.map((pt, i) => ({
        x: paddingLeft + i * stepX,
        y: earToY(pt.ear),
        isBlinking: pt.isBlinking,
        blinkDetected: pt.blinkDetected,
      }));

      // 1. Fill gradient under the curve
      const areaGrad = ctx.createLinearGradient(0, paddingTop, 0, height - paddingBottom);
      areaGrad.addColorStop(0, isBlinking ? 'rgba(244, 63, 94, 0.18)' : 'rgba(56, 189, 248, 0.12)');
      areaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.moveTo(points[0].x, height - paddingBottom);
      ctx.lineTo(points[0].x, points[0].y);

      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const midX = (p0.x + p1.x) / 2;
        ctx.bezierCurveTo(midX, p0.y, midX, p1.y, p1.x, p1.y);
      }

      ctx.lineTo(points[points.length - 1].x, height - paddingBottom);
      ctx.closePath();
      ctx.fillStyle = areaGrad;
      ctx.fill();

      // 2. Stroke smoothed curve line
      ctx.setLineDash([]);
      ctx.lineWidth = 2.0;
      ctx.strokeStyle = isBlinking ? '#fb7185' : '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const midX = (p0.x + p1.x) / 2;
        ctx.bezierCurveTo(midX, p0.y, midX, p1.y, p1.x, p1.y);
      }
      ctx.stroke();

      // 3. Draw refined blink markers
      points.forEach((pt) => {
        if (pt.blinkDetected) {
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y - 10);
          ctx.lineTo(pt.x, pt.y + 4);
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 3, 0, 2 * Math.PI);
          ctx.fill();
        }
      });

      // 4. Latest data point marker
      const lastPoint = points[points.length - 1];
      ctx.fillStyle = isBlinking ? '#fb7185' : '#38bdf8';
      ctx.beginPath();
      ctx.arc(lastPoint.x, lastPoint.y, 3.5, 0, 2 * Math.PI);
      ctx.fill();
    }
  }, [earHistory, threshold, isBlinking, dimensions]);

  return (
    <div className="glass-card plot-card">
      <div className="feed-header">
        <div className="feed-title-group">
          <Activity size={16} />
          <span className="feed-title">Real-Time EAR Signal Oscilloscope</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            className="tech-badge"
            style={{
              background: isBlinking ? 'rgba(244, 63, 94, 0.2)' : 'rgba(56, 189, 248, 0.12)',
              borderColor: isBlinking ? 'rgba(244, 63, 94, 0.45)' : 'rgba(56, 189, 248, 0.3)',
              color: isBlinking ? '#fb7185' : '#38bdf8',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span>{totalBlinks} Kedipan</span>
          </div>
          <div className="tech-badge" style={{ color: isBlinking ? '#fb7185' : 'var(--text-secondary)' }}>
            <span>{isBlinking ? 'Drop Detected' : 'Normal Signal'}</span>
          </div>
        </div>
      </div>

      <div ref={containerRef} className="plot-canvas-container">
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="plot-canvas"
        />
      </div>

      {/* 4 Core Scientific Telemetry Gauges */}
      <div className="plot-gauges plot-gauges-4">
        {/* Metric 1: Blink Counter & Frequency */}
        <div className={`gauge-box ${isBlinking ? 'blink-active' : ''}`}>
          <div className="gauge-header-row">
            <span className="gauge-label">Total Kedipan</span>
            <span className="gauge-tag-bpm">{bpm} BPM</span>
          </div>
          <div className="gauge-value-row">
            <span className={`gauge-num ${isBlinking ? 'rose' : ''}`}>
              {totalBlinks}
            </span>
            <span className="gauge-unit-text">blinks</span>
          </div>
        </div>

        {/* Metric 2: 1-Minute Cycle Progress */}
        <div className={`gauge-box ${currentCycleBlinks >= 15 ? 'cycle-ok' : ''}`}>
          <div className="gauge-header-row">
            <span className="gauge-label">Siklus Menit #{currentMinuteNumber}</span>
            <span className="gauge-tag-bpm" style={{
              background: currentCycleBlinks >= 15 ? 'rgba(16, 185, 129, 0.14)' : 'rgba(245, 158, 11, 0.14)',
              color: currentCycleBlinks >= 15 ? '#34d399' : '#fbbf24',
              borderColor: currentCycleBlinks >= 15 ? 'rgba(16, 185, 129, 0.35)' : 'rgba(245, 158, 11, 0.35)',
            }}>
              {currentCycleBlinks}/15 std
            </span>
          </div>
          <div className="gauge-value-row">
            <span className="gauge-num">
              {String(currentCycleSeconds).padStart(2, '0')}s
            </span>
            <span className="gauge-unit-text">/ 60s</span>
          </div>
        </div>

        {/* Metric 3: Live EAR & Status */}
        <div className={`gauge-box ${isBlinking ? 'blink-active' : ''}`}>
          <div className="gauge-header-row">
            <span className="gauge-label">Rasio EAR</span>
            <span className={`gauge-status-pill ${isSessionPaused ? 'paused' : isBlinking ? 'blink' : 'open'}`}>
              {isSessionPaused ? 'PAUSED' : isBlinking ? 'BLINK' : 'OPEN'}
            </span>
          </div>
          <div className="gauge-value-row">
            <span className={`gauge-num ${isBlinking ? 'rose' : ''}`}>
              {currentEar.toFixed(3)}
            </span>
            <span className="gauge-unit-text">live</span>
          </div>
        </div>

        {/* Metric 4: Total Session Duration */}
        <div className="gauge-box">
          <div className="gauge-header-row">
            <span className="gauge-label">Durasi Sesi</span>
            <span className="gauge-tag-dim">MM:SS</span>
          </div>
          <div className="gauge-value-row">
            <span className="gauge-num">
              {timeFormatted}
            </span>
            <span className="gauge-unit-text">aktif</span>
          </div>
        </div>
      </div>
    </div>
  );
}
