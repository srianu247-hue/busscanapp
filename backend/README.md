# Bus Fare System - Backend API

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

The `.env` file is already configured with your MongoDB connection string:

```env
MONGODB_URI=mongodb+srv://srianu247_db_user:srini123@cluster0.ya5qme0.mongodb.net/bus_fare_system?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
RDMS_SERVICE_URL=http://localhost:8005
CORS_ORIGIN=http://localhost:3001
```

### 3. Create Test Users

```bash
node scripts/createTestUser.js
```

This creates 5 test users with fingerprint IDs:
- **FP_TEST_001** - John Doe (₹500)
- **FP_TEST_002** - Jane Smith (₹250.50)
- **FP_TEST_003** - Bob Wilson (₹1000)
- **FP_TEST_004** - Alice Brown (₹50)
- **FP_TEST_BLOCKED** - Blocked User (blocked account)

### 4. Start Server

```bash
npm start
```

Or for development with auto-restart:

```bash
npm run dev
```

Server will run on: **http://localhost:5000**

---

## 📡 API Endpoints

### Health Check
```
GET /api/health
```

### Fingerprint APIs

#### Verify Fingerprint
```
POST /api/fingerprint/verify
Body: { "fingerprintId": "FP_TEST_001" }
```

#### Capture Fingerprint
```
POST /api/fingerprint/capture
```

#### Scanner Status
```
GET /api/fingerprint/status
```

### User APIs

#### Get User
```
GET /api/users/:userId
```

#### Deduct Wallet
```
POST /api/users/:userId/deduct
Body: {
  "amount": 24.50,
  "description": "Bus fare: 12.25km"
}
```

#### Credit Wallet
```
POST /api/users/:userId/credit
Body: {
  "amount": 100,
  "description": "Wallet recharge"
}
```

#### Get Transactions
```
GET /api/users/:userId/transactions?limit=50
```

### Trip APIs

#### Save Trip
```
POST /api/trips
Body: {
  "userId": "...",
  "userName": "John Doe",
  "entryLocation": { "lat": 8.0883, "lng": 77.5385 },
  "exitLocation": { "lat": 13.0827, "lng": 80.2707 },
  "distanceKm": 612.25,
  "fareAmount": 1224.50,
  "walletBalanceBefore": 500,
  "walletBalanceAfter": 275.50
}
```

#### Get Trip
```
GET /api/trips/:tripId
```

#### Get User Trips
```
GET /api/trips/user/:userId?limit=50
```

---

## 🧪 Testing with Frontend

### Step 1: Start Backend
```bash
npm start
```

### Step 2: Test Fingerprint Verification

In the frontend, when you click "Scan Fingerprint", it will send:
```javascript
POST /api/fingerprint/verify
```

For testing, you can modify the frontend to send a test fingerprint ID:
```javascript
// In src/services/api.ts
export async function verifyFingerprint(): Promise<FingerprintVerifyResponse> {
  return apiRequest<FingerprintVerifyResponse>('/fingerprint/verify', {
    method: 'POST',
    body: JSON.stringify({
      fingerprintId: 'FP_TEST_001', // Add this for testing
      timestamp: new Date().toISOString()
    })
  });
}
```

---

## 📊 Database Models

### User
```javascript
{
  name: String,
  email: String,
  phone: String,
  password: String,
  walletBalance: Number,
  status: 'active' | 'blocked',
  fingerprintId: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Transaction
```javascript
{
  userId: ObjectId,
  amount: Number,
  type: 'credit' | 'debit',
  description: String,
  balanceBefore: Number,
  balanceAfter: Number,
  tripId: ObjectId,
  status: 'pending' | 'completed' | 'failed',
  timestamp: Date
}
```

### Trip
```javascript
{
  userId: ObjectId,
  userName: String,
  entryLocation: { lat, lng, accuracy, timestamp },
  exitLocation: { lat, lng, accuracy, timestamp },
  entryTime: Date,
  exitTime: Date,
  distanceKm: Number,
  fareAmount: Number,
  walletBalanceBefore: Number,
  walletBalanceAfter: Number,
  transactionId: ObjectId,
  status: 'ongoing' | 'completed' | 'cancelled',
  createdAt: Date
}
```

---

## 🔧 Configuration

### MongoDB Connection
Your database is: `bus_fare_system`

Collections:
- `users`
- `transactions`
- `trips`

### CORS
Configured to allow requests from: `http://localhost:3001`

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: Could not connect to any servers in your MongoDB Atlas cluster
```

**Solution:**
1. Check if your IP is whitelisted in MongoDB Atlas
2. Verify the connection string is correct
3. Ensure network connectivity

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
```bash
# Find and kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

---

## 📝 Notes

- **Fingerprint Simulation:** Currently using test fingerprint IDs for development
- **Production:** Replace with actual RDMS service integration
- **Security:** Add authentication middleware for production
- **Password Hashing:** Implement bcrypt for password security

---

## 🚀 Next Steps

1. ✅ Backend is ready
2. ⏳ Start backend server
3. ⏳ Create test users
4. ⏳ Start frontend
5. ⏳ Test entry/exit flow

---

**Backend is ready to use! 🎉**
