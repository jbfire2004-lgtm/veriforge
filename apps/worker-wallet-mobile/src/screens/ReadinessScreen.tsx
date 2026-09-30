import { FlatList, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useOfflineSync } from "../hooks/useOfflineSync";
import type { RootStackParamList } from "../navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Readiness">;

export function ReadinessScreen({ route }: Props) {
  const { workerId } = route.params;
  const { bundle } = useOfflineSync(workerId);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Project readiness</Text>
      <Text style={styles.score}>
        Overall score: {bundle?.readiness?.score != null ? `${bundle.readiness.score}%` : "—"}
      </Text>
      <FlatList
        data={bundle?.projects ?? []}
        keyExtractor={(p) => String(p.projectId)}
        ListEmptyComponent={<Text style={styles.empty}>No active project assignments.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.project}>{item.projectName}</Text>
            <Text style={styles.hint}>Gate status updates when wallet syncs online.</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 8 },
  title: { fontSize: 20, fontWeight: "700" },
  score: { fontSize: 16, color: "#0d9488", marginBottom: 8 },
  empty: { color: "#64748b", marginTop: 24, textAlign: "center" },
  card: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  project: { fontWeight: "600", fontSize: 15 },
  hint: { fontSize: 12, color: "#64748b", marginTop: 4 },
});
