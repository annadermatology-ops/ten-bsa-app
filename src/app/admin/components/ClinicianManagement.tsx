'use client';

import { useEffect, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import {
  listClinicians,
  inviteClinician,
  toggleClinicianActive,
  updateClinicianRole,
  resendInvite,
  getClinicianMfaStatuses,
  resetClinicianMfa,
  resetClinicianPassword,
  type ClinicianMfaStatus,
} from '../actions';
import { SiteSelect } from '@/components/ui/SiteSelect';
import { SiteLabel } from '@/components/ui/SiteLabel';
import type { Role, Site, Database, StudySite } from '@/lib/supabase/types';

type Clinician = Database['public']['Tables']['clinicians']['Row'];

interface ClinicianManagementProps {
  currentUser: Clinician;
  initialClinicians: Clinician[];
  sites: StudySite[];
  onRefresh: () => void;
}

export function ClinicianManagement({
  currentUser,
  initialClinicians,
  sites,
  onRefresh,
}: ClinicianManagementProps) {
  const t = useTranslations();
  const [clinicians, setClinicians] = useState<Clinician[]>(initialClinicians);
  const [mfaStatuses, setMfaStatuses] = useState<Record<string, boolean>>({});
  const [showDialog, setShowDialog] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Invite form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<Role>('clinician');
  const [formSite, setFormSite] = useState<Site>(sites.length > 0 ? sites[0].key : '');

  // Reset password dialog state
  const [resetPwClinicianId, setResetPwClinicianId] = useState<string | null>(null);
  const [resetPwValue, setResetPwValue] = useState('');

  // Change role dialog state
  const [roleEditClinicianId, setRoleEditClinicianId] = useState<string | null>(null);
  const [roleEditValue, setRoleEditValue] = useState<Role>('clinician');

  // Load MFA statuses on mount and when clinicians change
  useEffect(() => {
    loadMfaStatuses(clinicians);
  }, []);

  async function loadMfaStatuses(list: Clinician[]) {
    if (list.length === 0) return;
    const statuses = await getClinicianMfaStatuses(list.map((c) => c.id));
    const map: Record<string, boolean> = {};
    statuses.forEach((s) => {
      map[s.clinicianId] = s.hasMfa;
    });
    setMfaStatuses(map);
  }

  async function reload() {
    const list = await listClinicians();
    setClinicians(list);
    await loadMfaStatuses(list);
    onRefresh();
  }

  function handleResetMfa(clinicianId: string) {
    if (!confirm(t('mfa.resetConfirm'))) return;

    startTransition(async () => {
      const result = await resetClinicianMfa(clinicianId);
      if (result.error) {
        setMessage({ type: 'error', text: result.error });
      } else {
        setMessage({ type: 'success', text: t('mfa.resetSuccess') });
        await reload();
      }
    });
  }

  function handleResetPassword() {
    if (!resetPwClinicianId || !resetPwValue) return;

    startTransition(async () => {
      const result = await resetClinicianPassword(resetPwClinicianId, resetPwValue);
      if (result.error) {
        setMessage({ type: 'error', text: result.error });
      } else {
        setMessage({ type: 'success', text: t('admin.resetPasswordSuccess') });
      }
      setResetPwClinicianId(null);
      setResetPwValue('');
    });
  }

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const result = await inviteClinician({
        email: formEmail,
        fullName: formName,
        role: formRole,
        site: formSite,
      });

      if (result.error) {
        setMessage({ type: 'error', text: result.error });
      } else {
        setMessage({ type: 'success', text: t('admin.dialog.inviteSent', { email: formEmail }) });
        setShowDialog(false);
        setFormName('');
        setFormEmail('');
        setFormRole('clinician');
        setFormSite(sites.length > 0 ? sites[0].key : '');
        await reload();
      }
    });
  }

  function handleToggleActive(id: string, currentlyActive: boolean) {
    startTransition(async () => {
      await toggleClinicianActive(id, !currentlyActive);
      await reload();
    });
  }

  function openRoleEdit(clinician: Clinician) {
    setRoleEditClinicianId(clinician.id);
    setRoleEditValue(clinician.role as Role);
  }

  function handleRoleChange() {
    if (!roleEditClinicianId) return;

    startTransition(async () => {
      const result = await updateClinicianRole(roleEditClinicianId, roleEditValue);
      if (result.error) {
        setMessage({ type: 'error', text: result.error });
      } else {
        setMessage({ type: 'success', text: t('admin.changeRoleSuccess') });
        await reload();
      }
      setRoleEditClinicianId(null);
    });
  }

  function handleResendInvite(clinicianId: string) {
    startTransition(async () => {
      const result = await resendInvite(clinicianId);
      if (result.error) {
        setMessage({ type: 'error', text: result.error });
      } else {
        setMessage({ type: 'success', text: t('admin.resendInviteSuccess') });
      }
    });
  }

  return (
    <div>
      {/* Message banner */}
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

      {/* Invite clinician button */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-[#555]">
          {t('admin.title')}
        </h3>
        <button
          onClick={() => setShowDialog(true)}
          className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#c95a8a] text-white
                     hover:bg-[#b44d7a] active:bg-[#a0426c] transition-colors"
        >
          + {t('admin.inviteClinician')}
        </button>
      </div>

      {/* Clinicians table */}
      {clinicians.length === 0 ? (
        <div className="text-center py-12 text-[#888] text-sm">
          {t('admin.noClinicians')}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#d0d0c8] overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="bg-[#f8f8f5] border-b border-[#d0d0c8]">
                <th className="text-left px-3 py-2.5 font-semibold text-[#555] whitespace-nowrap">
                  {t('admin.name')}
                </th>
                <th className="text-left px-3 py-2.5 font-semibold text-[#555] whitespace-nowrap">
                  {t('admin.email')}
                </th>
                <th className="text-left px-3 py-2.5 font-semibold text-[#555] whitespace-nowrap">
                  {t('admin.role')}
                </th>
                <th className="text-left px-3 py-2.5 font-semibold text-[#555] whitespace-nowrap">
                  {t('admin.site')}
                </th>
                <th className="text-left px-3 py-2.5 font-semibold text-[#555] whitespace-nowrap">
                  {t('admin.status')}
                </th>
                <th className="text-left px-3 py-2.5 font-semibold text-[#555] whitespace-nowrap">
                  {t('mfa.mfaStatus')}
                </th>
                <th className="text-right px-3 py-2.5 font-semibold text-[#555] whitespace-nowrap">
                  {t('admin.actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {clinicians.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-[#eee] last:border-0"
                >
                  <td className="px-3 py-2.5 whitespace-nowrap">{c.full_name}</td>
                  <td className="px-3 py-2.5 text-[#666] whitespace-nowrap text-xs">{c.email}</td>
                  <td className="px-3 py-2.5">
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-[#f0f0ea] text-[#555] whitespace-nowrap">
                      {t(`admin.roles.${c.role}`)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-xs">
                    <SiteLabel sites={sites} siteKey={c.site} />
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs whitespace-nowrap ${
                        c.is_active
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {c.is_active ? t('admin.active') : t('admin.inactive')}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs whitespace-nowrap ${
                        mfaStatuses[c.id]
                          ? 'bg-green-50 text-green-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {mfaStatuses[c.id]
                        ? t('mfa.enrolled')
                        : t('mfa.notEnrolled')}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      {c.id !== currentUser.id && (
                        <>
                          <button
                            onClick={() => openRoleEdit(c)}
                            disabled={isPending}
                            className="text-xs text-violet-600 hover:text-violet-800 disabled:opacity-50"
                          >
                            {t('admin.changeRole')}
                          </button>
                          <button
                            onClick={() =>
                              handleToggleActive(c.id, c.is_active)
                            }
                            disabled={isPending}
                            className="text-xs text-[#888] hover:text-[#333] disabled:opacity-50"
                          >
                            {c.is_active
                              ? t('admin.deactivate')
                              : t('admin.activate')}
                          </button>
                          <button
                            onClick={() => {
                              setResetPwClinicianId(c.id);
                              setResetPwValue('');
                            }}
                            disabled={isPending}
                            className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
                          >
                            {t('admin.resetPassword')}
                          </button>
                          {mfaStatuses[c.id] && (
                            <button
                              onClick={() => handleResetMfa(c.id)}
                              disabled={isPending}
                              className="text-xs text-amber-600 hover:text-amber-800 disabled:opacity-50"
                            >
                              {t('mfa.resetMfa')}
                            </button>
                          )}
                          {!mfaStatuses[c.id] && (
                            <button
                              onClick={() => handleResendInvite(c.id)}
                              disabled={isPending}
                              className="text-xs text-teal-600 hover:text-teal-800 disabled:opacity-50"
                            >
                              {t('admin.resendInvite')}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invite Clinician Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl border border-[#d0d0c8] shadow-lg w-full max-w-md p-6">
            <h3 className="text-base font-semibold mb-4">
              {t('admin.dialog.inviteTitle')}
            </h3>

            <form onSubmit={handleInvite} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#555] mb-1">
                  {t('admin.name')}
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={t('admin.dialog.namePlaceholder')}
                  className="w-full px-3 py-2 rounded-lg border border-[#d0d0c8] text-sm
                             focus:outline-none focus:ring-2 focus:ring-[#c95a8a]/30 focus:border-[#c95a8a]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#555] mb-1">
                  {t('admin.email')}
                </label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder={t('admin.dialog.emailPlaceholder')}
                  className="w-full px-3 py-2 rounded-lg border border-[#d0d0c8] text-sm
                             focus:outline-none focus:ring-2 focus:ring-[#c95a8a]/30 focus:border-[#c95a8a]"
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-[#555] mb-1">
                    {t('admin.role')}
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as Role)}
                    className="w-full px-3 py-2 rounded-lg border border-[#d0d0c8] text-sm
                               focus:outline-none focus:ring-2 focus:ring-[#c95a8a]/30 focus:border-[#c95a8a]"
                  >
                    <option value="clinician">{t('admin.roles.clinician')}</option>
                    <option value="admin">{t('admin.roles.admin')}</option>
                    <option value="pi">{t('admin.roles.pi')}</option>
                  </select>
                </div>

                <div className="flex-1">
                  <label className="block text-xs font-semibold text-[#555] mb-1">
                    {t('admin.site')}
                  </label>
                  <SiteSelect
                    sites={sites}
                    value={formSite}
                    onChange={(v) => setFormSite(v)}
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
                  {t('admin.dialog.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-2 text-sm font-semibold rounded-lg bg-[#c95a8a] text-white
                             hover:bg-[#b44d7a] disabled:opacity-50 transition-colors"
                >
                  {isPending
                    ? t('admin.dialog.sending')
                    : t('admin.dialog.sendInvite')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Dialog */}
      {resetPwClinicianId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl border border-[#d0d0c8] shadow-lg w-full max-w-sm p-6">
            <h3 className="text-base font-semibold mb-4">
              {t('admin.resetPasswordTitle')}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#555] mb-1">
                  {t('admin.resetPasswordLabel')}
                </label>
                <input
                  type="text"
                  required
                  minLength={8}
                  value={resetPwValue}
                  onChange={(e) => setResetPwValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#d0d0c8] text-sm
                             focus:outline-none focus:ring-2 focus:ring-[#c95a8a]/30 focus:border-[#c95a8a]"
                />
                <p className="text-[10px] text-[#999] mt-1">
                  {t('admin.resetPasswordHelp')}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setResetPwClinicianId(null);
                    setResetPwValue('');
                  }}
                  className="flex-1 py-2 text-sm rounded-lg border border-[#d0d0c8] hover:bg-[#f0f0ea] transition-colors"
                >
                  {t('admin.dialog.cancel')}
                </button>
                <button
                  type="button"
                  disabled={isPending || resetPwValue.length < 8}
                  onClick={handleResetPassword}
                  className="flex-1 py-2 text-sm font-semibold rounded-lg bg-[#c95a8a] text-white
                             hover:bg-[#b44d7a] disabled:opacity-50 transition-colors"
                >
                  {t('admin.resetPasswordConfirm')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Role Dialog */}
      {roleEditClinicianId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl border border-[#d0d0c8] shadow-lg w-full max-w-sm p-6">
            <h3 className="text-base font-semibold mb-4">
              {t('admin.changeRoleTitle')}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#555] mb-1">
                  {t('admin.role')}
                </label>
                <select
                  value={roleEditValue}
                  onChange={(e) => setRoleEditValue(e.target.value as Role)}
                  className="w-full px-3 py-2 rounded-lg border border-[#d0d0c8] text-sm
                             focus:outline-none focus:ring-2 focus:ring-[#c95a8a]/30 focus:border-[#c95a8a]"
                >
                  <option value="clinician">{t('admin.roles.clinician')}</option>
                  <option value="admin">{t('admin.roles.admin')}</option>
                  <option value="pi">{t('admin.roles.pi')}</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRoleEditClinicianId(null)}
                  className="flex-1 py-2 text-sm rounded-lg border border-[#d0d0c8] hover:bg-[#f0f0ea] transition-colors"
                >
                  {t('admin.dialog.cancel')}
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleRoleChange}
                  className="flex-1 py-2 text-sm font-semibold rounded-lg bg-[#c95a8a] text-white
                             hover:bg-[#b44d7a] disabled:opacity-50 transition-colors"
                >
                  {t('admin.changeRoleSave')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
