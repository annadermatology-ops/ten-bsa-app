'use server';

import { createClient } from '@/lib/supabase/server';
import type { StudySite } from '@/lib/supabase/types';

// Fallback sites if the study_sites table doesn't exist yet (pre-migration 005)
const FALLBACK_SITES: StudySite[] = [
  {
    key: 'france',
    display_names: { en: 'Lyon, France', fr: 'Lyon, France' },
    default_language: 'fr',
    is_active: true,
    sort_order: 1,
    latitude: 45.764,
    longitude: 4.8357,
    created_at: '',
    updated_at: '',
  },
  {
    key: 'england',
    display_names: { en: 'London, England', fr: 'Londres, Angleterre' },
    default_language: 'en',
    is_active: true,
    sort_order: 2,
    latitude: 51.5074,
    longitude: -0.1278,
    created_at: '',
    updated_at: '',
  },
];

export async function getStudySites(): Promise<StudySite[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('study_sites')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .order('key');

    if (error) throw error;
    return (data as StudySite[]) ?? FALLBACK_SITES;
  } catch {
    // Table doesn't exist yet or query failed — use fallback
    return FALLBACK_SITES;
  }
}
