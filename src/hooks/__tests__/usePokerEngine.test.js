import { act, renderHook } from "@testing-library/react";
import usePokerEngine from "../usePokerEngine";

// Heads-up: dealer 0 memasang small blind dan beraksi pertama
const BOT_FIRST = [{ name: "Bot", isBot: true }, { name: "Hero" }];
const HERO_FIRST = [{ name: "Hero" }, { name: "Bot", isBot: true }];

describe("usePokerEngine.handleAction", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("mengabaikan aksi pemain saat giliran bot", () => {
    const { result, unmount } = renderHook(() => usePokerEngine(BOT_FIRST));
    expect(result.current.state.currentPlayer).toBe(0);
    const before = result.current.state;

    act(() => result.current.handleAction("fold"));

    expect(result.current.state).toBe(before);
    expect(result.current.state.players[0].folded).toBe(false);
    unmount();
  });

  it("menerapkan aksi pada giliran pemain sendiri", () => {
    const { result, unmount } = renderHook(() => usePokerEngine(HERO_FIRST));
    expect(result.current.state.currentPlayer).toBe(0);

    act(() => result.current.handleAction("call"));

    expect(result.current.state.players[0].lastAction).toBe("call");
    expect(result.current.state.currentPlayer).toBe(1);
    unmount();
  });
});
