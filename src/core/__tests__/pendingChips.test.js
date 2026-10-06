import Game from "../models";

describe("chip tertunda (bonus)", () => {
  it("ditambahkan saat tangan berikutnya dibagikan lalu direset", () => {
    const game = new Game([{ name: "A" }, { name: "B" }]);
    const prev = game.applyAction(game.start(), "fold");
    const chipsBefore = prev.players[0].chips;
    prev.players[0].pendingChips = 250;

    const next = game.start(prev);
    const blind = next.players[0].bet;
    expect(next.players[0].chips + blind).toBe(chipsBefore + 250);
    expect(next.players[0].pendingChips).toBe(0);
  });

  it("menghidupkan kembali pemain yang chipnya habis", () => {
    const game = new Game([{ name: "A" }, { name: "B" }, { name: "C" }]);
    const prev = game.start();
    prev.players[0].chips = 0;
    prev.players[0].pendingChips = 250;
    const next = game.start(prev);
    expect(next.players[0].sittingOut).toBe(false);
    expect(next.players[0].hand).toHaveLength(2);
  });
});
