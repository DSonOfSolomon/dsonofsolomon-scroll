# DSonOfSolomon Content Platform

A production-grade creator publishing system built with Next.js, React, TypeScript, Prisma, and PostgreSQL. The project goes beyond a static blog: it includes a custom admin console, multi-universe publishing, series management, reader follows, in-app notifications, image uploads, analytics, subscriber tracking, and operational deployment concerns.

This repository is structured as a full-stack product rather than a marketing page. It demonstrates system design, data modeling, secure admin workflows, performance-aware rendering, and production deployment patterns.

##Stack

**Primary stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Prisma 7, PostgreSQL, Vercel, Vercel Blob, Upstash Redis.

**Supporting tools and libraries:** Server Actions, App Router route handlers, bcryptjs, web-push, React Icons, ESLint, Prisma Migrate.

## Product Scope

The platform supports a creator-owned publishing workflow with multiple content surfaces:

- Public writings for the main Souloverse experience.
- Series and episode publishing with ordered episode metadata.
- Premium/unfiltered content pathways behind feature flags.
- Admin-managed homepage branding, hero images, footer copy, and content taxonomy.
- Reader follow state with follower counts, notification records, and follower administration.
- Letter requests and subscriber records.
- Analytics for page views, post views, reading progress, read completion, and subscriber events.

## Architecture Highlights

### App Router Full-Stack Design

The application uses the Next.js App Router for server-rendered pages, server actions, route handlers, metadata generation, sitemap generation, and protected admin routes.

Key areas:

- `src/app/page.tsx`: public homepage, hero content, featured writings, featured series, follower count.
- `src/app/admin/page.tsx`: admin dashboard and operational overview.
- `src/app/admin/actions.ts`: admin mutations for publishing, branding, notifications, subscribers, and requests.
- `src/app/api/*`: API routes for analytics, followers, notifications, and admin login.
- `src/proxy.ts`: admin route protection.

### Data Model

Prisma models the system around a primary creator and related publishing/audience domains:

- `Creator`: brand, homepage, footer, and ownership root.
- `Post`: content units with status, universe, optional series placement, and publishing metadata.
- `Series`: grouped episodic content.
- `Category`: creator-scoped taxonomy.
- `Follower`: follow state and notification endpoint data.
- `InAppNotification` and `NotificationDelivery`: reader notification state and delivery audit trail.
- `PageView`, `PostView`, and `ReadingSession`: content analytics and reading behavior.
- `Subscriber` and `SubscriberAnalyticsEvent`: audience and conversion tracking.
- `LetterRequest`: inbound reader requests.

The schema uses creator-scoped uniqueness and indexes for production query paths such as published content lookup, follower status counts, notification history, and analytics aggregation.

## Admin System

The admin area is custom-built rather than CMS-dependent. It includes:

- Secure admin login using bcrypt password hashes and HTTP-only cookies.
- Protected admin routes through the Next.js proxy layer.
- Dashboard metrics for posts, published content, drafts, writings, unfiltered content, series, episodes, followers, premium members, letters, and audience reach.
- Post creation/editing with draft and publish states.
- Universe placement for public writings, series episodes, and unfiltered content.
- Series creation and episode assignment inside the post workflow.
- Homepage branding controls, including persistent hero image upload.
- Follower management and notification test hooks.
- Letter request administration.

## Publishing Model

Content is organized around two concepts:

- **Status:** `draft` or `published`.
- **Universe:** `public`, `series`, or `unfiltered`.

This allows the same `Post` model to support ordinary writings, private/premium surfaces, and ordered series episodes without duplicating content logic.

## Image Uploads

Image upload handling is centralized in `src/lib/media.ts`.

Local development writes to `public/uploads`. Production uses Vercel Blob through `BLOB_READ_WRITE_TOKEN`, keeping uploaded media persistent across deployments.

The upload layer validates:

- Supported image types.
- Maximum image size.
- Production storage configuration.
- Blob upload failures with categorized error handling.

## Audience And Notification System

The follow system stores follower state by creator and endpoint. It supports:

- Follow/unfollow API routes.
- Active/inactive follower status.
- Homepage follower count.
- Admin follower list.
- In-app notification creation for published public posts.
- Notification delivery records for auditability.

The follow/unfollow routes revalidate public and admin follower-count surfaces so production pages do not serve stale counts after audience changes.

## Analytics

The app records reader behavior through dedicated analytics models:

- Page views.
- Post views.
- Reading sessions.
- Maximum scroll/read progress.
- Time spent.
- Completed reads.
- Subscriber analytics events.

The admin dashboard summarizes traffic, engagement, read completion, and top-viewed posts.

## Security And Reliability

Security and production hardening are first-class parts of the implementation:

- Admin password hashes are generated with bcrypt.
- Admin session cookies are HTTP-only, same-site, secure in production, and expire after seven days.
- Admin routes are protected at the proxy layer.
- Rate limiting uses Upstash Redis in production with local fallback behavior for development.
- Production uploads require Vercel Blob instead of ephemeral filesystem writes.
- Database migrations are managed through Prisma Migrate.
- Environment secrets are kept out of source control.

## Deployment

The app is designed for Vercel deployment with PostgreSQL, Vercel Blob, and Upstash Redis.

Required production environment variables:

```bash
DATABASE_URL=
NEXT_PUBLIC_SITE_URL=
ADMIN_USERNAME=
ADMIN_PASSWORD_HASH=
ADMIN_SESSION_SECRET=
BLOB_READ_WRITE_TOKEN=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Generate an admin password hash:

```bash
npm run hash:admin-password -- "your-admin-password"
```

Deploy database migrations:

```bash
npm run db:deploy
```

## Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Run linting:

```bash
npm run lint
```

Build for production:

```bash
npm run build
```

Check migration status:

```bash
npm run db:status
```

## Engineering Notes

This project is intentionally custom-built to demonstrate product and systems judgment:

- Data ownership is modeled explicitly through creator-scoped records.
- Publishing workflows use one content model with clear status and universe dimensions.
- Admin operations are server-side and colocated with domain workflows.
- Public pages are server-rendered for SEO and fast first load.
- Operational paths such as uploads, authentication, rate limits, migrations, and cache revalidation are handled as part of the application design.

## Summary

This is a production-grade full-stack publishing platform built around structured content systems, premium-access experiences, and immersive digital writing. The platform includes a custom admin CMS, authentication workflows, subscriber infrastructure, media upload pipelines, gated content architecture, notification systems, SEO optimization, analytics, and production deployment infrastructure.

Designed as a maintainable content ecosystem rather than a traditional blog, with emphasis on scalability, domain separation, and production-aware engineering practices.