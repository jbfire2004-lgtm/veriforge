"use client";

import { memo, useMemo, useState } from "react";
import Link from "next/link";
import { SearchX } from "lucide-react";
import {
  SmsBadge,
  SmsButton,
  SmsEmptyState,
  SmsInput,
  SmsSection,
  SmsSelect,
  SmsSkeleton,
} from "@/src/components/sms/design-system";
import {
  statusBadgeTone,
  type SmsRecordRow,
  type SmsRecordStatus,
  type SmsRecordType,
} from "./sms-landing-config";

type Props = {
  records: SmsRecordRow[];
  loading?: boolean;
};

const ALL_TYPES = "all";
const ALL_STATUSES = "all";
const PAGE_SIZE = 15;

const RecordMobileCard = memo(function RecordMobileCard({ row }: { row: SmsRecordRow }) {
  return (
    <li className="sms-list-card sms-list-card-interactive [content-visibility:auto]">
      <div className="flex items-start justify-between gap-2">
        <span className="sms-text-label">{row.type}</span>
        <SmsBadge tone={statusBadgeTone(row.status)}>{row.status}</SmsBadge>
      </div>
      <Link
        href={row.href}
        className="sms-tap-target sms-text-h3 text-[var(--sms-secondary)] hover:underline"
      >
        {row.title}
      </Link>
      <p className="sms-text-caption">{formatUpdated(row.updatedAt)}</p>
    </li>
  );
});

/** Section 3 — searchable, filterable recent SMS activity. */
export function SmsRecordsHistorySection({ records, loading }: Props) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>(ALL_TYPES);
  const [statusFilter, setStatusFilter] = useState<string>(ALL_STATUSES);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const types = useMemo(() => {
    const set = new Set<SmsRecordType>();
    records.forEach((r) => set.add(r.type));
    return [...set].sort();
  }, [records]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records
      .filter((r) => {
        if (typeFilter !== ALL_TYPES && r.type !== typeFilter) return false;
        if (statusFilter !== ALL_STATUSES && r.status !== statusFilter) return false;
        if (!q) return true;
        return (
          r.title.toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q) ||
          r.status.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  }, [records, search, typeFilter, statusFilter]);

  const visible = filtered.slice(0, visibleCount);
  const hasFilters =
    search.trim() !== "" || typeFilter !== ALL_TYPES || statusFilter !== ALL_STATUSES;

  return (
    <SmsSection
      title="Records & History"
      description="Recent activity across FLHA, inspections, CAPA, and investigations."
    >
      <div className="flex flex-col gap-[var(--sms-space-3)]">
        <SmsInput
          label="Search"
          placeholder="Title or reference…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setVisibleCount(PAGE_SIZE);
          }}
          className="w-full"
          aria-label="Search records"
        />
        <div className="grid grid-cols-1 gap-[var(--sms-space-3)] sm:grid-cols-2">
          <SmsSelect
            label="Type"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
          >
            <option value={ALL_TYPES}>All types</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </SmsSelect>
          <SmsSelect
            label="Status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
          >
            <option value={ALL_STATUSES}>All statuses</option>
            {(["Draft", "In Progress", "Submitted", "Closed", "Other"] as SmsRecordStatus[]).map(
              (s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ),
            )}
          </SmsSelect>
        </div>
      </div>

      {loading ? (
        <SmsSkeleton className="h-48" aria-label="Loading records" />
      ) : records.length === 0 ? (
        <SmsEmptyState
          title="No records yet"
          description="Start a quick action above to create your first FLHA, inspection, or CAPA."
        />
      ) : filtered.length === 0 ? (
        <SmsEmptyState
          icon={SearchX}
          title="No matches"
          description="Try clearing filters or broadening your search."
          action={
            <SmsButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearch("");
                setTypeFilter(ALL_TYPES);
                setStatusFilter(ALL_STATUSES);
                setVisibleCount(PAGE_SIZE);
              }}
            >
              Clear filters
            </SmsButton>
          }
        />
      ) : (
        <>
          <div className="hidden md:block">
            <div className="sms-table-wrap">
              <table className="sms-table">
                <thead>
                  <tr>
                    <th scope="col">Type</th>
                    <th scope="col">Title</th>
                    <th scope="col">Status</th>
                    <th scope="col">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((row) => (
                    <tr key={`${row.type}-${row.id}`}>
                      <td>{row.type}</td>
                      <td>
                        <Link
                          href={row.href}
                          className="font-medium text-[var(--sms-secondary)] hover:underline"
                        >
                          {row.title}
                        </Link>
                      </td>
                      <td>
                        <SmsBadge tone={statusBadgeTone(row.status)}>{row.status}</SmsBadge>
                      </td>
                      <td className="sms-text-caption whitespace-nowrap">
                        {formatUpdated(row.updatedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <ul className="space-y-[var(--sms-space-3)] md:hidden" aria-label="Recent records">
            {visible.map((row) => (
              <RecordMobileCard key={`${row.type}-${row.id}-m`} row={row} />
            ))}
          </ul>

          {filtered.length > visibleCount ? (
            <div className="flex justify-center pt-2">
              <SmsButton
                type="button"
                variant="secondary"
                className="sms-tap-target w-full sm:w-auto"
                onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
              >
                Show more ({filtered.length - visibleCount} remaining)
              </SmsButton>
            </div>
          ) : hasFilters ? (
            <p className="sms-text-caption text-center text-[var(--sf-text-muted)]">
              Showing {filtered.length} of {records.length} records
            </p>
          ) : null}
        </>
      )}
    </SmsSection>
  );
}

function formatUpdated(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
