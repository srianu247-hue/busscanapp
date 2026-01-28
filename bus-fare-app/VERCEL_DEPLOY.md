# Deployment Guide for Vercel

## Potential Error Cause: "NOT_FOUND" / 404
If you are seeing a 404 NOT_FOUND error on Vercel, it is likely because Vercel is looking for your `index.html` in the wrong place. 

Since your project is located in `bus/bus-fare-app` (not the root of the repository), you must tell Vercel where to find it.

## Fix 1: Configure Root Directory (Recommended)
When importing your project in Vercel:

1. Go to **Settings** > **General** (or during the initial import setup).
2. Find the **Root Directory** field.
3. Click "Edit" and browse to select `bus/bus-fare-app`.
4. Ensure the **Framework Preset** is set to **Vite**.
5. The **Output Directory** should automatically be set to `dist` (which is correct for Vite).

## Fix 2: Manual CLI Deployment
If you are deploying via the command line using `vercel` generic command:

1. Open your terminal.
2. Navigate **into** the frontend directory:
   ```bash
   cd bus/bus-fare-app
   ```
3. Run the valid deploy command:
   ```bash
   vercel
   ```

## ⚠️ Important Note on Backend
This deployment only handles the **Frontend** (React App). 
Your backend (`bus/backend`) is a separate Node.js server. Vercel is primarily for frontend. 
- The frontend will try to call `/api` (proxied to localhost in dev).
- In production, you must update your API base URL to point to your live backend server (hosted on Render, Railway, or Heroku, or as Vercel Serverless Functions if rewritten).
