"use client";

import { Input, Label, Select } from "@/components/ui";

export type ReportingFilterValues = {
  companyId: string;
  unionHallId: string;
  from: string;
  to: string;
};

type Props = {
  values: ReportingFilterValues;
  onChange: (next: ReportingFilterValues) => void;
  showUnionHall?: boolean;
  showDateRange?: boolean;
};

export function ReportingFilters({
  values,
  onChange,
  showUnionHall,
  showDateRange,
}: Props) {
  function set<K extends keyof ReportingFilterValues>(key: K, value: string) {
    onChange({ ...values, [key]: value });
  }

  return (
    <section className="flex flex-wrap items-end gap-4 rounded-lg border bg-card p-4">
      <section>
        <Label htmlFor="report-company-id">Company ID</Label>
        <Input
          id="report-company-id"
          type="number"
          placeholder="All companies"
          value={values.companyId}
          onChange={(e) => set("companyId", e.target.value)}
          className="w-36"
        />
      </section>
      {showUnionHall && (
        <section>
          <Label htmlFor="report-hall-id">Union hall ID</Label>
          <Input
            id="report-hall-id"
            type="number"
            placeholder="All halls"
            value={values.unionHallId}
            onChange={(e) => set("unionHallId", e.target.value)}
            className="w-36"
          />
        </section>
      )}
      {showDateRange && (
        <>
          <section>
            <Label htmlFor="report-from">From</Label>
            <Input
              id="report-from"
              type="date"
              value={values.from}
              onChange={(e) => set("from", e.target.value)}
            />
          </section>
          <section>
            <Label htmlFor="report-to">To</Label>
            <Input
              id="report-to"
              type="date"
              value={values.to}
              onChange={(e) => set("to", e.target.value)}
            />
          </section>
        </>
      )}
      <section>
        <Label className="sr-only">Reset</Label>
        <Select
          value=""
          onChange={(e) => {
            if (e.target.value === "clear") {
              onChange({ companyId: "", unionHallId: "", from: "", to: "" });
            }
          }}
          className="w-32"
        >
          <option value="">Actions</option>
          <option value="clear">Clear filters</option>
        </Select>
      </section>
    </section>
  );
}

export function filtersToParams(values: ReportingFilterValues) {
  return {
    companyId: values.companyId ? Number(values.companyId) : undefined,
    unionHallId: values.unionHallId ? Number(values.unionHallId) : undefined,
    from: values.from || undefined,
    to: values.to || undefined,
  };
}
