# V1 Launch Checklist

## Required Environment Variables

- `DATABASE_URL`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`

## Pre-Launch Checks

- Run `npx prisma migrate deploy` against the production database.
- Run `npm run build`.
- Confirm `/admin` redirects to `/admin/login` when logged out.
- Confirm the admin username and password work.
- Publish a public test writing.
- Follow from a real HTTPS browser session.
- Use `/admin/followers` to confirm the follower endpoint is active.
- Use `/admin/posts` -> `Notify followers` to confirm delivery rows are recorded.
- Confirm public routes work:
  - `/`
  - `/writings`
  - `/writings/[slug]`
  - `/about`
- Confirm disabled future routes return 404:
  - `/subscribe`
  - `/unfiltered`
  - `/request-a-letter`

## Deferred Until After Launch

- Premium payments.
- Unfiltered access and notifications.
- Personal letter tiers and payment flow.
- Email delivery.
- Multi-creator routing and permissions.
