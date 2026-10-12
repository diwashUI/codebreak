// Pure game logic — no React Native imports, fully unit-tested.
//
// The daily code is deterministic: hash(UTC date) → mulberry32 → 4 digits.
// Every player on Earth gets the same code with zero servers.

export const CODE_LENGTH = 4;
export const MAX_TRIES = 8;

/** 🟩 right digit right place · 🟨 right digit wrong place · ⬛ not in code */
export type Peg = "hit" | "present" | "miss";

export const PEG_EMOJI: Record<Peg, string> = {
  hit: "🟩",
  present: "🟨",
  miss: "⬛",
};

/** String hash → uint32 (xmur3-style). */
export function hashSeed(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

/** Deterministic PRNG. Same seed → same sequence, everywhere. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** "2026-10-12" in UTC — one code per day, worldwide. */
export function todayKey(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

/** The day's secret code. Deterministic: same date → same code. */
export function dailyCode(dateKey: string): string {
  const rand = mulberry32(hashSeed("codebreak:v1:" + dateKey));
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += Math.floor(rand() * 10);
  }
  return code;
}

/**
 * Mastermind scoring. Two-pass so duplicate digits are handled correctly:
 * hits are claimed first, then presents — each secret digit matched at most once.
 *
 * e.g. secret "1122", guess "1222" → hit, miss, hit, hit
 * (the lone unmatched "1" can't also cover the second "2").
 */
export function evaluateGuess(secret: string, guess: string): Peg[] {
  const result: Peg[] = new Array(CODE_LENGTH).fill("miss");
  const unmatched: number[] = new Array(10).fill(0);

  for (let i = 0; i < CODE_LENGTH; i++) {
    if (guess[i] === secret[i]) {
      result[i] = "hit";
    } else {
      unmatched[Number(secret[i])]++;
    }
  }
  for (let i = 0; i < CODE_LENGTH; i++) {
    if (result[i] === "hit") continue;
    const d = Number(guess[i]);
    if (unmatched[d] > 0) {
      result[i] = "present";
      unmatched[d]--;
    }
  }
  return result;
}

/** The viral artifact: emoji grid for the share sheet. */
export function shareText(dateKey: string, guesses: string[], secret: string): string {
  const won = guesses.length > 0 && guesses[guesses.length - 1] === secret;
  const score = won ? `${guesses.length}/${MAX_TRIES}` : `X/${MAX_TRIES}`;
  const rows = guesses
    .map((g) => evaluateGuess(secret, g).map((p) => PEG_EMOJI[p]).join(""))
    .join("\n");
  return `🔐 Codebreak ${dateKey} — ${score}\n\n${rows}`;
}
