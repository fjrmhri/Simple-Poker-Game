// src/core/ai.js
import { getWinners } from "./handEvaluator";

/**
 * Parameter perilaku per level bot.
 * - simulations: jumlah simulasi Monte Carlo untuk estimasi equity
 * - noise: galat acak pada equity (meniru salah baca)
 * - openEdge: keunggulan equity minimum untuk bet saat bisa check
 * - raiseEdge: keunggulan equity minimum untuk raise saat menghadapi bet
 *   (keunggulan = (equity - equity wajar) / (1 - equity wajar))
 * - callSlack: tambahan equity di atas pot odds untuk call (negatif = terlalu longgar)
 * - respect: seberapa besar equity dikoreksi turun saat lawan bet besar
 *   (equity Monte Carlo dihitung melawan kartu acak, padahal lawan yang bet
 *   biasanya memegang kartu lebih kuat)
 * - bluff: peluang bluff saat kondisi mendukung
 * - trap: peluang slow-play tangan sangat kuat di flop/turn
 * - sizing: rentang ukuran bet sebagai fraksi pot [lemah, kuat]
 * - maxRaises: jumlah bet/raise per street sebelum bot berhenti menaikkan
 * - positional: bluff hanya saat beraksi terakhir di street
 */
export const BOT_PROFILES = {
  easy: {
    simulations: 150,
    noise: 0.12,
    openEdge: 0.35,
    raiseEdge: 0.6,
    callSlack: -0.06,
    respect: 0,
    bluff: 0.03,
    trap: 0,
    sizing: [0.35, 0.5],
    maxRaises: 1,
    positional: false,
  },
  normal: {
    simulations: 300,
    noise: 0.06,
    openEdge: 0.22,
    raiseEdge: 0.42,
    callSlack: 0.02,
    respect: 0.12,
    bluff: 0.06,
    trap: 0,
    sizing: [0.5, 0.75],
    maxRaises: 2,
    positional: false,
  },
  hard: {
    simulations: 500,
    noise: 0.03,
    openEdge: 0.15,
    raiseEdge: 0.35,
    callSlack: 0,
    respect: 0.45,
    bluff: 0.12,
    trap: 0.2,
    sizing: [0.5, 0.9],
    maxRaises: 2,
    positional: true,
  },
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/**
 * Shuffle an array of cards using Fisher-Yates algorithm.
 * @param {Array} arr - Array to shuffle.
 * @param {() => number} [random] - Sumber angka acak [0, 1).
 */
function shuffle(arr, random = Math.random) {
  if (!Array.isArray(arr)) {
    throw new Error("shuffle expects an array");
  }
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/**
 * Kartu yang tidak diketahui oleh pemain: sisa dek ditambah kartu tertutup lawan.
 * Bot tidak boleh tahu kartu lawan, jadi kartu itu harus tetap bisa muncul di simulasi.
 * @param {object} state - Current game state.
 * @param {number} playerIndex - Index of hero player.
 * @returns {Array} Unknown cards.
 */
export function unknownCards(state, playerIndex) {
  const hidden = state.players.flatMap((p, i) =>
    i === playerIndex ? [] : p.hand || [],
  );
  return [...state.deck, ...hidden];
}

/**
 * Estimate the win rate of the current hand via Monte Carlo simulation.
 * @param {object} state - Current game state.
 * @param {number} playerIndex - Index of hero player in state.players.
 * @param {number} [simulations=200] - Number of simulations to run.
 * @param {() => number} [random] - Sumber angka acak [0, 1).
 * @returns {number} Estimated win rate.
 */
export function estimateWinRate(
  state,
  playerIndex,
  simulations = 200,
  random = Math.random,
) {
  if (!state?.players || !Array.isArray(state.players)) {
    throw new Error("Invalid game state for win rate estimation");
  }
  if (playerIndex < 0 || playerIndex >= state.players.length) {
    throw new Error("Invalid player index for win rate estimation");
  }

  const hero = state.players[playerIndex];
  const opponents = state.players.filter(
    (_, i) => i !== playerIndex && !state.players[i].folded,
  );
  if (opponents.length === 0) return 1;

  const pool = unknownCards(state, playerIndex);
  let wins = 0;
  let ties = 0;

  for (let s = 0; s < simulations; s++) {
    const deck = [...pool];
    const community = [...state.community];
    shuffle(deck, random);
    while (community.length < 5) community.push(deck.pop());
    const simPlayers = [{ hand: hero.hand }];
    for (let i = 0; i < opponents.length; i++) {
      simPlayers.push({ hand: [deck.pop(), deck.pop()] });
    }
    const winners = getWinners(simPlayers, community);
    if (winners.length === 1 && winners[0] === simPlayers[0]) wins++;
    else if (winners.includes(simPlayers[0])) ties += 1 / winners.length;
  }

  return (wins + ties) / simulations;
}

/**
 * Ringkas informasi meja yang relevan untuk keputusan bot.
 * @param {object} game - Poker game engine.
 * @param {object} state - Current game state.
 * @param {number} idx - Index bot.
 * @returns {object} Konteks keputusan.
 */
export function readTable(game, state, idx) {
  const players = state.players;
  const me = players[idx];
  const n = players.length;

  // Pemain aktif setelah bot yang belum beraksi di street ini
  let leftToAct = 0;
  for (let step = 1; step < n; step++) {
    const p = players[(idx + step) % n];
    if (!p.folded && p.chips > 0 && p.lastAction === null) leftToAct++;
  }

  return {
    actions: game.actions(state),
    toCall: game.toCallOf(state, idx),
    pot: game.calculatePot(state),
    stack: me.chips,
    opponents: players.filter((p, i) => i !== idx && !p.folded).length,
    street: state.round,
    raisesThisStreet: players.filter(
      (p) => p.lastAction === "bet" || p.lastAction === "raise",
    ).length,
    inPosition: leftToAct === 0,
  };
}

/**
 * Pilih aksi bot dari konteks meja dan estimasi equity (fungsi murni).
 * @param {object} ctx - Hasil readTable.
 * @param {number} equity - Peluang menang 0..1.
 * @param {object} profile - Salah satu BOT_PROFILES.
 * @param {() => number} [random] - Sumber angka acak [0, 1).
 * @returns {{action: string, amount?: number}} Aksi untuk Game.applyAction.
 */
export function decideAction(ctx, equity, profile, random = Math.random) {
  const { actions, toCall, pot, opponents, street, raisesThisStreet } = ctx;
  const check = actions.find((a) => a.type === "check");
  const call = actions.find((a) => a.type === "call");
  const bet = actions.find((a) => a.type === "bet");
  const passive = () => (check ? { action: "check" } : { action: "fold" });

  const fairShare = 1 / (Math.max(opponents, 1) + 1);
  // Bet lawan yang besar relatif terhadap pot menandakan kartu kuat
  const betPressure = toCall > 0 ? clamp(toCall / Math.max(pot, 1), 0, 1) : 0;
  // Koreksi berbentuk pangkat: tangan lemah turun tajam, tangan premium nyaris tetap
  const eq = clamp(
    equity ** (1 + profile.respect * betPressure) +
      (random() * 2 - 1) * profile.noise,
    0,
    1,
  );
  const edge = (eq - fairShare) / (1 - fairShare);
  // 0 = setara equity wajar, 1 = sangat unggul
  const strength = clamp(edge / 0.6, 0, 1);
  const canRaise = Boolean(bet) && raisesThisStreet < profile.maxRaises;
  const postflop = street !== "Preflop";

  const sized = (base, s) => {
    const [low, high] = profile.sizing;
    let amount = Math.round(base * (low + (high - low) * s));
    amount = clamp(amount, bet.min, bet.max);
    // Hindari menyisakan stack kecil yang tidak berarti
    if (amount >= bet.max * 0.7) amount = bet.max;
    return { action: "bet", amount };
  };

  if (toCall === 0) {
    if (bet && edge >= profile.openEdge) {
      const trapping =
        edge >= 0.6 &&
        (street === "Flop" || street === "Turn") &&
        random() < profile.trap;
      return trapping ? passive() : sized(pot, strength);
    }
    const bluffSpot =
      bet &&
      postflop &&
      opponents <= 2 &&
      (ctx.inPosition || !profile.positional);
    if (bluffSpot && random() < profile.bluff) return sized(pot, 0);
    return passive();
  }

  const potOdds = toCall / (pot + toCall);
  if (canRaise && edge >= profile.raiseEdge && eq > potOdds) {
    return sized(pot + toCall, strength);
  }
  if (call && eq >= potOdds + profile.callSlack) return { action: "call" };

  // Semi-bluff raise dengan tangan yang masih punya peluang (lawan tunggal)
  const semiBluff =
    canRaise &&
    profile.positional &&
    (street === "Flop" || street === "Turn") &&
    opponents === 1 &&
    edge >= -0.2;
  if (semiBluff && random() < profile.bluff / 2) return sized(pot + toCall, 0);

  return passive();
}

export class AIBot {
  /**
   * Create a new AI bot instance.
   * @param {object} game - Poker game engine.
   * @param {object} state - Current game state.
   * @param {object} queue - Queue for pushing bot actions.
   * @param {"easy"|"normal"|"hard"} level - Bot difficulty level.
   * @param {{random?: () => number}} [options] - Sumber acak (untuk test).
   */
  constructor(
    game,
    state,
    queue = { push: () => {} },
    level = "easy",
    options = {},
  ) {
    if (!game || !state) {
      throw new Error("Game and state are required to initialize AIBot");
    }
    this.game = game;
    this.state = state;
    this.queue = queue;
    this.level = level;
    this.random = options.random ?? Math.random;
  }

  /**
   * Execute the bot's action based on current state and difficulty level.
   */
  run() {
    const idx = this.state.currentPlayer;
    const ctx = readTable(this.game, this.state, idx);
    if (!ctx.actions.length) {
      console.error("AIBot.run: no available actions");
      return;
    }
    const profile = BOT_PROFILES[this.level] ?? BOT_PROFILES.easy;
    const equity = estimateWinRate(
      this.state,
      idx,
      profile.simulations,
      this.random,
    );
    return this.queue.push(decideAction(ctx, equity, profile, this.random));
  }
}
