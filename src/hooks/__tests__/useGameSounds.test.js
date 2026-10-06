import { renderHook } from "@testing-library/react";
import { useCardFlipSound, useHandEndSound } from "../useGameSounds";

describe("useCardFlipSound", () => {
  it("berbunyi di flop/turn/river pada setiap tangan, termasuk tangan berikutnya", () => {
    const play = vi.fn();
    const { rerender } = renderHook(
      ({ n }) => useCardFlipSound(n, true, play),
      { initialProps: { n: 0 } },
    );
    [3, 4, 5].forEach((n) => rerender({ n }));
    expect(play).toHaveBeenCalledTimes(3);

    // tangan baru
    [0, 3, 4, 5].forEach((n) => rerender({ n }));
    expect(play).toHaveBeenCalledTimes(6);
  });

  it("diam saat suara dimatikan", () => {
    const play = vi.fn();
    const { rerender } = renderHook(
      ({ n }) => useCardFlipSound(n, false, play),
      { initialProps: { n: 0 } },
    );
    rerender({ n: 3 });
    expect(play).not.toHaveBeenCalled();
  });
});

describe("useHandEndSound", () => {
  it("berbunyi sekali per tangan walau komponen re-render", () => {
    const play = vi.fn();
    const { rerender } = renderHook(
      ({ status, enabled }) => useHandEndSound(status, true, enabled, play),
      { initialProps: { status: "playing", enabled: true } },
    );
    rerender({ status: "ended", enabled: true });
    rerender({ status: "ended", enabled: true });
    rerender({ status: "ended", enabled: false });
    rerender({ status: "ended", enabled: true });
    expect(play).toHaveBeenCalledTimes(1);

    rerender({ status: "playing", enabled: true });
    rerender({ status: "ended", enabled: true });
    expect(play).toHaveBeenCalledTimes(2);
  });
});
