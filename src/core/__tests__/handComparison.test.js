import { evaluateHandPublic, getWinners } from "../handEvaluator";

const cards = (...codes) =>
  codes.map((code) => ({ rank: code.slice(0, -1), suit: code.slice(-1) }));

// Bandingkan dua tangan 5 kartu, kembalikan indeks pemenang
const winnersOf = (a, b) => {
  const players = [{ hand: cards(...a) }, { hand: cards(...b) }];
  return getWinners(players, []).map((w) => players.indexOf(w));
};

describe("perbandingan tangan dengan kategori sama", () => {
  test.each([
    [
      "One Pair: KK menang atas 22 walau kicker A",
      ["KS", "KH", "2C", "3D", "4H"],
      ["2S", "2H", "AC", "QD", "JH"],
    ],
    [
      "Two Pair: KK-QQ menang atas 33-22 walau kicker A",
      ["KS", "KH", "QC", "QD", "2H"],
      ["3S", "3H", "2C", "2D", "AH"],
    ],
    [
      "Three of a Kind: 999 menang atas 555 walau kicker A-K",
      ["9S", "9H", "9C", "2D", "3H"],
      ["5S", "5H", "5C", "AD", "KH"],
    ],
    [
      "Full House: KKK33 menang atas 222AA",
      ["KS", "KH", "KC", "3D", "3H"],
      ["2S", "2H", "2C", "AD", "AH"],
    ],
    [
      "Four of a Kind: KKKK menang atas 2222 walau kicker A",
      ["KS", "KH", "KC", "KD", "2H"],
      ["2S", "2H", "2C", "2D", "AH"],
    ],
    [
      "One Pair sama: kicker A menang",
      ["KS", "KH", "AC", "3D", "2H"],
      ["KC", "KD", "QC", "JD", "10H"],
    ],
    [
      "Two Pair sama: kicker A menang",
      ["KS", "KH", "QC", "QD", "AH"],
      ["KC", "KD", "QS", "QH", "JH"],
    ],
  ])("%s", (_, a, b) => {
    expect(winnersOf(a, b)).toEqual([0]);
    expect(winnersOf(b, a)).toEqual([1]);
  });

  it("menghasilkan seri bila pasangan dan kicker identik", () => {
    expect(
      winnersOf(["KS", "KH", "AC", "3D", "2H"], ["KC", "KD", "AH", "3S", "2C"]),
    ).toEqual([0, 1]);
  });

  it("mengurutkan kicker: rank pasangan dulu, lalu kicker menurun", () => {
    const result = evaluateHandPublic(cards("JH", "JS", "3C", "9D", "KH"));
    expect(result.kickers).toEqual([11, 13, 9, 3]);
  });

  it("menentukan pemenang 7 kartu dengan benar", () => {
    const board = cards("2C", "7D", "9H", "JS", "4C");
    const players = [{ hand: cards("KS", "KH") }, { hand: cards("2S", "AH") }];
    expect(getWinners(players, board)).toEqual([players[0]]);
  });
});

describe("fastCategory", () => {
  it("sama dengan bestRankValue untuk 20.000 tangan 7 kartu acak", async () => {
    const { bestRankValue, fastCategory } = await import("../handEvaluator");
    const ranks = [
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
    const deck = ranks.flatMap((rank) =>
      ["C", "D", "H", "S"].map((suit) => ({ rank, suit })),
    );
    let seed = 42;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    const mismatches = [];
    const seen = new Set();
    for (let n = 0; n < 20000; n++) {
      const pool = [...deck];
      for (let i = 0; i < 7; i++) {
        const j = i + Math.floor(random() * (pool.length - i));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      const hand = pool.slice(0, 7);
      const expected = bestRankValue(hand);
      seen.add(expected);
      if (fastCategory(hand) !== expected) mismatches.push(hand);
    }
    expect(mismatches).toEqual([]);
    expect(seen.size).toBeGreaterThanOrEqual(8); // hampir semua kategori teruji
  });

  it.each([
    [["AS", "2S", "3S", "4S", "5S", "KD", "KH"], 8], // wheel straight flush
    [["AS", "KD", "QH", "JC", "10S", "2D", "3H"], 4], // broadway
    [["AS", "2D", "3H", "4C", "5S", "9D", "KH"], 4], // wheel
    [["KS", "KD", "KH", "QC", "QS", "QD", "2H"], 6], // dua trips = full house
    [["2S", "4S", "6S", "8S", "10S", "3D", "5H"], 5], // flush, bukan straight flush
  ])("kasus khusus %#", (codes, expected) => {
    return import("../handEvaluator").then(({ fastCategory }) =>
      expect(fastCategory(cards(...codes))).toBe(expected),
    );
  });
});
