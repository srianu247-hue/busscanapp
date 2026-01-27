# Bus Fingerprint Fare System - Bus-Side Application

## 🚌 Overview

This is a **bus-side/conductor-side fingerprint fare deduction system** that works with your existing backend infrastructure. It provides a seamless entry/exit scanning experience for passengers using fingerprint authentication.

## ✨ Features

### Core Functionality
- ✅ **No Login Required** - Direct fingerprint scanning
- ✅ **Entry/Exit Scanning** - Two-step journey tracking
- ✅ **GPS Location Capture** - Automatic location tracking using browser API
- ✅ **Distance Calculation** - Haversine formula for accurate distance
- ✅ **Automatic Fare Calculation** - ₹2 per km base rate
- ✅ **Wallet Integration** - Real-time balance checking and deduction
- ✅ **Session Management** - Persistent trip state using sessionStorage
- ✅ **System Status Monitoring** - Backend and scanner connectivity checks

### User Experience
- 🎨 **Premium UI Design** - Gradient buttons, smooth animations
- 📱 **Large Touch-Friendly Buttons** - Perfect for bus demo
- 🎯 **Clear Status Indicators** - Visual feedback at every step
- ⚡ **Real-time Updates** - Instant feedback on all operations
- 🔔 **Error Handling** - Comprehensive error messages

## 🛠️ Tech Stack

### Frontend
- **React 19.x** - Latest React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** (CDN) - Utility-first styling
- **Lucide React** - Beautiful icon library

### Backend Integration
- **Node.js + Express** (Existing)
- **MongoDB Atlas** (Existing)
- **Precision Biometric RDMS** (Existing)

## 📁 Project Structure

```
bus-fare-app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── SystemStatusCard.tsx
│   │   ├── FingerprintActionCard.tsx
│   │   ├── UserInfoCard.tsx
│   │   ├── GPSStatusCard.tsx
│   │   ├── FareSummaryCard.tsx
│   │   └── TripStatusBadge.tsx
│   ├── pages/
│   │   └── BusFingerprintFarePage.tsx  # Main page
│   ├── services/
│   │   └── api.ts           # API service layer
│   ├── utils/
│   │   ├── gps.ts           # GPS & distance calculations
│   │   └── session.ts       # Session storage management
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🚀 Installation & Setup

### 1. Install Dependencies

```bash
cd bus-fare-app
npm install
```

### 2. Configure Backend Proxy

The Vite dev server is configured to proxy API requests to your backend:

```typescript
// vite.config.ts
server: {
  port: 3001,
  proxy: {
    '/api': {
      target: 'http://localhost:5000',  // Your backend URL
      changeOrigin: true
    }
  }
}
```

**Update the target URL** if your backend runs on a different port.

### 3. Start Development Server

```bash
npm run dev
```

The app will run on: **http://localhost:3001**

## 🔌 Backend API Requirements

This application expects the following API endpoints to exist:

### Fingerprint APIs

```typescript
// POST /api/fingerprint/verify
// Verify fingerprint and return user identification
Response: {
  success: boolean;
  userId: string;
  fingerprintId: string;
  verified: boolean;
  message?: string;
}

// POST /api/fingerprint/capture
// Capture fingerprint data
Response: {
  success: boolean;
  fingerprintData: string;
}
```

### User APIs

```typescript
// GET /api/users/:userId
// Get user details
Response: {
  _id: string;
  name: string;
  email: string;
  phone: string;
  walletBalance: number;
  status: 'active' | 'blocked';
  fingerprintId?: string;
}

// POST /api/users/:userId/deduct
// Deduct amount from wallet
Request: {
  amount: number;
  tripId?: string;
  description?: string;
}
Response: {
  success: boolean;
  newBalance: number;
  transactionId: string;
  message?: string;
}
```

### System APIs

```typescript
// GET /api/health
// Check backend status
Response: {
  status: string;
}
```

## 📊 Functional Flow

### Entry Scan Flow

1. **Page Load** → Check system status (backend + scanner)
2. **User Action** → Click "Scan Fingerprint (ENTRY)"
3. **Fingerprint Scan** → Call `/api/fingerprint/verify`
4. **User Fetch** → Call `/api/users/:userId`
5. **Validation** → Check account status & wallet balance
6. **GPS Capture** → Browser Geolocation API
7. **Session Save** → Store in sessionStorage
8. **Status Update** → Trip status = "ONGOING"

### Exit Scan Flow

1. **User Action** → Click "Scan Fingerprint (EXIT)"
2. **Fingerprint Scan** → Call `/api/fingerprint/verify`
3. **Validation** → Verify same user as entry scan
4. **GPS Capture** → Capture exit location
5. **Distance Calculation** → Haversine formula
6. **Fare Calculation** → Distance × ₹2/km (min ₹10)
7. **Balance Check** → Ensure sufficient wallet balance
8. **Wallet Deduction** → Call `/api/users/:userId/deduct`
9. **Trip Summary** → Display complete journey details
10. **Session Clear** → Remove from sessionStorage

## 🧮 Fare Calculation Logic

```typescript
// Base rate: ₹2 per km
// Minimum fare: ₹10

