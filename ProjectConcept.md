## Project Overview – CareVault POC

CareVault is a proof-of-concept web application that shows how everyday clinical tasks can be streamlined when **patient data, AI decision-support, and shareable digital artifacts live in one place**.
The POC purposefully keeps infrastructure simple—one monorepo, a local SQLite database, and two packages (Next.js front-end, FastAPI back-end)—so the team can focus on demonstrating value, not plumbing.

---

### 1. Problem We’re Solving

1. **Fragmented records** – Patients carry paper files or scattered PDFs; doctors lack a single, up-to-date view.
2. **Error-prone prescribing** – Busy clinicians may overlook drug interactions or allergies.
3. **Inefficient hand-offs** – Pharmacies and referred doctors re-key data from printed scripts, introducing delays and mistakes.

---

### 2. How CareVault POC Answers It

| Challenge                  | POC Feature                                                            | Outcome                                                       |
| -------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------- |
| Access to complete history | Patient & Doctor dashboards backed by a single SQL schema              | Everyone sees the same source of truth                        |
| Safe prescribing           | AI micro-service that calls RxNav + GPT-4o mini to summarise conflicts | Warnings surface before script is saved                       |
| Seamless sharing           | Auto-generated PDF + QR pointing to a read-only public page            | Pharmacies and specialists scan, view, or download in seconds |
| Revocable privacy          | Patient can disable any QR token instantly                             | Access is under patient’s control                             |

---

### 3. Primary Actors

* **Doctor** – Creates appointments and prescriptions; reviews AI safety report; hands patient the QR/PDF.
* **Patient** – Logs in to see visit history; can revoke QR access if lost or mis-used.
* **Pharmacy / External clinician** – Scans QR to view immutable, signed prescription without needing an account.

---

### 4. End-to-End User Journey

1. **Doctor logs in** and books a new appointment for *Jane Doe*.
2. During the visit, doctor opens “New Prescription,” types drug names; the form autocompletes from an open-FDA list.
3. On **Save Draft**, the back-end:

   * Calls RxNav for factual interaction data.
   * Feeds results to GPT-4o mini to generate a concise, human-readable summary.
4. UI shows the summary. Doctor clicks **Finalize**.
5. FastAPI service:

   * Stores prescription JSON in SQLite.
   * Renders a branded PDF.
   * Generates a share-token + QR code linked to `/share/{token}`.
6. Doctor prints or texts the QR to Jane.
7. **Patient Dashboard** now lists the visit with a toggle to deactivate the token anytime.
8. **Pharmacist** scans the QR, views the read-only prescription page, verifies authenticity, dispenses medicine.

---

### 5. Scope Boundaries

| Included (POC)               | Excluded (future)                          |
| ---------------------------- | ------------------------------------------ |
| Local SQLite store           | Cloud-hosted DB, multi-tenant scaling      |
| Credentials-only auth        | OAuth, biometric login                     |
| Single clinic workflow       | Multi-hospital hierarchy, insurance claims |
| Basic JWT & HTTPS (dev cert) | Full HIPAA/GDPR audit trail                |
| RxNav + GPT-4o mini          | On-prem LLM, fine-tuned models             |

---

### 6. Success Criteria

* **Setup**: New developer runs `pnpm dev` and has both servers live within 5 minutes.
* **Clinical flow demo** (doctor→AI→PDF/QR→patient) completes with no console errors.
* **Data integrity**: Every prescription record in SQLite links 1-to-1 with a PDF and active/inactive share token.
* **AI latency**: Interaction check returns < 1 second locally (caching permitted).
* **Token control**: Revoking a share token denies access immediately.

---

### 7. Why This Matters

Delivering this POC proves three things to stakeholders:

1. **Feasibility** – Modern JS + Python stacks can cover the whole care loop without heavyweight hospital systems.
2. **Patient empowerment** – Instant revocation and shareable QR respect both convenience and consent.
3. **AI you can trust** – Combining deterministic drug data with an LLM summary addresses safety concerns while keeping explanations clinician-friendly.

Add this project description atop the execution steps, and any engineer—or investor—will grasp exactly **what** CareVault is, **why** it exists, and **how** the planned tasks ladder up to a meaningful, demo-ready product.
