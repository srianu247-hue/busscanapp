# Deployment Guide - Bus Fare System

## 🚀 Production Deployment

This guide covers deploying the Bus Fare System to production.

## Prerequisites

- ✅ Backend API running and accessible
- ✅ MongoDB Atlas configured
- ✅ RDMS service installed on bus device
- ✅ SSL certificate (for HTTPS - required for GPS)
- ✅ Domain name (optional but recommended)

---

## Option 1: Deploy with Backend (Recommended)

### Step 1: Build Frontend

```bash
cd bus-fare-app
npm run build
```

This creates a `dist/` folder with optimized static files.

### Step 2: Serve from Express

```javascript
// server.js (Backend)
const express = require('express');
const path = require('path');

const app = express();

// API routes
app.use('/api', apiRoutes);

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../bus-fare-app/dist')));

// Handle React routing - return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../bus-fare-app/dist/index.html'));
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
```

### Step 3: Update API Base URL

```typescript
// src/services/api.ts
const API_BASE_URL = '/api'; // No change needed - relative path works
```

### Step 4: Start Server

```bash
node server.js
```

Access app at: `http://localhost:5000`

---

## Option 2: Deploy to Netlify

### Step 1: Build

```bash
npm run build
```

### Step 2: Create `_redirects` file

```bash
# In dist/ folder
echo "/* /index.html 200" > dist/_redirects
```

### Step 3: Deploy

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### Step 4: Configure Environment

In Netlify dashboard → Site settings → Environment variables:

```
VITE_API_BASE_URL=https://your-backend-api.com/api
```

### Step 5: Rebuild

```bash
npm run build
netlify deploy --prod --dir=dist
```

---

## Option 3: Deploy to Vercel

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Deploy

```bash
vercel
```

Follow prompts to configure project.

### Step 3: Set Environment Variables

```bash
vercel env add VITE_API_BASE_URL
# Enter: https://your-backend-api.com/api
```

### Step 4: Redeploy

```bash
vercel --prod
```

---

## Option 4: Docker Deployment

### Step 1: Create Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Step 2: Create nginx.conf

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # API proxy
    location /api {
        proxy_pass http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # React routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Step 3: Build and Run

```bash
# Build image
docker build -t bus-fare-app .

# Run container
docker run -p 3001:80 bus-fare-app
```

### Step 4: Docker Compose (with Backend)

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb+srv://...
      - PORT=5000
    networks:
      - app-network

  frontend:
    build: ./bus-fare-app
    ports:
      - "3001:80"
    depends_on:
      - backend
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

Run:
```bash
docker-compose up -d
```

---

## SSL/HTTPS Configuration

**Important:** GPS API requires HTTPS in production.

### Option 1: Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com
```

### Option 2: Nginx Reverse Proxy

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## Environment Configuration

### Production .env

```env
# .env.production
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_RDMS_SERVICE_URL=http://localhost:8005
```

### Update vite.config.ts

```typescript
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      port: 3001,
      proxy: mode === 'development' ? {
        '/api': {
          target: env.VITE_BACKEND_URL || 'http://localhost:5000',
          changeOrigin: true
        }
      } : undefined
    }
  }
})
```

---

## Performance Optimization

### 1. Enable Gzip Compression

```javascript
// Express
const compression = require('compression');
app.use(compression());
```

### 2. Cache Static Assets

```nginx
# Nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. Lazy Load Components

```typescript
import { lazy, Suspense } from 'react';

const FareSummaryCard = lazy(() => import('./components/FareSummaryCard'));

// Usage
<Suspense fallback={<div>Loading...</div>}>
  <FareSummaryCard {...props} />
</Suspense>
```

---

## Monitoring & Logging

### Frontend Error Tracking

```typescript
// src/utils/errorTracking.ts
export function logError(error: Error, context?: string) {
  console.error(`[${context}]`, error);
  
  // Send to monitoring service (e.g., Sentry)
  // Sentry.captureException(error);
}
```

### Backend Logging

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

---

## Health Checks

### Frontend Health Check

```typescript
// Add to App.tsx
useEffect(() => {
  const interval = setInterval(async () => {
    const status = await checkBackendStatus();
    if (!status.online) {
      // Alert user or retry
      console.warn('Backend offline');
    }
  }, 30000); // Check every 30 seconds

  return () => clearInterval(interval);
}, []);
```

### Backend Health Endpoint

```javascript
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});
```

---

## Backup & Recovery

### Database Backup

```bash
# MongoDB Atlas - Automatic backups enabled by default

# Manual backup
mongodump --uri="mongodb+srv://..." --out=/backup/$(date +%Y%m%d)
```

### Session Data Recovery

```typescript
// Implement session recovery
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (hasActiveTripSession()) {
      e.preventDefault();
      e.returnValue = 'You have an active trip. Are you sure you want to leave?';
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, []);
```

---

## Security Checklist

- [ ] HTTPS enabled (SSL certificate)
- [ ] API endpoints secured (authentication if needed)
- [ ] CORS configured properly
- [ ] Environment variables not exposed
- [ ] Input validation on backend
- [ ] Rate limiting implemented
- [ ] SQL injection prevention (using Mongoose)
- [ ] XSS protection (React escapes by default)
- [ ] Fingerprint data encrypted in transit

---

## Testing in Production

### Smoke Tests

```bash
# Test backend
curl https://yourdomain.com/api/health

# Test frontend
curl https://yourdomain.com

# Test GPS (must be HTTPS)
# Open browser console:
navigator.geolocation.getCurrentPosition(
  pos => console.log(pos.coords),
  err => console.error(err)
)
```

---

## Rollback Plan

### Quick Rollback

```bash
# If using Git tags
git tag -a v1.0.0 -m "Stable version"
git push origin v1.0.0

# Rollback
git checkout v1.0.0
npm run build
# Deploy
```

### Docker Rollback

```bash
# Tag images
docker tag bus-fare-app:latest bus-fare-app:v1.0.0

# Rollback
docker run -p 3001:80 bus-fare-app:v1.0.0
```

---

## Post-Deployment Checklist

- [ ] Frontend loads correctly
- [ ] Backend API accessible
- [ ] Fingerprint scanner connects
- [ ] GPS permissions work (HTTPS)
- [ ] Entry scan flow works
- [ ] Exit scan flow works
- [ ] Fare calculation accurate
- [ ] Wallet deduction successful
- [ ] Error handling works
- [ ] Session persistence works
- [ ] Mobile responsive
- [ ] Performance acceptable (<3s load time)

---

## Support & Maintenance

### Regular Maintenance

- **Daily:** Check error logs
- **Weekly:** Review transaction logs
- **Monthly:** Database cleanup, performance review
- **Quarterly:** Security audit, dependency updates

### Dependency Updates

```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Update React
npm install react@latest react-dom@latest
```

---

**Deployment complete! 🎉**

For issues, refer to the troubleshooting section in README.md
