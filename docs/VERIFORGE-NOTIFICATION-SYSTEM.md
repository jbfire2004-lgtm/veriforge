# VeriForge Notification System

Unified in-app + email notification engine in `services/veriforge-saas-service`.

## Models

| Model | Purpose |
|-------|---------|
| `Notification` | In-app inbox (`channel=in_app`) + legacy email delivery rows |
| `EmailQueue` | Outbound email outbox (`pending` → `sent` / `failed`) |

Notification fields: `type`, `title`, `body` (message), `read`, `orgId`, `userId`, plus delivery fields for cron.

Types: `compliance_expiry`, `scorecard_update`, `billing_issue`, `module_update`, `system_alert`.

## Services

| Service | Methods |
|---------|---------|
| `notification.service` | `createNotification`, `markAsRead`, `getUserNotifications`, `getOrgNotifications` |
| `email.service` | `queueEmail`, `sendQueuedEmails`, `markEmailSent`, `send` (Resend/console) |
| `notification-triggers.service` | compliance expiry, scorecard update, module change, billing issue |
| `notification-dispatch.service` | Cron drain of EmailQueue + queued email Notifications |

## Triggers

- Compliance expiry / warning → org + awarding hiring clients
- Scorecard recalculation (score change) → org
- Module entitlement update → org owner
- Billing past_due / suspend / reactivate → org owner

## HTTP (SaaS)

| Method | Path |
|--------|------|
| GET | `/notifications` |
| GET | `/notifications/org` |
| POST | `/notifications/read` |
| POST | `/notifications/read-all` |
| POST | `/notifications/sendEmail` |

Next proxy: `/api/notifications` → SaaS. tRPC: `notifications.*`.

## UI

- `src/components/notifications/{NotificationBell,NotificationList,NotificationItem}`
- Page: `/notifications` (VeriHub shell)

## Cron

`notificationDispatcher` every 5 minutes runs `dispatchQueued()` → `sendQueuedEmails()`.

Migration: `20260826090000_notification_system`
