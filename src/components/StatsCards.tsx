"use client";

import { Group, Paper, SimpleGrid, Text } from "@mantine/core";
import { LearnerAttemptSummary } from "@/types/attempt";

interface StatsCardsProps {
  attempts: LearnerAttemptSummary[];
}

function StatCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <Paper withBorder p="md" radius="md">
      <Text size="xs" c="dimmed" fw={700} tt="uppercase">
        {label}
      </Text>
      <Group gap={4} align="baseline" mt={4}>
        <Text size="xl" fw={700} c={color}>
          {value}
        </Text>
      </Group>
    </Paper>
  );
}

export function StatsCards({ attempts }: StatsCardsProps) {
  const totalLearners = attempts.length;
  const strugglingLearners = attempts.filter((a) => a.isStruggling).length;
  const totalAttempts = attempts.reduce((sum, a) => sum + a.totalAttempts, 0);
  const averageFailureCount =
    attempts.length === 0
      ? 0
      : attempts.reduce((sum, a) => sum + a.failureCount, 0) / attempts.length;

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} px="lg" py="md">
      <StatCard label="Total Learners" value={totalLearners} />
      <StatCard label="Struggling Learners" value={strugglingLearners} color="red" />
      <StatCard label="Total Attempts" value={totalAttempts} />
      <StatCard label="Avg Failure Count" value={averageFailureCount.toFixed(1)} color="orange" />
    </SimpleGrid>
  );
}
