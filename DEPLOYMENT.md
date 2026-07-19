# Deploying FindIt

Three pieces to deploy, in this order: **database → backend → image service → frontend**.

## 0. Rotate your secrets first

Your old `.env` had real credentials sitting in it. Before doing anything else:
- MongoDB Atlas → Database Access → change the `bhawana` user's password
- Cloudinary → Settings → Security → regenerate the API secret
- Groq → regenerate your API key
- Pick a new long random `JWT_SECRET`

Never commit `.env` — it's now in `.gitignore`. Use `.env.example` as the template.

## 1. MongoDB Atlas (database)

You already have a cluster. Just:
1. Confirm Network Access allows `0.0.0.0/0` (or Railway's IPs) so your deployed backend can connect.
2. Grab the fresh connection string after rotating the password.

## 2. Railway — Node backend

1. Push this repo to GitHub.
2. On [railway.app](https://railway.app) → New Project → Deploy from GitHub → pick the repo, set **root directory** to `findit-backend`.
3. Add environment variables (from `findit-backend/.env.example`): `MONGO_URI`, `JWT_SECRET`, `CLOUDINARY_*`, `GROQ_API_KEY`, `PORT` (Railway sets this automatically, but the app reads `process.env.PORT`).
4. Once deployed, note the public URL, e.g. `https://findit-backend-production.up.railway.app`.
5. After your first signup on the live app, promote yourself to admin:
   ```
   railway run node scripts/makeAdmin.js you@college.edu
   ```

## 3. Railway — Python image-matching service

1. New service in the same Railway project → Deploy from GitHub → root directory `image-service`.
2. Railway auto-detects Python via `requirements.txt` + `railway.json`. First boot downloads the CLIP model (~350MB), so give it a minute.
3. Note its public URL, e.g. `https://findit-image-service.up.railway.app`.
4. Back in the **Node backend's** Railway variables, add:
   ```
   IMAGE_SERVICE_URL=https://findit-image-service.up.railway.app
   ```
   Redeploy the backend so it picks this up.

> Cost note: PyTorch + CLIP is a heavier free-tier citizen than the Node service. If Railway's free tier gets tight, this is the piece to keep an eye on — the image matching feature degrades gracefully (matches just stop appearing) if this service is down, so it won't break the rest of the app.

## 4. Vercel — Frontend

1. Import the repo on [vercel.com](https://vercel.com), root directory = repo root (where `package.json` lives, i.e. the `findit/` folder).
2. Build command `npm run build`, output directory `dist` (Vercel usually auto-detects Vite).
3. Environment variable: `VITE_API_URL=https://findit-backend-production.up.railway.app/api`
4. Deploy. Vercel gives you a `*.vercel.app` URL — this is your installable PWA link.

## 5. Verify the PWA

1. Open the Vercel URL on your phone.
2. Chrome/Edge should show "Add to Home Screen" — Safari on iOS: Share → Add to Home Screen.
3. Confirm it opens full-screen without browser chrome.

## 6. Optional custom domain

Point a Namecheap/Hostinger domain's DNS at Vercel (for the frontend) following Vercel's domain docs. The API domain can stay on Railway's `*.up.railway.app` subdomain — no need to expose that to end users directly.

---

## Local development

```bash
# Backend
cd findit-backend
npm install
cp .env.example .env   # fill in real values
npm run dev             # http://localhost:8080

# Image service (optional locally — needs Python 3.10+, ~2GB download first run)
cd image-service
pip install -r requirements.txt
python main.py           # http://localhost:9000

# Frontend
npm install
npm run dev               # http://localhost:8081
```
