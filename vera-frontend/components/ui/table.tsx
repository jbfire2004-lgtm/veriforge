import * as React from "react";
import { cn } from "@/src/lib/utils";
import { tableTokens } from "@/lib/design-system/tokens/component-tokens";

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div
    className={tableTokens.wrap}
    role="region"
    aria-label="Data table"
    tabIndex={0}
  >
    <table
      ref={ref}
      className={cn("w-full caption-bottom border-collapse text-sm leading-normal", className)}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(tableTokens.header, "[&_tr]:border-b [&_tr]:border-[var(--table-border)]", className)}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t border-[var(--table-border)] bg-[var(--table-header-bg)] font-medium [&>tr]:last:border-b-0",
      className,
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

type TableRowProps = React.HTMLAttributes<HTMLTableRowElement> & {
  /** Soft safety-blue highlight for active/selected rows */
  selected?: boolean;
  /** Controlled red highlight — critical compliance failures only */
  critical?: boolean;
};

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, selected, critical, ...props }, ref) => (
    <tr
      ref={ref}
      data-state={selected ? "selected" : undefined}
      data-critical={critical ? "true" : undefined}
      className={cn(
        tableTokens.row,
        selected && !critical && tableTokens.rowSelected,
        critical && tableTokens.rowCritical,
        "data-[state=selected]:bg-[var(--table-row-selected)] data-[state=selected]:shadow-[inset_3px_0_0_var(--table-row-selected-rail)]",
        "data-[critical=true]:bg-[var(--table-row-critical)] data-[critical=true]:shadow-[inset_3px_0_0_var(--table-row-critical-rail)]",
        className,
      )}
      {...props}
    />
  ),
);
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(tableTokens.headCell, "[&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(tableTokens.cell, "align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-vera-4 text-sm leading-normal text-[var(--muted-foreground)]", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
