# 🚀 CodeBuddy — AI-Powered Coding & Peer-Learning Platform

**CodeBuddy** is a modern, responsive, full-stack coding education platform where developers practice programming, run code in real-time, debug errors with an AI assistant, connect with mentors, participate in timed coding contests, and track their algorithmic progress.

---

## 📸 Platform Overview (12 Core Screens Matching Specification)

1. **Landing Page**: Modern developer hero with interactive code playground preview, supported language strip, feature highlights, and FAQs.
2. **Sign Up Page**: Multi-step registration validating unique emails/usernames, password criteria, and programming skill level with community perks summary.
3. **Login Page**: Secure authentication with JWT tokens and 1-click demo login buttons for Student, Mentor, and Admin roles.
4. **Student Dashboard**: Personalized metrics computed directly from database records (Problems Solved, Streak, Accuracy %, Learning Hours), Weekly Activity Bar Chart, Daily Challenge, and Upcoming Contests.
5. **Online Code Editor**: Full Monaco Editor integration supporting Python, JavaScript, C, C++, Java, C#, and Go with standard input (stdin), console output, execution time, and memory metrics.
6. **Problem Practice (DSA Library)**: Search and filter algorithms by difficulty (Easy, Medium, Hard) and topic (Arrays, Linked Lists, Stack, DP, Trees, Strings).
7. **Problem Solving & Evaluation Arena**: Split-view with problem description, constraints, hints, solution tabs, and backend test case evaluation against hidden test suites.
8. **AI Coding Assistant**: Modern chat interface for line-by-line explanations, bug diagnosis, algorithmic optimization, and hints.
9. **Peer-Learning Community**: Collaborative Q&A forum with upvoting, accepted answers, markdown rendering, and bookmarking.
10. **Coding Contests & Challenges**: Live contests with ticking countdown timers, server-side deadline enforcement, and dynamic scoreboards.
11. **Mentor Directory**: Find experienced developers, filter by skills, and schedule 1-on-1 mentorship sessions with Google Meet rooms.
12. **User Profile & Settings**: Tabbed profile customization, skills badges, security password changes, and dark/light theme persistence.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS (Dark/Light mode support)
- **Code Editor**: `@monaco-editor/react` (VS Code Editor)
- **Routing**: React Router v6
- **Icons**: Lucide React
- **API Client**: Axios with automatic JWT interceptors
- **Visuals**: Canvas-Confetti for submission celebrations

### Backend
- **Runtime**: Python 3.12 with Flask & Flask-CORS
- **Authentication**: Stateless JWT (`PyJWT`) with bcrypt/Werkzeug password hashing
- **ORM & DB**: SQLAlchemy supporting MySQL 8.0+ and SQLite
- **Execution Service**: Judge0 API integration for sandboxed multi-language execution
- **AI Integration**: Google Gemini / OpenAI with educational fallback mode
- **Testing**: Pytest with automated test suite

---

## ⚡ Quick Start

### 1. Backend Setup
```bash
# Install dependencies
pip install -r backend/requirements.txt

# Seed realistic database
python database/seed.py

# Run Flask server
python backend/run.py
```
*API running at `http://localhost:5000`.*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Web application running at `http://localhost:5173`.*

---

## 🔑 Demo Login Credentials

| Role | Username / Email | Password | Pre-loaded Features |
|---|---|---|---|
| **Student** | `student@example.com` | `Password123!` | 128 problems solved, 12-day streak, 87% accuracy |
| **Mentor** | `mentor@example.com` | `Password123!` | Dr. Neha Gupta (4.9 rating, session booking) |
| **Admin** | `admin@example.com` | `AdminPassword123!` | User role management, Problem library CRUD |

---

## 🧪 Testing & Verification
Run the backend test suite:
```bash
pytest backend/tests -v
```
All 13 integration tests cover authentication, permissions, problems, submissions, snippets, and community voting.

---

## 📂 Project Structure
```text
codebuddy/
├── backend/
│   ├── app/
│   │   ├── models.py           # SQLAlchemy entities
│   │   ├── routes/             # Blueprints (auth, problems, code, ai, community, mentors, contests, dashboard, admin)
│   │   ├── services/           # auth_service, execution_service, ai_service
│   │   ├── utils/              # middleware (JWT tokens, role guards)
│   │   ├── config.py           # App configuration
│   │   └── extensions.py       # SQLAlchemy instance
│   ├── tests/                  # Pytest test suite
│   ├── requirements.txt
│   ├── run.py                  # Backend server entrypoint
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/         # Navbar, Sidebar, Topbar, Footer
│   │   ├── context/            # AuthContext, ThemeContext, ToastContext
│   │   ├── layouts/            # AppLayout, PublicLayout
│   │   ├── pages/              # 13+ application views (Dashboard, Study Hub, Editor, etc.)
│   │   ├── services/           # Centralized Axios API client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vercel.json             # SPA routing rewrite rule for Vercel
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI for Pytest and Vite build
├── api/
│   └── index.py                # Vercel serverless WSGI Python handler
├── database/
│   ├── schema.sql              # Normalized MySQL 8.0 schema
│   └── seed.py                 # Realistic sample data populator
├── docs/
│   ├── API.md                  # Detailed endpoint documentation
│   └── SETUP.md                # Environment & local setup guide
├── DEPLOYMENT.md               # Step-by-step GitHub & Vercel deployment guide
├── vercel.json                 # Monorepo Vercel configuration
├── render.yaml                 # 1-click Render backend cloud configuration
├── docker-compose.yml
└── README.md
```

---

## 🚀 Deployment

For a full step-by-step guide on pushing to **GitHub** and deploying with 1-click on **Vercel** & **Render**, see:
👉 **[DEPLOYMENT.md](file:///c:/Users/ABESIT/OneDrive/Desktop/mini%20project/DEPLOYMENT.md)**

---

## 📄 License
MIT License. Built for educational and collaborative coding excellence.
