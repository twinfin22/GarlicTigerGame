// OverworldScene - GBA Gen 3 Pokemon FireRed/LeafGreen style overworld
// 240x160 native resolution, 16px tiles, 32px sprites
// Phaser camera follow, tileset-based map, InputHandler polling

import Phaser from 'phaser';
import { GAME, SCENES, QUIZ_LOCATIONS } from '../config.js';
import { Tiger } from '../objects/Tiger.js';
import { NPC } from '../objects/NPC.js';
import { DialogueBox } from '../objects/DialogueBox.js';
import { InputHandler } from '../utils/InputHandler.js';
import { MapBuilder } from '../utils/MapBuilder.js';
import { StateManager } from '../utils/StateManager.js';
import { audioManager } from '../utils/AudioManager.js';
import { MAP_LAYERS, isWalkable } from '../data/mapData.js';
import { isTallGrass } from '../data/mapData.js';
import { SIGNS, MINI_EVENTS, ALREADY_CLEARED, RETRY_PROMPT } from '../data/overworldText.js';
import { createBattleTransition } from '../utils/TileRenderer.js';
import { NeighborhoodGuide } from '../objects/NeighborhoodGuide.js';
import { getNextStop, GUIDE_TEXT } from '../data/neighborhoodGuide.js';
import { UI_COLORS, hexToCSS } from '../data/palettes.js';
import { rollEncounter } from '../data/overworldEvents.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TILE = GAME.TILE;          // 16
const TOTAL_GARLICS = GAME.TOTAL_GARLICS; // 5

// NPC definitions per quiz location (quiz 2 has no NPC — it's the elevator)
const NPC_DEFS = [
  { quizId: 1, key: 'npc_ajumma',      location: 'restaurant' },
  // Quiz 2 = elevator, no NPC
  { quizId: 3, key: 'npc_grandma',      location: 'subway' },
  { quizId: 4, key: 'npc_student',      location: 'chicken' },
  { quizId: 5, key: 'npc_businessman',  location: 'cafe' },
];

// ---------------------------------------------------------------------------
// OverworldScene
// ---------------------------------------------------------------------------

