import { awardPots } from "./models";

test("handles side pots with multiple all-ins", () => {
  const state = {
    players: [
      {
        name: "P1",
        chips: 0,
        bet: 0,
        totalBet: 50,
        folded: false,
        hand: [
          { rank: "A", suit: "S" },
          { rank: "A", suit: "H" },
        ],
        lastAction: null,
        lastActionAmount: 0,
      },
      {
        name: "P2",
        chips: 0,
        bet: 0,
        totalBet: 100,
        folded: false,
        hand: [
          { rank: "K", suit: "S" },
          { rank: "K", suit: "H" },
        ],
        lastAction: null,
        lastActionAmount: 0,
      },
      {
        name: "P3",
        chips: 0,
        bet: 0,
        totalBet: 200,
        folded: false,
        hand: [
          { rank: "Q", suit: "S" },
          { rank: "Q", suit: "H" },
        ],
        lastAction: null,
        lastActionAmount: 0,
      },
    ],
    community: [
      { rank: "2", suit: "C" },
      { rank: "7", suit: "D" },
      { rank: "9", suit: "H" },
      { rank: "J", suit: "S" },
      { rank: "3", suit: "C" },
    ],
    pot: 350,
    winners: [],
  };

  awardPots(state);

  expect(state.players[0].chips).toBe(150); // main pot
  expect(state.players[1].chips).toBe(100); // side pot
  expect(state.players[2].chips).toBe(100); // final side pot
  expect(state.pot).toBe(0);
  expect(new Set(state.winners)).toEqual(new Set([0, 1, 2]));
});

