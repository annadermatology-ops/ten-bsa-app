'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getAuditLog, type AuditLogEntry } from '../actions';

const PAGE_SIZE = 20;

const actionColors: Record<string, string> = {
  INSERT: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
};

export function AuditLogViewer() {
  const t = useTranslations();
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getAuditLog({ page, pageSize: PAGE_SIZE }).then((result) => {
      setEntries(result.entries);
      setTotalCount(result.totalCount);
      setLoading(false);
    });
  }, [page]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  function formatDateTime(dateStr: string) {
    return new Date(dateStr).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-[#555] mb-3">
        {t('adminDashboard.auditLog.title')}
      </h3>

      {entries.length === 0 ? (
        <div className="text-center py-12 text-[#888] text-sm">
          {t('adminDashboard.auditLog.noEntries')}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-[#d0d0c8] overflow-hidden overflow-x-auto">
            <table className="w-full text-xs min-w-[640px]">
              <thead>
                <tr className="bg-[#f8f8f5] border-b border-[#d0d0c8]">
                  <th className="text-left px-3 py-2 font-semibold text-[#555]">
                    {t('adminDashboard.auditLog.timestamp')}
                  </th>
                  <th className="text-left px-3 py-2 font-semibold text-[#555]">
                    {t('adminDashboard.auditLog.table')}
                  </th>
                  <th className="text-left px-3 py-2 font-semibold text-[#555]">
                    {t('adminDashboard.auditLog.action')}
                  </th>
                  <th className="text-left px-3 py-2 font-semibold text-[#555]">
                    {t('adminDashboard.auditLog.recordId')}
                  </th>
                  <th className="text-left px-3 py-2 font-semibold text-[#555]">
                    {t('adminDashboard.auditLog.performedBy')}
                  </th>
                  <th className="text-left px-3 py-2 font-semibold text-[#555]">
                    {t('adminDashboard.auditLog.details')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <>
                    <tr
                      key={entry.id}
                      className="border-b border-[#eee] last:border-0 hover:bg-[#fafaf8] cursor-pointer"
                      onClick={() =>
                        setExpandedId(expandedId === entry.id ? null : entry.id)
                      }
                    >
                      <td className="px-3 py-2 text-[#666] whitespace-nowrap">
                        {formatDateTime(entry.created_at)}
                      </td>
                      <td className="px-3 py-2">
                        <span className="font-mono text-[10px] bg-[#f0f0ea] px-1.5 py-0.5 rounded">
                          {entry.table_name}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            actionColors[entry.action] ?? 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {entry.action}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-mono text-[10px] text-[#888] max-w-[120px] truncate">
                        {entry.record_id.slice(0, 8)}…
                      </td>
                      <td className="px-3 py-2 text-[#666]">
                        {entry.performer_name ?? '—'}
                      </td>
                      <td className="px-3 py-2 text-[#999]">
                        {expandedId === entry.id ? '▼' : '▶'}
                      </td>
                    </tr>
                    {expandedId === entry.id && (
                      <tr key={`${entry.id}-detail`}>
                        <td colSpan={6} className="bg-[#f8f8f5] px-4 py-3">
                          <div className="space-y-2">
                            {entry.old_data && (
                              <div>
                                <span className="text-[10px] font-semibold text-[#999] uppercase">
                                  Old data
                                </span>
                                <pre className="text-[10px] text-[#666] bg-white p-2 rounded border border-[#e0e0d8] overflow-auto max-h-40">
                                  {JSON.stringify(entry.old_data, null, 2)}
                                </pre>
                              </div>
                            )}
                            {entry.new_data && (
                              <div>
                                <span className="text-[10px] font-semibold text-[#999] uppercase">
                                  New data
                                </span>
                                <pre className="text-[10px] text-[#666] bg-white p-2 rounded border border-[#e0e0d8] overflow-auto max-h-40">
                                  {JSON.stringify(entry.new_data, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-xs rounded-lg border border-[#d0d0c8] disabled:opacity-30 hover:bg-[#f0f0ea] transition-colors"
              >
                {t('adminDashboard.auditLog.previous')}
              </button>
              <span className="text-xs text-[#888]">
                {t('adminDashboard.auditLog.page')} {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 text-xs rounded-lg border border-[#d0d0c8] disabled:opacity-30 hover:bg-[#f0f0ea] transition-colors"
              >
                {t('adminDashboard.auditLog.next')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
