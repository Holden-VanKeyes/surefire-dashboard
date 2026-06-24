'use client'

import { Group, Paper, SimpleGrid, Text } from '@mantine/core'
import { Attempt } from '@/types/attempt'

interface StatsCardsProps {
  attempts: Attempt[]
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string
  value: string | number
  color?: string
}) {
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
  )
}

export function StatsCards({ attempts }: StatsCardsProps) {
  const activeSessions = attempts.filter(
    (a) => a.status === 'in_progress',
  ).length
  const criticalAlerts = attempts.filter(
    (a) => a.criticality === 'critical',
  ).length
  const averageFailureCount =
    attempts.length === 0
      ? 0
      : attempts.reduce((sum, a) => sum + a.failureCount, 0) / attempts.length
  const sessionsAtRisk = attempts.filter((a) => a.failureCount >= 3).length

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} px="lg" py="md">
      <StatCard label="Active Sessions" value={activeSessions} />
      <StatCard label="Critical Alerts" value={criticalAlerts} color="red" />
      <StatCard
        label="Avg Failure Count"
        value={averageFailureCount.toFixed(1)}
      />
      <StatCard
        label="Sessions At Risk"
        value={sessionsAtRisk}
        color="orange"
      />
    </SimpleGrid>
  )
}
