import { LandingPage, landingMetadata } from '@/components/site/landing-page'
import type { LandingPageProps } from '@/components/site/landing-page'
import { LANDING_TOPICS } from '@/content/site'

const topic = LANDING_TOPICS.find((candidate) => candidate.id === 'certified')!

export function generateMetadata(props: LandingPageProps) {
  return landingMetadata(topic, props)
}

export default function Page(props: LandingPageProps) {
  return <LandingPage topic={topic} {...props} />
}
