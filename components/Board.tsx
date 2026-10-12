import { Text, View, StyleSheet } from "react-native";
import {
  CODE_LENGTH,
  MAX_TRIES,
  evaluateGuess,
  type Peg,
} from "../lib/game";

const PEG_BG: Record<Peg, string> = {
  hit: "#22c55e",
  present: "#f59e0b",
  miss: "#3f3f46",
};

interface BoardProps {
  secret: string;
  guesses: string[];
  current: string;
}

/** 8 rows × 4 cells. Submitted rows get their 🟩🟨⬛ colors. */
export default function Board({ secret, guesses, current }: BoardProps) {
  const rows = [];
  for (let r = 0; r < MAX_TRIES; r++) {
    const guess = guesses[r];
    const isCurrentRow = r === guesses.length;
    const pegs = guess ? evaluateGuess(secret, guess) : null;
    rows.push(
      <View key={r} style={styles.row}>
        {Array.from({ length: CODE_LENGTH }, (_, c) => {
          const digit = guess ? guess[c] : isCurrentRow ? (current[c] ?? "") : "";
          return (
            <View
              key={c}
              style={[
                styles.cell,
                { backgroundColor: pegs ? PEG_BG[pegs[c]] : "#18181b" },
              ]}
            >
              <Text style={styles.cellText}>{digit}</Text>
            </View>
          );
        })}
      </View>
    );
  }
  return <View style={styles.board}>{rows}</View>;
}

const styles = StyleSheet.create({
  board: { gap: 6, alignItems: "center", marginVertical: 12 },
  row: { flexDirection: "row", gap: 6 },
  cell: {
    width: 62,
    height: 62,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#3f3f46",
    alignItems: "center",
    justifyContent: "center",
  },
  cellText: { color: "#fafafa", fontSize: 28, fontWeight: "800" },
});
