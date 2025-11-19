import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PokerTable from "./components/PokerTable";
import ActionBar from "./components/ActionBar";
import WinnerModal from "./components/WinnerModal";
import GameOverModal from "./components/GameOverModal";
import StartScreen from "./components/StartScreen";
import MobileWarning from "./components/MobileWarning";
import GameHud from "./components/GameHud";
import usePokerEngine from "./hooks/usePokerEngine";
import usePersistentState from "./hooks/usePersistentState";
import useSound from "./hooks/useSound";
import useTone from "./hooks/useTone";
import { getHandName } from "./core/handEvaluator";

const BOT_PROFILES = [
  {
    name: "Lucy",
    isBot: true,
    level: "normal",
    avatar: "/assets/others/avatar1.jpg",
  },
  {
    name: "Carl",
    isBot: true,
    level: "hard",
    avatar: "/assets/others/avatar3.jpg",
  },
];

const createMissions = () => [
  { id: "win-3", label: "Win three hands", goal: 3, progress: 0 },
  { id: "see-flop", label: "See five flops", goal: 5, progress: 0 },
  { id: "big-pot", label: "Win a 250+ pot", goal: 1, progress: 0 },
];

const initialStats = {
  handsPlayed: 0,
  handsWon: 0,
  biggestPot: 0,
  bestHand: "High Card",
};

