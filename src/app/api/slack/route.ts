import { NextResponse } from "next/server";
import { Attempt } from "@/types/attempt";
import { sendSlackAlert } from "@/lib/slack";

function isAttempt(value: unknown): value is Attempt {
  if (typeof value !== "object" || value === null) return false;
  const attempt = value as Record<string, unknown>;
  return (
    typeof attempt.participantName === "string" &&
    typeof attempt.locationName === "string" &&
    typeof attempt.currentStage === "string" &&
    typeof attempt.failureCount === "number" &&
    Array.isArray(attempt.failureReasons)
  );
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!isAttempt(body)) {
    return NextResponse.json({ error: "Invalid attempt payload" }, { status: 400 });
  }

  const result = await sendSlackAlert(body);

  if (!result.sent) {
    return NextResponse.json({ error: result.reason }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
