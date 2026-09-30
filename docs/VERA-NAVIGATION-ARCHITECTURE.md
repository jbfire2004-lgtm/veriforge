# Vera Navigation & Page Layout — Official Standard

Unified navigation and page layout for every Vera surface.

## Page layout (top → bottom)

```
┌──────────────────────────────────────────────────────────────┐
│ 1. GLOBAL HEADER (VeraGlobalHeader)                          │
│    VERA logo │ [Navigate Vera ▼]          … │ user menu      │
├──────────────────────────────────────────────────────────────┤
│ 2. MODULE BAR (VeraModuleBar) — only when inside a module    │
│    🏗 Workers │ [Active workers ▼]              [+ Add worker]│
├──────────────────────────────────────────────────────────────┤
│ 3. Breadcrumbs (optional trail)                              │
├──────────────────────────────────────────────────────────────┤
│ 4. MAIN CONTENT (VeraPageLayout)                             │
│    Page title · description · filters · content · actions    │
├──────────────────────────────────────────────────────────────┤
│ 5. FOOTER (optional)                                         │
└──────────────────────────────────────────────────────────────┘
```

## Components

| Component | Alias | Layer | Purpose |
|-----------|-------|-------|---------|
| `VeraGlobalHeader` | `Header` | 1 | Logo + global module dropdown + account actions |
| `VeraGlobalNavDropdown` | `GlobalNav` | 1 | Master module switchboard |
| `VeraModuleBar` | `ModuleHeader` | 2 | Module name + feature dropdown + quick action |
| `VeraModuleFeatureDropdown` | `ModuleNav` | 2 | Features inside current module |
| `VeraContentContainer` | `ContentContainer` | 3 | Padded main content region |
| `VeraPageLayout` | `PageLayout` | 3–4 | Title, filters, actions, content, footer |
| `VeraPlatformChrome` | — | 1–2 | Header + module bar composite |
| `VeraNavDropdown` | — | — | Accessible shared dropdown UI |

Location: `src/components/navigation/`

Config: `lib/navigation/vera-nav-config.ts`

## Global modules (fixed, never hidden)

1. Vera Hub  
2. Vera Core  
3. Vera PM  
4. FieldOS  
5. VeriAgent  
6. VeriForge  
7. Companies  
8. Workers  
9. Equipment  
10. Training  
11. Compliance  
12. Union Halls  
13. Training Providers  
14. Reports  
15. Settings  

Hub, Core, PM, FieldOS, and VeriAgent are also pinned as always-visible product links in `VeraGlobalHeader` (`VeraPrimaryProductRail`). The remaining modules stay in **Navigate Vera**. Do not hide modules by role. 

## UX rules

| Rule | Implementation |
|------|----------------|
| Top dropdown = switch modules | `GlobalNav` in header, same position everywhere |
| Module dropdown = internal features | `ModuleNav` in module bar only |
| ≤ 2 clicks to any major area | Flat feature lists, no deep nesting |
| No sidebars / tab soup | Sidebar removed from `VeraAppShell` |
| Active state obvious | Bold label + checkmark in menus |
| Scalable | Add module/feature in `vera-nav-config.ts` only |

## Accessibility

- Tab to focus dropdown trigger  
- Arrow Up/Down to move between items  
- Home/End for first/last item  
- Escape closes menu and returns focus to trigger  
- Visible focus rings on all interactive elements  

## Layout shells

| Shell | Use for |
|-------|---------|
| `VeraAppShell` / `WorkspaceShell` | PM, admin, core, workers, equipment, field |
| `SignedInVeraLayout` / `VeraSignedInShell` | Welcome, hub, weather, briefing, calculators |
| `VeraAlwaysOnChrome` | VeriForge, VeriAgent (header without NextAuth) |
| `HubSiteHeader` | Hub pages (wraps global + module bar) |

## Usage in pages

```tsx
import { VeraPageLayout } from "@/src/components/navigation";

export default function MyPage() {
  return (
    <VeraPageLayout
      title="Active workers"
      description="Manage worker profiles and compliance."
      actions={<Button>Add worker</Button>}
      filters={<SearchInput />}
    >
      {/* tables, forms, dashboards */}
    </VeraPageLayout>
  );
}
```

Navigation chrome is injected automatically by `VeraAppShell` / `WorkspaceShell` — pages do not render their own global nav.

## Integration points

- `VeraAppShell` — all workspace, admin, core, supervisor layouts  
- `HubSiteHeader` — Hub uses same header + module bar  
- `WorkspaceShell` — server wrapper; inherits shell automatically  

## Adding a new feature

1. Add route under a module prefix (`/pm/...`, `/core/...`, etc.)  
2. Add entry to `VERA_GLOBAL_MODULES[n].features` in `vera-nav-config.ts`  
3. Wrap page content in `VeraPageLayout`  
4. Do **not** add custom nav, sidebars, or tab bars  
