/**
 * Session Storage Utilities for Trip State Management
 * Stores temporary trip data during entry-exit flow for multiple users
 */

import { GPSCoordinates } from './gps';

export interface TripSession {
    userId: string;
    userName: string;
    fingerprintId: string;
    entryLocation: GPSCoordinates;
    exitLocation?: GPSCoordinates;
    entryTime: string;
    walletBalanceBefore: number;
    status: 'ONGOING' | 'COMPLETED' | 'CANCELLED';
    distanceKm?: number;
    fareAmount?: number;
    walletBalanceAfter?: number;
}

const TRIP_SESSIONS_KEY = 'bus_trip_sessions_multiple_v1';
const EVENT_NAME = 'bus_sessions_updated';

// ==========================================
// SESSION STORAGE OPERATIONS
// ==========================================

export function getAllTripSessions(): Record<string, TripSession> {
    try {
        const data = sessionStorage.getItem(TRIP_SESSIONS_KEY);
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.error('Failed to retrieve trip sessions:', error);
        return {};
    }
}

export function saveTripSession(tripData: TripSession): void {
    try {
        const sessions = getAllTripSessions();
        sessions[tripData.userId] = tripData;
        sessionStorage.setItem(TRIP_SESSIONS_KEY, JSON.stringify(sessions));
        window.dispatchEvent(new Event(EVENT_NAME));
    } catch (error) {
        console.error('Failed to save trip session:', error);
        throw new Error('Failed to save trip data');
    }
}

export function getTripSession(userId: string): TripSession | null {
    const sessions = getAllTripSessions();
    return sessions[userId] || null;
}

export function clearTripSession(userId: string): void {
    try {
        const sessions = getAllTripSessions();
        delete sessions[userId];
        sessionStorage.setItem(TRIP_SESSIONS_KEY, JSON.stringify(sessions));
        window.dispatchEvent(new Event(EVENT_NAME));
    } catch (error) {
        console.error('Failed to clear trip session:', error);
    }
}

export function hasActiveTripSession(userId: string): boolean {
    const session = getTripSession(userId);
    return session !== null && session.status === 'ONGOING';
}

export function updateTripSessionStatus(userId: string, status: TripSession['status']): void {
    const session = getTripSession(userId);
    if (session) {
        session.status = status;
        saveTripSession(session);
    }
}

// Subscriptions
export function subscribeToSessions(callback: () => void): () => void {
    window.addEventListener(EVENT_NAME, callback);
    return () => window.removeEventListener(EVENT_NAME, callback);
}
