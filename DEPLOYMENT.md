# 🚀 CodeBuddy — Deployment Guide (GitHub & Vercel)

This guide walks you through deploying **CodeBuddy** step-by-step to **GitHub** and **Vercel** (or Render / Railway).

---

## 📋 Table of Contents
1. [Step 1: Push Code to GitHub](#step-1-push-code-to-github)
2. [Step 2: Deploy Frontend on Vercel](#step-2-deploy-frontend-on-vercel)
3. [Step 3: Deploy Backend on Render / Railway](#step-3-deploy-backend-on-render--railway)
4. [Alternative: Deploy Everything on Vercel](#alternative-deploy-everything-on-vercel)
5. [Connecting Frontend to Backend](#connecting-frontend-to-backend)
6. [Troubleshooting & FAQs](#troubleshooting--faqs)

---

## Step 1: Push Code to GitHub

### 1.1 Create a New Repository on GitHub
1. Go to [github.com/new](https://github.com/new).
2. Set the repository name (e.g., `codebuddy` or `codebuddy-platform`).
3. Set visibility to **Public** or **Private**.
4. Leave *"Initialize this repository with a README"* **unchecked** (we already have one).
5. Click **Create repository**.

### 1.2 Initialize Git and Push Local Code
Open PowerShell or your terminal in this project folder (`mini project`):

```powershell
# 1. Initialize git in the root folder
git init

# 2. Stage all project files (node_modules and temporary files are automatically ignored by .gitignore)
git add .

# 3. Commit the code
git commit -m "feat: complete CodeBuddy platform with multi-model AI, study hub, and theme mode"

# 4. Rename default branch to main
git branch -M main

# 5. Link your GitHub remote repository (replace with your actual GitHub URL)
git remote add origin https://github.com/YOUR_USERNAME/codebuddy.git

# 6. Push code to GitHub
git push -u origin main
```

> 💡 *Note: If `git` is not yet installed on your Windows machine, download it from [git-scm.com/download/win](https://git-scm.com/download/win) or install it via winget: `winget install --id Git.Git -e --source winget`.*

---

## Step 2: Deploy Frontend on Vercel

Vercel provides ultra-fast global CDN hosting with automatic SSL certificates for React/Vite applications.

### 2.1 Import Project into Vercel
1. Log in to [vercel.com](https://vercel.com/) (you can sign in with your GitHub account).
2. Click the **"Add New..."** button in the dashboard, then select **"Project"**.
3. Under **Import Git Repository**, find your `codebuddy` repository and click **Import**.

### 2.2 Configure Build & Output Settings
In the configuration screen:
* **Project Name**: `codebuddy` (or your choice)
* **Framework Preset**: `Vite`
* **Root Directory**: Click `Edit` and select `frontend` (or leave as root; both work because `vercel.json` is provided in both places).
* **Build Command**: `npm run build`
* **Output Directory**: `dist`
* **Install Command**: `npm install`

### 2.3 Set Environment Variables
Under the **Environment Variables** section, add:
* **Key**: `VITE_API_BASE_URL`
* **Value**: Your deployed backend URL + `/api` (for example: `https://codebuddy-api.onrender.com/api` or `/api` if using Vercel Serverless).

### 2.4 Deploy
Click **Deploy**!
Vercel will build the frontend in ~30 seconds and provide a live URL such as:
`https://codebuddy-gamma.vercel.app`

> 🛡️ **SPA Routing Protected:** The included [`frontend/vercel.json`](./frontend/vercel.json) includes route rewriting rules so refreshing on `/dashboard`, `/study`, or `/problems` will never trigger a 404 error.

---

## Step 3: Deploy Backend on Render / Railway

Because Flask requires persistent processes and database access, **Render** or **Railway** are the most popular free/low-cost platforms for Flask backends.

### Option A: Render (Free & Recommended)
1. Log in to [render.com](https://render.com/) with your GitHub account.
2. Click **New +** and select **Web Service**.
3. Select your `codebuddy` repository from GitHub.
4. Set the following settings:
   * **Name**: `codebuddy-backend`
   * **Region**: Oregon (US West) or closest to your users
   * **Runtime**: `Python 3`
   * **Build Command**: `pip install -r backend/requirements.txt`
   * **Start Command**: `python backend/run.py` (or `gunicorn --chdir backend run:app`)
   * **Instance Type**: `Free`
5. Under **Environment Variables**, add:
   * `SECRET_KEY`: (a long random string, e.g. `codebuddy_secret_key_2026`)
   * `JWT_SECRET_KEY`: (a long random string, e.g. `codebuddy_jwt_secret_2026`)
   * `FLASK_ENV`: `production`
   * `CORS_ORIGINS`: `*` (or your Vercel URL, e.g. `https://codebuddy-gamma.vercel.app`)
6. Click **Create Web Service**.
7. Once deployed, Render will give you a backend URL like `https://codebuddy-backend.onrender.com`.

---

## 🛠️ Included Deployment Files in This Repository

| File | Purpose |
| :--- | :--- |
| [`package.json`](./package.json) | Root package.json enabling 1-click automatic build on Vercel without manual directory configuration |
| [`vercel.json`](./vercel.json) | Root configuration for Vercel SPA routing and build output directory (`dist`) |
| [`frontend/vercel.json`](./frontend/vercel.json) | SPA client-side routing rewrites for Vite React if building directly in `frontend/` |
| [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) | GitHub Actions CI to automatically run Pytest and Vite build on push |
| [`render.yaml`](./render.yaml) | 1-click Blueprint for deploying the backend to Render |
| [`requirements.txt`](./requirements.txt) | Root Python dependencies for cloud build detectors |
| [`docker-compose.yml`](./docker-compose.yml) | Docker deployment configuration for self-hosted VPS / DigitalOcean |

---

## Connecting Frontend to Backend

Once your backend is live:
1. Go to your Vercel project dashboard $\rightarrow$ **Settings** $\rightarrow$ **Environment Variables**.
2. Update `VITE_API_BASE_URL` to your live backend endpoint:
   ```env
   VITE_API_BASE_URL=https://codebuddy-backend.onrender.com/api
   ```
3. Trigger a quick redeploy on Vercel (**Deployments** $\rightarrow$ Click latest $\rightarrow$ **Redeploy**).
4. That's it! Your entire full-stack platform is live and connected.

---

## Troubleshooting & FAQs

### Q1: When I refresh the page on Vercel (e.g. `/problems`), it says 404 Not Found.
* **Solution**: Ensure [`frontend/vercel.json`](./frontend/vercel.json) is present with the rewrite rule `{"source": "/(.*)", "destination": "/index.html"}`. This is already created for you in this codebase!

### Q2: How do I seed the database in production?
* You can run the seed script directly against your production database:
  ```powershell
  python database/seed.py
  ```
  Or call the pre-configured mock data generator in `backend/app/services/seed_service.py`.

### Q3: How do I set up custom domain on Vercel?
* In your Vercel Dashboard, go to **Settings** $\rightarrow$ **Domains** $\rightarrow$ Enter your custom domain (e.g., `codebuddy.dev` or `codebuddy.com`) $\rightarrow$ Follow the DNS CNAME instructions.
