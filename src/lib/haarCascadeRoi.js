/**
 * Haar Cascade ROI Extractor & Anti-Jitter Box Smoother
 * Menghasilkan representasi Bounding Box Region of Interest (ROI) Wajah & Mata
 * sesuai prinsip klasifikasi Viola-Jones / Haar Cascade.
 */

export class HaarCascadeRoiTracker {
  constructor() {
    this.smoothedBoxes = new Map();
  }

  // Smooth bounding box using Exponential Moving Average to prevent jitter
  smoothBox(key, box, alpha = 0.35) {
    if (!box) return null;
    if (!this.smoothedBoxes.has(key)) {
      this.smoothedBoxes.set(key, { ...box });
      return box;
    }

    const prev = this.smoothedBoxes.get(key);
    const distChange = Math.hypot(box.x - prev.x, box.y - prev.y);
    const effectiveAlpha = distChange > 40 ? 0.75 : alpha;

    const smoothed = {
      x: Math.round(prev.x * (1 - effectiveAlpha) + box.x * effectiveAlpha),
      y: Math.round(prev.y * (1 - effectiveAlpha) + box.y * effectiveAlpha),
      width: Math.round(prev.width * (1 - effectiveAlpha) + box.width * effectiveAlpha),
      height: Math.round(prev.height * (1 - effectiveAlpha) + box.height * effectiveAlpha),
    };

    this.smoothedBoxes.set(key, smoothed);
    return smoothed;
  }

  /**
   * Ekstraksi Haar Face ROI & Eye ROIs dari kontur koordinat
   */
  extractRois(landmarks, w, h) {
    if (!landmarks || landmarks.length < 468) return null;

    // 1. Ekstraksi Bounding Box Wajah (Haar Face ROI)
    let minFx = 1, maxFx = 0, minFy = 1, maxFy = 0;
    // Indeks kontur luar wajah
    const faceContour = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];
    
    faceContour.forEach(idx => {
      const p = landmarks[idx];
      if (!p) return;
      if (p.x < minFx) minFx = p.x;
      if (p.x > maxFx) maxFx = p.x;
      if (p.y < minFy) minFy = p.y;
      if (p.y > maxFy) maxFy = p.y;
    });

    const rawFaceBox = {
      x: Math.max(0, (minFx - 0.05) * w),
      y: Math.max(0, (minFy - 0.08) * h),
      width: Math.min(w, (maxFx - minFx + 0.10) * w),
      height: Math.min(h, (maxFy - minFy + 0.12) * h),
    };
    const faceBox = this.smoothBox('face', rawFaceBox, 0.25);

    // 2. Ekstraksi Bounding Box Mata Kanan (Haar Right Eye ROI)
    const rightEyeIndices = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
    let minRx = 1, maxRx = 0, minRy = 1, maxRy = 0;
    rightEyeIndices.forEach(idx => {
      const p = landmarks[idx];
      if (!p) return;
      if (p.x < minRx) minRx = p.x;
      if (p.x > maxRx) maxRx = p.x;
      if (p.y < minRy) minRy = p.y;
      if (p.y > maxRy) maxRy = p.y;
    });
    const padRw = (maxRx - minRx) * 0.25;
    const padRh = (maxRy - minRy) * 0.35;
    const rawRightEyeBox = {
      x: Math.max(0, (minRx - padRw) * w),
      y: Math.max(0, (minRy - padRh) * h),
      width: (maxRx - minRx + padRw * 2) * w,
      height: (maxRy - minRy + padRh * 2) * h,
    };
    const rightEyeBox = this.smoothBox('rightEye', rawRightEyeBox, 0.35);

    // 3. Ekstraksi Bounding Box Mata Kiri (Haar Left Eye ROI)
    const leftEyeIndices = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];
    let minLx = 1, maxLx = 0, minLy = 1, maxLy = 0;
    leftEyeIndices.forEach(idx => {
      const p = landmarks[idx];
      if (!p) return;
      if (p.x < minLx) minLx = p.x;
      if (p.x > maxLx) maxLx = p.x;
      if (p.y < minLy) minLy = p.y;
      if (p.y > maxLy) maxLy = p.y;
    });
    const padLw = (maxLx - minLx) * 0.25;
    const padLh = (maxLy - minLy) * 0.35;
    const rawLeftEyeBox = {
      x: Math.max(0, (minLx - padLw) * w),
      y: Math.max(0, (minLy - padLh) * h),
      width: (maxLx - minLx + padLw * 2) * w,
      height: (maxLy - minLy + padLh * 2) * h,
    };
    const leftEyeBox = this.smoothBox('leftEye', rawLeftEyeBox, 0.35);

    return {
      faceBox,
      rightEyeBox,
      leftEyeBox,
    };
  }

  /**
   * Gambar Bounding Box Haar Cascade secara elegan di canvas
   */
  drawHaarBoxes(ctx, rois, isMirrored, w, isBlink) {
    if (!rois) return;
    const { faceBox, rightEyeBox, leftEyeBox } = rois;

    const accentColor = isBlink ? 'rgba(244, 63, 94, 0.85)' : 'rgba(56, 189, 248, 0.7)';

    // Helper untuk menggambar kotak dengan sudut viewfinder elegan
    const renderBox = (box, label) => {
      if (!box) return;
      let bx = isMirrored ? w - box.x - box.width : box.x;
      let by = box.y;
      let bw = box.width;
      let bh = box.height;

      ctx.save();
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 1.4;

      // Draw 4 corner viewfinder brackets instead of solid obstructing box
      const cornerLen = Math.min(14, bw * 0.25, bh * 0.25);
      
      // Top-Left
      ctx.beginPath();
      ctx.moveTo(bx, by + cornerLen);
      ctx.lineTo(bx, by);
      ctx.lineTo(bx + cornerLen, by);
      ctx.stroke();

      // Top-Right
      ctx.beginPath();
      ctx.moveTo(bx + bw - cornerLen, by);
      ctx.lineTo(bx + bw, by);
      ctx.lineTo(bx + bw, by + cornerLen);
      ctx.stroke();

      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(bx, by + bh - cornerLen);
      ctx.lineTo(bx, by + bh);
      ctx.lineTo(bx + cornerLen, by + bh);
      ctx.stroke();

      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(bx + bw - cornerLen, by + bh);
      ctx.lineTo(bx + bw, by + bh);
      ctx.lineTo(bx + bw, by + bh - cornerLen);
      ctx.stroke();

      // Subtle hairline border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.strokeRect(bx, by, bw, bh);

      // Clean Micro Label Tag
      ctx.fillStyle = isBlink ? 'rgba(244, 63, 94, 0.85)' : 'rgba(15, 23, 42, 0.85)';
      const labelW = Math.max(50, label.length * 6.5);
      ctx.fillRect(bx, by - 14, labelW, 14);
      ctx.fillStyle = '#ffffff';
      ctx.font = '600 8.5px JetBrains Mono, monospace';
      ctx.fillText(label, bx + 3, by - 4);
      ctx.restore();
    };

    // Gambar Kotak Wajah dan Mata
    renderBox(faceBox, 'FACE ROI');
    renderBox(rightEyeBox, 'EYE [R]');
    renderBox(leftEyeBox, 'EYE [L]');
  }
}

export const haarRoiTracker = new HaarCascadeRoiTracker();
