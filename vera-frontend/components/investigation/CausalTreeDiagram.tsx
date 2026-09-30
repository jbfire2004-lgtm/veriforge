"use client";

import { useEffect, useState } from "react";
import { getCausalTree, regenerateCausalTree } from "@/lib/pm-incidents";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type TreeNode = {
  id: string;
  label: string;
  type: "event" | "contributing" | "root" | "pathway";
  pathway?: string;
  children?: TreeNode[];
};

const NODE_COLORS: Record<string, string> = {
  event: "border-[#2A2E33] bg-[#2A2E33] text-white",
  pathway: "border-[#2F8F8C] bg-[#E4F3F2] text-[#2F8F8C]",
  contributing: "border-amber-400 bg-amber-50 text-amber-900",
  root: "border-red-400 bg-red-50 text-red-900",
};

function TreeNodeCard({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  return (
    <div className={depth > 0 ? "border-l-2 border-[#2A2E33]/10 pl-4" : ""}>
      <div
        className={`mb-2 inline-block rounded-lg border px-3 py-1.5 text-xs font-medium ${NODE_COLORS[node.type]}`}
      >
        {node.label}
      </div>
      {node.children?.map((child) => (
        <TreeNodeCard key={child.id} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

type Props = {
  eventId: string;
};

export function CausalTreeDiagram({ eventId }: Props) {
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [busy, setBusy] = useState(false);

  function load() {
    void getCausalTree(eventId).then((t) => setTree(t as TreeNode));
  }

  useEffect(() => {
    load();
  }, [eventId]);

  async function regenerate() {
    setBusy(true);
    try {
      const updated = await regenerateCausalTree(eventId);
      setTree((updated as { causalTreeJson: TreeNode }).causalTreeJson ?? null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#2A2E33]">Root cause map</h3>
        <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => void regenerate()}>
          {busy ? "Regenerating…" : "Regenerate"}
        </Button>
      </div>
      <div className="flex flex-wrap gap-4 text-xs text-[#64748b]">
        {(["event", "pathway", "contributing", "root"] as const).map((t) => (
          <span key={t} className={`rounded px-2 py-0.5 border text-[10px] ${NODE_COLORS[t]}`}>
            {t}
          </span>
        ))}
      </div>
      {!tree ? (
        <Skeleton className="h-32 w-full rounded-xl" />
      ) : (
        <div className="overflow-auto rounded-2xl border border-[#2A2E33]/10 bg-white p-6">
          <TreeNodeCard node={tree} />
        </div>
      )}
    </div>
  );
}
