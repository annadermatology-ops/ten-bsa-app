'use client';

import { useLocale } from 'next-intl';
import type { StudySite } from '@/lib/supabase/types';

interface SiteSelectProps {
  sites: StudySite[];
  value: string;
  onChange: (value: string) => void;
  includeAll?: boolean;
  allLabel?: string;
  className?: string;
}

export function SiteSelect({
  sites,
  value,
  onChange,
  includeAll = false,
  allLabel = 'All Sites',
  className = '',
}: SiteSelectProps) {
  const locale = useLocale();

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`px-3 py-2 rounded-lg border border-[#d0d0c8] text-sm bg-white
                  focus:outline-none focus:ring-2 focus:ring-[#c95a8a]/30 focus:border-[#c95a8a] ${className}`}
    >
      {includeAll && <option value="">{allLabel}</option>}
      {sites.map((site) => (
        <option key={site.key} value={site.key}>
          {site.display_names[locale] || site.display_names['en'] || site.key}
        </option>
      ))}
    </select>
  );
}
