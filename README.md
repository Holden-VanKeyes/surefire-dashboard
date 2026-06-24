# SureFire CS Dashboard

Internal dashboard for SureFire CPR customer service agents to monitor live CPR certification sessions. Agents get real-time visibility into learner failures and struggles so they can proactively reach out during a session.

## Stack

- [Next.js 16](https://nextjs.org) (App Router) + TypeScript (strict mode)
- [Mantine](https://mantine.dev) UI + [Tabler Icons](https://tabler.io/icons)
- Tailwind CSS (utility classes only, alongside Mantine)
- [Prisma](https://www.prisma.io) ORM with the `@prisma/adapter-pg` driver adapter
- PostgreSQL (hosted on Railway)
- Slack Incoming Webhooks

## Architecture

A Fleet Management integration (Splashtop-based skills training stations) POSTs session activity events to this app. Those events are persisted to Postgres, aggregated per learner, and surfaced on a polling dashboard so CS agents can spot learners who are struggling or in a critical state.

```text
Fleet Management  --POST-->  /api/webhook/attempt  --upsert/create-->  Postgres
                                      |
                                      └--(if struggling enough)--> Slack alert

Dashboard (/)  --GET, every 30s-->  /api/attempts  --aggregate-->  Postgres
```

### Webhook ingestion — `POST /api/webhook/attempt`

Receives `skills-activity-started` / `skills-activity-ended` events.

- Verifies the request with HMAC-SHA256 over `{timestamp}.{rawBody}`, using a base64-encoded secret (`FLEET_WEBHOOK_SECRET`), constant-time compared, and rejects requests with a timestamp older than 5 minutes. Invalid/missing/stale signatures get a `401`.
- Validates the payload shape; malformed payloads get a `400`.
- Is idempotent — duplicate `requestId`s are detected and skipped (`{ ok: true, duplicate: true }`).
- Upserts a `LearnerSession` (keyed on `userId` + `stationId` + `courseId`) and creates an `ActivityAttempt` row with the full raw payload preserved in `rawPayload`.
- Fires a Slack alert (deferred via `after()` so it doesn't block the response) when a learner crosses the failure threshold or times out/abandons a session.

### Dashboard data — `GET /api/attempts`

Aggregates `ActivityAttempt` rows per `LearnerSession` and returns one summary record per learner, sorted critical-first, then by failure count. See `LearnerAttemptSummary` in [`src/types/attempt.ts`](src/types/attempt.ts) for the exact shape (total/failed attempt counts, most recent activity, debriefings, CPR score, struggling/critical flags, and recent attempt history).

### Dashboard UI — `/`

Server-rendered initial load (reuses the `GET` route handler directly, so there's a single source of truth for the query) + a client component that polls `/api/attempts` every 30 seconds and supports a manual refresh, search, and struggling/critical filters. Clicking a learner card opens a drawer with score, debriefings, and recent attempt history, plus a one-click "email learner" action.

### Slack alerts

`src/lib/slack.ts` sends formatted messages via `@slack/webhook` using `SLACK_WEBHOOK_URL`. There are two paths:

- `sendFleetActivityAlert` — fired automatically from the webhook route for real Fleet events.
- `POST /api/slack` — a standalone endpoint for manually triggering an alert from an arbitrary attempt payload (kept from an earlier mock-data iteration of this dashboard; not used by the live webhook flow).

## Data model

```text
LearnerSession  (one per learner + station + course)
  └── ActivityAttempt[]  (one per skills-activity-started/ended event, requestId is unique)
```

See [`prisma/schema.prisma`](prisma/schema.prisma) for the full schema.

## Environment variables

Create a `.env` file in the project root:

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Postgres connection string (used by Prisma) |
| `FLEET_WEBHOOK_SECRET` | Yes, for the webhook | Base64-encoded HMAC signing secret shared with Fleet Management |
| `SLACK_WEBHOOK_URL` | Optional | Slack Incoming Webhook URL; alerts are skipped (logged, not thrown) if unset |
| `STRUGGLE_THRESHOLD` | No (default `5`) | Failure count at which a learner is flagged as struggling |
| `CRITICAL_THRESHOLD` | No (default `10`) | Failure count at which a learner is flagged as critical |

## Getting started

```bash
npm install

# apply the schema to your database
npx prisma migrate deploy   # or: npx prisma db push

npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts: `npm run build`, `npm run start`, `npm run lint`.

## Project structure

```text
src/
  app/
    page.tsx                     # dashboard page (server component, initial data fetch)
    api/
      attempts/route.ts          # GET — aggregated learner summaries
      webhook/attempt/route.ts   # POST — Fleet Management webhook receiver
      slack/route.ts             # POST — standalone Slack alert sender
  components/                    # Dashboard UI (Mantine)
  lib/                           # prisma client, slack, signature verification, label mappings
  types/                         # Attempt / LearnerAttemptSummary / Fleet webhook payload types
prisma/
  schema.prisma                  # LearnerSession + ActivityAttempt models
  migrations/
```
