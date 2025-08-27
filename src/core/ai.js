// src/core/ai.js
import { getWinners } from "./handEvaluator";

/**
 * Shuffle an array of cards using Fisher-Yates algorithm.
 * @param {Array} arr - Array to shuffle.
 */
function shuffle(arr) {
  if (!Array.isArray(arr)) {
    throw new Error("shuffle expects an array");
  }
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/**
 * Calculate pot odds for a bet.
 * @param {number} potSize - Current size of the pot.
 * @param {number} amountToCall - Amount required to call.
 * @returns {number} Pot odds value.
 */
function calculatePotOdds(potSize, amountToCall) {
  if (potSize < 0 || amountToCall < 0) {
    throw new Error("Pot size and call amount must be non-negative");
  }
  return amountToCall / (potSize + amountToCall);
}

/**
 * Estimate the win rate of the current hand via Monte Carlo simulation.
 * @param {object} state - Current game state.
 * @param {number} playerIndex - Index of hero player in state.players.
 * @param {number} [simulations=200] - Number of simulations to run.
 * @returns {number} Estimated win rate.
 */
function estimateWinRate(state, playerIndex, simulations = 200) {
  if (!state?.players || !Array.isArray(state.players)) {
    throw new Error("Invalid game state for win rate estimation");
  }
  if (playerIndex < 0 || playerIndex >= state.players.length) {
    throw new Error("Invalid player index for win rate estimation");
  }

  const hero = state.players[playerIndex];
  const opponents = state.players.filter(
    (_, i) => i !== playerIndex && !state.players[i].folded
  );
  if (opponents.length === 0) return 1;

  let wins = 0;
  let ties = 0;

  for (let s = 0; s < simulations; s++) {
    const deck = [...state.deck];
    const community = [...state.community];
    shuffle(deck);
    while (community.length < 5) community.push(deck.pop());
    const simPlayers = [{ hand: hero.hand }];
    for (let i = 0; i < opponents.length; i++) {
      simPlayers.push({ hand: [deck.pop(), deck.pop()] });
    }
    const winners = getWinners(simPlayers, community);
    if (winners.length === 1 && winners[0] === simPlayers[0]) wins++;
    else if (winners.includes(simPlayers[0])) ties++;
  }

  return (wins + ties / 2) / simulations;
}

export class AIBot {
  /**
    * Create a new AI bot instance.
    * @param {object} game - Poker game engine.
    * @param {object} state - Current game state.
    * @param {object} queue - Queue for pushing bot actions.
    * @param {"easy"|"normal"|"hard"} level - Bot difficulty level.
    */
  constructor(game, state, queue = { push: () => {} }, level = "easy") {
    if (!game || !state) {
      throw new Error("Game and state are required to initialize AIBot");
    }
    this.game = game;
    this.state = state;
    this.queue = queue;
    this.level = level;
  }

  /**
   * Execute the bot's action based on current state and difficulty level.
   */
  run() {
    const actions = this.game.actions(this.state);
    if (!actions.length) {
      console.error("AIBot.run: no available actions");
      return;
    }

    const check = actions.find((a) => a.type === "check");
    const call = actions.find((a) => a.type === "call");
    const bet = actions.find((a) => a.type === "bet");

    if (this.level === "easy") {
      if (check) return this.queue.push({ action: "check" });
      if (call) return this.queue.push({ action: "call" });
      if (bet) {
        const amount = Math.min(20, bet.max ?? 20);
        return this.queue.push({ action: "bet", amount });
      }
      return this.queue.push({ action: "fold" });
    }

    const winRate = estimateWinRate(
      this.state,
      this.state.currentPlayer,
      this.level === "hard" ? 400 : 200
    );
    const potSize = this.game.calculatePot(this.state);
    const toCallAmount = this.game.toCallOf(this.state, this.state.currentPlayer);
    const potOdds = toCallAmount > 0 ? calculatePotOdds(potSize, toCallAmount) : 0;

    if (this.level === "normal") {
      if (
        bet &&
        winRate > Math.max(0.6, potOdds + 0.1) &&
        (winRate > 0.6 || (Math.random() < 0.1 && winRate > potOdds))
      ) {
        const amount = Math.min(bet.max, bet.min + Math.floor(bet.max * winRate));
        return this.queue.push({ action: "bet", amount });
      }
      if (call && winRate > potOdds) return this.queue.push({ action: "call" });
      if (check) return this.queue.push({ action: "check" });
      return this.queue.push({ action: "fold" });
    }

    if (this.level === "hard") {
      if (
        bet &&
        winRate > Math.max(0.7, potOdds + 0.1) &&
        (winRate > 0.7 || (Math.random() < 0.15 && winRate > potOdds))
      ) {
        const amount = bet.max;
        return this.queue.push({ action: "bet", amount });
      }
      if (call && winRate > potOdds) return this.queue.push({ action: "call" });
      if (check) return this.queue.push({ action: "check" });
      return this.queue.push({ action: "fold" });
    }

    return this.queue.push({ action: "fold" });
  }
}
