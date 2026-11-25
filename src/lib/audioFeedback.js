/**
 * Web Audio API synthesizer for blink alerts
 * Generates crisp, pleasant musical notifications without external audio assets.
 */

class AudioFeedback {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
  }

  setEnabled(val) {
    this.enabled = Boolean(val);
  }

  playBlinkChime() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      // Crisp 880Hz (A5) to 1174Hz (D6) pleasant confirmation chime
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.08);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  /**
   * Distinct double-tone clinical warning chime when 1-minute blink count is below standard.
   */
  playAlertTone() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const now = this.ctx.currentTime;
      const playPulse = (startOffset, freq) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + startOffset);
        gain.gain.setValueAtTime(0.001, now + startOffset);
        gain.gain.linearRampToValueAtTime(0.18, now + startOffset + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + startOffset + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + startOffset);
        osc.stop(now + startOffset + 0.24);
      };

      playPulse(0, 659.25); // E5
      playPulse(0.24, 523.25); // C5
    } catch {
      // Audio autoplay policy fallback
    }
  }
}

export const audioFeedback = new AudioFeedback();
