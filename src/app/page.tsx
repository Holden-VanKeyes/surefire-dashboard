import { mockAttempts } from '@/lib/mock-data'
import { sortAttempts } from '@/lib/attempt-utils'
import { Dashboard } from '@/components/Dashboard'
import { Container } from '@mantine/core'

export default function Home() {
  // TODO: swap mock data for real DB call once Postgres is live.
  const initialAttempts = sortAttempts(mockAttempts)

  return (
    <Container size="xl">
      <Dashboard initialAttempts={initialAttempts} />
    </Container>
  )
}
