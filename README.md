# ♠️ PokeReact – Neon Texas Hold'em

PokeReact is a polished single-table Texas Hold'em experience built with React, Tailwind CSS, and Framer Motion. The latest overhaul focuses on smarter gameplay, a cinematic UI, and engaging progression systems so the table feels alive even when you play solo.

## ✨ Highlights

### Modern UI/UX
- Glassmorphism table with animated community cards and responsive seating layout
- Start screen with avatar, tagline, and accent color customization
- Dynamic HUD featuring stats, missions, leaderboard, and in-table chat reactions
- Framer Motion animations across cards, modals, and overlays for a premium feel

### Improved Game Logic
- Accurate betting rounds (preflop → showdown) with blinds and side pots handled in `src/core/models.js`
- Winner detection powered by the full hand evaluator (`src/core/handEvaluator.js`)
- Smart hint engine in the main app that reacts to hand strength, pot odds, and available actions
- Cleanup of duplicate engines/components for a single, optimized React flow

### Gameplay Extras
- Daily bonus chip injection with persistence (`localStorage`)
- Missions that track wins, flops seen, and big pots
- Local leaderboard that records your best stacks with avatars
- Quick emoji reactions and dealer callouts that respond to round outcomes
- Sound suite: card flips, chip stacks, and victory fanfare (toggleable)

## 🧱 Project Structure
```
src/
├── App.jsx                # Main experience (layout, missions, leaderboard, hints)
├── components/
│   ├── ActionBar.jsx      # Slider-based betting console with hints
│   ├── GameHud.jsx        # Stats, missions, leaderboard, chat, bonus button
│   ├── GameOverModal.js   # End-of-run modal
│   ├── MobileWarning.js   # Small-screen fallback
│   ├── PlayerSeat.jsx     # Avatar, timer, status badges
│   ├── PokerTable.jsx     # Table scene and community cards
│   ├── StartScreen.js     # Profile setup and confirmation
│   ├── WinnerModal.js     # Hand-complete overlay
│   └── CardImg.jsx        # Animated playing cards
├── core/                 # Game logic (models, AI, evaluator)
├── hooks/
│   ├── usePokerEngine.js  # Engine wrapper used throughout the app
│   ├── useSound.js        # Audio helper for mp3 assets
│   └── useTone.js         # Lightweight Web Audio beeps for chips/cards
└── index.js / index.css   # App bootstrap & global styles
```

## 🚀 Getting Started
```bash
git clone https://github.com/fjrmhri/Simple-Poker-Game.git
cd Simple-Poker-Game
npm install
npm start
```
Visit `http://localhost:3000` to sit at the table.

## 🧪 Testing
```bash
npm test
```
A smoke test ensures the PokeReact heading renders; extend with more coverage for production use.

## 🛠 Customization Tips
- **Player defaults**: tweak bot profiles or starting stacks in `src/App.jsx` and `src/core/models.js`.
- **Missions & bonus rules**: adjust `createMissions()` and the daily bonus logic in `App.jsx`.
- **Sounds**: replace `/public/sounds/minecraft_level_up.mp3` or edit `useTone.js` frequencies for different effects.
- **Styling**: Tailwind utility classes are centralized inside each component; adjust colors or spacing there.

## 📄 License
MIT © 2024 PokeReact contributors
