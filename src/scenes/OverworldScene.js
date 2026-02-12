// OverworldScene - Scrolling 32x32 Pokemon Gold GBC-style overworld
// Native 160x144 resolution, 8px tiles, 16px sprites
// Manual camera offset (no Phaser camera scroll), swipe/tap/keyboard input

import Phaser from 'phaser';
import { GAME, SCENES } from '../config.js';
import { Tiger } from '../objects/Tiger.js';
import { NPC } from '../objects/NPC.js';
import { audioManager } from '../utils/AudioManager.js';
import { gameState } from '../utils/StateManager.js';
import { inputHandler } from '../utils/InputHandler.js';
import { MAP, NPC_SPAWNS, PLAYER_START, TERRAIN, generateMapData, isTallGrass, isWalkable } from '../data/mapData.js';
import { renderViewport, drawGarlicCounter, createBattleTransition, drawMenuBox, drawCursor } from '../utils/TileRenderer.js';
import { BG_PALETTES, hexToCSS } from '../data/palettes.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SCREEN_W = GAME.WIDTH;   // 160
const SCREEN_H = GAME.HEIGHT;  // 144
const TILE = GAME.TILE;        // 8
const MIN_STEPS = GAME.ENCOUNTER_MIN_STEPS;    // 3
const ENCOUNTER_CHANCE = GAME.ENCOUNTER_CHANCE; // 0.25
const TOTAL_GARLICS = GAME.TOTAL_GARLICS;      // 5

