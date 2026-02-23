'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getPatientOverview, type PatientOverviewRow } from '../actions';

export function PatientOverview() {
  const t = useTranslations();
  const router = useRouter();
  const [rows, setRows] = useState<PatientOverviewRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPatientOverview().then((data) => {
      setRows(data);
      setLoading(false);
    });
  }, []);

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="text-center py-12 text-[#888] text-sm">
        {t('adminDashboard.overview.noPatients')}
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-[#555] mb-3">
        {t('adminDashboard.overview.title')}
      </h3>
      <div className="bg-white rounded-xl border border-[#d0d0c8] overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="bg-[#f8f8f5] border-b border-[#d0d0c8]">
              <th className="text-left px-3 py-2 font-semibold text-[#555]">
                {t('patients.studyId')}
              </th>
              <th className="text-left px-3 py-2 font-semibold text-[#555]">
                {t('patients.initials')}
              </th>
              <th className="text-left px-3 py-2 font-semibold text-[#555]">
                {t('patients.site')}
              </th>
              <th className="text-center px-3 py-2 font-semibold text-[#555]">
                {t('adminDashboard.overview.assessments')}
              </th>
              <th className="text-right px-3 py-2 font-semibold text-[#555]">
                {t('adminDashboard.overview.latestTbsa')}
              </th>
              <th className="text-right px-3 py-2 font-semibold text-[#555]">
                {t('adminDashboard.overview.latestDbsa')}
              </th>
              <th className="text-center px-3 py-2 font-semibold text-[#555]">
                {t('adminDashboard.overview.scorten')}
              </th>
              <th className="text-left px-3 py-2 font-semibold text-[#555]">
                {t('adminDashboard.overview.lastAssessment')}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-[#eee] last:border-0 hover:bg-[#fafaf8] cursor-pointer"
                onClick={() => router.push(`/patients/${row.study_id}`)}
              >
                <td className="px-3 py-2 font-medium">{row.study_id}</td>
                <td className="px-3 py-2 text-[#666]">{row.initials}</td>
                <td className="px-3 py-2">{t(`admin.sites.${row.site}`)}</td>
                <td className="px-3 py-2 text-center">{row.assessment_count}</td>
                <td className="px-3 py-2 text-right">
                  {row.latest_tbsa !== null ? (
                    <span className="text-[#c95a8a] font-medium">
                      {row.latest_tbsa.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-[#ccc]">—</span>
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  {row.latest_dbsa !== null ? (
                    <span className="text-[#636e72] font-medium">
                      {row.latest_dbsa.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-[#ccc]">—</span>
                  )}
                </td>
                <td className="px-3 py-2 text-center">
                  {row.scorten_score !== null ? (
                    <span
                      className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded ${
                        row.scorten_score >= 5
                          ? 'bg-red-100 text-red-700'
                          : row.scorten_score >= 3
                            ? 'bg-orange-100 text-orange-700'
                            : row.scorten_score >= 2
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {row.scorten_score}/7
                    </span>
                  ) : (
                    <span className="text-[#ccc]">—</span>
                  )}
                </td>
                <td className="px-3 py-2 text-[#666]">
                  {row.last_assessment_date
                    ? formatDate(row.last_assessment_date)
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
