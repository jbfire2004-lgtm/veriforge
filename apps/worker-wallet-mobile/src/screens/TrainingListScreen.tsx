import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useOfflineSync } from "../hooks/useOfflineSync";
import type { RootStackParamList } from "../navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Training">;

function expiryLabel(days: number | null | undefined): string {
  if (days == null) return "No expiry on file";
  if (days < 0) return `Expired ${Math.abs(days)}d ago`;
  if (days === 0) return "Expires today";
  return `${days}d remaining`;
}

export function TrainingListScreen({ navigation, route }: Props) {
  const { workerId } = route.params;
  const { bundle } = useOfflineSync(workerId);

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={bundle?.training ?? []}
      keyExtractor={(item) => String(item.id)}
      ListEmptyComponent={<Text style={styles.empty}>No training in wallet yet.</Text>}
      renderItem={({ item }) => (
        <Pressable
          style={styles.row}
          onPress={() =>
            navigation.navigate("TrainingDetail", {
              workerId,
              recordId: item.id,
            })
          }
        >
          <Text style={styles.name}>
            {item.certification?.name ?? `Record #${item.id}`}
          </Text>
          <Text style={styles.meta}>{expiryLabel(item.daysUntilExpiry)}</Text>
          <Text style={styles.badge}>{item.verifiedByVeraStatus ?? "UNVERIFIED"}</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 10 },
  empty: { textAlign: "center", color: "#64748b", marginTop: 40 },
  row: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 4,
  },
  name: { fontSize: 16, fontWeight: "600", color: "#0f172a" },
  meta: { fontSize: 13, color: "#475569" },
  badge: { fontSize: 11, color: "#0d9488", fontWeight: "600" },
});
