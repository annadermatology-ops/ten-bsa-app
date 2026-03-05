'use server';

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { SUPPORTED_LOCALES } from '@/lib/supabase/types';

export async function setLocale(locale: string, userSet = false) {
  const cookieStore = await cookies();
  cookieStore.set('locale', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax',
  });
  if (userSet) {
    cookieStore.set('locale_user_set', 'true', {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
  }
}

/**
 * After login/MFA, set the locale to the clinician's site default language
 * — but only if the user hasn't manually chosen a language.
 */
export async function setLocaleForClinicianSite() {
  const cookieStore = await cookies();

  // If user manually set a language, don't override
  if (cookieStore.get('locale_user_set')?.value === 'true') {
    return;
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get clinician's site
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: clinician } = await (supabase as any)
      .from('clinicians')
      .select('site')
      .eq('id', user.id)
      .single();

    if (!clinician?.site) return;

    // Get site's default language
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: site } = await (supabase as any)
      .from('study_sites')
      .select('default_language')
      .eq('key', clinician.site)
      .single();

    if (!site?.default_language) return;

    const lang = site.default_language as string;
    if ((SUPPORTED_LOCALES as readonly string[]).includes(lang)) {
      cookieStore.set('locale', lang, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
      });
    }
  } catch {
    // Non-critical — silently fall back to current locale
  }
}
