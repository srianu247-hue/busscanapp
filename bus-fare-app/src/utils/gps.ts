/**
 * GPS and Distance Calculation Utilities
 * Haversine formula for distance calculation
 */

export interface GPSCoordinates {
    lat: number;
    lng: number;
    accuracy?: number;
    timestamp?: number;
}

// ==========================================
// GPS CAPTURE
// ==========================================

/**
 * Capture current GPS location using Browser Geolocation API
 * Returns Promise with coordinates or throws error
 */
export function captureGPSLocation(): Promise<GPSCoordinates> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported by this browser'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: position.timestamp
                });
            },
            (error) => {
                let errorMessage = 'GPS capture failed';

                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'GPS permission denied';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'GPS position unavailable';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'GPS request timeout';
                        break;
                }

                reject(new Error(errorMessage));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
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
