/**
 * Investara Audio Engine
 * Uses Web Audio API to synthesize high-quality trading notifications.
 * No external assets required, ensuring zero-latency and cross-browser reliability.
 */
class AudioEngine {
  constructor() {
    this.ctx = null;
    this.volume = 0.5;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(val) {
    this.volume = val;
  }

  setEnabled(val) {
    this.enabled = val;
  }

  /**
   * Synthesizes a "Buy" chime - an upward, optimistic sequence
   */
  playBuy() {
    if (!this.enabled) return;
    this.init();
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    const now = this.ctx.currentTime;
    
    // Quick upward frequency sweep
    osc.frequency.setValueAtTime(440, now); // A4
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.1); // A5
    
    // Smooth envelope
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(this.volume, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    
    osc.start(now);
    osc.stop(now + 0.5);
  }

  /**
   * Synthesizes a "Sell" chime - a stable, neutral downward sequence
   */
  playSell() {
    if (!this.enabled) return;
    this.init();
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    const now = this.ctx.currentTime;
    
    // Quick downward frequency sweep
    osc.frequency.setValueAtTime(660, now); // E5
    osc.frequency.exponentialRampToValueAtTime(330, now + 0.1); // E4
    
    // Smooth envelope
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(this.volume, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    
    osc.start(now);
    osc.stop(now + 0.5);
  }
}

export default new AudioEngine();
