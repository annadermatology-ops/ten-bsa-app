'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { setLocale } from '@/i18n/actions';

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const toggleLocale = () => {
    const newLocale = locale === 'en' ? 'fr' : 'en';
    startTransition(async () => {
      await setLocale(newLocale);
      router.refresh();
    });
  };

  // Show the flag of the OTHER language (i.e. "switch to this")
  const flag = locale === 'en' ? '\u{1F1EB}\u{1F1F7}' : '\u{1F1EC}\u{1F1E7}';
  const label = locale === 'en' ? 'Passer en fran\u00e7ais' : 'Switch to English';

  return (
    <button
      onClick={toggleLocale}
      disabled={isPending}
      className="px-1.5 py-1 rounded border border-[#b0b0a8] bg-white cursor-pointer active:bg-[#ddd] disabled:opacity-50 min-w-[32px] text-base leading-none"
      title={label}
      aria-label={label}
    >
      {isPending ? '\u2026' : flag}
    </button>
  );
}
