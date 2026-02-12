// AudioManager - 4-channel Game Boy sound chip emulation
// Ch1: Square wave (melody) - jingles
// Ch2: Square wave (harmony) - effects
// Ch3: Custom waveform (bass) - encounter
// Ch4: Noise (drums/sfx) - battle effects

class AudioManager {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
  }

  init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
      this.enabled = false;
    }
  }

  // Resume audio context (needed for mobile after user interaction)
  resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  // Channel 1: Square wave tone
  playTone(frequency, duration, type = 'square', volume = 0.3) {
    if (!this.enabled || !this.audioContext) return;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    osc.frequency.value = frequency;
    osc.type = type;
    gain.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + duration);
  }

  // Play arpeggio (sequence of notes)
  playArpeggio(frequencies, noteDuration = 0.1, type = 'square') {
    if (!this.enabled || !this.audioContext) return;
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, noteDuration, type, 0.2);
      }, index * (noteDuration * 1000 * 0.8));
    });
  }

  // Channel 4: Noise burst
  playNoise(duration = 0.05, volume = 0.1) {
    if (!this.enabled || !this.audioContext) return;
    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    const gain = this.audioContext.createGain();
    source.connect(gain);
    gain.connect(this.audioContext.destination);
    gain.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    source.start();
  }

  // --- Sound Effects ---

  playWalk() { this.playTone(200, 0.03, 'square', 0.05); }

  playSelect() { this.playTone(800, 0.06, 'square', 0.15); }

  playConfirm() {
    [600, 800].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.08, 'square', 0.2), i * 60);
    });
  }

  playCorrect() {
    [523, 659, 784, 1047].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.12, 'square', 0.2), i * 100);
    });
  }

  playWrong() {
    [200, 150].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.15, 'square', 0.25), i * 100);
    });
  }

  playTransform() {
    [392, 523, 659, 784, 880, 1047].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.15, 'square', 0.15), i * 80);
    });
  }

  playVictory() {
    const melody = [523, 523, 523, 698, 880, 784, 698, 880, 1047];
    const durations = [0.1, 0.1, 0.1, 0.2, 0.1, 0.1, 0.1, 0.1, 0.3];
    let time = 0;
    melody.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, durations[i], 'square', 0.2), time);
      time += durations[i] * 700;
    });
  }

  playGameOver() {
    [392, 330, 262, 196].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 'square', 0.2), i * 150);
    });
  }

  playTypewriter() { this.playTone(1000, 0.02, 'square', 0.08); }

  playGarlicCollect() {
    [523, 659, 784, 1047].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.08, 'square', 0.15), i * 80);
    });
  }

  // Wild encounter entry (ascending screech like Pokemon)
  playEncounter() {
    [300, 400, 600, 900, 1200].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.06, 'square', 0.2), i * 40);
    });
    setTimeout(() => this.playNoise(0.1, 0.15), 200);
  }

  // Battle menu select blip
  playMenuSelect() { this.playTone(900, 0.04, 'square', 0.12); }

  // HP bar tick
  playHPTick() { this.playTone(600, 0.02, 'square', 0.05); }
}

// Singleton
export const audioManager = new AudioManager();
