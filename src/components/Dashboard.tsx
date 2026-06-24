'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Center,
  Stack,
  Text,
  Container,
  Group,
  SimpleGrid,
} from '@mantine/core'
import { Attempt, CriticalityLevel, StageType } from '@/types/attempt'
import { sortAttempts } from '@/lib/attempt-utils'
import { DashboardHeader } from '@/components/DashboardHeader'
import { StatsCards } from '@/components/StatsCards'
import { FilterBar } from '@/components/FilterBar'
import { AttemptCard } from '@/components/AttemptCard'

const POLL_INTERVAL_MS = 30_000

interface DashboardProps {
  initialAttempts: Attempt[]
}

export function Dashboard({ initialAttempts }: DashboardProps) {
  const [attempts, setAttempts] = useState<Attempt[]>(initialAttempts)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [criticalityFilter, setCriticalityFilter] = useState<
    CriticalityLevel | 'all'
  >('all')
  const [stageFilter, setStageFilter] = useState<StageType | 'all'>('all')
  const [search, setSearch] = useState('')

  const fetchAttempts = useCallback(async () => {
    setIsRefreshing(true)
    try {
      // TODO: swap mock data for real DB call once GET /api/attempts reads from Postgres.
      const res = await fetch('/api/attempts')
      const data: { attempts: Attempt[] } = await res.json()
      setAttempts(sortAttempts(data.attempts))
      setLastUpdated(new Date())
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  // Polling subscribes fetchAttempts to an external timer; the initial data
  // load already happened server-side, so this effect never calls setState
  // synchronously on mount.
  useEffect(() => {
    const interval = setInterval(fetchAttempts, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [fetchAttempts])

  const filteredAttempts = useMemo(() => {
    const searchLower = search.trim().toLowerCase()
    return attempts.filter((attempt) => {
      if (
        criticalityFilter !== 'all' &&
        attempt.criticality !== criticalityFilter
      )
        return false
      if (stageFilter !== 'all' && attempt.currentStage !== stageFilter)
        return false
      if (
        searchLower &&
        !attempt.participantName.toLowerCase().includes(searchLower)
      )
        return false
      return true
    })
  }, [attempts, criticalityFilter, stageFilter, search])

  return (
    <>
      <DashboardHeader
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
        onRefresh={fetchAttempts}
      />
      <StatsCards attempts={attempts} />
      <FilterBar
        criticalityFilter={criticalityFilter}
        onCriticalityFilterChange={setCriticalityFilter}
        stageFilter={stageFilter}
        onStageFilterChange={setStageFilter}
        search={search}
        onSearchChange={setSearch}
      />

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} px="lg" py="md" spacing="md">
        {filteredAttempts.length === 0 ? (
          <Center py="xl">
            <Text c="dimmed">No attempts match the current filters.</Text>
          </Center>
        ) : (
          filteredAttempts.map((attempt) => (
            <AttemptCard key={attempt.id} attempt={attempt} />
          ))
        )}
      </SimpleGrid>
    </>
  )
}
