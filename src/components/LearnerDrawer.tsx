'use client'

import {
  Badge,
  Button,
  Divider,
  Drawer,
  Group,
  Progress,
  Stack,
  Text,
} from '@mantine/core'
import { IconAlertTriangle, IconMail } from '@tabler/icons-react'
import { LearnerAttemptSummary } from '@/types/attempt'
import {
  formatRelativeTime,
  getActivityLabel,
  getDebriefingLabel,
} from '@/lib/attempt-utils'

interface LearnerDrawerProps {
  attempt: LearnerAttemptSummary | null
  opened: boolean
  onClose: () => void
}

function mailtoHref(attempt: LearnerAttemptSummary): string {
  const subject = 'SureFire CPR - Support for your training session'
  const body = `Hi ${attempt.userName},\n\nWe noticed you may be having some difficulty with your CPR certification. We'd love to help!\n\nBest,\nSureFire CPR Support`
  return `mailto:${attempt.userEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export function LearnerDrawer({
  attempt,
  opened,
  onClose,
}: LearnerDrawerProps) {
  if (!attempt) {
    return <Drawer opened={opened} onClose={onClose} />
  }

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="md"
      title={
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
      }
    >
      <Stack gap="lg">
        <Stack gap={4}>
          <Text size="sm" fw={600}>
            CPR Score
          </Text>
          {attempt.overallScore === null ? (
            <Text size="sm" c="dimmed">
              No score yet
            </Text>
          ) : (
            <>
              <Progress
                value={attempt.overallScore}
                color={attempt.passingScore ? 'green' : 'red'}
                size="lg"
                radius="xl"
              />
              <Text size="xs" c="dimmed">
                {attempt.overallScore} / {attempt.scoreThreshold} to pass
              </Text>
            </>
          )}
        </Stack>

        {attempt.currentStage && (
          <Stack gap={4}>
            <Text size="sm" fw={600}>
              Current Activity
            </Text>
            <Text size="sm">{getActivityLabel(attempt.currentStage)}</Text>
          </Stack>
        )}

        {attempt.debriefings.length > 0 && (
          <Stack gap={4}>
            <Text size="sm" fw={600}>
              Debriefings
            </Text>
            <Group gap="xs">
              {attempt.debriefings.map((code) => (
                <Badge key={code} variant="outline" color="gray" size="sm">
                  {getDebriefingLabel(code)}
                </Badge>
              ))}
            </Group>
          </Stack>
        )}

        <Divider />

        <Stack gap={4}>
          <Text size="sm" fw={600}>
            Activity History
          </Text>
          {attempt.recentAttempts.length === 0 ? (
            <Text size="sm" c="dimmed">
              No completed activities yet.
            </Text>
          ) : (
            <Stack gap="sm">
              {attempt.recentAttempts.map((recent) => (
                <Group
                  key={`${recent.activityId}-${recent.timestamp}`}
                  justify="space-between"
                  wrap="nowrap"
                >
                  <Stack gap={0}>
                    <Text size="sm">{getActivityLabel(recent.activityId)}</Text>
                    <Text size="xs" c="dimmed">
                      {formatRelativeTime(recent.timestamp)}
                    </Text>
                  </Stack>
                  <Group gap="xs" wrap="nowrap">
                    {recent.activityFailures > 0 && (
                      <Text size="xs" c="orange">
                        Failures: {recent.activityFailures}
                      </Text>
                    )}
                    <Badge
                      color={recent.activityCompleted ? 'green' : 'red'}
                      size="sm"
                    >
                      {recent.activityCompleted ? 'Passed' : 'Failed'}
                    </Badge>
                  </Group>
                </Group>
              ))}
            </Stack>
          )}
        </Stack>

        <Button
          component="a"
          href={mailtoHref(attempt)}
          leftSection={<IconMail size={16} />}
          variant="outline"
        >
          {`Email ${attempt.userName}`}
        </Button>
      </Stack>
    </Drawer>
  )
}
