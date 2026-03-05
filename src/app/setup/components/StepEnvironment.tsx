'use client';

import { useTranslations } from 'next-intl';
import { CodeBlock } from './CodeBlock';

const ENV_TEMPLATE = `NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DEEPL_API_KEY=your-deepl-api-key`;

export function StepEnvironment() {
  const t = useTranslations('setup.steps.envConfig');

  const notes = [
    { key: 'NEXT_PUBLIC_SUPABASE_URL', note: t('urlNote') },
    { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', note: t('anonNote') },
    { key: 'SUPABASE_SERVICE_ROLE_KEY', note: t('serviceNote') },
    { key: 'DEEPL_API_KEY', note: t('deeplNote') },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-[#1a1a1a]">{t('title')}</h2>
      <p className="text-sm text-[#555] leading-relaxed">{t('description')}</p>

      <div>
        <p className="text-xs text-[#555] mb-1">{t('step1')}</p>
        <CodeBlock code="cp .env.example .env.local" language="bash" />
      </div>

      <div>
        <p className="text-xs text-[#555] mb-1">{t('step2')}</p>
        <CodeBlock code={ENV_TEMPLATE} language="env" fileName=".env.local" />
      </div>

      <div className="bg-[#faf9f5] rounded-lg border border-[#e8e8e0] p-4 space-y-2">
        {notes.map(({ key, note }) => (
          <div key={key} className="text-xs text-[#555]">
            <span className="font-mono font-semibold text-[#c95a8a]">{key}</span>
            {' — '}
            {note}
          </div>
        ))}
      </div>

      <p className="text-[11px] text-[#888]">{t('deeplOptional')}</p>
    </div>
  );
}
