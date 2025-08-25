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
  const uniqueRanks = Object.keys(counts)
    .map(Number)
    .sort((a, b) => b - a);
  const countValues = Object.values(counts).sort((a, b) => b - a);

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

  let rankValue = 0;
  let kickers = [];

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
    kickers = [uniqueRanks[0], ...uniqueRanks.slice(1)];
  } else if (countValues[0] === 2 && countValues[1] === 2) {
    rankValue = 2;
    kickers = [uniqueRanks[0], uniqueRanks[1], uniqueRanks[2]];
  } else if (countValues[0] === 2) {
    rankValue = 1;
    kickers = [uniqueRanks[0], ...uniqueRanks.slice(1)];
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

const handNames = [
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
  return handNames[best.rankValue];
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
    "2": Rank.R2,
    "3": Rank.R3,
    "4": Rank.R4,
    "5": Rank.R5,
    "6": Rank.R6,
    "7": Rank.R7,
    "8": Rank.R8,
    "9": Rank.R9,
    "10": Rank.R10,
    J: Rank.RJ,
    Q: Rank.RQ,
    K: Rank.RK,
    A: Rank.RA,
  };
  return { rank: map[card.rank], suit: card.suit };
}
