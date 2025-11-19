# 🎰 PokeReact - Poker Game Interaktif

![Poker Game](https://img.shields.io/badge/React-19.1.1-blue.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.17-38B2AC.svg)
![Framer Motion](https://img.shields.io/badge/Framer%20Motion-12.23.12-0055FF.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

PokeReact adalah implementasi **Texas Hold'em Poker** yang modern dan interaktif, dibangun dengan React dan dilengkapi dengan AI bot cerdas, animasi halus, dan desain UI yang menarik.

## ✨ Fitur Utama

### 🎮 Gameplay Poker Lengkap

- **Texas Hold'em Rules** - Implementasi aturan poker standar yang akurat
- **Multi-Round System** - Preflop → Flop → Turn → River → Showdown
- **Blind System** - Small blind (10) dan Big blind (20) yang proper
- **Side Pot Management** - Penanganan multiple all-in situations
- **Hand Evaluation** - Deteksi semua kombinasi kartu poker (Royal Flush hingga High Card)

### 🤖 AI Bot Cerdas

- **3 Tingkat Kesulitan**:
  - **Mudah** 🤖: Strategi sederhana, cocok untuk pemula
  - **Normal** 🤖🤖: Menggunakan algoritma Monte Carlo untuk estimasi win rate
  - **Sulit** 🤖🤖🤖: Implementasi Teori Game dan strategi advanced
- **Monte Carlo Simulation** - Simulasi 300-600 hands untuk pengambilan keputusan
- **Game Theory Strategy** - Nash Equilibrium sederhana untuk optimal play
- **Pattern Analysis** - Bot menganalisis pola taruhan lawan
- **Position Awareness** - Strategi yang menyesuaikan dengan posisi pemain
- **Dynamic Aggression** - Tingkat agresivitas berdasarkan kekuatan tangan

### 🎨 UI/UX Modern

- **Responsive Design** - Layout yang adaptif untuk berbagai ukuran layar
- **Mobile Warning** - Pesan khusus untuk layar kecil (< 768px)
- **Smooth Animations** - Framer Motion untuk transisi yang halus
- **Modern Styling** - Gradient backgrounds, glass morphism effects, dan micro-interactions
- **Visual Feedback** - Hover effects, glow effects, dan loading states
- **Large Card Design** - Kartu yang lebih besar dan jelas untuk pengalaman visual yang lebih baik

### 🚀 Fitur Tambahan

- **Start Screen** - Input nama pemain dan pilihan avatar
- **Avatar Customization** - Upload avatar pribadi atau pilih dari 3 opsi
- **Timer System** - 30 detik countdown untuk setiap giliran
- **Sound Effects** - Suara kemenangan dan feedback audio
- **Game Over Management** - Modal restart dan exit yang user-friendly
- **Chip Management** - Sistem chip yang realistis (awal: 1000)
- **Win/Lose Conditions** - Menang jika dapat semua chip, kalah jika chip habis

## 🛠 Teknologi yang Digunakan

### Frontend Framework

- **React 19.1.1** - Frontend library dengan hooks modern
- **React Router DOM 7.8.2** - Client-side routing
- **TypeScript** - Type safety dan better developer experience

### Styling & Animation

- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Styled Components 6.1.19** - CSS-in-JS library
- **Framer Motion 12.23.12** - Production-ready motion library

### Development Tools

- **Create React App 5.0.1** - React development environment
- **ESLint** - Code linting dan quality control
- **PostCSS & Autoprefixer** - CSS processing

### Testing

- **Jest** - Unit testing framework
- **React Testing Library** - React component testing
- **Testing Library User Event** - User interaction testing

## 📦 Instalasi & Menjalankan

### Prasyarat

- Node.js 16.0 atau lebih tinggi
- npm 8.0 atau lebih tinggi

### Instalasi Dependensi

```bash
# Clone repository
git clone https://github.com/fjrmhri/Simple-Poker-Game.git
cd Simple-Poker-Game

# Install dependencies
npm install
```

### Mode Pengembangan

```bash
npm start
```

Buka [http://localhost:3000](http://localhost:3000) untuk melihat aplikasi. Aplikasi akan otomatis reload saat ada perubahan kode.

### Build Produksi

```bash
npm run build
```

Build akan menghasilkan file statis di folder `build` yang siap untuk deployment.

### Pengujian

```bash
# Jalankan semua tests
npm test

# Jalankan tests dengan coverage
npm test -- --coverage
```

## 🎯 Struktur Kode

```
src/
├── components/           # Komponen React
│   ├── ActionBarEnhanced.jsx     # Tombol aksi permainan
│   ├── GameOverModal.js          # Modal game over
│   ├── MobileWarning.js          # Warning layar kecil
│   ├── PlayerSeat.jsx           # Komponen seat pemain
│   ├── PlayerSeatEnhanced.jsx   # Versi enhanced player seat
│   ├── PokerTable.jsx           # Meja poker
│   ├── PokerTableEnhanced.jsx   # Versi enhanced meja poker
│   ├── StartScreen.js           # Layar awal permainan
│   └── WinnerModal.js           # Modal pemenang
├── core/                # Logika permainan inti
│   ├── ai.js                   # AI bot implementation
│   ├── aiEnhanced.js           # Enhanced AI dengan Monte Carlo
│   ├── handEvaluator.js        # Evaluasi tangan poker
│   ├── models.js               # Game models lama
│   └── modelsEnhanced.js       # Enhanced game models
├── hooks/               # Custom React hooks
│   ├── usePokerEngine.js       # Hook untuk game engine
│   ├── usePokerEngineEnhanced.js # Enhanced game engine hook
│   └── useSound.js             # Hook untuk sound effects
├── App.js               # Komponen App utama (lama)
├── AppEnhanced.js       # Komponen App enhanced
├── index.css           # Global styles
├── index.js            # Entry point
└── setupTests.js       # Test setup
```

## 🧠 Algoritma AI

### Monte Carlo Simulation

AI menggunakan simulasi Monte Carlo untuk estimasi win rate:

```javascript
function estimasiWinRate(state, indexPemain, simulasi = 300) {
  // Simulasi multiple scenarios
  for (let s = 0; s < simulasi; s++) {
    // Complete community cards
    // Deal random cards to opponents
    // Evaluate hands and determine winners
  }
  // Calculate win probability
  return (menang + seri / 2) / simulasi;
}
```

### Game Theory Strategy

Bot mengimplementasikan strategi berbasis Nash Equilibrium:

- **Pot Odds Calculation** - Menghitung rasio risk vs reward
- **Position Adjustment** - Strategi berdasarkan posisi (early, middle, late)
- **Opponent Modeling** - Analisis pola taruhan lawan
- **Dynamic Thresholds** - Adjust decision thresholds based on game state

## 🎮 Cara Bermain

### Memulai Permainan

1. Buka aplikasi di browser
2. Masukkan nama Anda di Start Screen
3. Pilih avatar dari 3 opsi yang tersedia
4. Klik "Mulai Permainan" setelah konfirmasi

### Aturan Permainan

- **Chip Awal**: Setiap pemain mulai dengan 1000 chip
- **Blinds**: Small blind = 10, Big blind = 20
- **Goal**: Kumpulkan semua chip untuk menang
- **Elimination**: Anda kalah jika chip habis

### Kontrol Permainan

- **Fold** - Menyerah dan tidak mengikuti ronde
- **Check/Call** - Match taruhan saat ini atau check jika tidak ada taruhan
- **Bet/Raise** - Menambah taruhan (minimal 10 chip)

### Fitur Khusus

- **Timer**: 30 detik untuk setiap keputusan
- **Avatar Upload**: Klik avatar untuk mengganti gambar
- **Hand Display**: Kombinasi kartu ditampilkan saat showdown
- **Chip Counter**: Real-time chip count dan bet tracking

## 📱 Responsive Design

Aplikasi ini dirancang untuk bekerja optimal di berbagai perangkat:

- **Desktop**: Full experience dengan semua fitur
- **Tablet**: Layout yang disesuaikan untuk layar medium
- **Mobile**: Warning khusus untuk layar kecil (< 768px)

## 🔧 Konfigurasi

### Environment Variables

```bash
# Tidak ada environment variables khusus yang diperlukan
# Semua konfigurasi sudah termasuk dalam kode
```

### Customization

- **Chip Amount**: Ubah nilai awal chip di `modelsEnhanced.js`
- **Blind Levels**: Modifikasi small/big blind di game logic
- **AI Difficulty**: Sesuaikan parameter AI di `aiEnhanced.js`
- **Styling**: Kustomisasi tema di Tailwind config

## 🧪 Testing

### Unit Tests

```bash
# Jalankan semua unit tests
npm test

# Jalankan tests dengan watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage --watchAll=false
```

### Test Coverage

- **Game Logic**: Hand evaluation, pot calculation
- **AI Logic**: Win rate estimation, decision making
- **Components**: Rendering, user interactions
- **Hooks**: State management, side effects

## 🚀 Deployment

### Build untuk Produksi

```bash
npm run build
```

### Static Deployment

Folder `build` berisi file statis yang siap untuk deployment ke:

- Netlify
- Vercel
- GitHub Pages
- Apache Server
- Nginx

### Performance Optimization

- Code splitting otomatis
- Lazy loading untuk komponen
- Image optimization
- Bundle analysis tersedia

## 🤝 Kontribusi

Kami menyambut kontribusi dari komunitas! Untuk berkontribusi:

1. **Fork** repository
2. **Buat branch** baru (`git checkout -b fitur-baru`)
3. **Commit** perubahan Anda (`git commit -m 'Tambah fitur baru'`)
4. **Push** ke branch (`git push origin fitur-baru`)
5. **Buka Pull Request**

### Guidelines Kontribusi

- Ikuti ESLint configuration
- Tambahkan tests untuk fitur baru
- Update documentation
- Pastikan semua tests pass

## 📄 Lisensi

MIT License

Copyright (c) 2024 PokeReact

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## 🙏 Kredit & Aset

### Aset Visual

- **Card Images** - Kartu poker di `public/assets/cards/`
- **Avatar Images** - Avatar pemain di `public/assets/others/`
- **Background Images** - Background textures di `public/assets/`
- **UI Elements** - Buttons, icons, dan interface elements

### Audio

- **Sound Effects** - `minecraft_level_up.mp3` dari Minecraft (Mojang Studios)

### Dependencies

- **React Team** - React dan ekosistemnya
- **Tailwind CSS Team** - Utility-first CSS framework
- **Framer Motion Team** - Animation library
- **Open Source Community** - Berbagai libraries dan tools

## 📞 Support & Kontak

- **Issues**: [GitHub Issues](https://github.com/fjrmhri/Simple-Poker-Game/issues)
- **Discussions**: [GitHub Discussions](https://github.com/fjrmhri/Simple-Poker-Game/discussions)
- **Email**: [Contact Developer](mailto:developer@example.com)

## 🗺️ Roadmap

### Fitur Mendatang

- [ ] Multiplayer Online (WebRTC)
- [ ] Tournament Mode
- [ ] Leaderboard System
- [ ] Sound Customization
- [ ] Theme Selection
- [ ] Statistics Tracking
- [ ] Hand History
- [ ] Mobile App Version

### Performance Improvements

- [ ] WebAssembly untuk AI calculations
- [ ] Progressive Web App (PWA)
- [ ] Offline Mode
- [ ] Reduced Bundle Size

---

**Dibuat dengan ❤️ menggunakan React dan modern web technologies**

![Star History](https://img.shields.io/github/stars/fjrmhri/Simple-Poker-Game?style=social)
