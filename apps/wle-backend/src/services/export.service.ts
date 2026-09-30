import { prisma } from "../lib/prisma";

function escapeCsv(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export class ExportService {
  async exportWorkersToCSV() {
    const workers = await prisma.worker.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        companyId: true,
        orientationStatus: true,
        lifecycleState: true,
        lastHeartbeat: true,
      },
    });

    const header = [
      "id",
      "firstName",
      "lastName",
      "companyId",
      "orientationStatus",
      "lifecycleState",
      "lastHeartbeat",
    ];

    const lines = workers.map((worker) =>
      [
        worker.id,
        worker.firstName,
        worker.lastName,
        worker.companyId,
        worker.orientationStatus,
        worker.lifecycleState,
        worker.lastHeartbeat ? worker.lastHeartbeat.toISOString() : "",
      ]
        .map((v) => escapeCsv(String(v)))
        .join(","),
    );

    return [header.join(","), ...lines].join("\n");
  }
}
