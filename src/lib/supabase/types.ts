/**
 * Database type definitions for Supabase.
 *
 * These are manually maintained to match our migration schema.
 * In production you could auto-generate these with:
 *   npx supabase gen types typescript --project-id qexjsjgrvhuuznmlekes
 */

export type Role = 'clinician' | 'admin' | 'pi';
export type Site = string;

export const SUPPORTED_LOCALES = ['en', 'fr', 'de', 'es', 'it', 'sr'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export interface StudySite {
  key: string;
  display_names: Record<string, string>;
  default_language: string;
  is_active: boolean;
  sort_order: number;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      clinicians: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: Role;
          site: Site;
          is_active: boolean;
          consent_given_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role?: Role;
          site: Site;
          is_active?: boolean;
          consent_given_at?: string | null;
        };
        Update: {
          email?: string;
          full_name?: string;
          role?: Role;
          site?: Site;
          is_active?: boolean;
          consent_given_at?: string | null;
        };
      };
      patients: {
        Row: {
          id: string;
          study_id: string;
          initials: string;
          date_of_birth: string;
          site: Site;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          study_id: string;
          initials: string;
          date_of_birth: string;
          site: Site;
          created_by: string;
        };
        Update: {
          study_id?: string;
          initials?: string;
          date_of_birth?: string;
          site?: Site;
        };
      };
      assessments: {
        Row: {
          id: string;
          patient_id: string;
          clinician_id: string;
          tbsa_percent: number;
          dbsa_percent: number;
          tbsa_regions: Record<string, number>;
          dbsa_regions: Record<string, number>;
          canvas_anterior_tbsa: string | null;
          canvas_anterior_dbsa: string | null;
          canvas_posterior_tbsa: string | null;
          canvas_posterior_dbsa: string | null;
          canvas_composite: string | null;
          albumin_level: number | null;
          notes: string | null;
          notes_language: string | null;
          notes_translation: string | null;
          site: string | null;
          assessment_date: string;
          created_at: string;
          is_deleted: boolean;
          // SCORTEN (first assessment only)
          scorten_score: number | null;
          scorten_age_gte40: boolean | null;
          scorten_hr_gte120: boolean | null;
          scorten_malignancy: boolean | null;
          scorten_bsa_gte10: boolean | null;
          scorten_urea_gt10: boolean | null;
          scorten_bicarb_lt20: boolean | null;
          scorten_glucose_gt14: boolean | null;
        };
        Insert: {
          id?: string;
          patient_id: string;
          clinician_id: string;
          tbsa_percent: number;
          dbsa_percent: number;
          tbsa_regions: Record<string, number>;
          dbsa_regions: Record<string, number>;
          canvas_anterior_tbsa?: string | null;
          canvas_anterior_dbsa?: string | null;
          canvas_posterior_tbsa?: string | null;
          canvas_posterior_dbsa?: string | null;
          canvas_composite?: string | null;
          albumin_level?: number | null;
          notes?: string | null;
          notes_language?: string | null;
          notes_translation?: string | null;
          site?: string | null;
          assessment_date: string;
          // SCORTEN (first assessment only)
          scorten_score?: number | null;
          scorten_age_gte40?: boolean | null;
          scorten_hr_gte120?: boolean | null;
          scorten_malignancy?: boolean | null;
          scorten_bsa_gte10?: boolean | null;
          scorten_urea_gt10?: boolean | null;
          scorten_bicarb_lt20?: boolean | null;
          scorten_glucose_gt14?: boolean | null;
        };
        Update: {
          notes?: string | null;
          notes_language?: string | null;
          notes_translation?: string | null;
          albumin_level?: number | null;
          is_deleted?: boolean;
        };
      };
      assessment_photos: {
        Row: {
          id: string;
          assessment_id: string;
          storage_path: string;
          file_name: string;
          file_size: number | null;
          mime_type: string;
          caption: string | null;
          sort_order: number;
          uploaded_by: string;
          created_at: string;
          metadata: Record<string, unknown> | null;
        };
        Insert: {
          id?: string;
          assessment_id: string;
          storage_path: string;
          file_name: string;
          file_size?: number | null;
          mime_type?: string;
          caption?: string | null;
          sort_order?: number;
          uploaded_by: string;
          metadata?: Record<string, unknown> | null;
        };
        Update: {
          caption?: string | null;
          sort_order?: number;
        };
      };
      audit_log: {
        Row: {
          id: string;
          table_name: string;
          record_id: string;
          action: string;
          old_data: Record<string, unknown> | null;
          new_data: Record<string, unknown> | null;
          performed_by: string | null;
          created_at: string;
        };
        Insert: never; // Populated by trigger only
        Update: never; // Immutable
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: Role;
    };
  };
}
