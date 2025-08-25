// src/core/ai.js

export class AIBot {
  constructor(game, state, queue = { push: () => {} }) {
    this.game = game;
    this.state = state;
    this.queue = queue;
  }

  run() {
    const actions = this.game.actions(this.state);
    if (!actions.length) return;

    // Prioritas simple: check > call > bet kecil > fold
    const check = actions.find((a) => a.type === "check");
    if (check) return this.queue.push({ action: "check" });

    const call = actions.find((a) => a.type === "call");
    if (call) return this.queue.push({ action: "call" });

    const bet = actions.find((a) => a.type === "bet");
    if (bet) {
      const amt = Math.min(20, bet.max ?? 20);
      return this.queue.push({ action: "bet", amount: amt });
    }

    return this.queue.push({ action: "fold" });
  }
}
