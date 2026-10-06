// src/core/odds.js
import { HAND_NAMES, fastCategory, getWinners } from "./handEvaluator";
import { estimateWinRate } from "./ai";

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
const SUITS = ["C", "D", "H", "S"];
const key = (card) => `${card.rank}${card.suit}`;

function fullDeck() {
  return RANKS.flatMap((rank) => SUITS.map((suit) => ({ rank, suit })));
}

function forEachCombination(pool, k, visit, start = 0, picked = []) {
  if (picked.length === k) {
    visit(picked);
    return;
  }
  for (let i = start; i <= pool.length - (k - picked.length); i++) {
    picked.push(pool[i]);
    forEachCombination(pool, k, visit, i + 1, picked);
    picked.pop();
  }
}

/**
 * Peluang kombinasi akhir (setelah river) dari sudut pandang pemain: hanya
 * kartu di tangan dan kartu meja yang terlihat yang diketahui.
 * Flop/turn dihitung persis dengan enumerasi; preflop memakai simulasi.
 * @param {Array} hand - Dua kartu di tangan.
 * @param {Array} community - Kartu meja yang terlihat (0, 3, 4, atau 5).
 * @param {{samples?: number, random?: () => number}} [options]
 * @returns {{exact: boolean, current: string|null, categories: Array<{name: string, rankValue: number, probability: number}>}|null}
 */
export function finalHandOdds(hand, community = [], options = {}) {
  const { samples = 4000, random = Math.random } = options;
  if (!hand || hand.length !== 2) return null;

  const known = new Set([...hand, ...community].map(key));
  const pool = fullDeck().filter((card) => !known.has(key(card)));
  const need = 5 - community.length;
  const counts = new Array(HAND_NAMES.length).fill(0);
  let total = 0;
  const tally = (extra) => {
    counts[fastCategory([...hand, ...community, ...extra])]++;
    total++;
  };

  const exact = need <= 2;
  if (exact) {
    forEachCombination(pool, need, tally);
  } else {
    const deck = [...pool];
    for (let s = 0; s < samples; s++) {
      // Partial Fisher-Yates: ambil `need` kartu acak tanpa pengembalian
      for (let i = 0; i < need; i++) {
        const j = i + Math.floor(random() * (deck.length - i));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
      tally(deck.slice(0, need));
    }
  }

  return {
    exact,
    current:
      community.length >= 3
        ? HAND_NAMES[fastCategory([...hand, ...community])]
        : null,
    categories: HAND_NAMES.map((name, rankValue) => ({
      name,
      rankValue,
      probability: counts[rankValue] / total,
    })),
  };
}

/**
 * Peluang menang pemain melawan lawan yang masih aktif, hanya berdasarkan
 * kartu yang terlihat. Kartu meja yang belum dibuka diperlakukan tidak diketahui.
 * @param {object} state - State mesin.
 * @param {number} heroIndex - Indeks pemain.
 * @param {number} visibleCount - Jumlah kartu meja yang terlihat.
 * @param {{simulations?: number, random?: () => number}} [options]
 * @returns {number} Peluang 0..1 (seri dihitung proporsional).
 */
export function winChance(state, heroIndex, visibleCount, options = {}) {
  const { simulations = 300, random = Math.random } = options;
  const view = {
    ...state,
    community: state.community.slice(0, visibleCount),
    deck: [...state.deck, ...state.community.slice(visibleCount)],
  };
  return estimateWinRate(view, heroIndex, simulations, random);
}

/**
 * Peluang menang saat showdown, ketika kartu lawan yang tersisa sudah dibuka.
 * Kartu meja yang belum terlihat dihitung persis (≤2 kartu) atau disimulasikan.
 * @param {object} state - State mesin (endgame, kartu lawan terbuka).
 * @param {number} heroIndex - Indeks pemain.
 * @param {number} visibleCount - Jumlah kartu meja yang terlihat.
 * @param {{samples?: number, random?: () => number}} [options]
 * @returns {number} Peluang 0..1 (seri dihitung proporsional).
 */
export function revealedWinChance(
  state,
  heroIndex,
  visibleCount,
  options = {},
) {
  const { samples = 800, random = Math.random } = options;
  const contenders = state.players
    .map((player, index) => ({
      hand: player.hand,
      index,
      folded: player.folded,
    }))
    .filter((p) => !p.folded && p.hand?.length === 2);
  if (!contenders.some((p) => p.index === heroIndex)) return 0;
  if (contenders.length === 1) return 1;

  const board = state.community.slice(0, visibleCount);
  const pool = [...state.deck, ...state.community.slice(visibleCount)];
  const need = 5 - board.length;
  let share = 0;
  let total = 0;
  const play = (extra) => {
    const winners = getWinners(contenders, [...board, ...extra]);
    if (winners.some((w) => w.index === heroIndex)) share += 1 / winners.length;
    total++;
  };

  if (need <= 2) {
    forEachCombination(pool, need, play);
  } else {
    const deck = [...pool];
    for (let s = 0; s < samples; s++) {
      for (let i = 0; i < need; i++) {
        const j = i + Math.floor(random() * (deck.length - i));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
      play(deck.slice(0, need));
    }
  }
  return share / total;
}
