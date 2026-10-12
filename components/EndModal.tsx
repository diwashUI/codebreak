import { Modal, Pressable, Share, Text, View, StyleSheet } from "react-native";
import { MAX_TRIES, shareText } from "../lib/game";
import type { Stats } from "../lib/stats";
import type { GameStatus } from "../hooks/useGameState";

interface EndModalProps {
  visible: boolean;
  status: GameStatus;
  secret: string;
  dateKey: string;
  guesses: string[];
  stats: Stats;
  onClose: () => void;
}

/** Win/lose popup: the code reveal, stats, and the viral share button. */
export default function EndModal({
  visible,
  status,
  secret,
  dateKey,
  guesses,
  stats,
  onClose,
}: EndModalProps) {
  const won = status === "won";
  const winPct = stats.played === 0 ? 0 : Math.round((stats.won / stats.played) * 100);

  const onShare = async () => {
    try {
      await Share.share({ message: shareText(dateKey, guesses, secret) });
    } catch {
      /* user dismissed — fine */
    }
  };

  const stat = (value: string | number, label: string) => (
    <View key={label} style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{won ? "🎉 Cracked it!" : "😅 So close"}</Text>
          {!won && <Text style={styles.secret}>The code was {secret}</Text>}
          <View style={styles.statsRow}>
            {stat(stats.played, "Played")}
            {stat(`${winPct}%`, "Win")}
            {stat(stats.currentStreak, "Streak")}
            {stat(stats.maxStreak, "Max")}
          </View>
          <Pressable style={styles.shareBtn} onPress={onShare}>
            <Text style={styles.shareText}>📤 Share my grid</Text>
          </Pressable>
          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Keep looking</Text>
          </Pressable>
          <Text style={styles.next}>Next code drops at midnight UTC</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    backgroundColor: "#18181b",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3f3f46",
  },
  title: { color: "#fafafa", fontSize: 26, fontWeight: "800", marginBottom: 4 },
  secret: { color: "#a1a1aa", fontSize: 16, marginBottom: 12, fontVariant: ["tabular-nums"] },
  statsRow: { flexDirection: "row", gap: 20, marginVertical: 16 },
  stat: { alignItems: "center" },
  statValue: { color: "#fafafa", fontSize: 24, fontWeight: "800" },
  statLabel: { color: "#71717a", fontSize: 12, marginTop: 2 },
  shareBtn: {
    backgroundColor: "#f59e0b",
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 8,
  },
  shareText: { color: "#000", fontSize: 17, fontWeight: "800" },
  closeBtn: { marginTop: 12, padding: 8 },
  closeText: { color: "#a1a1aa", fontSize: 15 },
  next: { color: "#52525b", fontSize: 12, marginTop: 12 },
});
