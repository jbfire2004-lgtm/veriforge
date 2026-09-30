import { NextResponse } from "next/server";

type Body = {
  product?: string;
  manufacturer?: string;
  recallUrl?: string;
  notes?: string;
  submitterEmail?: string;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const product = body.product?.trim();
  const manufacturer = body.manufacturer?.trim();
  const recallUrl = body.recallUrl?.trim();

  if (!product || !manufacturer || !recallUrl) {
    return NextResponse.json(
      { error: "Manufacturer, product, and recall URL are required." },
      { status: 400 },
    );
  }

  try {
    new URL(recallUrl);
  } catch {
    return NextResponse.json({ error: "Invalid recall URL." }, { status: 400 });
  }

  // Log for moderators until a dedicated persistence API is wired.
  console.info("[vera:safety-recall-submission]", {
    product,
    manufacturer,
    recallUrl,
    notes: body.notes?.trim() ?? null,
    submitterEmail: body.submitterEmail?.trim() ?? null,
    at: new Date().toISOString(),
  });

  return NextResponse.json({ status: "queued" });
}
