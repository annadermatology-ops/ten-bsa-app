'use client';

import { useTranslations } from 'next-intl';

export type AdminTab = 'overview' | 'clinicians' | 'export' | 'auditLog';

interface AdminTabsProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}

const tabs: AdminTab[] = ['overview', 'clinicians', 'export', 'auditLog'];

export function AdminTabs({ activeTab, onTabChange }: AdminTabsProps) {
  const t = useTranslations('adminDashboard.tabs');

  return (
    <div className="flex border-b border-[#d0d0c8] overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === tab
              ? 'text-[#c95a8a] border-b-2 border-[#c95a8a] -mb-[1px]'
              : 'text-[#888] hover:text-[#555]'
          }`}
        >
          {t(tab)}
        </button>
      ))}
    </div>
  );
}
