import { NextResponse } from "next/server";
import {
  completeOnboardingStep,
  loadContractorPortalHub,
  submitProgramDocument,
  type OnboardingStepId,
} from "@/lib/contractor-portal-hub";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const contractorCompanyId = Number(
    url.searchParams.get("contractorCompanyId") ?? "",
  );
  const primeCompanyId = Number(url.searchParams.get("primeCompanyId") ?? "");
  const projectId = Number(url.searchParams.get("projectId") ?? "");

  const data = await loadContractorPortalHub({
    contractorCompanyId: Number.isFinite(contractorCompanyId)
      ? contractorCompanyId
      : undefined,
    primeCompanyId: Number.isFinite(primeCompanyId) ? primeCompanyId : undefined,
    projectId: Number.isFinite(projectId) ? projectId : undefined,
  });

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    action?: string;
    contractorCompanyId?: number;
    primeCompanyId?: number;
    stepId?: OnboardingStepId;
    kind?: string;
    title?: string;
    expiresAt?: string | null;
  };

  const contractorCompanyId = Number(body.contractorCompanyId ?? 2);
  const primeCompanyId = Number(body.primeCompanyId ?? 1);

  if (body.action === "complete_step" && body.stepId) {
    completeOnboardingStep(contractorCompanyId, primeCompanyId, body.stepId);
  } else if (body.action === "submit_document") {
    submitProgramDocument({
      contractorCompanyId,
      primeCompanyId,
      kind: body.kind ?? "other",
      title: body.title ?? "Program document",
      expiresAt: body.expiresAt,
    });
  } else {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const data = await loadContractorPortalHub({
    contractorCompanyId,
    primeCompanyId,
  });
  return NextResponse.json(data);
}
