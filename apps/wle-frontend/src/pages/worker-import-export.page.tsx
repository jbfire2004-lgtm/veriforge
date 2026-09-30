import { useState } from "react";
import { useExportWorkers, useImportWorkers } from "../hooks/use-import-export";

export function WorkerImportExportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const importWorkers = useImportWorkers();
  const exportWorkers = useExportWorkers();

  const handleImport = async () => {
    if (!file) {
      setError("Please select a CSV file first.");
      setMessage(null);
      return;
    }

    setError(null);
    setMessage(null);

    try {
      const result = await importWorkers.mutateAsync(file);
      setMessage(`Imported ${result.importedCount} workers from ${result.receivedRows} rows.`);
    } catch {
      setError("Import failed. Check CSV headers and data format.");
    }
  };

  const handleExport = async () => {
    setError(null);
    setMessage(null);
    try {
      await exportWorkers.mutateAsync();
      setMessage("Worker CSV download started.");
    } catch {
      setError("Export failed.");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Worker Import / Export</h1>

      <section className="rounded-xl border bg-white p-4 md:p-6">
        <h2 className="mb-3 text-lg font-semibold">Import Workers (CSV)</h2>
        <p className="mb-3 text-sm text-slate-600">
          Required headers: firstName, lastName, companyId, orientationStatus, orientationDate
        </p>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm file:mr-4 file:rounded file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-slate-700"
          />
          <button
            onClick={handleImport}
            disabled={importWorkers.isPending}
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-60"
          >
            {importWorkers.isPending ? "Importing..." : "Import Workers"}
          </button>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-4 md:p-6">
        <h2 className="mb-3 text-lg font-semibold">Export Workers (CSV)</h2>
        <button
          onClick={handleExport}
          disabled={exportWorkers.isPending}
          className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white disabled:opacity-60"
        >
          {exportWorkers.isPending ? "Preparing..." : "Download Worker CSV"}
        </button>
      </section>

      {message && <p className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</p>}
      {error && <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    </div>
  );
}