export class OverworldScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.OVERWORLD });
  }

  // =========================================================================
  // Lifecycle
  // =========================================================================

  create() {
    this.isTransitioning = false;
    this.bowCooldown = false;
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this._cleanup, this);

    // --- Build map ---
    this.mapBuilder = new MapBuilder(this);
    this.mapBuilder.buildMap(this.cache.json.get('tilemap_data'));
    this.mapBuilder.placeKoreanBuildings(this);

    // --- Spawn tiger (restore saved position if returning from quiz) ---
    const spawn = StateManager.playerPosition;
    const spawnPx = spawn.x * TILE + TILE / 2;
    const spawnPy = spawn.y * TILE + TILE / 2;
    this.tiger = new Tiger(this, spawnPx, spawnPy);
    this.tiger.setStage(StateManager.getStage());
    this.tiger.setDepth(10);

    // --- Create NPCs ---
    this.npcs = [];
    for (const def of NPC_DEFS) {
      const loc = QUIZ_LOCATIONS[def.location];
      if (!loc) continue;
      const npc = new NPC(this, loc.x, loc.y, def.key, def.quizId);
      npc.setDepth(10);
      // Mark cleared if quiz already completed
      if (StateManager.isQuizCompleted(def.quizId)) {
        npc.markCleared();
      }
      this.npcs.push(npc);
    }

    // --- Quiz location markers (visible from further away than NPC indicators) ---
    this.quizMarkers = [];
    for (const [, loc] of Object.entries(QUIZ_LOCATIONS)) {
      if (StateManager.isQuizCompleted(loc.quizId)) continue;
      const markerX = loc.x * TILE + TILE / 2;
      const markerY = loc.y * TILE - 4;

      // Larger diamond/gem marker above the quiz location (M3 fix)
      const marker = this.add.graphics();
      marker.fillStyle(0xFFD700, 1.0);
      // Bigger diamond shape: 12x16 pixels
      marker.fillTriangle(markerX, markerY - 8, markerX - 6, markerY, markerX + 6, markerY);
      marker.fillTriangle(markerX, markerY + 8, markerX - 6, markerY, markerX + 6, markerY);
      // Bright outline for visibility
      marker.lineStyle(1, 0xFFA500, 1);
      marker.strokeTriangle(markerX, markerY - 8, markerX - 6, markerY, markerX + 6, markerY);
      marker.strokeTriangle(markerX, markerY + 8, markerX - 6, markerY, markerX + 6, markerY);
      marker.setDepth(12);

      // Pulsing animation with higher minimum alpha
      this.tweens.add({
        targets: marker,
        alpha: 0.5,
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      this.quizMarkers.push({ marker, quizId: loc.quizId });
    }

    // --- Camera ---
    this.mapBuilder.setupCamera(this.cameras.main, this.tiger);

    // --- Input ---
    this.inputHandler = new InputHandler(this);

    // --- Flag-based action input (same reliable pattern as QuizScene) ---
    this._actionFlag = false;
    this._actionCooldown = 0;
    const ACTION_COOLDOWN_MS = 150;

    this._onKeyDown = (event) => {
      const key = event.key || event.code;
      const now = Date.now();
      if (key === ' ' || key === 'Space' || key === 'Enter' || key === 'z' || key === 'Z') {
        if (now - this._actionCooldown > ACTION_COOLDOWN_MS) {
          this._actionFlag = true;
          this._actionCooldown = now;
        }
      }
    };
    this.input.keyboard.on('keydown', this._onKeyDown);

    // Mobile touch action support
    this._onPointerDown = () => {
      const now = Date.now();
      if (now - this._actionCooldown > ACTION_COOLDOWN_MS) {
        this._actionFlag = true;
        this._actionCooldown = now;
      }
    };
    this.input.on('pointerdown', this._onPointerDown);

    // --- Dialogue box ---
    this.dialogueBox = new DialogueBox(this);

    // --- Garlic HUD (fixed to camera) ---
    this._createGarlicHUD();
    this.guide = new NeighborhoodGuide(this);
    this._createDestinationHint();

    // --- Fade in ---
    this.cameras.main.fadeIn(300);

    // --- Control hints for first-time players (m3 fix) ---
    this._createControlHints();
    if (!StateManager.guideIntroduced) {
      StateManager.guideIntroduced = true;
      this.dialogueBox.showText(GUIDE_TEXT.welcome.ko, GUIDE_TEXT.welcome.en);
    }
  }

  update(_time, _delta) {
    if (this.isTransitioning) return;

    // --- Consume flag-based action input ---
    const inputAction = this.inputHandler.isActionPressed();
    const actionPressed = this._actionFlag || inputAction;
    const guidePressed = this.inputHandler.isCancelPressed();
    if (guidePressed && !this.dialogueBox.isVisible && !this.tiger.isMoving) {
      this.guide.toggle();
      if (this.proximityPrompt) this.proximityPrompt.setVisible(false);
    }
    if (this._actionFlag) {
      this._actionFlag = false;
    }

    if (this.guide.isVisible || guidePressed) return;

    // --- Dialogue mode ---
    if (this.dialogueBox.isVisible) {
      this.dialogueBox.updateTypewriter();

      if (actionPressed) {
        if (this.dialogueBox.isAnimating) {
          this.dialogueBox.skipAnimation();
        } else {
          this._dismissDialogue();
        }
      }
      return;
    }

    // --- Movement input ---
    if (!this.tiger.isMoving) {
      const dir = this.inputHandler.getDirection();
      if (dir) {
        this._tryMove(dir);
      }

      // --- Action button: interact (flag-based, reliable) ---
      if (actionPressed) {
        this._handleAction();
      }
    }

    // --- Tiger movement update ---
    const wasMoving = this.tiger.isMoving;
    this.tiger.updateMovement();

    // --- On tile arrival (just stopped moving) ---
    if (wasMoving && !this.tiger.isMoving) {
      this._onTileArrived();
    }

    // --- Auto-bow near NPCs (if stage >= 1) ---
    if (StateManager.getStage() >= 1 && !this.tiger.isMoving && !this.bowCooldown) {
      this._checkAutoBow();
    }

    // --- Update garlic HUD ---
    this._updateGarlicHUD();

    // --- NPC proximity prompt (m1 fix) ---
    this._updateNPCProximityPrompt();
  }

  shutdown() {
    this._cleanup();
  }

  destroy() {
    this._cleanup();
  }

  // =========================================================================
  // Movement & Collision
  // =========================================================================

  _tryMove(direction) {
    if (this.tiger.isMoving || this.isTransitioning) return;

    const nextX = this.tiger.gridX + (direction === 'left' ? -1 : direction === 'right' ? 1 : 0);
    const nextY = this.tiger.gridY + (direction === 'up' ? -1 : direction === 'down' ? 1 : 0);

    // Update facing direction even if blocked
    this.tiger.moveDirection = direction;

    // Check map collision via isWalkable (bounds + collision layer)
    if (!isWalkable(nextX, nextY)) return;

    // Check MapBuilder collision (belt-and-suspenders with 2D layer)
    if (this.mapBuilder.getCollisionAt(nextX, nextY)) return;

    // Check NPC collision
    if (this.npcs.some(npc => npc.gridX === nextX && npc.gridY === nextY)) return;

    // All clear — move
    this.tiger.move(direction);
    audioManager.playWalk();
  }

  // =========================================================================
  // Tile arrival
  // =========================================================================

  _onTileArrived() {
    const gx = this.tiger.gridX;
    const gy = this.tiger.gridY;

    this._updateDestinationHint();

    // Save position
    StateManager.savePosition(gx, gy);

    // Record step for encounter system
    StateManager.recordStep();

    // Check victory condition
    if (StateManager.isGameComplete() && !this.isTransitioning) {
      this.isTransitioning = true;
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start(SCENES.VICTORY);
      });
      return;
    }

    // Check door interactions at this tile
    const interaction = this.mapBuilder.getInteractionAt(gx, gy);
    if (interaction && interaction.type === 'door') {
      this._handleDoorInteraction(interaction);
      return;
    }

    // Random encounters on tall grass
    if (isTallGrass(gx, gy) && !this.isTransitioning) {
      const encounter = rollEncounter();
      if (encounter) {
        audioManager.playEncounter();
        this.dialogueBox.showText(encounter.text.ko, encounter.text.en);
      }
    }
  }

  _handleDoorInteraction(interaction) {
    const quizId = interaction.quizId;
    if (!quizId) return;

    if (StateManager.isQuizCompleted(quizId)) {
      // Already cleared — show message
      this.dialogueBox.showText(ALREADY_CLEARED.ko, ALREADY_CLEARED.en);
      return;
    }

    // Transition to quiz
    this.isTransitioning = true;
    audioManager.playDoorEnter();

    createBattleTransition(this, () => {
      this.scene.start(SCENES.QUIZ, { quizId });
    });
  }

  // =========================================================================
  // Action / Interaction
  // =========================================================================

  _handleAction() {
    if (this.isTransitioning) return;

    const gx = this.tiger.gridX;
    const gy = this.tiger.gridY;

    // --- Check adjacent NPCs ---
    const nearNPC = this.npcs.find(npc => npc.isInRange(gx, gy));
    if (nearNPC) {
      audioManager.playConfirm();

      if (nearNPC.isCleared) {
        // Already cleared
        this.dialogueBox.showText(ALREADY_CLEARED.ko, ALREADY_CLEARED.en);
      } else {
        // Start quiz via NPC interaction
        const quizId = nearNPC.interact();
        if (quizId !== null) {
          this.isTransitioning = true;
          audioManager.playEncounter();
          createBattleTransition(this, () => {
            this.scene.start(SCENES.QUIZ, { quizId });
          });
        }
      }
      return;
    }

    // --- Check interaction tiles at or adjacent to tiger ---
    const interaction = this._findNearbyInteraction(gx, gy);
    if (interaction) {
      this._handleEnvironmentInteraction(interaction);
      return;
    }
  }

  /**
   * Find an interaction tile at or adjacent to the tiger in the facing direction.
   */
  _findNearbyInteraction(gx, gy) {
    // Check current tile first
    const here = this.mapBuilder.getInteractionAt(gx, gy);
    if (here && here.type !== 'door') return here;

    // Check tile in facing direction
    const dir = this.tiger.moveDirection;
    const dx = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
    const dy = dir === 'up' ? -1 : dir === 'down' ? 1 : 0;
    const ahead = this.mapBuilder.getInteractionAt(gx + dx, gy + dy);
    if (ahead && ahead.type !== 'door') return ahead;

    return null;
  }

  _handleEnvironmentInteraction(interaction) {
    audioManager.playConfirm();

    switch (interaction.type) {
      case 'sign': {
        const signData = SIGNS.find(s => s.id === interaction.textId);
        if (signData) {
          this.dialogueBox.showText(signData.ko, signData.en);
        }
        break;
      }
      case 'vending': {
        const evt = MINI_EVENTS.vending_machine;
        if (evt) this.dialogueBox.showText(evt.ko, evt.en);
        break;
      }
      case 'convenience': {
        const evt = MINI_EVENTS.convenience_store;
        if (evt) this.dialogueBox.showText(evt.ko, evt.en);
        break;
      }
      case 'pigeon': {
        const evt = MINI_EVENTS.pigeon;
        if (evt) this.dialogueBox.showText(evt.ko, evt.en);
        break;
      }
      case 'flyer': {
        const evt = MINI_EVENTS.flyer_ajumma;
        if (evt) this.dialogueBox.showText(evt.ko, evt.en);
        break;
      }
      case 'bench': {
        const evt = MINI_EVENTS.park_bench;
        if (evt) this.dialogueBox.showText(evt.ko, evt.en);
        break;
      }
      case 'food_cart': {
        const evt = MINI_EVENTS.food_cart;
        if (evt) this.dialogueBox.showText(evt.ko, evt.en);
        break;
      }
      default:
        break;
    }
  }

  // =========================================================================
  // Dialogue
  // =========================================================================

  _dismissDialogue() {
    if (this.dialogueBox.onComplete) {
      const cb = this.dialogueBox.onComplete;
      this.dialogueBox.onComplete = null;
      this.dialogueBox.hide();
      cb();
    } else {
      this.dialogueBox.hide();
    }
  }

  // =========================================================================
  // Auto-bow
  // =========================================================================

  _checkAutoBow() {
    const gx = this.tiger.gridX;
    const gy = this.tiger.gridY;

    for (const npc of this.npcs) {
      if (npc.isInRange(gx, gy)) {
        this.tiger.playBowAnimation();
        audioManager.playBowEffect();
        this.bowCooldown = true;
        this.time.delayedCall(2000, () => { this.bowCooldown = false; });
        break;
      }
    }
  }

  // =========================================================================
  // Garlic HUD
  // =========================================================================

  _createGarlicHUD() {
    const hudX = 4;
    const hudY = 4;

    this.garlicHUD = this.add.container(hudX, hudY);
    this.garlicHUD.setScrollFactor(0);
    this.garlicHUD.setDepth(100);

    // Background
    const bg = this.add.rectangle(0, 0, 52, 16, 0x000000, 0.5);
    bg.setOrigin(0, 0);
    this.garlicHUD.add(bg);

    // Garlic icon (use texture if available, otherwise emoji text)
    if (this.textures.exists('garlic')) {
      const icon = this.add.image(4, 8, 'garlic');
      icon.setOrigin(0, 0.5);
      icon.setDisplaySize(12, 12);
      this.garlicHUD.add(icon);
    } else {
      const iconText = this.add.text(4, 3, '\uD83E\uDDC4', {
        fontSize: '10px',
      });
      this.garlicHUD.add(iconText);
    }

    // Count text
    const count = StateManager.garlicsCollected;
    this.garlicCountText = this.add.text(20, 3, `${count}/${TOTAL_GARLICS}`, {
      fontFamily: `'${GAME.FONT_EN}', ${GAME.FONT_FALLBACK}`,
      fontSize: `${GAME.FONT_SIZE}px`,
      color: '#FFFFFF',
    });
    this.garlicHUD.add(this.garlicCountText);
  }

  _updateGarlicHUD() {
    if (this.garlicCountText) {
      const count = StateManager.garlicsCollected;
      this.garlicCountText.setText(`${count}/${TOTAL_GARLICS}`);
    }
  }

  // =========================================================================
  // NPC Proximity Prompt (m1 fix)
  // =========================================================================

  _updateNPCProximityPrompt() {
    if (!this.tiger || this.tiger.isMoving || this.dialogueBox.isVisible) {
      if (this.proximityPrompt) this.proximityPrompt.setVisible(false);
      return;
    }

    const gx = this.tiger.gridX;
    const gy = this.tiger.gridY;
    const nearNPC = this.npcs.find(npc => !npc.isCleared && npc.isInRange(gx, gy));

    if (nearNPC) {
      if (!this.proximityPrompt) {
        this.proximityPrompt = this.add.text(GAME.WIDTH / 2, GAME.HEIGHT - 52, 'Z/A: 대화 / Talk', {
          fontFamily: `'${GAME.FONT_KO}', ${GAME.FONT_FALLBACK}`,
          fontSize: '9px',
          color: '#FFFFFF',
          backgroundColor: '#000000',
          padding: { x: 4, y: 2 },
        });
        this.proximityPrompt.setOrigin(0.5, 1);
        this.proximityPrompt.setScrollFactor(0);
        this.proximityPrompt.setDepth(999);
      }
      this.proximityPrompt.setVisible(true);
    } else {
      if (this.proximityPrompt) this.proximityPrompt.setVisible(false);
    }
  }

  // =========================================================================
  // Control Hints (m3 fix)
  // =========================================================================

  _createControlHints() {
    // Show brief control hints that fade out after a few seconds
    this.controlHint = this.add.text(GAME.WIDTH / 2, GAME.HEIGHT - 2, `${GUIDE_TEXT.hint.ko}\n${GUIDE_TEXT.hint.en}`, {
      fontFamily: `'${GAME.FONT_KO}', ${GAME.FONT_FALLBACK}`,
      fontSize: '7px',
      color: '#FFFFFF',
      backgroundColor: '#000000',
      padding: { x: 4, y: 2 },
      alpha: 0.8,
    });
    this.controlHint.setOrigin(0.5, 1);
    this.controlHint.setScrollFactor(0);
    this.controlHint.setDepth(999);

    // Fade out after 4 seconds
    this.tweens.add({
      targets: this.controlHint,
      alpha: 0,
      delay: 4000,
      duration: 1000,
      onComplete: () => {
        if (this.controlHint) this.controlHint.destroy();
        this.controlHint = null;
      },
    });
  }

  // =========================================================================
  // Cleanup
  // =========================================================================

  _createDestinationHint() {
    this.destinationHint = this.add.text(GAME.WIDTH - 4, 4, '', {
      fontFamily: `'${GAME.FONT_KO}', ${GAME.FONT_FALLBACK}`,
      fontSize: '8px', color: hexToCSS(UI_COLORS.TEXT_DARK),
      backgroundColor: hexToCSS(UI_COLORS.BOX_BG), padding: { x: 4, y: 2 },
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(100);
    this._updateDestinationHint();
  }

  _updateDestinationHint() {
    if (!this.destinationHint) return;
    const stop = getNextStop(StateManager.completedQuizzes);
    if (!stop) { this.destinationHint.setText('완료 / ALL STAMPS'); return; }
    const dx = stop.x - this.tiger.gridX;
    const dy = stop.y - this.tiger.gridY;
    const direction = `${dy < 0 ? '↑' : dy > 0 ? '↓' : ''}${dx < 0 ? '←' : dx > 0 ? '→' : ''}`;
    this.destinationHint.setText(`${direction} ${stop.name.ko} / ${stop.name.en}`);
  }

  _cleanup() {
    if (this.guide) { this.guide.destroy(); this.guide = null; }
    if (this.destinationHint) { this.destinationHint.destroy(); this.destinationHint = null; }
    if (this._onKeyDown) {
      this.input.keyboard.off('keydown', this._onKeyDown);
      this._onKeyDown = null;
    }
    if (this._onPointerDown) {
      this.input.off('pointerdown', this._onPointerDown);
      this._onPointerDown = null;
    }
    if (this.inputHandler) {
      this.inputHandler.destroy();
      this.inputHandler = null;
    }

    if (this.tiger) {
      this.tiger.destroy();
      this.tiger = null;
    }

    if (this.npcs) {
      for (const npc of this.npcs) {
        if (npc.indicatorBubble) npc.indicatorBubble.destroy();
        if (npc.indicator) npc.indicator.destroy();
        npc.destroy();
      }
      this.npcs = [];
    }

    if (this.dialogueBox) {
      this.dialogueBox.destroy();
      this.dialogueBox = null;
    }

    if (this.mapBuilder) {
      this.mapBuilder.destroy();
      this.mapBuilder = null;
    }

    if (this.quizMarkers) {
      for (const m of this.quizMarkers) {
        if (m.marker) m.marker.destroy();
      }
      this.quizMarkers = [];
    }

    if (this.garlicHUD) {
      this.garlicHUD.destroy();
      this.garlicHUD = null;
    }

    if (this.proximityPrompt) {
      this.proximityPrompt.destroy();
      this.proximityPrompt = null;
    }

    if (this.controlHint) {
      this.controlHint.destroy();
      this.controlHint = null;
    }
  }
}
