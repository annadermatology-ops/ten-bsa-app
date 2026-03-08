'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getExportData, type ExportRow } from '../actions';
import { generateCSV, downloadCSV } from '@/lib/csv';
import { SiteSelect } from '@/components/ui/SiteSelect';
import type { StudySite } from '@/lib/supabase/types';

interface ExportPanelProps {
  sites: StudySite[];
}

export function ExportPanel({ sites }: ExportPanelProps) {
  const t = useTranslations();
  const [siteFilter, setSiteFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [rowCount, setRowCount] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleExport() {
    startTransition(async () => {
      const data = await getExportData({
        siteFilter: siteFilter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });

      setRowCount(data.length);

      if (data.length === 0) return;

      // Build CSV from export rows
      const headers = [
        'Study ID',
        'Initials',
        'Patient Site',
        'Assessment Site',
        'Assessment Date',
        'TBSA %',
        'DBSA %',
        'Albumin (g/L)',
        'CRP (mg/L)',
        'SCORTEN',
        'Clinician',
        'Notes',
        'Translation',
      ];

      // Add region columns from first row if available
      const regionKeys = data.length > 0
        ? Object.keys(data[0].tbsa_regions).sort()
        : [];

      for (const key of regionKeys) {
        headers.push(`TBSA_${key}`);
      }
      for (const key of regionKeys) {
        headers.push(`DBSA_${key}`);
      }

      const rows = data.map((row: ExportRow) => {
        const base = [
          row.study_id,
          row.initials,
          row.patient_site,
          row.assessment_site,
          row.assessment_date,
          row.tbsa_percent.toFixed(1),
          row.dbsa_percent.toFixed(1),
          row.albumin_level !== null ? row.albumin_level.toFixed(1) : '',
          row.crp_level !== null ? row.crp_level.toFixed(1) : '',
          row.scorten_score !== null ? String(row.scorten_score) : '',
          row.clinician_name,
          row.notes ?? '',
          row.notes_translation ?? '',
        ];

        // Region breakdowns
        for (const key of regionKeys) {
          base.push(
            row.tbsa_regions[key] !== undefined
              ? row.tbsa_regions[key].toFixed(2)
              : '0',
          );
        }
        for (const key of regionKeys) {
          base.push(
            row.dbsa_regions[key] !== undefined
              ? row.dbsa_regions[key].toFixed(2)
              : '0',
          );
        }

        return base;
      });

      const csv = generateCSV(headers, rows);
      const now = new Date().toISOString().slice(0, 10);
      downloadCSV(csv, `ten-bsa-export-${now}.csv`);
    });
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-[#555] mb-1">
        {t('adminDashboard.export.title')}
      </h3>
      <p className="text-xs text-[#999] mb-4">
        {t('adminDashboard.export.description')}
      </p>

      <div className="bg-white rounded-xl border border-[#d0d0c8] p-4">
        <div className="flex flex-wrap gap-3 items-end mb-4">
          {/* Site filter */}
          <div>
            <label className="block text-[10px] font-semibold text-[#999] uppercase tracking-wide mb-1">
              {t('adminDashboard.export.siteFilter')}
            </label>
            <SiteSelect
              sites={sites}
              value={siteFilter}
              onChange={setSiteFilter}
              includeAll
              allLabel={t('adminDashboard.export.allSites')}
              className="py-1.5 text-xs"
            />
          </div>

          {/* Date from */}
          <div>
            <label className="block text-[10px] font-semibold text-[#999] uppercase tracking-wide mb-1">
              {t('adminDashboard.export.dateFrom')}
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-[#d0d0c8] focus:outline-none focus:ring-2 focus:ring-[#c95a8a]/30"
            />
          </div>

          {/* Date to */}
          <div>
            <label className="block text-[10px] font-semibold text-[#999] uppercase tracking-wide mb-1">
              {t('adminDashboard.export.dateTo')}
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-[#d0d0c8] focus:outline-none focus:ring-2 focus:ring-[#c95a8a]/30"
            />
          </div>

          {/* Export button */}
          <button
            onClick={handleExport}
            disabled={isPending}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#c95a8a] text-white
                       hover:bg-[#b44d7a] disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {isPending ? (
              <>
                <LoadingSpinner size="sm" />
                {t('adminDashboard.export.exporting')}
              </>
            ) : (
              t('adminDashboard.export.exportCsv')
            )}
          </button>
        </div>

        {/* Row count feedback */}
        {rowCount !== null && (
          <p className={`text-xs ${rowCount === 0 ? 'text-amber-600' : 'text-green-600'}`}>
            {rowCount === 0
              ? t('adminDashboard.export.noData')
              : `${rowCount} ${t('adminDashboard.export.rows')}`}
          </p>
        )}
      </div>
    </div>
  );
}
