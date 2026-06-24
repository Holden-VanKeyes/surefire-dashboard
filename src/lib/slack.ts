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
