# ReviewGuard | Full System Architecture & Implementation Report
## AI-Native Moderation & Threat Intel Ecosystem

---

### 1. Executive Summary
**ReviewGuard** is a high-fidelity, end-to-end review moderation platform designed for mission-critical community safety. By integrating **Large Language Models (LLMs)** with **Local Semantic Embeddings** and a **Deterministic Fallback Shield**, it creates a multi-layered defense against toxicity, spam, and misinformation. The system is built for extreme scalability using asynchronous task queues and real-time telemetry across three distinct user roles.

---

### 2. Full-Stack Architecture

#### 2.1 Technology Stack
*   **Frontend:** React 18, Vite, Vanilla CSS (Glassmorphic Design), Recharts, Socket.io-Client.
*   **Backend:** Node.js, Express.js, Socket.io, JWT (Auth), express-rate-limit.
*   **Database:** MongoDB Atlas (Mongoose ODM).
*   **AI Infrastructure:** Groq (Llama-3-8B), Hugging Face Transformers (BGE-Small-En).
*   **Task Management:** BullMQ, Redis (Asynchronous background processing).

---

### 3. AI Intelligence Infrastructure

#### 3.1 The Multi-Model Hybrid Detection Engine
ReviewGuard balances depth, speed, and reliability using three distinct layers for **Toxicity and Duplicate detection**:
*   **Layer 1 (Hugging Face):** Semantic Fingerprinting for high-speed Duplicate Detection.
*   **Layer 2 (Groq LLM):** Neural Toxicity Detection using Contextual Auditing (Llama-3).
*   **Layer 3 (Deterministic Shield):** Rule-Based Fallback using TF-IDF and Regex.

#### 3.2 Real-Time Hybrid Intervention
*   **Synchronous Interruption:** System runs parallel checks before saving.
*   **Combined Threat Detection:** Blocks reviews that are both toxic and redundant.
*   **Explainable AI (XAI):** Provides reasoning for every AI decision.

---

### 4. Role-Based Feature Deep-Dive

#### 4.1 THE USER ROLE (The Content Contributor)
*   **AI-Powered Submission:** Real-time feedback and **"AI Pre-Check"** warnings before submission.
*   **Trust & Impact Meter:** Game-ified reputation system (Probationary → Elite Guardian).
*   **Symmetric History Scroller:** Vertically-locked lifecycle list with **Status Accents**.
*   **Integrity: Soft-Delete Option:** Users can delete their own reviews. However, the system performs a **"Soft-Delete,"** meaning the review is removed from public view but remains in the database for moderator oversight to prevent "delete-and-retry" evasion patterns.

#### 4.2 THE MODERATOR ROLE (The System Evaluator)
*   **Command Queue:** Prioritized list of flagged content.
*   **Evaluation Studio:** Side-by-side comparison for duplicates and Groq-generated reasoning.
*   **Evasion Detection:** Moderators can view reviews that were **"Deleted by User."** While the moderator is **locked from taking action** on these (to respect user privacy), they can still analyze the content to identify repeat offenders or bot patterns.
*   **Audit Timeline:** Every review card displays a **Time Log (Audit Trail)**, showing exactly when it was submitted, scanned, and handled.

#### 4.3 THE ADMIN ROLE (The Strategic Overseer)
*   **Live AI Threat Feed:** Real-time terminal-style stream of all system telemetry.
*   **Staff Governance Hub:** The Admin has total control over the moderation team:
    *   **Access Control:** Can promote/demote users between roles (User → Moderator → Admin).
    *   **Account Deactivation:** Can instantly revoke a staff member's access by toggling their `Active` status.
    *   **Permanent Removal:** Can perform a **Cascading Delete**, which permanently removes a staff member and all their associated data from the platform.
*   **Global Audit Logs:** Access to the **Master Audit System**, which records every single moderator decision (Approval/Rejection) with high-precision timestamps for total accountability.
*   **Staff Performance Leaderboard:** Comparative analytics on staff efficiency and accuracy.

---

### 5. Technical Deep-Dive: Component Mechanics

#### 5.1 The Trust & Impact Engine
*   **Mechanism:** Runs `(ApprovedReviews / TotalReviews) * 100`.
*   **Visuals:** Custom SVG circular progress bar with dynamic stroke-dasharray animation.

#### 5.2 The Symmetric Layout Engine
*   **The Symmetry Trick:** Uses `grid-cols-5` with `h-0 flex-1` on the History scroller to ensure the right column perfectly matches the height of the left column (Submit + Trust Meter).

#### 5.3 Asynchronous AI Pipeline (BullMQ + Redis)
*   **Workflow:** Producer (Submit) → Redis Queue → Consumer (Background Worker) → AI Analysis → Socket.io Push.

---

### 6. Cyber-Security & Stability Layer
*   **Tiered Rate Limiting:** 10k/15m for API, 1k/h for Reviews, 500/15m for Auth.
*   **Fail-Soft Logic:** Automated transition to the **Deterministic Shield (Rule-Based)** during network instability.

---

### 7. Technical Conclusion
ReviewGuard is a production-ready **Trust Infrastructure**. By combining asynchronous AI pipelines with deterministic fallbacks and specialized role-based dashboards, it provides a complete, reliable, and premium ecosystem for modern community management.
