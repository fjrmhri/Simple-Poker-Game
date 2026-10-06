// src/core/handEvaluator.js

const Rank = {
  R2: 2,
  R3: 3,
  R4: 4,
  R5: 5,
  R6: 6,
  R7: 7,
  R8: 8,
  R9: 9,
  R10: 10,
  RJ: 11,
  RQ: 12,
  RK: 13,
  RA: 14,
};

function combinations(arr, k) {
  const result = [];
  function helper(start, combo) {
    if (combo.length === k) {
      result.push([...combo]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      combo.push(arr[i]);
      helper(i + 1, combo);
      combo.pop();
    }
  }
  helper(0, []);
  return result;
}

function handRank(cards) {
  const sortedCards = [...cards].sort((a, b) => b.rank - a.rank);
  const ranks = sortedCards.map((c) => c.rank);
  const suits = sortedCards.map((c) => c.suit);

  const counts = {};
  for (const rank of ranks) counts[rank] = (counts[rank] || 0) + 1;
  // Urut berdasarkan jumlah kemunculan, lalu rank, agar pasangan/trips dibandingkan sebelum kicker
  const uniqueRanks = Object.keys(counts)
    .map(Number)
    .sort((a, b) => counts[b] - counts[a] || b - a);
  const countValues = uniqueRanks.map((rank) => counts[rank]);

  const isFlush = suits.every((suit) => suit === suits[0]);

  const isStraight = (() => {
    const sortedUnique = [...new Set(ranks)].sort((a, b) => b - a);
    for (let i = 0; i <= sortedUnique.length - 5; i++) {
      const seq = sortedUnique.slice(i, i + 5);
      if (seq[0] - seq[4] === 4) return seq[0];
    }
    if (
      sortedUnique.includes(Rank.RA) &&
      sortedUnique.includes(Rank.R5) &&
      sortedUnique.includes(Rank.R4) &&
      sortedUnique.includes(Rank.R3) &&
      sortedUnique.includes(Rank.R2)
    ) {
      return 5;
    }
    return null;
  })();

  let rankValue;
  let kickers;

  if (isStraight && isFlush) {
    rankValue = 8;
    kickers = [isStraight];
  } else if (countValues[0] === 4) {
    rankValue = 7;
    kickers = [uniqueRanks[0], uniqueRanks[1]];
  } else if (countValues[0] === 3 && countValues[1] === 2) {
    rankValue = 6;
    kickers = [uniqueRanks[0], uniqueRanks[1]];
  } else if (isFlush) {
    rankValue = 5;
    kickers = ranks;
  } else if (isStraight) {
    rankValue = 4;
    kickers = [isStraight];
  } else if (countValues[0] === 3) {
    rankValue = 3;
    kickers = uniqueRanks;
  } else if (countValues[0] === 2 && countValues[1] === 2) {
    rankValue = 2;
    kickers = uniqueRanks;
  } else if (countValues[0] === 2) {
    rankValue = 1;
    kickers = uniqueRanks;
  } else {
    rankValue = 0;
    kickers = ranks;
  }
  return { rankValue, kickers };
}

function compareHands(a, b) {
  if (a.rankValue > b.rankValue) return 1;
  if (a.rankValue < b.rankValue) return -1;
  for (let i = 0; i < a.kickers.length; i++) {
    if (a.kickers[i] > b.kickers[i]) return 1;
    if (a.kickers[i] < b.kickers[i]) return -1;
  }
  return 0;
}

export function evaluateHandPublic(cards) {
  return handRank(cards.map(toInternal));
}

export const HAND_NAMES = [
  "High Card",
  "One Pair",
  "Two Pair",
  "Three of a Kind",
  "Straight",
  "Flush",
  "Full House",
  "Four of a Kind",
  "Straight Flush",
];

export function getHandName(hand, community) {
  const all = [...hand, ...community];
  if (all.length < 5) return "";
  const combos = combinations(all, 5);
  let best = null;
  for (const combo of combos) {
    const rank = handRank(combo.map(toInternal));
    if (!best || compareHands(rank, best) > 0) best = rank;
  }
  return HAND_NAMES[best.rankValue];
}

/**
 * Kategori terbaik (0 = High Card ... 8 = Straight Flush) dari 5–7 kartu.
 * @param {Array} cards - Kartu {rank, suit}.
 * @returns {number} rankValue kategori terbaik.
 */
export function bestRankValue(cards) {
  let best = 0;
  for (const combo of combinations(cards.map(toInternal), 5)) {
    const { rankValue } = handRank(combo);
    if (rankValue > best) best = rankValue;
    if (best === 8) break;
  }
  return best;
}

const RANK_VALUE = {
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};

// Bit mask rank (bit 1 = As rendah untuk wheel) -> kartu tertinggi straight, atau 0
function straightHigh(mask) {
  for (let high = 14; high >= 5; high--) {
    const run = 0b11111 << (high - 4);
    if ((mask & run) === run) return high;
  }
  return 0;
}

/**
 * Kategori terbaik dari 5–7 kartu tanpa mencoba setiap kombinasi 5 kartu.
 * Setara dengan bestRankValue, tetapi jauh lebih cepat untuk simulasi.
 * @param {Array} cards - Kartu {rank, suit}.
 * @returns {number} rankValue kategori terbaik (0..8).
 */
export function fastCategory(cards) {
  const counts = new Array(15).fill(0);
  const suitMasks = { C: 0, D: 0, H: 0, S: 0 };
  const suitCounts = { C: 0, D: 0, H: 0, S: 0 };
  let mask = 0;
  for (const card of cards) {
    const v = RANK_VALUE[card.rank];
    counts[v]++;
    const bit = (1 << v) | (v === 14 ? 1 << 1 : 0);
    mask |= bit;
    suitMasks[card.suit] |= bit;
    suitCounts[card.suit]++;
  }
  const flushSuit = Object.keys(suitCounts).find((s) => suitCounts[s] >= 5);
  if (flushSuit && straightHigh(suitMasks[flushSuit])) return 8;

  let quads = 0;
  let trips = 0;
  let pairs = 0;
  for (let v = 2; v <= 14; v++) {
    if (counts[v] === 4) quads++;
    else if (counts[v] === 3) trips++;
    else if (counts[v] === 2) pairs++;
  }
  if (quads) return 7;
  if (trips && (pairs || trips > 1)) return 6;
  if (flushSuit) return 5;
  if (straightHigh(mask)) return 4;
  if (trips) return 3;
  if (pairs >= 2) return 2;
  if (pairs) return 1;
  return 0;
}

export function getWinners(players, community) {
  const communityCards = community.map(toInternal);
  let bestRank = null;
  let winners = [];
  for (const player of players) {
    const playerCards = player.hand.map(toInternal);
    const all = [...playerCards, ...communityCards];
    const combos = combinations(all, 5);
    let best = null;
    for (const combo of combos) {
      const rank = handRank(combo);
      if (!best || compareHands(rank, best) > 0) best = rank;
    }
    if (!bestRank || compareHands(best, bestRank) > 0) {
      bestRank = best;
      winners = [player];
    } else if (compareHands(best, bestRank) === 0) {
      winners.push(player);
    }
  }
  return winners;
}

export function toInternal(card) {
  const map = {
    2: Rank.R2,
    3: Rank.R3,
    4: Rank.R4,
    5: Rank.R5,
    6: Rank.R6,
    7: Rank.R7,
    8: Rank.R8,
    9: Rank.R9,
    10: Rank.R10,
    J: Rank.RJ,
    Q: Rank.RQ,
    K: Rank.RK,
    A: Rank.RA,
  };
  return { rank: map[card.rank], suit: card.suit };
}
