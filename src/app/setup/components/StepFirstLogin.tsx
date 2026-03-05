'use client';

import { useTranslations } from 'next-intl';

export function StepFirstLogin() {
  const t = useTranslations('setup.steps.firstLogin');

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-[#1a1a1a]">{t('title')}</h2>
      <p className="text-sm text-[#555] leading-relaxed">{t('description')}</p>

      {/* MFA */}
      <div className="bg-[#faf9f5] rounded-lg border border-[#e8e8e0] p-4">
        <h3 className="text-xs font-semibold text-[#1a1a1a] mb-1">{t('mfaTitle')}</h3>
        <p className="text-[11px] text-[#555]">{t('mfaDesc')}</p>
      </div>

      {/* Add clinicians */}
      <div className="bg-[#faf9f5] rounded-lg border border-[#e8e8e0] p-4">
        <h3 className="text-xs font-semibold text-[#1a1a1a] mb-1">{t('addClinicians')}</h3>
        <p className="text-[11px] text-[#555]">{t('addCliniciansDesc')}</p>
      </div>

      {/* Roles */}
      <div>
        <h3 className="text-xs font-semibold text-[#1a1a1a] mb-2">{t('rolesTitle')}</h3>
        <ul className="space-y-1">
          <li className="text-xs text-[#555] flex items-start gap-2">
            <span className="text-[#c95a8a] font-semibold">&#8226;</span>
            {t('roleClinician')}
          </li>
          <li className="text-xs text-[#555] flex items-start gap-2">
            <span className="text-[#c95a8a] font-semibold">&#8226;</span>
            {t('roleAdmin')}
          </li>
          <li className="text-xs text-[#555] flex items-start gap-2">
            <span className="text-[#c95a8a] font-semibold">&#8226;</span>
            {t('rolePi')}
          </li>
        </ul>
      </div>

      {/* Start */}
      <div className="bg-[#faf9f5] rounded-lg border border-[#e8e8e0] p-4">
        <h3 className="text-xs font-semibold text-[#1a1a1a] mb-1">{t('startTitle')}</h3>
        <p className="text-[11px] text-[#555]">{t('startDesc')}</p>
      </div>

      {/* Success banner */}
      <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-center">
        <p className="text-sm font-semibold text-green-800">{t('congratulations')}</p>
      </div>
    </div>
  );
}
