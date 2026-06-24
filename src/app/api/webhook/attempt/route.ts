import { NextResponse } from "next/server";
import { Attempt, AttemptStatus, CriticalityLevel, StageType } from "@/types/attempt";
import { upsertMockAttempt } from "@/lib/mock-data";
import { sendSlackAlert, shouldAlert } from "@/lib/slack";

type WebhookPayload = Omit<Attempt, "id" | "createdAt" | "updatedAt">;

const CRITICALITY_LEVELS: CriticalityLevel[] = ["low", "medium", "high", "critical"];
const ATTEMPT_STATUSES: AttemptStatus[] = ["in_progress", "passed", "failed", "abandoned"];
const STAGE_TYPES = Object.values(StageType);

function validatePayload(body: unknown): body is WebhookPayload {
  if (typeof body !== "object" || body === null) return false;
  const payload = body as Record<string, unknown>;

  return (
    typeof payload.userId === "string" &&
    typeof payload.participantName === "string" &&
    typeof payload.contactEmail === "string" &&
    typeof payload.contactPhone === "string" &&
    typeof payload.locationId === "string" &&
    typeof payload.locationName === "string" &&
    typeof payload.startedAt === "string" &&
    typeof payload.failureCount === "number" &&
    Array.isArray(payload.failureReasons) &&
    payload.failureReasons.every((reason) => typeof reason === "string") &&
    STAGE_TYPES.includes(payload.currentStage as StageType) &&
    CRITICALITY_LEVELS.includes(payload.criticality as CriticalityLevel) &&
    ATTEMPT_STATUSES.includes(payload.status as AttemptStatus)
  );
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!validatePayload(body)) {
    return NextResponse.json({ error: "Invalid attempt payload" }, { status: 400 });
  }

  // TODO: swap mock data for real DB call — replace with
  // prisma.attempt.upsert({ where: { userId: body.userId }, ... })
  const attempt = upsertMockAttempt(body);

  if (shouldAlert(attempt)) {
    await sendSlackAlert(attempt);
  }

  return NextResponse.json({ ok: true, attempt });
}
