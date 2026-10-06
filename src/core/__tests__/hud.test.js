import { appendLimited, upsertBestScore } from "../hud";

const msgs = (from, to) =>
  Array.from({ length: to - from }, (_, i) => ({ id: from + i }));

describe("appendLimited", () => {
  it("menyimpan hanya pesan terbaru", () => {
    expect(appendLimited(msgs(0, 8), msgs(8, 11)).map((m) => m.id)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ]);
  });

  it("tetap dibatasi walau pesan baru melebihi batas", () => {
    const result = appendLimited(msgs(0, 5), msgs(5, 17));
    expect(result).toHaveLength(10);
    expect(result[9].id).toBe(16);
  });
});

describe("upsertBestScore", () => {
  it("tidak menurunkan skor terbaik pemain", () => {
    const prev = [{ name: "Hero", score: 1500, avatar: "a" }];
    const next = upsertBestScore(prev, {
      name: "Hero",
      score: 300,
      avatar: "b",
    });
    expect(next).toEqual([{ name: "Hero", score: 1500, avatar: "b" }]);
  });

  it("menaikkan skor dan mengurutkan menurun dengan batas 5", () => {
    const prev = [100, 200, 300, 400, 500].map((score, i) => ({
      name: `P${i}`,
      score,
    }));
    const next = upsertBestScore(prev, { name: "P0", score: 900 });
    expect(next.map((e) => e.name)).toEqual(["P0", "P4", "P3", "P2", "P1"]);
    expect(upsertBestScore(next, { name: "New", score: 50 })).toHaveLength(5);
  });
});
