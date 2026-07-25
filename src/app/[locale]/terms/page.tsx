import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { LegalContactSection, LegalPage, LegalSection } from '@/components/site/legal-page'
import { COMPANY_NAME } from '@/content/site'

const SECTIONS = [
  'quotations',
  'delivery',
  'quality',
  'confidentiality',
  'payment',
  'liability',
] as const

interface TermsPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: TermsPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'legal.terms' })
  return {
    title: t('metaTitle', { companyName: COMPANY_NAME }),
    description: t('metaDescription', { companyName: COMPANY_NAME }),
  }
}

export default async function TermsPage({ params }: TermsPageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('legal.terms')

  return (
    <LegalPage title={t('title')}>
      {SECTIONS.map((section) => (
        <LegalSection key={section} title={t(`sections.${section}.title`)}>
          <p>{t(`sections.${section}.body`)}</p>
        </LegalSection>
      ))}
      <LegalContactSection namespace="legal.terms" />
    </LegalPage>
  )
}
