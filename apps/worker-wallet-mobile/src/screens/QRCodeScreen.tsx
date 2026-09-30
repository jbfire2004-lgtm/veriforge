import { StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useOfflineSync } from "../hooks/useOfflineSync";
import type { RootStackParamList } from "../navigation";

type Props = NativeStackScreenProps<RootStackParamList, "QR">;

export function QRCodeScreen({ route }: Props) {
  const { workerId } = route.params;
  const { bundle } = useOfflineSync(workerId);
  const content = bundle?.qr?.content ?? bundle?.qr?.verifyUrl ?? "";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Field scan QR</Text>
      <Text style={styles.sub}>Supervisors scan to verify your wallet on site.</Text>
      {content ? (
        <View style={styles.qrWrap}>
          <QRCode value={content} size={220} />
        </View>
      ) : (
        <Text style={styles.sub}>Sync wallet to generate QR.</Text>
      )}
      {content ? <Text style={styles.url}>{content}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", padding: 24, gap: 12 },
  title: { fontSize: 20, fontWeight: "700" },
  sub: { fontSize: 14, color: "#64748b", textAlign: "center" },
  qrWrap: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  url: { fontSize: 11, color: "#94a3b8", textAlign: "center" },
});
