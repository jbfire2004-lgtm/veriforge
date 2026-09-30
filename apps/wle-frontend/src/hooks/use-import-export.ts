import { useMutation, useQueryClient } from "@tanstack/react-query";
import { importExportApi } from "../lib/api";

function getFilenameFromDisposition(contentDisposition: string | undefined) {
  if (!contentDisposition) return "workers.csv";
  const match = /filename="?([^"]+)"?/.exec(contentDisposition);
  return match?.[1] ?? "workers.csv";
}

export function useImportWorkers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => (await importExportApi.importWorkers(file)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
      queryClient.invalidateQueries({ queryKey: ["workers", "live"] });
    },
  });
}

export function useExportWorkers() {
  return useMutation({
    mutationFn: async () => {
      const response = await importExportApi.exportWorkers();
      const blob = response.data;
      const filename = getFilenameFromDisposition(response.headers["content-disposition"]);

      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);

      return { success: true };
    },
  });
}
