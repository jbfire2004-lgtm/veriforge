"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  fetchOrientationProfile,
  type OrientationProfile,
} from "../api/orientation";
import type { RootStackParamList } from "../navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Orientations">;

const WEB_BASE =
  process.env.EXPO_PUBLIC_WEB_URL ?? "http://localhost:3000";

function dueLabel(before: string) {
  if (before === "arrival") return "Before arrival";
  if (before === "dispatch") return "Before dispatch";
  return "Before assignment";
}

export function OrientationListScreen({ route }: Props) {
  const { workerId, companyId } = route.params;
  const [profile, setProfile] = useState<OrientationProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOrientationProfile(workerId, companyId);
      setProfile(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [workerId, companyId]);

  useEffect(() => {
    void load();
  }, [load]);

  const completedMap = useMemo(() => {
    const map = new Map<string, OrientationProfile["completedOrientations"][0]>();
    for (const c of profile?.completedOrientations ?? []) {
      map.set(c.orientationId, c);
    }
    return map;
  }, [profile]);

  const required = useMemo(
    () =>
      (profile?.requiredOrientations ?? []).filter((r) => {
        const done = completedMap.get(r.orientationId);
        return !done || done.status === "expired";
      }),
    [profile, completedMap],
  );

  if (loading) {
    return (
      <View style={styles.center} accessibilityRole="progressbar">
        <ActivityIndicator />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error ?? "No profile"}</Text>
        <Pressable
          style={styles.btn}
          onPress={() => void load()}
          accessibilityRole="button"
          accessibilityLabel="Retry"
        >
          <Text style={styles.btnText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const missingCount = profile.missingOrientations?.length ?? required.length;
  const projectLabel = profile.projectId
    ? `Project #${profile.projectId}`
    : "this project";

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={required}
      keyExtractor={(item) => item.requirementId}
      ListHeaderComponent={
        <View style={styles.header}>
          {profile.gatingStatus === "blocked" && missingCount > 0 ? (
            <Text style={styles.banner} accessibilityRole="alert">
              You must complete {missingCount} orientation
              {missingCount === 1 ? "" : "s"} before starting work on{" "}
              {projectLabel}.
            </Text>
          ) : null}
          <Text style={styles.section}>Required before arrival</Text>
        </View>
      }
      ListEmptyComponent={
        <Text style={styles.empty}>
          You are clear — no outstanding required orientations.
        </Text>
      }
      ListFooterComponent={
        <View style={styles.footer}>
          <Text style={styles.section}>Completed</Text>
          {profile.completedOrientations.length === 0 ? (
            <Text style={styles.empty}>None yet.</Text>
          ) : (
            profile.completedOrientations.map((c) => {
              const href = `${WEB_BASE}/workers/${workerId}/orientations/${c.orientationId}${
                companyId
                  ? `?companyId=${companyId}`
                  : profile.companyId
                    ? `?companyId=${profile.companyId}`
                    : ""
              }`;
              return (
                <Pressable
                  key={c.completionId}
                  style={styles.row}
                  onPress={() => void Linking.openURL(href)}
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${c.title ?? "completed orientation"}`}
                >
                  <Text style={styles.name}>{c.title ?? c.orientationId}</Text>
                  <Text style={styles.meta}>
                    {c.status}
                    {c.completedOn
                      ? ` · ${new Date(c.completedOn).toLocaleDateString()}`
                      : ""}
                  </Text>
                  <Text style={styles.badge}>View details</Text>
                </Pressable>
              );
            })
          )}
        </View>
      }
      renderItem={({ item }) => {
        const done = completedMap.get(item.orientationId);
        const status =
          done?.status === "expired"
            ? "Expired"
            : done
              ? "Completed"
              : "Pending";
        const cid = companyId ?? profile.companyId;
        const href = `${WEB_BASE}/workers/${workerId}/orientations/${item.orientationId}${
          cid ? `?companyId=${cid}` : ""
        }`;
        return (
          <Pressable
            style={styles.row}
            onPress={() => void Linking.openURL(href)}
            accessibilityRole="button"
            accessibilityLabel={`${status === "Pending" ? "Start" : "Resume"} ${item.title}`}
          >
            <Text style={styles.name}>{item.title}</Text>
            <Text style={styles.meta}>Due: {dueLabel(item.mustCompleteBefore)}</Text>
            <View style={styles.statusRow}>
              <Text
                style={[
                  styles.pill,
                  status === "Expired" ? styles.pillDanger : styles.pillWarn,
                ]}
              >
                {status}
              </Text>
              <Text style={styles.badge}>
                {status === "Pending" ? "Start" : "Resume"}
              </Text>
            </View>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  list: { padding: 16, gap: 10, paddingBottom: 40 },
  header: { gap: 10, marginBottom: 8 },
  footer: { marginTop: 24, gap: 10 },
  section: {
    fontSize: 12,
    fontWeight: "700",
    color: "#5A6168",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  banner: {
    backgroundColor: "#F8E8E8",
    color: "#5C1E1E",
    padding: 12,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#8F2E2E59",
    overflow: "hidden",
    lineHeight: 20,
  },
  empty: { textAlign: "center", color: "#5A6168", marginVertical: 12 },
  error: { color: "#B33A3A" },
  row: {
    backgroundColor: "#fff",
    borderRadius: 3,
    padding: 14,
    borderWidth: 1,
    borderColor: "#2A2E3320",
    gap: 6,
  },
  name: { fontSize: 16, fontWeight: "600", color: "#1F2328" },
  meta: { fontSize: 13, color: "#2A2E33A6" },
  statusRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pill: {
    fontSize: 11,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
    overflow: "hidden",
  },
  pillWarn: { backgroundColor: "#C89F3D", color: "#1C1A10" },
  pillDanger: { backgroundColor: "#B33A3A", color: "#F4F6F8" },
  badge: { fontSize: 12, color: "#1A5553", fontWeight: "700" },
  btn: {
    backgroundColor: "#2F8F8C",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 3,
  },
  btnText: { color: "#fff", fontWeight: "600" },
});
