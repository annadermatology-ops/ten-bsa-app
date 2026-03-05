'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { createStudySite, updateStudySite } from '../actions';
import { SUPPORTED_LOCALES, type StudySite } from '@/lib/supabase/types';

const LOCALE_LABELS: Record<string, string> = {
  en: 'English',
  fr: 'Fran\u00e7ais',
  de: 'Deutsch',
  es: 'Espa\u00f1ol',
  it: 'Italiano',
  sr: 'Srpski',
};

interface SiteManagementProps {
  initialSites: StudySite[];
  onRefresh: () => void;
}

export function SiteManagement({ initialSites, onRefresh }: SiteManagementProps) {
  const t = useTranslations('adminDashboard.sites');
  const [sites, setSites] = useState<StudySite[]>(initialSites);
  const [showDialog, setShowDialog] = useState(false);
  const [editingSite, setEditingSite] = useState<StudySite | null>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [formKey, setFormKey] = useState('');
  const [formDisplayNames, setFormDisplayNames] = useState<Record<string, string>>({});
  const [formDefaultLang, setFormDefaultLang] = useState('en');
  const [formSortOrder, setFormSortOrder] = useState(0);
  const [formLatitude, setFormLatitude] = useState('');
  const [formLongitude, setFormLongitude] = useState('');

  function openAdd() {
    setEditingSite(null);
    setFormKey('');
    setFormDisplayNames({});
    setFormDefaultLang('en');
    setFormSortOrder(sites.length);
    setFormLatitude('');
    setFormLongitude('');
    setShowDialog(true);
    setMessage(null);
  }

  function openEdit(site: StudySite) {
    setEditingSite(site);
    setFormKey(site.key);
    setFormDisplayNames({ ...site.display_names });
    setFormDefaultLang(site.default_language);
    setFormSortOrder(site.sort_order);
    setFormLatitude(site.latitude != null ? String(site.latitude) : '');
    setFormLongitude(site.longitude != null ? String(site.longitude) : '');
    setShowDialog(true);
    setMessage(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const parsedLat = formLatitude.trim() ? parseFloat(formLatitude) : null;
    const parsedLng = formLongitude.trim() ? parseFloat(formLongitude) : null;

    startTransition(async () => {
      if (editingSite) {
        const result = await updateStudySite(editingSite.key, {
          displayNames: formDisplayNames,
          defaultLanguage: formDefaultLang,
          sortOrder: formSortOrder,
          latitude: parsedLat,
          longitude: parsedLng,
        });
        if (result.error) {
          setMessage({ type: 'error', text: result.error });
        } else {
          setMessage({ type: 'success', text: t('updateSuccess') });
          setShowDialog(false);
          setSites((prev) =>
            prev.map((s) =>
              s.key === editingSite.key
                ? { ...s, display_names: formDisplayNames, default_language: formDefaultLang, sort_order: formSortOrder, latitude: parsedLat, longitude: parsedLng }
                : s
            )
          );
          onRefresh();
        }
      } else {
        const result = await createStudySite({
          key: formKey.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
          displayNames: formDisplayNames,
          defaultLanguage: formDefaultLang,
          sortOrder: formSortOrder,
          latitude: parsedLat,
          longitude: parsedLng,
        });
        if (result.error) {
          setMessage({ type: 'error', text: result.error });
        } else {
          setMessage({ type: 'success', text: t('createSuccess') });
          setShowDialog(false);
          onRefresh();
        }
      }
    });
  }

  function handleToggleActive(site: StudySite) {
    startTransition(async () => {
      const result = await updateStudySite(site.key, { isActive: !site.is_active });
      if (result.error) {
        setMessage({ type: 'error', text: result.error });
      } else {
        setSites((prev) =>
          prev.map((s) => (s.key === site.key ? { ...s, is_active: !s.is_active } : s))
        );
      }
    });
  }

  return (
    <div>
      {message && (
        <div
          className={`mb-4 px-4 py-2 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-[#555]">{t('title')}</h3>
        <button
          onClick={openAdd}
          className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#c95a8a] text-white
                     hover:bg-[#b44d7a] active:bg-[#a0426c] transition-colors"
        >
          + {t('addSite')}
        </button>
      </div>

      {sites.length === 0 ? (
        <div className="text-center py-12 text-[#888] text-sm">{t('noSites')}</div>
      ) : (
        <div className="bg-white rounded-xl border border-[#d0d0c8] overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="bg-[#f8f8f5] border-b border-[#d0d0c8]">
                <th className="text-left px-3 py-2.5 font-semibold text-[#555] whitespace-nowrap">
                  {t('key')}
                </th>
                <th className="text-left px-3 py-2.5 font-semibold text-[#555] whitespace-nowrap">
                  {t('displayName')}
                </th>
                <th className="text-left px-3 py-2.5 font-semibold text-[#555] whitespace-nowrap">
                  {t('defaultLang')}
                </th>
                <th className="text-left px-3 py-2.5 font-semibold text-[#555] whitespace-nowrap">
                  {t('order')}
                </th>
                <th className="text-left px-3 py-2.5 font-semibold text-[#555] whitespace-nowrap">
                  {t('status')}
                </th>
                <th className="text-right px-3 py-2.5 font-semibold text-[#555] whitespace-nowrap">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sites.map((site) => (
                <tr key={site.key} className="border-b border-[#eee] last:border-0">
                  <td className="px-3 py-2.5 font-mono text-xs">{site.key}</td>
                  <td className="px-3 py-2.5 text-xs">
                    {site.display_names['en'] || site.key}
                  </td>
                  <td className="px-3 py-2.5 text-xs">
                    {LOCALE_LABELS[site.default_language] || site.default_language}
                  </td>
                  <td className="px-3 py-2.5 text-xs">{site.sort_order}</td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs whitespace-nowrap ${
                        site.is_active
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {site.is_active ? t('active') : t('inactive')}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(site)}
                        disabled={isPending}
                        className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
                      >
                        {t('edit')}
                      </button>
                      <button
                        onClick={() => handleToggleActive(site)}
                        disabled={isPending}
                        className="text-xs text-[#888] hover:text-[#333] disabled:opacity-50"
                      >
                        {site.is_active ? t('deactivate') : t('activate')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Site Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl border border-[#d0d0c8] shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-semibold mb-4">
              {editingSite ? t('editTitle') : t('addTitle')}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Site key (only editable on create) */}
              <div>
                <label className="block text-xs font-semibold text-[#555] mb-1">
                  {t('key')}
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingSite}
                  value={formKey}
                  onChange={(e) => setFormKey(e.target.value)}
                  placeholder="e.g. germany"
                  pattern="[a-z][a-z0-9\-]*"
                  className="w-full px-3 py-2 rounded-lg border border-[#d0d0c8] text-sm font-mono
                             focus:outline-none focus:ring-2 focus:ring-[#c95a8a]/30 focus:border-[#c95a8a]
                             disabled:bg-[#f0f0ea] disabled:text-[#888]"
                />
                {!editingSite && (
                  <p className="text-[10px] text-[#999] mt-1">{t('keyHelp')}</p>
                )}
              </div>

              {/* Display names for each language */}
              <div>
                <label className="block text-xs font-semibold text-[#555] mb-2">
                  {t('displayNames')}
                </label>
                <div className="space-y-2">
                  {SUPPORTED_LOCALES.map((loc) => (
                    <div key={loc} className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#888] w-6 uppercase">{loc}</span>
                      <input
                        type="text"
                        value={formDisplayNames[loc] || ''}
                        onChange={(e) =>
                          setFormDisplayNames((prev) => ({ ...prev, [loc]: e.target.value }))
                        }
                        placeholder={`${LOCALE_LABELS[loc]} name`}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-[#d0d0c8] text-sm
                                   focus:outline-none focus:ring-2 focus:ring-[#c95a8a]/30 focus:border-[#c95a8a]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                {/* Default language */}
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-[#555] mb-1">
                    {t('defaultLang')}
                  </label>
                  <select
                    value={formDefaultLang}
                    onChange={(e) => setFormDefaultLang(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#d0d0c8] text-sm
                               focus:outline-none focus:ring-2 focus:ring-[#c95a8a]/30 focus:border-[#c95a8a]"
                  >
                    {SUPPORTED_LOCALES.map((loc) => (
                      <option key={loc} value={loc}>
                        {LOCALE_LABELS[loc]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort order */}
                <div className="w-24">
                  <label className="block text-xs font-semibold text-[#555] mb-1">
                    {t('order')}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formSortOrder}
                    onChange={(e) => setFormSortOrder(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-[#d0d0c8] text-sm
                               focus:outline-none focus:ring-2 focus:ring-[#c95a8a]/30 focus:border-[#c95a8a]"
                  />
                </div>
              </div>

              {/* Coordinates for geolocation */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-[#555] mb-1">
                    {t('latitude')}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formLatitude}
                    onChange={(e) => setFormLatitude(e.target.value)}
                    placeholder="e.g. 45.764"
                    className="w-full px-3 py-2 rounded-lg border border-[#d0d0c8] text-sm
                               focus:outline-none focus:ring-2 focus:ring-[#c95a8a]/30 focus:border-[#c95a8a]"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-[#555] mb-1">
                    {t('longitude')}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formLongitude}
                    onChange={(e) => setFormLongitude(e.target.value)}
                    placeholder="e.g. 4.8357"
                    className="w-full px-3 py-2 rounded-lg border border-[#d0d0c8] text-sm
                               focus:outline-none focus:ring-2 focus:ring-[#c95a8a]/30 focus:border-[#c95a8a]"
                  />
                </div>
              </div>

              {message?.type === 'error' && (
                <div className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
                  {message.text}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDialog(false);
                    setMessage(null);
                  }}
                  className="flex-1 py-2 text-sm rounded-lg border border-[#d0d0c8] hover:bg-[#f0f0ea] transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-2 text-sm font-semibold rounded-lg bg-[#c95a8a] text-white
                             hover:bg-[#b44d7a] disabled:opacity-50 transition-colors"
                >
                  {isPending ? t('saving') : editingSite ? t('save') : t('create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
