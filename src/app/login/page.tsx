'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { LanguageToggle } from '@/components/ui/LanguageToggle';

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(t('login.error'));
        return;
      }

      // Check MFA status — redirect to enrol or verify as needed
      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      const totpFactors = factorsData?.totp ?? [];
      const verifiedFactors = totpFactors.filter(
        (f) => f.status === 'verified',
      );

      if (verifiedFactors.length > 0) {
        // Has verified TOTP — needs to verify code
        router.push('/mfa/verify');
      } else {
        // No verified TOTP — needs to enrol
        router.push('/mfa/enroll');
      }
      router.refresh();
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0] px-4">
      <div className="absolute top-3 right-3">
        <LanguageToggle />
      </div>

      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-[#1a1a1a] mb-1">
            {t('app.title')}
          </h1>
          <p className="text-xs text-[#888]">{t('login.subtitle')}</p>
        </div>

        {/* Login form */}
        <form
          onSubmit={handleLogin}
          className="bg-white rounded-xl border border-[#d0d0c8] shadow-sm p-6 space-y-4"
        >
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-[#555] mb-1"
            >
              {t('login.email')}
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-[#d0d0c8] text-sm
                         focus:outline-none focus:ring-2 focus:ring-[#c95a8a]/30 focus:border-[#c95a8a]
                         placeholder:text-[#aaa]"
              placeholder={t('login.emailPlaceholder')}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-[#555] mb-1"
            >
              {t('login.password')}
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-[#d0d0c8] text-sm
                         focus:outline-none focus:ring-2 focus:ring-[#c95a8a]/30 focus:border-[#c95a8a]
                         placeholder:text-[#aaa]"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 rounded-lg bg-[#c95a8a] text-white text-sm font-semibold
                       hover:bg-[#b44d7a] active:bg-[#a0426c] disabled:opacity-50
                       transition-colors cursor-pointer"
          >
            {isPending ? t('login.signingIn') : t('login.signIn')}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-[10px] text-[#999] mt-6">
          {t('login.footer')}
        </p>
      </div>
    </div>
  );
}
