// src/core/handsChecker.js

import { Rank } from "./models";

// ======================================
// Utility: Kombinasi dari array
// ======================================
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

// ======================================
// Fungsi utama: hitung peringkat kombinasi 5 kartu
// ======================================
function handRank(cards) {
  const sortedCards = [...cards].sort((a, b) => b.rank - a.rank);
  const ranks = sortedCards.map((c) => c.rank);
  const suits = sortedCards.map((c) => c.suit);

  // Hitung frekuensi rank
  const counts = {};
  for (const rank of ranks) {
    counts[rank] = (counts[rank] || 0) + 1;
  }

  const uniqueRanks = Object.keys(counts)
    .map(Number)
    .sort((a, b) => b - a);
  const countValues = Object.values(counts).sort((a, b) => b - a);

  // =========================
  // Cek apakah flush
  // =========================
  const isFlush = suits.every((suit) => suit === suits[0]);

  // =========================
  // Cek apakah straight
  // =========================
  const isStraight = (() => {
    const sortedUnique = [...new Set(ranks)].sort((a, b) => b - a);

    // Cek straight normal
    for (let i = 0; i <= sortedUnique.length - 5; i++) {
      const seq = sortedUnique.slice(i, i + 5);
      if (seq[0] - seq[4] === 4) {
        return seq[0];
      }
    }

    // Cek straight low-Ace (A,2,3,4,5)
    if (
      sortedUnique.includes(Rank.RA) &&
      sortedUnique.includes(Rank.R5) &&
      sortedUnique.includes(Rank.R4) &&
      sortedUnique.includes(Rank.R3) &&
      sortedUnique.includes(Rank.R2)
    ) {
      return 5; // Ace dianggap 1 di sini
    }

    return null;
  })();

  // =========================
  // Tentukan ranking kombinasi
  // =========================
  let rankValue = 0;
  let kickers = [];

  if (isStraight && isFlush) {
    rankValue = 8; // Straight Flush
    kickers = [isStraight];
  } else if (countValues[0] === 4) {
    rankValue = 7; // Four of a Kind
    kickers = [uniqueRanks[0], uniqueRanks[1]];
  } else if (countValues[0] === 3 && countValues[1] === 2) {
    rankValue = 6; // Full House
    kickers = [uniqueRanks[0], uniqueRanks[1]];
  } else if (isFlush) {
    rankValue = 5; // Flush
    kickers = ranks;
  } else if (isStraight) {
    rankValue = 4; // Straight
    kickers = [isStraight];
  } else if (countValues[0] === 3) {
    rankValue = 3; // Three of a Kind
    kickers = [uniqueRanks[0], ...uniqueRanks.slice(1)];
  } else if (countValues[0] === 2 && countValues[1] === 2) {
    rankValue = 2; // Two Pair
    kickers = [uniqueRanks[0], uniqueRanks[1], uniqueRanks[2]];
  } else if (countValues[0] === 2) {
    rankValue = 1; // One Pair
    kickers = [uniqueRanks[0], ...uniqueRanks.slice(1)];
  } else {
    rankValue = 0; // High Card
    kickers = ranks;
  }

  return { rankValue, kickers };
}

// ======================================
// Bandingkan dua kombinasi tangan
// ======================================
function compareHands(handA, handB) {
  if (handA.rankValue > handB.rankValue) return 1;
  if (handA.rankValue < handB.rankValue) return -1;

  for (let i = 0; i < handA.kickers.length; i++) {
    if (handA.kickers[i] > handB.kickers[i]) return 1;
    if (handA.kickers[i] < handB.kickers[i]) return -1;
  }

  return 0;
}

// ======================================
// Cari pemenang poker
// ======================================
export function getWinners(players, hands, community) {
  let bestRank = null;
  let winners = [];

  for (const player of players) {
    const playerCards = [...hands[player.name].cards, ...community.cards];

    const allCombos = combinations(playerCards, 5);
    let bestHand = null;

    for (const combo of allCombos) {
      const rank = handRank(combo);
      if (!bestHand || compareHands(rank, bestHand) > 0) {
        bestHand = rank;
      }
    }

    if (!bestRank || compareHands(bestHand, bestRank) > 0) {
      bestRank = bestHand;
      winners = [player];
    } else if (compareHands(bestHand, bestRank) === 0) {
      winners.push(player);
    }
  }

  return winners;
}
