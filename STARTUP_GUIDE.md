# 🚀 Complete System Startup Guide

## ⚠️ IMPORTANT: Complete the Move First!

The `bus-fare-app` folder needs to be moved into the `bus` folder.

### Step 1: Stop Frontend Server

**In the terminal running the frontend:**
- Press **Ctrl+C**
- Wait for the server to stop completely

### Step 2: Move Frontend Folder

```powershell
Move-Item -Path "e:\Bus project\bus-fare-app" -Destination "e:\Bus project\bus\bus-fare-app" -Force
```

### Step 3: Verify Structure

```powershell
Get-ChildItem "e:\Bus project\bus"
```

You should see:
```
backend/
bus-fare-app/
README.md
```

---

## ✅ After Moving - Start the System

### Terminal 1: Start Backend

```powershell
cd "e:\Bus project\bus\backend"
npm start
```

**Expected Output:**
```
🚌 ========================================
   Bus Fingerprint Fare System - Backend
   ========================================

   🚀 Server running on port 5000
   🌐 URL: http://localhost:5000
   📊 MongoDB: Connected
```

### Terminal 2: Start Frontend

```powershell
cd "e:\Bus project\bus\bus-fare-app"
npm run dev
```

**Expected Output:**
```
VITE v6.0.5  ready in 500 ms

➜  Local:   http://localhost:3001/
```

### Step 3: Open Browser

Navigate to: **http://localhost:3001**

---

## 🧪 Testing

### Enable Test Mode

Edit: `bus/bus-fare-app/src/services/api.ts`

Find the `verifyFingerprint` function (around line 50):

```typescript
export async function verifyFingerprint(): Promise<FingerprintVerifyResponse> {
  return apiRequest<FingerprintVerifyResponse>('/fingerprint/verify', {
    method: 'POST',
    body: JSON.stringify({
      fingerprintId: 'FP_TEST_001', // ← ADD THIS LINE
      action: 'verify',
      timestamp: new Date().toISOString()
    })
  });
}
```

### Test Flow

1. **Entry Scan:**
   - Click "Scan Fingerprint (ENTRY)"
   - Should show John Doe with ₹500 balance
   - GPS location captured
   - Status: ONGOING

2. **Exit Scan:**
   - Click "Scan Fingerprint (EXIT)"
   - Distance calculated
   - Fare calculated
   - Wallet deducted
   - Trip summary shown

---

## 📊 Test Users

| Fingerprint ID | Name | Balance | Status |
|----------------|------|---------|--------|
| **FP_TEST_001** | John Doe | ₹500.00 | Active |
| **FP_TEST_002** | Jane Smith | ₹250.50 | Active |
| **FP_TEST_003** | Bob Wilson | ₹1000.00 | Active |
| **FP_TEST_004** | Alice Brown | ₹50.00 | Active |
| **FP_TEST_BLOCKED** | Blocked User | ₹100.00 | Blocked |

---

## 🔌 System URLs

- **Backend API:** http://localhost:5000
- **Frontend App:** http://localhost:3001
- **Health Check:** http://localhost:5000/api/health
- **MongoDB:** Connected to Atlas (bus_fare_system)

---

## 📁 New Project Structure

```
e:\Bus project\bus\
├── backend/                    Backend API Server
│   ├── models/                 User, Transaction, Trip
│   ├── routes/                 API endpoints
│   ├── scripts/                createTestUser.js
│   ├── server.js               Main server
│   ├── .env                    MongoDB config
│   └── README.md
│
└── bus-fare-app/               Frontend Application
    ├── src/
    │   ├── components/         6 UI components
    │   ├── pages/              BusFingerprintFarePage
    │   ├── services/           API integration
    │   └── utils/              GPS, Session
    ├── README.md
    ├── QUICK_START.md
    ├── API_INTEGRATION.md
    ├── DEPLOYMENT.md
    └── ARCHITECTURE.md
```

---

## 🐛 Troubleshooting

### Port Already in Use

```powershell
# Find process on port 5000
netstat -ano | findstr :5000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

### MongoDB Connection Error

- Check `.env` file in `bus/backend/`
- Verify MongoDB Atlas IP whitelist
- Ensure network connectivity

### Frontend Can't Connect

- Verify backend is running: http://localhost:5000/api/health
- Check CORS settings in `backend/server.js`
- Check proxy in `bus-fare-app/vite.config.ts`

---

## 📚 Documentation

| Document | Location | Purpose |
|----------|----------|---------|
| **Main README** | `bus/README.md` | Project overview |
| **Backend Guide** | `bus/backend/README.md` | Backend API docs |
| **Frontend Guide** | `bus/bus-fare-app/README.md` | Frontend guide |
| **Quick Start** | `bus/bus-fare-app/QUICK_START.md` | 5-min setup |
| **API Integration** | `bus/bus-fare-app/API_INTEGRATION.md` | API details |
| **Deployment** | `bus/bus-fare-app/DEPLOYMENT.md` | Deploy guide |
| **Architecture** | `bus/bus-fare-app/ARCHITECTURE.md` | System design |

---

## ✅ Verification Checklist

After starting both servers:

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3001
- [ ] Can access http://localhost:3001
- [ ] System status shows all green
- [ ] MongoDB connected
- [ ] Can test fingerprint scan
- [ ] GPS location works
- [ ] Fare calculation works

---

## 🎯 Next Steps

1. ⏳ Stop frontend server (Ctrl+C)
2. ⏳ Move `bus-fare-app` folder
3. ⏳ Restart both servers
4. ⏳ Test the complete flow
5. ⏳ Check MongoDB for saved data

---

**Complete the move first, then start testing! 🚀**
