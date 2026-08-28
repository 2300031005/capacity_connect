# CAPACITY CONNECT (SIH26075)

> **Digital Capacity Building & AI-Powered Competency-Driven Learning Platform**

Capacity Connect is a full-stack learning management and skill verification portal engineered for institutional capacity-building and workforce upskilling. It seamlessly connects standardized skill taxonomies, interactive curriculum delivery, anti-cheat assessments, official PDF certificate issuance, institutional competency frameworks, and an end-to-end AI learning ecosystem into a unified digital platform.

---

## 🌟 Core AI Learning Ecosystem

The Capacity Connect AI architecture is designed around two foundational pillars:
- **Trainee AI**: *"Help me learn, navigate my career, and master verified skills."*
- **Trainer AI**: *"Help me understand learner bottlenecks, drop-offs, and improve instructional outcomes."*

```
                    TRAINEE LEARNING JOURNEY
                               │
                               ▼
                    Natural Career Goal
                               │
                               ▼
               🎯 Skill-First Career Roadmap (7.4.1)
                               │
                               ▼
                 🧭 Sequenced Learning Path (7.4)
                               │
                               ▼
               🤖 Adaptive AI Learning Advisor (7.5)
                               │
                               ▼
                    📚 Course Curriculum
                               │
                               ▼
               💬 In-Course AI Doubt Chatbot
                               │
                               ▼
                 📝 Anti-Cheat Assessments
                               │
                               ▼
               💡 AI Question Explanation (7.1)
                               │
                               ▼
                  🎓 Verified Skill Attainment


                     TRAINER TEACHING ASSISTANT
                               │
                               ▼
                   📊 Multi-Tenant Analytics
                               │
                               ▼
               🧠 Question Accuracy Diagnostics (7.6)
                               │
                               ▼
                 📉 Module Drop-Off Curve (7.6)
                               │
                               ▼
                 🎯 Skill Difficulty Scoring (7.6)
                               │
                               ▼
               💡 Actionable Teaching Suggestions (7.6)
                               │
                               ▼
                  👤 Learners Needing Support (7.6)
```

---

## 🚀 Key Features & Capabilities

### 1. 🤖 AI Trainer Teaching Assistant & Course Insights (Phase 7.6)
- **Embedded Teaching Intelligence (`/trainer/analytics`)**:
  - Seamlessly integrated directly into the existing Trainer Analytics dashboard—no extra sidebar bloat or isolated routes.
  - **Executive Curriculum Summary**: Natural-language high-level synthesis of learner strengths, engagement velocity, and friction points.
  - **🧠 Question Accuracy Analysis**: Evaluates question-level attempts across all course quizzes, flagging specific questions with low accuracy ($\le 50\%$) and providing pedagogical diagnosis.
  - **📉 Module Drop-Off Detection**: Analyzes enrollment versus completion curves across individual modules, identifying where learners slow down or stop progressing.
  - **🎯 Skill Difficulty Scoring**: Compares mapped course skills against quiz pass rates to highlight skills with high learner friction.
  - **💡 Actionable Teaching Suggestions**: High-priority pedagogical recommendations with direct links to `[Review Assessment]` and `[Review Course]`.
  - **👤 Learners Needing Support**: Flags trainees with repeated assessment difficulties ($\ge 1$ failed attempts) for proactive instructor guidance.
- **Per-Course AI Diagnostics Modal**:
  - Click `[ 🤖 AI Insights ]` on any course row in the **Course Performance Breakdown** table to view tailored drop-off curves, question accuracy bottlenecks, and teaching recommendations for that specific course.
- **Strict Server-Side Data Isolation**: Instructors only ever receive AI insights derived from courses, assessments, and attempts they own.
- **Deterministic Database Foundation**: All metrics, percentages, and counts are calculated in MongoDB first before feeding into OpenAI for pedagogical interpretation.

---

