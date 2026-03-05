'use client';

import { useTranslations } from 'next-intl';

export function StepCreateSupabase() {
  const t = useTranslations('setup.steps.supabase');

  const keys = [
    { label: t('keyUrl'), desc: t('keyUrlDesc') },
    { label: t('keyAnon'), desc: t('keyAnonDesc') },
    { label: t('keyService'), desc: t('keyServiceDesc') },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-[#1a1a1a]">{t('title')}</h2>
      <p className="text-sm text-[#555] leading-relaxed">{t('description')}</p>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-[#555] mb-2">{t('step1')}</p>
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 rounded-lg bg-[#3ecf8e] text-white text-xs font-semibold
                       hover:bg-[#38b87f] transition-colors"
          >
            {t('openDashboard')} &#8599;
          </a>
        </div>

        <p className="text-xs text-[#555]">{t('step2')}</p>
        <p className="text-xs text-[#555]">{t('step3Region')}</p>

        <div className="bg-[#faf9f5] rounded-lg border border-[#e8e8e0] p-4">
          <p className="text-xs font-semibold text-[#1a1a1a] mb-2">{t('step4Keys')}</p>
          <ul className="space-y-2">
            {keys.map((key, i) => (
              <li key={i} className="text-xs text-[#555]">
                <span className="font-mono font-semibold text-[#c95a8a]">{key.label}</span>
                {' — '}
                {key.desc}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
