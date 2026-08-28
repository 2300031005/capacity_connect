# CAPACITY CONNECT (SIH26075)

> **Digital Capacity Building & Competency-Driven Learning Platform**

Capacity Connect is a full-stack learning management and skill verification portal built for institutional and organizational capacity-building. It connects standardized skills, curriculum delivery, anti-cheat assessments, official certificate issuance, and institutional competency frameworks into a unified learning journey.

---

## 🚀 Key Features & Capabilities

### 1. 🤖 Adaptive AI Learning Advisor & Dynamic Next Actions (Phase 7.5)
- **Real-Time Learning State Engine (`/trainee/recommendations`)**:
  - Continuously evaluates learner progress across active courses, completed coursework, assessment scores, verified skills, and career roadmaps.
  - Answers the immediate question: *"What should I do next, and why?"*
  - **4-Tier Priority Engine**:
    1. **Incomplete Active Course (`continue_course`)**: Prioritizes completing courses currently in progress (`progress < 100%`) with dynamic progress bars and `[Continue Course]` direct action.
    2. **Failed / Weak Assessment Remediation (`review_assessment`)**: Detects failed quizzes/exams and guides learners to question-level AI explanations before proceeding.
    3. **Next Career Roadmap Milestone (`start_course`)**: Identifies the next uncompleted milestone in the learner's career roadmap and matches published database courses.
    4. **Course Availability Diagnostic (`course_not_available`)**: Transparently flags roadmap skills without published courses.
  - **Educational Rationale & Invalidation**: Automatically re-analyzes trajectory whenever courses are enrolled, modules completed, or assessments submitted.

### 2. 🎯 AI Career Goal → Personalized Learning Roadmap (Phase 7.4.1)
- **Natural-Language Career Destination (`/trainee/recommendations`)**:
  - Trainees specify any target career (e.g. *"I want to become a Full Stack Developer"* or *"Cloud & DevOps Engineer"*).
  - AI determines the logical skill progression while MongoDB database authoritatively matches available published courses.
  - Numbered milestone journey (`01`, `02`, `03`) with status badges (`Already Demonstrated ✓`, `In Progress ▶`, `Recommended Milestone 🚀`, `Locked 🔒`).

### 3. 🧭 Personalized AI Learning Path (Phase 7.4)
- **Intelligent Trajectory Architecture (`/trainee/recommendations`)**:
  - Dynamically determines *"What should this trainee learn next, and in what order?"*
  - Synthesizes active enrollments, course progress, completed history, verified skills, target competencies, and assessment diagnostics into a single cohesive journey.
  - **Sequenced Timeline**: Connected stage timeline (`↓`) with stage statuses (`Current Stage`, `Completed ✓`, `Recommended`, `Next Milestone`, `Locked`), course progress indicators, and skill advancement paths.
  - **Active Course Prioritization**: Prioritizes continuing incomplete active enrollments before recommending new courses.
  - **Competency Gap & Diagnostic Remediation**: Sequences courses that close missing skills for institutional competencies and reinforce weak assessment areas.
  - **Database-Authoritative Progress**: Calculates real-time path progress (`●●●○○ 60% Path Progress: Completed: 3, In Progress: 1, Remaining: 2`).

### 3. 🌟 Centralized AI Recommendation Hub & Contextual Advisors (Phase 7.3)
- **Single Centralized Recommendations Hub (`/trainee/recommendations`)**:
  - **Recommended Courses**: Personalized database-backed courses based on completed history, enrolled progress, assessment performance, and competency gaps.
  - **Skills to Develop**: Target skill acquisition and progression roadmaps from current $\to$ target level (`Beginner`, `Proficient`, `Advanced`).
  - **Assessment Insights**: Actionable diagnostics on mastery trajectories, focus areas, and reinforcement advice.
  - **Suggested Next Steps**: Sequential learning roadmap guiding coursework, course enrollment, and certification exams.
- **Contextual AI Actions across Platform**:
  - **My Skills (`/trainee/skills`)**: `[ ✨ Improve This Skill ]` action opening an AI skill progression roadmap with action items and mapped courses.
  - **Course Details (`/trainee/courses/:id`)**: `[ ✨ Why is this course recommended for you? ]` contextual analysis detailing why the course fits the learner's verified capabilities.
  - **Assessment Review**: `[ ✨ Explain with AI ]` / `[ Why was my answer wrong? ]` instant remedial guidance with core concepts and study tips.
- **Standardized UI & Design System**:
  - Single `Recommendations` sidebar item with `Sparkles` icon.
  - Zero UI duplication, rich loading skeletons, error states, and responsive styling.

