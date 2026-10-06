import Game from "../models";

const threePlayers = () =>
  new Game([{ name: "A" }, { name: "B" }, { name: "C" }]);

const betOf = (game, state) =>
  game.actions(state).find((action) => action.type === "bet");

describe("heads-up", () => {
  it("dealer memasang small blind dan beraksi pertama sebelum flop", () => {
    const game = new Game([{ name: "A" }, { name: "B" }]);
    const state = game.start();
    expect(state.dealerIndex).toBe(0);
    expect(state.players[0].bet).toBe(10);
    expect(state.players[1].bet).toBe(20);
    expect(state.currentPlayer).toBe(0);
  });

  it("big blind beraksi pertama setelah flop", () => {
    const game = new Game([{ name: "A" }, { name: "B" }]);
    let state = game.start();
    state = game.applyAction(state, "call");
    expect(state.round).toBe("Preflop");
    expect(state.currentPlayer).toBe(1); // opsi big blind
    state = game.applyAction(state, "check");
    expect(state.round).toBe("Flop");
    expect(state.currentPlayer).toBe(1);
  });

  it("berlaku saat meja tiga kursi tersisa dua pemain", () => {
    const game = threePlayers();
    const prev = game.start();
    prev.players[1].chips = 0;
    prev.dealerIndex = 0;
    const state = game.start(prev);
    expect(state.dealerIndex).toBe(2);
    expect(state.players[2].bet).toBe(10);
    expect(state.players[0].bet).toBe(20);
    expect(state.currentPlayer).toBe(2);
  });
});

describe("urutan aksi setelah flop (3 pemain)", () => {
  it("dimulai dari pemain aktif pertama setelah dealer", () => {
    const game = threePlayers();
    let state = game.start(); // dealer 0, SB 1, BB 2, UTG 0
    expect(state.currentPlayer).toBe(0);
    state = game.applyAction(state, "call");
    state = game.applyAction(state, "call");
    state = game.applyAction(state, "check");
    expect(state.round).toBe("Flop");
    expect(state.currentPlayer).toBe(1);
  });

  it("melewati small blind yang sudah fold", () => {
    const game = threePlayers();
    let state = game.start();
    state = game.applyAction(state, "call");
    state = game.applyAction(state, "fold");
    state = game.applyAction(state, "check");
    expect(state.round).toBe("Flop");
    expect(state.currentPlayer).toBe(2);
  });
});

describe("minimum raise", () => {
  it("bet pembuka minimal sebesar big blind", () => {
    const game = threePlayers();
    let state = game.start();
    ["call", "call", "check"].forEach((a) => {
      state = game.applyAction(state, a);
    });
    expect(betOf(game, state).min).toBe(20);
  });

  it("raise berikutnya minimal sebesar raise sebelumnya", () => {
    const game = threePlayers();
    let state = game.start();
    expect(betOf(game, state).min).toBe(20);

    state = game.applyAction(state, "bet", 60); // raise ke 80
    expect(state.players[0].bet).toBe(80);
    expect(betOf(game, state).min).toBe(60);
  });

  it("raise di bawah minimum dinaikkan ke minimum", () => {
    const game = threePlayers();
    let state = game.start();
    state = game.applyAction(state, "bet", 5);
    expect(state.players[0].bet).toBe(40); // call 20 + raise minimal 20
    state = game.applyAction(state, "bet", 0);
    expect(state.players[1].bet).toBe(60);
  });

  it("stack di bawah raise minimal hanya bisa all-in, tanpa menaikkan minimum", () => {
    const game = threePlayers();
    const prev = game.start();
    prev.players[1].chips = 100;
    prev.dealerIndex = 2; // dealer 0, SB 1, BB 2, UTG 0
    let state = game.start(prev);

    state = game.applyAction(state, "bet", 60); // A raise ke 80
    const bet = betOf(game, state); // B: stack 90 setelah SB, call 70
    expect(bet).toEqual({ type: "bet", min: 20, max: 20 });

    state = game.applyAction(state, "bet", 20); // all-in ke 100, raise 20 < 60
    expect(state.players[1].chips).toBe(0);
    expect(state.minRaise).toBe(60);
  });

  it("ukuran raise direset ke big blind di setiap street", () => {
    const game = threePlayers();
    let state = game.start();
    state = game.applyAction(state, "bet", 100);
    state = game.applyAction(state, "call");
    state = game.applyAction(state, "call");
    expect(state.round).toBe("Flop");
    expect(state.minRaise).toBe(20);
    expect(betOf(game, state).min).toBe(20);
  });
});
