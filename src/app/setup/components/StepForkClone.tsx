'use client';

import { useTranslations } from 'next-intl';
import { CodeBlock } from './CodeBlock';

const REPO_URL = 'https://github.com/annadermatology-ops/ten-bsa-app';

export function StepForkClone() {
  const t = useTranslations('setup.steps.forkClone');

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-[#1a1a1a]">{t('title')}</h2>
      <p className="text-sm text-[#555] leading-relaxed">{t('description')}</p>

      <div>
        <p className="text-xs text-[#555] mb-2">{t('step1')}</p>
        <a
          href={`${REPO_URL}/fork`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 rounded-lg bg-[#24292e] text-white text-xs font-semibold
                     hover:bg-[#3a3f44] transition-colors"
        >
          {t('forkButton')} &#8599;
        </a>
      </div>

      <div>
        <p className="text-xs text-[#555] mb-1">{t('step2')}</p>
        <CodeBlock
          language="bash"
          code={`git clone https://github.com/${t('repoPlaceholder')}/ten-bsa-app.git
cd ten-bsa-app
npm install`}
        />
      </div>
    </div>
  );
}
