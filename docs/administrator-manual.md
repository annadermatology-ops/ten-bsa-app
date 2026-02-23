# SJS/TEN BSA Assessment Tool — Administrator Manual

*This manual covers administrator-only functions. For general app usage (logging in, performing assessments, viewing patients), see the Clinician Manual.*

---

## 1. About the Trial

See the Clinician Manual, Section 1.

[Further trial details to be added]

---

## 2. Data Protection & GDPR — Administrator Responsibilities

In addition to the GDPR safeguards described in the Clinician Manual (Section 2), as an administrator you have additional responsibilities:

- **Account management** — You are responsible for creating and deactivating clinician accounts. Only create accounts for authorised members of the study team.
- **Temporary passwords** — When creating a clinician account, you set a temporary password. Communicate this securely (not by unencrypted email). The clinician should set up MFA on first login.
- **MFA oversight** — You can view which clinicians have set up two-factor authentication and reset MFA for clinicians who lose access to their authenticator app (e.g. lost phone).
- **Data export** — You can export all assessment data as a CSV file. Exported files contain pseudonymised patient data and must be handled in accordance with your institution's data governance policy. Store exported files securely and delete them when no longer needed.
- **Audit trail** — You have access to the full audit log, which records every data entry, modification, and account change. Review the audit log periodically to ensure appropriate use.
- **Account deactivation** — When a clinician leaves the study or no longer requires access, deactivate their account promptly. Deactivated accounts cannot log in but their historical data and audit trail are preserved.

---

## 3. How to Use — Administrator Functions

### 3.1 Accessing the Admin Dashboard

1. Log in to the app as normal (with MFA).
2. Tap **Admin** in the top navigation bar.
3. The Admin Dashboard has four tabs: **Overview**, **Clinicians**, **Export**, and **Audit Log**.

### 3.2 Patient Overview (Overview Tab)

A summary table of all patients in the study, showing:
- Study ID, initials, and site
- Number of assessments completed
- Latest TBSA% and DBSA%
- SCORTEN score (from first assessment)
- Date of last assessment

Tap a patient row to navigate to their full detail page.

### 3.3 Managing Clinician Accounts (Clinicians Tab)

#### Creating a New Clinician Account

1. Go to the **Clinicians** tab.
2. Tap **+ Add Clinician**.
3. Fill in:
   - **Full Name** — the clinician's name as it should appear in the audit trail
   - **Email** — the clinician's email address (used for login)
   - **Temporary Password** — minimum 8 characters; communicate this to the clinician securely
   - **Role** — Clinician, Admin, or Principal Investigator
   - **Site** — London, England or Lyon, France
4. Tap **Create Account**.

The clinician can now log in. On their first login, they will be required to set up two-factor authentication.

#### Deactivating / Reactivating a Clinician

- In the clinician table, tap **Deactivate** next to the clinician's name.
- Deactivated clinicians cannot log in but their past data remains intact.
- To restore access, tap **Activate**.

#### Viewing MFA Status

The clinician table shows an **MFA** column:
- **Enrolled** (green) — the clinician has set up their authenticator app
- **Not set up** (amber) — the clinician has not yet completed MFA setup

#### Resetting a Clinician's MFA

If a clinician loses access to their authenticator app (e.g. lost or replaced phone):
1. In the clinician table, tap **Reset MFA** next to their name.
2. Confirm the reset.
3. On their next login, the clinician will be prompted to set up MFA again with a new QR code.

### 3.4 Exporting Data (Export Tab)

1. Go to the **Export** tab.
2. Optionally filter by:
   - **Site** — All Sites, London, or Lyon
   - **Date range** — From / To dates
3. Tap **Export CSV**.
4. A CSV file will download containing all matching assessment data, including:
   - Patient details (Study ID, initials, site)
   - Assessment date, TBSA%, DBSA%, albumin, SCORTEN
   - Clinician name
   - Clinical notes and translations
   - Per-region BSA breakdowns

The file includes a UTF-8 BOM for correct display of French characters in Microsoft Excel.

### 3.5 Reviewing the Audit Log (Audit Log Tab)

The audit log records every data change in the system:
- **Timestamp** — when the action occurred
- **Table** — which data was affected (clinicians, patients, or assessments)
- **Action** — INSERT (new record), UPDATE (modification), or DELETE
- **Record ID** — the affected record
- **User** — which clinician performed the action
- **Details** — tap to expand and view the full before/after data

The log is paginated (20 entries per page) and can be filtered by table. Entries are colour-coded by action type.

---

## 4. Guidance

[Guidance on study administration, site coordination, and data management procedures to be added]

---

*Document version: 1.0 — February 2026*
