'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CodeBlock } from './CodeBlock';

interface SiteEntry {
  key: string;
  displayEn: string;
  displayFr: string;
}

const DEFAULT_SITES: SiteEntry[] = [
  { key: 'boston', displayEn: 'Boston, USA', displayFr: 'Boston, États-Unis' },
  { key: 'london', displayEn: 'London, UK', displayFr: 'Londres, Royaume-Uni' },
];

export function StepCustomiseSites() {
  const t = useTranslations('setup.steps.sites');
  const [sites, setSites] = useState<SiteEntry[]>(DEFAULT_SITES);

  const updateSite = (index: number, field: keyof SiteEntry, value: string) => {
    const updated = [...sites];
    if (field === 'key') {
      value = value.toLowerCase().replace(/[^a-z]/g, '');
    }
    updated[index] = { ...updated[index], [field]: value };
    setSites(updated);
  };

  const addSite = () => {
    setSites([...sites, { key: '', displayEn: '', displayFr: '' }]);
  };

  const removeSite = (index: number) => {
    if (sites.length <= 1) return;
    setSites(sites.filter((_, i) => i !== index));
  };

  const validSites = sites.filter(s => s.key.length > 0);
  const keys = validSites.map(s => s.key);

  // Generated outputs
  const genEnum = `CREATE TYPE study_site AS ENUM (${keys.map(k => `'${k}'`).join(', ')});`;

  const genAlterType = keys.length > 0
    ? `-- Drop and recreate the enum (only if no data references it yet)\nDROP TYPE study_site;\n${genEnum}`
    : '';

  const genType = `export type Site = ${keys.map(k => `'${k}'`).join(' | ')};`;

  const genOptions = keys.map(k => {
    const site = validSites.find(s => s.key === k)!;
    return `                  <option value="${k}">{t('admin.sites.${k}')}</option>`;
  }).join('\n');

  const genI18nEn = `"sites": {\n${validSites.map(s => `      "${s.key}": "${s.displayEn}"`).join(',\n')}\n    }`;
  const genI18nFr = `"sites": {\n${validSites.map(s => `      "${s.key}": "${s.displayFr}"`).join(',\n')}\n    }`;

  const genDefault = keys.length > 0
    ? `const [formSite, setFormSite] = useState<Site>('${keys[0]}');`
    : '';

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-[#1a1a1a]">{t('title')}</h2>
      <p className="text-sm text-[#555] leading-relaxed">{t('description')}</p>

      {/* Site entry form */}
      <div className="space-y-3">
        {sites.map((site, i) => (
          <div key={i} className="flex flex-wrap gap-2 items-end bg-[#faf9f5] rounded-lg border border-[#e8e8e0] p-3">
            <div className="flex-1 min-w-[100px]">
              <label className="block text-[10px] font-semibold text-[#888] mb-0.5">
                {t('siteKey')}
              </label>
              <input
                type="text"
                value={site.key}
                onChange={e => updateSite(i, 'key', e.target.value)}
                placeholder="e.g. boston"
                className="w-full px-2 py-1.5 rounded border border-[#d0d0c8] text-xs font-mono
                           focus:outline-none focus:ring-1 focus:ring-[#c95a8a]/30 focus:border-[#c95a8a]
                           placeholder:text-[#bbb]"
              />
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-[10px] font-semibold text-[#888] mb-0.5">
                {t('siteDisplayEn')}
              </label>
              <input
                type="text"
                value={site.displayEn}
                onChange={e => updateSite(i, 'displayEn', e.target.value)}
                placeholder="e.g. Boston, USA"
                className="w-full px-2 py-1.5 rounded border border-[#d0d0c8] text-xs
                           focus:outline-none focus:ring-1 focus:ring-[#c95a8a]/30 focus:border-[#c95a8a]
                           placeholder:text-[#bbb]"
              />
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-[10px] font-semibold text-[#888] mb-0.5">
                {t('siteDisplayFr')}
              </label>
              <input
                type="text"
                value={site.displayFr}
                onChange={e => updateSite(i, 'displayFr', e.target.value)}
                placeholder="e.g. Boston, États-Unis"
                className="w-full px-2 py-1.5 rounded border border-[#d0d0c8] text-xs
                           focus:outline-none focus:ring-1 focus:ring-[#c95a8a]/30 focus:border-[#c95a8a]
                           placeholder:text-[#bbb]"
              />
            </div>
            {sites.length > 1 && (
              <button
                onClick={() => removeSite(i)}
                className="text-[10px] text-red-500 hover:text-red-700 cursor-pointer pb-1"
              >
                {t('removeSite')}
              </button>
            )}
          </div>
        ))}

        <button
          onClick={addSite}
          className="text-xs text-[#c95a8a] hover:text-[#b44d7a] font-medium cursor-pointer"
        >
          + {t('addSite')}
        </button>
      </div>

      <p className="text-[10px] text-[#999]">{t('validation')}</p>

      {/* Generated code sections */}
      {validSites.length > 0 && (
        <div className="border-t border-[#e8e8e0] pt-4 space-y-4">
          <h3 className="text-xs font-semibold text-[#1a1a1a]">{t('generated')}</h3>

          <div>
            <p className="text-[11px] text-[#555] font-medium">{t('genSqlTitle')}</p>
            <CodeBlock code={genEnum} language="sql" />
          </div>

          <div>
            <p className="text-[11px] text-[#555] font-medium">{t('alreadyRan')}</p>
            <CodeBlock code={genAlterType} language="sql" />
          </div>

          <div>
            <p className="text-[11px] text-[#555] font-medium">{t('genTypeTitle')}</p>
            <CodeBlock code={genType} language="typescript" fileName="src/lib/supabase/types.ts" />
          </div>

          <div>
            <p className="text-[11px] text-[#555] font-medium">{t('genUiTitle')}</p>
            <ul className="text-[10px] text-[#888] ml-3 mb-1 space-y-0.5">
              <li>{t('genUiFile1')}</li>
              <li>{t('genUiFile2')}</li>
              <li>{t('genUiFile3')}</li>
            </ul>
            <p className="text-[10px] text-[#888] mb-1">{t('genUiReplace')}</p>
            <CodeBlock code={genOptions} language="tsx" />
          </div>

          <div>
            <p className="text-[11px] text-[#555] font-medium">{t('genI18nTitle')}</p>
            <p className="text-[10px] text-[#888] mt-1">{t('genI18nEn')}</p>
            <CodeBlock code={genI18nEn} language="json" fileName="messages/en.json" />
            <p className="text-[10px] text-[#888] mt-1">{t('genI18nFr')}</p>
            <CodeBlock code={genI18nFr} language="json" fileName="messages/fr.json" />
          </div>

          <div>
            <p className="text-[11px] text-[#555] font-medium">{t('genDefaultTitle')}</p>
            <CodeBlock code={genDefault} language="typescript" />
          </div>
        </div>
      )}
    </div>
  );
}
