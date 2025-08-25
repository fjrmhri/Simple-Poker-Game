// src/core/ai.js
import { getWinners } from "./handEvaluator";

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function estimateWinRate(state, playerIndex, simulations = 200) {
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

    const winRate = estimateWinRate(
      this.state,
      this.state.currentPlayer,
      this.level === "hard" ? 400 : 200
    );

    if (this.level === "normal") {
      if (bet && (winRate > 0.6 || (Math.random() < 0.1 && winRate > 0.3))) {
        const amount = Math.min(bet.max, bet.min + Math.floor(bet.max * winRate));
        return this.queue.push({ action: "bet", amount });
      }
      if (call && winRate > 0.4) return this.queue.push({ action: "call" });
      if (check) return this.queue.push({ action: "check" });
      return this.queue.push({ action: "fold" });
    }

    if (this.level === "hard") {
      if (bet && (winRate > 0.7 || (Math.random() < 0.15 && winRate > 0.4))) {
        const amount = bet.max;
        return this.queue.push({ action: "bet", amount });
      }
      if (call && winRate > 0.5) return this.queue.push({ action: "call" });
      if (check) return this.queue.push({ action: "check" });
      return this.queue.push({ action: "fold" });
    }

    return this.queue.push({ action: "fold" });
  }
}
