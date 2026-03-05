'use client';

import { useTranslations } from 'next-intl';
import { CodeBlock } from './CodeBlock';

export function StepDeploy() {
  const t = useTranslations('setup.steps.deploy');

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-[#1a1a1a]">{t('title')}</h2>

      {/* Local dev */}
      <div>
        <h3 className="text-xs font-semibold text-[#1a1a1a] mb-1">{t('localTitle')}</h3>
        <p className="text-xs text-[#555] mb-1">{t('localDesc')}</p>
        <CodeBlock code="npm run dev" language="bash" />
        <p className="text-xs text-[#555]">{t('localUrl')}</p>
      </div>

      {/* Vercel */}
      <div className="border-t border-[#e8e8e0] pt-4">
        <h3 className="text-xs font-semibold text-[#1a1a1a] mb-1">{t('vercelTitle')}</h3>
        <p className="text-xs text-[#555] mb-2">{t('vercelDesc')}</p>
        <ol className="space-y-1.5 list-decimal list-inside text-xs text-[#555]">
          <li>{t('vercelStep1')}</li>
          <li>{t('vercelStep2')}</li>
          <li>{t('vercelStep3')}</li>
          <li>{t('vercelStep4')}</li>
        </ol>

        <p className="text-xs text-[#555] mt-3">{t('vercelAlt')}</p>
        <CodeBlock code="npx vercel --yes --prod" language="bash" />
      </div>

      {/* PWA note */}
      <div className="bg-[#faf9f5] rounded-lg border border-[#e8e8e0] p-4">
        <h4 className="text-xs font-semibold text-[#1a1a1a] mb-1">{t('pwaNoteTitle')}</h4>
        <p className="text-[11px] text-[#555]">{t('pwaNoteDesc')}</p>
      </div>
    </div>
  );
}
