import { NextResponse } from "next/server";
import { mockAttempts } from "@/lib/mock-data";
import { sortAttempts } from "@/lib/attempt-utils";

export async function GET() {
  // TODO: swap mock data for real DB call — replace with
  // prisma.attempt.findMany() and sort in the query once Postgres is live.
  const attempts = sortAttempts(mockAttempts);

  return NextResponse.json({ attempts });
}
