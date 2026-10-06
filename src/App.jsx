import React, { useCallback, useMemo, useRef, useState } from "react";
import PokerTable from "./components/PokerTable";
import ActionBar from "./components/ActionBar";
import WinnerModal from "./components/WinnerModal";
import GameOverModal from "./components/GameOverModal";
import StartScreen from "./components/StartScreen";
import GameHud from "./components/GameHud";
import usePokerEngine from "./hooks/usePokerEngine";
import usePersistentState from "./hooks/usePersistentState";
import useSound from "./hooks/useSound";
import useTone from "./hooks/useTone";
import { useCardFlipSound, useHandEndSound } from "./hooks/useGameSounds";
import { getHandName } from "./core/handEvaluator";
import { getGameOverState } from "./core/gameOver";
import { appendLimited, upsertBestScore } from "./core/hud";
import { describeTransition } from "./core/narration";
import { resultDelayMs } from "./core/reveal";
import { finalHandOdds, revealedWinChance, winChance } from "./core/odds";
import useRevealPacing from "./hooks/useRevealPacing";

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

const WELCOME_MESSAGES = [
  {
    id: "welcome-0",
    author: "Dealer",
    message: "Welcome to the Neon Hold'em table!",
    type: "dealer",
  },
  {
    id: "welcome-1",
    author: "Lucy",
    message: "Bots are warmed up. Let's see your skills!",
    type: "bot",
  },
];

const bumpMission = (mission) => ({
  ...mission,
  progress: Math.min(mission.goal, mission.progress + 1),
});

