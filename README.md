# CAPACITY CONNECT (SIH26075)

> **Digital Capacity Building & Competency-Driven Learning Platform**

Capacity Connect is a full-stack learning management and skill verification portal built for institutional and organizational capacity-building. It connects standardized skills, curriculum delivery, anti-cheat assessments, official certificate issuance, and institutional competency frameworks into a unified learning journey.

---

## 🚀 Key Features & Capabilities

### 1. 👥 Platform Governance, Trainer Management & Assessment Review (Phase 6.5)
- **Admin User Management (`/admin/users`)**:
  - Centralized directory for all platform users (Trainees, Trainers, Admins) with keyword search and role/status filtering.
  - Role-specific audit modals: Trainees (enrolled courses, completions, certificates, progress) & Trainers (authored courses, learners, ratings).
  - Account status toggle (Activate / Deactivate) with self-deactivation protection for administrators.
  - Seamless real-time deactivation notices and instant single-click session reactivation.
- **Admin Trainer Management (`/admin/trainers`)**:
  - Institutional faculty directory with course volumes, published vs. draft metrics, total enrolled learners, and average ratings.
  - Comprehensive trainer portfolio inspection modal with course-by-course performance breakdown.
- **Trainer Consolidated Learner View (`/trainer/learners`)**:
  - Unified multi-course learner roster across all courses owned by the instructor.
  - **Strict Server-Side Multi-Tenant Isolation**: Instructors strictly view learners enrolled in their own courses.
  - Learner progress audit modal displaying module checklist completion, quiz scores, final exam results, and certificates.
- **Post-Submission Assessment Review & Answer Explanations**:
  - Reusable question-by-question review interface highlighting selected choices, correct answers, and instructor explanations.
  - **Anti-Cheat Enforcement**: Correct options and explanations remain strictly hidden prior to legitimate attempt submission.
  - **Phase 7 AI Tutor Integration Hook**: `[ ✨ Explain with AI ]` action button preparing the interface for contextual remediation.
  - Strict RBAC: Trainees view only own attempts, trainers view attempts for owned courses, and admins have platform-wide access.

### 2. 📊 Analytics & Performance Insights (Phase 6)
- **Trainee Analytics (`/trainee/analytics`)**:
  - Course-wise progress tracking, assessment pass rates, and chronological score trajectory.
  - Skill proficiency distribution across verified capabilities.
  - Institutional competency progress and satisfied skill metrics.
  - Earned certificates gallery and unified recent activity timeline.
- **Trainer Analytics (`/trainer/analytics`)**:
  - Multi-tenant data isolation (trainers strictly see metrics for their own courses).
  - Course enrollments vs. completions bar charts and completion percentage rates.
  - Learner progress spread histogram (`0-25%`, `26-50%`, `51-75%`, `76-99%`, `100%`).
  - Assessment pass rates and average score telemetry.
  - Skills covered across curriculum and target proficiencies.
  - Course performance data table with quick access to course management.
- **Platform Admin Analytics (`/admin/analytics`)**:
  - Platform-wide executive telemetry across users, course catalog status, enrollments, and certs.
  - User role distribution (Trainees, Trainers, Admins) and course catalog status (Published vs. Draft).
  - Platform learning trajectory line charts (enrollments & course completions over time).
  - Top performing courses and most frequently mapped skills.
  - Institutional competency framework overview and trainer capacity table.

### 2. 🎓 Skill & Competency Framework (Phase 5 & 5.5)
- **Standardized Skill Library**: Admin-governed master catalog containing pre-seeded default skills (Technical & Soft Skills) with normalized naming to prevent duplicate pollution.
- **Custom Category & Domain Specification**: Support for specialized domain skills under customizable categories.
- **Course-Level Skill & Proficiency Mapping**: Trainers map approved skills and set target proficiency levels (`Beginner`, `Proficient`, `Advanced`) per course.
- **Strict Final Assessment Skill Gating**: Skills are **verified ONLY when a trainee passes the final course assessment ($\ge$ passing %)** and earns an official certificate.
- **Consolidated Trainee "My Skills" Portfolio**:
  - Single consolidated record per skill across all completed courses.
  - **Highest Proficiency Retention**: Automatically retains the highest verified proficiency (`Beginner < Proficient < Advanced`) and never downgrades.
  - **Attached Proof of Work / Evidence**: Displays qualifying courses, final exam percentage scores, certificate IDs, and direct action links (`[View Course]` & `[View Certificate]`).
- **Dynamic Competency Engine ("My Competencies")**:
  - Institutional competency domains composed of multiple required standardized skills.
  - Dynamic progress calculation (`% Demonstrated`) with real-time checklist states (`✓ Satisfied`, `○ Learning`, `○ Not Earned`).

