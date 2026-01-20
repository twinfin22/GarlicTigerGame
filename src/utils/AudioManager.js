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

  // Sound effects
  playWalk() {
    this.playTone(150, 0.05, 'square', 0.1);
  }

  playSelect() {
    this.playTone(440, 0.1, 'square', 0.2);
  }

  playConfirm() {
    this.playArpeggio([523, 659, 784], 0.08);
  }

  playCorrect() {
    // Happy ascending arpeggio
    this.playArpeggio([523, 659, 784, 1047], 0.12);
  }

  playWrong() {
    // Sad descending sound
    this.playArpeggio([300, 250, 200], 0.15, 'sawtooth');
  }

  playTransform() {
    // Magical transformation sound
    const notes = [262, 330, 392, 523, 659, 784, 1047];
    notes.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, 0.3, 'sine', 0.15);
      }, index * 100);
    });
  }

  playVictory() {
    // Triumphant fanfare
    const melody = [523, 523, 523, 698, 880, 784, 698, 880, 1047];
    const durations = [0.15, 0.15, 0.15, 0.3, 0.15, 0.15, 0.15, 0.15, 0.5];
    let time = 0;

    melody.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, durations[index], 'square', 0.2);
      }, time);
      time += durations[index] * 800;
    });
  }

  playGameOver() {
    // Descending sad melody
    this.playArpeggio([400, 350, 300, 250, 200], 0.2, 'triangle');
  }

  playTypewriter() {
    this.playTone(800 + Math.random() * 200, 0.03, 'square', 0.05);
  }

  playGarlicCollect() {
    // Satisfying collect sound
    this.playArpeggio([440, 554, 659, 880], 0.08);
  }
}

// Singleton
export const audioManager = new AudioManager();
