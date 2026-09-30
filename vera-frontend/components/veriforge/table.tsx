import * as React from "react";
import { cn } from "@/src/lib/utils";
import { veriforgeTypography } from "./theme";
import { vfTable } from "./surfaces";

export type VeriForgeColumn<T> = {
  key: keyof T;
  header: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
};

export function VeriForgeTable<T extends Record<string, unknown>>({
  columns,
  rows,
  selectedRowKey,
  onSelectRow,
  sortKey,
  sortDirection = "asc",
  onSort,
  rowKey,
  /** Mark rows as critical compliance failures (controlled red highlight) */
  isCriticalRow,
}: {
  columns: VeriForgeColumn<T>[];
  rows: T[];
  selectedRowKey?: string | number;
  onSelectRow?: (row: T) => void;
  sortKey?: keyof T;
  sortDirection?: "asc" | "desc";
  onSort?: (key: keyof T) => void;
  rowKey: (row: T) => string | number;
  isCriticalRow?: (row: T) => boolean;
}) {
  return (
    <div className={vfTable.wrap}>
      <table className={vfTable.table}>
        <thead className={vfTable.thead}>
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={cn(veriforgeTypography.heading, vfTable.th)}
              >
                {column.sortable ? (
                  <button
                    type="button"
                    onClick={() => onSort?.(column.key)}
                    className={vfTable.sortBtn}
                  >
                    {column.header}
                    {sortKey === column.key
                      ? sortDirection === "asc"
                        ? " ▲"
                        : " ▼"
                      : ""}
                  </button>
                ) : (
                  column.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const key = rowKey(row);
            const selected = selectedRowKey === key;
            const critical = isCriticalRow?.(row) ?? false;
            return (
              <tr
                key={key}
                className={cn(
                  vfTable.row,
                  critical
                    ? vfTable.rowCritical
                    : selected
                      ? vfTable.rowSelected
                      : index % 2 === 0
                        ? vfTable.rowEven
                        : vfTable.rowOdd,
                  onSelectRow && !critical && vfTable.rowHover,
                  onSelectRow && "cursor-pointer",
                )}
                onClick={() => onSelectRow?.(row)}
              >
                {columns.map((column) => (
                  <td key={String(column.key)} className={vfTable.td}>
                    {column.render
                      ? column.render(row[column.key], row)
                      : String(row[column.key] ?? "—")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
