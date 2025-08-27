// src/core/game.js

import { Players, Deck, Community, Round, blindsTable, Action } from "./models";
import { getWinners } from "./handEvaluator";

// ===============================
// CLASS STATE
// ===============================
export class State {
  constructor({
    players,
    deck,
    currentRound,
    currentPlayer,
    startingChips,
    bets,
    totalBets,
    hands,
    community,
    foldedPlayers,
    roundLastPlayer,
    roundLastBetter,
    minAllowedBet,
    dealer,
    blindsLevel,
    isInitial = false,
    isFinal = false,
    winners = null,
  }) {
    this.players = players;
    this.deck = deck;
    this.currentRound = currentRound;
    this.currentPlayer = currentPlayer;
    this.startingChips = startingChips;
    this.bets = bets;
    this.totalBets = totalBets;
    this.hands = hands;
    this.community = community;
    this.foldedPlayers = foldedPlayers;
    this.roundLastPlayer = roundLastPlayer;
    this.roundLastBetter = roundLastBetter;
    this.minAllowedBet = minAllowedBet;
    this.dealer = dealer;
    this.blindsLevel = blindsLevel;
    this.isInitial = isInitial;
    this.isFinal = isFinal;
    this.winners = winners;

    this.endGame = false;
    this.nPlayers = this.players.active.length;
    this.currentPlayerBet = bets[this.currentPlayer.name];
    this.highestBet = Math.max(...Object.values(this.bets));
    this.computeChips();

    // Cek apakah game selesai (hanya 1 pemain yang punya chip)
    const playersWithChips = Object.entries(this.chips).filter(
      ([_, chips]) => chips > 0
    );
    if (playersWithChips.length < 2) {
      this.endGame = true;
    }
  }

  copy() {
    return new State({
      players: this.players.copy(),
      deck: this.deck.copy(),
      currentRound: this.currentRound,
      currentPlayer: this.currentPlayer,
      startingChips: { ...this.startingChips },
      bets: { ...this.bets },
      totalBets: { ...this.totalBets },
      hands: this.hands,
      community: this.community.copy(),
      foldedPlayers: new Set(this.foldedPlayers),
      roundLastPlayer: this.roundLastPlayer,
      roundLastBetter: this.roundLastBetter,
      minAllowedBet: this.minAllowedBet,
      dealer: this.dealer,
      blindsLevel: this.blindsLevel,
      isInitial: this.isInitial,
      isFinal: this.isFinal,
      winners: this.winners,
    });
  }

  computeChips() {
    this.chips = {};
    for (const player of this.players.active) {
      this.chips[player.name] =
        this.startingChips[player.name] - this.totalBets[player.name];
    }
  }

  getPot() {
    return Object.values(this.totalBets).reduce((sum, val) => sum + val, 0);
  }
}

// ===============================
// CLASS GAME (ENGINE POKER)
// ===============================
export class Game {
  constructor(players) {
    this.players = new Players(players);
  }

  // Membuat state awal
  initialState(finalState = null) {
    let players = this.players;
    const deck = new Deck();
    const currentRound = Round.PreFlop;
    let startingChips = {};
    let bets = {};
    let totalBets = {};
    let dealer;

    for (const player of players.active) {
      startingChips[player.name] = 2000;
      bets[player.name] = 0;
      totalBets[player.name] = 0;
    }

    const community = new Community();
    const foldedPlayers = new Set();

    if (finalState) {
      players = finalState.players.copy();
      players.removeLosers(finalState.chips);
      dealer = players.nextTo(finalState.dealer);
      startingChips = { ...finalState.chips };
      totalBets = {};
      for (const player of players.active) {
        totalBets[player.name] = 0;
      }
    } else {
      const randomIdx = Math.floor(Math.random() * players.active.length);
      dealer = players.active[randomIdx];
    }

    // Set blinds
    const smallBlindPlayer = players.nextTo(dealer);
    const bigBlindPlayer = players.nextTo(smallBlindPlayer);
    const smallBlindBet = blindsTable[0].small;
    const bigBlindBet = blindsTable[0].big;

    totalBets[smallBlindPlayer.name] = bets[smallBlindPlayer.name] = Math.min(
      smallBlindBet,
      startingChips[smallBlindPlayer.name]
    );
    totalBets[bigBlindPlayer.name] = bets[bigBlindPlayer.name] = Math.min(
      bigBlindBet,
      startingChips[bigBlindPlayer.name]
    );

    const minAllowedBet = bigBlindBet;

    // Bagikan kartu
    const hands = this._deal(deck, dealer, players);
    const currentPlayer = players.nextTo(bigBlindPlayer);

    const roundLastPlayer = bigBlindPlayer;
    const roundLastBetter = null;

    return new State({
      players,
      deck,
      currentRound,
      currentPlayer,
      startingChips,
      bets,
      totalBets,
      hands,
      community,
      foldedPlayers,
      roundLastPlayer,
      roundLastBetter,
      minAllowedBet,
      dealer,
      blindsTable: blindsTable[0],
      isInitial: true,
    });
  }

