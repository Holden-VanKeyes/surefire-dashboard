'use client'

import { ActionIcon, Badge, Group, Text, Title, Tooltip } from '@mantine/core'
import { IconRefresh } from '@tabler/icons-react'

interface DashboardHeaderProps {
  lastUpdated: Date | null
  isRefreshing: boolean
  onRefresh: () => void
}

export function DashboardHeader({
  lastUpdated,
  isRefreshing,
  onRefresh,
}: DashboardHeaderProps) {
  return (
    <Group
      justify="space-between"
      px="lg"
      py="md"
      className="border-b border-[var(--mantine-color-default-border)]"
    >
      <Group gap="xs">
        <Title order={3}>SureFire CPR</Title>
        <Badge variant="light" size="lg">
          CS Monitor
        </Badge>
      </Group>

      <Group gap="sm">
        <Text size="sm" c="dimmed" suppressHydrationWarning>
          {lastUpdated
            ? `Last updated ${lastUpdated.toLocaleTimeString()}`
            : 'Loading...'}
        </Text>
        <Tooltip label="Refresh now">
          <ActionIcon
            variant="default"
            size="lg"
            onClick={onRefresh}
            loading={isRefreshing}
            aria-label="Refresh attempts"
          >
            <IconRefresh size={18} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Group>
  )
}
