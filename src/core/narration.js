// src/core/narration.js
import { getHandName } from "./handEvaluator";

const describeCards = (cards = []) =>
  cards
    .filter(Boolean)
    .map((card) => `${card.rank}${card.suit}`)
    .join(" ");

const actionTemplates = {
  fold: [
    (name) => `${name} folds and steps aside.`,
    (name) => `${name} lets it go without a fight.`,
  ],
  check: [
    (name) => `${name} taps the table to check.`,
    (name) => `${name} checks and keeps the pace slow.`,
  ],
  call: [
    (name, e) => `${name} calls ${e.amount} to stay in the pot.`,
    (name, e) => `${name} makes the call for ${e.amount}.`,
  ],
  bet: [
    (name, e) => `${name} fires a bet of ${e.amount}.`,
    (name, e) => `${name} leads out for ${e.amount}.`,
  ],
  raise: [
    (name, e) => `${name} raises to ${e.toAmount}.`,
    (name, e) => `${name} bumps it up to ${e.toAmount}.`,
  ],
  allin: [
    (name) => `${name} moves all-in for the rest of their stack!`,
    (name) => `${name} shoves – every last chip is in play.`,
  ],
};

const botReplies = {
  aggressive: [
    "Pressure's on now.",
    "Let's see if you can handle the heat.",
    "Can't let this one go uncontested.",
  ],
  passive: [
    "Sticking around for a peek.",
    "Keeping it small for now.",
    "Just checking the vibes.",
  ],
  fold: [
    "Not my fight this time.",
    "You can have this one.",
    "No shame in waiting for a better spot.",
  ],
};

const pick = (options, random) =>
  options[Math.floor(random() * options.length)];

function streetMessage(next) {
  const { round, community } = next;
  if (round === "Flop") {
    return `Flop revealed: ${describeCards(community.slice(0, 3))}.`;
  }
  if (round === "Turn")
    return `Turn card is the ${describeCards([community[3]])}.`;
  if (round === "River")
    return `River lands: ${describeCards([community[4]])}.`;
  if (
    round === "Showdown" &&
    next.players.filter((p) => !p.folded).length > 1
  ) {
    return "Cards up! Time to see who takes it.";
  }
  return null;
}

/**
 * Ubah transisi state permainan menjadi pesan chat dan ringkasan tangan.
 * Fungsi murni: tidak menyentuh React state, sehingga bisa dipanggil dari
 * event handler dan diuji terpisah.
 * @param {object|null} prev - State sebelumnya (null = permainan baru).
 * @param {object} next - State sesudahnya.
 * @param {{heroIndex?: number, random?: () => number}} [options]
 * @returns {{messages: Array, handResult: object|null}}
 */
export function describeTransition(prev, next, options = {}) {
  const { heroIndex = 0, random = Math.random } = options;
  const messages = [];
  const idBase = `h${next.handNumber}-a${next.actionSeq ?? 0}`;
  const push = (author, message, type, extra = {}) =>
    messages.push({
      id: `${idBase}-${messages.length}`,
      author,
      message,
      type,
      ...extra,
    });

  const newHand = !prev || prev.handNumber !== next.handNumber;
  if (newHand) {
    push(
      "Dealer",
      `Hand ${next.handNumber} begins. Good luck at the felt!`,
      "dealer",
    );
  }

  const event = next.lastEvent;
  const acted =
    !newHand && event && (next.actionSeq ?? 0) !== (prev.actionSeq ?? 0);
  if (acted) {
    const actor = next.players[event.player];
    const key = event.allIn ? "allin" : event.action;
    const templates = actionTemplates[key];
    if (templates)
      push("Dealer", pick(templates, random)(actor.name, event), "dealer");

    if (event.player !== heroIndex && actor.isBot) {
      const category =
        event.action === "fold"
          ? "fold"
          : event.action === "check" || event.action === "call"
            ? "passive"
            : "aggressive";
      // Bot tidak selalu berkomentar agar chat tidak terlalu ramai
      if (random() > 0.35)
        push(actor.name, pick(botReplies[category], random), "bot");
    }
  }

  if (newHand || prev.round !== next.round) {
    const line = streetMessage(next);
    if (line && !(newHand && next.round === "Preflop")) {
      push("Dealer", line, "dealer");
    }
  }

  let handResult = null;
  if (next.endgame && (newHand || !prev.endgame) && next.winners.length) {
    const hero = next.players[heroIndex];
    const heroWon = next.winners.includes(heroIndex);
    const heroHand = getHandName(hero?.hand || [], next.community || []);
    const winnerNames = next.winners.map((i) => next.players[i].name);
    const pot = next.lastPot ?? 0;
    handResult = {
      handNumber: next.handNumber,
      pot,
      heroWon,
      heroHand,
      heroChips: hero?.chips ?? 0,
      winners: winnerNames,
      community: next.community,
      sawFlop: next.community.length >= 3,
    };
    if (heroWon) {
      push(
        "Dealer",
        `Pot ${pot} shipped your way with ${heroHand || "solid play"}.`,
        "dealer",
        { summary: true },
      );
    } else {
      push(
        winnerNames[0] || "Dealer",
        `${winnerNames.join(", ")} claim the ${pot} pot.`,
        "bot",
        { summary: true },
      );
    }
  }

  return { messages, handResult };
}
