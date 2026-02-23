# SJS/TEN BSA Assessment Tool — Clinician Manual

## 1. About the Trial

This application is part of a clinical study to evaluate the efficacy of a proposed new treatment for Stevens-Johnson Syndrome (SJS) and Toxic Epidermal Necrolysis (TEN).

The app allows treating clinicians to accurately record Body Surface Area (BSA) involvement by painting directly onto a digital body map. Each assessment captures:

- **TBSA (Total Body Surface Area)** — all involved skin including erythema
- **DBSA (Detachment Body Surface Area)** — blisters, erosions, Nikolsky+, and necrotic areas (erythema excluded)

Serial assessments track disease progression over time, providing objective, standardised measurements across all participating sites.

[Further trial details to be added]

---

## 2. Data Protection & GDPR Compliance

This application has been designed with UK and EU GDPR requirements in mind:

- **Pseudonymised data only** — Patients are identified by Study ID and initials only. Full identifiable data (name, hospital number) remains in the clinical record, linked by Study ID.
- **No patient names or hospital numbers** are stored in the app.
- **Encrypted in transit** — All data is transmitted over HTTPS.
- **Encrypted at rest** — Data is stored in a secure, EU-based database (Frankfurt, Germany).
- **Audit trail** — Every data entry and modification is logged with a timestamp and the identity of the clinician who made the change.
- **Two-factor authentication (MFA)** — All users must verify their identity using an authenticator app at each login.
- **Role-based access** — Only authorised clinicians can enter data; only administrators can modify or export records.
- **No self-registration** — Accounts are created by the study administrator only.

You should ensure that:
- You do not enter identifiable patient information (names, hospital numbers, addresses) into any field in the app.
- You keep your login credentials and authenticator app secure.
- You log out after each session, particularly on shared devices.

---

## 3. How to Use the App

### 3.1 Accessing the App

The app is available at: **https://ten-bsa-app.vercel.app**

On an iPad or iPhone, you can add it to your Home Screen for a native app-like experience:
1. Open the URL in Safari
2. Tap the Share button (square with arrow)
3. Tap "Add to Home Screen"
4. The app icon will appear on your Home Screen

### 3.2 Logging In

1. Enter your email address and password (provided by the study administrator).
2. Tap **Sign in**.
3. **First login only:** You will be asked to set up two-factor authentication (MFA):
   - Open an authenticator app on your phone (e.g. Google Authenticator, Authy)
   - Scan the QR code displayed on screen
   - Enter the 6-digit code from your authenticator app to confirm setup
4. **Subsequent logins:** After entering your password, you will be asked for the 6-digit code from your authenticator app.

### 3.3 Viewing Patients

After logging in, you will see the **Patient List** — a table of all patients in the study. You can:
- **Search** for a patient by Study ID or initials using the search bar
- **View** a patient's history by tapping the "View" button
- **Start a new assessment** by tapping the "New Assessment" button

### 3.4 Adding a New Patient

1. Tap **Add Patient** at the top of the Patient List.
2. Enter:
   - **Study ID** — the unique identifier assigned to this patient (e.g. TEN-001)
   - **Initials** — 2 to 4 characters
   - **Date of Birth**
   - **Study Site** — London or Lyon
3. Tap **Create Patient**.

### 3.5 Performing an Assessment

1. From the Patient List, tap **New Assessment** next to the patient.
2. You will see a body outline. Use the tools at the top to paint affected areas:
   - **TBSA** (pink) — paint all involved skin, including erythema
   - **DBSA** (grey) — paint only blisters, erosions, Nikolsky+, and necrotic areas
   - **Eraser** — remove any marks
3. Use the **Front/Back** toggle to switch between anterior and posterior views.
4. Adjust the **Brush** size slider as needed.
5. Use **Undo** to step back, or **Clear** to start over.
6. Scroll down to complete:
   - **SCORTEN** (first assessment only) — answer the 7 clinical criteria. Two are auto-calculated (age ≥40 and BSA ≥10%); you must answer the remaining five.
   - **Albumin** — enter the serum albumin level (g/L)
   - **Clinical photographs** (optional) — tap "Add Photo" to attach photographs. You can anonymise faces by drawing black rectangles or brush strokes over identifying features.
   - **Notes** — add any relevant clinical observations. Notes entered in French will be automatically translated to English (and vice versa).
7. Tap **Submit Assessment**. A confirmation dialog will show the calculated TBSA% and DBSA%.
8. Confirm to save. The assessment is permanently recorded and cannot be edited.

### 3.6 Viewing Patient History

From the Patient List, tap **View** to see a patient's detail page:
- **Patient information** card (Study ID, initials, DOB, site)
- **Assessment history** — a chronological timeline of all assessments, showing TBSA%, DBSA%, SCORTEN, albumin, composite canvas images, clinical photos, and notes
- **Trend chart** — when 2 or more assessments exist, a line chart shows TBSA and DBSA trends over time

### 3.7 Switching Language

Tap the **EN/FR** toggle (top-right on most pages) to switch between English and French.

### 3.8 Signing Out

Tap **Sign out** in the top-right corner. Always sign out after your session, especially on shared devices.

---

## 4. Guidance

[Guidance on clinical assessment technique, SCORTEN interpretation, and study protocol to be added]

---

*Document version: 1.0 — February 2026*
