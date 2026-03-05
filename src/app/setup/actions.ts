'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import type { Role, Site } from '@/lib/supabase/types';

export async function bootstrapAdmin(formData: {
  email: string;
  password: string;
  fullName: string;
  site: string;
}) {
  const admin = createAdminClient();

  // Check if any clinicians already exist — prevent duplicate bootstrap
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (admin as any)
    .from('clinicians')
    .select('id')
    .limit(1);

  if (existing && existing.length > 0) {
    return { error: 'An admin account already exists. Use the invite system to add more users.' };
  }

  // Create auth user with password (bootstrap — no invite email needed)
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: formData.email,
    password: formData.password,
    email_confirm: true,
  });

  if (authError) {
    return { error: authError.message };
  }

  // Create clinician record as PI
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: clinicianError } = await (admin as any).from('clinicians').insert({
    id: authData.user.id,
    email: formData.email,
    full_name: formData.fullName,
    role: 'pi' as Role,
    site: formData.site as Site,
    is_active: true,
  });

  if (clinicianError) {
    // Rollback: delete the auth user if clinician record fails
    await admin.auth.admin.deleteUser(authData.user.id);
    return { error: clinicianError.message };
  }

  return { success: true };
}
