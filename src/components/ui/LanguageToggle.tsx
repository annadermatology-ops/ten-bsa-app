'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { setLocale } from '@/i18n/actions';
import { SUPPORTED_LOCALES } from '@/lib/supabase/types';

const LOCALE_LABELS: Record<string, string> = {
  en: '\u{1F1EC}\u{1F1E7} EN',
  fr: '\u{1F1EB}\u{1F1F7} FR',
  de: '\u{1F1E9}\u{1F1EA} DE',
  es: '\u{1F1EA}\u{1F1F8} ES',
  it: '\u{1F1EE}\u{1F1F9} IT',
  sr: '\u{1F1F7}\u{1F1F8} SR',
};

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleChange = (newLocale: string) => {
    if (newLocale === locale) return;
    startTransition(async () => {
      await setLocale(newLocale, true);
      router.refresh();
    });
  };

  return (
    <select
      value={locale}
      onChange={(e) => handleChange(e.target.value)}
      disabled={isPending}
      className="px-1.5 py-1 rounded border border-[#b0b0a8] bg-white text-xs font-semibold
                 cursor-pointer disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#c95a8a]/30"
      aria-label="Select language"
    >
      {SUPPORTED_LOCALES.map((loc) => (
        <option key={loc} value={loc}>
          {LOCALE_LABELS[loc] || loc.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