  isInitial(state) {
    return state.isInitial;
  }

  isFinal(state) {
    return state.isFinal;
  }

  actions(state) {
    const currentPlayer = state.currentPlayer;
    const actions = [];

    if (state.currentPlayerBet === state.highestBet) {
      actions.push(Action.Check);
    } else {
      actions.push(Action.Fold);
      actions.push(Action.Call);
    }

    const playerChips = state.chips[currentPlayer.name];
    const currentBet = state.bets[currentPlayer.name];
    const amountToCall = state.highestBet - currentBet;

    if (playerChips > amountToCall) {
      const lowestPossibleBet = Math.min(
        state.minAllowedBet,
        playerChips - amountToCall
      );
      const highestPossibleBet = playerChips - amountToCall;
      actions.push([
        Action.BetOrRaise,
        [lowestPossibleBet, highestPossibleBet],
      ]);
    }

    return actions;
  }

  end(state) {
    const pot = state.getPot();
    let winners = null;
    const totalBets = { ...state.totalBets };
    const chips = { ...state.chips };
    const players = state.players.active;

    let remainingPot = pot;

    while (remainingPot > 0) {
      const endingPlayers = players.filter(
        (p) => state.totalBets[p.name] > 0 && !state.foldedPlayers.has(p)
      );
      const playersWithHands = endingPlayers.map((p) => ({
        ...p,
        hand: state.hands[p.name] || [],
      }));
      winners = getWinners(playersWithHands, state.community);

      const bets = players
        .map((p) => state.totalBets[p.name])
        .filter((b) => b > 0);
      const minBet = Math.min(...bets);
      const potToAssign = minBet * bets.length;
      const potPerWinner = Math.ceil(potToAssign / winners.length);

      for (const winner of winners) {
        chips[winner.name] += potPerWinner;
      }

      remainingPot -= potToAssign;

      for (const player of players) {
        if (totalBets[player.name] >= minBet) {
          totalBets[player.name] -= minBet;
        }
      }
    }

    return new State({
      players: state.players.copy(),
      deck: state.deck.copy(),
      currentRound: Round.End,
      currentPlayer: state.currentPlayer,
      startingChips: chips,
      bets: {},
      totalBets: {},
      hands: state.hands,
      community: state.community.copy(),
      foldedPlayers: new Set(state.foldedPlayers),
      roundLastPlayer: state.roundLastPlayer,
      roundLastBetter: state.roundLastBetter,
      minAllowedBet: state.minAllowedBet,
      dealer: state.dealer,
      blindsLevel: state.blindsLevel,
      isInitial: false,
      isFinal: true,
      winners,
    });
  }

  _deal(deck, dealer, players) {
    const hands = {};
    deck.shuffle();
    let current = players.nextTo(dealer);
    hands[current.name] = deck.dealHand();
    let next = players.nextTo(current);

    while (next !== current) {
      hands[next.name] = deck.dealHand();
      next = players.nextTo(next);
    }

    return hands;
  }

