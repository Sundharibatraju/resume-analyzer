# ClearscoreATS — AI Resume Analyzer

A full-stack web app that parses resumes, compares them against a job
description, and produces a weighted ATS compatibility score with specific,
actionable recommendations.

```
resume-analyzer/
├── backend/     Flask REST API — auth, parsing, scoring, SQLite
└── frontend/    React + Vite + Tailwind — UI
```

## Quick start

You'll run two servers in two terminals: the Flask API on port 5000, and the
Vite dev server on port 5173. The Vite dev server proxies any request to
`/api/*` straight to Flask, so the browser only ever talks to one origin.

### 1. Backend setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env            # defaults work out of the box for local dev

# Optional but recommended — improves name detection in resume parsing.
# The app works without this (falls back to a regex heuristic), but
# accuracy is better with it installed:
python -m spacy download en_core_web_sm

python run.py
```

The API will be running at `http://localhost:5000`. On first run it creates
`backend/instance/resume_analyzer.db` automatically (SQLite, no setup needed).

### 2. Frontend setup

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The app will be running at `http://localhost:5173`. Open that in your browser.

## Environment variables (backend/.env)

| Variable | Purpose | Default |
|---|---|---|
| `SECRET_KEY` | Flask session secret | dev placeholder — **change in production** |
| `JWT_SECRET_KEY` | JWT signing secret | dev placeholder — **change in production** |
| `JWT_ACCESS_TOKEN_EXPIRES_MINUTES` | Access token lifetime | 60 |
| `DATABASE_URL` | Leave blank for default local SQLite, or set an absolute sqlite path / other DB URL | (blank → local SQLite) |
| `UPLOAD_FOLDER` | Where uploaded resumes are stored | `app/uploads` |
| `MAX_CONTENT_LENGTH_MB` | Max upload size | 10 |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:5173` |

## Backend architecture

```
backend/app/
├── config.py              Central config, reads .env
├── extensions.py          Shared SQLAlchemy / JWT / CORS instances
├── __init__.py             App factory
├── models/                 User, Resume, Analysis (SQLAlchemy)
├── routes/                  auth, resume, analysis blueprints
├── services/                 Business logic, kept out of routes:
│   ├── skill_dictionary.py   Custom skill taxonomy (~150 skills, 10 categories)
│   ├── document_extractor.py PDF (pdfplumber/PyPDF2) + DOCX (python-docx) text extraction
│   ├── resume_parser.py       spaCy + PhraseMatcher + regex → structured resume data
│   ├── jd_parser.py            Job description → required/preferred skills, experience/education requirements
│   ├── ats_scorer.py           TF-IDF + cosine similarity, weighted scoring formula
│   └── section_analyzer.py     Per-section scoring + recommendation generation
├── middleware/
│   ├── error_handler.py        Central APIError + Flask error handlers
│   └── jwt_handlers.py          JWT-specific error responses
└── utils/                       validators, file_storage, logger
```

### API endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/register` | — | Create account |
| POST | `/api/login` | — | Get JWT |
| GET | `/api/me` | ✓ | Current user |
| POST | `/api/upload-resume` | ✓ | Upload + parse a PDF/DOCX resume |
| GET | `/api/resumes` | ✓ | List your resumes |
| GET | `/api/resume/:id` | ✓ | Get one resume + parsed data |
| DELETE | `/api/resume/:id` | ✓ | Delete a resume |
| POST | `/api/analyze` | ✓ | Score a resume against a job description |
| GET | `/api/results/:id` | ✓ | Get a past analysis |
| GET | `/api/history` | ✓ | All past analyses |
| POST | `/api/rank-resumes` | ✓ | Rank all your resumes against one job description |

### ATS scoring formula

```
Overall Score = 40% Skill Match + 30% Keyword Match + 20% Experience Match + 10% Education Match
```

- **Skill Match** — weighted set overlap between resume skills and JD
  required/preferred skills (required skills count double).
- **Keyword Match** — TF-IDF vectorization + cosine similarity between the
  full resume text and full job description text (scikit-learn).
- **Experience Match** — resume's detected years of experience vs. the JD's
  stated minimum, with proportional partial credit.
- **Education Match** — resume's highest detected degree vs. the JD's stated
  requirement.

## Frontend architecture

```
frontend/src/
├── components/
│   ├── ui/            Button, GlassCard, ScoreGauge, ProgressBar, SkillPill, Logo
│   ├── layout/         Navbar, Footer, AppLayout, ProtectedRoute
│   ├── landing/         Hero, Features, Testimonials, CTA
│   ├── upload/           ResumeDropzone (drag-and-drop, react-dropzone)
│   ├── analysis/          ScoreBreakdownChart (recharts), SkillsPanel, RecommendationsList, SectionBreakdown, ParsedResumeSummary
│   └── dashboard/          StatCard, HistoryList
├── pages/                LandingPage, LoginPage, RegisterPage, DashboardPage, UploadPage, ResultsPage, ProfilePage
├── context/               AuthContext (JWT + user state), ThemeContext (dark mode)
├── services/               api.js (axios instance + interceptors), authService, resumeService, analysisService
└── index.css               Design tokens (Tailwind v4 @theme), dark mode, print styles
```

### Design system

- **Palette**: warm paper background (`#FAF7F0`) in light mode, deep ink navy
  (`#0F172A`) in dark mode, with a three-color "signal" system — teal
  (clear/matched), amber (review/partial), coral (gap/missing) — used
  consistently across scores, skill pills, and recommendation priorities.
- **Type**: Fraunces (serif display) for headings, Inter for UI/body text,
  JetBrains Mono for numeric scores.
- **Signature element**: the circular "scan ring" `ScoreGauge`, which fills
  like a radar sweep — a nod to the literal act of an ATS scanning a document.

### Exporting a report

The "Export report" button on the results page calls the browser's native
print dialog (`window.print()`) against print-only CSS in `index.css`, so
users can save the analysis as a PDF without a separate backend report
service.

## Notes & things to harden before production

- `FLASK_DEBUG=1` and the Flask dev server are for local development only —
  use a production WSGI server (gunicorn/uwsgi) behind a reverse proxy.
- Swap SQLite for Postgres/MySQL by changing `DATABASE_URL` for any real
  concurrent-user deployment.
- The resume parser uses spaCy's blank English pipeline by default and
  upgrades automatically if you install `en_core_web_sm` — name extraction
  in particular improves with the full model.
- Add Flask-Migrate (Alembic) if you need schema migrations beyond
  `db.create_all()`.
- Rotate `SECRET_KEY` / `JWT_SECRET_KEY` to long random values before
  deploying anywhere public.
