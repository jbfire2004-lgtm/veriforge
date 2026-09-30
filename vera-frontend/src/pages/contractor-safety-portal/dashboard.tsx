"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  acknowledgeDispatch,
  acknowledgeFinding,
  completeDispatch,
  getContractorCompliance,
  getContractorPortalDashboard,
  listContractorFindings,
  listContractorInbox,
  listContractorMemberships,
  listContractorSharedReports,
  listPortalMessages,
  listPortalNotifications,
  sendPortalMessage,
  type FindingItem,
  type InboxItem,
  type PortalDashboard,
  type PortalMembership,
  type SharedReportItem,
} from "@/lib/pm-contractor-portal";
import { WorkspaceHero, WorkspaceMetricCard, WorkspaceSection } from "@/components/theme/workspace";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function ContractorSafetyPortalDashboard() {
  const [tab, setTab] = useState("inbox");
  const [summary, setSummary] = useState<PortalDashboard | null>(null);
  const [inbox, setInbox] = useState<InboxItem[]>([]);
  const [findings, setFindings] = useState<FindingItem[]>([]);
  const [compliance, setCompliance] = useState<Awaited<ReturnType<typeof getContractorCompliance>> | null>(null);
  const [messages, setMessages] = useState<Awaited<ReturnType<typeof listPortalMessages>>["messages"]>([]);
  const [notifications, setNotifications] = useState<Awaited<ReturnType<typeof listPortalNotifications>>>([]);
  const [memberships, setMemberships] = useState<PortalMembership[]>([]);
  const [sharedReports, setSharedReports] = useState<SharedReportItem[]>([]);
  const [messageText, setMessageText] = useState("");
  const [selectedMembershipId, setSelectedMembershipId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [dash, inboxRes, findingsRes, complianceRes, msgRes, notifRes, memRes, sharedRes] =
        await Promise.all([
        getContractorPortalDashboard(),
        listContractorInbox(),
        listContractorFindings(),
        getContractorCompliance(),
        listPortalMessages(),
        listPortalNotifications(true),
        listContractorMemberships().catch(() => []),
        listContractorSharedReports().catch(() => ({ total: 0, items: [] })),
      ]);
      setSummary(dash);
      setInbox(inboxRes.items);
      setFindings(findingsRes.items);
      setCompliance(complianceRes);
      setMessages(msgRes.messages);
      setNotifications(notifRes);
      setMemberships(memRes);
      setSharedReports(sharedRes.items);
      if (memRes[0] && !selectedMembershipId) setSelectedMembershipId(memRes[0].id);
    } finally {
      setLoading(false);
    }
  }, [selectedMembershipId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function onAckDispatch(id: string) {
    setBusyId(id);
    try {
      await acknowledgeDispatch(id);
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function onSubmitCorrection(dispatchId: string, file: File) {
    setBusyId(dispatchId);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      await completeDispatch(dispatchId, {
        dataUrl,
        fileName: file.name,
        mimeType: file.type || "image/jpeg",
      });
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function onAckFinding(id: string) {
    setBusyId(id);
    try {
      await acknowledgeFinding(id);
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function onSendMessage() {
    const mem = memberships.find((m) => m.id === selectedMembershipId);
    if (!mem || !messageText.trim()) return;
    setBusyId("send-msg");
    try {
      await sendPortalMessage({
        primeCompanyId: mem.primeCompanyId,
        contractorCompanyId: mem.contractorCompanyId,
        projectId: mem.projectId,
        text: messageText.trim(),
      });
      setMessageText("");
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  const selectedMembership = memberships.find((m) => m.id === selectedMembershipId);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <WorkspaceHero
        title="Contractor Safety Portal"
        description="Corrective action inbox, inspection findings, crew compliance, and direct communication with your prime contractor."
      />

      {loading && !summary ? (
        <Skeleton className="h-24 w-full rounded-2xl" />
      ) : summary ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <WorkspaceMetricCard label="Open actions" value={summary.inbox.total} accent={summary.inbox.overdue ? "warning" : undefined} />
          <WorkspaceMetricCard label="Overdue" value={summary.inbox.overdue} accent="warning" />
          <WorkspaceMetricCard label="Unacknowledged findings" value={summary.findings.unacknowledged} />
          <WorkspaceMetricCard label="Training expired" value={summary.compliance.trainingExpired} accent={summary.compliance.trainingExpired ? "warning" : undefined} />
        </div>
      ) : null}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="inbox">Corrective actions</TabsTrigger>
          <TabsTrigger value="findings">Inspection findings</TabsTrigger>
          <TabsTrigger value="reports">Shared reports</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="comms">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="inbox">
          <WorkspaceSection title="Corrective action inbox">
            <div className="divide-y divide-[#2A2E33]/10 rounded-2xl border border-[#2A2E33]/10 bg-white">
              {inbox.length ? (
                inbox.map((item) => {
                  const overdue = item.overdueAt && new Date(item.overdueAt) < new Date() && item.status !== "completed";
                  return (
                    <div key={item.id} className="space-y-3 px-4 py-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-[#2A2E33]">{item.correctiveAction.title}</p>
                          <p className="text-xs text-[#64748b]">
                            {item.correctiveAction.project?.name ?? "Project"} · Due {formatDate(item.correctiveAction.dueAt)}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={overdue ? "warning" : "outline"}>{item.status.replace(/_/g, " ")}</Badge>
                          {item.correctiveAction.severityLevel ? (
                            <Badge variant="outline">{item.correctiveAction.severityLevel}</Badge>
                          ) : null}
                        </div>
                      </div>
                      {item.correctiveAction.description ? (
                        <p className="text-sm text-[#475569]">{item.correctiveAction.description}</p>
                      ) : null}
                      {item.sourcePhotos?.[0]?.dataUrl ? (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-[#64748b]">Finding photo</p>
                          <img
                            src={item.sourcePhotos[0].dataUrl}
                            alt={item.sourcePhotos[0].fileName ?? "Finding"}
                            className="max-h-40 rounded-lg border object-cover"
                          />
                        </div>
                      ) : null}
                      <div className="flex flex-wrap items-center gap-2">
                        {item.status === "sent" ? (
                          <Button type="button" size="sm" disabled={busyId === item.id} onClick={() => void onAckDispatch(item.id)}>
                            Acknowledge
                          </Button>
                        ) : null}
                        {item.inspectionId ? (
                          <Link
                            href={`/pm/inspections/${item.inspectionId}/report?projectId=${item.correctiveAction.project?.id ?? ""}`}
                            className="text-xs font-medium text-[#2F8F8C] hover:underline"
                          >
                            View inspection report
                          </Link>
                        ) : null}
                        {item.status !== "completed" ? (
                          <label className="inline-flex cursor-pointer items-center rounded-lg border border-[#2F8F8C]/30 bg-[#2F8F8C]/5 px-3 py-1.5 text-xs font-medium text-[#2A2E33] hover:bg-[#2F8F8C]/10">
                            Submit correction photo
                            <Input
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              disabled={busyId === item.id}
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) void onSubmitCorrection(item.id, f);
                                e.target.value = "";
                              }}
                            />
                          </label>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="p-6 text-sm text-[#64748b]">No corrective actions assigned to your company.</p>
              )}
            </div>
          </WorkspaceSection>
        </TabsContent>

        <TabsContent value="findings">
          <WorkspaceSection title="Inspection findings for your crews">
            <div className="divide-y divide-[#2A2E33]/10 rounded-2xl border border-[#2A2E33]/10 bg-white">
              {findings.length ? (
                findings.map((f) => (
                  <div key={f.id} className="flex flex-wrap items-start justify-between gap-3 px-4 py-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#2A2E33]">{f.title}</p>
                      <p className="text-xs text-[#64748b]">
                        {f.inspection?.project?.name ?? "Site"} · {f.severity} · {f.status}
                      </p>
                      {f.description ? <p className="mt-1 text-sm text-[#475569]">{f.description}</p> : null}
                      {f.photo?.dataUrl ? (
                        <img src={f.photo.dataUrl} alt="" className="mt-2 max-h-32 rounded-lg border object-cover" />
                      ) : null}
                    </div>
                    {f.acknowledged ? (
                      <Badge variant="success">Acknowledged</Badge>
                    ) : (
                      <Button type="button" size="sm" disabled={busyId === f.id} onClick={() => void onAckFinding(f.id)}>
                        Acknowledge hazard
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <p className="p-6 text-sm text-[#64748b]">No open findings for your company.</p>
              )}
            </div>
          </WorkspaceSection>
        </TabsContent>

        <TabsContent value="reports">
          <WorkspaceSection title="Shared inspection reports">
            <div className="divide-y divide-[#2A2E33]/10 rounded-2xl border border-[#2A2E33]/10 bg-white">
              {sharedReports.length ? (
                sharedReports.map((r) => (
                  <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
                    <div>
                      <p className="text-sm font-medium text-[#2A2E33]">{r.title}</p>
                      <p className="text-xs text-[#64748b]">
                        {r.project?.name ?? "Project"} · {formatDate(r.submittedAt ?? undefined)}
                      </p>
                    </div>
                    <Link
                      href={`/pm/inspections/${r.id}/report?projectId=${r.project?.id ?? ""}`}
                      className="text-sm font-medium text-[#2F8F8C] hover:underline"
                    >
                      View report
                    </Link>
                  </div>
                ))
              ) : (
                <p className="p-6 text-sm text-[#64748b]">
                  No reports shared with your company yet. Your prime contractor can enable sharing
                  from a completed inspection.
                </p>
              )}
            </div>
          </WorkspaceSection>
        </TabsContent>

        <TabsContent value="compliance">
          <WorkspaceSection title="Compliance dashboard">
            {!compliance ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <WorkspaceMetricCard label="Workers" value={compliance.summary.workersTotal} />
                  <WorkspaceMetricCard label="Certs expiring (30d)" value={compliance.summary.trainingExpiringSoon + compliance.summary.credentialsExpiringSoon} />
                  <WorkspaceMetricCard label="Equipment gaps" value={compliance.summary.equipmentNonCompliant} accent={compliance.summary.equipmentNonCompliant ? "warning" : undefined} />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-[#2A2E33]/10 bg-white p-4">
                    <h4 className="text-sm font-medium text-[#2A2E33]">Training — expired</h4>
                    <ul className="mt-2 space-y-1 text-sm text-[#64748b]">
                      {compliance.training.expired.length ? (
                        compliance.training.expired.slice(0, 8).map((t: { id?: number; worker?: { firstName: string; lastName: string }; certification?: { name: string } }, i) => (
                          <li key={i}>
                            {t.worker ? `${t.worker.firstName} ${t.worker.lastName}` : "Worker"} — {t.certification?.name ?? "Training"}
                          </li>
                        ))
                      ) : (
                        <li>None</li>
                      )}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-[#2A2E33]/10 bg-white p-4">
                    <h4 className="text-sm font-medium text-[#2A2E33]">Equipment — non-compliant</h4>
                    <ul className="mt-2 space-y-1 text-sm text-[#64748b]">
                      {compliance.equipment.nonCompliant.length ? (
                        compliance.equipment.nonCompliant.slice(0, 8).map((e: { equipment?: { name: string } }, i) => (
                          <li key={i}>{e.equipment?.name ?? "Equipment"}</li>
                        ))
                      ) : (
                        <li>All compliant</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </WorkspaceSection>
        </TabsContent>

        <TabsContent value="comms">
          <div className="grid gap-6 lg:grid-cols-2">
            <WorkspaceSection title="Messages">
              {memberships.length ? (
                <div className="mb-4 space-y-2">
                  <label className="text-xs font-medium text-[#64748b]">Prime contractor</label>
                  <select
                    className="w-full rounded-xl border border-[#2A2E33]/15 px-3 py-2 text-sm"
                    value={selectedMembershipId}
                    onChange={(e) => setSelectedMembershipId(e.target.value)}
                  >
                    {memberships.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.primeCompany.name}
                        {m.project ? ` — ${m.project.name}` : ""}
                      </option>
                    ))}
                  </select>
                  <Textarea
                    placeholder={`Message ${selectedMembership?.primeCompany.name ?? "prime contractor"}…`}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                  />
                  <Button type="button" size="sm" disabled={busyId === "send-msg" || !messageText.trim()} onClick={() => void onSendMessage()}>
                    Send
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-[#64748b]">No prime contractor link configured yet.</p>
              )}
              <div className="max-h-80 divide-y divide-[#2A2E33]/10 overflow-y-auto rounded-xl border">
                {messages.length ? (
                  messages.map((m) => (
                    <div key={m.id} className="px-3 py-2">
                      <p className="text-xs text-[#64748b]">
                        {m.sender.username} · {formatDate(m.createdAt)}
                        {m.primeCompany ? ` · ${m.primeCompany.name}` : ""}
                      </p>
                      <p className="text-sm text-[#2A2E33]">{m.body}</p>
                    </div>
                  ))
                ) : (
                  <p className="p-4 text-sm text-[#64748b]">No messages yet.</p>
                )}
              </div>
            </WorkspaceSection>

            <WorkspaceSection title="Notifications">
              <div className="divide-y divide-[#2A2E33]/10 rounded-xl border bg-white">
                {notifications.length ? (
                  notifications.map((n) => (
                    <div key={n.id} className="px-4 py-3">
                      <p className="text-sm font-medium text-[#2A2E33]">{n.title}</p>
                      <p className="text-xs text-[#64748b]">{n.body}</p>
                    </div>
                  ))
                ) : (
                  <p className="p-4 text-sm text-[#64748b]">No unread notifications.</p>
                )}
              </div>
            </WorkspaceSection>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
