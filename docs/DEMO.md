# Shiksha Setu: 5-Minute Hackathon Demo Script

This script provides evaluators and judges with a concise, 5-minute step-by-step walkthrough of the core features of **Shiksha Setu**.

---

## Demo Credentials Summary

| Role | Email | Password | Scenario Highlight |
|---|---|---|---|
| **Clean ST Student** | `birsa.munda@example.in` | `Student@123` | Clean profile, verified application, simulated DBT disbursement |
| **Flagged ST Student** | `shanti.oraon@example.in` | `Student@123` | Name spelling mismatch between application & DigiLocker; routed to review |
| **Nodal Officer** | `officer.mota@gov.in` | `Officer@123` | Nodal Officer dashboard, verification queue, Coverage Gap Finder, Analytics |

---

## 5-Minute Walkthrough Flow

### Minute 1: The Problem & The Unified Student Access
1. Open the application at `http://localhost:3000`.
2. Point out the calm, trustworthy government aesthetic (PART B compliant, zero gradients, typographic bridge glyph wordmark).
3. Toggle the language switch at the top right from **English** to **हिन्दी** to show native bilingual localization without Latin remnants.
4. *(Optional Walkthrough)*: Click **"New student? Register here"** to demonstrate the self-service student onboarding form (`/register`) capturing academic, demographic, UDISE+, and APAAR identity fields.
5. Click the prefill button for **Birsa Munda** (`birsa.munda@example.in`) and click **Sign in**.
6. Observe the Student Home:
   - Plain summary sentence: *"X applications in progress, Y need your action, Z schemes you may be eligible for."*
   - Expand the application row to see the **5-stage progress Stepper** with square markers (Submitted → Verification → Review → Sanction → Payment).
   - Point out the **Scheme Conflict Warning** (*"Cannot be held together with Post-Matric, sample rule"*).

### Minute 2: Document Wallet & Verified Student Profile
1. Navigate to **Documents** in the navigation bar:
   - Observe the verified documents in the wallet (`st_certificate`, `income_certificate`, `marksheet`).
   - Note that certificates are encrypted on disk with **AES-256-GCM**.
   - Click **View** on any document to test inline decrypted viewing.
   - Emphasize: *"Tribal students upload documents once and reuse them across all 5 MoTA scholarship portals."*
2. Navigate to **Profile** (`/profile`):
   - Review live simulated government registry status badges: **DigiLocker** (Caste), **e-District** (Income), **UDISE+** (Enrolment), and **PFMS** (Aadhaar-seeded bank account).
   - Students can update their academic details directly with immediate audit logging.

### Minute 3: Smart Verification & Non-Destructive Flagging
1. Log out and sign in as **Shanti Oraon** (`shanti.oraon@example.in`).
2. Point out the prominent **Needs your action** section at the top of the dashboard.
3. Click **View comparison** on Shanti's application:
   - Shows the **Comparison Table**: *"You entered: Shanti Oraon"* vs *"Record shows: Shanti Uraon"* (with saffron-700 underline on difference).
4. Emphasize: *"Shiksha Setu never silently rejects students for spelling variations or data mismatches. It flags them for empathetic human review."*

### Minute 4: Nodal Officer Portal & Coverage Gap Finder
1. Log out and sign in as **Dr. Rameshwar Oraon** (`officer.mota@gov.in` / `Officer@123`).
2. The officer portal opens with the 232px left sidebar and dense table (44px row height).
3. In the **Verification Queue**, click on Shanti Oraon's flagged application:
   - The right-side drawer slides in showing the applicant's profile, comparison diff table, and attached certificates.
   - Enter mandatory officer remarks: *"Verified spelling variation with sub-collector certificate. Approved."*
   - Click **Approve application**. The status transitions immediately to `APPROVED_FOR_SANCTION` and `DISBURSED_SIMULATED`.
4. Click **Coverage Gap Finder** in the sidebar:
   - Highlight the **Key Figures Strip** (Source Serif 36px numerals, vertical hairlines): 200 enrolled ST students, 165 applicants, 35 unreached coverage gaps (17.5% gap rate).
   - Highlight the Recharts bar chart displaying unreached ST students by state (strictly conforming to B8: single navy-600 series, square-topped bars, no 3D, no gradients).
   - Click **Export CSV** to demonstrate downloadable outreach data for district welfare officers.

### Minute 5: JAGO Multilingual AI Assistant
1. In the top bar, click **Ask JAGO** to open the docked 380px drawer.
2. Point out the clean transcript layout (*"You"* / *"JAGO"* with hairline separators, no floating bubbles).
3. Click one of the suggested question links: *"What is my current scholarship application status?"*
4. JAGO queries the authenticated student's records using its authorized tool and provides a clear, plain-language answer.
5. Click **Read aloud** on the reply to demonstrate Web Speech API synthesis.
6. Click the mic button to demonstrate speech-to-text.
7. Switch language to Hindi and ask in Hindi: *"छात्रवृत्ति के लिए कौन से दस्तावेज चाहिए?"* to show native Devanagari guidance.
8. Conclude: *"Shiksha Setu provides one unified, accessible bridge connecting tribal youth to their rightful educational scholarships."*