const DAILY_BONUS_KEY = "pokereact.dailyBonus";
const LEADERBOARD_KEY = "pokereact.leaderboard";

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(initialStats);
  const [missions, setMissions] = useState(createMissions);
  const [dailyBonusState, setDailyBonusState] = usePersistentState(
    DAILY_BONUS_KEY,
    { lastClaimed: null },
  );
  const [leaderboard, setLeaderboard] = usePersistentState(LEADERBOARD_KEY, []);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [chatMessages, setChatMessages] = useState(WELCOME_MESSAGES);
  const [handHistory, setHandHistory] = useState([]);
  const [appError, setAppError] = useState("");

  const appendChatMessages = useCallback((messages) => {
    if (!messages?.length) return;
    setChatMessages((prev) => appendLimited(prev, messages));
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

  const leaderboardLabel = profile?.name || "You";
  const profileAvatar = profile?.avatar || "/assets/others/avatar2.jpg";

  // Hasil tangan (ringkasan chat, statistik, misi, leaderboard). Dipanggil
  // setelah kartu selesai dibuka di layar agar hasil tidak "bocor" lebih dulu.
  const applyHandResult = useCallback(
    (handResult, summary) => {
      appendChatMessages(summary);
      const { heroWon, heroHand, pot } = handResult;
      setStats((current) => ({
        handsPlayed: current.handsPlayed + 1,
        handsWon: current.handsWon + (heroWon ? 1 : 0),
        biggestPot: Math.max(current.biggestPot, pot),
        bestHand: heroWon ? heroHand || current.bestHand : current.bestHand,
      }));
      setHandHistory((current) =>
        [
          {
            id: `${Date.now()}-${handResult.handNumber}`,
            pot,
            winners: handResult.winners,
            heroHand,
            community: handResult.community,
          },
          ...current,
        ].slice(0, 5),
      );
      setMissions((current) =>
        current.map((mission) => {
          if (mission.id === "win-3" && heroWon) return bumpMission(mission);
          if (mission.id === "see-flop" && handResult.sawFlop) {
            return bumpMission(mission);
          }
          if (mission.id === "big-pot" && heroWon && pot >= 250) {
            return bumpMission(mission);
          }
          return mission;
        }),
      );
      setLeaderboard((current) =>
        upsertBestScore(current, {
          name: leaderboardLabel,
          score: handResult.heroChips,
          avatar: profileAvatar,
        }),
      );
    },
    [appendChatMessages, leaderboardLabel, profileAvatar, setLeaderboard],
  );

  const resultTimerRef = useRef(null);

  // Narasi chat diturunkan dari transisi state mesin; dipanggil dari event/timer
  // sehingga tidak perlu efek render
  const handleTransition = useCallback(
    (prev, next) => {
      const { messages, handResult } = describeTransition(prev, next, {
        heroIndex: 0,
      });
      const immediate = messages.filter((m) => !m.summary);
      const summary = messages.filter((m) => m.summary);
      if (!prev) {
        clearTimeout(resultTimerRef.current);
        setChatMessages([...WELCOME_MESSAGES, ...immediate]);
      } else {
        appendChatMessages(immediate);
      }
      if (!handResult) return;
      resultTimerRef.current = setTimeout(
        () => applyHandResult(handResult, summary),
        resultDelayMs(prev?.community.length ?? 0, next),
      );
    },
    [appendChatMessages, applyHandResult],
  );

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
  } = usePokerEngine(playersConfig, { onTransition: handleTransition });

  // Kartu meja dibuka bertahap; hasil tangan baru tampil setelah semua terlihat
  const { visibleCount, resultReady } = useRevealPacing(state);
  const visibleCommunity = useMemo(
    () => (state.community || []).slice(0, visibleCount),
    [state.community, visibleCount],
  );
  const tableState = useMemo(
    () =>
      visibleCount === (state.community?.length ?? 0)
        ? state
        : { ...state, community: visibleCommunity },
    [state, visibleCount, visibleCommunity],
  );
  // Status untuk UI: tangan dianggap masih berjalan sampai hasil siap ditampilkan
  const shownStatus = status === "playing" || resultReady ? status : "playing";

  const player = state.players?.[0];
  const isHeroTurn = status === "playing" && state.currentPlayer === 0;
  const actingPlayerName =
    status === "playing" && !isHeroTurn
      ? state.players?.[state.currentPlayer]?.name
      : null;
  const statusLabel =
    status !== "playing"
      ? resultReady
        ? "Hand complete"
        : "Revealing cards…"
      : isHeroTurn
        ? "Your turn"
        : `${actingPlayerName ?? "Opponent"} is thinking…`;

  const playWinnerSound = useSound("/sounds/minecraft_level_up.mp3");
  const playCardFlip = useTone({
    frequency: 520,
    duration: 0.18,
    type: "triangle",
    volume: 0.15,
  });
  const playChipStack = useTone({
    frequency: 240,
    duration: 0.25,
    type: "sawtooth",
    volume: 0.12,
  });

  useHandEndSound(
    shownStatus,
    winners.length > 0,
    soundEnabled,
    playWinnerSound,
  );
  useCardFlipSound(visibleCount, soundEnabled, playCardFlip);

  const executeAction = useCallback(
    (action, amount) => {
      if (soundEnabled && ["call", "bet", "raise"].includes(action)) {
        playChipStack();
      }
      handleAction(action, amount);
    },
    [handleAction, playChipStack, soundEnabled],
  );

  // Waktu habis: check bila gratis, selain itu fold
  const handleHeroTimeout = useCallback(() => {
    if (!isHeroTurn) return;
    const canCheck = availableActions.some((a) => a.type === "check");
    executeAction(canCheck ? "check" : "fold");
  }, [availableActions, executeAction, isHeroTurn]);

  // Kewajiban call terkini untuk pemain utama
  const toCall = state.players?.length
    ? Math.max(
        0,
        Math.max(...state.players.map((p) => p.bet)) - (player?.bet ?? 0),
      )
    : 0;

  const heroHand = player?.hand;
  const handStrength = useMemo(() => {
    if (!heroHand?.length) return "";
    return getHandName(heroHand, visibleCommunity);
  }, [heroHand, visibleCommunity]);

  // Peluang dari sudut pandang pemain: hanya kartu yang terlihat yang dipakai
  const heroInHand =
    Boolean(player) &&
    !player.folded &&
    !player.sittingOut &&
    heroHand?.length === 2;
  const opponentsLeft =
    state.players?.filter((p, i) => i !== 0 && !p.folded).length ?? 0;
  // Distribusi kombinasi hanya bergantung pada kartu yang terlihat
  const handOutcome = useMemo(
    () =>
      gameStarted && heroInHand && !resultReady
        ? finalHandOdds(heroHand, visibleCommunity)
        : null,
    [gameStarted, heroInHand, resultReady, heroHand, visibleCommunity],
  );
  const odds = useMemo(() => {
    if (!handOutcome) return null;
    // Saat showdown kartu lawan sudah terbuka, jadi hitung melawan kartu itu
    const revealed = Boolean(state.endgame);
    const win = revealed
      ? revealedWinChance(state, 0, visibleCount)
      : opponentsLeft > 0
        ? winChance(state, 0, visibleCount)
        : 1;
    return { ...handOutcome, win, revealed, opponents: opponentsLeft };
  }, [handOutcome, state, visibleCount, opponentsLeft]);

  const hints = useMemo(() => {
    // Ringkasan rekomendasi aksi agar UI tetap informatif tanpa logika baru
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
        tip:
          toCall === 0
            ? "Take the lead with a confident bet to extract value."
            : "The price is affordable—calling keeps your showdown value intact.",
      };
    }
    if (handStrength) {
      return {
        strength: handStrength,
        recommendation: toCall === 0 ? "Check" : "Fold carefully",
        tip:
          toCall === 0
            ? "Free cards can improve marginal holdings."
            : "Save chips for a better spot unless pot odds are compelling.",
      };
    }
    return base;
  }, [availableActions, handStrength, state.currentPlayer, toCall]);

  const now = new Date();
  const lastClaimed = dailyBonusState.lastClaimed
    ? new Date(dailyBonusState.lastClaimed)
    : null;
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
    appendChatMessages([
      {
        id: Date.now(),
        author: "Dealer",
        message: "Daily bonus +250 will be added at the next hand.",
        type: "dealer",
      },
    ]);
  };

  const handleStartGame = (config) => {
    // Lindungi proses start agar tidak gagal diam-diam ketika prop belum siap
    try {
      setProfile({
        name: config.name,
        isBot: false,
        avatar: config.avatar,
        favoriteColor: config.color,
      });
      setGameStarted(true);
      setAppError("");
    } catch (error) {
      console.error("Konfigurasi awal tidak valid", error);
      setAppError(
        "Terjadi kendala saat mempersiapkan meja. Muat ulang bila masalah berlanjut.",
      );
    }
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

  const { playerOutOfChips, playerWonGame } = getGameOverState(
    shownStatus,
    state.players,
  );

  const sendReaction = (emoji) => {
    appendChatMessages([
      {
        id: Date.now(),
        author: profile?.name || "You",
        message: emoji,
        type: "player",
      },
    ]);
  };

  if (!gameStarted) {
    return <StartScreen onStartGame={handleStartGame} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
      <div className="@container mx-auto max-w-7xl space-y-5 px-4 py-4">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 px-4 py-4 shadow-xl md:px-6">
          <div>
            <p className="text-sm uppercase tracking-widest text-white/60">
              Neon Hold'em
            </p>
            <h1 className="text-3xl font-black text-yellow-300">PokeReact</h1>
            <p className="text-xs text-white/60">
              {state.round} ·{" "}
              <span
                className={`font-semibold ${isHeroTurn ? "text-emerald-300" : "text-white"}`}
              >
                {statusLabel}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="rounded-full border border-white/10 bg-black/40 px-4 py-2">
              <span className="text-white/70">Stack</span>
              <p className="text-xl font-bold text-green-300">
                {player?.chips ?? 0}
              </p>
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

        {/* Layout mengikuti lebar container (bukan viewport) agar tetap benar
            pada ukuran font/zoom apa pun: 1 kolom, meja + sidebar, tiga kolom */}
        <main className="grid items-start gap-4 @[920px]:grid-cols-[minmax(0,1fr)_300px] @[1200px]:grid-cols-[280px_minmax(0,1fr)_280px]">
          <GameHud
            variant="left"
            className="order-3 @[920px]:order-none @[920px]:col-start-2 @[920px]:row-start-2 @[1200px]:col-start-1 @[1200px]:row-start-1"
            leaderboard={leaderboard}
            chatMessages={chatMessages}
            onSendReaction={sendReaction}
          />

          <section className="order-1 space-y-4 @[920px]:order-none @[920px]:col-start-1 @[920px]:row-span-2 @[920px]:row-start-1 @[1200px]:col-start-2 @[1200px]:row-span-1">
            <PokerTable
              state={tableState}
              pot={pot}
              winners={resultReady ? winners : []}
              accentColor={profile?.favoriteColor}
              onHeroTimeout={handleHeroTimeout}
            />

            <div className="sticky top-4 z-10">
              <ActionBar
                actions={isHeroTurn ? availableActions : []}
                onAction={executeAction}
                hints={hints}
                heroBet={player?.bet ?? 0}
                waitingFor={actingPlayerName}
              />
            </div>

            {handHistory.length > 0 && (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Recent hands</h3>
                  <span className="text-xs text-white/60">
                    Last {handHistory.length} rounds
                  </span>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {handHistory.map((hand) => (
                    <div
                      key={hand.id}
                      className="rounded-2xl border border-white/5 bg-black/30 p-3 text-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-white/90">
                          Pot {hand.pot}
                        </span>
                        <span className="text-xs text-white/60">
                          {hand.heroHand}
                        </span>
                      </div>
                      <p className="text-xs text-white/60">
                        Winner: {hand.winners.join(", ")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <GameHud
            className="order-2 @[920px]:order-none @[920px]:col-start-2 @[920px]:row-start-1 @[1200px]:col-start-3"
            stats={stats}
            odds={odds}
            missions={missions}
            leaderboard={leaderboard}
            dailyBonus={{ available: bonusAvailable, lastClaimed }}
            onClaimBonus={handleClaimBonus}
          />
        </main>

        <footer className="flex items-center justify-center rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-white/70 shadow-xl">
          <a
            href="https://github.com/fjrmhri"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 transition hover:text-yellow-300"
          >
            <span className="font-semibold text-white/90">github.com</span>
            <span className="text-white/80">/fjrmhri</span>
          </a>
        </footer>
      </div>

      {appError && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100 shadow-xl backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <p>{appError}</p>
            <button
              type="button"
              onClick={() => setAppError("")}
              className="rounded-lg border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {resultReady &&
        winners.length > 0 &&
        !playerOutOfChips &&
        !playerWonGame && (
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
