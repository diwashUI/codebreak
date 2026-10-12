// Streak math — pure, no storage imports. The hook owns AsyncStorage.

export interface Stats {
  played: number;
  won: number;
  currentStreak: number;
  maxStreak: number;
  /** UTC date key of the last finished game, or null. */
  lastPlayed: string | null;
}

export const emptyStats: Stats = {
  played: 0,
  won: 0,
  currentStreak: 0,
  maxStreak: 0,
  lastPlayed: null,
};

/**
 * Fold one finished game into the stats.
 * Win: streak continues only if yesterday was played, else restarts at 1.
 * Loss: streak resets to 0.
 */
export function recordGame(
  prev: Stats,
  won: boolean,
  today: string,
  yesterday: string
): Stats {
  const played = prev.played + 1;
  const wonCount = prev.won + (won ? 1 : 0);
  const currentStreak = won ? (prev.lastPlayed === yesterday ? prev.currentStreak + 1 : 1) : 0;
  return {
    played,
    won: wonCount,
    currentStreak,
    maxStreak: Math.max(prev.maxStreak, currentStreak),
    lastPlayed: today,
  };
}
