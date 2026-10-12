import { useState } from "react";
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from "react-native";
import Board from "./components/Board";
import Keypad from "./components/Keypad";
import EndModal from "./components/EndModal";
import { useGameState } from "./hooks/useGameState";

export default function App() {
  const game = useGameState();
  const [modalOpen, setModalOpen] = useState(true);

  if (!game.loaded) return null;

  const finished = game.status !== "playing";

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>🔐 CODEBREAK</Text>
        <Text style={styles.streak}>🔥 {game.stats.currentStreak}</Text>
      </View>
      <Text style={styles.hint}>
        {finished
          ? "Come back tomorrow for a new code"
          : "Guess the 4-digit code — 🟩 right place, 🟨 wrong place"}
      </Text>

      <Board secret={game.secret} guesses={game.guesses} current={game.current} />

      <Keypad
        onDigit={game.addDigit}
        onBackspace={game.backspace}
        onEnter={game.submit}
        disabled={finished}
      />

      <EndModal
        visible={finished && modalOpen}
        status={game.status}
        secret={game.secret}
        dateKey={game.dateKey}
        guesses={game.guesses}
        stats={game.stats}
        onClose={() => setModalOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0b0b0f", paddingHorizontal: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
  },
  title: { color: "#fafafa", fontSize: 22, fontWeight: "900", letterSpacing: 2 },
  streak: { color: "#f59e0b", fontSize: 18, fontWeight: "800" },
  hint: { color: "#71717a", fontSize: 13, textAlign: "center", marginTop: 10 },
});
