export type CriticalityLevel = 'low' | 'medium' | 'high' | 'critical'

export type AttemptStatus = 'in_progress' | 'passed' | 'failed' | 'abandoned'

export enum StageType {
  Orientation = 'orientation',
  AdultChestCompressions = 'adult_chest',
  AdultBreathing = 'adult_breathing',
  ChildChestCompressions = 'child_chest',
  ChildBreathing = 'child_breathing',
  InfantChestCompressions = 'infant_chest',
  InfantBreathing = 'infant_breathing',
  AedUsage = 'aed_usage',
  WrittenExam = 'written_exam',
  FinalAssessment = 'final_assessment',
}

export interface Attempt {
  id: string
  userId: string
  participantName: string
  contactEmail: string
  contactPhone: string
  locationId: string
  locationName: string
  currentStage: StageType
  /** ISO 8601 timestamp */
  startedAt: string
  failureCount: number
  failureReasons: string[]
  criticality: CriticalityLevel
  status: AttemptStatus
  /** ISO 8601 timestamp */
  createdAt: string
  /** ISO 8601 timestamp */
  updatedAt: string
}

/** One row per LearnerSession, aggregated across its ActivityAttempts. Returned by GET /api/attempts. */
export interface LearnerAttemptSummary {
  id: string
  userId: string
  userName: string
  userEmail: string
  institutionName: string
  organizationName: string
  stationId: string
  totalAttempts: number
  failureCount: number
  /** Raw activity id, e.g. "skills-web-adult-compressions" */
  lastActivity: string | null
  /** ISO 8601 timestamp */
  lastSeen: string | null
  /** Raw activity id of the most recent attempt; same value as lastActivity */
  currentStage: string | null
  debriefings: string[]
  overallScore: number | null
  scoreThreshold: number
  passingScore: boolean | null
  isStruggling: boolean
  isCritical: boolean
}
