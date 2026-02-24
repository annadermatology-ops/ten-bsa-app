'use server';

import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

/**
 * Clean up any unverified TOTP factors for the current user.
 * This uses the admin API because the client-side listFactors()
 * only returns verified factors — we need the admin API to see
 * (and delete) unverified ones left over from incomplete enrolments.
 */
export async function cleanupUnverifiedFactors() {
  // Get the current user's ID from the server session
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  // Use the admin client to inspect all factors (including unverified)
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: userData } = await admin.auth.admin.getUserById(user.id);
  if (!userData?.user?.factors) return;

  // Delete any unverified TOTP factors
  const unverifiedFactors = userData.user.factors.filter(
    (f) => f.factor_type === 'totp' && f.status === 'unverified',
  );

  for (const factor of unverifiedFactors) {
    await admin.auth.admin.mfa.deleteFactor({
      id: factor.id,
      userId: user.id,
    });
  }
}
