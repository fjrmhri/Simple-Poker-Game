import React from "react";
import { motion } from "framer-motion";

export default function GameHud({
  stats,
  missions,
  leaderboard,
  hints,
  dailyBonus,
  onClaimBonus,
  chatMessages,
  onSendReaction,
}) {
  const winRate = stats.handsPlayed
    ? Math.round((stats.handsWon / stats.handsPlayed) * 100)
    : 0;

  const reactionEmojis = ["🔥", "😎", "😬", "🤝", "🃏", "🚀"];

  return (
    <aside className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/60">Player intel</p>
            <h2 className="text-2xl font-bold">Stats</h2>
          </div>
          <button
            onClick={onClaimBonus}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              dailyBonus.available ? "bg-amber-400 text-black" : "bg-white/10 text-white/50"
            }`}
            disabled={!dailyBonus.available}
          >
            {dailyBonus.available ? "Claim daily 250" : "Bonus claimed"}
          </button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <StatTile label="Hands played" value={stats.handsPlayed} />
          <StatTile label="Hands won" value={stats.handsWon} />
          <StatTile label="Win rate" value={`${winRate}%`} />
          <StatTile label="Biggest pot" value={stats.biggestPot} />
          <StatTile label="Best hand" value={stats.bestHand} className="col-span-2" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-xl"
      >
        <h3 className="text-lg font-semibold">Daily missions</h3>
        <p className="text-xs text-white/60">Complete goals to earn extra bragging rights.</p>
        <div className="mt-4 space-y-3">
          {missions.map((mission) => (
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-xl"
      >
        <h3 className="text-lg font-semibold">Leaderboard</h3>
        <p className="text-xs text-white/60">Local high rollers</p>
        <div className="mt-3 space-y-2">
          {leaderboard.length === 0 && (
            <p className="text-sm text-white/50">Play a hand to enter the board.</p>
          )}
          {leaderboard.map((entry, index) => (
            <div
              key={entry.name}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-3 py-2"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-black text-white/40">#{index + 1}</span>
                <div className="flex items-center gap-2">
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
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 p-4 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/60">Smart hint</p>
            <h3 className="text-xl font-semibold">{hints.strength}</h3>
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            {hints.recommendation}
          </span>
        </div>
        <p className="mt-3 text-sm text-white/70">{hints.tip}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Table chat</h3>
          <span className="text-xs text-white/60">Reactions</span>
        </div>
        <div className="mt-3 h-36 overflow-auto rounded-2xl border border-white/5 bg-black/30 p-3 text-sm">
          {chatMessages.map((msg) => (
            <p key={msg.id} className="mb-1 text-white/80">
              <span className="font-semibold text-white">{msg.author}:</span> {msg.message}
            </p>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {reactionEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onSendReaction(emoji)}
              className="rounded-full border border-white/10 bg-black/40 px-2 py-1 text-lg shadow hover:bg-white/10"
            >
              {emoji}
            </button>
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
