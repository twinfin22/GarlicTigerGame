// StateManager - Game state management

import { INITIAL_STATE } from '../config.js';

class StateManager {
  constructor() {
    this.state = { ...INITIAL_STATE };
  }

  reset() {
    this.state = { ...INITIAL_STATE, defeatedNPCs: [] };
  }

  getState() { return { ...this.state }; }

  setState(updates) {
    this.state = { ...this.state, ...updates };
  }

  // Garlic management
  addGarlic() {
    this.state.garlicsCollected++;
    this.state.transformationStage++;
    this.state.currentQuiz++;
  }

  getGarlics() { return this.state.garlicsCollected; }

  // Quiz management
  getCurrentQuizIndex() { return this.state.currentQuiz; }

  // Transformation stage
  getTransformationStage() { return this.state.transformationStage; }

  // Walking/encounter management
  addTilesWalked(count = 1) { this.state.tilesWalked += count; }
  getTilesWalked() { return this.state.tilesWalked; }
  resetTilesWalked() { this.state.tilesWalked = 0; }

  // NPC defeat tracking
  defeatNPC(npcId) {
    if (!this.state.defeatedNPCs.includes(npcId)) {
      this.state.defeatedNPCs.push(npcId);
    }
  }

  isNPCDefeated(npcId) {
    return this.state.defeatedNPCs.includes(npcId);
  }

  getNextUndefeatedNPC() {
    // Returns the quiz index for the next undefeated NPC
    return this.state.currentQuiz;
  }

  // Game flow
  startGame() { this.state.gameStarted = true; }
  completeGame() { this.state.gameCompleted = true; }
  isGameComplete() { return this.state.garlicsCollected >= 5; }
}

export const gameState = new StateManager();
