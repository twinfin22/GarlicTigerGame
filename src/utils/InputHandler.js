// InputHandler.js — Shared gesture-based input for all scenes
// Swipe to move, tap to interact, long press for menu, keyboard fallback

class InputHandler {
  constructor() {
    this.scene = null;
    this.listeners = { move: [], action: [], menu: [] };
    this.pointerStartX = 0;
    this.pointerStartY = 0;
    this.pointerStartTime = 0;
    this.isPointerDown = false;
    this.swipeDirection = null;
    this.holdTimer = null;
    this.walkRepeatTimer = null;
    this.longPressTimer = null;
    this.cursors = null;
    this.keySpace = null;
    this.keyEnter = null;
    this.keyEsc = null;
  }

  init(scene) {
    this.destroy(); // Clean up previous
    this.scene = scene;

    // Touch/mouse
    scene.input.on('pointerdown', this._onPointerDown, this);
    scene.input.on('pointermove', this._onPointerMove, this);
    scene.input.on('pointerup', this._onPointerUp, this);

    // Keyboard
    if (scene.input.keyboard) {
      this.cursors = scene.input.keyboard.createCursorKeys();
      this.keySpace = scene.input.keyboard.addKey('SPACE');
      this.keyEnter = scene.input.keyboard.addKey('ENTER');
      this.keyEsc = scene.input.keyboard.addKey('ESC');

      this.keySpace.on('down', () => this._emit('action'));
      this.keyEnter.on('down', () => this._emit('action'));
      this.keyEsc.on('down', () => this._emit('menu'));
    }
  }

  // Call in scene's update() to check held keyboard directions
  update() {
    if (!this.cursors) return;
    if (this.cursors.up.isDown) this._emit('move', 'up');
    else if (this.cursors.down.isDown) this._emit('move', 'down');
    else if (this.cursors.left.isDown) this._emit('move', 'left');
    else if (this.cursors.right.isDown) this._emit('move', 'right');
  }

  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  removeAllListeners() {
    this.listeners = { move: [], action: [], menu: [] };
  }

  _emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  _onPointerDown(pointer) {
    this.pointerStartX = pointer.x;
    this.pointerStartY = pointer.y;
    this.pointerStartTime = Date.now();
    this.isPointerDown = true;
    this.swipeDirection = null;

    // Start long press timer
    this.longPressTimer = this.scene.time.delayedCall(500, () => {
      if (this.isPointerDown && !this.swipeDirection) {
        this._emit('menu');
        this.isPointerDown = false;
      }
    });
  }

  _onPointerMove(pointer) {
    if (!this.isPointerDown) return;

    const dx = pointer.x - this.pointerStartX;
    const dy = pointer.y - this.pointerStartY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 10) {
      // Cancel long press
      if (this.longPressTimer) {
        this.longPressTimer.destroy();
        this.longPressTimer = null;
      }

      // Determine swipe direction
      if (Math.abs(dx) > Math.abs(dy)) {
        this.swipeDirection = dx > 0 ? 'right' : 'left';
      } else {
        this.swipeDirection = dy > 0 ? 'down' : 'up';
      }

      this._emit('move', this.swipeDirection);

      // Start hold-to-walk repeat
      if (!this.walkRepeatTimer) {
        this.walkRepeatTimer = this.scene.time.addEvent({
          delay: 150,
          callback: () => {
            if (this.isPointerDown && this.swipeDirection) {
              this._emit('move', this.swipeDirection);
            }
          },
          loop: true,
        });
      }
    }
  }

  _onPointerUp(pointer) {
    const elapsed = Date.now() - this.pointerStartTime;
    const dx = pointer.x - this.pointerStartX;
    const dy = pointer.y - this.pointerStartY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Tap detection
    if (elapsed < 200 && dist < 10) {
      this._emit('action');
    }

    this.isPointerDown = false;
    this.swipeDirection = null;

    // Clean up timers
    if (this.longPressTimer) {
      this.longPressTimer.destroy();
      this.longPressTimer = null;
    }
    if (this.walkRepeatTimer) {
      this.walkRepeatTimer.destroy();
      this.walkRepeatTimer = null;
    }
  }

  destroy() {
    if (this.scene) {
      this.scene.input.off('pointerdown', this._onPointerDown, this);
      this.scene.input.off('pointermove', this._onPointerMove, this);
      this.scene.input.off('pointerup', this._onPointerUp, this);
    }
    if (this.longPressTimer) this.longPressTimer.destroy();
    if (this.walkRepeatTimer) this.walkRepeatTimer.destroy();
    this.removeAllListeners();
    this.scene = null;
    this.cursors = null;
  }
}

// Singleton
export const inputHandler = new InputHandler();
