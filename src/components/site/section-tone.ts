/**
 * The two grounds sections alternate between down a page (see the note on
 * --background/--surface in globals.css: the seam between them is the page's
 * rhythm, so two of the same in a row read as one section).
 *
 * Most sections hard-code their own, because on the home page they only ever
 * appear in one order. The shared tail — FAQ and contact — is the exception:
 * the landing pages reach it having passed through one section fewer than the
 * home page, so the parity is opposite there and the caller has to say which
 * ground it lands on.
 */
export type SectionTone = 'surface' | 'background'

export const SECTION_TONE_CLASSES: Record<SectionTone, string> = {
  surface: 'bg-surface',
  background: 'bg-background',
}
