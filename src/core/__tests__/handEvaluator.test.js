import { evaluateHandPublic, getHandName } from '../handEvaluator';

describe('evaluateHandPublic', () => {
  const cases = [
    {
      name: 'Straight Flush',
      rankValue: 8,
      cards: [
        { rank: '9', suit: 'H' },
        { rank: '10', suit: 'H' },
        { rank: 'J', suit: 'H' },
        { rank: 'Q', suit: 'H' },
        { rank: 'K', suit: 'H' },
      ],
    },
    {
      name: 'Four of a Kind',
      rankValue: 7,
      cards: [
        { rank: 'A', suit: 'H' },
        { rank: 'A', suit: 'D' },
        { rank: 'A', suit: 'C' },
        { rank: 'A', suit: 'S' },
        { rank: '9', suit: 'H' },
      ],
    },
    {
      name: 'Full House',
      rankValue: 6,
      cards: [
        { rank: '8', suit: 'H' },
        { rank: '8', suit: 'D' },
        { rank: '8', suit: 'C' },
        { rank: 'K', suit: 'S' },
        { rank: 'K', suit: 'H' },
      ],
    },
    {
      name: 'Flush',
      rankValue: 5,
      cards: [
        { rank: '2', suit: 'H' },
        { rank: '4', suit: 'H' },
        { rank: '7', suit: 'H' },
        { rank: '9', suit: 'H' },
        { rank: 'J', suit: 'H' },
      ],
    },
    {
      name: 'Straight',
      rankValue: 4,
      cards: [
        { rank: '4', suit: 'H' },
        { rank: '5', suit: 'D' },
        { rank: '6', suit: 'C' },
        { rank: '7', suit: 'S' },
        { rank: '8', suit: 'H' },
      ],
      kickers: [8],
    },
    {
      name: 'Three of a Kind',
      rankValue: 3,
      cards: [
        { rank: '9', suit: 'H' },
        { rank: '9', suit: 'D' },
        { rank: '9', suit: 'C' },
        { rank: 'K', suit: 'S' },
        { rank: '5', suit: 'H' },
      ],
    },
    {
      name: 'Two Pair',
      rankValue: 2,
      cards: [
        { rank: 'Q', suit: 'H' },
        { rank: 'Q', suit: 'D' },
        { rank: '4', suit: 'S' },
        { rank: '4', suit: 'C' },
        { rank: '9', suit: 'H' },
      ],
    },
    {
      name: 'One Pair',
      rankValue: 1,
      cards: [
        { rank: 'J', suit: 'H' },
        { rank: 'J', suit: 'S' },
        { rank: '3', suit: 'C' },
        { rank: '9', suit: 'D' },
        { rank: 'K', suit: 'H' },
      ],
    },
    {
      name: 'High Card',
      rankValue: 0,
      cards: [
        { rank: 'A', suit: 'H' },
        { rank: 'K', suit: 'D' },
        { rank: '7', suit: 'C' },
        { rank: '5', suit: 'S' },
        { rank: '3', suit: 'H' },
      ],
    },
  ];

  test.each(cases)('detects %s', ({ name, rankValue, cards, kickers }) => {
    const result = evaluateHandPublic(cards);
    expect(result.rankValue).toBe(rankValue);
    if (kickers) {
      expect(result.kickers).toEqual(kickers);
    }
    expect(getHandName([], cards)).toBe(name);
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
});

