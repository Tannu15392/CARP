# FindIt — Campus Lost & Found Portal

A full-stack MERN app for reporting, browsing, and recovering lost/found items on campus, extended into a major project with AI-powered visual matching, an admin analytics dashboard, and PWA installability.

## Features

- 🔐 JWT auth (signup/login)
- 📝 Report lost/found items with photos (Cloudinary)
- 🔍 Browse, search, filter by category/location/status
- 🤖 AI chat assistant (Groq / Llama 3.3) for help describing items or recovery tips
- 🧠 Text-based smart matching (category/location/keyword overlap) — existing feature
- 🖼️ **New:** AI visual matching — CLIP image embeddings compare photos across lost ⟷ found reports
- 📊 **New:** Admin dashboard — recovery rate, category & location hotspots, 30-day trend, user management
- ⭐ **New:** Trust score — reporters earn points when their item is successfully returned
- 📱 **New:** Installable PWA — add to home screen, works like a native app

## Project structure

```
findit/                  → React + Vite frontend (PWA)
findit-backend/          → Node/Express API + MongoDB
image-service/           → Python FastAPI microservice for CLIP image embeddings
```

## Quick start (local dev)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full setup + deployment instructions (Vercel + Railway + MongoDB Atlas).

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, vite-plugin-pwa, Recharts |
| Backend | Node.js, Express, MongoDB (Mongoose), JWT, Multer + Cloudinary |
| AI Chat | Groq (Llama 3.3 70B) |
| Image Matching | Python, FastAPI, OpenCLIP (ViT-B-32) |
| Deployment | Vercel (frontend), Railway (Node + Python), MongoDB Atlas |

## Making yourself an admin

After signing up normally through the app, run:
```bash
cd findit-backend
node scripts/makeAdmin.js you@college.edu
```
Then log out/in and you'll see a new "📊 Admin" tab in the navbar.
LINK - https://major-project-byrve3m1r-tannuchandola441-3132s-projects.vercel.app/