  result(state, action, amount = 0, range = [0, 0]) {
    const currentPlayer = state.currentPlayer;
    const players = state.players.copy();
    const deck = state.deck.copy();

    let nextRound = state.currentRound;
    const startingChips = state.startingChips;
    const bets = { ...state.bets };
    const totalBets = { ...state.totalBets };
    const hands = state.hands;
    const community = state.community.copy();
    const foldedPlayers = new Set(state.foldedPlayers);
    let roundLastPlayer = state.roundLastPlayer;
    let roundLastBetter = state.roundLastBetter;
    let minAllowedBet = state.minAllowedBet;

    if (action === Action.Call || action === Action.BetOrRaise) {
      const amountToCall = Math.min(
        state.highestBet - bets[currentPlayer.name],
        state.chips[currentPlayer.name]
      );
      totalBets[currentPlayer.name] += amountToCall;
      bets[currentPlayer.name] += amountToCall;
    }

    if (action === Action.BetOrRaise) {
      if (amount < range[0] || amount > range[1]) {
        throw new Error("Invalid bet amount");
      }
      totalBets[currentPlayer.name] += amount;
      bets[currentPlayer.name] += amount;
      roundLastBetter = currentPlayer;
      minAllowedBet = amount;
    } else if (action === Action.Fold) {
      foldedPlayers.add(currentPlayer);
    }

    let nextPlayer = players.nextTo(currentPlayer);
    while (
      foldedPlayers.has(nextPlayer) ||
      state.chips[nextPlayer.name] === 0
    ) {
      nextPlayer = players.nextTo(nextPlayer);
      if (nextPlayer === currentPlayer) break;
    }

    const onePlayerRemained = state.nPlayers - foldedPlayers.size === 1;

    if (
      (state.roundLastBetter === null &&
        state.roundLastPlayer === currentPlayer &&
        action !== Action.BetOrRaise) ||
      (nextPlayer === state.roundLastBetter && action !== Action.BetOrRaise) ||
      onePlayerRemained ||
      nextPlayer === currentPlayer
    ) {
      nextRound += 1;

      if (nextRound === Round.End) {
        const finalState = state.copy();
        finalState.totalBets = totalBets;
        finalState.foldedPlayers = foldedPlayers;
        finalState.computeChips();
        return this.end(finalState);
      }

      const playersWithChips = players.active.filter(
        (p) => state.chips[p.name] > 0 && !foldedPlayers.has(p)
      );

      if (onePlayerRemained || playersWithChips.length <= 1) {
        while (nextRound < Round.End) {
          nextRound += 1;
        }
        while (community.cards.length < 5) {
          deck.dealCommunityCards(community);
        }
        const finalState = state.copy();
        finalState.totalBets = totalBets;
        finalState.foldedPlayers = foldedPlayers;
        finalState.community = community;
        finalState.computeChips();
        return this.end(finalState);
      }

      for (const player of players.active) {
        bets[player.name] = 0;
      }

      deck.dealCommunityCards(community);
      nextPlayer = players.nextTo(state.dealer);
      while (
        foldedPlayers.has(nextPlayer) ||
        state.chips[nextPlayer.name] === 0
      ) {
        nextPlayer = players.nextTo(nextPlayer);
        if (nextPlayer === state.dealer) break;
      }
      roundLastPlayer = players.firstActiveFromBackwards(state.dealer);
      while (
        foldedPlayers.has(roundLastPlayer) ||
        state.chips[roundLastPlayer.name] === 0
      ) {
        roundLastPlayer = players.previousThan(roundLastPlayer);
      }
      roundLastBetter = null;
    }

    return new State({
      players,
      deck,
      currentRound: nextRound,
      currentPlayer: nextPlayer,
      startingChips,
      bets,
      totalBets,
      hands,
      community,
      foldedPlayers,
      roundLastPlayer,
      roundLastBetter,
      minAllowedBet,
      dealer: state.dealer,
      blindsLevel: state.blindsLevel,
    });
  }
}
