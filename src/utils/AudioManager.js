// AudioManager - GBA-style richer audio using Web Audio oscillators
// Uses square + triangle wave layering for fuller GBA sound

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

  // Single oscillator tone
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

  // GBA-style layered tone: square + triangle for richer timbre
  playRichTone(frequency, duration, volume = 0.25) {
    if (!this.enabled || !this.audioContext) return;
    const now = this.audioContext.currentTime;

    // Square wave (primary)
    const osc1 = this.audioContext.createOscillator();
    const gain1 = this.audioContext.createGain();
    osc1.connect(gain1);
    gain1.connect(this.audioContext.destination);
    osc1.frequency.value = frequency;
    osc1.type = 'square';
    gain1.gain.setValueAtTime(volume * 0.6, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + duration);
    osc1.start(now);
    osc1.stop(now + duration);

    // Triangle wave (warmth layer)
    const osc2 = this.audioContext.createOscillator();
    const gain2 = this.audioContext.createGain();
    osc2.connect(gain2);
    gain2.connect(this.audioContext.destination);
    osc2.frequency.value = frequency;
    osc2.type = 'triangle';
    gain2.gain.setValueAtTime(volume * 0.4, now);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + duration);
    osc2.start(now);
    osc2.stop(now + duration);
  }

  // Noise burst (percussion / SFX)
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

  // --- Named Sound Effects ---

  // playSound dispatcher for string-based lookups
  playSound(name) {
    const fn = this._soundMap[name];
    if (fn) fn.call(this);
  }

  get _soundMap() {
    return {
      menuSelect: this.playMenuSelect,
      textAdvance: this.playTypewriter,
      correctAnswer: this.playCorrect,
      wrongAnswer: this.playWrong,
      garlicCollect: this.playGarlicCollect,
      transformation: this.playTransform,
      walk: this.playWalk,
      doorEnter: this.playDoorEnter,
      bowEffect: this.playBowEffect,
      select: this.playSelect,
      confirm: this.playConfirm,
      victory: this.playVictory,
      gameOver: this.playGameOver,
      encounter: this.playEncounter,
      hpTick: this.playHPTick,
    };
  }

  // Walk — soft footstep
  playWalk() { this.playTone(200, 0.03, 'square', 0.05); }

  // UI select blip
  playSelect() { this.playTone(800, 0.06, 'square', 0.15); }

  // Confirm — two-note rising
  playConfirm() {
    [600, 800].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.08, 'square', 0.2), i * 60);
    });
  }

  // Menu select — crisp blip
  playMenuSelect() { this.playTone(900, 0.04, 'square', 0.12); }

  // Text advance / typewriter tick
  playTypewriter() { this.playTone(1000, 0.02, 'square', 0.08); }

  // Correct answer — ascending arpeggio (rich tones)
  playCorrect() {
    [523, 659, 784, 1047].forEach((freq, i) => {
      setTimeout(() => this.playRichTone(freq, 0.12, 0.2), i * 100);
    });
  }

  // Wrong answer — descending buzz
  playWrong() {
    [200, 150].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.15, 'square', 0.25), i * 100);
    });
  }

  // Garlic collect — quick sparkle arpeggio (rich)
  playGarlicCollect() {
    [523, 659, 784, 1047].forEach((freq, i) => {
      setTimeout(() => this.playRichTone(freq, 0.08, 0.15), i * 80);
    });
  }

  // Transformation — long ascending fanfare (rich tones)
  playTransform() {
    [392, 523, 659, 784, 880, 1047].forEach((freq, i) => {
      setTimeout(() => this.playRichTone(freq, 0.15, 0.18), i * 80);
    });
  }

  // Victory — full melody (GBA style with layered tones)
  playVictory() {
    const melody = [523, 523, 523, 698, 880, 784, 698, 880, 1047];
    const durations = [0.1, 0.1, 0.1, 0.2, 0.1, 0.1, 0.1, 0.1, 0.3];
    let time = 0;
    melody.forEach((freq, i) => {
      setTimeout(() => this.playRichTone(freq, durations[i], 0.2), time);
      time += durations[i] * 700;
    });
  }

  // Game over — descending sadness
  playGameOver() {
    [392, 330, 262, 196].forEach((freq, i) => {
      setTimeout(() => this.playRichTone(freq, 0.2, 0.2), i * 150);
    });
  }

  // Wild encounter entry — ascending screech
  playEncounter() {
    [300, 400, 600, 900, 1200].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.06, 'square', 0.2), i * 40);
    });
    setTimeout(() => this.playNoise(0.1, 0.15), 200);
  }

  // HP bar tick
  playHPTick() { this.playTone(600, 0.02, 'square', 0.05); }

  // Door enter — descending whoosh with triangle warmth
  playDoorEnter() {
    [800, 600, 400].forEach((freq, i) => {
      setTimeout(() => this.playRichTone(freq, 0.1, 0.15), i * 70);
    });
  }

  // Bow effect — gentle descending tone (polite bow sound)
  playBowEffect() {
    [660, 550, 440].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.12, 'triangle', 0.12), i * 90);
    });
  }
}

// Singleton
export const audioManager = new AudioManager();
