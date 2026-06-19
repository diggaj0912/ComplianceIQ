# Compliance Agent 

An integrated, enterprise-grade AI Compliance Agent and real-time frontend dashboard. This repository merges the Python-based AI Backend (FastAPI) and the React-based ComplianceIQ Frontend (Vite) into a single, cohesive, monolithic application architecture.

## Overview

Compliance Agent streamlines corporate tax compliance by combining a powerful backend rules engine and multi-LLM intelligence with an intuitive, dynamic frontend.

**Key Features:**
- **Dashboard & Health Monitor** — Real-time diagnostics of compliance state with risk scoring, visual alerts, and period-over-period comparison.
- **Transactions Management** — Upload CSV datasets. The backend automatically parses transactions, checks for anomalies, and readies them for reporting.
- **GST Centre** — Accurately calculates GST liability across rate buckets, ITC utilization, and net payable amounts.
- **Compliance Calendar** — Automatically generates and tracks filings, payments, and audit deadlines.
- **AI Agent Chat** — Interactive conversational assistant powered by a **multi-LLM router** (Groq, Google Gemini, Anthropic Claude, OpenAI, or deterministic mock fallback).
- **Reports with PDF / CSV Export** — Generate executive summaries, transaction exports, and full compliance PDF reports.
- **Audit Trail** — Every business-context change, LLM config change, CSV upload, and agent action is immutably logged.
- **Notifications** — Browser push, email (Resend), and an automated daily-digest scheduler (APScheduler).
- **Persistent Storage** — SQLite by default; drop-in Postgres (Supabase / Neon) by changing a single env var.

## Tech Stack

### Backend
- **Framework:** FastAPI + SQLAlchemy
- **Persistence:** SQLite (default) or any Postgres via `DATABASE_URL` (Supabase, Neon, RDS)
- **LLM Router:** Groq / Gemini / Claude / OpenAI / Mock, with TTL cache and automatic fallback
- **Scheduler:** APScheduler (daily digest + proactive alerts)
- **Email:** Resend (optional)
- **Default Port:** `8000`

### Frontend
- **Framework:** React 18 + Vite + TypeScript + React Router v7
- **Styling:** Tailwind v4 design tokens + custom CSS variables
- **Charts:** Recharts, **Icons:** lucide-react
- **Default Port:** `3000` (proxies `/api` to backend on `:8000`)

## Getting Started

### Prerequisites
- Node.js 18+ and pnpm (`npm i -g pnpm`)
- Python 3.10+
- _(Optional)_ API key for Groq (fastest, free tier) or Google Gemini

### Installation

```bash
# Frontend deps
pnpm install

# Backend deps
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # then fill in keys (optional)
cd ..
```

### Running locally

**Option A — Two terminals (recommended):**

```bash
# Terminal 1
cd backend && uvicorn server:app --reload --port 8000

# Terminal 2
pnpm dev                         # starts frontend on :3000
```

**Option B — Concurrently:**

```bash
pnpm dev:all                     # runs backend + frontend together
```

Then open:
- Frontend: [http://localhost:3000](http://localhost:3000)
- API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### Running in v0 Preview

The v0 preview only runs the frontend. When the backend is unreachable, the API layer automatically falls back to mock data so every page renders correctly for demos. The banner in Settings will show "Backend offline — using mock data."

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Purpose |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./compliance.db` | Swap to `postgresql+psycopg://...` for Supabase/Neon |
| `LLM_PROVIDER` | `mock` | One of: `mock`, `groq`, `gemini`, `anthropic`, `openai` |
| `LLM_MODEL` | provider default | e.g. `llama-3.3-70b-versatile`, `gemini-1.5-flash` |
| `GROQ_API_KEY` | — | From [console.groq.com](https://console.groq.com) |
| `GEMINI_API_KEY` | — | From [aistudio.google.com](https://aistudio.google.com) |
| `ANTHROPIC_API_KEY` | — | From [console.anthropic.com](https://console.anthropic.com) |
| `OPENAI_API_KEY` | — | From [platform.openai.com](https://platform.openai.com) |
| `RESEND_API_KEY` | — | Email notifications ([resend.com](https://resend.com)) |
| `NOTIFY_FROM_EMAIL` | `onboarding@resend.dev` | Verified sender |
| `NOTIFY_TO_EMAIL` | — | Default digest recipient |
| `CORS_ORIGINS` | `http://localhost:3000,http://localhost:5173` | Comma-separated |
| `DAILY_DIGEST_HOUR` | `9` | 24h local time |
| `PROMPT_CACHE_TTL` | `600` | Seconds |

### Frontend (`frontend/.env`)

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_BASE` | `/api` (proxied) | Override for production builds hitting a remote backend |

## Deployment

### Frontend → Vercel
1. Push to GitHub, import into Vercel.
2. Root directory: `frontend`. Build command: `pnpm build`. Output: `dist`.
3. Set `VITE_API_BASE=https://your-backend-host.com/api`.

### Backend → Render / Railway / Fly
1. New Web Service → Docker or Python runtime.
2. Build: `pip install -r requirements.txt`
3. Start: `uvicorn server:app --host 0.0.0.0 --port $PORT`
4. Set env vars from the table above. Mount a persistent disk if using SQLite, or point `DATABASE_URL` at Supabase/Neon.
5. Set `CORS_ORIGINS` to include your Vercel frontend URL.

## Project Structure

```
Compliance Agent/
├── backend/
│   ├── agent/                # LLM router, prompts, pipeline
│   │   ├── llm_wrapper.py    # Groq / Gemini / Claude / OpenAI / Mock
│   │   └── ...
│   ├── modules/              # GST, calendar, categorization, parsing
│   ├── db.py                 # SQLAlchemy engine + session factory
│   ├── models.py             # ORM models (User, Dataset, Audit, ...)
│   ├── notifications.py      # Resend email + in-app notifications
│   ├── scheduler.py          # APScheduler daily digest
│   ├── exports.py            # PDF + CSV generators
│   ├── server.py             # FastAPI app
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/app/
│   │   ├── pages/            # Dashboard, Reports, AuditTrail, Settings, ...
│   │   ├── components/       # Layout, shared UI
│   │   ├── context/          # AppContext with mock fallback
│   │   └── services/api.ts   # HTTP layer (typed, graceful offline)
│   ├── vite.config.ts
│   └── .env.example
├── package.json              # Workspace root
└── README.md
```

## Contributing
- New UI must go through `frontend/src/app/services/api.ts` so the mock fallback keeps working.
- New DB fields → add to `backend/models.py`, bump a migration in `scripts/`.
- New LLM providers → add a case to `backend/agent/llm_wrapper.py::LLMRouter`.
