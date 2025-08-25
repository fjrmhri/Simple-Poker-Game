// src/core/models.js

// Util
const RANKS = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];
const SUITS = ["C", "D", "H", "S"]; // Clubs, Diamonds, Hearts, Spades

function makeDeck() {
  const deck = [];
  for (const r of RANKS) for (const s of SUITS) deck.push({ rank: r, suit: s });
  // shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function rankValue(r) {
  const i = RANKS.indexOf(r);
  return i < 0 ? 0 : i + 2; // 2..14
}

function visibleCardBack() {
  return { back: true };
}

function nextAliveIndex(players, from) {
  const n = players.length;
  let idx = (from + 1) % n;
  while (players[idx].folded) {
    idx = (idx + 1) % n;
  }
  return idx;
}

function allActiveMatchedBet(players) {
  let target = null;
  for (const p of players) {
    if (p.folded) continue;
    if (target === null) target = p.bet;
    if (p.bet !== target) return false;
  }
  return true;
}

function countActive(players) {
  return players.filter((p) => !p.folded).length;
}

// Super simpel evaluator: high card dari 7 kartu (placeholder, cukup untuk demo UI)
function bestHighCardOf(player, community) {
  const cards = [...player.hand, ...community].filter(Boolean);
  let m = 0;
  for (const c of cards) m = Math.max(m, rankValue(c.rank));
  return m;
}

export default class Game {
  constructor(players = []) {
    // players input: [{ name, isBot? }]
    this.templatePlayers = players.map((p) => ({
      name: p.name,
      isBot: !!p.isBot,
    }));
  }

  start() {
    const deck = makeDeck();
    const players = this.templatePlayers.map((p) => ({
      name: p.name,
      isBot: p.isBot,
      chips: 1000,
      bet: 0,
      folded: false,
      hand: [deck.pop(), deck.pop()],
    }));
    return {
      players,
      pot: 0,
      deck,
      community: [],
      dealerIndex: 0,
      currentPlayer: 0,
      round: "Preflop", // Preflop -> Flop -> Turn -> River -> Showdown
      winners: [],
      endgame: false,
    };
  }

  // Derivations
  currentBet(state) {
    return Math.max(...state.players.map((p) => p.bet));
  }

  toCallOf(state, idx) {
    const p = state.players[idx];
    return Math.max(0, this.currentBet(state) - p.bet);
  }

  actions(state) {
    const p = state.players[state.currentPlayer];
    if (state.endgame || state.round === "Showdown") return [];
    if (p.folded) return [];

    const toCall = this.toCallOf(state, state.currentPlayer);
    const acts = [];
    // urutan tombol: Fold, Check/Call, Bet/Raise
    acts.push({ type: "fold" });
    if (toCall === 0) {
      acts.push({ type: "check" });
      if (p.chips > 0) acts.push({ type: "bet", min: 10, max: p.chips }); // bet pertama
    } else {
      acts.push({ type: "call", amount: Math.min(toCall, p.chips) });
      if (p.chips > toCall)
        acts.push({ type: "bet", min: 10, max: p.chips - toCall }); // raise sebagai 'bet'
    }
    return acts;
  }

  calculatePot(state) {
    return state.pot + state.players.reduce((s, p) => s + p.bet, 0);
  }

  checkGameStatus(state) {
    if (state.endgame) return "ended";
    if (state.round === "Showdown") return "showdown";
    return "playing";
  }

  checkWinners(state) {
    if (state.round !== "Showdown") return [];
    // 1) jika hanya 1 pemain aktif -> dia pemenang
    const alive = state.players
      .map((p, i) => ({ ...p, i }))
      .filter((p) => !p.folded);
    if (alive.length === 1) return [alive[0].i];

    // 2) high-card sederhana
    let best = -1;
    let winners = [];
    for (const pl of alive) {
      const hv = bestHighCardOf(pl, state.community);
      if (hv > best) {
        best = hv;
        winners = [pl.i];
      } else if (hv === best) {
        winners.push(pl.i);
      }
    }
    return winners;
  }

  // Apply action immutably
  applyAction(state, action, amount = 0) {
    const s = clone(state);
    const idx = s.currentPlayer;
    const p = s.players[idx];

    if (action === "fold") {
      p.folded = true;
    } else if (action === "check") {
      // only allowed if toCall = 0 (diasumsikan UI sudah memberi benar)
    } else if (action === "call") {
      const need = this.toCallOf(s, idx);
      const pay = Math.min(need, p.chips);
      p.chips -= pay;
      p.bet += pay;
    } else if (action === "bet") {
      // Bisa bet (jika toCall=0) atau raise (jika toCall>0)
      const toCall = this.toCallOf(s, idx);
      const total = toCall + (amount || 0);
      const pay = Math.min(total, p.chips);
      p.chips -= pay;
      p.bet += pay;
    }

    // Jika tinggal 1 aktif -> langsung showdown
    if (countActive(s.players) === 1) {
      // masukkan semua bet ke pot
      s.pot += s.players.reduce((sum, pl) => sum + pl.bet, 0);
      s.players.forEach((pl) => (pl.bet = 0));
      s.round = "Showdown";
      s.winners = this.checkWinners(s);
      s.endgame = true;
      return s;
    }

    // Jika semua aktif sudah menyamakan bet -> advance round
    if (allActiveMatchedBet(s.players)) {
      // masukkan bet ke pot
      s.pot += s.players.reduce((sum, pl) => sum + pl.bet, 0);
      s.players.forEach((pl) => (pl.bet = 0));

      if (s.round === "Preflop") {
        // flop
        s.community.push(s.deck.pop(), s.deck.pop(), s.deck.pop());
        s.round = "Flop";
      } else if (s.round === "Flop") {
        s.community.push(s.deck.pop());
        s.round = "Turn";
      } else if (s.round === "Turn") {
        s.community.push(s.deck.pop());
        s.round = "River";
      } else if (s.round === "River") {
        s.round = "Showdown";
        s.winners = this.checkWinners(s);
        s.endgame = true;
      }
    }

    // Pindah giliran ke pemain berikutnya yang belum fold (kecuali sudah showdown)
    if (!s.endgame && s.round !== "Showdown") {
      s.currentPlayer = nextAliveIndex(s.players, s.currentPlayer);
    }

    return s;
  }
}
