"use client";

import { useState } from "react";
import { API_URL } from "@/lib/api-fetch";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Button, Card, CardContent, Input, Label, Select, Textarea } from "@/components/ui";

export default function AdminDocumentUploadPage() {
  const [type, setType] = useState("CERTIFICATION");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");

  const [workerId, setWorkerId] = useState("");
  const [equipmentId, setEquipmentId] = useState("");
  const [companyId, setCompanyId] = useState("");

  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setSubmitting(true);
    await fetch(`${API_URL}/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        name,
        url,
        description,
        workerId: workerId ? Number(workerId) : undefined,
        equipmentId: equipmentId ? Number(equipmentId) : undefined,
        companyId: companyId ? Number(companyId) : undefined,
      }),
    });
    setSubmitting(false);
    alert("Document uploaded");
  }

  return (
    <AdminPageShell
      title="Upload document"
      description="Attach evidence to workers, equipment, or companies."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Upload documents" },
      ]}
    >
      <Card className="max-w-xl border-vera-charcoal/10">
        <CardContent className="space-y-vera-6 p-vera-8">
          <div className="space-y-vera-2">
            <Label htmlFor="doc-type">Document type</Label>
            <Select id="doc-type" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="CERTIFICATION">Certification</option>
              <option value="INSPECTION">Inspection sheet</option>
              <option value="SDS">SDS sheet</option>
              <option value="MANUAL">Manual</option>
              <option value="OTHER">Other</option>
            </Select>
          </div>
          <div className="space-y-vera-2">
            <Label htmlFor="doc-name">Name</Label>
            <Input id="doc-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Document name" />
          </div>
          <div className="space-y-vera-2">
            <Label htmlFor="doc-url">File URL</Label>
            <Input id="doc-url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
          </div>
          <div className="space-y-vera-2">
            <Label htmlFor="doc-desc">Description (optional)</Label>
            <Textarea id="doc-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="space-y-vera-2">
            <Label htmlFor="workerId">Worker ID (optional)</Label>
            <Input id="workerId" value={workerId} onChange={(e) => setWorkerId(e.target.value)} />
          </div>
          <div className="space-y-vera-2">
            <Label htmlFor="equipmentId">Equipment ID (optional)</Label>
            <Input id="equipmentId" value={equipmentId} onChange={(e) => setEquipmentId(e.target.value)} />
          </div>
          <div className="space-y-vera-2">
            <Label htmlFor="companyId">Company ID (optional)</Label>
            <Input id="companyId" value={companyId} onChange={(e) => setCompanyId(e.target.value)} />
          </div>
          <Button type="button" variant="teal" className="w-full" onClick={submit} disabled={submitting}>
            {submitting ? "Uploading…" : "Upload"}
          </Button>
        </CardContent>
      </Card>
    </AdminPageShell>
  );
}
