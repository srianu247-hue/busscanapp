# API Integration Guide

## Overview

This document provides detailed information about integrating the Bus Fare System frontend with your existing backend APIs.

## Base Configuration

```typescript
// src/services/api.ts
const API_BASE_URL = '/api';
```

In development, Vite proxy forwards `/api/*` requests to `http://localhost:5000`.

## API Endpoints

### 1. Fingerprint Verification

**Endpoint:** `POST /api/fingerprint/verify`

**Purpose:** Verify fingerprint and identify user

**Request:**
```json
{
  "action": "verify",
  "timestamp": "2026-01-27T09:24:43+05:30"
}
```

**Response:**
```json
{
  "success": true,
  "userId": "507f1f77bcf86cd799439011",
  "fingerprintId": "FP123456",
  "verified": true,
  "message": "Fingerprint verified successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "verified": false,
  "message": "Fingerprint not recognized"
}
```

**Frontend Usage:**
```typescript
import { verifyFingerprint } from '../services/api';

const result = await verifyFingerprint();
if (result.success && result.verified) {
  // Proceed with user identification
  const userId = result.userId;
}
```

---

### 2. Get User Details

**Endpoint:** `GET /api/users/:userId`

**Purpose:** Fetch user information and wallet balance

**URL Parameters:**
- `userId` (string) - MongoDB ObjectId

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+91 9876543210",
  "walletBalance": 250.50,
  "status": "active",
  "fingerprintId": "FP123456"
}
```

**Frontend Usage:**
```typescript
import { getUserById } from '../services/api';

const user = await getUserById('507f1f77bcf86cd799439011');
console.log(user.walletBalance); // 250.50
```

---

### 3. Deduct Wallet Balance

**Endpoint:** `POST /api/users/:userId/deduct`

**Purpose:** Deduct fare from user's wallet

**URL Parameters:**
- `userId` (string) - MongoDB ObjectId

**Request:**
```json
{
  "amount": 24.50,
  "tripId": "TRIP123456",
  "description": "Bus fare: 12.25km from Location A to Location B"
}
```

**Response:**
```json
{
  "success": true,
  "newBalance": 226.00,
  "transactionId": "TXN789012",
  "message": "Fare deducted successfully"
}
```

**Error Response (Insufficient Balance):**
```json
{
  "success": false,
  "message": "Insufficient wallet balance"
}
```

**Frontend Usage:**
```typescript
import { deductWalletBalance } from '../services/api';

const result = await deductWalletBalance('507f1f77bcf86cd799439011', {
  amount: 24.50,
  description: 'Bus fare: 12.25km'
});

console.log(result.newBalance); // 226.00
```

---

### 4. Health Check

**Endpoint:** `GET /api/health`

**Purpose:** Check backend server status

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-27T09:24:43+05:30"
}
```

**Frontend Usage:**
```typescript
import { checkBackendStatus } from '../services/api';

const status = await checkBackendStatus();
if (status.online) {
  console.log('Backend is online');
}
```

---

## RDMS Service Integration

### Scanner Status Check

**Endpoint:** `GET http://localhost:8005/status`

**Purpose:** Check fingerprint scanner connectivity

**Response:**
```json
{
  "status": "connected",
  "device": "Precision Biometric Scanner",
  "version": "1.0.0"
}
```

**Frontend Usage:**
```typescript
import { checkScannerStatus } from '../services/api';

const status = await checkScannerStatus();
if (status.connected) {
  console.log('Scanner is ready');
}
```

---

## Error Handling

All API functions use a centralized error handler:

```typescript
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}
```

**Usage in Components:**

```typescript
try {
  const user = await getUserById(userId);
  setCurrentUser(user);
} catch (error: any) {
  setError(error.message || 'Failed to fetch user data');
  setTripStatus('ERROR');
}
```

---

## Backend Implementation Examples

### Express.js Route Examples

