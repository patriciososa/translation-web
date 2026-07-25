import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { LegalPage, LegalSection } from '@/components/site/legal-page'
import { TrackedAnchor } from '@/components/ui/tracked'
import { COMPANY_NAME, CONTACT } from '@/content/site'

/**
 * Recruitment page for translators, kept off the customer funnel: it is linked
 * from the footer only, and it points at `jobsEmail` rather than the quote
 * inbox so applications never mix with customer enquiries.
 */

const PROFILE_ITEMS = [0, 1, 2, 3, 4, 5] as const
const OFFER_ITEMS = [0, 1, 2, 3, 4] as const
const APPLY_ITEMS = [0, 1, 2, 3, 4, 5] as const

interface CareersPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: CareersPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'careers' })
  return {
    title: t('metaTitle', { companyName: COMPANY_NAME }),
    description: t('metaDescription'),
  }
}

export default async function CareersPage({ params }: CareersPageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('careers')

  return (
    <LegalPage title={t('title')}>
      <p className="text-[15px] leading-relaxed text-foreground-secondary">{t('lead')}</p>

      <LegalSection title={t('profile.title')}>
        <BulletList items={PROFILE_ITEMS.map((i) => t(`profile.items.${i}`))} />
      </LegalSection>

      <LegalSection title={t('offer.title')}>
        <BulletList items={OFFER_ITEMS.map((i) => t(`offer.items.${i}`))} />
      </LegalSection>

      <LegalSection title={t('apply.title')}>
        <p>
          {t.rich('apply.intro', {
            email: CONTACT.jobsEmail,
            link: (chunks) => (
              <TrackedAnchor
                href={`mailto:${CONTACT.jobsEmail}`}
                event="jobs_email_click"
                eventParams={{ location: 'careers', link_id: 'jobs-email', section: 'apply' }}
                className="font-medium text-primary underline underline-offset-2"
              >
                {chunks}
              </TrackedAnchor>
            ),
          })}
        </p>
        <BulletList items={APPLY_ITEMS.map((i) => t(`apply.items.${i}`))} />
        <p>{t('apply.note')}</p>
      </LegalSection>
    </LegalPage>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5 marker:text-border-strong">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}
