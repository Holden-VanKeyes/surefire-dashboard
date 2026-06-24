export type FleetEventType = "skills-activity-started" | "skills-activity-ended";

export interface FleetDebriefing {
  text: string;
}

export interface CprSessionStatistics {
  compMeanDepth?: number;
  compCorrectDepthPercentage?: number;
  compHandPosCorrectPercentage?: number;
  compMeanRate?: number;
  [key: string]: unknown;
}

export interface CprSessionScores {
  overallScore?: number;
  compHandPositionScore?: number;
  [key: string]: unknown;
}

export interface SkillsScenarioType {
  sessionOutcome?: string;
}

export interface SimulationActivity {
  SkillsScenarioType?: SkillsScenarioType;
}

export interface ActivityResult {
  Debriefings?: FleetDebriefing[];
  CprSessionStatistics?: CprSessionStatistics;
  CprSessionScores?: CprSessionScores;
  SimulationActivity?: SimulationActivity;
}

export interface FleetWebhookData {
  launch_id: string;
  event_type: string;
  org_id: string;
  manikin_id: string;
  user_email: string;
  user_id: string;
  user_name: string;
  activity_id: string;
  activity_completed: boolean;
  activity_score: number;
  activity_elapsed: number;
  activity_failures: number;
  organization_name: string;
  institution_id: string;
  institution_name: string;
  time_zone?: string;
  activity_result?: ActivityResult;
  course_id: string;
  activities: unknown[];
  course_progress: Record<string, unknown>;
}

export interface FleetWebhookPayload {
  requestId: string;
  eventType: FleetEventType;
  timestamp: string;
  stationId: string;
  data: FleetWebhookData;
}
