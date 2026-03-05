'use client';

import { useTranslations } from 'next-intl';
import { CodeBlock } from './CodeBlock';
import { MIGRATIONS } from '../data/migrations';

export function StepMigrations() {
  const t = useTranslations('setup.steps.migrations');

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-[#1a1a1a]">{t('title')}</h2>
      <p className="text-sm text-[#555] leading-relaxed">{t('description')}</p>
      <p className="text-xs text-[#888]">{t('howTo')}</p>

      <div className="space-y-4">
        {MIGRATIONS.map((m, i) => (
          <div key={m.filename} className="border border-[#e8e8e0] rounded-lg overflow-hidden">
            <div className="bg-[#faf9f5] px-3 py-2 border-b border-[#e8e8e0]">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#c95a8a] text-white text-[10px] font-bold
                               flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-xs font-mono font-semibold text-[#1a1a1a]">{m.filename}</span>
              </div>
              <p className="text-[10px] text-[#888] mt-1 ml-7">
                {t(m.descriptionKey)}
              </p>
            </div>
            <div className="px-1">
              <CodeBlock code={m.sql} language="sql" fileName={m.filename} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
