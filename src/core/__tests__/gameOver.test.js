import { getGameOverState } from "../gameOver";

const players = (...chips) =>
  chips.map((c, i) => ({ name: `P${i}`, chips: c }));

describe("getGameOverState", () => {
  it("tidak menganggap all-in di tengah tangan sebagai kalah", () => {
    expect(getGameOverState("playing", players(0, 500, 500))).toEqual({
      playerOutOfChips: false,
      playerWonGame: false,
    });
  });

  it("tidak menganggap bot all-in di tengah tangan sebagai menang", () => {
    expect(getGameOverState("playing", players(500, 0, 0)).playerWonGame).toBe(
      false,
    );
  });

  it("kalah bila chip habis setelah tangan selesai", () => {
    expect(
      getGameOverState("ended", players(0, 1500, 1500)).playerOutOfChips,
    ).toBe(true);
  });

  it("menang bila semua bot habis setelah tangan selesai", () => {
    expect(getGameOverState("ended", players(3000, 0, 0)).playerWonGame).toBe(
      true,
    );
  });
});
