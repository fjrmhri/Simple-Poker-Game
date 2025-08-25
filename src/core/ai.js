// src/core/ai.js
import { evaluateHandPublic, toInternal } from "./handEvaluator";

export class AIBot {
  constructor(game, state, queue = { push: () => {} }, level = "easy") {
    this.game = game;
    this.state = state;
    this.queue = queue;
    this.level = level;
  }

  run() {
    const actions = this.game.actions(this.state);
    if (!actions.length) return;

    const check = actions.find((a) => a.type === "check");
    const call = actions.find((a) => a.type === "call");
    const bet = actions.find((a) => a.type === "bet");

    if (this.level === "easy") {
      if (check) return this.queue.push({ action: "check" });
      if (call) return this.queue.push({ action: "call" });
      if (bet)
        return this.queue.push({ action: "bet", amount: Math.min(20, bet.max ?? 20) });
      return this.queue.push({ action: "fold" });
    }

    const player = this.state.players[this.state.currentPlayer];
    const cards = [...player.hand, ...this.state.community].map(toInternal);
    const strength = evaluateHandPublic(cards).rankValue;

    if (this.level === "normal") {
      if (strength >= 2 && bet)
        return this.queue.push({ action: "bet", amount: Math.min(40, bet.max ?? 40) });
      if (call && strength >= 1) return this.queue.push({ action: "call" });
      if (check) return this.queue.push({ action: "check" });
      return this.queue.push({ action: "fold" });
    }

    if (this.level === "hard") {
      if (strength >= 3 && bet)
        return this.queue.push({ action: "bet", amount: bet.max });
      if (strength >= 1 && call) return this.queue.push({ action: "call" });
      if (check) return this.queue.push({ action: "check" });
      return this.queue.push({ action: "fold" });
    }

    return this.queue.push({ action: "fold" });
  }
}
