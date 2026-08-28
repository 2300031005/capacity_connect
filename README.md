# CAPACITY CONNECT

## Project
**SIH26075** — Digital Capacity Building & Learning Management Portal

A modern, robust full-stack portal for local and organizational digital capacity-building and learning management.

---

## Stack

- **Frontend**: React + Vite + Tailwind CSS + React Router + Axios + Lucide React + Recharts
- **Backend**: Node.js + Express
- **Database**: MongoDB (Local or MongoDB Atlas Cloud) + Mongoose
- **File Storage**: Local Filesystem Storage (`server/uploads/`)

---

## Local Requirements

- **Node.js**: v18+ (tested on Node v20)
- **npm**: v9+ (tested on npm v11)
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017/capacity_connect`) or MongoDB Atlas URI (`mongodb+srv://...`)

---

## Running the Backend

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```
   *Update `MONGO_URI` with your local MongoDB connection string or your MongoDB Atlas Cloud connection string.*
4. Start development server:
   ```bash
   npm run dev
   ```
   *Backend runs on `http://localhost:5000` (Health check: `http://localhost:5000/api/health`).*

---

## Running the Frontend

1. Navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```
4. Start development server:
   ```bash
   npm run dev
   ```
   *Frontend runs on `http://localhost:5173`.*

---

---

## MongoDB Atlas Connection

Configure the `MONGO_URI` environment variable in `server/.env`:
- **MongoDB Atlas**: `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/capacity_connect?retryWrites=true&w=majority`

---

## Authentication & Role-Based Access Control

Capacity Connect uses JWT-based authentication combined with role-based access control (RBAC).

### User Roles
- **Trainee**: Discovers courses, completes modules, takes assessments, and tracks competency growth.
- **Trainer**: Creates courses, organizes learning resources, generates AI-assisted quizzes, and reviews learner performance.
- **Admin**: Governs the platform, monitors courses, manages users, and oversees competency frameworks.

---

## Authentication APIs

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new Trainee or Trainer account (Admin creation blocked) |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT token |
| `GET` | `/api/auth/me` | Protected | Retrieve authenticated user profile session |

---

## Authorization

Protected endpoints require a valid JSON Web Token sent via the standard HTTP `Authorization` header:

```text
Authorization: Bearer <jwt_token>
```

Role-based access is enforced server-side using the `authorizeRoles` middleware (e.g. `authorizeRoles('admin')`, `authorizeRoles('trainer', 'admin')`). Unauthenticated requests receive HTTP 401, and unauthorized role requests receive HTTP 403.

