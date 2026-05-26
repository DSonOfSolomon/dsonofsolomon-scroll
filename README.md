This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Production Environment

Required deployment variables:

- `DATABASE_URL`: production Postgres connection string.
- `NEXT_PUBLIC_SITE_URL`: public site URL, for example `https://dsonofsolomon.com`.
- `ADMIN_USERNAME`: admin login username.
- `ADMIN_PASSWORD_HASH`: bcrypt hash for the admin password.
- `ADMIN_SESSION_SECRET`: long random value used to sign the admin session cookie.
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob token for persistent hero and post image uploads.
- `UPSTASH_REDIS_REST_URL`: Upstash Redis REST URL for production rate limiting.
- `UPSTASH_REDIS_REST_TOKEN`: Upstash Redis REST token for production rate limiting.

Generate an admin password hash with:

```bash
npm run hash:admin-password -- "your-admin-password"
```

`ADMIN_PASSWORD` is still supported for local development, but production should use `ADMIN_PASSWORD_HASH` and `ADMIN_SESSION_SECRET`.

Image uploads use Vercel Blob when `BLOB_READ_WRITE_TOKEN` is present. Without it, uploads fall back to `public/uploads` for local development only.

Rate limiting uses Upstash Redis when both Upstash variables are present. Without them, it falls back to in-memory limits for local development only.

Before deploying, copy the shape from `.env.example` into your hosting provider's environment variable settings. Do not commit real production secrets.

## Deployment Checks

Run these before a release:

```bash
npm run db:status
npm audit --audit-level=moderate
npx tsc --noEmit
npm run lint
npm run build
```

The deployment build runs `prisma generate` automatically through the `build` and `postinstall` scripts.

Run production database migrations with:

```bash
npm run db:deploy
```

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
