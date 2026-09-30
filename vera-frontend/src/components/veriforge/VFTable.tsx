"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { COLORS, SHADOWS } from "@/src/theme/veriforge-tokens";
import { vfTokenVars } from "./utils";
import styles from "./VFTable.module.css";

export type VFTableColumn<T> = {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  width?: string | number;
};

export interface VFTableProps<T extends Record<string, unknown>> {
  columns: VFTableColumn<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string;
  activeRowKey?: string | null;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function VFTable<T extends Record<string, unknown>>({
  columns,
  rows,
  rowKey,
  activeRowKey,
  onRowClick,
  emptyMessage = "No forged records.",
  className,
  style,
}: VFTableProps<T>) {
  return (
    <div
      className={cn(styles.wrap, className)}
      style={vfTokenVars({
        ["--vf-forge-red" as string]: COLORS.forgeRed,
        ["--vf-glow" as string]: SHADOWS.metallicShadow,
        ...style,
      })}
    >
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={styles.th}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className={styles.empty} colSpan={columns.length}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => {
              const key = rowKey(row, index);
              const active = activeRowKey === key;
              return (
                <tr
                  key={key}
                  className={cn(styles.tr, active && styles.trActive)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  style={onRowClick ? { cursor: "pointer" } : undefined}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={styles.td}>
                      {col.render
                        ? col.render(row)
                        : (row[col.key] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default VFTable;
