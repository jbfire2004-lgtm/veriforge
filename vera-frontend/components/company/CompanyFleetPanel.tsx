"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getCompanyEquipment,
  linkEquipmentByQr,
  linkEquipmentToCompany,
  type EquipmentLink,
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
import { apiGet } from "@/lib/api";

type Props = {
  companyId: number;
  initialLinks: EquipmentLink[];
};

export function CompanyFleetPanel({ companyId, initialLinks }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [links, setLinks] = useState(initialLinks);
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState<
    { id: number; name: string; serialNumber?: string | null }[]
  >([]);
  const [qrToken, setQrToken] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const data = await getCompanyEquipment(companyId);
    setLinks(data);
    router.refresh();
  }, [companyId, router]);

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQ.trim()) return;
    setBusy(true);
    try {
      const qs = new URLSearchParams({ q: searchQ, limit: "10" });
      const results = (await apiGet<unknown[]>(
        `/api/v1/core/equipment/search?${qs}`,
      )) as { id: number; name: string; serialNumber?: string | null }[];
      setSearchResults(results);
    } catch {
      toast({ title: "Search failed", variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function linkEquipment(equipmentId: number) {
    setBusy(true);
    try {
      await linkEquipmentToCompany(equipmentId, companyId);
      toast({ title: "Equipment linked", variant: "success" });
      await refresh();
      setSearchResults([]);
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
      await linkEquipmentByQr(qrToken.trim(), companyId);
      toast({ title: "Equipment linked via QR", variant: "success" });
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

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Add equipment</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <form onSubmit={onSearch} className="flex flex-col gap-3">
            <Label htmlFor="eq-search">Search global registry</Label>
            <div className="flex gap-2">
              <Input
                id="eq-search"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Name, serial, asset tag…"
              />
              <Button type="submit" variant="secondary" disabled={busy}>
                Search
              </Button>
            </div>
            {searchResults.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {searchResults.map((eq) => (
                  <li
                    key={eq.id}
                    className="flex items-center justify-between rounded-lg border border-vera-charcoal/10 px-3 py-2"
                  >
                    <span>
                      {eq.name}
                      {eq.serialNumber ? ` · ${eq.serialNumber}` : ""}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="teal"
                      disabled={busy}
                      onClick={() => linkEquipment(eq.id)}
                    >
                      Link
                    </Button>
                  </li>
                ))}
              </ul>
            ) : null}
          </form>
          <form onSubmit={onQrLink} className="flex flex-col gap-3">
            <Label htmlFor="eq-qr">Scan / paste equipment QR</Label>
            <Input
              id="eq-qr"
              value={qrToken}
              onChange={(e) => setQrToken(e.target.value)}
              placeholder="QR token or JSON payload"
            />
            <Button type="submit" variant="teal" disabled={busy}>
              Link via QR
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Active fleet</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipment</TableHead>
                <TableHead>Compliance</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((link) => (
                <TableRow key={link.id}>
                  <TableCell>
                    {link.equipment?.name ?? `#${link.equipmentId}`}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        link.complianceStatus === "COMPLIANT" ? "success" : "danger"
                      }
                    >
                      {link.complianceStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {link.equipment ? (
                      <Link
                        href={`/admin/equipment/${link.equipment.id}`}
                        className={buttonStyles({ variant: "ghost", size: "sm" })}
                      >
                        Detail
                      </Link>
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