### 3. 📝 Assessment Engine & Anti-Cheat System (Phase 4.5)
- **Module Quizzes & Final Exams**: Trainers configure custom question sets, marks, time limits, and passing percentages.
- **Server-Side Anti-Cheat Sanitization**: Correct answer options are strictly stripped from client-bound payloads.
- **Course Gating**: Final Course Assessments are locked until $100\%$ of modules are completed.
- **Centralized Assessment Hub**: Dedicated trainee view showing Available, In-Progress, and Completed assessments.

### 4. 📜 Automated Certificate Generation & Verification
- **Official PDF Certificate Generation**: Automatically generated and signed upon passing the final assessment.
- **Tamper-Proof Verification Codes**: Unique certificate identifiers (`CC-2026-XXXXXX`) with built-in duplicate prevention.
- **Certificate Modal & Downloads**: Trainees can preview and download certificates directly from their dashboard and skill portfolio.

### 5. 📚 Course Studio & Learning Experience (Phases 3 & 4)
- **Trainer Studio**: Drag-and-drop course creation, difficulty levels, prerequisites, and draft/publishing controls.
- **Module & Multimedia Resource Management**: Upload or link videos, PDFs, code files, external links, and text guides.
- **Learner Engagement**: Course reviews, star ratings, and community discussion threads.
- **Progress Tracking**: Real-time module progress calculations and learner dashboards.

### 6. 🛡️ Role-Based Access Control (RBAC) & Governance (Phases 1 & 2)
- **Trainee**: Course catalog discovery, interactive learning, quizzes, skill evidence portfolio, and competency tracking.
- **Trainer**: Course authoring, multimedia resource mapping, skill proficiency alignment, and assessment creation.
- **Administrator**: Master skill library management, competency framework governance, course inspection/audit, and user oversight.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Axios, Recharts, Lucide React |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Local / Atlas Cloud) with Mongoose ODM |
| **PDF Engine** | PDFKit (Dynamic Certificate Generation) |
| **Authentication** | JWT (JSON Web Tokens) with bcrypt password hashing |
| **Storage** | Local Filesystem Storage (`server/uploads/`) |

---

## 📦 Project Structure

```
Capacity Connect/
├── client/                     # Frontend Application (React + Vite + Tailwind)
│   ├── src/
│   │   ├── components/         # Reusable UI (SkillsSelect, CertificateModal, QuizTakeModal, etc.)
│   │   ├── layouts/            # DashboardLayout, Sidebar, Topbar, MainLayout
│   │   ├── pages/
│   │   │   ├── admin/          # AdminSkillsPage, AdminCompetenciesPage, AdminCoursesPage, etc.
│   │   │   ├── trainer/        # CreateCoursePage, ManageCoursePage, TrainerAssessmentsPage, etc.
│   │   │   └── trainee/        # TraineeSkillsPage, TraineeCompetenciesPage, CourseCatalogPage, etc.
│   │   ├── services/api.js     # Centralized API service layer
│   │   └── context/            # AuthContext (JWT session state)
│   └── package.json
│
├── server/                     # Backend API Server (Node.js + Express)
│   ├── config/                 # MongoDB database connection
│   ├── controllers/            # skillController, competencyController, traineeSkillController, etc.
│   ├── models/                 # Skill, Competency, Course, Module, Assessment, Certificate, etc.
│   ├── routes/                 # Express API route declarations with RBAC middleware
│   ├── middleware/             # Auth & Role verification middleware
│   ├── utils/                  # skillSeeder, certificateGenerator, courseOwnership
│   ├── uploads/                # Local file storage (certificates, thumbnails, resources)
│   ├── test_phase5_5.js        # Phase 5.5 automated verification test suite
│   ├── test_phase5.js          # Phase 5 master test suite
│   ├── test_phase4_5.js        # Phase 4.5 regression test suite
│   └── package.json
│
└── README.md
```

---

## ⚙️ Local Setup & Installation

### Prerequisites
- **Node.js**: v18+ (tested on Node v20)
- **npm**: v9+
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017/capacity_connect`) or MongoDB Atlas URI

---

### 1. Backend Setup

```bash
cd server
npm install
```

Create `server/.env` (or copy from `server/.env.example`):
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/capacity_connect
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
```

Start the backend server:
```bash
npm run dev
```
*Backend runs on `http://localhost:5000` (Health Check: `http://localhost:5000/api/health`).*
*On startup, 30 default standardized skills are seeded idempotently.*

---

### 2. Frontend Setup

```bash
cd client
npm install
```

Create `client/.env` (or copy from `client/.env.example`):
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend development server:
```bash
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 🧪 Automated Test Verification

Run the automated test suites from the `server` directory:

```bash
cd server

# Phase 6.5 User/Trainer Governance & Assessment Review Suite (16 Groups / 37 Tests)
node test_phase6_5.js

# Phase 6 Analytics & Insights Test Suite (12 Tests)
node test_phase6.js

