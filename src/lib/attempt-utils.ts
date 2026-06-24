import { Attempt, AttemptStatus, CriticalityLevel, StageType } from "@/types/attempt";

export const STAGE_LABELS: Record<StageType, string> = {
  [StageType.Orientation]: "Orientation",
  [StageType.AdultChestCompressions]: "Adult Chest Compressions",
  [StageType.AdultBreathing]: "Adult Rescue Breathing",
  [StageType.ChildChestCompressions]: "Child Chest Compressions",
  [StageType.ChildBreathing]: "Child Rescue Breathing",
  [StageType.InfantChestCompressions]: "Infant Chest Compressions",
  [StageType.InfantBreathing]: "Infant Rescue Breathing",
  [StageType.AedUsage]: "AED Usage",
  [StageType.WrittenExam]: "Written Exam",
  [StageType.FinalAssessment]: "Final Assessment",
};

export function getStageLabel(stage: StageType): string {
  return STAGE_LABELS[stage] ?? stage;
}

export const CRITICALITY_ORDER: CriticalityLevel[] = ["critical", "high", "medium", "low"];

export const CRITICALITY_COLORS: Record<CriticalityLevel, string> = {
  critical: "red",
  high: "orange",
  medium: "yellow",
  low: "green",
};

export const STATUS_COLORS: Record<AttemptStatus, string> = {
  in_progress: "blue",
  passed: "green",
  failed: "red",
  abandoned: "gray",
};

export const STATUS_LABELS: Record<AttemptStatus, string> = {
  in_progress: "In Progress",
  passed: "Passed",
  failed: "Failed",
  abandoned: "Abandoned",
};

export function sortAttempts(attempts: Attempt[]): Attempt[] {
  return [...attempts].sort((a, b) => {
    const criticalityDiff =
      CRITICALITY_ORDER.indexOf(a.criticality) - CRITICALITY_ORDER.indexOf(b.criticality);
    if (criticalityDiff !== 0) return criticalityDiff;
    return b.failureCount - a.failureCount;
  });
}

export function formatTimeElapsed(startedAt: string, now: Date = new Date()): string {
  const startedMs = new Date(startedAt).getTime();
  const elapsedMs = Math.max(0, now.getTime() - startedMs);
  const minutes = Math.floor(elapsedMs / 60_000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

const ACTIVITY_LABELS: Record<string, string> = {
  "skills-web-adult-compressions": "Adult Compressions",
  "skills-web-adult-ventilations": "Adult Ventilations",
  "skills-web-adult-2CPR-30-2": "Adult 2-Person CPR",
  "skills-web-infant-compressions": "Infant Compressions",
  "skills-web-infant-ventilations": "Infant Ventilations",
  "skills-web-infant-2CPR-15-2": "Infant 2-Person CPR",
  "hc-overview": "Course Overview",
};

function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function getActivityLabel(activityId: string): string {
  return ACTIVITY_LABELS[activityId] ?? capitalizeFirst(activityId.replace(/-/g, " "));
}

const DEBRIEFING_LABELS: Record<string, string> = {
  "improvement-need-hand-position": "Hand position needs improvement",
  "improvement-need-depth": "Compression depth needs improvement",
  "improvement-need-compression-rate": "Compression rate needs improvement",
  "tip-comp-hand-position": "Check hand placement",
  "tip-comp-depth-shallow": "Compressions too shallow",
  "tip-comp-rate-low": "Compression rate too low",
};

export function getDebriefingLabel(code: string): string {
  if (DEBRIEFING_LABELS[code]) return DEBRIEFING_LABELS[code];
  const withoutPrefix = code.replace(/^(improvement|tip)-/, "");
  return capitalizeFirst(withoutPrefix.replace(/-/g, " "));
}

export function formatRelativeTime(isoTimestamp: string, now: Date = new Date()): string {
  const elapsedMs = Math.max(0, now.getTime() - new Date(isoTimestamp).getTime());
  const minutes = Math.floor(elapsedMs / 60_000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
