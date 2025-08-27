import { getWinners as evaluateWinners } from "./handEvaluator";
import {
  makeDeck,
  clone,
  nextAliveIndex,
  allActiveMatchedBet,
  countActive,
  distributePot,
} from "./utils";

export default class Game {
  /**
   * Initialize poker game instance.
   * @param {Array} players - Initial players list.
   */
  constructor(players = []) {
    this.templatePlayers = players.map((p) => ({
      name: p.name,
      isBot: !!p.isBot,
      level: p.level || "easy",
      avatar: p.avatar || "/assets/others/dealer.png",
    }));
    this.dealerIndex = 0;
  }

  /**
   * Start a new hand or game.
   * @param {object|null} prevState - Previous game state if continuing.
   * @returns {object} New game state.
   */
  start(prevState = null) {
    const deck = makeDeck();
    let players;
    let dealerIndex = this.dealerIndex;

    if (!prevState) {
      players = this.templatePlayers.map((p) => ({
        name: p.name,
        isBot: p.isBot,
        level: p.level,
        avatar: p.avatar,
        chips: 1000,
        bet: 0,
        folded: false,
        hand: [deck.pop(), deck.pop()],
        lastAction: null,
        lastActionAmount: 0,
      }));
      dealerIndex = 0;
    } else {
      players = prevState.players.map((p) => ({
        ...p,
        bet: 0,
        folded: false,
        hand: [deck.pop(), deck.pop()],
        lastAction: null,
        lastActionAmount: 0,
      }));
      dealerIndex = (prevState.dealerIndex + 1) % players.length;
    }

    const smallBlind = 10;
    const bigBlind = 20;
    const sbIdx = (dealerIndex + 1) % players.length;
    const bbIdx = (dealerIndex + 2) % players.length;
    players[sbIdx].bet = Math.min(smallBlind, players[sbIdx].chips);
    players[sbIdx].chips -= players[sbIdx].bet;
    players[bbIdx].bet = Math.min(bigBlind, players[bbIdx].chips);
    players[bbIdx].chips -= players[bbIdx].bet;

    this.dealerIndex = dealerIndex;

    return {
      players,
      pot: 0,
      deck,
      community: [],
      dealerIndex,
      currentPlayer: (bbIdx + 1) % players.length,
      round: "Preflop", // Preflop -> Flop -> Turn -> River -> Showdown
      winners: [],
      endgame: false,
    };
  }

  // Derivations
  /**
   * Get the current highest bet on table.
   */
  currentBet(state) {
    if (!state?.players) {
      throw new Error("currentBet requires valid state");
    }
    return Math.max(...state.players.map((p) => p.bet));
  }

  /**
   * Amount needed for player to call current bet.
   */
  toCallOf(state, idx) {
    if (!state?.players || !state.players[idx]) {
      throw new Error("toCallOf requires valid player index");
    }
    const p = state.players[idx];
    return Math.max(0, this.currentBet(state) - p.bet);
  }

  /**
   * Determine available actions for current player.
   */
  actions(state) {
    if (!state?.players) {
      throw new Error("actions requires valid state");
    }
    const p = state.players[state.currentPlayer];
    if (state.endgame || state.round === "Showdown") return [];
    if (p.folded || p.chips === 0) return [];

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

  /**
   * Calculate total pot value including current bets.
   */
  calculatePot(state) {
    if (!state?.players) {
      throw new Error("calculatePot requires valid state");
    }
    return state.pot + state.players.reduce((s, p) => s + p.bet, 0);
  }

  /**
   * Determine overall game status.
   */
  checkGameStatus(state) {
    if (!state) {
      throw new Error("checkGameStatus requires state");
    }
    if (state.endgame) return "ended";
    if (state.round === "Showdown") return "showdown";
    return "playing";
  }

  /**
   * Determine winner indices when in showdown.
   */
  checkWinners(state) {
    if (!state?.players) {
      throw new Error("checkWinners requires valid state");
    }
    if (state.round !== "Showdown") return [];
    const alive = state.players
      .map((p, i) => ({ ...p, i }))
      .filter((p) => !p.folded);
    if (alive.length === 1) return [alive[0].i];

    const winners = evaluateWinners(alive, state.community);
    return winners.map((w) => w.i);
  }

  /**
   * Apply player action immutably and return new state.
   */
  applyAction(state, action, amount = 0) {
    if (!state?.players) {
      throw new Error("applyAction requires valid state");
    }
    if (!["fold", "check", "call", "bet"].includes(action)) {
      throw new Error(`Unknown action: ${action}`);
    }
    const s = clone(state);
    const idx = s.currentPlayer;
    const p = s.players[idx];
    const toCallBefore = this.toCallOf(s, idx);

    if (action === "fold") {
      p.folded = true;
      p.lastAction = "fold";
      p.lastActionAmount = 0;
    } else if (action === "check") {
      p.lastAction = "check";
      p.lastActionAmount = 0;
    } else if (action === "call") {
      const need = toCallBefore;
      const pay = Math.min(need, p.chips);
      p.chips -= pay;
      p.bet += pay;
      p.lastAction = "call";
      p.lastActionAmount = pay;
    } else if (action === "bet") {
      const total = toCallBefore + (amount || 0);
      const pay = Math.min(total, p.chips);
      p.chips -= pay;
      p.bet += pay;
      p.lastAction = toCallBefore > 0 ? "raise" : "bet";
      p.lastActionAmount = pay;
    }

    if (countActive(s.players) === 1) {
      s.pot += s.players.reduce((sum, pl) => sum + pl.bet, 0);
      s.players.forEach((pl) => {
        pl.bet = 0;
        pl.lastAction = null;
        pl.lastActionAmount = 0;
      });
      s.round = "Showdown";
      s.winners = this.checkWinners(s);
      distributePot(s);
      s.endgame = true;
      return s;
    }

    if (allActiveMatchedBet(s.players)) {
      s.pot += s.players.reduce((sum, pl) => sum + pl.bet, 0);
      s.players.forEach((pl) => {
        pl.bet = 0;
        pl.lastAction = null;
        pl.lastActionAmount = 0;
      });

      if (s.round === "Preflop") {
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
        distributePot(s);
        s.endgame = true;
      }
    }
    const activeWithChips = s.players.filter(
      (pl) => !pl.folded && pl.chips > 0
    );

    if (!s.endgame && s.round !== "Showdown" && activeWithChips.length <= 1) {
      while (s.community.length < 5) {
        s.community.push(s.deck.pop());
      }
      s.round = "Showdown";
      s.winners = this.checkWinners(s);
      distributePot(s);
      s.endgame = true;
    }

    if (!s.endgame && s.round !== "Showdown") {
      s.currentPlayer = nextAliveIndex(s.players, s.currentPlayer);
    }

    return s;
  }
}