# Phase 5.5 Skills & Competency Refinement Suite (14 Tests)
node test_phase5_5.js

# Phase 5 Master Taxonomy & Mapping Suite (20 Tests)
node test_phase5.js

# Phase 4.5 Assessment & Anti-Cheat Regression Suite (20 Tests)
node test_phase4_5.js
```

Verify client production compilation:
```bash
cd client
npm run build
```

---

## 🔌 API Reference Overview

### User & Trainer Management (Phase 6.5)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | Admin | Search & filter all platform users (trainees, trainers, admins) |
| `GET` | `/api/users/:id` | Admin | Get user profile with role-specific learning/instruction audit |
| `PATCH` | `/api/users/:id/status` | Admin | Activate or deactivate user account (self-deactivation protected) |
| `GET` | `/api/trainers` | Admin | Get all platform instructors with capacity & review metrics |
| `GET` | `/api/trainers/:id` | Admin | Get single trainer profile & authored course breakdown |
| `GET` | `/api/trainer/learners` | Trainer | Get consolidated learner roster strictly for owned courses |
| `GET` | `/api/trainer/learners/:id` | Trainer | Get learner progress, module quizzes & final exam for owned courses |
| `GET` | `/api/assessments/attempts/:attemptId/review` | Trainee/Trainer/Admin | Question-by-question review with explanations & AI tutor hook |

### Analytics & Performance Insights (Phase 6)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/analytics/trainee` | Trainee | Get personal learning progress, score trend, skill distribution & certs |
| `GET` | `/api/analytics/trainer` | Trainer | Get owned course performance, enrollments, completions & progress spread |
| `GET` | `/api/analytics/admin` | Admin | Get platform-wide telemetry, user distribution, top courses & trainer activity |

### Authentication
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new Trainee or Trainer account |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT token |
| `GET` | `/api/auth/me` | Protected | Retrieve authenticated user profile session |

### Skills & Taxonomy (Phase 5 / 5.5)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/skills` | Public / Auth | Search & filter active skills (Admin `?all=true`) |
| `POST` | `/api/skills` | Admin | Create standardized skill with category |
| `PUT` | `/api/skills/:id` | Admin | Edit skill details & category |
| `PATCH` | `/api/skills/:id/status` | Admin | Toggle active / inactive status |
| `DELETE` | `/api/skills/:id` | Admin | Delete skill (guarded against active references) |

### Competencies (Phase 5 / 5.5)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/competencies` | Public / Auth | List active competency frameworks |
| `POST` | `/api/competencies` | Admin | Create competency bundling required skills |
| `PUT` | `/api/competencies/:id` | Admin | Update competency requirements |
| `PATCH` | `/api/competencies/:id/status`| Admin | Toggle competency availability |

### Trainee Skill Profile & Evidence (Phase 5.5)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/trainees/me/skills` | Trainee | Get consolidated skills, highest proficiency & Proof of Work evidence |
| `GET` | `/api/trainees/me/competencies` | Trainee | Get dynamic competency evaluation & % demonstrated checklist |

### Courses & Curriculum
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/courses` | Public / Auth | Get course catalog (supports filters & search) |
| `GET` | `/api/courses/:id` | Public / Auth | Get course details, modules, and mapped skills |
| `POST` | `/api/courses` | Trainer / Admin | Create draft course with mapped skills & proficiency |
| `PUT` | `/api/courses/:id` | Owner / Admin | Update course metadata, prerequisites & skills |
| `PATCH` | `/api/courses/:id/publish` | Owner / Admin | Publish / unpublish course |

### Assessments & Quizzes (Phase 4.5)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/assessments` | Trainer / Admin | Create module quiz or final assessment |
| `GET` | `/api/assessments/:id` | Enrolled / Owner | Get assessment (answers stripped for trainees) |
| `POST` | `/api/assessments/:id/attempt`| Enrolled Trainee | Submit quiz attempt and auto-evaluate score |
| `GET` | `/api/assessments/trainee/all` | Trainee | Centralized available & completed assessments feed |

### Certificates (Phase 4.5)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/certificates/my` | Trainee | Get all earned certificates with scores & IDs |
| `GET` | `/api/certificates/:id` | Authenticated | Get certificate verification details |

---

## 🔒 Security & Authorization

- **JWT Authentication**: Secure Bearer token authentication on all protected routes.
- **Server-Side Verification**: Skill awards, certificate generation, and anti-cheat validation are computed strictly on the backend.
- **Ownership Verification**: Trainers can only modify their own courses; Admins maintain platform-wide governance.
- **Sanitized Responses**: Correct quiz options and internal assessment keys are stripped before returning data to learners.

---

## 📄 License & Attribution

Developed for **SIH26075 — Capacity Connect**.  
Built with modern MERN architecture for scalable, verifiable digital capacity building.