### 2. 💬 In-Course Contextual AI Doubts Assistant Chatbot
- **Interactive Floating In-Course Assistant**:
  - Embedded in [CourseDetailsPage.jsx](file:///c:/Users/ankit/Documents/Capacity%20Connect/client/src/pages/trainee/CourseDetailsPage.jsx).
  - Gated strictly to **enrolled trainees**, course instructors, and administrators.
  - Contextual awareness of course description, prerequisites, level, category, and all curriculum modules.
- **Features**:
  - Collapsible/Expandable chat window with active status indicator.
  - Quick-starter prompt chips (*"Explain course prerequisites"*, *"Break down module topics"*, *"How to prepare for final quiz"*).
  - Rich markdown formatting with clean code snippet highlighting.
  - Follow-up suggestion chips generated dynamically after each response.
  - Offline fallback engine ensuring 100% availability when OpenAI is offline.

---

### 3. 🤖 Adaptive AI Learning Advisor & Next Actions (Phase 7.5)
- **Real-Time Learning State Engine (`/trainee/recommendations`)**:
  - Answers the immediate question: *"What should I do next, and why?"*
  - **4-Tier Priority Evaluation**:
    1. **Incomplete Active Course (`continue_course`)**: Prioritizes courses currently in progress (`progress < 100%`) with dynamic progress bars and `[Continue Course]` direct action.
    2. **Failed / Weak Assessment Remediation (`review_assessment`)**: Detects failed quizzes/exams and guides learners to question-level AI explanations before proceeding.
    3. **Next Career Roadmap Milestone (`start_course`)**: Identifies the next uncompleted milestone in the learner's career roadmap and matches published database courses.
    4. **Course Availability Diagnostic (`course_not_available`)**: Transparently flags roadmap skills without published courses.
  - **Automatic Cache Invalidation**: Re-evaluates trajectory when courses are enrolled, modules completed, or assessments submitted.

---

### 4. 🎯 Skill-First Career Roadmap (Phase 7.4.1)
- **Natural-Language Career Destination**:
  - Trainees specify any target career (e.g., *"Full Stack Cloud Developer"*, *"DevOps Specialist"*, *"AI & Data Engineer"*).
  - AI structures the required competency stages while MongoDB matches available published courses.
  - Sequenced milestone cards (`01`, `02`, `03`) with status badges (`Already Demonstrated ✓`, `In Progress ▶`, `Recommended Milestone 🚀`, `Locked 🔒`).

---

### 5. 🧭 Personalized AI Learning Path (Phase 7.4)
- **Dynamic Sequenced Curriculum Timeline**:
  - Synthesizes active enrollments, course progress, verified skills, target competencies, and assessment scores into a sequenced learning journey.
  - Connected visual stage timeline (`↓`) with stage statuses (`Current Stage`, `Completed ✓`, `Recommended`, `Locked`).
  - Real-time milestone progress tracking (`●●●○○ 60% Path Progress: Completed: 3, In Progress: 1, Remaining: 2`).

---

### 6. 🌟 Centralized AI Recommendation Hub & Contextual Advisors (Phase 7.3)
- **Streamlined Recommendation Hub (`/trainee/recommendations`)**:
  - Clean 3-tab layout: **🤖 AI Learning Advisor**, **🎯 Career Roadmap**, and **🧭 Learning Path** with single-line explanatory headers.
- **Decoupled Independent Parallel Loading**:
  - **Course Catalog (`/trainee/courses`)**: Published catalog loads immediately; AI recommended courses load in parallel.
  - **My Skills (`/trainee/skills`)**: Verified & in-progress skills load immediately; AI skills-to-develop load in parallel.
  - **My Assessments (`/trainee/assessments`)**: Available & completed assessments load immediately; AI assessment insights load in parallel.
  - **Dashboard (`/trainee/dashboard`)**: Displays the **⚡ AI Suggested Next Steps** widget.

---

### 7. 📚 AI Course Recommendations & Question Explanation (Phases 7.1 & 7.2)
- **Explainable Recommendation Scoring**: Returns match scores ($70-99\%$), educational rationale, and competency alignment while strictly preventing hallucinated courses.
- **Post-Submission AI Question Tutor**: Question-by-question remediation using OpenAI GPT-4o-mini (`POST /api/assessments/attempts/:attemptId/questions/:questionId/explain`) with core concepts, common traps, and study tips.

---

### 8. 👥 Platform Governance, Trainer Management & Assessment Review (Phase 6.5)
- **Admin User Governance (`/admin/users`)**: Search, filter, and audit all platform trainees, trainers, and administrators. Toggle account active/inactive states with self-deactivation protection.
- **Admin Faculty Directory (`/admin/trainers`)**: Inspect trainer course portfolios, published vs. draft metrics, total enrolled learners, and average ratings.
- **Trainer Consolidated Learner Roster (`/trainer/learners`)**: Unified multi-course learner roster strictly isolated to courses owned by the authenticated instructor.
- **Assessment Review Modal**: Reusable question-by-question review interface highlighting selected choices, correct answers, and instructor explanations with anti-cheat protections.

---

### 9. 📊 Analytics & Visual Dashboards (Phase 6)
- **Trainee Analytics (`/trainee/analytics`)**: Course-wise progress tracking, assessment pass rates, score trajectories, skill distribution, and competency progress.
- **Trainer Analytics (`/trainer/analytics`)**: Multi-tenant data isolation, enrollment vs. completion bar charts, learner progress spread histograms (`0-25%`, `26-50%`, `51-75%`, `76-99%`, `100%`), assessment pass rates, and skills taught breakdown.
- **Platform Admin Analytics (`/admin/analytics`)**: Executive platform telemetry across users, course catalog status, enrollments, completions, top courses, and trainer capacity.

---

### 10. 🎓 Standardized Skill & Competency Framework (Phases 5 & 5.5)
- **Admin-Governed Master Skill Catalog**: 30 pre-seeded default skills with normalized naming and category classifications (Technical, Soft Skill, Other).
- **Course Skill Mapping**: Instructors map approved skills and set target proficiency levels (`Beginner`, `Proficient`, `Advanced`).
- **Strict Final Assessment Skill Gating**: Skills are **verified ONLY when a trainee passes the final course assessment ($\ge$ passing %)** and earns an official certificate.
- **Trainee Skill Portfolio**: Highest proficiency retention (`Beginner < Proficient < Advanced`) with attached Proof of Work evidence (qualifying course, exam score, certificate ID).

---

### 11. 📝 Anti-Cheat Assessments & Automated Certificates (Phase 4.5)
- **Module Quizzes & Final Exams**: Configurable time limits, marks, and passing percentages.
- **Anti-Cheat Payload Sanitization**: Correct options and internal explanations are strictly stripped from all pre-submission quiz payloads.
- **Automated PDF Certificates**: Dynamic vector certificates generated via PDFKit with unique tamper-proof verification identifiers (`CC-2026-XXXXXX`).

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS | High-performance SPA with modern UI/UX design tokens |
| **Icons & Charts** | Lucide React, Recharts | Interactive visual analytics and intuitive icon system |
| **State & Router** | React Router v6, Context API | Client-side routing, JWT session management, and RBAC guards |
| **Backend** | Node.js, Express.js | RESTful API server with modular controllers and middleware |
| **Database** | MongoDB Atlas / Local MongoDB | NoSQL database with Mongoose ODM and strict schema validation |
| **AI Engine** | OpenAI API (GPT-4o-mini) | Intelligent reasoning, tutoring, recommendations, and teaching insights |
| **Fallback Engine** | Custom Deterministic Service | 100% offline-ready heuristic engine for zero-downtime reliability |
| **PDF Generation** | PDFKit | Automated vector PDF certificate generation |
| **Security & Auth** | JWT, bcryptjs | Bearer token authentication, role authorization, and password hashing |

---

## 📦 Project Directory Structure

```
Capacity Connect/
├── client/                                # Frontend Application (React + Vite + Tailwind)
│   ├── src/
│   │   ├── components/                    # Reusable Components
│   │   │   ├── CourseAiDoubtChatbot.jsx   # In-Course Contextual AI Doubts Chatbot
│   │   │   ├── TrainerAiTeachingInsights.jsx # Trainer AI Teaching Assistant Card
│   │   │   ├── TrainerCourseAiInsightsModal.jsx # Course-Specific AI Insights Modal
│   │   │   ├── SkillsSelect.jsx           # Standardized Skill Search & Select
│   │   │   ├── CertificateModal.jsx       # Certificate Preview & Download
│   │   │   ├── AssessmentReviewModal.jsx  # Question-by-Question Review Modal
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── admin/                     # AdminUsersPage, AdminTrainersPage, AdminAnalyticsPage, etc.
│   │   │   ├── trainer/                   # TrainerAnalyticsPage, CreateCoursePage, ManageCoursePage, etc.
│   │   │   └── trainee/                   # TraineeRecommendationsPage, TraineeSkillsPage, TraineeAssessmentsPage, etc.
│   │   ├── services/api.js                # Centralized Axios API Service Layer
│   │   └── context/AuthContext.jsx        # Authentication & Role State
│   └── package.json
│
├── server/                                # Backend API Server (Node.js + Express)
│   ├── config/db.js                       # MongoDB Atlas connection & error handlers
│   ├── controllers/
│   │   ├── trainerAiController.js         # Phase 7.6 Trainer AI Teaching Assistant Controller
│   │   ├── recommendationController.js    # AI Recommendations, Learning Path & Doubt Chatbot Controller
│   │   ├── analyticsController.js         # Trainee, Trainer & Admin Analytics Aggregations
│   │   ├── assessmentController.js        # Anti-Cheat Quiz Attempts & Review
│   │   ├── courseController.js            # Course Curriculum, Modules & Reviews
│   │   ├── skillController.js             # Master Skill Catalog Governance
│   │   ├── competencyController.js        # Institutional Competency Frameworks
│   │   └── userController.js              # User & Trainer Platform Governance
│   ├── models/                            # Mongoose Schemas (User, Course, Module, Assessment, QuizAttempt, Skill, etc.)
│   ├── routes/                            # Express Route Handlers with RBAC Middleware
│   ├── services/openaiService.js          # OpenAI GPT-4o-mini Integration & Offline Fallback Engine
│   ├── utils/                             # PDF Generator, Skill Seeder, Anti-Cheat Sanitizer
│   ├── tests/                             # Comprehensive Automated Test Suites (Phases 4.5 through 7.6)
│   └── package.json
│
└── README.md
```

---

## ⚙️ Local Setup & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher (tested on Node v20/v22)
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017/capacity_connect`) or a MongoDB Atlas Cloud URI
- **OpenAI API Key** *(Optional)*: Set `OPENAI_API_KEY` for live AI generation (fallback engine activates automatically if omitted)

---

### 1. Backend Setup

```bash
cd server
npm install
```

Create `server/.env` (or copy from `server/.env.example`):
```env
PORT=5002
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/capacity_connect?retryWrites=true&w=majority
JWT_SECRET=capacity_connect_super_secret_jwt_key_2026
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173

# Optional: Live OpenAI Integration
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini
```

Start the backend development server:
```bash
npm run dev
```
*Backend runs on `http://localhost:5002` (Health Check: `http://localhost:5002/api/health`).*  
*On startup, 30 default standardized skills are seeded automatically.*

---

### 2. Frontend Setup

```bash
cd client
npm install
```

Create `client/.env` (or copy from `client/.env.example`):
```env
VITE_API_URL=http://localhost:5002/api
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

# Run complete platform regression suite (300+ test assertions across all phases)
npm run test:all

# Run individual phase test suites
npm run test:p7_6   # Phase 7.6 AI Trainer Teaching Assistant (31 Tests)
npm run test:p7_5   # Phase 7.5 Adaptive AI Learning Advisor (36 Tests)
npm run test:p7_4_1 # Phase 7.4.1 AI Career Goal Roadmap (35 Tests)
npm run test:p7_4   # Phase 7.4 Personalized AI Learning Path (32 Tests)
npm run test:p7_3   # Phase 7.3 AI Recommendation Hub (31 Tests)
npm run test:p7_2   # Phase 7.2 AI Course Recommendations (28 Tests)
npm run test:p7_1   # Phase 7.1 AI Assessment Explanation (35 Tests)
npm run test:p6_5   # Phase 6.5 User & Trainer Governance (37 Tests)
npm run test:p6     # Phase 6 Analytics & Telemetry (22 Tests)
npm run test:p5_5   # Phase 5.5 Skill Attainment & Verification (14 Tests)
npm run test:p5     # Phase 5 Skill Library & Competencies (20 Tests)
npm run test:p4_5   # Phase 4.5 Anti-Cheat & Assessment Gating (20 Tests)
```

Run specialized in-course doubt assistant and OpenAI verification tests:
```bash
node tests/test_course_doubt_assistant.js # In-course AI chatbot test suite (6/6 tests)
node tests/verify_live_openai.js           # Live OpenAI connectivity check
```

Verify client production build compilation:
```bash
cd client
npm run build
```

---

## 🔌 API Reference Overview

### Trainer AI Teaching Assistant (Phase 7.6)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/analytics/trainer/ai-teaching-insights` | Trainer | Get portfolio-wide AI teaching insights (question difficulty, drop-offs, skill mastery, suggestions) |
| `POST` | `/api/analytics/trainer/ai-teaching-insights/refresh` | Trainer | Force-refresh portfolio-wide AI teaching insights bypassing cache |
| `GET` | `/api/analytics/trainer/courses/:courseId/ai-insights` | Trainer | Get course-specific AI diagnostics, module drop-off curves & teaching actions |
| `POST` | `/api/analytics/trainer/courses/:courseId/ai-insights/refresh` | Trainer | Force-refresh course-specific AI diagnostics bypassing cache |

### In-Course Doubts Assistant Chatbot
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/ai/courses/:courseId/doubt-assistant` | Enrolled / Trainer / Admin | Contextual Q&A doubt resolution with starter prompts & follow-up suggestions |

### AI Career Goals, Learning Paths & Recommendations (Phases 7.1 - 7.5)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/ai/adaptive-advisor` | Trainee | Get 4-tier prioritized next action recommendation and educational rationale |
| `POST` | `/api/ai/adaptive-advisor/refresh` | Trainee | Force-refresh adaptive advisor recommendations |
| `GET` | `/api/ai/career-roadmap` | Trainee | Get sequenced milestone career roadmap mapped to published courses |
| `POST` | `/api/ai/career-roadmap/refresh` | Trainee | Force-regenerate career learning roadmap |
| `GET` | `/api/ai/learning-path` | Trainee | Get personalized learning path trajectory with sequence progress metrics |
| `POST` | `/api/ai/learning-path/refresh` | Trainee | Force-recalculate personalized learning path |
| `GET` | `/api/ai/recommendations` | Trainee | Get centralized AI Recommendation Hub payload |
| `POST` | `/api/ai/recommendations/refresh` | Trainee | Force-refresh personalized recommendation hub |
| `GET` | `/api/ai/skills/:skillName/guidance` | Trainee | Get contextual AI skill improvement roadmap & recommended courses |
| `GET` | `/api/ai/courses/:courseId/rationale` | Trainee | Get contextual AI course fit rationale for active learner |
| `POST` | `/api/assessments/attempts/:attemptId/questions/:questionId/explain` | Trainee | Generate structured educational explanation for submitted question |

### Platform Analytics & Telemetry (Phase 6)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/analytics/trainee` | Trainee | Get personal learning progress, score trends, skill distribution & certs |
| `GET` | `/api/analytics/trainer` | Trainer | Get multi-tenant course performance, enrollments, completions & progress spread |
| `GET` | `/api/analytics/admin` | Admin | Get platform-wide telemetry, user distribution, catalog status & trainer metrics |

### Platform Governance & Assessment Review (Phase 6.5)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | Admin | Search & filter platform users with role/status filters |
| `PATCH` | `/api/users/:id/status` | Admin | Activate or deactivate user account (self-deactivation protected) |
| `GET` | `/api/trainers` | Admin | Get all platform instructors with capacity & review metrics |
| `GET` | `/api/trainer/learners` | Trainer | Get consolidated learner roster strictly for owned courses |
| `GET` | `/api/assessments/attempts/:attemptId/review` | Trainee/Trainer/Admin | Question-by-question review with explanations & AI tutor hook |

### Skills, Competencies & Courses
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/skills` | Public / Auth | Search & filter standardized skills |
| `POST` | `/api/skills` | Admin | Create new standardized skill with category |
| `GET` | `/api/competencies` | Public / Auth | List active institutional competency frameworks |
| `GET` | `/api/trainees/me/skills` | Trainee | Get verified skills, highest proficiency & Proof of Work evidence |
| `GET` | `/api/courses` | Public / Auth | Discover published courses (supports filters & search) |
| `POST` | `/api/courses` | Trainer / Admin | Create draft course with mapped skills & target proficiencies |
| `POST` | `/api/assessments/:id/attempt` | Enrolled Trainee | Submit quiz attempt and evaluate score (anti-cheat sanitized) |
| `GET` | `/api/certificates/my` | Trainee | Get earned PDF certificates with verification IDs |

---

## 🔒 Security, Multi-Tenancy & Integrity Safeguards

1. **Strict Multi-Tenant Isolation**: Trainers can only view analytics, learner rosters, and AI insights for courses they own. Trainees can only view their own quiz attempts and skill records.
2. **Server-Side Anti-Cheat Sanitization**: Correct answer choices and internal explanations are strictly stripped from all quiz payloads before submission.
3. **Database-First Integrity**: AI reasoning operates strictly as an interpretation and recommendation layer on top of validated database records.
4. **Zero Auto-Mutation Policy**: AI assistants never automatically alter courses, modules, assessments, marks, or learner skill proficiencies.
5. **API Key Security**: The `OPENAI_API_KEY` is exclusively managed on the backend and is never leaked to the client bundle.

---

## 📄 License & Attribution

Developed for **Smart India Hackathon (SIH26075) — Capacity Connect**.  
Built with modern MERN architecture for scalable, verifiable digital capacity building and institutional workforce upskilling.
