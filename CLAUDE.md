@AGENTS.md

# SureFire CS Dashboard

## Project Purpose

Internal dashboard for SureFire CPR customer service agents to monitor live CPR certification test sessions. Agents need visibility into participant failures and struggles in real time so they can proactively handle calls and interventions.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Mantine UI components
- Prisma ORM
- PostgreSQL (Railway)
- Slack Incoming Webhooks

## Architecture

- Webhook receiver at POST /api/webhook/attempt — receives payload from Splashtop via SureFire's existing integration
- Prisma upserts incoming data into Postgres
- Dashboard polls GET /api/attempts every 30 seconds
- Slack alert fires when failure threshold is reached (3+ failures or critical flag)

## Data Shape (assumed — to be confirmed day-of)

Attempt object:

- userId / participantName
- contactEmail / contactPhone
- locationId / locationName
- currentStage (e.g. adult_chest, infant_breathing)
- startedAt timestamp
- failureCount
- failureReasons (array of strings)
- criticality (low / medium / high / critical)
- status (in_progress / passed / failed / abandoned)

## Conventions

- All mock data lives in /src/lib/mock-data.ts
- API routes in /src/app/api/
- Components in /src/components/
- Lib/utils in /src/lib/
- Use Mantine for all UI components
- Use Tabler icons
- TypeScript strict mode — no any types
- All data fetching uses mock data until explicitly told otherwise
