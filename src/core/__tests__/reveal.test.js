import {
  FOLD_RESULT_DELAY_MS,
  REVEAL_STEP_MS,
  SHOWDOWN_RESULT_DELAY_MS,
  resultDelayMs,
  revealSteps,
} from "../reveal";

const ended = (community, folded = [false, false]) => ({
  endgame: true,
  community: new Array(community).fill({ rank: "2", suit: "C" }),
  players: folded.map((f) => ({ folded: f })),
});

describe("revealSteps", () => {
  it("flop sekaligus, turn dan river satu per satu", () => {
    expect(revealSteps(0, 5)).toEqual([3, 4, 5]);
    expect(revealSteps(3, 5)).toEqual([4, 5]);
    expect(revealSteps(4, 5)).toEqual([5]);
    expect(revealSteps(5, 5)).toEqual([]);
  });
});

describe("resultDelayMs", () => {
  it("runout dari preflop menunggu turn dan river terlihat", () => {
    expect(resultDelayMs(0, ended(5))).toBe(
      2 * REVEAL_STEP_MS + SHOWDOWN_RESULT_DELAY_MS,
    );
  });

  it("showdown biasa di river tetap memberi jeda", () => {
    expect(resultDelayMs(5, ended(5))).toBe(SHOWDOWN_RESULT_DELAY_MS);
  });

  it("menang karena lawan fold memakai jeda singkat", () => {
    expect(resultDelayMs(3, ended(3, [false, true]))).toBe(
      FOLD_RESULT_DELAY_MS,
    );
  });
});
