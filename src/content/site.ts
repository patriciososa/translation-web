import {
  Award,
  BadgeCheck,
  Banknote,
  BookOpenCheck,
  Captions,
  Cog,
  Cpu,
  Factory,
  Flame,
  Globe,
  GraduationCap,
  HandCoins,
  Handshake,
  HardHat,
  HeartPulse,
  Keyboard,
  LineChart,
  Megaphone,
  MessageCircle,
  PackageCheck,
  PenLine,
  Pickaxe,
  ReceiptText,
  Scale,
  SearchCheck,
  Speech,
  Stethoscope,
  UserCheck,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { SectionAnchor } from '@/i18n/routing'

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

/** Trade name: the Organization `alternateName`, and the quote assistant's header. */
export const COMPANY_ALTERNATE_NAME = `${COMPANY_NAME} ${COMPANY_TAGLINE}`

/** The verified Google Ads advertiser behind the brand; named on the site so a manual review can connect the two. */
export const COMPANY_OWNER = 'Patricio Gerardo Sosa'

/**
 * Ids double as header.nav.* message keys; `section` is the anchor it scrolls
 * to, whose slug is localized per locale in SECTION_ANCHORS. The two are
 * spelled out separately because they need not match.
 *
 * There is no "home" entry: the header logo is the link to the top of the
 * page.
 */
export const NAV_LINKS = [
  { id: 'services', section: 'services' },
  { id: 'industries', section: 'industries' },
  { id: 'languages', section: 'languages' },
  { id: 'about', section: 'about' },
  { id: 'process', section: 'process' },
  { id: 'faq', section: 'faq' },
  { id: 'contact', section: 'contact' },
] as const satisfies readonly { id: string; section: SectionAnchor }[]

export interface Service {
  /** Message key under services.items. */
  id: string
  icon: LucideIcon
  featured?: boolean
  /**
   * Heading for the expanded detail list, as a message key under `services`.
   * Defaults to "what we translate", which is true of every translation
   * service but not of transcription: a transcript of a Spanish recording in
   * Spanish is not a translation.
   */
  detailsLabel?: 'whatWeTranslate' | 'whatWeWorkWith'
}

/**
 * The agency sells two families of work, and the last one is not a translation
 * — the intake bot branches on the same distinction (`ai-operator-bot`,
 * `CollectedData.service_type`). Translation leads because it is what nearly
 * every visitor arrives for.
 */
export const SERVICES: Service[] = [
  { id: 'certified', icon: BadgeCheck, featured: true },
  { id: 'legal', icon: Scale },
  { id: 'medical', icon: HeartPulse },
  { id: 'technical', icon: Cog },
  { id: 'business', icon: LineChart },
  { id: 'localization', icon: Globe },
  { id: 'transcription', icon: Captions, detailsLabel: 'whatWeWorkWith' },
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
  // No 'healthcare' entry: it repeated the featured 'medical' industry one row
  // above, and two near-identical cards read as two different offerings.
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
 * three languages, the service covers seven. German, Italian, Portuguese and
 * Chinese are translated but are not site locales, and adding one here must
 * never turn into adding one there.
 *
 * The order is the one the section renders the chips in. Adding a language
 * needs its name in `languages.names.*` for all three locales — the pairs below
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
  /** Message key under the owning section's messages (e.g. about.features). */
  id: string
  icon: LucideIcon
}

/**
 * Rendered in a `sm:grid-cols-2` inside the narrower half of the about
 * section's split, so the count has to stay **even** or the last card is left
 * orphaned in its own row. Three columns do not fit: at ~209px a card cannot
 * hold the longest titles (German set that bar while the site was published in
 * it; the measurement has not been redone since). Dropping a claim means
 * dropping its pair partner or finding a replacement.
 */
export const WHY_CHOOSE_US: Feature[] = [
  { id: 'native', icon: Speech },
  { id: 'certified', icon: Award },
  { id: 'specialists', icon: BookOpenCheck },
  { id: 'fast', icon: Zap },
  { id: 'pricing', icon: HandCoins },
  { id: 'quality', icon: SearchCheck },
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

export interface ProjectMilestone {
  /** Message key under updates.milestones. */
  id: string
  icon: LucideIcon
}

/**
 * The milestones a project passes through once a quotation is accepted, in
 * order, matching `STEP_COUNT` and the `steps` arrays in the API's
 * emails/step-email.ts — the same six stages the customer is emailed about, so
 * a stage added or dropped there must be added or dropped here. Final payment
 * is absent for the same reason it is absent there: collecting money is not a
 * work stage and does not land at a fixed point in the flow.
 *
 * The first stage is the one wording difference: the email calls it "initial
 * payment", but on a public page that a visitor reads before they have even
 * asked for a quote, money as the opening milestone reads as a demand. Here it
 * is the coordination that stage actually consists of.
 *
 * Translation is a keyboard, not lucide's `Languages` glyph: that one is the
 * 文A mark of Google Translate, and on this step it told customers their
 * document would be machine-translated. The same goes for the native
 * translators card in WHY_CHOOSE_US — do not bring that icon back anywhere.
 */
export const PROJECT_MILESTONES: ProjectMilestone[] = [
  { id: 'coordination', icon: Handshake },
  { id: 'assignment', icon: UserCheck },
  { id: 'translation', icon: Keyboard },
  { id: 'review', icon: PenLine },
  { id: 'qa', icon: SearchCheck },
  { id: 'delivery', icon: PackageCheck },
]

/** Message keys under faq.items, in display order. */
export const FAQS = [
  'cost',
  'turnaround',
  'confidentiality',
  'payment',
  'revisions',
  'rush',
] as const

export type FaqId = (typeof FAQS)[number]

export interface LandingTopic {
  /** Message key under landing.*, and the services.items.* entry the page draws from. */
  id: 'certified' | 'legal' | 'technical' | 'medical' | 'transcription'
  icon: LucideIcon
  /** Route as declared in the routing pathnames. */
  pathname:
    | '/certified-translation'
    | '/legal-translation'
    | '/technical-translation'
    | '/medical-translation'
    | '/transcription-subtitling'
  /** Subset of the FAQ shown on the landing page, most relevant first. */
  faqs: readonly FaqId[]
}

/** Standalone landing pages for the ad groups with the strongest commercial intent. */
export const LANDING_TOPICS: LandingTopic[] = [
  {
    id: 'certified',
    icon: BadgeCheck,
    pathname: '/certified-translation',
    faqs: ['cost', 'turnaround', 'rush'],
  },
  {
    id: 'legal',
    icon: Scale,
    pathname: '/legal-translation',
    faqs: ['confidentiality', 'cost', 'turnaround'],
  },
  {
    id: 'technical',
    icon: Cog,
    pathname: '/technical-translation',
    faqs: ['cost', 'turnaround', 'confidentiality'],
  },
  {
    id: 'medical',
    icon: HeartPulse,
    pathname: '/medical-translation',
    faqs: ['confidentiality', 'cost', 'turnaround'],
  },
  // The one landing page that is not a translation: "transcripción" and
  // "subtitulado" are their own searches, and nothing above the fold on the
  // home page tells that visitor they are in the right place.
  {
    id: 'transcription',
    icon: Captions,
    pathname: '/transcription-subtitling',
    faqs: ['cost', 'turnaround', 'confidentiality'],
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
