import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface LearnerAttemptSummary {
  id: string
  userId: string
  userName: string
  userEmail: string
  institutionName: string
  organizationName: string
  stationId: string
  totalAttempts: number
  failureCount: number
  lastActivity: string | null
  lastSeen: Date | null
  currentStage: string | null
  debriefings: string[]
  overallScore: number | null
  scoreThreshold: number
  passingScore: boolean | null
  isStruggling: boolean
}

interface CprSessionScores {
  overallScore?: number
  categoryThresholdBasic?: number
}

interface RawPayload {
  data?: {
    activity_result?: {
      CprSessionScores?: CprSessionScores
    }
  }
}

const THRESHOLD = parseInt(process.env.STRUGGLE_THRESHOLD ?? '5')
const CRITICAL_THRESHOLD = parseInt(process.env.CRITICAL_THRESHOLD ?? '10')

export async function GET() {
  const sessions = await prisma.learnerSession.findMany({
    include: {
      attempts: {
        orderBy: { timestamp: 'desc' },
      },
    },
    orderBy: {
      attempts: { _count: 'desc' },
    },
  })

  const attempts: LearnerAttemptSummary[] = sessions
    .map((session) => {
      const mostRecent = session.attempts[0]
      const mostRecentEnded = session.attempts.find(
        (attempt) => attempt.eventType === 'skills-activity-ended',
      )
      const raw = mostRecentEnded?.rawPayload as RawPayload | null
      const cprScores = raw?.data?.activity_result?.CprSessionScores
      const overallScore = cprScores?.overallScore ?? null
      const scoreThreshold = cprScores?.categoryThresholdBasic ?? 75

      const failureCount = session.attempts.filter(
        (a) => a.eventType === 'skills-activity-ended' && !a.activityCompleted,
      ).length

      return {
        id: session.id,
        userId: session.userId,
        userName: session.userName,
        userEmail: session.userEmail,
        institutionName: session.institutionName,
        organizationName: session.organizationName,
        stationId: session.stationId,
        totalAttempts: session.attempts.filter(
          (a) => a.eventType === 'skills-activity-ended',
        ).length,
        failureCount,
        lastActivity: mostRecent?.activityId ?? null,
        lastSeen: mostRecent?.timestamp ?? null,
        currentStage: mostRecent?.activityId ?? null,
        debriefings: mostRecentEnded?.debriefings ?? [],
        overallScore: overallScore,
        scoreThreshold: scoreThreshold,
        passingScore:
          overallScore !== null ? overallScore >= scoreThreshold : null,
        isStruggling: failureCount >= THRESHOLD,
        isCritical: failureCount >= CRITICAL_THRESHOLD,
      }
    })
    .sort((a, b) => {
      // Critical first, then struggling, then by failure count
      if (a.isCritical && !b.isCritical) return -1
      if (!a.isCritical && b.isCritical) return 1
      return b.failureCount - a.failureCount
    })
  // console.log('Returning attempts:', attempts)
  return NextResponse.json({ attempts })
}
