/**
 * Translation utility for clinical notes using DeepL API.
 *
 * Uses DeepL Free API (500,000 chars/month) — far more than this study needs.
 * Supports EN, FR, DE, ES, IT. Translates notes to English as common language
 * (or to French if source is English).
 *
 * Requires DEEPL_API_KEY environment variable.
 * Falls back gracefully: if translation fails, returns null.
 */

export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<string | null> {
  if (!text.trim()) return null;
  if (sourceLang === targetLang) return null;

  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) {
    console.warn('DEEPL_API_KEY not set — skipping translation');
    return null;
  }

  // DeepL Free API uses api-free.deepl.com; Pro uses api.deepl.com
  const baseUrl = apiKey.endsWith(':fx')
    ? 'https://api-free.deepl.com'
    : 'https://api.deepl.com';

  try {
    const response = await fetch(`${baseUrl}/v2/translate`, {
      method: 'POST',
      headers: {
        Authorization: `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: [text],
        source_lang: sourceLang.toUpperCase(),
        target_lang: targetLang.toUpperCase(),
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.warn(`DeepL API returned ${response.status}`);
      return null;
    }

    const data = await response.json();
    const translated = data.translations?.[0]?.text;

    if (translated && translated.toLowerCase() !== text.toLowerCase()) {
      return translated;
    }

    return null;
  } catch (err) {
    console.warn('Translation failed (non-critical):', err);
    return null;
  }
}
