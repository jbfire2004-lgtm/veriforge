import Link from "next/link";
import { apiGetSafe } from "@/lib/api";
import { VeraPageHeader } from "@/src/components/layout/VeraPageHeader";
import { Card, CardContent, CardHeader, CardTitle, ErrorState, EmptyState } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";

export default async function UnionHallHomePage() {
  const res = await apiGetSafe<{ id: number; name: string; localNumber?: string }[]>(
    "/api/v1/core/union-halls",
  );

  return (
    <>
      <VeraPageHeader title="Union halls" description="Manage members, training, and dispatch." />
      {!res.ok ? (
        <ErrorState title="Could not load union halls" description={res.error} />
      ) : res.data.length === 0 ? (
        <EmptyState title="No union halls" description="Contact Vera admin to register your hall." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {res.data.map((hall) => (
            <Card key={hall.id}>
              <CardHeader>
                <CardTitle>{hall.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {hall.localNumber ? (
                  <p className="text-sm text-vera-muted">Local {hall.localNumber}</p>
                ) : null}
                <Link
                  href={`/union-hall/${hall.id}`}
                  className={buttonStyles({ variant: "teal", size: "sm" })}
                >
                  Open hall
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
