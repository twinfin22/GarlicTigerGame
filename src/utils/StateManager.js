import { GAME } from '../config.js';

class StateManagerClass {
  constructor() {
    this.reset();
  }

  reset() {
    this.garlicsCollected = 0;
    this.transformationStage = 0;
    this.completedQuizzes = [];
    this.wrongAnswerCounts = {};
    this.totalWrongAnswers = 0;
    this.playerPosition = { x: 20, y: 31 };
    this.gameCompleted = false;
    this.stepsSinceEncounter = 0;
    this.totalSteps = 0;
  }

  completeQuiz(quizId) {
    if (!this.completedQuizzes.includes(quizId)) {
      this.completedQuizzes.push(quizId);
      this.garlicsCollected++;
      this.transformationStage = this.garlicsCollected;
    }
    if (this.garlicsCollected >= GAME.TOTAL_GARLICS) {
      this.gameCompleted = true;
    }
  }

  recordWrongAnswer(quizId) {
    if (!this.wrongAnswerCounts[quizId]) this.wrongAnswerCounts[quizId] = 0;
    this.wrongAnswerCounts[quizId]++;
    this.totalWrongAnswers++;
  }

  isQuizCompleted(quizId) {
    return this.completedQuizzes.includes(quizId);
  }

  getStage() { return this.transformationStage; }

  getTotalTries() {
    return this.garlicsCollected + this.totalWrongAnswers;
  }

  savePosition(x, y) {
    this.playerPosition = { x, y };
  }

  getShareData() {
    return {
      stage: this.transformationStage,
      garlics: this.garlicsCollected,
      totalTries: this.getTotalTries(),
      completed: this.gameCompleted,
      wrongAnswers: this.totalWrongAnswers,
    };
  }

  isGameComplete() {
    return this.garlicsCollected >= GAME.TOTAL_GARLICS;
  }

  recordStep() {
    this.totalSteps++;
    this.stepsSinceEncounter++;
  }

  resetEncounterSteps() {
    this.stepsSinceEncounter = 0;
  }
}

export const StateManager = new StateManagerClass();
