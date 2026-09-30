# VeriForge 7-day trial & onboarding workflow

## Lifecycle

```
Signup
  → enable selected modules
  → trial_start=now, trial_end=now+7d, is_trial_active=true
  → subscription.status=trialing  (product “trial”)
  → onboardings row (not_started)
  → emails: welcome (customer) + founder_new_trial (PLATFORM_ADMIN_EMAILS)

Day 5 (or ≤2 days left)
  → trial_ending_soon email (once)

Day 7 / trial_end
  → if no active/past_due subscription:
       is_trial_active=false, org suspended, modules locked, sub canceled
  → trial_ended email (once)

Paid convert anytime
  → subscription.active → trial flips off without lock
```

## Idempotency

| Concern | Mechanism |
|---|---|
| Emails | `trial_notification_logs` unique `(org_id, kind)` — claim-then-send |
| Onboarding row | `onboardings.org_id` unique — create is no-op if exists |
| Trial start | Skip if `is_trial_active` already true |
| Extend trial | Clears `trial_ending_soon` / `trial_ended` logs so reminders can fire again |

## Data model

**`onboardings`**: `org_id`, `status` (`not_started`\|`in_progress`\|`completed`), `notes`, `checklist`, `assigned_to`, timestamps  

**`trial_notification_logs`**: `org_id`, `kind`, `recipient_email`, `sent_at`

## Jobs

- Daily `09:15 UTC`: `checkAndExpireTrials()` + `sendTrialNotifications()`
- Hourly `:20`: expiry safety net
- Boot +5s: one catch-up run (dev-friendly)

## API

- `GET /organizations/:orgId/trial`
- `GET /admin/onboarding`
- `PATCH /admin/onboarding/:orgId` — `{ status, notes, checklist, assignedTo }`

## Email

Without `RESEND_API_KEY`, messages are logged (console provider). Set Resend + `EMAIL_FROM` + `APP_PUBLIC_URL` for production.
