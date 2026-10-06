import Game from "../models";
import { finalHandOdds, revealedWinChance, winChance } from "../odds";

const cards = (...codes) =>
  codes.map((code) => ({ rank: code.slice(0, -1), suit: code.slice(-1) }));
const seeded = (seed) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};
const prob = (odds, name) =>
  odds.categories.find((c) => c.name === name).probability;
const total = (odds) =>
  odds.categories.reduce((sum, c) => sum + c.probability, 0);

describe("finalHandOdds", () => {
  it("satu 5 di tangan + dua 5 di flop: Four of a Kind = 46/1081 (persis)", () => {
    const odds = finalHandOdds(cards("5S", "KH"), cards("5D", "5C", "9H"));
    expect(odds.exact).toBe(true);
    expect(odds.current).toBe("Three of a Kind");
    expect(prob(odds, "Four of a Kind")).toBeCloseTo(46 / 1081, 12);
    expect(total(odds)).toBeCloseTo(1, 12);
  });

  it("set di flop menuju turn: Four of a Kind = 1/46 (persis)", () => {
    const odds = finalHandOdds(
      cards("5S", "5H"),
      cards("5D", "KC", "2H", "9S"),
    );
    expect(odds.exact).toBe(true);
    expect(prob(odds, "Four of a Kind")).toBeCloseTo(1 / 46, 12);
  });

  it("di river hasilnya pasti kombinasi saat ini", () => {
    const odds = finalHandOdds(
      cards("AS", "AH"),
      cards("AD", "KC", "KH", "2S", "7D"),
    );
    expect(odds.current).toBe("Full House");
    expect(prob(odds, "Full House")).toBe(1);
  });

  it("preflop memakai simulasi dan tetap berjumlah 100%", () => {
    const odds = finalHandOdds(cards("AS", "AH"), [], {
      samples: 4000,
      random: seeded(9),
    });
    expect(odds.exact).toBe(false);
    expect(odds.current).toBeNull();
    expect(total(odds)).toBeCloseTo(1, 12);
    // Pocket pair tidak pernah berakhir High Card
    expect(prob(odds, "High Card")).toBe(0);
    // Peluang set-or-better dengan pocket pair sekitar 19%
    const setOrBetter = odds.categories
      .filter((c) => c.rankValue >= 3)
      .reduce((sum, c) => sum + c.probability, 0);
    expect(setOrBetter).toBeGreaterThan(0.15);
    expect(setOrBetter).toBeLessThan(0.3);
  });

  it("mengembalikan null bila pemain tidak memegang dua kartu", () => {
    expect(finalHandOdds([], [])).toBeNull();
  });
});

describe("winChance", () => {
  it("tidak memakai kartu meja yang belum terlihat", () => {
    const game = new Game([{ name: "Hero" }, { name: "Bot" }]);
    const state = game.start();
    const used = cards("7C", "7D", "7H", "7S", "2C", "3D", "9H");
    const usedKeys = new Set(used.map((c) => c.rank + c.suit));
    state.players[0].hand = used.slice(0, 2);
    state.community = used.slice(2);
    // Kartu lawan dan dek tidak boleh berisi kartu yang sudah dipakai
    const rest = [...state.deck, ...state.players[1].hand].filter(
      (c) => !usedKeys.has(c.rank + c.suit),
    );
    state.players[1].hand = rest.slice(0, 2);
    state.deck = rest.slice(2);

    const hidden = winChance(state, 0, 0, {
      simulations: 1500,
      random: seeded(5),
    });
    const visible = winChance(state, 0, 5, {
      simulations: 300,
      random: seeded(5),
    });
    // 77 preflop melawan satu tangan acak sekitar 66%
    expect(hidden).toBeGreaterThan(0.55);
    expect(hidden).toBeLessThan(0.78);
    // Dengan quad 7 terlihat di meja, hampir pasti menang
    expect(visible).toBeGreaterThan(0.99);
  });
});

describe("revealedWinChance", () => {
  const showdown = (heroHand, villainHand, board, visible) => {
    const game = new Game([{ name: "Hero" }, { name: "Villain" }]);
    const state = game.start();
    const used = cards(...heroHand, ...villainHand, ...board);
    const usedKeys = new Set(used.map((c) => c.rank + c.suit));
    const rest = [
      ...state.deck,
      ...state.players.flatMap((p) => p.hand),
    ].filter((c) => !usedKeys.has(c.rank + c.suit));
    state.players[0].hand = cards(...heroHand);
    state.players[1].hand = cards(...villainHand);
    state.community = cards(...board);
    state.deck = rest.slice(0, 52 - used.length);
    state.endgame = true;
    return revealedWinChance(state, 0, visible);
  };

  it("menghitung persis melawan kartu lawan yang terbuka", () => {
    // AA vs KK di flop A-7-2 (turn & river belum terlihat): KK hanya menang
    // dengan runner-runner K-K (quad K > full house A), tanpa flush/straight.
    const chance = showdown(
      ["AS", "AH"],
      ["KS", "KH"],
      ["AD", "7C", "2D", "9S", "3H"],
      3,
    );
    expect(chance).toBeCloseTo(989 / 990, 12);
  });

  it("di river hasilnya pasti", () => {
    expect(
      showdown(["AS", "AH"], ["KS", "KH"], ["AD", "7C", "2D", "9S", "3H"], 5),
    ).toBe(1);
    expect(
      showdown(["KS", "KH"], ["AS", "AH"], ["AD", "7C", "2D", "9S", "3H"], 5),
    ).toBe(0);
  });
});
