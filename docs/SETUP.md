# CodeBuddy Setup & Installation Guide

This document provides step-by-step instructions to set up, configure, seed, and run the **CodeBuddy** platform locally or via Docker.

---

## Prerequisites
- **Python**: 3.10+ (Python 3.12 verified)
- **Node.js**: v18+ (Node v24 verified)
- **npm**: v9+
- *(Optional)* **MySQL**: 8.0+ or Docker (SQLite is pre-configured as the zero-setup default)

---

## 1. Quick Start (Development Mode)

### Step 1: Clone or Navigate to the Workspace
```bash
cd "mini project"
```

### Step 2: Set Up Backend
```bash
# 1. Install dependencies
pip install -r backend/requirements.txt

# 2. Seed the database with sample DSA problems, users, contests & mentors
python database/seed.py

# 3. Start the Flask API server
python backend/run.py
```
*The backend API will run on `http://localhost:5000`.*

### Step 3: Set Up Frontend
Open a second terminal window:
```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start the Vite React development server
npm run dev
```
*The web platform will be available at `http://localhost:5173`.*

---

## 2. Default Seeded Demo Accounts

You can log in immediately with any of the pre-seeded accounts:

| Role | Username / Email | Password | Full Name / Features |
|---|---|---|---|
| **Student** | `student@example.com` or `aarav123` | `Password123!` | **Aarav Mehta** (128 solved, 12-day streak, 87% accuracy, points & snippets) |
| **Mentor** | `mentor@example.com` or `neha_gupta` | `Password123!` | **Dr. Neha Gupta** (Senior Engineer, 4.9 rating, mentorship session booking) |
| **Admin** | `admin@example.com` or `admin` | `AdminPassword123!` | **System Administrator** (User role management, Problem creation, Audit logs) |

*Tip: The Login Page includes one-click demo login buttons for all three accounts.*

---

## 3. Database Configuration

### Option A: SQLite (Default, Zero-Setup)
No configuration required! CodeBuddy defaults to `codebuddy.db` SQLite storage. All migrations, relationships, foreign keys, and indexes are maintained.

### Option B: MySQL Configuration
1. Ensure your MySQL server is running on port 3306.
2. Create the database using the provided schema:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
3. Update `backend/.env`:
   ```ini
   DATABASE_URL=mysql+pymysql://root:your_mysql_password@localhost:3306/codebuddy
   ```
4. Re-run the seed script:
   ```bash
   python database/seed.py
   ```

---

## 4. External Integrations Configuration

### Judge0 Code Execution
CodeBuddy executes user code securely via Judge0.
1. Obtain a free API key from [RapidAPI Judge0 CE](https://rapidapi.com/judge0-official/api/judge0-ce).
2. Add your key to `backend/.env`:
   ```ini
   JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
   JUDGE0_API_KEY=your_rapidapi_key_here
   JUDGE0_API_HOST=judge0-ce.p.rapidapi.com
   ```
3. *(Alternative)* Run Judge0 self-hosted locally via Docker and set:
   ```ini
   JUDGE0_API_URL=http://localhost:2358
   ```
> **Demo Mode Notice:** If Judge0 is not configured, CodeBuddy displays a clear configuration banner in the console and uses simulated sandbox verification for problem test cases so evaluators can test the entire submission workflow without interruption.

### AI Coding Assistant
1. Get an API key from [Google AI Studio](https://aistudio.google.com/) (Gemini) or [OpenAI](https://platform.openai.com/).
2. Add your key to `backend/.env`:
   ```ini
   AI_API_PROVIDER=gemini
   AI_API_KEY=AIzaSy...
   AI_MODEL=gemini-1.5-flash
   ```
> **Demo Mode Notice:** If an AI API key is not supplied, CodeBuddy automatically activates its **Built-in Educational Assistant Mode**, providing line-by-line breakdowns, complexity analysis, and debugging tips with clear disclosure banners.

---

## 5. Running Automated Tests
Run the test suite using pytest:
```bash
pytest backend/tests -v
```
All 13 integration and unit tests test:
- Registration and duplicate rejection
- Authentication & JWT token security
- Protected endpoints & role authorization
- DSA problems and difficulty filtering
- Dashboard metrics calculation
- Snippets CRUD & duplication
- Coding contest registration
- AI assistant service status

---

## 6. Docker Deployment
To launch the entire platform (MySQL, Flask backend, React frontend) with a single command:
```bash
docker-compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`
- MySQL: `localhost:3306`
