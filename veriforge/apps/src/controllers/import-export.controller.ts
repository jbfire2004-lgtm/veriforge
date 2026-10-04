import { Request, Response } from "express";
import { ImportService } from "../services/import.service";
import { ExportService } from "../services/export.service";

const importService = new ImportService();
const exportService = new ExportService();

export const ImportExportController = {
  async importWorkers(req: Request, res: Response) {
    if (!req.file?.buffer) {
      return res.status(400).json({ success: false, error: "CSV file is required" });
    }

    try {
      const result = await importService.importWorkers(req.file.buffer);
      return res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to import workers",
      });
    }
  },

  async exportWorkers(_req: Request, res: Response) {
    const csv = await exportService.exportWorkersToCSV();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `workers-${timestamp}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    return res.status(200).send(csv);
  },
};
