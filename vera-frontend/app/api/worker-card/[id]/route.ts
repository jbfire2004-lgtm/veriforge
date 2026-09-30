import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PDFDocument, rgb } from "pdf-lib";
import { authOptions } from "@/lib/auth-options";
import { apiFetchJson } from "@/lib/api-fetch";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workerId = id;

  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const worker = await apiFetchJson<{
    id: number;
    firstName: string;
    lastName: string;
    company?: { name?: string } | null;
    trainingRecords?: unknown[];
    equipmentAssignments?: unknown[];
  }>(`/workers/${workerId}`, { session });

  if (!worker) {
    return NextResponse.json({ error: "Worker not found" }, { status: 404 });
  }

  const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify/${workerId}`;

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([350, 550]);

  const { width } = page.getSize();

  page.drawText(`${worker.firstName} ${worker.lastName}`, {
    x: 20,
    y: 500,
    size: 18,
    color: rgb(0, 0, 0),
  });

  if (worker.company?.name) {
    page.drawText(worker.company.name, {
      x: 20,
      y: 480,
      size: 12,
      color: rgb(0.2, 0.2, 0.2),
    });
  }

  page.drawText(`Worker ID: ${worker.id}`, {
    x: 20,
    y: 460,
    size: 10,
    color: rgb(0.4, 0.4, 0.4),
  });

  const qrRes = await fetch(
    `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verifyUrl)}`
  );
  const qrBytes = await qrRes.arrayBuffer();
  const qrImage = await pdf.embedPng(qrBytes);

  page.drawImage(qrImage, {
    x: (width - 200) / 2,
    y: 230,
    width: 200,
    height: 200,
  });

  page.drawText(verifyUrl, {
    x: 20,
    y: 210,
    size: 8,
    color: rgb(0.3, 0.3, 0.3),
  });

  page.drawText("Safety Summary:", {
    x: 20,
    y: 180,
    size: 12,
    color: rgb(0, 0, 0),
  });

  const certs = worker.trainingRecords?.length ?? 0;
  const assigns = worker.equipmentAssignments?.length ?? 0;

  page.drawText(`Certifications: ${certs}`, { x: 20, y: 160, size: 10 });

  page.drawText(`Equipment Assigned: ${assigns}`, { x: 20, y: 145, size: 10 });

  const pdfBytes = await pdf.save();

  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${worker.firstName}-${worker.lastName}-card.pdf"`,
    },
  });
}
