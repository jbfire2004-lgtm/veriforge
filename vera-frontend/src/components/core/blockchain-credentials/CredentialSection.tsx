"use client";

import { CredentialCard } from "./CredentialCard";
import type { BlockchainCredential } from "./types";

export function CredentialSection({
  title,
  credentials,
}: {
  title: string;
  credentials: BlockchainCredential[];
}) {
  return (
    <section className="space-y-3">
      <header className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <span className="text-xs text-slate-500">{credentials.length} total</span>
      </header>

      {credentials.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
          No credentials found.
        </div>
      ) : (
        <div className="space-y-3">
          {credentials.map((credential, index) => (
            <CredentialCard
              key={credential.id ?? credential.tokenId ?? `${credential.type}-${index}`}
              credential={credential}
            />
          ))}
        </div>
      )}
    </section>
  );
}
