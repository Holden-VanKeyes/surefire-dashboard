import { Container } from '@mantine/core'
import { GET } from '@/app/api/attempts/route'
import { Dashboard } from '@/components/Dashboard'
import { LearnerAttemptSummary } from '@/types/attempt'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const res = await GET()
  const { attempts } = (await res.json()) as {
    attempts: LearnerAttemptSummary[]
  }

  return (
    <Container size="xl">
      <Dashboard initialAttempts={attempts} />
    </Container>
  )
}
