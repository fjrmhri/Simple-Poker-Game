import { act, renderHook } from "@testing-library/react";
import usePokerEngine from "../usePokerEngine";
import Game from "../../core/models";

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

describe("usePokerEngine lainnya", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("hanya membagikan satu tangan saat mount", () => {
    const spy = jest.spyOn(Game.prototype, "start");
    const { unmount } = renderHook(() => usePokerEngine(HERO_FIRST));
    expect(spy).toHaveBeenCalledTimes(1);
    unmount();
  });

  it("awardChips tidak mengubah chip di tengah tangan, tetapi di tangan berikutnya", () => {
    const { result, unmount } = renderHook(() => usePokerEngine(HERO_FIRST));
    const chipsBefore = result.current.state.players[0].chips;

    act(() => result.current.awardChips(0, 250));
    expect(result.current.state.players[0].chips).toBe(chipsBefore);
    expect(result.current.state.players[0].pendingChips).toBe(250);

    act(() => result.current.handleAction("fold"));
    const afterFold = result.current.state.players[0].chips;
    act(() => result.current.startNewHand());
    const hero = result.current.state.players[0];
    expect(hero.chips + hero.bet).toBe(afterFold + 250);
    unmount();
  });
});
