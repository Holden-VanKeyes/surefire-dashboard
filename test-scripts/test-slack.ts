// scripts/test-slack.ts
import 'dotenv/config'
import crypto from 'crypto'

const body =
  '{"requestId":"slack-test-002","eventType":"skills-activity-ended","timestamp":"2026-01-13T07:56:24Z","stationId":"696224442a77d0120654fbab","data":{"launch_id":"slack-test-002","event_type":"activity-ended","org_id":"10001234","manikin_id":"1770000000","user_email":"test@example.com","user_id":"slack-test-user","user_name":"Slack Test User","activity_id":"skills-web-adult-compressions","activity_completed":false,"activity_score":0.08,"activity_elapsed":82280,"activity_failures":10,"organization_name":"SureFire CPR","institution_id":"dfcfb5bc-dd3a-5201-8e17-040e33da9b73","institution_name":"Test Location","time_zone":"America/Los_Angeles","activity_result":{"Debriefings":[{"text":"improvement-need-hand-position"}],"CprSessionScores":{"overallScore":8},"SimulationActivity":{"SkillsScenarioType":{"sessionOutcome":"completed"}}},"course_id":"manifest/skills_2025_hc_bls_dev","activities":["hc-overview"],"course_progress":{}}}'

const secret = process.env.FLEET_WEBHOOK_SECRET!
const timestamp = Math.floor(Date.now() / 1000).toString()
const signedContent = `${timestamp}.${body}`
const secretBytes = Buffer.from(secret, 'base64')
const signature = crypto
  .createHmac('sha256', secretBytes)
  .update(signedContent)
  .digest('hex')

console.log('Body:', body)
console.log('X-Fleet-Timestamp:', timestamp)
console.log('X-Fleet-Signature-256:', signature)
console.log('\nCurl command:')
console.log(`curl -s -X POST https://surefire-dashboard-production.up.railway.app/api/webhook/attempt \\
  -H "Content-Type: application/json" \\
  -H "X-Fleet-Timestamp: ${timestamp}" \\
  -H "X-Fleet-Signature-256: ${signature}" \\
  -d '${body}'`)
