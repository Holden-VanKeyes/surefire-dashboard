@AGENTS.md

# SureFire CS Dashboard

## Project Purpose

Internal dashboard for SureFire CPR customer service agents to monitor live CPR
certification skills lab sessions in real time. Agents get visibility into
struggling learners before they call in frustrated — enabling proactive outreach
instead of reactive damage control.

## Stack

- Next.js 16 (App Router)
- TypeScript (strict mode)
- Tailwind CSS + Mantine UI
- Prisma ORM v6 + PostgreSQL (Railway)
- Slack Incoming Webhooks

## Architecture

### Data Flow

Laerdal Fleet Management → POST /api/webhook/attempt → Postgres → Dashboard

- Webhook receiver at `POST /api/webhook/attempt`
- Receives `skills-activity-started` and `skills-activity-ended` events
- HMAC-SHA256 signature verification via `X-Fleet-Signature-256` header
- Upserts `LearnerSession` and creates `ActivityAttempt` per event
- Full raw payload stored in `rawPayload` Json field for future use
- Dashboard polls `GET /api/attempts` every 60 seconds
- Slack alert fires when critical threshold is reached

### Key Design Decisions

- `LearnerSession` is unique on `(userId, stationId, courseId)` — one session
  per learner per station per course
- `requestId` is unique on `ActivityAttempt` for idempotency — duplicate
  webhook deliveries are safely ignored
- `rawPayload` stores the full Fleet Management payload — avoids data loss
  from schema assumptions, queryable later without migration
- Failure counting uses only `skills-activity-ended` events with
  `activityCompleted === false` — started events are excluded to avoid
  double-counting
- Two-tier alert system: Struggling (STRUGGLE_THRESHOLD) and Critical
  (CRITICAL_THRESHOLD) — configurable via env vars

## Data Model

### LearnerSession

One record per learner per station per course. Upserted on each webhook event.

### ActivityAttempt

One record per webhook event. Links back to LearnerSession via sessionId.
Both started and ended events are stored — ended events contain rich scoring
data in rawPayload.

## Environment Variables

DATABASE_URL= # Internal Railway Postgres URL
DATABASE_PUBLIC_URL= # Public URL for local development
FLEET_WEBHOOK_SECRET= # HMAC signing secret from Fleet Management
SLACK_WEBHOOK_URL= # Slack incoming webhook URL

## Conventions

- API routes in `/src/app/api/`
- Components in `/src/components/`
- Lib/utils in `/src/lib/`
- Types in `/src/types/`
- Mantine for all UI components
- Tabler icons
- No `any` types — use proper interfaces
- Mock data in `/src/lib/mock-data.ts` (retained for local dev without webhook)

## Key Files

- `src/app/api/webhook/attempt/route.ts` — webhook receiver, HMAC verification,
  DB upsert, Slack trigger
- `src/app/api/attempts/route.ts` — dashboard data query, aggregation logic
- `src/lib/fleet-signature.ts` — HMAC-SHA256 verification
- `src/lib/slack.ts` — Slack alert formatting and delivery
- `src/lib/prisma.ts` — Prisma client singleton
- `src/components/Dashboard.tsx` — main dashboard, filter/search state
- `src/components/AttemptCard.tsx` — learner card with email action
- `src/components/LearnerDrawer.tsx` — detail drawer with score, history,
  debriefings
- `prisma/schema.prisma` — LearnerSession + ActivityAttempt models

## What I'd Build Next

- Configurable threshold UI — CS managers adjust struggle/critical thresholds
  without touching env vars
- Slack/email notification on critical threshold — proactive alert before
  the call comes in
- Enrich contact info — join on SureFire's user DB by user_id to surface
  phone numbers
- Regional filtering — CS agents scoped to their location group
- Session timeout detection — flag learners who started but never finished
- Phone number in payload — request Laerdal add to webhook
