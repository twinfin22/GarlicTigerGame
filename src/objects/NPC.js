import { GAME } from '../config.js';

export class NPC extends Phaser.GameObjects.Sprite {
  constructor(scene, gridX, gridY, npcKey, quizId) {
    const worldX = gridX * GAME.TILE + GAME.TILE / 2;
    const worldY = gridY * GAME.TILE + GAME.TILE / 2;

    super(scene, worldX, worldY, npcKey || 'npc_ajumma');
    scene.add.existing(this);

    this.gridX = gridX;
    this.gridY = gridY;
    this.npcKey = npcKey;
    this.quizId = quizId;
    this.isCleared = false;
    this.setOrigin(0.5, 0.5);

    // "!" speech bubble indicator (or checkmark if cleared)
    // Draw a larger bubble background behind the "!" so it's visible above buildings
    this.indicatorBubble = scene.add.graphics();
    this.indicatorBubble.fillStyle(0xFFFFFF, 1);
    this.indicatorBubble.fillRoundedRect(-10, -10, 20, 20, 4);
    this.indicatorBubble.lineStyle(2, 0x000000, 1);
    this.indicatorBubble.strokeRoundedRect(-10, -10, 20, 20, 4);
    this.indicatorBubble.setPosition(worldX, worldY - 22);
    this.indicatorBubble.setDepth(15);

    this.indicator = scene.add.text(worldX, worldY - 22, '!', {
      fontFamily: `'${GAME.FONT_EN}', ${GAME.FONT_FALLBACK}`,
      fontSize: '12px',
      color: '#FF0000',
      fontStyle: 'bold',
    });
    this.indicator.setOrigin(0.5, 0.5);
    this.indicator.setDepth(16);

    // Bob animation — include both sprite and indicator so they move together
    scene.tweens.add({
      targets: [this, this.indicator, this.indicatorBubble],
      y: '-=2',
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  isInRange(tigerGridX, tigerGridY) {
    const dx = Math.abs(tigerGridX - this.gridX);
    const dy = Math.abs(tigerGridY - this.gridY);
    return dx <= 1 && dy <= 1 && (dx + dy) <= 1;
  }

  markCleared() {
    this.isCleared = true;
    this.indicator.setText('\u2713');
    this.indicator.setColor('#00AA00');
    // Redraw bubble with green tint for cleared state (matching larger size)
    if (this.indicatorBubble) {
      this.indicatorBubble.clear();
      this.indicatorBubble.fillStyle(0xE8FFE8, 1);
      this.indicatorBubble.fillRoundedRect(-10, -10, 20, 20, 4);
      this.indicatorBubble.lineStyle(2, 0x00AA00, 1);
      this.indicatorBubble.strokeRoundedRect(-10, -10, 20, 20, 4);
    }
  }

  interact() {
    if (this.isCleared) return null;
    return this.quizId;
  }
}
