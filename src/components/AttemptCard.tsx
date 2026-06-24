"use client";

import { useEffect, useState } from "react";
import { Badge, Card, Group, Stack, Text } from "@mantine/core";
import { IconAlertTriangle, IconClock, IconMail, IconMapPin, IconPhone } from "@tabler/icons-react";
import { Attempt } from "@/types/attempt";
import {
  CRITICALITY_COLORS,
  STATUS_COLORS,
  STATUS_LABELS,
  formatTimeElapsed,
  getStageLabel,
} from "@/lib/attempt-utils";

interface AttemptCardProps {
  attempt: Attempt;
}

export function AttemptCard({ attempt }: AttemptCardProps) {
  const [timeElapsed, setTimeElapsed] = useState(() => formatTimeElapsed(attempt.startedAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(formatTimeElapsed(attempt.startedAt));
    }, 30_000);
    return () => clearInterval(interval);
  }, [attempt.startedAt]);

  const isAtRisk = attempt.failureCount >= 3;

  return (
    <Card withBorder radius="md" p="lg">
      <Group justify="space-between" align="flex-start">
        <Stack gap={2}>
          <Text fw={700} size="lg">
            {attempt.participantName}
          </Text>
          <Group gap="md">
            <Group gap={4}>
              <IconMail size={14} />
              <Text size="sm" c="dimmed">
                {attempt.contactEmail}
              </Text>
            </Group>
            <Group gap={4}>
              <IconPhone size={14} />
              <Text size="sm" c="dimmed">
                {attempt.contactPhone}
              </Text>
            </Group>
          </Group>
        </Stack>

        <Group gap="xs">
          <Badge color={CRITICALITY_COLORS[attempt.criticality]} variant="filled">
            {attempt.criticality}
          </Badge>
          <Badge color={STATUS_COLORS[attempt.status]} variant="light">
            {STATUS_LABELS[attempt.status]}
          </Badge>
        </Group>
      </Group>

      <Group gap="lg" mt="md">
        <Group gap={4}>
          <IconMapPin size={14} />
          <Text size="sm">{attempt.locationName}</Text>
        </Group>
        <Group gap={4}>
          <IconClock size={14} />
          <Text size="sm">{timeElapsed} elapsed</Text>
        </Group>
        <Text size="sm" fw={600}>
          {getStageLabel(attempt.currentStage)}
        </Text>
      </Group>

      <Group gap="xs" mt="sm" align="center">
        {isAtRisk && <IconAlertTriangle size={16} color="var(--mantine-color-orange-6)" />}
        <Text size="sm" fw={isAtRisk ? 700 : 400} c={isAtRisk ? "orange" : undefined}>
          Failures: {attempt.failureCount}
        </Text>
      </Group>

      {attempt.failureReasons.length > 0 && (
        <Group gap="xs" mt="xs">
          {attempt.failureReasons.map((reason) => (
            <Badge key={reason} variant="outline" color="gray" size="sm">
              {reason}
            </Badge>
          ))}
        </Group>
      )}
    </Card>
  );
}
