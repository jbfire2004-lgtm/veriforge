"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Input, Label, Select } from "@/components/ui";

export type CompanyOption = { id: number; name: string };

type Props = {
  companies: CompanyOption[];
  value: string;
  onChange: (companyId: string) => void;
  disabled?: boolean;
  locked?: boolean;
  lockedLabel?: string;
  addCompanyHref?: string;
  id?: string;
};

/** Searchable company picker for admin and PM workflows. */
export function CompanySelectField({
  companies,
  value,
  onChange,
  disabled,
  locked,
  lockedLabel,
  addCompanyHref = "/admin/companies/new",
  id = "company-select",
}: Props) {
  const [search, setSearch] = useState("");

  const selected = useMemo(
    () => companies.find((c) => String(c.id) === value),
    [companies, value],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        String(c.id).includes(q),
    );
  }, [companies, search]);

  const addCompanyLink = addCompanyHref ? (
    <Link href={addCompanyHref} className="font-medium text-teal-700 underline">
      Add company
    </Link>
  ) : null;

  if (companies.length === 0) {
    return (
      <div className="space-y-2">
        <Label htmlFor={id}>Company</Label>
        <p className="text-sm text-red-600">
          No companies found.{" "}
          {addCompanyLink ?? "Create a company before continuing."}
        </p>
      </div>
    );
  }

  if (locked || companies.length === 1) {
    const display = selected ?? companies[0]!;
    return (
      <div className="space-y-1.5">
        <Label htmlFor={id}>Company</Label>
        <p
          id={id}
          className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800"
        >
          {display.name} <span className="text-slate-500">(#{display.id})</span>
        </p>
        {lockedLabel ? (
          <p className="text-xs text-slate-500">{lockedLabel}</p>
        ) : locked ? (
          <p className="text-xs text-slate-500">Your organization is pre-selected.</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label htmlFor={id}>Company</Label>
        {addCompanyLink ? (
          <span className="text-xs">{addCompanyLink}</span>
        ) : null}
      </div>
      <Input
        type="search"
        placeholder="Search by name or ID…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        disabled={disabled}
        aria-label="Search companies"
      />
      <Select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">Select company…</option>
        {filtered.map((c) => (
          <option key={c.id} value={String(c.id)}>
            {c.name} (#{c.id})
          </option>
        ))}
      </Select>
      {filtered.length === 0 && search.trim() !== "" ? (
        <p className="text-xs text-slate-500">
          No companies match &quot;{search.trim()}&quot;.{" "}
          {addCompanyLink}
        </p>
      ) : (
        <p className="text-xs text-slate-500">
          {companies.length} active {companies.length === 1 ? "company" : "companies"} in directory
        </p>
      )}
    </div>
  );
}
