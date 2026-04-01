import type { Language } from '@/lib/i18n';

/**
 * Helper to pick the correct language field from a trilingual database row.
 * Usage: pickLang(article, 'title', 'en') → returns article.titleEn
 */
export function pickLang(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  row: any,
  field: string,
  language: Language
): string {
  const suffix = language === 'fr' ? 'Fr' : language === 'en' ? 'En' : 'Ar';
  const key = `${field}${suffix}`;
  return (row[key] as string) || (row[`${field}Fr`] as string) || '';
}
