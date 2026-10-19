# Shiksha Setu: Technical Design Document

This document provides a comprehensive technical architecture, flowchart, data model, and security specification for **Shiksha Setu**, a unified scholarship platform for the Ministry of Tribal Affairs (MoTA).

---

## 1. System Architecture

The following diagram illustrates the high-level architecture of Shiksha Setu, connecting the student Progressive Web App (PWA) and the Nodal Officer portal to the Express REST API, encryption vault, RAG knowledge engine, and simulated government registries.

```mermaid
graph TD
    subgraph Client ["Client Tier (PWA)"]
        SPA["React 18 Single Page App"]
        SW["Service Worker (vite-plugin-pwa)"]
        IDB[("IndexedDB (idb Cache)")]
        Speech["Web Speech API (STT / TTS)"]
    end

    subgraph API ["Application Tier (Node.js 20 / Express)"]
        AuthMid["JWT Auth & RBAC Middleware"]
        AuditSvc["Audit Logging Service"]
        ConsentSvc["Consent Verification Service"]
        CryptoUtil["AES-256-GCM Encryption Vault"]
        EligEngine["Eligibility & Conflict Engine"]
        AppSvc["Smart Verification & Application Pipeline"]
        JagoSvc["JAGO RAG & Fallback AI Engine"]
    end

    subgraph Storage ["Data Tier"]
        Mongo[("MongoDB / In-Memory Server")]
        Uploads[("Encrypted Document Storage (/uploads)")]
    end

    subgraph Adapters ["Simulated Government Registries (Adapters)"]
        DL["DigiLocker Adapter (Identity & ST Caste)"]
        UDISE["UDISE+ Adapter (School/College Enrolment)"]
        APAAR["APAAR Adapter (ABC Academic Credits)"]
        OTR["OTR Adapter (Central One-Time Reg)"]
        EDIST["State e-District (Revenue Income Reg)"]
        PFMS["Bank & PFMS DBT Gateway (Simulated)"]
    end

    SPA <--> SW
    SW <--> IDB
    SPA <--> Speech
    SPA <-->|"REST API (JSON / Bearer JWT)"| AuthMid

    AuthMid --> ConsentSvc
    AuthMid --> AuditSvc
    AuthMid --> EligEngine
    AuthMid --> AppSvc
    AuthMid --> JagoSvc

    CryptoUtil <--> Uploads
    AppSvc --> CryptoUtil
    AppSvc --> Mongo
    JagoSvc --> Mongo
    AuditSvc --> Mongo

    AppSvc --> DL
    AppSvc --> UDISE
    AppSvc --> APAAR
    AppSvc --> OTR
    AppSvc --> EDIST
    AppSvc --> PFMS
```

---

## 2. End-to-End Application Flow

The lifecycle of a scholarship application through smart auto-verification, non-destructive mismatch handling, and simulated DBT disbursement is modeled below:

```mermaid
flowchart TD
    Start([Student Logs In]) --> Profile["Auto-fetch Profile & Wallet"]
    Profile --> EligCheck["Evaluate Eligibility & Conflicts"]
    EligCheck --> SelectScheme["Student Selects Scheme"]
    SelectScheme --> Prefill["Generate Pre-filled Draft Application"]
    Prefill --> AttachDocs["Auto-attach Verified Wallet Documents"]
    AttachDocs --> Submit["Student Confirms & Submits"]
    
    Submit --> ConsentCheck{"Consent Record Stored?"}
    ConsentCheck -- No --> PromptConsent["Store Citizen Consent Record"] --> AdapterChecks
    ConsentCheck -- Yes --> AdapterChecks["Run Multi-Point Smart Auto-Verification"]
    
    subgraph Verification ["Smart Verification Layer"]
        AdapterChecks --> V1["DigiLocker (Caste & Demographics)"]
        AdapterChecks --> V2["UDISE+ / APAAR (Institutional Enrolment)"]
        AdapterChecks --> V3["State e-District (Income Certificate)"]
        AdapterChecks --> V4["NPCI / Bank (Aadhaar Seeding)"]
    end

    V1 & V2 & V3 & V4 --> EvaluateResults{"Any Data Discrepancies?"}
    
    EvaluateResults -- "No (All Pass)" --> StatusVerified["Status: VERIFIED"]
    StatusVerified --> SanctionSim["Auto-approved for Sanction"]
    SanctionSim --> DBTSim["PFMS Simulated DBT Disbursed"]
    DBTSim --> NotifySuccess["Notify Student (SMS/Email/In-App)"]
    NotifySuccess --> DoneSuccess([Application Complete & Disbursed])
    
    EvaluateResults -- "Yes (Mismatches Detected)" --> StatusFlagged["Status: FLAGGED (Never Silently Rejected)"]
    StatusFlagged --> RecordMismatch["Store Comparison Diff Table"]
    RecordMismatch --> OfficerQueue["Route to Nodal Officer Queue"]
    OfficerQueue --> NotifyReview["Alert Student: Under Nodal Review"]
    
    OfficerQueue --> OfficerReview["Nodal Officer Reviews Supporting Docs"]
    OfficerReview --> Decision{"Officer Decision"}
    
    Decision -- Approve --> AddRemarks["Mandatory Officer Remarks"]
    AddRemarks --> SanctionSim
    
    Decision -- Reject --> RejectRemarks["Mandatory Rejection Remarks"]
    RejectRemarks --> RecommendAlt["Auto-recommend Eligible Alternative Schemes"]
    RecommendAlt --> NotifyReject["Notify Student with Reasons & Alternatives"]
    NotifyReject --> DoneReject([End - Alternatives Offered])
```

