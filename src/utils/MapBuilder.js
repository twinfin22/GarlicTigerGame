// MapBuilder.js - Assembles the overworld map from tileset data + map layers
// Orchestrates TileRenderer to render ground, decoration, and building layers

import { GAME } from '../config.js';
import { TileRenderer } from './TileRenderer.js';
import { MAP_LAYERS } from '../data/mapData.js';

export class MapBuilder {
  constructor(scene) {
    this.scene = scene;
    this.tileRenderer = new TileRenderer(scene);
    this.mapObjects = [];
  }

  /**
   * Build the full map by rendering all layers in order.
   * @param {object|null} tilesetData - tileset_map.json data (nullable; falls back to colored rects)
   */
  buildMap(tilesetData) {
    if (tilesetData) {
      this.tileRenderer.loadTilesetData(tilesetData);
    }

    const { ground, buildings, decoration } = MAP_LAYERS;

    // Render ground layer (depth 0)
    for (let y = 0; y < ground.length; y++) {
      for (let x = 0; x < ground[y].length; x++) {
        if (ground[y][x]) {
          const obj = this.tileRenderer.drawTile(ground[y][x], x * GAME.TILE, y * GAME.TILE);
          if (obj) {
            obj.setDepth(0);
            this.mapObjects.push(obj);
          }
        }
      }
    }

    // Render decoration layer on top of ground (depth 1)
    for (let y = 0; y < decoration.length; y++) {
      for (let x = 0; x < decoration[y].length; x++) {
        if (decoration[y][x]) {
          const obj = this.tileRenderer.drawTile(decoration[y][x], x * GAME.TILE, y * GAME.TILE);
          if (obj) {
            obj.setDepth(1);
            this.mapObjects.push(obj);
          }
        }
      }
    }

    // Render buildings layer on top of decoration (depth 2)
    for (let y = 0; y < buildings.length; y++) {
      for (let x = 0; x < buildings[y].length; x++) {
        if (buildings[y][x]) {
          const obj = this.tileRenderer.drawTile(buildings[y][x], x * GAME.TILE, y * GAME.TILE);
          if (obj) {
            obj.setDepth(2);
            this.mapObjects.push(obj);
          }
        }
      }
    }
  }

  /**
   * Check collision at a grid position.
   * @param {number} gridX - tile column
   * @param {number} gridY - tile row
   * @returns {boolean} true if blocked
   */
  getCollisionAt(gridX, gridY) {
    const { collision } = MAP_LAYERS;
    if (gridY < 0 || gridY >= collision.length || gridX < 0 || gridX >= collision[0].length) {
      return true; // out of bounds = blocked
    }
    return collision[gridY][gridX] === 1;
  }

  /**
   * Get interaction data at a grid position.
   * @param {number} gridX - tile column
   * @param {number} gridY - tile row
   * @returns {object|null} interaction definition or null
   */
  getInteractionAt(gridX, gridY) {
    return MAP_LAYERS.interactions.find(i => i.x === gridX && i.y === gridY) || null;
  }

  /**
   * Get the player spawn position from map data.
   * @returns {{ x: number, y: number }} tile coordinates
   */
  getPlayerSpawn() {
    return MAP_LAYERS.playerSpawn;
  }

  /**
   * Configure the Phaser camera to follow a target within map bounds.
   * @param {Phaser.Cameras.Scene2D.Camera} camera
   * @param {Phaser.GameObjects.GameObject} target - sprite/object to follow
   */
  setupCamera(camera, target) {
    camera.setBounds(0, 0, GAME.MAP_COLS * GAME.TILE, GAME.MAP_ROWS * GAME.TILE);
    camera.startFollow(target, true, 0.5, 0.5);
  }

  /**
   * Place Korean prop sprite overlays at specific building locations.
   * Only renders if the relevant texture keys exist in the scene's texture manager.
   * @param {Phaser.Scene} scene
   */
  placeKoreanBuildings(scene) {
    const overlays = [
      { key: 'chicken_shop', x: 5, y: 23, depth: 3 },
      { key: 'conv_store', x: 32, y: 17, depth: 3 },
      { key: 'pojangmacha', x: 10, y: 21, depth: 3 },
    ];

    overlays.forEach(o => {
      if (scene.textures.exists(o.key)) {
        const sprite = scene.add.image(o.x * GAME.TILE, o.y * GAME.TILE, o.key);
        sprite.setOrigin(0, 0);
        sprite.setDepth(o.depth);
        this.mapObjects.push(sprite);
      }
    });
  }

  /**
   * Destroy all map objects (for cleanup on scene shutdown).
   */
  destroy() {
    for (const obj of this.mapObjects) {
      if (obj && obj.destroy) {
        obj.destroy();
      }
    }
    this.mapObjects = [];
  }
}
