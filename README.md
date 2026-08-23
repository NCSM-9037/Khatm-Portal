# Khatm Portal

A private, multi-family Qur'an Khatm tracker.

## Setup Instructions

1. Clone this repository and run `npm install`.
2. Ensure you have your environment variables set up in `.env` and `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL`
   - `DIRECT_URL`

> **Note:** The Supabase project should be created in the **Singapore (`ap-southeast-1`)** region as per project rules.

3. Run Prisma migrations: `npx prisma db push` or `npx prisma migrate dev`.
4. Start the development server: `npm run dev`.

## GitHub Actions

To prevent the Supabase free-tier 7-day inactivity pause, a GitHub Action is configured to run every 3 days. There is also a daily cron job that triggers the automated reminder system for overdue assignments.

> **Important:** You must add the following Repository Secrets in GitHub for the actions to work:
> - `NEXT_PUBLIC_SUPABASE_URL` (for keep-alive)
> - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (for keep-alive)
> - `APP_URL` (The full URL of your deployed app, e.g. `https://khatm-portal.vercel.app`, used by the reminder cron)
> - `CRON_SECRET` (A strong random string matching the `CRON_SECRET` env var in your deployment, used to authenticate the reminder cron)
