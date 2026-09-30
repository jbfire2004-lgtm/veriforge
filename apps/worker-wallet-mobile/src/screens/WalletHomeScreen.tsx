import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useOfflineSync } from "../hooks/useOfflineSync";
import type { RootStackParamList } from "../navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export function WalletHomeScreen({ navigation, route }: Props) {
  const { workerId } = route.params;
  const { bundle, loading, online, lastError, refresh } = useOfflineSync(workerId);

  const verifiedCount =
    bundle?.training.filter((t) =>
      ["VERIFIED", "VERIFIED_WITH_NFT"].includes(t.verifiedByVeraStatus ?? ""),
    ).length ?? 0;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Vera Worker Wallet</Text>
        <Text style={styles.sub}>
          {online ? "Online — auto-sync enabled" : "Offline — cached credentials"}
        </Text>
        {bundle ? (
          <Text style={styles.meta}>
            Last sync {new Date(bundle.syncedAt).toLocaleString()}
          </Text>
        ) : null}
      </View>

      {lastError ? <Text style={styles.warn}>{lastError}</Text> : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Verified training</Text>
        <Text style={styles.stat}>{loading ? "…" : verifiedCount}</Text>
        <Text style={styles.cardSub}>credentials with Vera verification</Text>
        <Pressable style={styles.btn} onPress={() => navigation.navigate("Training", { workerId })}>
          <Text style={styles.btnText}>View training</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Orientations</Text>
        <Text style={styles.cardSub}>Required modules & gating status</Text>
        <Pressable
          style={styles.btn}
          onPress={() => navigation.navigate("Orientations", { workerId })}
        >
          <Text style={styles.btnText}>View orientations</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Project readiness</Text>
        <Text style={styles.stat}>
          {bundle?.readiness?.score != null ? `${bundle.readiness.score}%` : "—"}
        </Text>
        <Pressable style={styles.btn} onPress={() => navigation.navigate("Readiness")}>
          <Text style={styles.btnText}>Project gates</Text>
        </Pressable>
      </View>

      <Pressable style={styles.btnOutline} onPress={() => navigation.navigate("QR")}>
        <Text style={styles.btnOutlineText}>Show field QR code</Text>
      </Pressable>

      <Pressable style={styles.btnGhost} onPress={() => void refresh()}>
        <Text style={styles.btnGhostText}>{loading ? "Syncing…" : "Sync now"}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 16 },
  header: { gap: 4 },
  title: { fontSize: 24, fontWeight: "700", color: "#0f172a" },
  sub: { fontSize: 14, color: "#475569" },
  meta: { fontSize: 12, color: "#64748b" },
  warn: { color: "#b45309", fontSize: 13 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 8,
  },
  cardTitle: { fontSize: 14, fontWeight: "600", color: "#334155" },
  cardSub: { fontSize: 12, color: "#64748b" },
  stat: { fontSize: 32, fontWeight: "700", color: "#0d9488" },
  btn: {
    backgroundColor: "#0d9488",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 4,
  },
  btnText: { color: "#fff", fontWeight: "600" },
  btnOutline: {
    borderWidth: 1,
    borderColor: "#0d9488",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  btnOutlineText: { color: "#0d9488", fontWeight: "600" },
  btnGhost: { alignItems: "center", paddingVertical: 8 },
  btnGhostText: { color: "#64748b" },
});
