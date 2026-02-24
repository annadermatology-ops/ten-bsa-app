'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return { error: 'Not authenticated.' };
  }

  // Verify current password using the admin client so we don't interfere
  // with the user's existing session or trigger the MFA challenge flow.
  const admin = createAdminClient();
  const { error: signInError } = await admin.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  // signInWithPassword returns an error if password is wrong.
  // With MFA enrolled, a correct password still succeeds at the
  // password-check stage (may return MFA challenge data, but no error).
  if (signInError) {
    return { error: 'Current password is incorrect.' };
  }

  // Update password via admin API (bypasses session/MFA requirements)
  const { error: updateError } = await admin.auth.admin.updateUserById(
    user.id,
    { password: newPassword },
  );

  if (updateError) {
    return { error: updateError.message };
  }

  return { success: true };
}
