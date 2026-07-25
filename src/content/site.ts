import {
  Award,
  BadgeCheck,
  Banknote,
  BookOpenCheck,
  BrainCircuit,
  Captions,
  Clapperboard,
  Cog,
  Cpu,
  Factory,
  Flame,
  Globe,
  Globe2,
  GraduationCap,
  HandCoins,
  Handshake,
  HardHat,
  HeartPulse,
  Hospital,
  Landmark,
  Languages,
  LineChart,
  Lock,
  Megaphone,
  MessageCircle,
  PackageCheck,
  PenLine,
  Pickaxe,
  ReceiptText,
  Scale,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/**
 * Structural, non-translatable site data: stable ids, icons, and codes.
 * All copy lives in messages/<locale>.json, keyed by the ids defined here —
 * adding an entry means adding both the id and its strings in every locale.
 */

/**
 * Formal company name, deliberately the bare domain word: it must match the
 * business name used in Google Ads, so "Translations" is kept apart as a
 * commercial tagline shown only next to the logo.
 */
export const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME ?? 'Bluelab'

/** Brand tagline rendered under/next to COMPANY_NAME in the logo lockup. */
export const COMPANY_TAGLINE = 'Translations'

/** Trade name, published as the Organization `alternateName` only. */
export const COMPANY_ALTERNATE_NAME = `${COMPANY_NAME} ${COMPANY_TAGLINE}`

/** The verified Google Ads advertiser behind the brand; named on the site so a manual review can connect the two. */
export const COMPANY_OWNER = 'Patricio Gerardo Sosa'

/** Ids double as header.nav.* message keys. */
export const NAV_LINKS = [
  { id: 'home', href: '#top' },
  { id: 'services', href: '#services' },
  { id: 'industries', href: '#industries' },
  { id: 'languages', href: '#languages' },
  { id: 'about', href: '#about' },
  { id: 'process', href: '#process' },
  { id: 'faq', href: '#faq' },
  { id: 'contact', href: '#contact' },
] as const

export interface Service {
  /** Message key under services.items. */
  id: string
  icon: LucideIcon
  featured?: boolean
  /**
   * Heading for the expanded detail list, as a message key under `services`.
   * Defaults to "what we translate", which is true of every translation
   * service and of neither media one: nothing is translated in a video built
   * out of a customer's photographs, and a transcript of a Spanish recording
   * in Spanish is not a translation either.
   */
  detailsLabel?: 'whatWeTranslate' | 'whatWeWorkWith'
}

/**
 * The agency sells three families of work, and the last two are not
 * translations — the intake bot branches on the same distinction
 * (`ai-operator-bot`, `CollectedData.service_type`). Translation leads because
 * it is what nearly every visitor arrives for.
 */
export const SERVICES: Service[] = [
  { id: 'certified', icon: BadgeCheck, featured: true },
  { id: 'legal', icon: Scale },
  { id: 'medical', icon: HeartPulse },
  { id: 'technical', icon: Cog },
  { id: 'business', icon: LineChart },
  { id: 'localization', icon: Globe },
  { id: 'transcription', icon: Captions, detailsLabel: 'whatWeWorkWith' },
  { id: 'production', icon: Clapperboard, detailsLabel: 'whatWeWorkWith' },
]

export interface Industry {
  /** Message key under industries.items. */
  id: string
  icon: LucideIcon
  /** Featured industries additionally list typical document types in their messages. */
  featured?: boolean
}

export const FEATURED_INDUSTRIES: Industry[] = [
  { id: 'medical', icon: Stethoscope, featured: true },
  { id: 'legal', icon: Scale, featured: true },
  { id: 'it', icon: Cpu, featured: true },
  { id: 'mining', icon: Pickaxe, featured: true },
]

export const INDUSTRIES: Industry[] = [
  { id: 'engineering', icon: HardHat },
  { id: 'manufacturing', icon: Factory },
  { id: 'government', icon: Landmark },
  { id: 'healthcare', icon: Hospital },
  { id: 'finance', icon: Banknote },
  { id: 'education', icon: GraduationCap },
  { id: 'marketing', icon: Megaphone },
  { id: 'energy', icon: Flame },
]

export interface LanguagePair {
  a: string
  b: string
}

/**
 * The languages the agency translates between, as ISO 639-1 codes. Kept apart
 * from `routing.locales`, and deliberately longer: the site is published in
 * four languages, the service covers seven. Italian, Portuguese and Chinese
 * are translated but are not site locales, and adding one here must never turn
 * into adding one there.
 *
 * The order is the one the section renders the chips in. Adding a language
 * needs its name in `languages.names.*` for all four locales — the pairs below
 * and the footer column read from that one place.
 */
export const SERVICE_LANGUAGES = ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh'] as const

/**
 * Every combination of the languages above, in the order they are listed:
 * we translate between any two of them, in both directions, so enumerating
 * them by hand was only a chance to forget one (7 languages make 21 pairs).
 *
 * These no longer render as visible copy — twenty-one rows read as a wall of
 * text. They now exist only as an OfferCatalog in the home page's JSON-LD, so
 * the pair phrasing the ads target stays machine-readable without costing the
 * page any height.
 */
export const LANGUAGE_PAIRS: LanguagePair[] = SERVICE_LANGUAGES.flatMap((a, index) =>
  SERVICE_LANGUAGES.slice(index + 1).map((b) => ({ a, b }))
)

/** Message keys under languages.preservation. */
export const LANGUAGE_PRESERVATION = ['meaning', 'tone', 'context', 'nuance'] as const

export interface Feature {
  /** Message key under about.features. */
  id: string
  icon: LucideIcon
}

export const WHY_CHOOSE_US: Feature[] = [
  { id: 'native', icon: Languages },
  { id: 'certified', icon: Award },
  { id: 'specialists', icon: BookOpenCheck },
  { id: 'fast', icon: Zap },
  { id: 'confidentiality', icon: Lock },
  { id: 'pricing', icon: HandCoins },
  { id: 'quality', icon: SearchCheck },
  { id: 'human', icon: PenLine },
  { id: 'support', icon: Handshake },
  { id: 'global', icon: Globe2 },
]

export interface ProcessStep {
  /** Message key under process.steps. */
  id: string
  icon: LucideIcon
}

export const PROCESS_STEPS: ProcessStep[] = [
  { id: 'chat', icon: MessageCircle },
  { id: 'quote', icon: ReceiptText },
  { id: 'translate', icon: PenLine },
  { id: 'deliver', icon: PackageCheck },
]

export interface AiPoint {
  /** Message key under ai.points. */
  id: string
  icon: LucideIcon
}

/** Human oversight leads: paid traffic must never read this section as "machine translation". */
export const AI_POINTS: AiPoint[] = [
  { id: 'human', icon: ShieldCheck },
  { id: 'speed', icon: Sparkles },
  { id: 'consistency', icon: BrainCircuit },
]

/** Message keys under stats.items; values live in the messages so each locale formats numbers natively. */
export const STATS = ['documents', 'clients', 'specialists', 'satisfaction', 'years'] as const

/** Message keys under faq.items, in display order. */
export const FAQS = [
  'cost',
  'turnaround',
  'certified',
  'official',
  'confidentiality',
  'formats',
  'payment',
  'revisions',
  'quality',
  'rush',
  'business',
  'languages',
  'quote',
] as const

export type FaqId = (typeof FAQS)[number]

export interface LandingTopic {
  /** Message key under landing.*, and the services.items.* entry the page draws from. */
  id: 'certified' | 'legal' | 'technical' | 'medical'
  icon: LucideIcon
  /** Route as declared in the routing pathnames. */
  pathname: '/certified-translation' | '/legal-translation' | '/technical-translation' | '/medical-translation'
  /** Subset of the FAQ shown on the landing page, most relevant first. */
  faqs: readonly FaqId[]
}

/** Standalone landing pages for the ad groups with the strongest commercial intent. */
export const LANDING_TOPICS: LandingTopic[] = [
  {
    id: 'certified',
    icon: BadgeCheck,
    pathname: '/certified-translation',
    faqs: ['certified', 'official', 'cost', 'turnaround', 'rush'],
  },
  {
    id: 'legal',
    icon: Scale,
    pathname: '/legal-translation',
    faqs: ['confidentiality', 'cost', 'turnaround', 'quality'],
  },
  {
    id: 'technical',
    icon: Cog,
    pathname: '/technical-translation',
    faqs: ['formats', 'quality', 'cost', 'turnaround'],
  },
  {
    id: 'medical',
    icon: HeartPulse,
    pathname: '/medical-translation',
    faqs: ['confidentiality', 'quality', 'cost', 'turnaround'],
  },
]

export const CONTACT = {
  email: 'info@translations.bluelab.ar',
  /**
   * Applications from translators, kept apart from the customer address so a
   * CV never lands in the quote inbox and the two can be filtered separately.
   */
  jobsEmail: 'jobs@translations.bluelab.ar',
} as const

/**
 * Public profiles, published as the Organization `sameAs` so crawlers can tie
 * the site and the account to one entity. Handle and URL are kept together
 * because both are rendered: the handle as the link text, the URL as the href.
 */
export const SOCIAL = {
  instagram: {
    handle: '@translations.bluelab',
    url: 'https://www.instagram.com/translations.bluelab/',
  },
} as const

/** Every social profile URL, in the order `sameAs` should list them. */
export const SOCIAL_PROFILE_URLS = Object.values(SOCIAL).map((profile) => profile.url)
