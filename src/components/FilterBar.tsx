'use client'

import { Group, TextInput, SegmentedControl } from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'

interface FilterBarProps {
  filter: 'all' | 'struggling' | 'critical'
  onFilterChange: (value: 'all' | 'struggling' | 'critical') => void
  search: string
  onSearchChange: (value: string) => void
}

export function FilterBar({
  filter,
  onFilterChange,
  search,
  onSearchChange,
}: FilterBarProps) {
  return (
    <Group px="lg" py="sm" gap="lg" wrap="wrap" align="center">
      <TextInput
        label="Search"
        placeholder="Search by name"
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={(event) => onSearchChange(event.currentTarget.value)}
        w={240}
      />
      <SegmentedControl
        value={filter}
        onChange={onFilterChange}
        data={[
          { label: 'All', value: 'all' },
          { label: 'Struggling', value: 'struggling' },
          { label: 'Critical', value: 'critical' },
        ]}
        mt={24}
      />
    </Group>
  )
}
