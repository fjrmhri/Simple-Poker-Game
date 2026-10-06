import { act, renderHook } from "@testing-library/react";
import usePokerEngine from "../usePokerEngine";

// Dua pemain: dealer 0, SB 1 (beraksi pertama), BB 0
const BOT_FIRST = [{ name: "Hero" }, { name: "Bot", isBot: true }];
const HERO_FIRST = [{ name: "Bot", isBot: true }, { name: "Hero" }];

describe("usePokerEngine.handleAction", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("mengabaikan aksi pemain saat giliran bot", () => {
    const { result, unmount } = renderHook(() => usePokerEngine(BOT_FIRST));
    expect(result.current.state.currentPlayer).toBe(1);
    const before = result.current.state;

    act(() => result.current.handleAction("fold"));

    expect(result.current.state).toBe(before);
    expect(result.current.state.players[1].folded).toBe(false);
    unmount();
  });

  it("menerapkan aksi pada giliran pemain sendiri", () => {
    const { result, unmount } = renderHook(() => usePokerEngine(HERO_FIRST));
    expect(result.current.state.currentPlayer).toBe(1);

    act(() => result.current.handleAction("call"));

    expect(result.current.state.players[1].lastAction).toBe("call");
    expect(result.current.state.currentPlayer).toBe(0);
    unmount();
  });
});
