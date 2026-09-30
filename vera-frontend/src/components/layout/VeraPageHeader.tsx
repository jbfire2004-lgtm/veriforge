import { PageHeader, type PageHeaderProps } from "@/components/ui/page-header";

/**
 * @deprecated Prefer importing `PageHeader` from `@/components/ui`.
 * Kept as an alias so the many call-sites that already use `VeraPageHeader`
 * keep working while we migrate.
 */
export const VeraPageHeader = PageHeader;
export type VeraPageHeaderProps = PageHeaderProps;
