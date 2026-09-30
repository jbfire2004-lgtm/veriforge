"use client";

import { PmInspectionTemplateBuilder } from "@/components/inspection/PmInspectionTemplateBuilder";

export default function PmInspectionTemplatesBuilderPage({
  projectId = 1,
  companyId = 1,
  templateId,
}: {
  projectId?: number;
  companyId?: number;
  templateId?: string;
}) {
  return (
    <PmInspectionTemplateBuilder
      companyId={companyId}
      projectId={projectId}
      templateId={templateId}
    />
  );
}
