import { act, renderHook } from "@testing-library/react";
import useRevealPacing from "../useRevealPacing";
import {
  FOLD_RESULT_DELAY_MS,
  REVEAL_STEP_MS,
  SHOWDOWN_RESULT_DELAY_MS,
} from "../../core/reveal";

const card = { rank: "2", suit: "C" };
const makeState = ({
  hand = 1,
  community = 0,
  endgame = false,
  folded = [false, false],
}) => ({
  gameId: 1,
  handNumber: hand,
  endgame,
  community: new Array(community).fill(card),
  players: folded.map((f) => ({ folded: f })),
});

describe("useRevealPacing", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());
  const advance = (ms) =>
    act(() => {
      vi.advanceTimersByTime(ms);
    });

  it("membuka runout bertahap lalu baru mengumumkan hasil", () => {
    const { result, rerender } = renderHook((s) => useRevealPacing(s), {
      initialProps: makeState({}),
    });
    expect(result.current).toEqual({ visibleCount: 0, resultReady: false });

    rerender(makeState({ community: 5, endgame: true }));
    advance(0);
    expect(result.current.visibleCount).toBe(3);
    advance(REVEAL_STEP_MS - 1);
    expect(result.current.visibleCount).toBe(3);
    advance(1);
    expect(result.current.visibleCount).toBe(4); // turn terlihat
    advance(REVEAL_STEP_MS);
    expect(result.current.visibleCount).toBe(5);
    expect(result.current.resultReady).toBe(false);
    advance(SHOWDOWN_RESULT_DELAY_MS);
    expect(result.current.resultReady).toBe(true);

    // Tangan berikutnya mulai dari nol dan belum selesai
    rerender(makeState({ hand: 2 }));
    expect(result.current).toEqual({ visibleCount: 0, resultReady: false });
  });

  it("street normal langsung terlihat", () => {
    const { result, rerender } = renderHook((s) => useRevealPacing(s), {
      initialProps: makeState({ community: 3 }),
    });
    rerender(makeState({ community: 4 }));
    advance(0);
    expect(result.current.visibleCount).toBe(4);
  });

  it("menang karena fold hanya menunggu jeda singkat", () => {
    const { result, rerender } = renderHook((s) => useRevealPacing(s), {
      initialProps: makeState({ community: 3 }),
    });
    rerender(makeState({ community: 3, endgame: true, folded: [false, true] }));
    advance(FOLD_RESULT_DELAY_MS);
    expect(result.current.resultReady).toBe(true);
  });
});
