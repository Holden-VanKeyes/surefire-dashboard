'use client'

import {
  Badge,
  Card,
  Group,
  Stack,
  Text,
  ActionIcon,
  Tooltip,
} from '@mantine/core'
import {
  IconAlertTriangle,
  IconClock,
  IconMail,
  IconSchool,
} from '@tabler/icons-react'
import { LearnerAttemptSummary } from '@/types/attempt'
import {
  formatRelativeTime,
  getActivityLabel,
  getDebriefingLabel,
} from '@/lib/attempt-utils'

interface AttemptCardProps {
  attempt: LearnerAttemptSummary
}

export function AttemptCard({ attempt }: AttemptCardProps) {
  const isAtRisk = attempt.failureCount >= 3

  return (
    <Card withBorder radius="md" p="lg">
      <Group justify="space-between" align="flex-start">
        <Stack gap={2}>
          <Group gap="xs">
            <Text fw={700} size="lg">
              {attempt.userName}
            </Text>
            {attempt.isCritical ? (
              <Badge
                color="red"
                variant="filled"
                leftSection={<IconAlertTriangle size={12} />}
              >
                CRITICAL
              </Badge>
            ) : attempt.isStruggling ? (
              <Badge
                color="orange"
                variant="filled"
                leftSection={<IconAlertTriangle size={12} />}
              >
                STRUGGLING
              </Badge>
            ) : null}
          </Group>
        </Stack>
      </Group>

      <Group gap="lg" mt="md">
        {attempt.lastSeen && (
          <Group gap={4}>
            <IconClock size={14} />
            <Text size="sm">{formatRelativeTime(attempt.lastSeen)}</Text>
          </Group>
        )}
        {attempt.currentStage && (
          <Text size="sm" fw={600}>
            {getActivityLabel(attempt.currentStage)}
          </Text>
        )}
      </Group>

      <Group gap="lg" mt="sm" align="center">
        <Text size="sm">Total attempts: {attempt.totalAttempts}</Text>
        <Group gap="xs" align="center">
          {isAtRisk && (
            <IconAlertTriangle
              size={16}
              color="var(--mantine-color-orange-6)"
            />
          )}
          <Text
            size="sm"
            fw={isAtRisk ? 700 : 400}
            c={isAtRisk ? 'orange' : undefined}
          >
            Failures: {attempt.failureCount}
          </Text>
        </Group>
      </Group>
      <Group gap="xs" mt="sm">
        <Tooltip label={`${attempt.userEmail}`} position="right" withArrow>
          <ActionIcon
            component="a"
            href={`mailto:${attempt.userEmail}?subject=SureFire CPR - Support for your training session&body=Hi ${attempt.userName},%0D%0A%0D%0AWe noticed you may be having some difficulty with your CPR certification. We'd love to help!%0D%0A%0D%0ABest,%0D%0ASureFire CPR Support`}
            variant="subtle"
            color="blue"
          >
            <IconMail size={24} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Card>
  )
}
