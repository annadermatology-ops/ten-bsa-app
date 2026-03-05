'use client';

import { useTranslations } from 'next-intl';
import { CodeBlock } from './CodeBlock';

const ADMIN_SQL = `INSERT INTO clinicians (id, email, full_name, role, site)
VALUES (
  'paste-auth-user-uuid-here',
  'admin@yourhospital.com',
  'Dr. Your Name',
  'admin',
  'your-site-key'  -- must match one of your study_site enum values
);`;

export function StepCreateAdmin() {
  const t = useTranslations('setup.steps.adminUser');

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-[#1a1a1a]">{t('title')}</h2>
      <p className="text-sm text-[#555] leading-relaxed">{t('description')}</p>

      <ol className="space-y-2 list-decimal list-inside text-xs text-[#555]">
        <li>{t('step1')}</li>
        <li>{t('step2')}</li>
        <li>{t('step3')}</li>
        <li>{t('step4')}</li>
      </ol>

      <CodeBlock code={ADMIN_SQL} language="sql" />

      <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
        <p className="text-[11px] text-amber-800">{t('sqlNote')}</p>
      </div>
    </div>
  );
}