function calculateFare(distanceKm: number): number {
  const BASE_RATE_PER_KM = 2;
  const MINIMUM_FARE = 10;
  
  const calculatedFare = distanceKm * BASE_RATE_PER_KM;
  return Math.max(calculatedFare, MINIMUM_FARE);
}
```

### Distance Calculation (Haversine)

```typescript
function calculateDistance(point1: GPSCoordinates, point2: GPSCoordinates): number {
  const R = 6371; // Earth's radius in km
  
  const lat1Rad = toRadians(point1.lat);
  const lat2Rad = toRadians(point2.lat);
  const deltaLatRad = toRadians(point2.lat - point1.lat);
  const deltaLngRad = toRadians(point2.lng - point1.lng);
  
  const a = 
    Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(deltaLngRad / 2) * Math.sin(deltaLngRad / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}
```

## 🎨 UI Components

### SystemStatusCard
- Shows backend connectivity status
- Shows fingerprint scanner status
- Real-time status updates

### FingerprintActionCard
- Large scan button (ENTRY/EXIT)
- Loading state during scan
- Disabled state when system offline

### UserInfoCard
- Passenger name
- Wallet balance with visual indicator
- Account status badge
- Contact information

### GPSStatusCard
- Entry location coordinates
- Exit location coordinates
- Capturing indicator

### FareSummaryCard
- Journey route (from → to)
- Distance travelled
- Fare amount
- Wallet balance before/after
- Success message

### TripStatusBadge
- IDLE - Ready to scan
- ONGOING - Trip in progress
- COMPLETED - Journey complete
- ERROR - Error occurred

## 🔒 Error Handling

The application handles the following error scenarios:

1. **Fingerprint not recognized** → Clear error message
2. **User not found** → Database lookup failure
3. **Account blocked** → Prevent boarding
4. **Insufficient wallet balance** → Show required amount
5. **GPS permission denied** → Request permission
6. **Exit scan mismatch** → Ensure same user
7. **Backend offline** → Disable scanning
8. **Scanner disconnected** → Show connection status

## 🌐 GPS Permissions

The app requires GPS permissions to capture location. Users will see a browser prompt:

```
"Bus Fare System wants to know your location"
[Block] [Allow]
```

**Important:** GPS must be enabled on the device for accurate location tracking.

## 💾 Session Storage

Trip data is stored in `sessionStorage` during active trips:

```typescript
interface TripSession {
  userId: string;
  userName: string;
  fingerprintId: string;
  entryLocation: GPSCoordinates;
  entryTime: string;
  walletBalanceBefore: number;
  status: 'ONGOING' | 'COMPLETED' | 'CANCELLED';
}
```

**Benefits:**
- Survives page refresh
- Automatically cleared when browser tab closes
- No server-side session management needed

## 🎯 Production Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

### Deploy Options

1. **Static Hosting** (Netlify, Vercel, GitHub Pages)
2. **Serve with Backend** (Express static files)
3. **Docker Container** (Include in existing infrastructure)

### Environment Variables

Create `.env` file for production:

```env
VITE_API_BASE_URL=https://your-backend-api.com/api
VITE_RDMS_SERVICE_URL=http://localhost:8005
```

Update `api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
```

## 🧪 Testing Checklist

- [ ] Backend connectivity check works
- [ ] Scanner connectivity check works
- [ ] Entry fingerprint scan successful
- [ ] User data fetched correctly
- [ ] GPS location captured (entry)
- [ ] Session saved to sessionStorage
- [ ] Exit fingerprint scan successful
- [ ] User validation (same user check)
- [ ] GPS location captured (exit)
- [ ] Distance calculated correctly
- [ ] Fare calculated correctly
- [ ] Wallet balance validated
- [ ] Wallet deduction successful
- [ ] Trip summary displayed
- [ ] Session cleared after completion
- [ ] Error handling for all scenarios
- [ ] Page refresh during ongoing trip

## 🎨 Color Palette

```css
Primary Blue: #3B82F6 → #1D4ED8 (gradient)
Success Green: #10B981
Warning Amber: #F59E0B
Error Red: #EF4444
Background: #F8FAFC
Card White: #FFFFFF
```

## 📱 Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

**Note:** GPS API requires HTTPS in production (except localhost).

## 🤝 Integration with Existing System

This application is designed to work alongside your existing passenger-facing app:

| Feature | Passenger App | Bus-Side App |
|---------|--------------|--------------|
| Login | ✅ Required | ❌ No Login |
| Registration | ✅ Yes | ❌ No |
| Wallet Recharge | ✅ Yes | ❌ No |
| Trip Scanning | ❌ No | ✅ Yes |
| Database | Same MongoDB | Same MongoDB |
| Backend APIs | Same APIs | Same APIs |
| Fingerprint System | Same RDMS | Same RDMS |

## 📞 Support

For issues or questions:
1. Check backend API logs
2. Verify RDMS service is running
3. Check browser console for errors
4. Ensure GPS permissions granted

## 📄 License

This project is part of the Bus Fingerprint Fare System.

---

**Built with ❤️ for seamless bus travel experience**
