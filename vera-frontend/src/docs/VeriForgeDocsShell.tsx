"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils";
import {
  VERIFORGE_DOCS_NAV,
  type VeriForgeDocNavSection,
} from "@/src/docs/veriforge-docs-nav";
import styles from "./VeriForgeDocsShell.module.css";

function isActive(pathname: string, slug: string) {
  if (!slug) return pathname === "/veriforge/docs" || pathname === "/veriforge/docs/";
  return pathname === `/veriforge/docs/${slug}` || pathname.startsWith(`/veriforge/docs/${slug}/`);
}

function sectionActive(pathname: string, section: VeriForgeDocNavSection) {
  return section.items.some((item) => isActive(pathname, item.slug));
}

export function VeriForgeDocsShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const pathname = usePathname() || "/veriforge/docs";

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/veriforge/docs" className={styles.brand}>
            <span className={styles.brandMark} aria-hidden />
            <span className={styles.brandText}>VeriForge Docs</span>
          </Link>
          <nav className={styles.headerLinks} aria-label="Docs utilities">
            <Link href="/veriforge/dashboard">Dashboard</Link>
            <Link href="/veriforge">Home</Link>
          </nav>
        </div>
        <div className={styles.headerAccent} aria-hidden />
      </header>

      <div className={styles.body}>
        <aside className={styles.sidebar} aria-label="Documentation">
          <Link
            href="/veriforge/docs"
            className={cn(
              styles.navHome,
              isActive(pathname, "") && styles.navActive,
            )}
            aria-current={isActive(pathname, "") ? "page" : undefined}
          >
            Documentation Home
          </Link>

          {VERIFORGE_DOCS_NAV.map((section) => (
            <div
              key={section.id}
              className={cn(
                styles.navSection,
                sectionActive(pathname, section) && styles.navSectionActive,
              )}
            >
              <div className={styles.navSectionLabel}>{section.label}</div>
              <ul className={styles.navList}>
                {section.items.map((item) => {
                  const active = isActive(pathname, item.slug);
                  return (
                    <li key={item.id}>
                      <Link
                        href={`/veriforge/docs/${item.slug}`}
                        className={cn(styles.navLink, active && styles.navActive)}
                        aria-current={active ? "page" : undefined}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </aside>

        <main className={styles.main} id="vf-docs-content">
          {title ? (
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>{title}</h1>
            </div>
          ) : null}
          <article className={styles.article}>{children}</article>
        </main>
      </div>
    </div>
  );
}

export default VeriForgeDocsShell;
