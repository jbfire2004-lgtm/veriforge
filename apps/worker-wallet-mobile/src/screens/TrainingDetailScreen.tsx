import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useOfflineSync } from "../hooks/useOfflineSync";
import { validateBlockchain } from "../api/workerWallet";
import type { RootStackParamList } from "../navigation";

type Props = NativeStackScreenProps<RootStackParamList, "TrainingDetail">;

export function TrainingDetailScreen({ route }: Props) {
  const { workerId, recordId } = route.params;
  const { bundle } = useOfflineSync(workerId);
  const record = bundle?.training.find((t) => t.id === recordId);
  const [chain, setChain] = useState<{ valid: boolean; message: string } | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!record?.nftTokenId) return;
    setChecking(true);
    void validateBlockchain(record.nftTokenId, record.id)
      .then(setChain)
      .catch(() => setChain({ valid: false, message: "Could not reach chain validator" }))
      .finally(() => setChecking(false));
  }, [record?.nftTokenId, record?.id]);

  if (!record) {
    return (
      <View style={styles.container}>
        <Text>Training record not found in offline bundle.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{record.certification?.name ?? "Training"}</Text>
      <Text style={styles.row}>Status: {record.verifiedByVeraStatus ?? "UNVERIFIED"}</Text>
      <Text style={styles.row}>
        Expires: {record.expiresAt ? new Date(record.expiresAt).toLocaleDateString() : "—"}
      </Text>
      <Text style={styles.row}>
        Countdown: {record.daysUntilExpiry != null ? `${record.daysUntilExpiry} days` : "—"}
      </Text>
      {record.nftTokenId ? (
        <View style={styles.chainBox}>
          <Text style={styles.chainTitle}>Blockchain credential</Text>
          <Text style={styles.mono}>{record.nftTokenId}</Text>
          {checking ? (
            <ActivityIndicator color="#0d9488" />
          ) : chain ? (
            <Text style={chain.valid ? styles.valid : styles.invalid}>
              {chain.valid ? "Valid on chain" : "Not valid"} — {chain.message}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 10 },
  title: { fontSize: 22, fontWeight: "700" },
  row: { fontSize: 15, color: "#334155" },
  chainBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    gap: 6,
  },
  chainTitle: { fontWeight: "600" },
  mono: { fontFamily: "monospace", fontSize: 12 },
  valid: { color: "#15803d" },
  invalid: { color: "#b91c1c" },
});
