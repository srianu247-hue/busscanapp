/**
 * locationService.ts
 *
 * Handles sending real-time GPS location updates to the backend.
 * Called continuously during an active trip after fingerprint verification.
 */

const API_BASE_URL = (import.meta.env && import.meta.env.VITE_API_BASE_URL) || '/api';

export interface LiveLocationPayload {
    userId: string;
    lat: number;
    lng: number;
    accuracy?: number;
    timestamp: number;
    tripPhase: 'entry' | 'inTrip' | 'exit';
}

/**
 * Send a single live location update to the backend.
 * POST /api/trips/location
 *
 * Non-critical: errors are logged but not thrown so tracking keeps running.
 */
export async function sendLiveLocation(payload: LiveLocationPayload): Promise<void> {
    try {
        const response = await fetch(`${API_BASE_URL}/trips/location`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.warn(`Live location update failed (HTTP ${response.status})`);
        }
    } catch (err) {
        // Network error – silent fail to keep the tracking loop running
        console.warn('Live location send error (non-critical):', err);
    }
}
