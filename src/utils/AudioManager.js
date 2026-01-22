// AudioManager - Web Audio API based 8-bit sound effects

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

  // Play a simple beep/tone
  playTone(frequency, duration, type = 'square', volume = 0.3) {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
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

  // Sound effects - Pokemon Gen 1 style

  playWalk() {
    // Lighter footstep sound
    this.playTone(200, 0.03, 'square', 0.05);
  }

  playSelect() {
    // Pokemon style: punchy menu blip
    this.playTone(800, 0.06, 'square', 0.15);
  }

  playConfirm() {
    // Pokemon "A button" sound - quick ascending two-note
    const notes = [600, 800];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.08, 'square', 0.2), i * 60);
    });
  }

  playCorrect() {
    // Pokemon victory jingle - triumphant ascending
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.12, 'square', 0.2), i * 100);
    });
  }

  playWrong() {
    // Pokemon error/bump - low descending buzz
    const notes = [200, 150];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.15, 'square', 0.25), i * 100);
    });
  }

  playTransform() {
    // Magical transformation - Pokemon level up style
    const notes = [392, 523, 659, 784, 880, 1047];
    notes.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, 0.15, 'square', 0.15);
      }, index * 80);
    });
  }

  playVictory() {
    // Pokemon victory fanfare
    const melody = [523, 523, 523, 698, 880, 784, 698, 880, 1047];
    const durations = [0.1, 0.1, 0.1, 0.2, 0.1, 0.1, 0.1, 0.1, 0.3];
    let time = 0;

    melody.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, durations[index], 'square', 0.2);
      }, time);
      time += durations[index] * 700;
    });
  }

  playGameOver() {
    // Pokemon-style sad descending
    const notes = [392, 330, 262, 196];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 'square', 0.2), i * 150);
    });
  }

  playTypewriter() {
    // Pokemon text blip - quick high-pitched chirp
    this.playTone(1000, 0.02, 'square', 0.08);
  }

  playGarlicCollect() {
    // Pokemon item get - ascending chirp
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.08, 'square', 0.15), i * 80);
    });
  }
}

// Singleton
export const audioManager = new AudioManager();
