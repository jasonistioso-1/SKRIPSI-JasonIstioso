/**
 * Eye Aspect Ratio (EAR) & Landmark Mathematics
 * Based on:
 * - Soukupová and Čech (2016): Real-Time Eye Blink Detection using Facial Landmarks
 * - Dewi et al. (2021/2022): Eye Aspect Ratio for Real-Time Drowsiness & Blink Detection
 * - MediaPipe Face Mesh landmark indices
 */

// 16 Landmarks per eye for visual contour drawing
export const RIGHT_EYE_LANDMARKS = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
export const LEFT_EYE_LANDMARKS = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];

// 6 Key landmarks per eye for EAR calculation: [p1, p2, p3, p4, p5, p6]
export const RIGHT_EYE_EAR_INDICES = [33, 159, 158, 133, 153, 145];
export const LEFT_EYE_EAR_INDICES = [362, 380, 374, 263, 386, 385];

/**
 * Calculate Euclidean Distance between two 2D points scaled to canvas dimensions
 */
export function euclideanDistance(p1, p2, width = 1, height = 1) {
  const dx = (p1.x - p2.x) * width;
  const dy = (p1.y - p2.y) * height;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate Eye Aspect Ratio (EAR) for a single eye
 * Formula: EAR = (||p2 - p6|| + ||p3 - p5||) / (2.0 * ||p1 - p4||)
 */
export function calculateEAR(landmarks, earIndices, width = 1, height = 1) {
  if (!landmarks || landmarks.length < 468) return 0.28;

  const p1 = landmarks[earIndices[0]];
  const p2 = landmarks[earIndices[1]];
  const p3 = landmarks[earIndices[2]];
  const p4 = landmarks[earIndices[3]];
  const p5 = landmarks[earIndices[4]];
  const p6 = landmarks[earIndices[5]];

  if (!p1 || !p2 || !p3 || !p4 || !p5 || !p6) return 0.28;

  const verticalA = euclideanDistance(p2, p6, width, height);
  const verticalB = euclideanDistance(p3, p5, width, height);
  const horizontalC = euclideanDistance(p1, p4, width, height);

  if (horizontalC === 0) return 0.28;

  return (verticalA + verticalB) / (2.0 * horizontalC);
}

/**
 * High-Precision Adaptive Blink Tracker with Anti-Jitter Smoothing & Refractory Filtering
 */
export class BlinkTracker {
  constructor(options = {}) {
    // Default threshold for users with glasses / Asian eye contour is ~0.21 - 0.24
    this.earThreshold = options.earThreshold ?? 0.225;
    this.consecFrames = options.consecFrames ?? 2;
    this.maxClosedFrames = 25; // More than 25 frames (~0.8s) is considered prolonged closure/sleep, not blink
    
    this.blinkCounter = 0;
    this.frameCounter = 0;
    this.isBlinking = false;
    this.lastBlinkTime = 0;
    this.blinkStartTime = 0;
    this.refractoryPeriodMs = 180; // Minimum 180ms cooldown to prevent multi-count stutter

    // Adaptive Baseline Calibration
    this.isCalibrating = false;
    this.calibrationSamples = [];
    this.baselineOpenEar = 0.280;

    // Smoother
    this.smoothedEar = null;

    this.earHistory = [];
    this.maxHistory = 150;
    this.blinkEvents = [];
    this.sessionStartTime = Date.now();
    this.activeElapsedMs = 0;
    this.earSum = 0;
    this.earCount = 0;
  }

  setThreshold(threshold) {
    this.earThreshold = Number(threshold);
  }

  setConsecFrames(frames) {
    this.consecFrames = Number(frames);
  }

  addActiveTime(deltaMs) {
    if (deltaMs > 0) {
      this.activeElapsedMs += deltaMs;
    }
  }

  startCalibration() {
    this.isCalibrating = true;
    this.calibrationSamples = [];
  }

  finishCalibration() {
    this.isCalibrating = false;
    if (this.calibrationSamples.length > 15) {
      // Sort and take median to ignore noise/outliers
      const sorted = [...this.calibrationSamples].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      this.baselineOpenEar = Number(median.toFixed(3));
      // Adaptive threshold formula: 78% of open eye baseline (Dewi et al., 2021)
      this.earThreshold = Number((median * 0.78).toFixed(3));
      return {
        success: true,
        baseline: this.baselineOpenEar,
        newThreshold: this.earThreshold,
      };
    }
    return { success: false };
  }

  reset() {
    this.blinkCounter = 0;
    this.frameCounter = 0;
    this.isBlinking = false;
    this.lastBlinkTime = 0;
    this.blinkStartTime = 0;
    this.smoothedEar = null;
    this.earHistory = [];
    this.blinkEvents = [];
    this.sessionStartTime = Date.now();
    this.activeElapsedMs = 0;
    this.earSum = 0;
    this.earCount = 0;
  }

  /**
   * Process a frame's EAR value
   * @param {number} rawEar - Current average EAR value
   * @param {number} leftEar - Left eye EAR
   * @param {number} rightEar - Right eye EAR
   * @param {number} frameIndex - Current video frame or animation frame
   */
  processFrame(rawEar, leftEar = rawEar, rightEar = rawEar, frameIndex = 0) {
    const now = Date.now();

    // 1. Anti-jitter Exponential Moving Average (EMA) smoothing
    if (this.smoothedEar === null) {
      this.smoothedEar = rawEar;
    } else {
      // Faster response on downward slope (blink drop), smoother on stable open eyes
      const alpha = rawEar < this.smoothedEar ? 0.65 : 0.35;
      this.smoothedEar = this.smoothedEar * (1 - alpha) + rawEar * alpha;
    }

    const ear = Number(this.smoothedEar.toFixed(3));
    this.earSum += ear;
    this.earCount += 1;

    // Handle Active Calibration
    if (this.isCalibrating) {
      this.calibrationSamples.push(rawEar);
    }

    // 2. Blink Detection Logic with Debounce
    let blinkDetected = false;

    if (ear < this.earThreshold) {
      if (this.frameCounter === 0) {
        this.blinkStartTime = now;
      }
      this.frameCounter += 1;
      this.isBlinking = true;
    } else {
      // Check if threshold was met for valid blink duration and cooldown has passed
      if (
        this.frameCounter >= this.consecFrames &&
        this.frameCounter <= this.maxClosedFrames &&
        now - this.lastBlinkTime > this.refractoryPeriodMs
      ) {
        this.blinkCounter += 1;
        blinkDetected = true;
        this.lastBlinkTime = now;
        const durationMs = this.blinkStartTime
          ? Math.max(60, Math.min(800, now - this.blinkStartTime))
          : 160;

        this.blinkEvents.push({
          id: this.blinkCounter,
          frame: frameIndex,
          timestamp: Math.round(this.activeElapsedMs || (now - this.sessionStartTime)),
          clockTime: new Date().toLocaleTimeString('id-ID', { hour12: false }),
          ear: ear,
          durationMs,
          consecFramesReached: this.frameCounter,
        });
      }
      this.frameCounter = 0;
      this.blinkStartTime = 0;
      this.isBlinking = false;
    }

    // Rolling history for real-time oscilloscope
    this.earHistory.push({
      ear,
      leftEar,
      rightEar,
      isBlinking: this.isBlinking,
      blinkDetected,
      timestamp: now,
    });

    if (this.earHistory.length > this.maxHistory) {
      this.earHistory.shift();
    }

    return {
      blinkDetected,
      isBlinking: this.isBlinking,
      totalBlinks: this.blinkCounter,
      frameCounter: this.frameCounter,
      ear,
      leftEar,
      rightEar,
      threshold: this.earThreshold,
    };
  }

  getStatistics() {
    const activeSeconds = Math.floor(this.activeElapsedMs / 1000);
    const effectiveSeconds = Math.max(1, activeSeconds || 1);
    const bpm = activeSeconds > 0
      ? Number(((this.blinkCounter / effectiveSeconds) * 60).toFixed(1))
      : 0;
    const avgEar = this.earCount > 0
      ? Number((this.earSum / this.earCount).toFixed(3))
      : 0.28;

    return {
      totalBlinks: this.blinkCounter,
      bpm,
      elapsedSeconds: activeSeconds,
      avgEar,
      eventsCount: this.blinkEvents.length,
    };
  }

  exportCSV(username = '') {
    const operatorLine = username ? `# Operator: ${username}\n` : '';
    const dateLine = `# Exported: ${new Date().toISOString()}\n`;
    const headers = ['Frame', 'Timestamp_ms', 'EAR', 'Consecutive_Frames_Met'];
    const rows = this.blinkEvents.map(e => [
      e.frame,
      e.timestamp,
      e.ear,
      e.consecFramesReached,
    ]);

    const csvContent = operatorLine + dateLine + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const safeName = username ? username.replace(/[^a-zA-Z0-9_-]/g, '_') : 'telemetry';
    link.setAttribute('download', `ocular_blink_${safeName}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
