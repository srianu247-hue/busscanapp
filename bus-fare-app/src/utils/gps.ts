/**
 * GPS and Distance Calculation Utilities
 * Haversine formula for distance calculation
 * Supports real browser Geolocation API with mock fallback
 */

export interface GPSCoordinates {
    lat: number;
    lng: number;
    accuracy?: number;
    timestamp?: number;
}

export type GPSPermissionStatus = 'granted' | 'denied' | 'prompt' | 'unavailable';

// ==========================================
// PERMISSION HANDLING
// ==========================================

/**
 * Request location permission from the browser.
 * Returns the resulting permission status.
 */
export async function requestLocationPermission(): Promise<GPSPermissionStatus> {
    if (!navigator.geolocation) {
        return 'unavailable';
    }
    // Use Permissions API if available for a non-blocking check
    if (navigator.permissions) {
        try {
            const result = await navigator.permissions.query({ name: 'geolocation' });
            if (result.state === 'denied') return 'denied';
        } catch {
            // Permissions API not supported; fall through to prompt
        }
    }
    // Trigger a real getCurrentPosition to prompt the user
    return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
            () => resolve('granted'),
            (err) => {
                if (err.code === err.PERMISSION_DENIED) resolve('denied');
                else resolve('prompt');
            },
            { timeout: 8000, maximumAge: 0 }
        );
    });
}

// ==========================================
// GPS CAPTURE
// ==========================================

/**
 * Capture current GPS location using Browser Geolocation API.
 * Falls back to Chennai mock coordinates when geolocation is unavailable.
 */
export function captureGPSLocation(): Promise<GPSCoordinates> {
    if (navigator.geolocation) {
        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: position.timestamp
                    });
                },
                (err) => {
                    console.warn('Geolocation failed, using mock coordinates:', err.message);
                    // Graceful mock fallback
                    resolve(_mockGPSCoordinates());
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        });
    }
    // Browser doesn't support geolocation at all
    return new Promise((resolve) => {
        setTimeout(() => resolve(_mockGPSCoordinates()), 1000);
    });
}

/** Internal: generate mock Chennai-area coordinates */
function _mockGPSCoordinates(): GPSCoordinates {
    const baseLat = 13.0827;
    const baseLng = 80.2707;
    return {
        lat: baseLat + (Math.random() - 0.5) * 0.05,
        lng: baseLng + (Math.random() - 0.5) * 0.05,
        accuracy: 10,
        timestamp: Date.now()
    };
}

// ==========================================
// REAL-TIME GPS TRACKING
// ==========================================

export type GPSCallback = (coords: GPSCoordinates) => void;
export type GPSErrorCallback = (message: string) => void;

let _watchId: number | null = null;
let _mockInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Start real-time GPS tracking.
 * Calls `onUpdate` whenever a new location fix arrives.
 * Calls `onError` if permission is denied or GPS is disabled.
 * Returns a cleanup function to stop tracking.
 */
export function startRealTimeGPSTracking(
    onUpdate: GPSCallback,
    onError: GPSErrorCallback
): () => void {
    if (navigator.geolocation) {
        _watchId = navigator.geolocation.watchPosition(
            (position) => {
                onUpdate({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: position.timestamp
                });
            },
            (err) => {
                if (err.code === err.PERMISSION_DENIED) {
                    onError('Location access denied. Please enable GPS in your browser settings.');
                } else if (err.code === err.POSITION_UNAVAILABLE) {
                    onError('GPS signal unavailable. Please enable GPS on your device.');
                } else {
                    onError('GPS timeout. Please check your device location settings.');
                }
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
        );
    } else {
        // Mock fallback: emit a new position every 5 seconds
        console.warn('Geolocation API not available – using mock tracking.');
        _mockInterval = setInterval(() => {
            onUpdate(_mockGPSCoordinates());
        }, 5000);
    }

    return stopGPSTracking;
}

/**
 * Stop any active real-time GPS tracking session.
 */
export function stopGPSTracking(): void {
    if (_watchId !== null) {
        navigator.geolocation.clearWatch(_watchId);
        _watchId = null;
    }
    if (_mockInterval !== null) {
        clearInterval(_mockInterval);
        _mockInterval = null;
    }
}

/**
 * Returns true if a real-time tracking session is currently active.
 */
export function isGPSTrackingActive(): boolean {
    return _watchId !== null || _mockInterval !== null;
}

// ==========================================
// DISTANCE CALCULATION (HAVERSINE FORMULA)
// ==========================================

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * Returns distance in kilometers
 * 
 * Formula:
 * a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)
 * c = 2 ⋅ atan2( √a, √(1−a) )
 * d = R ⋅ c
 * 
 * where φ is latitude, λ is longitude, R is earth's radius (6371 km)
 */
export function calculateDistance(
    point1: GPSCoordinates,
    point2: GPSCoordinates
): number {
    const R = 6371; // Earth's radius in kilometers

    // Convert degrees to radians
    const lat1Rad = toRadians(point1.lat);
    const lat2Rad = toRadians(point2.lat);
    const deltaLatRad = toRadians(point2.lat - point1.lat);
    const deltaLngRad = toRadians(point2.lng - point1.lng);

    // Haversine formula
    const a =
        Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
        Math.cos(lat1Rad) * Math.cos(lat2Rad) *
        Math.sin(deltaLngRad / 2) * Math.sin(deltaLngRad / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Distance in kilometers

    // Round to 2 decimal places
    return Math.round(distance * 100) / 100;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

// ==========================================
// FARE CALCULATION
// ==========================================

/**
 * Calculate fare based on distance
 * Base rate: ₹2 per km
 * Minimum fare: ₹10
 */
export function calculateFare(distanceKm: number): number {
    const BASE_RATE_PER_KM = 2;
    const MINIMUM_FARE = 10;

    const calculatedFare = distanceKm * BASE_RATE_PER_KM;
    const finalFare = Math.max(calculatedFare, MINIMUM_FARE);

    // Round to 2 decimal places
    return Math.round(finalFare * 100) / 100;
}

// ==========================================
// GPS VALIDATION
// ==========================================

/**
 * Validate GPS coordinates
 * Latitude: -90 to 90
 * Longitude: -180 to 180
 */
export function isValidGPSCoordinates(coords: GPSCoordinates): boolean {
    if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
        return false;
    }

    if (coords.lat < -90 || coords.lat > 90) {
        return false;
    }

    if (coords.lng < -180 || coords.lng > 180) {
        return false;
    }

    return true;
}

/**
 * Format GPS coordinates for display
 */
export function formatGPSCoordinates(coords: GPSCoordinates): string {
    return `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
}

/**
 * Get location name from coordinates (mock - in production use reverse geocoding API)
 */
export function getLocationName(coords: GPSCoordinates): string {
    // In production, use Google Maps Geocoding API or similar
    return `Location (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`;
}
