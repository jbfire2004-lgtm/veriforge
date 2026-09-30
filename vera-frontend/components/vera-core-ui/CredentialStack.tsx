"use client";

import { CredentialCard, type CredentialCardData } from "./CredentialCard";

type Props = {
  credentials: CredentialCardData[];
  maxVisible?: number;
};

export function CredentialStack({ credentials, maxVisible = 4 }: Props) {
  const visible = credentials.slice(0, maxVisible);

  return (
    <div className="relative mx-auto w-full max-w-sm">
      {visible.map((credential, index) => (
        <div
          key={credential.id}
          className="relative"
          style={{
            marginTop: index === 0 ? 0 : -72,
            zIndex: visible.length - index,
            transform: `scale(${1 - index * 0.03})`,
            opacity: 1 - index * 0.08,
          }}
        >
          <CredentialCard
            credential={credential}
            style={{ ["--i" as string]: index } as React.CSSProperties}
          />
        </div>
      ))}
    </div>
  );
}
