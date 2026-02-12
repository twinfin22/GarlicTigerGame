// Garlic Tiger - Main Entry Point (Pokemon Gold GBC Style)

import Phaser from 'phaser';
import { GAME } from './config.js';

// Import all scenes
import { BootScene } from './scenes/BootScene.js';
import { TitleScene } from './scenes/TitleScene.js';
import { IntroScene } from './scenes/IntroScene.js';
import { OverworldScene } from './scenes/OverworldScene.js';
import { QuizScene } from './scenes/QuizScene.js';
import { TransformScene } from './scenes/TransformScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { VictoryScene } from './scenes/VictoryScene.js';
import { ScrollScene } from './scenes/ScrollScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME.WIDTH,   // 160
  height: GAME.HEIGHT, // 144
  backgroundColor: 0xF0E0D0,  // Pokemon Gold cream
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [
    BootScene,
    TitleScene,
    IntroScene,
    OverworldScene,
    QuizScene,
    TransformScene,
    GameOverScene,
    VictoryScene,
    ScrollScene,
  ],
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false },
  },
  input: { activePointers: 3 },
  render: { antialias: false, pixelArt: true, roundPixels: true },
};

window.addEventListener('load', () => {
  const game = new Phaser.Game(config);

  // Prevent scroll/bounce on mobile
  document.addEventListener('touchmove', (e) => {
    if (e.target.tagName !== 'INPUT') e.preventDefault();
  }, { passive: false });
  document.addEventListener('touchend', (e) => {
    if (e.target.tagName !== 'INPUT') e.preventDefault();
  }, { passive: false });

  // Pause/resume on visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      game.scene.scenes.forEach(s => { if (s.scene.isActive()) s.scene.pause(); });
    } else {
      game.scene.scenes.forEach(s => { if (s.scene.isPaused()) s.scene.resume(); });
    }
  });

  document.addEventListener('contextmenu', e => e.preventDefault());
});
