// Benchmark duplicate heads-up: setiap deal dimainkan dua kali dengan kursi ditukar
// agar keberuntungan kartu saling meniadakan. Jalankan: npm run bench
// Variabel: DUEL="hard:normal,hard:easy", DEALS=300, SEED=1000
import { test } from "vitest";
import Game from "../src/core/models";
import { AIBot } from "../src/core/ai";

// PRNG deterministik untuk dek (mulberry32)
const prng = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

function playDeal(levels, seed, botRandom) {
  const game = new Game(
    levels.map((l, i) => ({ name: `${l}${i}`, isBot: true, level: l })),
  );
  const real = Math.random;
  Math.random = prng(seed);
  let s;
  try {
    // dealer = 1 -> tangan berikutnya dealer 0
    s = game.start({
      players: levels.map((l, i) => ({
        name: `${l}${i}`,
        isBot: true,
        level: l,
        chips: 1000,
      })),
      dealerIndex: 1,
    });
  } finally {
    Math.random = real;
  }
  while (!s.endgame) {
    const p = s.players[s.currentPlayer];
    let c;
    if (p.level === "maniac") {
      const acts = game.actions(s);
      const b = acts.find((a) => a.type === "bet");
      c = b
        ? { action: "bet", amount: b.max }
        : { action: acts.find((a) => a.type === "call") ? "call" : "check" };
    } else
      new AIBot(game, s, { push: (x) => (c = x) }, p.level, {
        random: botRandom,
      }).run();
    s = game.applyAction(s, c.action, c.amount);
  }
  return s.players.map((p) => p.chips - 1000);
}

const matchups = (
  process.env.DUEL || "hard:normal,hard:easy,normal:easy,hard:maniac"
)
  .split(",")
  .map((m) => m.split(":"));
const DEALS = Number(process.env.DEALS || 300);

test("duel", { timeout: 3600000 }, () => {
  const botRandom = prng(Number(process.env.SEED || 1000) * 7 + 1);
  const lines = [];
  for (const [a, b] of matchups) {
    let net = 0;
    const per = [];
    for (let d = 0; d < DEALS; d++) {
      const seed = Number(process.env.SEED || 1000) + d;
      const r1 = playDeal([a, b], seed, botRandom)[0];
      const r2 = playDeal([b, a], seed, botRandom)[1];
      net += r1 + r2;
      per.push(r1 + r2);
    }
    const mean = net / (2 * DEALS);
    const sd = Math.sqrt(
      per.reduce((x, v) => x + (v / 2 - mean) ** 2, 0) / per.length,
    );
    lines.push(
      `${a} vs ${b}: ${mean.toFixed(1)} chip/tangan (±${((1.96 * sd) / Math.sqrt(DEALS)).toFixed(1)} CI95) = ${((mean / 20) * 100).toFixed(0)} bb/100`,
    );
  }
  console.log(lines.join("\n"));
});
