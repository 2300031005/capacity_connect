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

## MongoDB Connection

Configure the `MONGO_URI` environment variable in `server/.env`:
- **Local MongoDB**: `mongodb://127.0.0.1:27017/capacity_connect`
- **MongoDB Atlas**: `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/capacity_connect?retryWrites=true&w=majority`

---

## Project Structure

```text
capacity-connect/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
│
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── utils/
│   ├── config/
│   ├── uploads/
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── .gitignore
└── README.md
```
