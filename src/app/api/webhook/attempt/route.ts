import { NextResponse, after } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifyFleetSignature } from "@/lib/fleet-signature";
import { sendFleetActivityAlert } from "@/lib/slack";
import { FleetWebhookData, FleetWebhookPayload } from "@/types/fleet-webhook";

const FLEET_EVENT_TYPES = ["skills-activity-started", "skills-activity-ended"];
const TIMED_OUT_OUTCOMES = ["session-time-out", "no-manikin-activity"];

function validatePayload(body: unknown): body is FleetWebhookPayload {
  if (typeof body !== "object" || body === null) return false;
  const payload = body as Record<string, unknown>;

  if (
    typeof payload.requestId !== "string" ||
    !FLEET_EVENT_TYPES.includes(payload.eventType as string) ||
    typeof payload.timestamp !== "string" ||
    typeof payload.stationId !== "string" ||
    typeof payload.data !== "object" ||
    payload.data === null
  ) {
    return false;
  }

  const data = payload.data as Record<string, unknown>;
  return (
    typeof data.launch_id === "string" &&
    typeof data.org_id === "string" &&
    typeof data.user_id === "string" &&
    typeof data.user_name === "string" &&
    typeof data.user_email === "string" &&
    typeof data.activity_id === "string" &&
    typeof data.activity_completed === "boolean" &&
    typeof data.activity_score === "number" &&
    typeof data.activity_elapsed === "number" &&
    typeof data.activity_failures === "number" &&
    typeof data.organization_name === "string" &&
    typeof data.institution_id === "string" &&
    typeof data.institution_name === "string" &&
    typeof data.course_id === "string"
  );
}

function shouldAlert(data: FleetWebhookData, sessionOutcome: string | undefined): boolean {
  if (data.activity_failures >= 3) return true;
  if (data.activity_completed === false && sessionOutcome !== undefined) {
    return TIMED_OUT_OUTCOMES.includes(sessionOutcome);
  }
  return false;
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  if (!verifyFleetSignature(rawBody, request.headers)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!validatePayload(body)) {
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }

  const existing = await prisma.activityAttempt.findUnique({
    where: { requestId: body.requestId },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const { data, stationId, eventType, timestamp } = body;
  const debriefings = data.activity_result?.Debriefings?.map((d) => d.text) ?? [];
  const sessionOutcome = data.activity_result?.SimulationActivity?.SkillsScenarioType?.sessionOutcome;
  const overallScore = data.activity_result?.CprSessionScores?.overallScore;

  const session = await prisma.learnerSession.upsert({
    where: {
      userId_stationId_courseId: {
        userId: data.user_id,
        stationId,
        courseId: data.course_id,
      },
    },
    create: {
      userId: data.user_id,
      userName: data.user_name,
      userEmail: data.user_email,
      orgId: data.org_id,
      organizationName: data.organization_name,
      institutionId: data.institution_id,
      institutionName: data.institution_name,
      stationId,
      courseId: data.course_id,
      timeZone: data.time_zone,
    },
    update: {
      userName: data.user_name,
      userEmail: data.user_email,
      organizationName: data.organization_name,
      institutionName: data.institution_name,
      timeZone: data.time_zone,
    },
  });

  await prisma.activityAttempt.create({
    data: {
      requestId: body.requestId,
      launchId: data.launch_id,
      eventType,
      activityId: data.activity_id,
      activityCompleted: data.activity_completed,
      activityScore: data.activity_score,
      activityElapsed: data.activity_elapsed,
      activityFailures: data.activity_failures,
      sessionOutcome,
      debriefings,
      rawPayload: body as unknown as Prisma.InputJsonValue,
      timestamp: new Date(timestamp),
      sessionId: session.id,
    },
  });

  if (shouldAlert(data, sessionOutcome)) {
    after(() =>
      sendFleetActivityAlert({
        userName: data.user_name,
        userEmail: data.user_email,
        activityId: data.activity_id,
        activityFailures: data.activity_failures,
        debriefings,
        overallScore,
      })
    );
  }

  return NextResponse.json({ ok: true });
}
