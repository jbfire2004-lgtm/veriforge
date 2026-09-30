"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  endWorkerAssignment,
  getCompanyWorkers,
  linkWorkerByQr,
  linkWorkerToCompany,
  searchWorkers,
  type CompanyLink,
} from "@/lib/api/vera-core";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type Props = {
  companyId: number;
  initialLinks: CompanyLink[];
};

export function CompanyRosterPanel({ companyId, initialLinks }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [links, setLinks] = useState(initialLinks);
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState<
    { id: number; firstName: string; lastName: string }[]
  >([]);
  const [qrToken, setQrToken] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const data = await getCompanyWorkers(companyId);
    setLinks(data);
    router.refresh();
  }, [companyId, router]);

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQ.trim()) return;
    setBusy(true);
    try {
      const results = (await searchWorkers({ q: searchQ, limit: 10 })) as {
        id: number;
        firstName: string;
        lastName: string;
      }[];
      setSearchResults(results);
    } catch {
      toast({ title: "Search failed", variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function linkWorker(workerId: number) {
    setBusy(true);
    try {
      await linkWorkerToCompany({ workerId, companyId });
      toast({ title: "Worker linked", variant: "success" });
      await refresh();
      setSearchResults([]);
      setSearchQ("");
    } catch (err) {
      toast({
        title: "Link failed",
        description: err instanceof Error ? err.message : undefined,
        variant: "error",
      });
    } finally {
      setBusy(false);
    }
  }

  async function onQrLink(e: React.FormEvent) {
    e.preventDefault();
    if (!qrToken.trim()) return;
    setBusy(true);
    try {
      await linkWorkerByQr(qrToken.trim(), companyId);
      toast({ title: "Worker linked via QR", variant: "success" });
      setQrToken("");
      await refresh();
    } catch (err) {
      toast({
        title: "QR link failed",
        description: err instanceof Error ? err.message : undefined,
        variant: "error",
      });
    } finally {
      setBusy(false);
    }
  }

  async function endAssignment(workerId: number) {
    setBusy(true);
    try {
      await endWorkerAssignment(workerId, companyId);
      toast({ title: "Assignment ended", variant: "success" });
      await refresh();
    } catch {
      toast({ title: "Could not end assignment", variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Add worker</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <form onSubmit={onSearch} className="flex flex-col gap-3">
            <Label htmlFor="search">Search global registry</Label>
            <div className="flex gap-2">
              <Input
                id="search"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Name, email, phone…"
              />
              <Button type="submit" variant="secondary" disabled={busy}>
                Search
              </Button>
            </div>
            {searchResults.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {searchResults.map((w) => (
                  <li
                    key={w.id}
                    className="flex items-center justify-between rounded-lg border border-vera-charcoal/10 px-3 py-2"
                  >
                    <span>
                      {w.firstName} {w.lastName}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="teal"
                      disabled={busy}
                      onClick={() => linkWorker(w.id)}
                    >
                      Link
                    </Button>
                  </li>
                ))}
              </ul>
            ) : null}
          </form>

          <form onSubmit={onQrLink} className="flex flex-col gap-3">
            <Label htmlFor="qr">Scan / paste worker QR</Label>
            <Input
              id="qr"
              value={qrToken}
              onChange={(e) => setQrToken(e.target.value)}
              placeholder="QR token or worker URL"
            />
            <Button type="submit" variant="teal" disabled={busy}>
              Link via QR
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Active roster</CardTitle>
          <Link
            href={`/admin/workers/new?companyId=${companyId}`}
            className={buttonStyles({ variant: "outline", size: "sm" })}
          >
            New worker
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((link) => (
                <TableRow key={link.id}>
                  <TableCell>
                    {link.worker
                      ? `${link.worker.firstName} ${link.worker.lastName}`
                      : `#${link.workerId}`}
                  </TableCell>
                  <TableCell>{link.role ?? link.trade ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={link.active ? "success" : "outline"}>
                      {link.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {link.worker ? (
                      <Link
                        href={`/admin/workers/${link.worker.id}`}
                        className={buttonStyles({ variant: "ghost", size: "sm" })}
                      >
                        Profile
                      </Link>
                    ) : null}
                    {link.active ? (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="ml-2"
                        disabled={busy}
                        onClick={() => endAssignment(link.workerId)}
                      >
                        End
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
