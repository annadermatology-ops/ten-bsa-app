'use client';

import { useLocale } from 'next-intl';
import type { StudySite } from '@/lib/supabase/types';

interface SiteLabelProps {
  sites: StudySite[];
  siteKey: string;
  className?: string;
}

export function SiteLabel({ sites, siteKey, className }: SiteLabelProps) {
  const locale = useLocale();
  const site = sites.find((s) => s.key === siteKey);
  const name = site
    ? site.display_names[locale] || site.display_names['en'] || siteKey
    : siteKey;

  return className ? <span className={className}>{name}</span> : <>{name}</>;
}
