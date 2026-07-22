# 🌐 SentinelAI Live Cloud Deployment Guide

This guide walks you through deploying **SentinelAI** to production cloud platforms for **100% FREE** using **MongoDB Atlas**, **Render/Railway**, and **Vercel**.

---

## 🌐 Architecture Overview

```
 ┌──────────────────────┐        ┌──────────────────────┐        ┌──────────────────────┐
 │   Vercel (Frontend)  │ ───►   │   Render (Backend)   │ ───►   │    MongoDB Atlas     │
 │  React 19 + Tailwind │ REST   │ FastAPI + AI Engine  │ PyMongo│   Cloud Database     │
 └──────────────────────┘        └──────────────────────┘        └──────────────────────┘
```

---

## Step 1: Create Free Cloud Database (MongoDB Atlas)

1. Sign up for free at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2. Create a free **M0 Cluster** (Shared Tier).
3. Under **Database Access**, create a user (e.g. `admin` / password).
4. Under **Network Access**, add IP `0.0.0.0/0` (Allow access from anywhere).
5. Click **Connect** -> **Drivers** and copy your MongoDB connection string:
   ```env
   MONGODB_URL=mongodb+srv://admin:<password>@sentinelai-cluster.mongodb.net/sentinelai?retryWrites=true&w=majority
   ```

---

## Step 2: Deploy Backend to Render.com (FastAPI)

1. Push your project to GitHub.
2. Sign up at [Render.com](https://render.com).
3. Click **New +** -> **Web Service** -> Connect your GitHub repository.
4. Configure settings:
   - **Name:** `sentinelai-backend`
   - **Root Directory:** `.`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r backend/requirements.txt`
   - **Start Command:** `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variables under **Environment**:
   - `MONGODB_URL` = *(Your MongoDB Atlas URI from Step 1)*
   - `DATABASE_NAME` = `sentinelai`
   - `JWT_SECRET_KEY` = `your-super-secret-production-key`
6. Click **Create Web Service**. Your backend will be live at:
   `https://sentinelai-backend.onrender.com`

---

## Step 3: Deploy Frontend to Vercel (React)

### Option A: Using Vercel Web Dashboard (Recommended)

1. Sign up at [Vercel.com](https://vercel.com).
2. Click **Add New...** -> **Project** -> Import your GitHub repo.
3. Set **Framework Preset:** `Vite`
4. Set **Root Directory:** `frontend`
5. Expand **Environment Variables** and add:
   - `VITE_API_URL` = `https://sentinelai-backend.onrender.com/api/v1`
6. Click **Deploy**. Vercel will build and publish your dashboard at:
   `https://sentinelai.vercel.app` 🎉

---

### Option B: Using Vercel CLI from Terminal

1. In terminal, navigate to `frontend`:
   ```bash
   cd frontend
   ```
2. Run Vercel CLI command:
   ```bash
   npx vercel --prod
   ```
3. Follow the interactive prompts to link your project and deploy instantly!
