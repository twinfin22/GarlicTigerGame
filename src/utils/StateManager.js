// StateManager - Handles all game state
import { INITIAL_STATE } from '../config.js';

class StateManager {
  constructor() {
    this.state = { ...INITIAL_STATE };
  }

  // Reset to initial state
  reset() {
    this.state = { ...INITIAL_STATE };
  }

  // Get current state
  getState() {
    return { ...this.state };
  }

  // Update state
  setState(updates) {
    this.state = { ...this.state, ...updates };
  }

  // Garlic management
  addGarlic() {
    this.state.garlicsCollected++;
    this.state.transformationStage++;
    this.state.currentQuiz++;
  }

  getGarlics() {
    return this.state.garlicsCollected;
  }

  // Quiz management
  getCurrentQuizIndex() {
    return this.state.currentQuiz;
  }

  // Transformation stage
  getTransformationStage() {
    return this.state.transformationStage;
  }

  // Walking/encounter management
  addTilesWalked(count = 1) {
    this.state.tilesWalked += count;
  }

  getTilesWalked() {
    return this.state.tilesWalked;
  }

  resetTilesWalked() {
    this.state.tilesWalked = 0;
  }

  // Game flow
  startGame() {
    this.state.gameStarted = true;
  }

  completeGame() {
    this.state.gameCompleted = true;
  }

  isGameComplete() {
    return this.state.garlicsCollected >= 5;
  }
}

// Singleton instance
export const gameState = new StateManager();