---

## 3. Entity-Relationship Data Model

The database schemas implemented with Mongoose are structured as follows:

```mermaid
erDiagram
    User ||--o{ StudentProfile : "has profile"
    User ||--o{ Document : "owns in wallet"
    User ||--o{ Application : "submits"
    User ||--o{ ConsentRecord : "grants"
    User ||--o{ Notification : "receives"
    User ||--o{ AuditLog : "triggers action"

    Scheme ||--o{ Application : "applied for"
    Application ||--o{ VerificationResult : "generates"

    User {
        ObjectId _id PK
        string role "student | officer"
        string name
        string email UK
        string mobile
        string passwordHash
        string language "en | hi"
        Date createdAt
    }

    StudentProfile {
        ObjectId _id PK
        ObjectId userId FK
        string fullName
        string dob
        string gender
        string category "ST"
        string state
        string district
        number familyIncome
        string institution
        string course
        number year
        string udiseId
        string apaarId
        string maskedBankRef
    }

    Document {
        ObjectId _id PK
        ObjectId userId FK
        string type "st_certificate | income_cert | marksheet"
        string originalName
        string storedPath
        boolean encrypted
        string status "PENDING | VERIFIED | FLAGGED | EXPIRED"
        string source "STUDENT_UPLOAD | MOCK_DIGILOCKER"
        Date uploadedAt
        Date expiresAt
    }

    Scheme {
        ObjectId _id PK
        string code UK
        string name
        string nameHi
        string level "Pre-Matric | Post-Matric | Higher Education | Overseas"
        object eligibilityRules
        array requiredDocs
        string sourcePortal "NSP | SFMP | NOS"
        boolean sample
    }

    Application {
        ObjectId _id PK
        string applicationNumber UK
        ObjectId userId FK
        string schemeCode FK
        string status "DRAFT..DISBURSED_SIMULATED"
        object prefilled
        array attachedDocs
        array mismatches
        array timeline
        string rejectionReason
        array recommendedSchemes
    }

    VerificationResult {
        ObjectId _id PK
        ObjectId applicationId FK
        string source "MOCK_DIGILOCKER | MOCK_UDISE.."
        string status "PASS | MISMATCH | ERROR"
        object details
    }

    ConsentRecord {
        ObjectId _id PK
        ObjectId userId FK
        string source
        string purpose
        Date grantedAt
        string ipAddress
    }

    EnrollmentRecord {
        ObjectId _id PK
        string udiseId
        string studentName
        string category "ST"
        string institution
        string state
        string district
        number familyIncomeEstimate
    }

    KnowledgeDoc {
        ObjectId _id PK
        string title
        string language "en | hi"
        string text
        array tags
        string schemeCode
    }
```

---

## 4. Security & Privacy Architecture

1. **Role-Based Access Control (RBAC):**
   - Routes are strictly segregated by role (`student`, `officer`).
   - A student accessing any `/api/officer/*` endpoint receives `403 FORBIDDEN`.
   - Officers cannot modify applicant financial data directly; they can only approve or reject with written remarks.
2. **Encrypted Digital Document Storage:**
   - Physical document payloads are encrypted with **AES-256-GCM** prior to writing to the filesystem.
   - Files are stored with authenticated tags (`[16B IV][16B AuthTag][Ciphertext]`). Decryption occurs only in memory when requested by the authenticated owner.
3. **Mandatory Citizen Consent (DPDP Act Compliance):**
   - The platform strictly enforces that no external adapter query (DigiLocker, UDISE+, e-District) is performed without an active `ConsentRecord` timestamped to the user.
4. **Audit Trail Logging:**
   - Every registration, authentication, document upload/deletion, application submission, and officer decision is recorded into an append-only `AuditLog` collection.
5. **Prompt Injection & LLM Guardrails:**
   - User inputs to the JAGO AI assistant are filtered for role impersonation, instruction override, and database manipulation attempts.
   - Authorized tools (`getMyApplicationStatus`, `checkMyEligibility`) only query data belonging to the authenticated `req.user._id`, preventing lateral cross-tenant information exposure.
