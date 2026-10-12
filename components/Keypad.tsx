import { Pressable, Text, View, StyleSheet } from "react-native";

interface KeypadProps {
  onDigit: (d: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
  disabled: boolean;
}

/** 0–9 + backspace + enter. Big touch targets, thumb-friendly. */
export default function Keypad({ onDigit, onBackspace, onEnter, disabled }: KeypadProps) {
  const key = (label: string, onPress: () => void, wide = false) => (
    <Pressable
      key={label}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.key,
        wide && styles.keyWide,
        pressed && styles.keyPressed,
        disabled && styles.keyDisabled,
      ]}
    >
      <Text style={styles.keyText}>{label}</Text>
    </Pressable>
  );

  return (
    <View style={styles.pad}>
      <View style={styles.row}>
        {["1", "2", "3", "4", "5"].map((d) => key(d, () => onDigit(d)))}
      </View>
      <View style={styles.row}>
        {["6", "7", "8", "9", "0"].map((d) => key(d, () => onDigit(d)))}
      </View>
      <View style={styles.row}>
        {key("⌫", onBackspace, true)}
        {key("⏎", onEnter, true)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pad: { gap: 8, alignItems: "center", marginTop: 8 },
  row: { flexDirection: "row", gap: 8 },
  key: {
    width: 62,
    height: 56,
    borderRadius: 10,
    backgroundColor: "#27272a",
    alignItems: "center",
    justifyContent: "center",
  },
  keyWide: { width: 134 },
  keyPressed: { backgroundColor: "#3f3f46" },
  keyDisabled: { opacity: 0.4 },
  keyText: { color: "#fafafa", fontSize: 22, fontWeight: "700" },
});
