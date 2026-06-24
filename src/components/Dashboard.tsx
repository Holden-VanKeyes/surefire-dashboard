'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Center, SimpleGrid, Text } from '@mantine/core'
import { LearnerAttemptSummary } from '@/types/attempt'
import { DashboardHeader } from '@/components/DashboardHeader'
import { StatsCards } from '@/components/StatsCards'
import { FilterBar } from '@/components/FilterBar'
import { AttemptCard } from '@/components/AttemptCard'

const POLL_INTERVAL_MS = 30_000

interface DashboardProps {
  initialAttempts: LearnerAttemptSummary[]
}

export function Dashboard({ initialAttempts }: DashboardProps) {
  const [attempts, setAttempts] =
    useState<LearnerAttemptSummary[]>(initialAttempts)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [filter, setFilter] = useState<'all' | 'struggling' | 'critical'>('all')
  const [search, setSearch] = useState('')

  const fetchAttempts = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const res = await fetch('/api/attempts')
      const data: { attempts: LearnerAttemptSummary[] } = await res.json()
      setAttempts(data.attempts)
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
      if (filter === 'critical' && !attempt.isCritical) return false
      if (
        filter === 'struggling' &&
        (!attempt.isStruggling || attempt.isCritical)
      )
        return false
      if (searchLower && !attempt.userName.toLowerCase().includes(searchLower))
        return false
      return true
    })
  }, [attempts, filter, search])

  return (
    <>
      <DashboardHeader
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
        onRefresh={fetchAttempts}
      />
      <StatsCards attempts={attempts} />
      <FilterBar
        filter={filter}
        onFilterChange={setFilter}
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
