import Game from '../models';
import { getWinners } from '../handEvaluator';

describe('Game.start', () => {
  it('initializes players with blinds and deterministic deck', () => {
    const originalRandom = Math.random;
    Math.random = () => 0; // deterministic shuffle
    const game = new Game([{ name: 'Alice' }, { name: 'Bob' }]);
    const state = game.start();
    Math.random = originalRandom;

    expect(state.players).toHaveLength(2);
    // With Math.random=0 deck order is known
    expect(state.players[0].hand).toEqual([
      { rank: '2', suit: 'C' },
      { rank: 'A', suit: 'S' },
    ]);
    expect(state.players[1].hand).toEqual([
      { rank: 'A', suit: 'H' },
      { rank: 'A', suit: 'D' },
    ]);
    expect(state.players[1].bet).toBe(10); // small blind
    expect(state.players[0].bet).toBe(20); // big blind
    expect(state.currentPlayer).toBe(1);
  });
});

describe('Game.applyAction', () => {
  let game;
  let state;
  const setup = () => {
    const originalRandom = Math.random;
    Math.random = () => 0;
    game = new Game([{ name: 'Alice' }, { name: 'Bob' }]);
    state = game.start();
    Math.random = originalRandom;
  };

  beforeEach(() => {
    setup();
  });

  it('handles fold and ends the game', () => {
    const next = game.applyAction(state, 'fold');
    expect(next.endgame).toBe(true);
    expect(next.winners).toEqual([0]);
    expect(next.players[0].chips).toBe(1010);
  });

  it('handles call and advances to flop', () => {
    // Small blind raises first
    const afterRaise = game.applyAction(state, 'bet', 20);
    // Big blind calls the raise
    const next = game.applyAction(afterRaise, 'call');
    expect(next.round).toBe('Flop');
    expect(next.pot).toBe(80);
    expect(next.community).toHaveLength(3);
    expect(next.currentPlayer).toBe(1);
    expect(next.players[0].chips).toBe(960);
    expect(next.players[1].chips).toBe(960);
  });

  it('handles raise and switches turn', () => {
    const next = game.applyAction(state, 'bet', 20);
    expect(next.players[1].bet).toBe(40);
    expect(next.players[1].lastAction).toBe('raise');
    expect(next.currentPlayer).toBe(0);
    expect(next.round).toBe('Preflop');
  });
});

describe('getWinners', () => {
  it('identifies single winner', () => {
    const players = [
      { hand: [
          { rank: 'A', suit: 'H' },
          { rank: 'K', suit: 'H' },
        ] },
      { hand: [
          { rank: '2', suit: 'C' },
          { rank: '3', suit: 'D' },
        ] },
    ];
    const community = [
      { rank: '4', suit: 'H' },
      { rank: '5', suit: 'H' },
      { rank: '6', suit: 'H' },
      { rank: '7', suit: 'D' },
      { rank: '8', suit: 'C' },
    ];
    const winners = getWinners(players, community);
    expect(winners).toHaveLength(1);
    expect(winners[0]).toBe(players[0]);
  });

  it('detects tie between players', () => {
    const players = [
      { hand: [
          { rank: '2', suit: 'C' },
          { rank: '3', suit: 'D' },
        ] },
      { hand: [
          { rank: '4', suit: 'S' },
          { rank: '5', suit: 'C' },
        ] },
    ];
    const community = [
      { rank: 'A', suit: 'H' },
      { rank: 'K', suit: 'H' },
      { rank: 'Q', suit: 'H' },
      { rank: 'J', suit: 'H' },
      { rank: '10', suit: 'H' },
    ];
    const winners = getWinners(players, community);
    expect(winners).toHaveLength(2);
  });
});
