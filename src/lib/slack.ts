import { IncomingWebhook } from '@slack/webhook'

interface FleetActivityAlertParams {
  userName: string
  userEmail: string
  activityId: string
  activityFailures: number
  debriefings: string[]
  overallScore?: number | null
}

function formatFleetActivityAlert(params: FleetActivityAlertParams): string {
  const debriefingText =
    params.debriefings.length > 0
      ? params.debriefings.join(', ')
      : 'None reported'
  const scoreText =
    params.overallScore != null ? `${params.overallScore}` : 'Not available'

  return [
    `:rotating_light: *Fleet activity alert* — ${params.userName}`,
    `*Contact:* ${params.userEmail}`,
    `*Activity:* ${params.activityId}`,
    `*Failure count:* ${params.activityFailures}`,
    `*Debriefings:* ${debriefingText}`,
    `*Overall score:* ${scoreText}`,
  ].join('\n')
}

export async function sendFleetActivityAlert(
  params: FleetActivityAlertParams,
): Promise<{ sent: boolean; reason?: string }> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL

  if (!webhookUrl) {
    console.warn('SLACK_WEBHOOK_URL is not set — skipping Slack alert.')
    return { sent: false, reason: 'SLACK_WEBHOOK_URL is not configured' }
  }

  const webhook = new IncomingWebhook(webhookUrl)
  await webhook.send({ text: formatFleetActivityAlert(params) })

  return { sent: true }
}
