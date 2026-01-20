// Garlic Tiger - Main Entry Point

import Phaser from 'phaser';
import { GAME_CONFIG, SCENES } from './config.js';

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

// Phaser Game Configuration
const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_CONFIG.WIDTH,
  height: GAME_CONFIG.HEIGHT,
  backgroundColor: GAME_CONFIG.COLORS.BLACK,
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: 320,
      height: 480,
    },
    max: {
      width: 720,
      height: 1280,
    },
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
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  input: {
    activePointers: 3,
  },
  render: {
    antialias: false,
    pixelArt: true,
    roundPixels: true,
  },
};

// Initialize the game when DOM is ready
window.addEventListener('load', () => {
  // Create the game instance
  const game = new Phaser.Game(config);

  // Handle visibility changes (pause/resume)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      game.scene.scenes.forEach((scene) => {
        if (scene.scene.isActive()) {
          scene.scene.pause();
        }
      });
    } else {
      game.scene.scenes.forEach((scene) => {
        if (scene.scene.isPaused()) {
          scene.scene.resume();
        }
      });
    }
  });

  // Prevent context menu on right-click
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  // Log game info
  console.log('🐯 Garlic Tiger v1.0');
  console.log('🧄 Eat 5 garlics to become Korean!');
  console.log('📍 localnomad.club');
});
