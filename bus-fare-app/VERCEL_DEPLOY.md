# Vercel Deployment Guide

## Why You See 404: NOT_FOUND

The most common cause: Vercel is pointed at the **repo root** (`bus/`) instead of the actual frontend app folder (`bus/bus-fare-app`). Vercel finds no `index.html` or `package.json` at the root, so it returns 404.

---

## ✅ Fix: Vercel Dashboard Settings

When importing your project on Vercel (or in **Settings → General**):

| Setting              | Value              |
|----------------------|--------------------|
| **Root Directory**   | `bus/bus-fare-app` |
| **Framework Preset** | `Vite`             |
| **Build Command**    | `npm run build`    |
| **Output Directory** | `dist`             |
| **Install Command**  | `npm install`      |

> **Important:** The `Root Directory` field must be set to `bus/bus-fare-app`.  
> This is the folder containing `package.json`, `vite.config.ts`, and `index.html`.

---

## ✅ vercel.json (already configured)

The `vercel.json` file located in `bus/bus-fare-app/` already contains the correct SPA fallback rewrite:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This ensures:
- All routes fall back to `index.html` (required for React Router / SPA)
- Build output is read from the `dist` folder

---

## ✅ CLI Deployment

If deploying via terminal:

```bash
cd bus/bus-fare-app
vercel --prod
```

When prompted, set root directory to `.` (current directory).

---

## ⚠️ Backend Note

This deployment only covers the **frontend React app**.

Your backend (`bus/backend`) is a separate Node.js server and must be hosted separately (e.g., Render, Railway, or Heroku). In production, update your API base URL environment variable to point to the live backend URL instead of `localhost:5000`.
