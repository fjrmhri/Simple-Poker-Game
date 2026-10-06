import Game from "../models";
import { AIBot, BOT_PROFILES, decideAction, estimateWinRate } from "../ai";

// random() = 0.5 menghilangkan noise dan membuat bluff/trap tidak terpicu
const neutral = () => 0.5;
const seeded = (seed) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};
const cards = (...codes) =>
  codes.map((code) => ({ rank: code.slice(0, -1), suit: code.slice(-1) }));

const ctx = (overrides) => ({
  toCall: 0,
  pot: 100,
  stack: 900,
  opponents: 1,
  street: "Flop",
  raisesThisStreet: 0,
  inPosition: false,
  actions: [
    { type: "fold" },
    { type: "check" },
    { type: "bet", min: 20, max: 900 },
  ],
  ...overrides,
});
const facing = (toCall, max, extra = {}) =>
  ctx({
    toCall,
    actions: [
      { type: "fold" },
      { type: "call", amount: toCall },
      ...(max > 0 ? [{ type: "bet", min: 20, max }] : []),
    ],
    ...extra,
  });

describe("decideAction", () => {
  it.each(["easy", "normal", "hard"])(
    "%s tidak pernah fold saat bisa check",
    (level) => {
      const result = decideAction(ctx(), 0.05, BOT_PROFILES[level], neutral);
      expect(result).toEqual({ action: "check" });
    },
  );

  it("bet dengan tangan kuat, ukurannya dalam batas aksi", () => {
    const result = decideAction(ctx(), 0.85, BOT_PROFILES.hard, neutral);
    expect(result.action).toBe("bet");
    expect(result.amount).toBeGreaterThanOrEqual(20);
    expect(result.amount).toBeLessThanOrEqual(900);
  });

  it("fold bila equity di bawah pot odds dan call bila di atasnya", () => {
    const decision = (eq) =>
      decideAction(facing(100, 0), eq, BOT_PROFILES.normal, neutral);
    // pot odds = 100 / (100 + 100) = 0.5
    expect(decision(0.3)).toEqual({ action: "fold" });
    expect(decision(0.62)).toEqual({ action: "call" });
  });

  it("tangan premium tetap call saat menghadapi all-in", () => {
    const shove = facing(980, 0, { pot: 1010, stack: 990 });
    expect(decideAction(shove, 0.85, BOT_PROFILES.hard, neutral)).toEqual({
      action: "call",
    });
  });

  it("menghormati bet besar: tangan sedang fold walau di atas pot odds mentah", () => {
    // pot odds = 300 / 600 = 0.5; equity mentah 0.55 terkoreksi di bawahnya
    const bigBet = facing(300, 0, { pot: 300 });
    expect(decideAction(bigBet, 0.55, BOT_PROFILES.hard, neutral)).toEqual({
      action: "fold",
    });
    // easy tidak mengoreksi equity sehingga tetap call
    expect(decideAction(bigBet, 0.55, BOT_PROFILES.easy, neutral)).toEqual({
      action: "call",
    });
  });

  it("berhenti re-raise setelah batas raise per street", () => {
    const capped = facing(50, 800, { raisesThisStreet: 2 });
    expect(decideAction(capped, 0.95, BOT_PROFILES.hard, neutral)).toEqual({
      action: "call",
    });
    const open = facing(50, 800, { raisesThisStreet: 1 });
    expect(decideAction(open, 0.95, BOT_PROFILES.hard, neutral).action).toBe(
      "bet",
    );
  });

  it("raise yang hampir sebesar stack dijadikan all-in", () => {
    const short = facing(50, 120, { pot: 400 });
    expect(decideAction(short, 0.95, BOT_PROFILES.hard, neutral)).toEqual({
      action: "bet",
      amount: 120,
    });
  });

  it("bluff hard hanya terjadi saat beraksi terakhir", () => {
    const always = () => 0; // memicu bluff, noise -profile.noise
    const outOfPosition = decideAction(
      ctx({ inPosition: false }),
      0.3,
      BOT_PROFILES.hard,
      always,
    );
    expect(outOfPosition).toEqual({ action: "check" });
    const inPosition = decideAction(
      ctx({ inPosition: true }),
      0.3,
      BOT_PROFILES.hard,
      always,
    );
    expect(inPosition.action).toBe("bet");
  });
});

describe("estimateWinRate", () => {
  const headsUp = (heroHand, community = []) => {
    const game = new Game([{ name: "A" }, { name: "B" }]);
    const state = game.start();
    state.players[0].hand = cards(...heroHand);
    state.community = cards(...community);
    const used = new Set(
      [...state.players[0].hand, ...state.community].map(
        (c) => c.rank + c.suit,
      ),
    );
    state.deck = state.deck.filter((c) => !used.has(c.rank + c.suit));
    state.players[1].hand = state.players[1].hand.filter(
      (c) => !used.has(c.rank + c.suit),
    );
    return state;
  };

  it("AA preflop heads-up sekitar 85%", () => {
    const eq = estimateWinRate(headsUp(["AS", "AH"]), 0, 2000, seeded(7));
    expect(eq).toBeGreaterThan(0.8);
    expect(eq).toBeLessThan(0.9);
  });

  it("royal flush di river selalu menang", () => {
    const state = headsUp(["AS", "KS"], ["QS", "JS", "10S", "2D", "3C"]);
    expect(estimateWinRate(state, 0, 200, seeded(3))).toBe(1);
  });
});

describe("AIBot", () => {
  const decide = (level, hand, setup) => {
    const game = new Game([{ name: "Bot" }, { name: "Villain" }]);
    let state = game.start(); // heads-up: dealer 0 = SB, beraksi pertama
    state.players[0].hand = cards(...hand);
    if (setup) state = setup(game, state);
    let chosen;
    new AIBot(game, state, { push: (a) => (chosen = a) }, level, {
      random: seeded(11),
    }).run();
    return chosen;
  };

  it.each(["easy", "normal", "hard"])("%s tidak fold AA preflop", (level) => {
    expect(decide(level, ["AS", "AH"]).action).not.toBe("fold");
  });

  it("hard fold 72o saat menghadapi all-in", () => {
    const result = decide("hard", ["7C", "2D"], (game, state) => {
      state.currentPlayer = 1;
      state = game.applyAction(state, "bet", 5000); // villain shove
      state.players[0].hand = cards("7C", "2D");
      return state;
    });
    expect(result).toEqual({ action: "fold" });
  });
});
