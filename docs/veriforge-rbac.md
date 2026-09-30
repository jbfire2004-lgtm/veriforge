# VeriForge RBAC

## Permission keys

### Organization
| Key | Description |
|---|---|
| `org.users.manage` | Invite / manage users |
| `org.billing.manage` | Billing & subscription |
| `org.profile.update` | Org profile |
| `org.trial.extend` | Extend trial (Owner) |
| `org.settings.view` | View settings |

### VeriCore
| Key |
|---|
| `vericore.audit.view` / `vericore.audit.edit` |
| `vericore.workers.view` / `vericore.workers.edit` |
| `vericore.credentials.view` / `vericore.credentials.edit` |
| `vericore.compliance.manage` |

### VeriPM
| Key |
|---|
| `veripm.project.view` / `veripm.project.edit` |
| `veripm.task.view` / `veripm.task.edit` |
| `veripm.timeline.view` / `veripm.timeline.edit` |
| `veripm.safety.manage` |

### VeriHub
| Key |
|---|
| `verihub.file.view` / `verihub.file.upload` / `verihub.file.delete` |
| `verihub.collab.view` / `verihub.collab.edit` |
| `verihub.calculators.use` |

## Role mapping

| Role | Scope |
|---|---|
| **Owner** | All org + all module keys (except `platform.admin`) |
| **Admin** | Same as Owner minus `org.trial.extend` |
| **Manager** | Operational edit on enabled modules; no billing/trial; Hub no `file.delete` |
| **User** | View / use only on enabled modules |

Runtime effective permissions:

```
role_permissions ∩ (org.* ∪ platform.* ∪ permissions of org-enabled modules)
```

So disabling VeriPM for an org removes `veripm.*` from JWT refresh / `loadPermissionsForUser` even though the global Manager template still lists them.

## Tables

- `roles` — system templates (Owner/Admin/Manager/User), assigned per org via `user_roles`
- `permissions` — fine-grained keys
- `module_permissions` — module → permission bundle
- `role_permissions` — role → permission ceiling

## Example route

```ts
router.get(
  '/features/vericore/audits',
  requireAuth,
  refreshPermissions(),
  requirePermission('vericore.audit.view'),
  handler,
);
```

Mounted under `/features/*` in the SaaS service.
