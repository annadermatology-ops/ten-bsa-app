'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { bootstrapAdmin } from '../actions';

export function StepCreateAdmin() {
  const t = useTranslations('setup.steps.adminUser');
  const [email, setEmail] = useState('admin@ten-bsa.study');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [site, setSite] = useState('france');
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);

    startTransition(async () => {
      const res = await bootstrapAdmin({ email, password, fullName, site });
      if (res.error) {
        setResult({ type: 'error', text: res.error });
      } else {
        setResult({ type: 'success', text: t('success') });
      }
    });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-[#1a1a1a]">{t('title')}</h2>
      <p className="text-sm text-[#555] leading-relaxed">{t('description')}</p>

      <form onSubmit={handleSubmit} className="space-y-3 bg-white rounded-xl border border-[#d0d0c8] p-4">
        <div>
          <label className="block text-xs font-semibold text-[#555] mb-1">
            {t('fullName')}
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={t('namePlaceholder')}
            className="w-full px-3 py-2 rounded-lg border border-[#d0d0c8] text-sm
                       focus:outline-none focus:ring-2 focus:ring-[#c95a8a]/30 focus:border-[#c95a8a]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#555] mb-1">
            {t('email')}
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[#d0d0c8] text-sm
                       focus:outline-none focus:ring-2 focus:ring-[#c95a8a]/30 focus:border-[#c95a8a]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#555] mb-1">
            {t('password')}
          </label>
          <input
            type="text"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[#d0d0c8] text-sm
                       focus:outline-none focus:ring-2 focus:ring-[#c95a8a]/30 focus:border-[#c95a8a]"
          />
          <p className="text-[10px] text-[#999] mt-1">{t('passwordHelp')}</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#555] mb-1">
            {t('site')}
          </label>
          <input
            type="text"
            required
            value={site}
            onChange={(e) => setSite(e.target.value)}
            placeholder="france"
            className="w-full px-3 py-2 rounded-lg border border-[#d0d0c8] text-sm font-mono
                       focus:outline-none focus:ring-2 focus:ring-[#c95a8a]/30 focus:border-[#c95a8a]"
          />
          <p className="text-[10px] text-[#999] mt-1">{t('siteHelp')}</p>
        </div>

        {result && (
          <div
            className={`text-xs rounded-lg px-3 py-2 ${
              result.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {result.text}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2 text-sm font-semibold rounded-lg bg-[#c95a8a] text-white
                     hover:bg-[#b44d7a] disabled:opacity-50 transition-colors"
        >
          {isPending ? t('creating') : t('createButton')}
        </button>
      </form>

      <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
        <p className="text-[11px] text-amber-800">{t('note')}</p>
      </div>
    </div>
  );
}
