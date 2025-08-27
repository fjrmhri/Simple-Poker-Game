import { evaluateHandPublic, getHandName } from '../handEvaluator';

describe('evaluateHandPublic', () => {
  it('detects a straight flush', () => {
    const cards = [
      { rank: '9', suit: 'H' },
      { rank: '10', suit: 'H' },
      { rank: 'J', suit: 'H' },
      { rank: 'Q', suit: 'H' },
      { rank: 'K', suit: 'H' },
    ];
    const result = evaluateHandPublic(cards);
    expect(result.rankValue).toBe(8);
    expect(getHandName([], cards)).toBe('Straight Flush');
  });

  it('detects four of a kind', () => {
    const cards = [
      { rank: 'A', suit: 'H' },
      { rank: 'A', suit: 'D' },
      { rank: 'A', suit: 'C' },
      { rank: 'A', suit: 'S' },
      { rank: '9', suit: 'H' },
    ];
    const result = evaluateHandPublic(cards);
    expect(result.rankValue).toBe(7);
    expect(getHandName([], cards)).toBe('Four of a Kind');
  });

  it('detects a full house', () => {
    const cards = [
      { rank: '8', suit: 'H' },
      { rank: '8', suit: 'D' },
      { rank: '8', suit: 'C' },
      { rank: 'K', suit: 'S' },
      { rank: 'K', suit: 'H' },
    ];
    const result = evaluateHandPublic(cards);
    expect(result.rankValue).toBe(6);
    expect(getHandName([], cards)).toBe('Full House');
  });

  it('detects a flush', () => {
    const cards = [
      { rank: '2', suit: 'H' },
      { rank: '4', suit: 'H' },
      { rank: '7', suit: 'H' },
      { rank: '9', suit: 'H' },
      { rank: 'J', suit: 'H' },
    ];
    const result = evaluateHandPublic(cards);
    expect(result.rankValue).toBe(5);
    expect(getHandName([], cards)).toBe('Flush');
  });

  it('detects a straight', () => {
    const cards = [
      { rank: '4', suit: 'H' },
      { rank: '5', suit: 'D' },
      { rank: '6', suit: 'C' },
      { rank: '7', suit: 'S' },
      { rank: '8', suit: 'H' },
    ];
    const result = evaluateHandPublic(cards);
    expect(result.rankValue).toBe(4);
    expect(result.kickers[0]).toBe(8);
    expect(getHandName([], cards)).toBe('Straight');
  });

  it('detects a low-ace straight', () => {
    const cards = [
      { rank: 'A', suit: 'S' },
      { rank: '2', suit: 'H' },
      { rank: '3', suit: 'D' },
      { rank: '4', suit: 'C' },
      { rank: '5', suit: 'H' },
    ];
    const result = evaluateHandPublic(cards);
    expect(result.rankValue).toBe(4);
    expect(result.kickers[0]).toBe(5);
    expect(getHandName([], cards)).toBe('Straight');
  });

  it('detects three of a kind', () => {
    const cards = [
      { rank: '9', suit: 'H' },
      { rank: '9', suit: 'D' },
      { rank: '9', suit: 'C' },
      { rank: 'K', suit: 'S' },
      { rank: '5', suit: 'H' },
    ];
    const result = evaluateHandPublic(cards);
    expect(result.rankValue).toBe(3);
    expect(getHandName([], cards)).toBe('Three of a Kind');
  });

  it('detects two pair', () => {
    const cards = [
      { rank: 'Q', suit: 'H' },
      { rank: 'Q', suit: 'D' },
      { rank: '4', suit: 'S' },
      { rank: '4', suit: 'C' },
      { rank: '9', suit: 'H' },
    ];
    const result = evaluateHandPublic(cards);
    expect(result.rankValue).toBe(2);
    expect(getHandName([], cards)).toBe('Two Pair');
  });

  it('detects one pair', () => {
    const cards = [
      { rank: 'J', suit: 'H' },
      { rank: 'J', suit: 'S' },
      { rank: '3', suit: 'C' },
      { rank: '9', suit: 'D' },
      { rank: 'K', suit: 'H' },
    ];
    const result = evaluateHandPublic(cards);
    expect(result.rankValue).toBe(1);
    expect(getHandName([], cards)).toBe('One Pair');
  });

  it('detects high card', () => {
    const cards = [
      { rank: 'A', suit: 'H' },
      { rank: 'K', suit: 'D' },
      { rank: '7', suit: 'C' },
      { rank: '5', suit: 'S' },
      { rank: '3', suit: 'H' },
    ];
    const result = evaluateHandPublic(cards);
    expect(result.rankValue).toBe(0);
    expect(getHandName([], cards)).toBe('High Card');
  });
});
