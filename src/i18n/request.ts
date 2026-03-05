import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { SUPPORTED_LOCALES } from '@/lib/supabase/types';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  let locale = cookieStore.get('locale')?.value || 'en';

  // Validate locale is one of the supported languages
  if (!(SUPPORTED_LOCALES as readonly string[]).includes(locale)) {
    locale = 'en';
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
