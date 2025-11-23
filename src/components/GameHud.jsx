import React from "react";
import { motion } from "framer-motion";

export default function GameHud({
  stats,
  missions,
  leaderboard,
  dailyBonus,
  onClaimBonus,
  chatMessages,
  onSendReaction,
  variant = "right",
}) {
  const safeStats = stats || { handsPlayed: 0, handsWon: 0, biggestPot: 0, bestHand: "--" };
  const safeMissions = missions || [];
  const winRate = safeStats.handsPlayed
    ? Math.round((safeStats.handsWon / safeStats.handsPlayed) * 100)
    : 0;

  const reactionEmojis = ["🔥", "😎", "😬", "🤝", "🃏", "🚀"];

  if (variant === "left") {
    return (
      <aside className="space-y-4 self-start">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-white/60">Table tools</p>
              <h3 className="text-xl font-semibold">Table chat</h3>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] text-white/70">Quick reactions</span>
          </div>

          <div className="mt-3 space-y-3 text-sm">
            <div className="h-52 overflow-auto rounded-2xl border border-white/5 bg-black/40 p-3">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-2 rounded-xl px-3 py-2 ${
                    msg.type === "dealer"
                      ? "border border-emerald-400/30 bg-emerald-500/10"
                      : "border border-white/10 bg-white/5"
                  }`}
                >
                  <p
                    className={`text-xs font-semibold ${
                      msg.type === "dealer" ? "text-emerald-200" : "text-white"
                    }`}
                  >
                    {msg.author}
                  </p>
                  <p className="text-white/80">{msg.message}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {reactionEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => onSendReaction(emoji)}
                  className="rounded-full border border-white/10 bg-black/50 px-2 py-1 text-lg shadow hover:bg-white/10"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-white/60">Table tools</p>
              <h3 className="text-xl font-semibold">Leaderboard</h3>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] text-white/70">Live standings</span>
          </div>
          <div className="mt-3 space-y-2 text-sm">
            {leaderboard.length === 0 && (
              <p className="text-white/50">Play a hand to enter the board.</p>
            )}
            {leaderboard.map((entry, index) => (
              <div
                key={entry.name}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-white/40">#{index + 1}</span>
                  <img
                    src={entry.avatar}
                    alt={entry.name}
                    className="h-8 w-8 rounded-full border border-white/20 object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold">{entry.name}</p>
                    <p className="text-xs text-white/50">{entry.score} chips</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </aside>
    );
  }

  return (
    <aside className="space-y-4 self-start">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-xl"
      >
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/60">Player intel</p>
            <h2 className="text-2xl font-bold">Stats</h2>
          </div>
          {onClaimBonus && dailyBonus && (
            <button
              onClick={onClaimBonus}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                dailyBonus.available ? "bg-amber-400 text-black" : "bg-white/10 text-white/50"
              }`}
              disabled={!dailyBonus.available}
            >
              {dailyBonus.available ? "Claim daily 250" : "Bonus claimed"}
            </button>
          )}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <StatTile label="Hands played" value={safeStats.handsPlayed} />
          <StatTile label="Hands won" value={safeStats.handsWon} />
          <StatTile label="Win rate" value={`${winRate}%`} />
          <StatTile label="Biggest pot" value={safeStats.biggestPot} />
          <StatTile label="Best hand" value={safeStats.bestHand} className="col-span-2" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-xl"
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold">Daily missions</h3>
          <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] text-white/70">Track progress</span>
        </div>
        <div className="mt-3 space-y-3">
          {safeMissions.map((mission) => (
            <div key={mission.id}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">{mission.label}</span>
                <span className="text-white/60">
                  {mission.progress}/{mission.goal}
                </span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-300 to-yellow-400"
                  style={{ width: `${(mission.progress / mission.goal) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </aside>
  );
}

function StatTile({ label, value, className = "" }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-black/30 p-3 text-xs ${className}`}>
      <p className="text-white/60">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}
