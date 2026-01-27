# 🎯 QUICK START GUIDE

## Welcome to Bus Fingerprint Fare System! 🚌

This guide will get you up and running in **5 minutes**.

---

## ✅ Prerequisites Check

Before starting, ensure you have:

- [ ] **Node.js 18+** installed ([Download](https://nodejs.org/))
- [ ] **Backend API** running (or ready to implement)
- [ ] **MongoDB Atlas** configured
- [ ] **RDMS Service** installed (for fingerprint scanner)
- [ ] **Modern Browser** (Chrome, Firefox, Safari, Edge)

---

## 🚀 Installation (3 Steps)

### Step 1: Navigate to Project

```powershell
cd "e:\Bus project\bus-fare-app"
```

### Step 2: Install Dependencies

```powershell
npm install
```

**Expected Output:**
```
added 70 packages in 9s
```

### Step 3: Configure Environment

```powershell
# Copy example env file
Copy-Item .env.example .env

# Edit .env if needed (optional)
notepad .env
```

**Default Configuration:**
```env
VITE_API_BASE_URL=/api
VITE_RDMS_SERVICE_URL=http://localhost:8005
VITE_BACKEND_URL=http://localhost:5000
```

---

## 🎬 Running the Application

### Development Mode

```powershell
npm run dev
```

**Expected Output:**
```
VITE v6.0.5  ready in 500 ms

➜  Local:   http://localhost:3001/
➜  Network: use --host to expose
```

**Open in browser:** http://localhost:3001

### Production Build

```powershell
npm run build
npm run preview
```

---

## 🔧 Backend Setup (Required)

Your backend must implement these endpoints:

### 1. Fingerprint Verification
```javascript
POST /api/fingerprint/verify
Response: { success, userId, fingerprintId, verified }
```

### 2. Get User
```javascript
GET /api/users/:userId
Response: { _id, name, email, phone, walletBalance, status }
```

### 3. Deduct Wallet
```javascript
POST /api/users/:userId/deduct
Body: { amount, description }
Response: { success, newBalance, transactionId }
```

### 4. Health Check
```javascript
GET /api/health
Response: { status: "ok" }
```

**See `API_INTEGRATION.md` for detailed implementation examples.**

---

## 🧪 Testing the Application

### Test Checklist

1. **System Status**
   - [ ] Backend shows "Online"
   - [ ] Scanner shows "Connected"

2. **Entry Scan**
   - [ ] Click "Scan Fingerprint (ENTRY)"
   - [ ] User info displays
   - [ ] GPS location captured
   - [ ] Status changes to "ONGOING"

3. **Exit Scan**
   - [ ] Click "Scan Fingerprint (EXIT)"
   - [ ] Distance calculated
   - [ ] Fare calculated
   - [ ] Wallet deducted
   - [ ] Trip summary displayed

4. **Error Handling**
   - [ ] Test with blocked account
   - [ ] Test with insufficient balance
   - [ ] Test GPS permission denied

---

## 📱 GPS Permissions

**Important:** The app requires GPS access.

When prompted:
```
"Bus Fare System wants to know your location"
[Block] [Allow]
```

**Click "Allow"** to enable location tracking.

**Note:** GPS requires HTTPS in production (localhost works without HTTPS).

---

## 🐛 Troubleshooting

### Issue: Backend Offline

**Symptom:** Red "Backend Server" status

**Solution:**
1. Check if backend is running: `http://localhost:5000/api/health`
2. Verify backend port in `vite.config.ts`
3. Check CORS configuration

### Issue: Scanner Disconnected

**Symptom:** Red "Fingerprint Scanner" status

**Solution:**
1. Check RDMS service: `http://localhost:8005/status`
2. Verify scanner is connected
3. Restart RDMS service

### Issue: GPS Not Working

**Symptom:** "GPS permission denied" error

**Solution:**
1. Check browser location permissions
2. Enable GPS on device
3. Use HTTPS in production

### Issue: Build Errors

**Symptom:** TypeScript compilation errors

**Solution:**
```powershell
# Clear cache and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **README.md** | Complete user guide |
| **API_INTEGRATION.md** | Backend API documentation |
| **DEPLOYMENT.md** | Production deployment guide |
| **ARCHITECTURE.md** | System architecture diagrams |
| **PROJECT_SUMMARY.md** | Project overview |

---

## 🎨 UI Preview

### Main Screen (IDLE)
```
┌─────────────────────────────────────┐
│ 🚌 Bus Fare System                  │
│ Entry/Exit Scanner                  │
├─────────────────────────────────────┤
│ System Status                       │
│ ✅ Backend Server: Online           │
│ ✅ Fingerprint Scanner: Connected   │
├─────────────────────────────────────┤
│ ⏱️ Ready to Scan                    │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │  👆 Scan Fingerprint (ENTRY)    │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### After Entry Scan (ONGOING)
```
┌─────────────────────────────────────┐
│ 🚌 Bus Fare System                  │
├─────────────────────────────────────┤
│ 🔄 Trip in Progress                 │
├─────────────────────────────────────┤
│ 👤 Passenger Information            │
│ Name: John Doe                      │
│ 💰 Wallet: ₹250.50                  │
│ ✅ Status: Active                   │
├─────────────────────────────────────┤
│ 📍 GPS Location Tracking            │
│ ✅ Entry: 8.0883, 77.5385           │
│ ⏳ Exit: Not captured yet           │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │  👆 Scan Fingerprint (EXIT)     │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### After Exit Scan (COMPLETED)
```
┌─────────────────────────────────────┐
│ 🚌 Bus Fare System                  │
├─────────────────────────────────────┤
│ ✅ Trip Completed                   │
├─────────────────────────────────────┤
│ 🧾 Trip Summary                     │
│ Passenger: John Doe                 │
│                                     │
│ 📍 From → To                        │
│ Location A → Location B             │
│                                     │
│ 📏 Distance: 12.25 km               │
│ 💵 Fare: ₹24.50                     │
│                                     │
│ 💳 Wallet Balance                   │
│ Before: ₹250.50                     │
│ After: ₹226.00                      │
│                                     │
│ ✓ Journey Completed Successfully    │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │  🔄 Start New Trip              │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## 🔑 Key Features

✅ **No Login** - Direct fingerprint scanning  
✅ **Automatic GPS** - Browser-based location tracking  
✅ **Distance Calculation** - Haversine formula  
✅ **Auto Fare Deduction** - ₹2/km (min ₹10)  
✅ **Session Persistence** - Survives page refresh  
✅ **Error Handling** - Comprehensive validation  
✅ **Premium UI** - Modern, responsive design  

---

## 📊 Project Stats

- **Total Files:** 24
- **Lines of Code:** 2,500+
- **Components:** 6
- **API Endpoints:** 4
- **Documentation:** 5 files
- **Build Size:** ~150KB (gzipped)

---

## 🎓 Learning Path

### For Beginners
1. Start with `README.md`
2. Explore `src/components/` folder
3. Study `BusFingerprintFarePage.tsx`
4. Review `api.ts` and `gps.ts`

### For Developers
1. Read `ARCHITECTURE.md` for system design
2. Review `API_INTEGRATION.md` for backend
3. Check `DEPLOYMENT.md` for production
4. Explore TypeScript interfaces

---

## 🚀 Next Steps

### Immediate (Development)
1. ✅ Install dependencies
2. ✅ Configure environment
3. ⏳ Start backend server
4. ⏳ Start RDMS service
5. ✅ Run `npm run dev`
6. ⏳ Test entry/exit flow

### Short-term (Integration)
1. ⏳ Implement backend APIs
2. ⏳ Set up MongoDB schemas
3. ⏳ Configure RDMS service
4. ⏳ Test with real fingerprint scanner
5. ⏳ Test GPS in different locations

### Long-term (Production)
1. ⏳ Build for production
2. ⏳ Deploy to server
3. ⏳ Configure SSL/HTTPS
4. ⏳ Test in production environment
5. ⏳ Monitor and optimize

---

## 💡 Pro Tips

1. **Development:** Use browser DevTools to simulate GPS locations
2. **Testing:** Create test users with different wallet balances
3. **Debugging:** Check browser console for detailed error logs
4. **Performance:** Monitor API response times
5. **Security:** Always use HTTPS in production

---

## 🆘 Need Help?

### Documentation
- 📖 `README.md` - General guide
- 🔌 `API_INTEGRATION.md` - API help
- 🚀 `DEPLOYMENT.md` - Deployment help
- 🏗️ `ARCHITECTURE.md` - System design

### Common Commands
```powershell
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check for errors
npm run build
```

---

## ✅ Success Criteria

You'll know everything is working when:

1. ✅ System status shows all green
2. ✅ Entry scan captures user data
3. ✅ GPS locations are captured
4. ✅ Exit scan calculates fare correctly
5. ✅ Wallet balance is deducted
6. ✅ Trip summary displays properly
7. ✅ Session persists across refresh
8. ✅ Errors are handled gracefully

---

## 🎉 You're Ready!

Your bus fingerprint fare system is now set up and ready to use.

**Start the dev server:**
```powershell
npm run dev
```

**Open in browser:**
```
http://localhost:3001
```

**Happy coding! 🚀**

---

**For detailed information, see the full documentation files.**
