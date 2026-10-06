import Game from "../models";
import { describeTransition } from "../narration";

const always = (value) => () => value;
const players = [
  { name: "Hero" },
  { name: "Lucy", isBot: true },
  { name: "Carl", isBot: true },
];

describe("describeTransition", () => {
  it("mengumumkan tangan baru saat permainan dimulai", () => {
    const game = new Game(players);
    const { messages, handResult } = describeTransition(null, game.start());
    expect(messages.map((m) => m.message)).toEqual([
      "Hand 1 begins. Good luck at the felt!",
    ]);
    expect(handResult).toBeNull();
  });

  it("mencatat aksi yang menutup street sebelum lastAction direset", () => {
    const game = new Game(players);
    let state = game.start(); // dealer 0, SB 1, BB 2, UTG 0
    state = game.applyAction(state, "call");
    state = game.applyAction(state, "call");
    const before = state;
    state = game.applyAction(state, "check"); // BB check -> Flop
    expect(state.players[2].lastAction).toBeNull();

    const { messages } = describeTransition(before, state, {
      random: always(0),
    });
    const text = messages.map((m) => m.message);
    expect(text[0]).toBe("Carl taps the table to check.");
    expect(text.at(-1)).toMatch(/^Flop revealed: /);
  });

  it("raise memakai total taruhan dan bot bisa berkomentar", () => {
    const game = new Game(players);
    const start = game.start();
    // Hero (UTG) raise 60 di atas call 20 -> total 80
    const afterHero = game.applyAction(start, "bet", 60);
    const lucy = game.applyAction(afterHero, "bet", 60); // call 70 + 60 -> 140

    const hero = describeTransition(start, afterHero, { random: always(0) });
    expect(hero.messages.map((m) => m.message)).toEqual(["Hero raises to 80."]);

    const bot = describeTransition(afterHero, lucy, { random: always(0.99) });
    expect(bot.messages.map((m) => m.author)).toEqual(["Dealer", "Lucy"]);
    expect(bot.messages[0].message).toBe("Lucy bumps it up to 140.");
  });

  it("menghasilkan ringkasan tangan sekali saat tangan selesai", () => {
    const game = new Game(players);
    let state = game.start();
    state = game.applyAction(state, "fold");
    const before = state;
    state = game.applyAction(state, "fold"); // Carl (BB) menang tanpa showdown

    const result = describeTransition(before, state, { random: always(0.5) });
    expect(result.handResult).toMatchObject({
      pot: 30,
      heroWon: false,
      winners: ["Carl"],
      sawFlop: false,
    });
    expect(result.messages.at(-1).message).toBe("Carl claim the 30 pot.");
    // Tidak ada "Cards up!" karena tidak ada showdown
    expect(result.messages.some((m) => m.message.startsWith("Cards up"))).toBe(
      false,
    );

    // Transisi berikutnya (mis. bonus) tidak mengulang ringkasan
    expect(describeTransition(state, { ...state }).handResult).toBeNull();
  });

  it("id pesan unik antar transisi", () => {
    const game = new Game(players);
    let prev = game.start();
    const ids = new Set();
    for (const action of ["call", "call", "check", "check", "check", "check"]) {
      const next = game.applyAction(prev, action);
      describeTransition(prev, next).messages.forEach((m) => {
        expect(ids.has(m.id)).toBe(false);
        ids.add(m.id);
      });
      prev = next;
    }
  });
});
