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
