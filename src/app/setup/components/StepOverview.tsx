'use client';

import { useTranslations } from 'next-intl';

export function StepOverview() {
  const t = useTranslations('setup.steps.overview');

  const items = [
    t('github'),
    t('supabase'),
    t('vercel'),
    t('deepl'),
    t('node'),
    t('cli'),
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-[#1a1a1a]">{t('title')}</h2>
      <p className="text-sm text-[#555] leading-relaxed">{t('description')}</p>

      <div className="bg-[#faf9f5] rounded-lg border border-[#e8e8e0] p-4">
        <h3 className="text-xs font-semibold text-[#1a1a1a] mb-2">{t('whatYouNeed')}</h3>
        <ul className="space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-[#555]">
              <span className="text-[#c95a8a] mt-0.5">&#10003;</span>
              {item}
            </li>
          ))}
        </ul>
        <p className="text-[10px] text-[#999] mt-3">{t('timeEstimate')}</p>
      </div>
    </div>
  );
}
