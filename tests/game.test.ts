import { describe, expect, it } from "vitest";
import {
  CODE_LENGTH,
  MAX_TRIES,
  dailyCode,
  evaluateGuess,
  hashSeed,
  mulberry32,
  shareText,
  todayKey,
} from "../lib/game";

describe("seeded RNG", () => {
  it("is deterministic: same seed → same sequence", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it("hashSeed is stable", () => {
    expect(hashSeed("codebreak:v1:2026-10-12")).toBe(hashSeed("codebreak:v1:2026-10-12"));
  });
});

describe("dailyCode", () => {
  it("returns 4 digits", () => {
    expect(dailyCode("2026-10-12")).toMatch(/^\d{4}$/);
  });

  it("is deterministic per date", () => {
    expect(dailyCode("2026-10-12")).toBe(dailyCode("2026-10-12"));
  });

  it("changes across dates", () => {
    const codes = new Set(
      ["2026-10-10", "2026-10-11", "2026-10-12", "2026-10-13", "2026-10-14"].map(dailyCode)
    );
    expect(codes.size).toBeGreaterThan(1);
  });

  it("todayKey is the UTC date", () => {
    expect(todayKey(new Date("2026-10-12T23:00:00+05:45"))).toBe("2026-10-12");
    expect(todayKey(new Date("2026-10-12T00:30:00Z"))).toBe("2026-10-12");
  });
});

describe("evaluateGuess", () => {
  it("scores a perfect guess", () => {
    expect(evaluateGuess("1234", "1234")).toEqual(["hit", "hit", "hit", "hit"]);
  });

  it("scores all misses", () => {
    expect(evaluateGuess("1234", "5678")).toEqual(["miss", "miss", "miss", "miss"]);
  });

  it("scores all presents", () => {
    expect(evaluateGuess("1234", "4321")).toEqual(["present", "present", "present", "present"]);
  });

  it("handles duplicate digits: each secret digit matched once", () => {
    // secret 1,1,2,2 vs guess 1,2,2,2 → the single unmatched "1"
    // must not also cover the extra "2"
    expect(evaluateGuess("1122", "1222")).toEqual(["hit", "miss", "hit", "hit"]);
  });

  it("does not double-count a repeated guess digit", () => {
    // secret has one "1"; guess has two → only one present
    expect(evaluateGuess("1234", "1155")).toEqual(["hit", "miss", "miss", "miss"]);
  });

  it("mixed example", () => {
    expect(evaluateGuess("1204", "1024")).toEqual(["hit", "present", "present", "hit"]);
  });
});

describe("shareText", () => {
  it("builds the viral grid", () => {
    const secret = "1234";
    const text = shareText("2026-10-12", ["5678", "1234"], secret);
    expect(text).toContain("🔐 Codebreak 2026-10-12 — 2/8");
    expect(text).toContain("⬛⬛⬛⬛");
    expect(text).toContain("🟩🟩🟩🟩");
  });

  it("marks a loss as X/8", () => {
    expect(shareText("2026-10-12", ["5678"], "1234")).toContain("X/8");
  });

  it("uses the constants", () => {
    expect(CODE_LENGTH).toBe(4);
    expect(MAX_TRIES).toBe(8);
  });
});