// Menu items
const MENU_ITEMS = ['TIGER', 'GARLIC', 'EXIT'];

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
    // Ensure collision/tallGrass arrays are generated
    generateMapData();

    // --- State ---
    this.isTransitioning = false;
    this.stepsInGrass = 0;
    this.menuOpen = false;
    this.menuCursor = 0;
    this.dialogueActive = false;
    this.dialogueText = '';
    this.dialogueCallback = null;
    this.animFrame = 0;
    this.animTimer = 0;
    this._lastDialogueText = null;

    // --- Camera ---
    this.cameraX = 0;
    this.cameraY = 0;

    // --- Graphics layers ---
    // These get cleared and redrawn each frame
    this.viewportGraphics = null;
    this.hudGraphics = null;
    this.menuGraphics = null;
    this.dialogueGraphics = null;

    // --- Tiger ---
    this.tiger = new Tiger(this, PLAYER_START.col, PLAYER_START.row);

    // --- NPCs ---
    this.npcs = NPC_SPAWNS.map(spawn => new NPC(this, spawn));

    // Update NPC collision entries in the map
    this._updateNPCCollisions();

    // --- Initial camera position ---
    this._updateCamera();

    // --- Input ---
    inputHandler.init(this);
    this._onMoveHandler = (dir) => this._handleMove(dir);
    this._onActionHandler = () => this._handleAction();
    this._onMenuHandler = () => this._handleMenu();
    inputHandler.on('move', this._onMoveHandler);
    inputHandler.on('action', this._onActionHandler);
    inputHandler.on('menu', this._onMenuHandler);

    // --- HUD: garlic counter ---
    this._createHUD();

    // --- Initial render ---
    this._renderFrame();

    // Fade in
    this.cameras.main.fadeIn(300);
  }

  update(time, delta) {
    if (this.isTransitioning) return;

    // Animate water/tall grass tiles
    this.animTimer += delta;
    if (this.animTimer > 500) {
      this.animTimer -= 500;
      this.animFrame = (this.animFrame + 1) % 2;
    }

    // Handle keyboard movement (inputHandler.update emits 'move' for held keys)
    if (!this.menuOpen && !this.dialogueActive) {
      inputHandler.update();
    }

    // Update NPCs (random facing)
    for (const npc of this.npcs) {
      npc.update();
    }

    // Advance tiger animation
    const arrived = this.tiger.update();
    if (arrived) {
      this._onTileArrived();
    }

    // Update camera to follow tiger
    this._updateCamera();

    // Redraw the frame
    this._renderFrame();
  }

  shutdown() {
    this._cleanup();
  }

  // Called when scene is stopped or switched away
  destroy() {
    this._cleanup();
  }

  _cleanup() {
    // Remove input listeners
    inputHandler.off('move', this._onMoveHandler);
    inputHandler.off('action', this._onActionHandler);
    inputHandler.off('menu', this._onMenuHandler);
    inputHandler.destroy();

    // Destroy tiger
    if (this.tiger) {
      this.tiger.destroy();
      this.tiger = null;
    }

    // Destroy NPCs
    if (this.npcs) {
      for (const npc of this.npcs) {
        npc.destroy();
      }
      this.npcs = [];
    }

    // Destroy graphics layers
    if (this.viewportGraphics) {
      this.viewportGraphics.destroy();
      this.viewportGraphics = null;
    }
    if (this.hudGraphics) {
      this.hudGraphics.destroy();
      this.hudGraphics = null;
    }
    this._destroyMenu();
    this._destroyDialogue();
    if (this.garlicContainer) {
      this.garlicContainer.destroy();
      this.garlicContainer = null;
    }
  }

  // =========================================================================
  // Camera
  // =========================================================================

  _updateCamera() {
    if (!this.tiger) return;

    // Center camera on tiger
    let cx = this.tiger.getCenterX() - Math.floor(SCREEN_W / 2);
    let cy = this.tiger.getCenterY() - Math.floor(SCREEN_H / 2);

    // Clamp to map bounds
    const maxX = MAP.width * TILE - SCREEN_W;
    const maxY = MAP.height * TILE - SCREEN_H;
    cx = Math.max(0, Math.min(cx, maxX));
    cy = Math.max(0, Math.min(cy, maxY));

    this.cameraX = cx;
    this.cameraY = cy;
  }

  // =========================================================================
  // Input Handlers
  // =========================================================================

  _handleMove(direction) {
    if (this.isTransitioning) return;

    // Menu navigation
    if (this.menuOpen) {
      if (direction === 'up') {
        this.menuCursor = (this.menuCursor - 1 + MENU_ITEMS.length) % MENU_ITEMS.length;
        audioManager.playSelect();
      } else if (direction === 'down') {
        this.menuCursor = (this.menuCursor + 1) % MENU_ITEMS.length;
        audioManager.playSelect();
      }
      return;
    }

    // Dialogue active: ignore movement
    if (this.dialogueActive) return;

    // Overworld movement
    this._tryMove(direction);
  }

  _handleAction() {
    if (this.isTransitioning) return;

    // Menu selection
    if (this.menuOpen) {
      this._selectMenuItem();
      return;
    }

    // Dismiss dialogue
    if (this.dialogueActive) {
      this._dismissDialogue();
      return;
    }

    // Interact with adjacent NPC
    this._tryNPCInteraction();
  }

  _handleMenu() {
    if (this.isTransitioning) return;

    // Close dialogue first
    if (this.dialogueActive) {
      this._dismissDialogue();
      return;
    }

    // Toggle menu
    if (this.menuOpen) {
      this._closeMenu();
    } else {
      this._openMenu();
    }
  }

  // =========================================================================
  // Movement & Collision
  // =========================================================================

  _tryMove(direction) {
    if (!this.tiger || this.tiger.isMoving || this.isTransitioning) return;

    const nextCol = this.tiger.tileCol + (direction === 'left' ? -1 : direction === 'right' ? 1 : 0);
    const nextRow = this.tiger.tileRow + (direction === 'up' ? -1 : direction === 'down' ? 1 : 0);

    // Check map bounds
    if (nextCol < 0 || nextCol >= MAP.width || nextRow < 0 || nextRow >= MAP.height) {
      this.tiger.direction = direction;
      this.tiger.render();
      return;
    }

    // Check terrain collision
    if (!isWalkable(nextCol, nextRow)) {
      this.tiger.direction = direction;
      this.tiger.render();
      return;
    }

    // Check NPC collision
    if (this.npcs.some(npc => npc.tileCol === nextCol && npc.tileRow === nextRow)) {
      this.tiger.direction = direction;
      this.tiger.render();
      return;
    }

    this.tiger.startMove(direction);
    audioManager.playWalk();
  }

  // =========================================================================
  // Encounter System
  // =========================================================================

  _onTileArrived() {
    const col = this.tiger.tileCol;
    const row = this.tiger.tileRow;

    // Track walked tiles
    gameState.addTilesWalked(1);

    // Check if game is complete (5 garlics) -> victory
    if (gameState.isGameComplete()) {
      this.isTransitioning = true;
      audioManager.playVictory();
      createBattleTransition(this, () => {
        this.scene.start(SCENES.VICTORY);
      });
      return;
    }

    // Check tall grass encounters
    if (isTallGrass(col, row)) {
      this.stepsInGrass++;

      if (this.stepsInGrass >= MIN_STEPS) {
        if (Math.random() < ENCOUNTER_CHANCE) {
          this._triggerEncounter();
        }
      }
    } else {
      // Reset grass counter when leaving tall grass
      this.stepsInGrass = 0;
    }
  }

  _triggerEncounter() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.stepsInGrass = 0;

    audioManager.playEncounter();

    createBattleTransition(this, () => {
      this.scene.start(SCENES.QUIZ);
    });
  }

  // =========================================================================
  // NPC Interaction
  // =========================================================================

  _tryNPCInteraction() {
    if (!this.tiger) return;

    // Find adjacent NPC the tiger is facing
    const facingNPC = this.npcs.find(npc => npc.isAdjacentTo(this.tiger));
    if (!facingNPC) return;

    audioManager.playConfirm();

    // Check if already defeated
    if (facingNPC.isDefeated()) {
      this._showDialogue('Already proved\nyourself here!');
      return;
    }

    // Trigger NPC quiz encounter
    this.isTransitioning = true;

    audioManager.playEncounter();

    createBattleTransition(this, () => {
      this.scene.start(SCENES.QUIZ);
    });
  }

  // =========================================================================
  // NPC Collision Helpers
  // =========================================================================

  /**
   * Mark NPC tile positions in the collision map so the player
   * cannot walk through them. Called once during create().
   * Note: NPCs are stationary, so this only needs to run once.
   */
  _updateNPCCollisions() {
    for (const npc of this.npcs) {
      const idx = npc.tileRow * MAP.width + npc.tileCol;
      if (idx >= 0 && idx < MAP.collision.length) {
        MAP.collision[idx] = 1;
      }
    }
  }

  // =========================================================================
  // START Menu
  // =========================================================================

  _openMenu() {
    this.menuOpen = true;
    this.menuCursor = 0;
    audioManager.playSelect();
  }

  _closeMenu() {
    this.menuOpen = false;
    audioManager.playSelect();
  }

  _selectMenuItem() {
    const item = MENU_ITEMS[this.menuCursor];
    audioManager.playConfirm();

    switch (item) {
      case 'TIGER': {
        const stage = gameState.getTransformationStage();
        const stageNames = [
          'Wild Tiger',
          'Fur Shedding',
          'Growing Taller',
          'Losing TH',
          'Black Hair',
          'Full Korean',
        ];
        const name = stageNames[stage] || 'Wild Tiger';
        this._closeMenu();
        this._showDialogue(`Stage: ${name}`);
        break;
      }
      case 'GARLIC': {
        const count = gameState.getGarlics();
        this._closeMenu();
        this._showDialogue(`Garlics: ${count}/${TOTAL_GARLICS}`);
        break;
      }
      case 'EXIT':
        this._closeMenu();
        break;
    }
  }

  // =========================================================================
  // Dialogue
  // =========================================================================

  _showDialogue(text, callback) {
    this.dialogueActive = true;
    this.dialogueText = text;
    this.dialogueCallback = callback || null;
  }

  _dismissDialogue() {
    this.dialogueActive = false;
    this.dialogueText = '';
    this._destroyDialogue();
    if (this.dialogueCallback) {
      const cb = this.dialogueCallback;
      this.dialogueCallback = null;
      cb();
    }
  }

  // =========================================================================
  // HUD
  // =========================================================================

  _createHUD() {
    const garlicCount = gameState.getGarlics();
    const { container, text } = drawGarlicCounter(
      this, SCREEN_W - 22, 8, garlicCount, TOTAL_GARLICS
    );
    this.garlicContainer = container;
    this.garlicText = text;

    // Ensure HUD is always on top
    this.garlicContainer.setDepth(100);
  }

  _updateHUD() {
    if (this.garlicText) {
      const count = gameState.getGarlics();
      this.garlicText.setText(`${count}/${TOTAL_GARLICS}`);
    }
  }

  // =========================================================================
  // Rendering
  // =========================================================================

  /**
   * Master render function called every frame.
   * Clears and redraws all layers in correct z-order:
   * 1. Viewport (terrain tiles)
   * 2. NPCs (at camera-offset positions)
   * 3. Tiger (at camera-offset position)
   * 4. HUD (garlic counter at fixed screen position)
   * 5. Menu overlay (if open)
   * 6. Dialogue overlay (if active)
   */
  _renderFrame() {
    // --- 1. Viewport (terrain tiles) ---
    if (this.viewportGraphics) {
      this.viewportGraphics.destroy();
      this.viewportGraphics = null;
    }
    this.viewportGraphics = renderViewport(this, MAP, this.cameraX, this.cameraY, this.animFrame);
    this.viewportGraphics.setDepth(0);

    // --- 2. NPCs ---
    for (const npc of this.npcs) {
      if (npc.isVisible(this.cameraX, this.cameraY)) {
        const screenX = npc.pixelX - this.cameraX;
        const screenY = npc.pixelY - this.cameraY;

        if (npc.direction === 'left') {
          npc.graphics.setScale(-1, 1);
          npc.graphics.setPosition(screenX + 16, screenY);
        } else {
          npc.graphics.setScale(1, 1);
          npc.graphics.setPosition(screenX, screenY);
        }

        npc.graphics.setDepth(10);
        npc.graphics.setVisible(true);
      } else {
        npc.graphics.setVisible(false);
      }
    }

    // --- 3. Tiger ---
    if (this.tiger && this.tiger.graphics) {
      const tigerScreenX = this.tiger.pixelX - this.cameraX;
      const tigerScreenY = this.tiger.pixelY - this.cameraY;

      if (this.tiger.direction === 'left') {
        this.tiger.graphics.setScale(-1, 1);
        this.tiger.graphics.setPosition(tigerScreenX + 16, tigerScreenY);
      } else {
        this.tiger.graphics.setScale(1, 1);
        this.tiger.graphics.setPosition(tigerScreenX, tigerScreenY);
      }
      this.tiger.graphics.setDepth(10);
    }

    // --- 4. HUD ---
    this._updateHUD();
    if (this.garlicContainer) {
      this.garlicContainer.setDepth(100);
    }

    // --- 5. Menu overlay ---
    this._renderMenu();

    // --- 6. Dialogue overlay ---
    this._renderDialogue();
  }

  /**
   * Render the START menu as a right-aligned overlay.
   * Only creates/destroys when menu state changes.
   */
  _renderMenu() {
    // Track whether the menu was visible last frame
    const shouldShow = this.menuOpen;
    const wasShowing = !!this.menuGraphics;

    // If menu just closed, destroy
    if (!shouldShow && wasShowing) {
      this._destroyMenu();
      return;
    }

    if (!shouldShow) return;

    // If menu just opened, create it
    if (!wasShowing) {
      this._createMenuGraphics();
    }

    // Update cursor position every frame (cursor may have moved)
    if (this._menuCursorGraphics) {
      this._menuCursorGraphics.clear();
      const menuW = 60;
      const lineH = 14;
      const menuX = SCREEN_W - menuW - 4;
      const menuY = 4;
      const cursorX = menuX + 5;
      const cursorY = menuY + 6 + this.menuCursor * lineH;
      drawCursor(this._menuCursorGraphics, cursorX, cursorY);
    }
  }

  _createMenuGraphics() {
    this._destroyMenu();

    const g = this.add.graphics();
    g.setDepth(200);

    const menuW = 60;
    const lineH = 14;
    const menuH = MENU_ITEMS.length * lineH + 10;
    const menuX = SCREEN_W - menuW - 4;
    const menuY = 4;

    // Draw menu box
    drawMenuBox(g, menuX, menuY, menuW, menuH);
    this.menuGraphics = g;

    // Separate graphics for cursor (redrawn when cursor moves)
    this._menuCursorGraphics = this.add.graphics();
    this._menuCursorGraphics.setDepth(201);

    // Draw text items
    this._menuTexts = [];
    for (let i = 0; i < MENU_ITEMS.length; i++) {
      const textX = menuX + 14;
      const textY = menuY + 5 + i * lineH;
      const txt = this.add.text(textX, textY, MENU_ITEMS[i], {
        fontFamily: GAME.FONT,
        fontSize: `${GAME.FONT_SIZE}px`,
        color: '#000000',
      });
      txt.setDepth(201);
      this._menuTexts.push(txt);
    }
  }

  _destroyMenu() {
    if (this.menuGraphics) {
      this.menuGraphics.destroy();
      this.menuGraphics = null;
    }
    if (this._menuCursorGraphics) {
      this._menuCursorGraphics.destroy();
      this._menuCursorGraphics = null;
    }
    if (this._menuTexts) {
      for (const t of this._menuTexts) t.destroy();
      this._menuTexts = null;
    }
  }

  /**
   * Render dialogue box at the bottom of the screen.
   * Only creates/destroys when dialogue state changes.
   */
  _renderDialogue() {
    const shouldShow = this.dialogueActive;
    const wasShowing = !!this.dialogueGraphics;

    // If dialogue just closed, destroy
    if (!shouldShow && wasShowing) {
      this._destroyDialogue();
      return;
    }

    if (!shouldShow) return;

    // If dialogue just opened or text changed, create it
    if (!wasShowing || this._lastDialogueText !== this.dialogueText) {
      this._createDialogueGraphics();
      this._lastDialogueText = this.dialogueText;
    }
    // Otherwise, keep existing graphics (blink timer keeps running)
  }

  _createDialogueGraphics() {
    this._destroyDialogue();

    const g = this.add.graphics();
    g.setDepth(300);

    const boxH = 36;
    const boxY = SCREEN_H - boxH - 2;
    const boxX = 2;
    const boxW = SCREEN_W - 4;

    // Draw dialogue box frame
    drawMenuBox(g, boxX, boxY, boxW, boxH);
    this.dialogueGraphics = g;

    // Draw text
    const txt = this.add.text(boxX + 8, boxY + 6, this.dialogueText, {
      fontFamily: GAME.FONT,
      fontSize: `${GAME.FONT_SIZE}px`,
      color: '#000000',
      wordWrap: { width: boxW - 20 },
      lineSpacing: 4,
    });
    txt.setDepth(301);
    this._dialogueTextObj = txt;

    // Continue indicator (down triangle, blinking)
    const indicator = this.add.graphics();
    indicator.setDepth(301);
    indicator.fillStyle(0x000000);
    indicator.fillTriangle(
      boxX + boxW - 12, boxY + boxH - 8,
      boxX + boxW - 6, boxY + boxH - 8,
      boxX + boxW - 9, boxY + boxH - 4
    );
    this._dialogueContinue = indicator;

    // Blink the indicator (created once, persists until dialogue closes)
    this._blinkEvent = this.time.addEvent({
      delay: 400,
      callback: () => {
        if (this._dialogueContinue) {
          this._dialogueContinue.setVisible(!this._dialogueContinue.visible);
        }
      },
      loop: true,
    });
  }

  _destroyDialogue() {
    if (this.dialogueGraphics) {
      this.dialogueGraphics.destroy();
      this.dialogueGraphics = null;
    }
    if (this._dialogueTextObj) {
      this._dialogueTextObj.destroy();
      this._dialogueTextObj = null;
    }
    if (this._dialogueContinue) {
      this._dialogueContinue.destroy();
      this._dialogueContinue = null;
    }
    if (this._blinkEvent) {
      this._blinkEvent.destroy();
      this._blinkEvent = null;
    }
    this._lastDialogueText = null;
  }
}