### 4. 📚 AI-Powered Course Recommendations (Phase 7.2)
- **Database-Authoritative Recommendation Layer**: Evaluates only published platform courses and excludes completed courses. Strictly prevents AI from hallucinating courses, skills, or URLs.
- **Competency Gap Bridging**: Suggests courses that unlock missing skills required for institutional competency milestones.
- **Skill Progression Alignment**: Matches target skills and maps proficiency upgrades (`currentProficiency` $\to$ `targetProficiency`).
- **Explainable Recommendation Schema**: Returns numeric match score (`70-99%`), educational reason, skill alignment, outcome benefits, and priority tag (`high`, `medium`, `low`).

### 5. 🤖 AI-Powered Assessment Explanation (Phase 7.1)
- **Contextual AI Tutor**: Post-submission question-by-question remediation using OpenAI GPT-4o-mini (`POST /api/assessments/attempts/:attemptId/questions/:questionId/explain`).
- **Structured Educational Feedback**: High-level explanation, why answer was right/wrong, core concept, key takeaway, and study tip.
- **Anti-Cheat & Strict RBAC**: Explanations are strictly gated to submitted attempts owned by the authenticated trainee. Correct answers and explanations remain fully stripped from pre-submission quiz payloads.

### 2. 👥 Platform Governance, Trainer Management & Assessment Review (Phase 6.5)
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

Run all platform test suites with a single command from the `server` directory:

```bash
cd server

# Run entire platform regression test suite (155+ assertions across Phases 4.5 through 7.2)
npm run test:all

# Run individual phase test suites
npm run test:p7_4_1 # Phase 7.4.1 AI Career Goal Roadmap (35 Tests)
npm run test:p7_4   # Phase 7.4 Personalized AI Learning Path (32 Tests)
npm run test:p7_3   # Phase 7.3 AI Recommendation Hub & UI Standardization (31 Tests)
npm run test:p7_2   # Phase 7.2 AI Course Recommendations (28 Tests)
npm run test:p7_1   # Phase 7.1 AI Assessment Tutor (35 Tests)
npm run test:p6_5   # Phase 6.5 User/Trainer Governance & Review (37 Tests)
npm run test:p6     # Phase 6 Analytics & Insights (22 Tests)
npm run test:p5_5   # Phase 5.5 Skill Attainment & Verification (14 Tests)
npm run test:p5     # Phase 5 Skills Taxonomy & Competency Management (20 Tests)
npm run test:p4_5   # Phase 4.5 Anti-Cheat & Assessment Regression (20 Tests)
```

Verify client production compilation:
```bash
cd client
npm run build
```

---

## 🔌 API Reference Overview

### AI Career Goals, Learning Paths & Tutor (Phase 7.1, 7.2, 7.3, 7.4 & 7.4.1)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/ai/career-goal` | Trainee | Get saved natural-language career goal from trainee profile |
| `POST` | `/api/ai/career-goal` | Trainee | Save or update natural-language career goal |
| `GET` | `/api/ai/career-roadmap` | Trainee | Generate sequenced career roadmap mapped to published courses |
| `POST` | `/api/ai/career-roadmap/refresh` | Trainee | Force-regenerate career learning roadmap bypassing cache |
| `GET` | `/api/ai/learning-path` | Trainee | Get personalized AI learning path trajectory with progress metrics |
| `POST` | `/api/ai/learning-path/refresh` | Trainee | Force-recalculate personalized learning path bypassing cache |
| `GET` | `/api/ai/recommendations` | Trainee | Get centralized AI Recommendation Hub payload (Courses, Skills, Insights, Next Steps) |
| `POST` | `/api/ai/recommendations/refresh` | Trainee | Force-refresh personalized recommendation hub bypassing in-memory cache |
| `GET` | `/api/ai/skills/:skillName/guidance` | Trainee | Get contextual AI skill improvement roadmap & recommended courses |
| `GET` | `/api/ai/courses/:courseId/rationale` | Trainee | Get contextual AI course fit rationale for active learner |
| `POST` | `/api/assessments/attempts/:attemptId/questions/:questionId/explain` | Trainee | Generate structured educational explanation for submitted question using GPT-4o-mini |

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

## 🧪 Automated Testing Suite (`server/tests/`)

All integration and regression test suites are organized in `server/tests/`:

```bash
# Run all platform test suites sequentially
npm run test:all

# Run Phase 7.1 AI Tutor test suite (35 tests)
npm test # or npm run test:p7_1

# Run live OpenAI connectivity & security verification
node tests/verify_live_openai.js

# Run individual phase regression suites
npm run test:p6_5  # Phase 6.5 User/Trainer Management & Review (37 tests)
npm run test:p6    # Phase 6 Analytics & Visual Dashboards (12 tests)
npm run test:p5_5  # Phase 5.5 Skill Attainment & Competency (14 tests)
npm run test:p5    # Phase 5 Skill Library & Taxonomy (20 tests)
npm run test:p4_5  # Phase 4.5 Assessment Gating & Certificates (20 tests)
```

---

## 📄 License & Attribution

Developed for **SIH26075 — Capacity Connect**.  
Built with modern MERN architecture for scalable, verifiable digital capacity building.
