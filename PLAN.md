# CODEBREAK — Floor Plan

## 1. What it is
A daily code-breaking puzzle game for iOS/Android (Expo + React Native + TypeScript).
Every day the whole world gets the same secret 4-digit code. You get 8 tries to
crack it. Green = right digit, right place. Amber = right digit, wrong place.

## 2. Why this game
- **Global:** numbers need no language — an English word game can't do that.
- **Viral:** the share button copies your game as an emoji grid (🟩🟨⬛), Wordle-style.
  People post these; curiosity markets the app.
- **Simple:** no backend. The daily code is derived from the date with a seeded
  RNG — every player on Earth gets the same code with zero servers and zero cost.
- **Original:** Mastermind-style daily puzzle, our own brand. No IP problems.

## 3. Tech stack
- Expo SDK 57 + React Native + TypeScript (diwash's TS transfers directly)
- @react-native-async-storage/async-storage — stats, streaks, today's game
- React Native Share API — the viral share sheet (no extra dep)
- vitest — unit tests for the pure game logic (same as the morse project)

## 4. Architecture
```
App.tsx                  — composition + game screen layout
hooks/useGameState.ts    — loads today's game, guesses, stats; AsyncStorage glue
components/Board.tsx     — 8×4 grid, colors filled rows by pegs
components/Keypad.tsx    — 0–9, backspace, enter
components/EndModal.tsx  — stats (played / win % / streak / max) + share button
lib/game.ts              — PURE: seeded daily code, guess scoring, share text
lib/stats.ts             — PURE: streak math
tests/                   — vitest, covers lib/ fully
```
Rule (same as morse-player): `lib/` never touches the screen or storage.
UI talks to it through the hook.

## 5. Game rules (the domain logic)
- Code: 4 digits, `dailyCode(utcDate)` via xmur-style hash + mulberry32. Same worldwide.
- 8 tries. Scoring is duplicate-safe (two-pass: hits first, then presents —
  each secret digit matched at most once).
- Win → streak continues if yesterday was also played/won, else streak = 1.
- Lose (8 tries used) → streak resets to 0.
- One game per day: today's progress persists across app restarts.

## 6. Milestones
- **Day 1 — Logic:** `lib/game.ts` + `lib/stats.ts`, tests green (seed determinism,
  duplicate-digit scoring, streak math, share text format).
- **Day 2 — Playable:** board, keypad, end modal, share sheet, persistence.
  diwash playtests on his phone via Expo Go QR.
- **Day 3 — Ship prep:** icon, splash, app name, EAS build → AAB.
- **Later:** Play Console ($25, diwash's step) → 14-day closed test → production.
  AdMob only after real users.

## 7. Definition of done (v1)
- [ ] `npm test` passes
- [ ] Playable end-to-end on a real phone via Expo Go
- [ ] Share sheet produces the emoji grid
- [ ] Streak survives app restart; new code at midnight UTC
- [ ] GitHub repo + README
