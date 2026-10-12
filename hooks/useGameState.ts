import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  CODE_LENGTH,
  MAX_TRIES,
  dailyCode,
  todayKey,
} from "../lib/game";
import { emptyStats, recordGame, type Stats } from "../lib/stats";

const STATS_KEY = "codebreak:stats";
const GAME_KEY = "codebreak:game";

export type GameStatus = "playing" | "won" | "lost";

/**
 * All game state in one place. Today's guesses + stats persist in
 * AsyncStorage, so a restart (or midnight edge) never loses progress.
 */
export function useGameState() {
  const [dateKey, setDateKey] = useState(todayKey());
  const [secret, setSecret] = useState(() => dailyCode(dateKey));
  const [guesses, setGuesses] = useState<string[]>([]);
  const [current, setCurrent] = useState("");
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const today = todayKey();
        const [sRaw, gRaw] = await Promise.all([
          AsyncStorage.getItem(STATS_KEY),
          AsyncStorage.getItem(GAME_KEY),
        ]);
        if (sRaw) setStats(JSON.parse(sRaw));
        if (gRaw) {
          const g = JSON.parse(gRaw);
          if (g.date === today && Array.isArray(g.guesses)) {
            setGuesses(g.guesses.filter((x: unknown) => typeof x === "string"));
          }
        }
        setDateKey(today);
        setSecret(dailyCode(today));
      } catch {
        /* corrupt storage → start fresh, never crash */
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const status: GameStatus =
    guesses.length > 0 && guesses[guesses.length - 1] === secret
      ? "won"
      : guesses.length >= MAX_TRIES
        ? "lost"
        : "playing";

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(GAME_KEY, JSON.stringify({ date: dateKey, guesses })).catch(
      () => {}
    );
  }, [guesses, dateKey, loaded]);

  const addDigit = useCallback(
    (d: string) => {
      if (status !== "playing" || current.length >= CODE_LENGTH) return;
      setCurrent((c) => c + d);
    },
    [status, current]
  );

  const backspace = useCallback(() => {
    if (status !== "playing") return;
    setCurrent((c) => c.slice(0, -1));
  }, [status]);

  const submit = useCallback(() => {
    if (status !== "playing" || current.length !== CODE_LENGTH) return;
    const next = [...guesses, current];
    setGuesses(next);
    setCurrent("");
    const won = current === secret;
    if (won || next.length >= MAX_TRIES) {
      const today = todayKey();
      const y = new Date();
      y.setUTCDate(y.getUTCDate() - 1);
      setStats((prev) => {
        const s = recordGame(prev, won, today, todayKey(y));
        AsyncStorage.setItem(STATS_KEY, JSON.stringify(s)).catch(() => {});
        return s;
      });
    }
  }, [status, current, guesses, secret]);

  return {
    loaded,
    dateKey,
    secret,
    guesses,
    current,
    status,
    stats,
    addDigit,
    backspace,
    submit,
  };
}
