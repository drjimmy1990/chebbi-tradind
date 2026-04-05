/**
 * Generate a URL-friendly slug from a French title.
 * Handles accented characters (é→e, à→a, ç→c, etc.)
 */
export function slugify(text: string): string {
  return text
    .normalize('NFD')                    // Decompose accents: é → e + ́
    .replace(/[\u0300-\u036f]/g, '')     // Strip combining diacritical marks
    .replace(/[^\w\s-]/g, '')            // Remove non-word chars (keeps letters, digits, spaces, hyphens)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')               // Spaces → hyphens
    .replace(/-+/g, '-')                // Collapse multiple hyphens
    .replace(/^-+|-+$/g, '');           // Trim leading/trailing hyphens
}
