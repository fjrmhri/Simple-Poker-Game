import Game from "../models";

// Simulasi acak: memastikan chip tidak bocor, tidak ada state macet, dan dek selalu utuh
const totalChips = (s) =>
  s.players.reduce((sum, p) => sum + p.chips + p.bet, 0) + s.pot;

function randomAction(game, state) {
  const actions = game.actions(state);
  const pick = actions[Math.floor(Math.random() * actions.length)];
  if (pick.type !== "bet") return [pick.type];
  const r = Math.random();
  const amount =
    r < 0.3
      ? pick.min
      : r < 0.5
        ? pick.max
        : pick.min + Math.floor(Math.random() * (pick.max - pick.min + 1));
  return ["bet", amount];
}

function simulate(playerCount, games = 25, hands = 40) {
  for (let g = 0; g < games; g++) {
    const game = new Game(
      Array.from({ length: playerCount }, (_, i) => ({ name: `P${i}` })),
    );
    const expected = playerCount * 1000;
    let state = game.start();
    for (let h = 0; h < hands; h++) {
      let steps = 0;
      while (!state.endgame) {
        expect(game.actions(state).length).toBeGreaterThan(0);
        state = game.applyAction(state, ...randomAction(game, state));
        expect(totalChips(state)).toBe(expected);
        expect(++steps).toBeLessThan(200);
      }
      expect(state.players.every((p) => p.chips >= 0)).toBe(true);
      expect(state.winners.length).toBeGreaterThan(0);
      if (state.players.filter((p) => p.chips > 0).length < 2) break;

      state = game.start(state);
      expect(totalChips(state)).toBe(expected);
      const cards = [
        ...state.deck,
        ...state.community,
        ...state.players.flatMap((p) => p.hand),
      ].map((c) => `${c.rank}${c.suit}`);
      expect(new Set(cards).size).toBe(52);
    }
  }
}

test.each([2, 3, 4, 6])("invariant mesin dengan %i pemain", (n) => {
  simulate(n);
});
