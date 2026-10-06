import { act, render } from "@testing-library/react";
import PlayerSeat, { TURN_SECONDS } from "../PlayerSeat";

const player = {
  name: "Hero",
  chips: 1000,
  hand: [
    { rank: "A", suit: "S" },
    { rank: "K", suit: "S" },
  ],
  lastAction: null,
  lastActionAmount: 0,
  folded: false,
};

describe("PlayerSeat timer", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const tick = (seconds) =>
    act(() => {
      vi.advanceTimersByTime(seconds * 1000);
    });

  it("memanggil onTimeout sekali saat waktu habis", () => {
    const onTimeout = vi.fn();
    render(
      <PlayerSeat
        player={player}
        isYou
        isTurn
        round="Flop"
        onTimeout={onTimeout}
      />,
    );
    tick(TURN_SECONDS - 1);
    expect(onTimeout).not.toHaveBeenCalled();
    tick(1);
    expect(onTimeout).toHaveBeenCalledTimes(1);
  });

  it("tidak berjalan bila bukan giliran", () => {
    const onTimeout = vi.fn();
    render(
      <PlayerSeat player={player} isYou round="Flop" onTimeout={onTimeout} />,
    );
    tick(TURN_SECONDS + 5);
    expect(onTimeout).not.toHaveBeenCalled();
  });

  it("direset saat street berganti walau giliran tetap", () => {
    const onTimeout = vi.fn();
    const { rerender } = render(
      <PlayerSeat
        player={player}
        isYou
        isTurn
        round="Preflop"
        onTimeout={onTimeout}
      />,
    );
    tick(TURN_SECONDS - 5);
    rerender(
      <PlayerSeat
        player={player}
        isYou
        isTurn
        round="Flop"
        onTimeout={onTimeout}
      />,
    );
    tick(TURN_SECONDS - 1);
    expect(onTimeout).not.toHaveBeenCalled();
    tick(1);
    expect(onTimeout).toHaveBeenCalledTimes(1);
  });
});
