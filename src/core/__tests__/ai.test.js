import Game from "../models";
import { unknownCards } from "../ai";

const key = (c) => `${c.rank}${c.suit}`;

describe("unknownCards", () => {
  it("memasukkan kartu lawan dan mengecualikan kartu sendiri serta komunitas", () => {
    const game = new Game([{ name: "A" }, { name: "B" }, { name: "C" }]);
    let state = game.start();
    state = game.applyAction(state, "call");
    state = game.applyAction(state, "call");
    state = game.applyAction(state, "check"); // flop
    const pool = unknownCards(state, 0).map(key);

    expect(pool).toHaveLength(52 - 2 - 3);
    state.players[1].hand.concat(state.players[2].hand).forEach((c) => {
      expect(pool).toContain(key(c));
    });
    state.players[0].hand.concat(state.community).forEach((c) => {
      expect(pool).not.toContain(key(c));
    });
  });
});
