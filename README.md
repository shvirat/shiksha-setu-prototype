# Shiksha Setu (शिक्षा सेतु)

> **A Unified Digital Bridge for Scheduled Tribe (ST) Students to Discover, Apply for, and Track Ministry of Tribal Affairs (MoTA) Scholarships.**
>
> **Submission:** Hackathon Team "bytecodex" | **Theme:** Education & Skill Development | **License:** MIT

---

## 1. Problem Statement & Solution

Tribal (Scheduled Tribe, "ST") students across India face substantial systemic hurdles accessing central scholarships:
1. **Portal Fragmentation:** 5 MoTA scholarship schemes are spread across 3 disconnected portals (National Scholarship Portal, Single Fellowship Management Portal, and National Overseas Scholarship portal).
2. **Redundant Documentation:** Students submit identical certificates repeatedly, leading to verification backlogs, delays, and lost opportunities.
3. **Language & Literacy Barriers:** Lack of plain-language multilingual guidance and voice interfaces leaves eligible students unreached.
4. **Coverage Gaps:** Enrolment records (UDISE+/APAAR) and scholarship rolls are never reconciled, leaving eligible students unreached.
5. **Silent Rejections:** Minor spelling variations between certificates and Aadhaar records often result in silent rejections.

**Shiksha Setu** delivers an integrated, accessible Progressive Web App (PWA):
- **Unified Scholarship Dashboard:** One login for all 5 MoTA schemes, displaying eligible schemes, conflict warnings, and real-time 5-stage progress tracking.
- **Digital Document Wallet:** Upload verified documents once (caste certificate, income certificate, marksheet, bank passbook), encrypted with **AES-256-GCM**, and reused across applications.
- **Smart Verification Layer:** Pre-submission verification against mock government databases (DigiLocker, UDISE+, APAAR, OTR, e-District, PFMS). **Mismatches are flagged for empathetic human review and never silently rejected.**
- **JAGO AI Assistant:** Multilingual (English + Hindi) conversational guide with speech-to-text, read-aloud, prompt injection defense, and offline deterministic fallback.
- **Coverage Gap Finder (Ministry / Officer Portal):** Cross-matches institutional enrolment data with scholarship applications to identify and export unreached ST youth.
- **Nodal Officer Portal:** Dense review queue, split comparison table, mandatory decision remarks with automated alternative recommendations, and CSV export.
- **Offline-Ready PWA:** Installable, service worker caching, and IndexedDB local dashboard storage.

---

## 2. Environment Variables

All configuration options are defined in `.env` (or environment variables):

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `5000` | Port for the Express REST API backend |
| `NODE_ENV` | No | `development` | Runtime environment (`development`, `test`, `production`) |
| `MONGODB_URI` | No | `mongodb://localhost:27017/shiksha_setu` | MongoDB connection URI. If unavailable or unreachable, server automatically falls back to in-memory MongoDB |
| `USE_MEMORY_DB` | No | `true` | When `true`, uses embedded in-memory MongoDB for zero-install demo runs |
| `JWT_SECRET` | Yes | - | Secret string used for signing and verifying JSON Web Tokens (min 32 chars) |
| `JWT_EXPIRES_IN` | No | `7d` | Token expiry duration (e.g., `7d`, `24h`) |
| `DOC_ENCRYPTION_KEY` | Yes | - | 32-byte hexadecimal key (64 hex characters) for AES-256-GCM document encryption |
| `CLIENT_URL` | No | `http://localhost:3000` | Allowed CORS origin for the React frontend client |
| `LLM_PROVIDER` | No | `none` | AI provider for JAGO assistant (`gemini`, `openai`, or `none` for deterministic rule-based fallback) |
| `GEMINI_API_KEY` | Conditional | - | API key for Google Gemini (required only if `LLM_PROVIDER=gemini`) |
| `OPENAI_API_KEY` | Conditional | - | API key for OpenAI (required only if `LLM_PROVIDER=openai`) |

---

## 3. Demo Credentials

The database is populated with realistic sample accounts via `npm run seed`:

### Nodal Officer Portal
| Email | Password | Role | Designation |
|---|---|---|---|
| `officer.mota@gov.in` | `Officer@123` | `officer` | MoTA National Nodal Officer |
| `officer.jharkhand@gov.in` | `Officer@123` | `officer` | State Nodal Officer (Jharkhand) |

### Sample ST Students
| Email | Password | Role | Scenario Tested |
|---|---|---|---|
| `birsa.munda@example.in` | `Student@123` | `student` | Clean profile, verified post-matric applicant, simulated DBT disburse |
| `shanti.oraon@example.in` | `Student@123` | `student` | Name spelling mismatch (tests `FLAGGED` review queue) |
| `sukra.kole@example.in` | `Student@123` | `student` | Income mismatch (tests `FLAGGED` nodal review) |
| `anjali.marandi@example.in` | `Student@123` | `student` | Higher education fellowship applicant |
| `rahul.soren@example.in` | `Student@123` | `student` | Newly enrolled student with no prior applications |

*(All 25 seeded student accounts use the default demo password: `Student@123`)*

---

## 4. Disclosures & Ethics

### Simulated Government Data Disclosure
> **IMPORTANT:** This prototype utilizes **simulated sample government data** for demonstration purposes. Adapters for DigiLocker, UDISE+, APAAR, One-Time Registration (OTR), State e-District, and PFMS/DBT are mocked behind clean service interfaces (`server/src/adapters/`). No real citizen personal data is stored, processed, or exposed.

### AI Usage Disclosure
> AI tools (including Claude, ChatGPT, and Gemini) were utilized during the design and development of this prototype for code scaffolding, documentation structure, and drafting bilingual copy. All business logic, security constraints, and accessibility requirements were reviewed, implemented, and validated by the team.

---

## 5. Quick Start (One Command)

### 1. Install & Seed
```bash
# Install dependencies across monorepo workspaces
npm install

# Seed schemes, fake students, enrollment records, and knowledge base
npm run seed
```

### 2. Start Both Services
```bash
# Starts both Express backend (port 5000) and React frontend (port 3000) concurrently
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### 3. Run Automated Tests
```bash
# Run all backend (Jest) and frontend (Vitest) test suites
npm test
```
