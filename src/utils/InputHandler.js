export class InputHandler {
  constructor(scene) {
    this.scene = scene;
    this.keys = {};
    this.direction = null;
    this.actionPressed = false;
    this.cancelPressed = false;
    this.isMobile = 'ontouchstart' in window;

    // Desktop keyboard
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.keys.space = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keys.enter = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.keys.z = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.keys.x = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.keys.esc = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    // Mobile controls
    if (this.isMobile) {
      this.createMobileControls();
    }

    // Touch state
    this.touchDirection = null;
    this.touchAction = false;
    this.touchCancel = false;
  }

  createMobileControls() {
    // Create DOM overlay for mobile D-pad + A/B buttons
    const overlay = document.createElement('div');
    overlay.id = 'mobile-controls';
    overlay.style.cssText = 'position:fixed;bottom:10px;left:0;right:0;display:flex;justify-content:space-between;padding:0 20px;z-index:1000;pointer-events:none;';

    // D-pad (left side)
    const dpad = document.createElement('div');
    dpad.style.cssText = 'display:grid;grid-template-columns:40px 40px 40px;grid-template-rows:40px 40px 40px;gap:2px;pointer-events:auto;';

    const dirs = [
      { label: '', grid: '1/1', dir: null },
      { label: '\u25B2', grid: '1/2', dir: 'up' },
      { label: '', grid: '1/3', dir: null },
      { label: '\u25C4', grid: '2/1', dir: 'left' },
      { label: '', grid: '2/2', dir: null },
      { label: '\u25BA', grid: '2/3', dir: 'right' },
      { label: '', grid: '3/1', dir: null },
      { label: '\u25BC', grid: '3/2', dir: 'down' },
      { label: '', grid: '3/3', dir: null },
    ];

    dirs.forEach(d => {
      const btn = document.createElement('div');
      btn.style.cssText = `grid-area:${d.grid};display:flex;align-items:center;justify-content:center;font-size:20px;color:#fff;opacity:${d.dir ? 0.6 : 0};user-select:none;-webkit-user-select:none;`;
      btn.textContent = d.label;
      if (d.dir) {
        btn.addEventListener('touchstart', (e) => { e.preventDefault(); this.touchDirection = d.dir; });
        btn.addEventListener('touchend', (e) => { e.preventDefault(); this.touchDirection = null; });
      }
      dpad.appendChild(btn);
    });

    // Buttons (right side)
    const btns = document.createElement('div');
    btns.style.cssText = 'display:flex;gap:10px;align-items:flex-end;pointer-events:auto;';

    const btnB = document.createElement('div');
    btnB.style.cssText = 'width:44px;height:44px;border-radius:22px;background:rgba(255,255,255,0.3);display:flex;align-items:center;justify-content:center;font-size:14px;color:#fff;user-select:none;';
    btnB.textContent = 'B';
    btnB.addEventListener('touchstart', (e) => { e.preventDefault(); this.touchCancel = true; });
    btnB.addEventListener('touchend', (e) => { e.preventDefault(); this.touchCancel = false; });

    const btnA = document.createElement('div');
    btnA.style.cssText = 'width:44px;height:44px;border-radius:22px;background:rgba(255,255,255,0.3);display:flex;align-items:center;justify-content:center;font-size:14px;color:#fff;user-select:none;';
    btnA.textContent = 'A';
    btnA.addEventListener('touchstart', (e) => { e.preventDefault(); this.touchAction = true; });
    btnA.addEventListener('touchend', (e) => { e.preventDefault(); this.touchAction = false; });

    btns.appendChild(btnB);
    btns.appendChild(btnA);

    overlay.appendChild(dpad);
    overlay.appendChild(btns);
    document.body.appendChild(overlay);

    this.overlayElement = overlay;
  }

  getDirection() {
    // Mobile first
    if (this.touchDirection) return this.touchDirection;

    // Keyboard
    if (this.cursors.up.isDown) return 'up';
    if (this.cursors.down.isDown) return 'down';
    if (this.cursors.left.isDown) return 'left';
    if (this.cursors.right.isDown) return 'right';

    return null;
  }

  isActionPressed() {
    if (this.touchAction) {
      this.touchAction = false;
      return true;
    }
    return Phaser.Input.Keyboard.JustDown(this.keys.space) ||
           Phaser.Input.Keyboard.JustDown(this.keys.enter) ||
           Phaser.Input.Keyboard.JustDown(this.keys.z);
  }

  isCancelPressed() {
    if (this.touchCancel) {
      this.touchCancel = false;
      return true;
    }
    return Phaser.Input.Keyboard.JustDown(this.keys.x) ||
           Phaser.Input.Keyboard.JustDown(this.keys.esc);
  }

  destroy() {
    if (this.overlayElement) {
      this.overlayElement.remove();
    }
  }
}
