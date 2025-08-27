import { RANKS, SUITS } from "./constants";

export function makeDeck() {
  const deck = [];
  for (const r of RANKS) for (const s of SUITS) deck.push({ rank: r, suit: s });
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function clone(obj) {
  if (obj === null || obj === undefined) {
    throw new Error("clone requires a valid object");
  }
  return JSON.parse(JSON.stringify(obj));
}

export function nextAliveIndex(players, from) {
  if (!Array.isArray(players)) {
    throw new Error("nextAliveIndex expects players array");
  }
  const n = players.length;
  let idx = (from + 1) % n;
  while (players[idx].folded || players[idx].chips === 0) {
    idx = (idx + 1) % n;
  }
  return idx;
}

export function allActiveMatchedBet(players) {
  if (!Array.isArray(players)) {
    throw new Error("allActiveMatchedBet expects players array");
  }
  let target = null;
  for (const p of players) {
    if (p.folded || p.chips === 0) continue;
    if (p.lastAction === null) return false;
    if (target === null) target = p.bet;
    if (p.bet !== target) return false;
  }
  return true;
}

export function countActive(players) {
  if (!Array.isArray(players)) {
    throw new Error("countActive expects players array");
  }
  return players.filter((p) => !p.folded).length;
}

export function distributePot(state) {
  if (!state?.winners || state.winners.length === 0) {
    throw new Error("distributePot requires winners to distribute");
  }
  const share = Math.floor(state.pot / state.winners.length);
  const remainder = state.pot % state.winners.length;
  state.winners.forEach((idx) => {
    state.players[idx].chips += share;
  });
  if (remainder > 0) {
    state.players[state.winners[0]].chips += remainder;
  }
  state.pot = 0;
}
