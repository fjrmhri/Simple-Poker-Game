import Game, { awardPots } from "../models";

const cards = (...codes) =>
  codes.map((code) => ({ rank: code.slice(0, -1), suit: code.slice(-1) }));

const totalChips = (state) =>
  state.players.reduce((sum, p) => sum + p.chips + p.bet, 0) + state.pot;

describe("pot setelah tangan selesai", () => {
  it("calculatePot mengembalikan pot terakhir, bukan 0", () => {
    const game = new Game([{ name: "A" }, { name: "B" }]);
    const state = game.start();
    expect(game.calculatePot(state)).toBe(30);

    const next = game.applyAction(state, "fold");
    expect(next.endgame).toBe(true);
    expect(next.lastPot).toBe(30);
    expect(game.calculatePot(next)).toBe(30);
  });

  it("tangan baru mereset lastPot", () => {
    const game = new Game([{ name: "A" }, { name: "B" }]);
    const ended = game.applyAction(game.start(), "fold");
    const fresh = game.start(ended);
    expect(fresh.lastPot).toBe(0);
    expect(game.calculatePot(fresh)).toBe(30);
  });
});

describe("pemain tanpa chip", () => {
  const players = [
    { name: "Hero" },
    { name: "B1", isBot: true },
    { name: "B2", isBot: true },
  ];

  it("tidak dibagi kartu, tidak bayar blind, dan tidak mendapat giliran", () => {
    const game = new Game(players);
    const prev = game.start();
    prev.players[2].chips = 0;
    prev.dealerIndex = 1;

    const next = game.start(prev);
    const busted = next.players[2];
    expect(busted.sittingOut).toBe(true);
    expect(busted.folded).toBe(true);
    expect(busted.hand).toEqual([]);
    expect(busted.bet).toBe(0);
    expect(next.dealerIndex).not.toBe(2);
    expect(next.currentPlayer).not.toBe(2);
    expect(game.actions(next).length).toBeGreaterThan(0);
    expect(next.deck).toHaveLength(52 - 4);
  });

  it("tidak membagikan tangan baru bila hanya satu pemain ber-chip", () => {
    const game = new Game(players);
    const prev = game.start();
    prev.players[1].chips = 0;
    prev.players[2].chips = 0;

    const next = game.start(prev);
    expect(next.endgame).toBe(true);
    expect(game.actions(next)).toEqual([]);
    expect(game.checkWinners(next)).toEqual([]);
  });
});

describe("all-in", () => {
  const twoPlayers = (chipsA, chipsB) => ({
    players: [
      { name: "A", chips: chipsA },
      { name: "B", chips: chipsB },
    ],
    dealerIndex: 1, // tangan berikutnya: dealer 0, SB 1, BB 0
  });

  it("langsung showdown bila blind membuat semua pemain all-in", () => {
    const game = new Game([{ name: "A" }, { name: "B" }]);
    const state = game.start(twoPlayers(15, 10));
    expect(state.endgame).toBe(true);
    expect(state.community).toHaveLength(5);
    expect(totalChips(state)).toBe(25);
  });

  it("pemain yang belum menyamai blind tetap mendapat giliran", () => {
    const game = new Game([{ name: "A" }, { name: "B" }]);
    const state = game.start(twoPlayers(15, 100));
    expect(state.endgame).toBe(false);
    expect(state.currentPlayer).toBe(1);
    expect(game.actions(state).map((a) => a.type)).toContain("call");
  });

  it("lawan masih bisa call/fold setelah pemain lain all-in", () => {
    const game = new Game([{ name: "A" }, { name: "B" }]);
    const state = game.start();
    const shove = game.applyAction(state, "bet", 5000);
    expect(shove.players[1].chips).toBe(0);
    expect(shove.round).toBe("Preflop");
    expect(shove.currentPlayer).toBe(0);
    expect(game.actions(shove).map((a) => a.type)).toEqual(["fold", "call"]);

    const called = game.applyAction(shove, "call");
    expect(called.endgame).toBe(true);
    expect(called.community).toHaveLength(5);
    expect(totalChips(called)).toBe(2000);
  });
});

describe("checkWinners mengikuti pembagian pot", () => {
  it("menyertakan pemenang side pot", () => {
    const player = (name, totalBet, hand) => ({
      name,
      chips: 0,
      bet: 0,
      totalBet,
      folded: false,
      hand: cards(...hand),
      lastAction: null,
      lastActionAmount: 0,
    });
    const state = {
      players: [
        player("Short", 50, ["AS", "AH"]),
        player("Mid", 200, ["4D", "8S"]),
        player("Big", 200, ["KS", "KH"]),
      ],
      community: cards("2C", "7D", "9H", "JS", "3C"),
      round: "Showdown",
      endgame: true,
      pot: 450,
      winners: [],
    };
    awardPots(state);

    const game = new Game([]);
    expect(game.checkWinners(state)).toEqual([0, 2]);
    expect(state.players.map((p) => p.chips)).toEqual([150, 0, 300]);
    expect(game.calculatePot(state)).toBe(450);
  });
});