```javascript
// routes/fingerprint.js
router.post('/verify', async (req, res) => {
  try {
    // Call RDMS service to verify fingerprint
    const fingerprintData = await rdmsService.verify();
    
    // Find user by fingerprint
    const user = await User.findOne({ fingerprintId: fingerprintData.id });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        verified: false,
        message: 'Fingerprint not recognized'
      });
    }
    
    res.json({
      success: true,
      userId: user._id,
      fingerprintId: user.fingerprintId,
      verified: true,
      message: 'Fingerprint verified successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// routes/users.js
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:userId/deduct', async (req, res) => {
  try {
    const { amount, description } = req.body;
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.walletBalance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance'
      });
    }
    
    // Deduct amount
    user.walletBalance -= amount;
    await user.save();
    
    // Create transaction record
    const transaction = await Transaction.create({
      userId: user._id,
      amount,
      type: 'debit',
      description,
      balanceAfter: user.walletBalance
    });
    
    res.json({
      success: true,
      newBalance: user.walletBalance,
      transactionId: transaction._id,
      message: 'Fare deducted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
```

---

## MongoDB Schema Examples

```javascript
// models/User.js
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  walletBalance: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'blocked'], default: 'active' },
  fingerprintId: { type: String, unique: true, sparse: true },
  createdAt: { type: Date, default: Date.now }
});

// models/Transaction.js
const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  description: { type: String },
  balanceAfter: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

// models/Trip.js (Optional)
const tripSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  entryLocation: {
    lat: Number,
    lng: Number
  },
  exitLocation: {
    lat: Number,
    lng: Number
  },
  entryTime: { type: Date, required: true },
  exitTime: { type: Date },
  distanceKm: Number,
  fareAmount: Number,
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  status: { type: String, enum: ['ongoing', 'completed'], default: 'ongoing' }
});
```

---

## CORS Configuration

Ensure your backend allows requests from the frontend:

```javascript
// server.js
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:5173'],
  credentials: true
}));
```

---

## Testing APIs

### Using cURL

```bash
# Test fingerprint verification
curl -X POST http://localhost:5000/api/fingerprint/verify \
  -H "Content-Type: application/json" \
  -d '{"action":"verify","timestamp":"2026-01-27T09:24:43+05:30"}'

# Test get user
curl http://localhost:5000/api/users/507f1f77bcf86cd799439011

# Test wallet deduction
curl -X POST http://localhost:5000/api/users/507f1f77bcf86cd799439011/deduct \
  -H "Content-Type: application/json" \
  -d '{"amount":24.50,"description":"Bus fare"}'
```

### Using Postman

Import this collection:

```json
{
  "info": {
    "name": "Bus Fare System API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Verify Fingerprint",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/fingerprint/verify",
        "body": {
          "mode": "raw",
          "raw": "{\"action\":\"verify\",\"timestamp\":\"2026-01-27T09:24:43+05:30\"}"
        }
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000"
    }
  ]
}
```

---

## Troubleshooting

### Common Issues

**1. CORS Errors**
```
Access to fetch at 'http://localhost:5000/api/users/...' from origin 'http://localhost:3001' has been blocked by CORS policy
```

**Solution:** Add CORS middleware to backend

**2. Network Errors**
```
Failed to fetch
```

**Solution:** Check if backend is running on correct port

**3. 404 Not Found**
```
Cannot GET /api/users/123
```

**Solution:** Verify route exists in backend

**4. 500 Internal Server Error**

**Solution:** Check backend logs for detailed error

---

## Next Steps

1. ✅ Implement all required API endpoints in backend
2. ✅ Test each endpoint individually
3. ✅ Integrate RDMS service for fingerprint scanning
4. ✅ Set up MongoDB schemas
5. ✅ Configure CORS properly
6. ✅ Test end-to-end flow
7. ✅ Deploy to production

---

**For additional support, refer to the main README.md**
