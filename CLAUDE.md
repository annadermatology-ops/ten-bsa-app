# SJS/TEN BSA Assessment Tool — Project Memory

## Overview
Progressive Web App for clinical SJS/TEN Body Surface Area assessment. Clinicians paint body areas on a canvas to calculate TBSA/DBSA percentages, then submit timestamped assessments to a database for a multi-site study (~50 patients across hospitals in France and England).

## Tech Stack
- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS + next-intl (EN/FR bilingual)
- **Backend/DB:** Supabase (PostgreSQL + Auth + Storage), EU region (Frankfurt)
- **Hosting:** Vercel — https://ten-bsa-app.vercel.app
- **Translation:** DeepL Free API (EN↔FR for clinical notes)
- **PWA:** Installable on iPad/iPhone

## Build & Deploy
- **Node version:** v20.20.0 (via NVM — system default is v15.14.0)
- **PATH fix required:** `PATH="/Users/William/.nvm/versions/node/v20.20.0/bin:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin:$PATH"`
- **Build:** `npm run build`
- **Deploy:** `npx vercel --prod`
- **Server action body limit:** 20MB (for photo uploads) — configured in `next.config.ts` under `experimental.serverActions`

## Key Files
- `src/app/patients/[studyId]/assess/page.tsx` — Main assessment page (canvas drawing + photos + notes + submission)
- `src/engine/` — Drawing engine extracted from prototype (drawing-engine.ts, regions.ts, calculation.ts, grain-pattern.ts)
- `src/components/canvas/BodyCanvas.tsx` — 4-layer canvas stack (body outline, TBSA, DBSA, interaction)
- `src/components/photos/PhotoEditor.tsx` — Photo anonymisation editor (rect + brush modes)
- `src/lib/translate.ts` — DeepL API translation utility
- `src/lib/supabase/` — Supabase client/server/middleware
- `messages/en.json`, `messages/fr.json` — i18n translation files
- `supabase/migrations/` — Database schema migrations

## Database Tables
- **clinicians** — extends Supabase auth.users (role: clinician/admin/pi, site: france/england)
- **patients** — study_id, initials, DOB, site
- **assessments** — TBSA/DBSA percentages, per-region JSONB, canvas image paths, notes (+ translations), photos, albumin level, SCORTEN fields (score + 7 boolean criteria)
- **audit_log** — immutable trigger-based audit trail

## Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-side only)
- `DEEPL_API_KEY` — DeepL Free API key (ends with `:fx`)

## Implementation Status
- **Phase 1 (Foundation):** COMPLETE — Drawing engine, canvas, PWA manifest
- **Phase 2 (Backend + Auth):** COMPLETE — Supabase, auth, RLS, admin
- **Phase 3 (Patient Management + Submission):** COMPLETE — Patient list, assessment submission, timeline
- **Phase 4 (PWA Polish + Reliability):** COMPLETE — PWA icons, Serwist service worker, offline indicator, loading spinners
- **Phase 5 (Admin Dashboard + Export):** COMPLETE — Tabbed admin dashboard, patient overview, trend chart, CSV export, audit log viewer
- **Phase 6 (Testing + Production):** Pending

## Recent Changes (Session 5)
- **Phase 4: PWA Polish + Reliability**
  - PWA icons (192px + 512px) with pink #c95a8a background, white "TEN" text
  - Fixed manifest.json: split `"any maskable"` into separate icon entries
  - Serwist service worker (`@serwist/next`) — precaching + runtime cache, disabled in dev
  - Connection status indicator: amber banner when offline (`navigator.onLine` + event listeners)
  - LoadingSpinner component: animated pink spinner replacing plain "Loading…" text across all pages
  - Phase 4+5 i18n strings added to both EN and FR

- **Phase 5: Admin Dashboard + Export**
  - Restructured `/admin` as tabbed dashboard: Overview, Clinicians, Export, Audit Log
  - 3 new server actions in `admin/actions.ts`: `getPatientOverview()`, `getAuditLog()`, `getExportData()`
  - Patient overview table: Study ID, Initials, Site, Assessment count, Latest TBSA/DBSA, SCORTEN badge, clickable rows
  - Hand-rolled SVG trend chart (`TrendChart.tsx`): zero-dependency, TBSA (pink) + DBSA (grey) lines, shows on patient detail when ≥2 assessments
  - CSV export panel: site filter, date range, BOM for Excel UTF-8 (French chars), per-region breakdown columns from JSONB
  - Audit log viewer: paginated (20/page), expandable rows with old/new JSON, colour-coded action badges
  - Extracted clinician management into standalone component

## Key New Files (Session 5)
- `src/app/sw.ts` — Service worker entry (Serwist)
- `src/components/ui/ConnectionStatus.tsx` — Offline banner
- `src/components/ui/LoadingSpinner.tsx` — Animated spinner
- `src/components/charts/TrendChart.tsx` — SVG line chart
- `src/lib/csv.ts` — CSV generation + download with BOM
- `src/app/admin/components/AdminTabs.tsx` — Tab navigation
- `src/app/admin/components/PatientOverview.tsx` — Patient summary table
- `src/app/admin/components/ClinicianManagement.tsx` — Extracted clinician management
- `src/app/admin/components/ExportPanel.tsx` — CSV export with filters
- `src/app/admin/components/AuditLogViewer.tsx` — Paginated audit log

## Recent Changes (Session 4)
- **SCORTEN severity index** — Full implementation for first patient assessment:
  - 7 binary criteria (score 0–7) with predicted mortality display
  - 2 auto-computed: Age ≥ 40 (from patient DOB), BSA ≥ 10% (from TBSA calculation)
  - 5 clinician-entered: HR ≥ 120 bpm, Cancer/malignancy, Urea > 10, Bicarb < 20, Glucose > 14
  - Yes/No toggle buttons for each clinician criterion
  - **Hard submission blocking**: Submit disabled until all SCORTEN criteria answered on first assessment
  - Amber ring highlighting on unanswered criteria rows
  - Score displayed with colour-coded badge (green/yellow/orange/red by severity)
  - Mortality rates: 0-1 → 3.2%, 2 → 12.1%, 3 → 35.3%, 4 → 58.3%, ≥5 → 90%
  - SCORTEN shown in confirmation dialog before submission
  - SCORTEN badge displayed on patient detail page assessment history
  - Full EN/FR i18n strings
  - Migration: `supabase/migrations/004_scorten.sql` (8 nullable columns on assessments table)

## Recent Changes (Session 3)
- Fixed iPhone photo submission crash (client-side resize to max 1600px + 20MB body limit)
- Fixed iOS photo picker (removed `capture="environment"` to allow photo library)
- Added PhotoEditor component for face anonymisation (rectangle + brush modes)
- Fixed mobile submit button (sticky toolbar)
- Replaced MyMemory translation API with DeepL (much higher quality EN↔FR)
- Added 4000 character limit on notes with visible counter
- Photo delete button improvements (larger tap target, stopPropagation)

## Important Notes
- **Calculation accuracy is critical** — TBSA/DBSA must match prototype to ±0.1%
- **No hard deletes** — soft delete only on assessments
- **Minimal PII** — only study_id, initials, DOB stored; link to full identity stays in hospital records
- **Default site:** France (most patients expected there)
- **Language toggle:** Flag emojis (🇬🇧/🇫🇷) in header
- **Notes auto-translate** on submission via DeepL (stores both original + translation)
