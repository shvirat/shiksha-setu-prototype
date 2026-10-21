# Shiksha Setu: REST API Documentation

This document describes all endpoints in the Shiksha Setu REST API, including headers, request payloads, and response structures.

**Base URL:** `http://localhost:5000/api`  
**Authentication:** Bearer JWT in `Authorization: Bearer <token>` header.

---

## 1. Authentication & Profile Endpoints

### `POST /auth/register`
Registers a student account and automatically provisions the student profile. Public registration always creates a student account; officer accounts are provisioned through the demo seed process.
- **Access:** Public
- **Request Body:**
```json
{
  "name": "Birsa Munda",
  "email": "birsa.munda@example.in",
  "mobile": "9876543210",
  "password": "Student@123",
  "language": "en",
  "profile": {
    "fullName": "Birsa Munda",
    "dob": "2004-03-15",
    "gender": "male",
    "category": "ST",
    "state": "Jharkhand",
    "district": "Khunti",
    "familyIncome": 140000,
    "institution": "Birsa Munda College, Khunti",
    "course": "B.Sc Botany",
    "year": 2,
    "udiseId": "UDISE-2026-1001",
    "apaarId": "APAAR-90001001",
    "maskedBankRef": "XXXX-XXXX-8921"
  }
}
```
- **Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "673f8a...",
      "name": "Birsa Munda",
      "email": "birsa.munda@example.in",
      "role": "student",
      "language": "en"
    },
    "profile": { ... }
  }
}
```

### `POST /auth/login`
Authenticates with email and password, returning a JWT token.
- **Access:** Public
- **Request Body:**
```json
{
  "email": "birsa.munda@example.in",
  "password": "Student@123"
}
```
- **Response `200 OK`:** Returns user object, token, and student profile.

### `GET /auth/me`
Retrieves current authenticated session user and profile.
- **Access:** Authenticated (`student` or `officer`)

### `PUT /auth/profile`
Updates the authenticated student's profile details (institution, course, year, state, district, income, bank reference, etc.).
- **Access:** Student only
- **Request Body:** One or more editable profile fields (e.g. `{ "institution": "Birsa Institute of Tech", "year": 3, "familyIncome": 160000 }`). Fields outside the profile allowlist, including `userId`, are rejected.
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "profile": {
      "_id": "673f8a...",
      "userId": "673f8a...",
      "fullName": "Birsa Munda",
      "institution": "Birsa Institute of Tech",
      "year": 3,
      "familyIncome": 160000
    }
  }
}
```

---

## 2. Digital Document Wallet Endpoints

### `POST /documents`
Uploads a document to the encrypted wallet. Encrypted on disk using **AES-256-GCM**.
- **Access:** Student only
- **Headers:** `Content-Type: multipart/form-data`
- **Form Fields:** `type` (`st_certificate` | `income_certificate` | `marksheet` | `aadhaar_id` | `bank_passbook`), `file` (Max 5 MB).
- **Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "document": {
      "_id": "673f...",
      "type": "st_certificate",
      "originalName": "st_caste_cert.pdf",
      "encrypted": true,
      "status": "VERIFIED",
      "source": "STUDENT_UPLOAD",
      "uploadedAt": "2026-10-19T11:00:00.000Z"
    }
  }
}
```

### `GET /documents`
Lists all verified documents stored in the authenticated student's wallet.

### `GET /documents/:id/download`
Decrypts and streams the file with original MIME headers for secure inline viewing.

### `DELETE /documents/:id`
Deletes the document from disk and database with audit logging.

---

## 3. Scheme & Eligibility Endpoints

### `GET /schemes`
Lists all 5 Ministry of Tribal Affairs scholarship schemes.
- **Access:** Public

### `GET /schemes/eligibility`
Personalized eligibility engine evaluation based on student's verified profile and active applications.
- **Access:** Student only
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "eligible": [
      {
        "scheme": { "code": "MOTA-POST-MATRIC", "name": "Post-Matric Scholarship for ST Students" },
        "isEligible": true,
        "hasConflict": false,
        "reasons": [
          "Recognized Scheduled Tribe category",
          "Income within ceiling (₹1,40,000)",
          "Enrolled in valid course (B.Sc Botany)"
        ]
      }
    ],
    "ineligible": [],
    "conflicts": []
  }
}
```

---

## 4. Application Lifecycle Endpoints

### `POST /applications`
Creates a `DRAFT` application pre-filled from student profile and auto-attaches wallet certificates.
- **Access:** Student only
- **Request Body:** `{ "schemeCode": "MOTA-POST-MATRIC" }`

### `GET /applications`
Lists authenticated student's applications with statuses, mismatches, and timelines.

### `POST /applications/:id/submit`
Submits application and executes smart auto-verification across DigiLocker, UDISE+, APAAR, e-District, and Bank registries.
- **Outcome A (Clean):** Status transitions `SUBMITTED` → `AUTO_VERIFYING` → `VERIFIED` → `APPROVED_FOR_SANCTION` → `DISBURSED_SIMULATED`.
- **Outcome B (Mismatch):** Status transitions to `FLAGGED`. Mismatches list populated. Forwarded to Nodal Officer review queue. **Never silently rejected.**

---

## 5. Nodal Officer Endpoints

### `GET /officer/queue`
Retrieves verification queue of applications (`FLAGGED`, `UNDER_REVIEW`).
- **Access:** Officer only (`requireRole('officer')`)
- **Query Params:** `schemeCode`, `state`, `status`

### `POST /officer/applications/:id/decision`
Records officer approval or rejection with mandatory remarks.
- **Access:** Officer only
- **Request Body:**
```json
{
  "decision": "APPROVE",
  "remarks": "Spelling variation verified against revenue manual register. Approved for grant."
}
```
*(On `REJECT`, automatically evaluates and attaches recommended alternative schemes).*

### `GET /officer/coverage-gaps`
Cross-matches institutional ST rolls (UDISE+) against scholarship records to surface unreached students.
- **Access:** Officer only
- **Query Params:** `state`, `district`, `level`, `format=csv`

### `GET /officer/analytics`
Returns operational metrics, status breakdown counts, scheme distributions, and flag rates.

---

## 6. JAGO Multilingual AI Assistant

### `POST /jago/chat`
Answers citizen queries regarding eligibility, application tracking, and documents in plain language (English or Hindi).
- **Access:** Authenticated
- **Request Body:**
```json
{
  "message": "What is my current scholarship application status?",
  "language": "en"
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "reply": "Current status for MOTA-2026-10001: FLAGGED. Your application is currently under manual review by the Nodal Officer. Discrepancies are never silently rejected.",
    "source": "RULE_BASED_FALLBACK"
  }
}
```
*(Contains prompt injection defenses; queries restricted strictly to authenticated student's data).*

---

## 7. Notification Endpoints

### `GET /notifications`
Retrieves in-app status updates, deficiency alerts, and sanction notices for the authenticated user, along with the unread count.
- **Access:** Authenticated
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "_id": "673f...",
        "type": "STATUS_CHANGE",
        "title": "Application Under Review",
        "message": "Your application MOTA-2026-10001 has been flagged for empathetic manual review.",
        "readAt": null,
        "createdAt": "2026-10-21T06:00:00.000Z"
      }
    ],
    "unreadCount": 1
  }
}
```

### `PATCH /notifications/:id/read`
Marks a single notification as read.
- **Access:** Authenticated

### `PATCH /notifications/read-all`
Marks all notifications as read for the authenticated user.
- **Access:** Authenticated
