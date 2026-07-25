import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { LegalContactSection, LegalPage, LegalSection } from '@/components/site/legal-page'
import { COMPANY_NAME } from '@/content/site'

const SECTIONS = ['collect', 'use', 'documents', 'cookies', 'rights'] as const

interface PrivacyPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PrivacyPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'legal.privacy' })
  return {
    title: t('metaTitle', { companyName: COMPANY_NAME }),
    description: t('metaDescription', { companyName: COMPANY_NAME }),
  }
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('legal.privacy')

  return (
    <LegalPage title={t('title')}>
      {SECTIONS.map((section) => (
        <LegalSection key={section} title={t(`sections.${section}.title`)}>
          <p>{t(`sections.${section}.body`)}</p>
        </LegalSection>
      ))}
      <LegalContactSection namespace="legal.privacy" />
    </LegalPage>
  )
}
