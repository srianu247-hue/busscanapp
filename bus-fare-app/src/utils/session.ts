/**
 * Session Storage Utilities for Trip State Management
 * Stores temporary trip data during entry-exit flow
 */

import { GPSCoordinates } from './gps';

export interface TripSession {
    userId: string;
    userName: string;
    fingerprintId: string;
    entryLocation: GPSCoordinates;
    entryTime: string;
    walletBalanceBefore: number;
    status: 'ONGOING' | 'COMPLETED' | 'CANCELLED';
}

const TRIP_SESSION_KEY = 'bus_trip_session';

// ==========================================
// SESSION STORAGE OPERATIONS
// ==========================================

/**
 * Save trip session to sessionStorage
 */
export function saveTripSession(tripData: TripSession): void {
    try {
        sessionStorage.setItem(TRIP_SESSION_KEY, JSON.stringify(tripData));
    } catch (error) {
        console.error('Failed to save trip session:', error);
        throw new Error('Failed to save trip data');
    }
}

/**
 * Get current trip session from sessionStorage
 */
export function getTripSession(): TripSession | null {
    try {
        const data = sessionStorage.getItem(TRIP_SESSION_KEY);
        if (!data) return null;

        return JSON.parse(data) as TripSession;
    } catch (error) {
        console.error('Failed to retrieve trip session:', error);
        return null;
    }
}

/**
 * Clear trip session from sessionStorage
 */
export function clearTripSession(): void {
    try {
        sessionStorage.removeItem(TRIP_SESSION_KEY);
    } catch (error) {
        console.error('Failed to clear trip session:', error);
    }
}

/**
 * Check if there's an active trip session
 */
export function hasActiveTripSession(): boolean {
    const session = getTripSession();
    return session !== null && session.status === 'ONGOING';
}

/**
 * Update trip session status
 */
export function updateTripSessionStatus(status: TripSession['status']): void {
    const session = getTripSession();
    if (session) {
        session.status = status;
        saveTripSession(session);
    }
}

// ==========================================
// VALIDATION
// ==========================================

/**
 * Validate if exit scan matches entry scan user
 */
export function validateExitScan(exitUserId: string): boolean {
    const session = getTripSession();

    if (!session) {
        throw new Error('No active trip session found');
    }

    if (session.userId !== exitUserId) {
        throw new Error('Exit scan user does not match entry scan user');
    }

    return true;
}
