import { IncomingWebhook } from "@slack/webhook";
import { Attempt } from "@/types/attempt";
import { getStageLabel } from "@/lib/attempt-utils";

export function shouldAlert(attempt: Attempt): boolean {
  return attempt.failureCount >= 3 || attempt.criticality === "critical";
}

export function formatSlackMessage(attempt: Attempt): string {
  const reasons =
    attempt.failureReasons.length > 0 ? attempt.failureReasons.join(", ") : "None reported";

  return [
    `:rotating_light: *${attempt.criticality.toUpperCase()} criticality* — ${attempt.participantName}`,
    `*Location:* ${attempt.locationName}`,
    `*Stage:* ${getStageLabel(attempt.currentStage)}`,
    `*Failure count:* ${attempt.failureCount}`,
    `*Failure reasons:* ${reasons}`,
    `*Contact:* ${attempt.contactEmail} | ${attempt.contactPhone}`,
  ].join("\n");
}

export async function sendSlackAlert(attempt: Attempt): Promise<{ sent: boolean; reason?: string }> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn("SLACK_WEBHOOK_URL is not set — skipping Slack alert.");
    return { sent: false, reason: "SLACK_WEBHOOK_URL is not configured" };
  }

  const webhook = new IncomingWebhook(webhookUrl);
  await webhook.send({ text: formatSlackMessage(attempt) });

  return { sent: true };
}

interface FleetActivityAlertParams {
  userName: string;
  userEmail: string;
  activityId: string;
  activityFailures: number;
  debriefings: string[];
  overallScore?: number;
}

export function formatFleetActivityAlert(params: FleetActivityAlertParams): string {
  const debriefingText =
    params.debriefings.length > 0 ? params.debriefings.join(", ") : "None reported";
  const scoreText =
    params.overallScore !== undefined ? `${params.overallScore}` : "Not available";

  return [
    `:rotating_light: *Fleet activity alert* — ${params.userName}`,
    `*Contact:* ${params.userEmail}`,
    `*Activity:* ${params.activityId}`,
    `*Failure count:* ${params.activityFailures}`,
    `*Debriefings:* ${debriefingText}`,
    `*Overall score:* ${scoreText}`,
  ].join("\n");
}

export async function sendFleetActivityAlert(
  params: FleetActivityAlertParams
): Promise<{ sent: boolean; reason?: string }> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn("SLACK_WEBHOOK_URL is not set — skipping Slack alert.");
    return { sent: false, reason: "SLACK_WEBHOOK_URL is not configured" };
  }

  const webhook = new IncomingWebhook(webhookUrl);
  await webhook.send({ text: formatFleetActivityAlert(params) });

  return { sent: true };
}
