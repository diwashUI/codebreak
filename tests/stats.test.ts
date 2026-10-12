import { describe, expect, it } from "vitest";
import { emptyStats, recordGame } from "../lib/stats";

describe("recordGame", () => {
  it("starts a streak at 1 on first win", () => {
    const s = recordGame(emptyStats, true, "2026-10-12", "2026-10-11");
    expect(s).toMatchObject({ played: 1, won: 1, currentStreak: 1, maxStreak: 1 });
  });

  it("continues the streak when yesterday was played", () => {
    const prev = { ...emptyStats, played: 3, won: 3, currentStreak: 2, maxStreak: 2, lastPlayed: "2026-10-11" };
    const s = recordGame(prev, true, "2026-10-12", "2026-10-11");
    expect(s.currentStreak).toBe(3);
    expect(s.maxStreak).toBe(3);
  });

  it("restarts the streak at 1 after a missed day", () => {
    const prev = { ...emptyStats, played: 3, won: 3, currentStreak: 5, maxStreak: 5, lastPlayed: "2026-10-08" };
    const s = recordGame(prev, true, "2026-10-12", "2026-10-11");
    expect(s.currentStreak).toBe(1);
    expect(s.maxStreak).toBe(5);
  });

  it("resets the streak on a loss", () => {
    const prev = { ...emptyStats, played: 3, won: 3, currentStreak: 4, maxStreak: 4, lastPlayed: "2026-10-11" };
    const s = recordGame(prev, false, "2026-10-12", "2026-10-11");
    expect(s).toMatchObject({ played: 4, won: 3, currentStreak: 0, maxStreak: 4 });
  });
});