const DAILY_BONUS_KEY = "pokereact.dailyBonus";
const LEADERBOARD_KEY = "pokereact.leaderboard";

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(initialStats);
  const [missions, setMissions] = useState(createMissions);
  const [dailyBonusState, setDailyBonusState] = usePersistentState(
    DAILY_BONUS_KEY,
    { lastClaimed: null }
  );
  const [leaderboard, setLeaderboard] = usePersistentState(LEADERBOARD_KEY, []);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [chatMessages, setChatMessages] = useState(() => [
    { id: 0, author: "Dealer", message: "Welcome to the Neon Hold'em table!" },
  ]);
  const [handHistory, setHandHistory] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkSize = () => setIsMobile(window.innerWidth < 768 || window.innerHeight < 600);
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  const playersConfig = useMemo(() => {
    const hero = profile || {
      name: "You",
      isBot: false,
      avatar: "/assets/others/avatar2.jpg",
      favoriteColor: "#facc15",
    };
    return [hero, ...BOT_PROFILES];
  }, [profile]);

  const {
    state,
    pot,
    status,
    winners,
    availableActions,
    handleAction,
    startNewHand,
    resetGame,
    awardChips,
  } = usePokerEngine(playersConfig);

  const player = state.players?.[0];

  const playWinnerSound = useSound("/sounds/minecraft_level_up.mp3");
  const playCardFlip = useTone({ frequency: 520, duration: 0.18, type: "triangle", volume: 0.15 });
  const playChipStack = useTone({ frequency: 240, duration: 0.25, type: "sawtooth", volume: 0.12 });

  useEffect(() => {
    if (!soundEnabled || winners.length === 0) return;
    if (status !== "playing") {
      playWinnerSound();
    }
  }, [winners, status, playWinnerSound, soundEnabled]);

  const prevCommunityRef = useRef(0);
  useEffect(() => {
    const communityLength = state.community?.length ?? 0;
    if (!soundEnabled) {
      prevCommunityRef.current = communityLength;
      return;
    }
    if (communityLength > prevCommunityRef.current) {
      playCardFlip();
      prevCommunityRef.current = communityLength;
    }
  }, [state.community, soundEnabled, playCardFlip]);

  const executeAction = useCallback(
    (action, amount) => {
      if (soundEnabled && ["call", "bet", "raise"].includes(action)) {
        playChipStack();
      }
      handleAction(action, amount);
    },
    [handleAction, playChipStack, soundEnabled]
  );

  const toCall = useMemo(() => {
    if (!state.players?.length) return 0;
    const highest = Math.max(...state.players.map((p) => p.bet));
    return Math.max(0, highest - (player?.bet ?? 0));
  }, [state.players, player?.bet]);

  const handStrength = useMemo(() => {
    if (!player?.hand?.length) return "";
    return getHandName(player.hand, state.community || []);
  }, [player?.hand, state.community]);

  const hints = useMemo(() => {
    const base = {
      strength: handStrength || "Waiting for cards",
      recommendation: "Stay patient",
      tip: "Let the bots reveal their intentions before committing.",
    };
    if (!availableActions?.length || state.currentPlayer !== 0) {
      return base;
    }

    const strongHands = [
      "Flush",
      "Full House",
      "Four of a Kind",
      "Straight Flush",
    ];
    const mediumHands = ["Two Pair", "Three of a Kind", "Straight"];

    if (strongHands.includes(handStrength)) {
      return {
        strength: handStrength,
        recommendation: "Apply pressure",
        tip: "Strong made hands thrive with larger bets. Consider raising to deny odds.",
      };
    }
    if (mediumHands.includes(handStrength)) {
      return {
        strength: handStrength,
        recommendation: toCall === 0 ? "Value bet" : "Controlled call",
        tip: toCall === 0
          ? "Take the lead with a confident bet to extract value."
          : "The price is affordable—calling keeps your showdown value intact.",
      };
    }
    if (handStrength) {
      return {
        strength: handStrength,
        recommendation: toCall === 0 ? "Check" : "Fold carefully",
        tip: toCall === 0
          ? "Free cards can improve marginal holdings."
          : "Save chips for a better spot unless pot odds are compelling.",
      };
    }
    return base;
  }, [availableActions, handStrength, state.currentPlayer, toCall]);

  const leaderboardLabel = profile?.name || "You";

  const showdownSignatureRef = useRef("initial");
  useEffect(() => {
    if (!winners.length || status === "playing" || !state.players?.length) return;
    const signature = `${state.community?.map((c) => `${c.rank}${c.suit}`).join("")}-${state.players
      .map((p) => p.hand?.map((card) => `${card.rank}${card.suit}`).join(""))
      .join("|")}`;
    if (showdownSignatureRef.current === signature) return;
    showdownSignatureRef.current = signature;

    const heroWon = winners.includes(0);
    const heroHand = getHandName(player.hand || [], state.community || []);

    setStats((prev) => ({
      handsPlayed: prev.handsPlayed + 1,
      handsWon: prev.handsWon + (heroWon ? 1 : 0),
      biggestPot: Math.max(prev.biggestPot, pot),
      bestHand: heroWon ? heroHand || prev.bestHand : prev.bestHand,
    }));

    setHandHistory((prev) => [
      {
        id: signature,
        pot,
        winners: winners.map((idx) => state.players[idx].name),
        heroHand,
        community: state.community,
      },
      ...prev,
    ].slice(0, 5));

    setMissions((prev) =>
      prev.map((mission) => {
        if (mission.id === "win-3" && heroWon) {
          return { ...mission, progress: Math.min(mission.goal, mission.progress + 1) };
        }
        if (mission.id === "see-flop" && state.community.length >= 3) {
          return { ...mission, progress: Math.min(mission.goal, mission.progress + 1) };
        }
        if (mission.id === "big-pot" && heroWon && pot >= 250) {
          return { ...mission, progress: Math.min(mission.goal, mission.progress + 1) };
        }
        return mission;
      })
    );

    setLeaderboard((prev) => {
      const bestScore = player?.chips ?? 0;
      const filtered = prev.filter((entry) => entry.name !== leaderboardLabel);
      return [
        ...filtered,
        { name: leaderboardLabel, score: bestScore, avatar: profile?.avatar || "/assets/others/avatar2.jpg" },
      ]
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
    });

    setChatMessages((prev) =>
      [
        ...prev.slice(-7),
        {
          id: signature,
          author: heroWon ? "Dealer" : "Lucy",
          message: heroWon ? "Nice scoop! That pot is yours." : "Ouch, better luck on the next deal.",
        },
      ]
    );
  }, [
    winners,
    status,
    state.players,
    state.community,
    pot,
    leaderboardLabel,
    player?.hand,
    player?.chips,
    profile?.avatar,
    setLeaderboard,
  ]);

  const now = new Date();
  const lastClaimed = dailyBonusState.lastClaimed ? new Date(dailyBonusState.lastClaimed) : null;
  const sameDay =
    lastClaimed &&
    lastClaimed.getFullYear() === now.getFullYear() &&
    lastClaimed.getMonth() === now.getMonth() &&
    lastClaimed.getDate() === now.getDate();
  const bonusAvailable = !sameDay;

  const handleClaimBonus = () => {
    if (!bonusAvailable) return;
    awardChips(0, 250);
    setDailyBonusState({ lastClaimed: new Date().toISOString() });
    setChatMessages((prev) => [
      ...prev.slice(-7),
      { id: Date.now(), author: "Dealer", message: "Daily bonus credited!" },
    ]);
  };

  const handleStartGame = (config) => {
    setProfile({
      name: config.name,
      isBot: false,
      avatar: config.avatar,
      favoriteColor: config.color,
    });
    setGameStarted(true);
  };

  const handleExit = () => {
    setGameStarted(false);
    setProfile(null);
    setStats(initialStats);
    setMissions(createMissions());
    setHandHistory([]);
    resetGame();
  };

  const handleRestart = () => {
    resetGame();
    setStats(initialStats);
    setMissions(createMissions());
    setHandHistory([]);
  };

  const playerOutOfChips = player?.chips <= 0;
  const botsBusted = state.players?.slice(1).every((p) => p.chips <= 0);
  const playerWonGame = player?.chips > 0 && botsBusted;

  const sendReaction = (emoji) => {
    setChatMessages((prev) => [
      ...prev.slice(-7),
      { id: Date.now(), author: profile?.name || "You", message: emoji },
    ]);
  };

  if (isMobile) {
    return <MobileWarning />;
  }

  if (!gameStarted) {
    return <StartScreen onStartGame={handleStartGame} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 px-6 py-4 shadow-xl">
          <div>
            <p className="text-sm uppercase tracking-widest text-white/60">Neon Hold'em</p>
            <h1 className="text-3xl font-black text-yellow-300">PokeReact</h1>
            <p className="text-xs text-white/60">Status: <span className="text-white font-semibold">{status}</span></p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="rounded-full border border-white/10 bg-black/40 px-4 py-2">
              <span className="text-white/70">Stack</span>
              <p className="text-xl font-bold text-green-300">{player?.chips ?? 0}</p>
            </div>
            <button
              onClick={() => setSoundEnabled((prev) => !prev)}
              className={`rounded-full px-4 py-2 text-sm font-semibold shadow ${
                soundEnabled ? "bg-emerald-500/80" : "bg-red-500/60"
              }`}
            >
              {soundEnabled ? "Sound on" : "Sound muted"}
            </button>
            <button
              onClick={handleExit}
              className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20"
            >
              Leave table
            </button>
          </div>
        </header>

        <main className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(320px,1fr)]">
          <section className="space-y-6">
            <PokerTable
              state={state}
              pot={pot}
              winners={winners}
              accentColor={profile?.favoriteColor}
            />

            <ActionBar actions={availableActions} onAction={executeAction} hints={hints} />

            {handHistory.length > 0 && (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Recent hands</h3>
                  <span className="text-xs text-white/60">Last {handHistory.length} rounds</span>
                </div>
                <div className="mt-4 space-y-3">
                  {handHistory.map((hand) => (
                    <div key={hand.id} className="rounded-2xl border border-white/5 bg-black/30 p-3 text-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-white/90">Pot {hand.pot}</span>
                        <span className="text-xs text-white/60">{hand.heroHand}</span>
                      </div>
                      <p className="text-xs text-white/60">Winner: {hand.winners.join(", ")}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <GameHud
            stats={stats}
            missions={missions}
            leaderboard={leaderboard}
            hints={hints}
            dailyBonus={{ available: bonusAvailable, lastClaimed }}
            onClaimBonus={handleClaimBonus}
            chatMessages={chatMessages}
            onSendReaction={sendReaction}
          />
        </main>
      </div>

      {status !== "playing" && winners.length > 0 && !playerOutOfChips && !playerWonGame && (
        <WinnerModal
          winners={winners.map((idx) => state.players[idx].name)}
          onRestart={startNewHand}
        />
      )}

      {(playerOutOfChips || playerWonGame) && (
        <GameOverModal
          isWin={playerWonGame}
          playerChips={player?.chips || 0}
          onRestart={handleRestart}
          onExit={handleExit}
        />
      )}
    </div>
  );
}
