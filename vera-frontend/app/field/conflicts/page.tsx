import { ConflictResolverPanel } from "@/components/field/ConflictResolverPanel";
import Link from "next/link";

export default function FieldConflictsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4">
      <header>
        <h1 className="text-2xl font-semibold">Sync conflicts</h1>
        <p className="text-sm text-muted-foreground">
          Resolve differences between offline edits and server state.
        </p>
        <Link href="/field" className="text-sm text-teal-700 underline">
          Back to field dashboard
        </Link>
      </header>
      <ConflictResolverPanel />
    </div>
  );
}
