<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Vera navigation (required)

All authenticated UI must use the **unified navigation system**:

- `VeraGlobalHeader` + `GlobalNav` on every signed-in page
- `VeraModuleBar` + `ModuleNav` when inside a global module
- `VeraPageLayout` for page title, filters, actions, and content

Shells: `WorkspaceShell` / `VeraAppShell` (workspace) or `SignedInVeraLayout` (hub, welcome, weather).

Config: `lib/navigation/vera-nav-config.ts`. See `docs/VERA-NAVIGATION-ARCHITECTURE.md`.

Do **not** add sidebars, `HubModuleNav`, `AcpNav`, or inline “← back to module” links.
