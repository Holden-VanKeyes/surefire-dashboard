"use client";

import { Group, Select, TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { CriticalityLevel, StageType } from "@/types/attempt";
import { getStageLabel } from "@/lib/attempt-utils";

interface FilterBarProps {
  criticalityFilter: CriticalityLevel | "all";
  onCriticalityFilterChange: (value: CriticalityLevel | "all") => void;
  stageFilter: StageType | "all";
  onStageFilterChange: (value: StageType | "all") => void;
  search: string;
  onSearchChange: (value: string) => void;
}

const CRITICALITY_OPTIONS = [
  { value: "all", label: "All" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const STAGE_OPTIONS = [
  { value: "all", label: "All Stages" },
  ...Object.values(StageType).map((stage) => ({
    value: stage,
    label: getStageLabel(stage),
  })),
];

export function FilterBar({
  criticalityFilter,
  onCriticalityFilterChange,
  stageFilter,
  onStageFilterChange,
  search,
  onSearchChange,
}: FilterBarProps) {
  return (
    <Group px="lg" py="sm" gap="sm" wrap="wrap">
      <Select
        label="Criticality"
        data={CRITICALITY_OPTIONS}
        value={criticalityFilter}
        onChange={(value) => onCriticalityFilterChange((value as CriticalityLevel | "all") ?? "all")}
        allowDeselect={false}
        w={160}
      />
      <Select
        label="Stage"
        data={STAGE_OPTIONS}
        value={stageFilter}
        onChange={(value) => onStageFilterChange((value as StageType | "all") ?? "all")}
        allowDeselect={false}
        w={220}
      />
      <TextInput
        label="Search"
        placeholder="Search by name"
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={(event) => onSearchChange(event.currentTarget.value)}
        w={240}
      />
    </Group>
  );
}
