import { DocumentCard } from "./DocumentCard";

export function DocumentList({ documents }: any) {
  if (!documents || documents.length === 0) {
    return <p className="text-gray-500">No documents</p>;
  }

  return (
    <div className="grid gap-4">
      {documents.map((d: any) => (
        <DocumentCard key={d.id} doc={d} />
      ))}
    </div>
  );
}
