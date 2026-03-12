/// <reference types="vite/client" />

/**
 * API Service for Bus Fingerprint Fare System
 * Connects to existing backend APIs
 */

const API_BASE_URL = (import.meta.env && import.meta.env.VITE_API_BASE_URL) || '/api';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export interface FingerprintVerifyResponse {
    success: boolean;
    userId: string;
    fingerprintId: string;
    verified: boolean;
    message?: string;
}

export interface User {
    _id: string;
    name: string;
    email: string;
    phone: string;
    walletBalance: number;
    status: 'active' | 'blocked';
    fingerprintId?: string;
}

export interface WalletDeductRequest {
    amount: number;
    tripId?: string;
    description?: string;
}

export interface WalletDeductResponse {
    success: boolean;
    newBalance: number;
    transactionId: string;
    message?: string;
}

export interface TripData {
    userId: string;
    userName: string;
    entryLocation: {
        lat: number;
        lng: number;
    };
    exitLocation: {
        lat: number;
        lng: number;
    };
    entryTime: string;
    exitTime: string;
    distanceKm: number;
    fareAmount: number;
    walletBalanceBefore: number;
    walletBalanceAfter: number;
}

// ==========================================
// API HELPER FUNCTION
// ==========================================

async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    const config: RequestInit = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error);
        throw error;
    }
}

// ==========================================
// FINGERPRINT API
// ==========================================

/**
 * Verify fingerprint and get user identification
 * POST /api/fingerprint/verify
 */
export async function verifyFingerprint(fingerprintId?: string): Promise<FingerprintVerifyResponse> {
    return apiRequest('/fingerprint/verify', {
        method: 'POST',
        body: JSON.stringify({ fingerprintId: fingerprintId || 'FP_TEST_001' })
    });
}

/**
 * Capture fingerprint (for entry/exit scanning)
 * POST /api/fingerprint/capture
 */
export async function captureFingerprint(): Promise<{ success: boolean; fingerprintData: string }> {
    return apiRequest('/fingerprint/capture', {
        method: 'POST',
        body: JSON.stringify({
            action: 'capture',
            timestamp: new Date().toISOString()
        })
    });
}

// ==========================================
// USER API
// ==========================================

/**
 * Get user details by ID
 * GET /api/users/:userId
 */
export async function getUserById(userId: string): Promise<User> {
    return apiRequest(`/users/${userId}`);
}

/**
 * Deduct amount from user wallet
 * POST /api/users/:userId/deduct
 */
export async function deductWalletBalance(
    userId: string,
    deductData: WalletDeductRequest
): Promise<WalletDeductResponse> {
    return apiRequest(`/users/${userId}/deduct`, {
        method: 'POST',
        body: JSON.stringify(deductData)
    });
}

// ==========================================
// TRIP API (Optional - if backend supports)
// ==========================================

/**
 * Save trip data to backend
 * POST /api/trips
 */
export async function saveTripData(tripData: TripData): Promise<{ success: boolean; tripId: string }> {
    return apiRequest('/trips', {
        method: 'POST',
        body: JSON.stringify(tripData)
    });
}

/**
 * Top up user's wallet balance (for testing / recharge flow)
 * POST /api/users/:userId/credit
 */
export async function topUpWallet(
    userId: string,
    amount: number
): Promise<{ success: boolean; newBalance: number; message?: string }> {
    return apiRequest(`/users/${userId}/credit`, {
        method: 'POST',
        body: JSON.stringify({ amount, description: 'Wallet top-up' })
    });
}


// ==========================================
// SYSTEM STATUS CHECK
// ==========================================

/**
 * Check backend connectivity
 * GET /api/health or /api/status
 */
export async function checkBackendStatus(): Promise<{ online: boolean; message?: string }> {
    try {
        await apiRequest('/health');
        return { online: true, message: 'System Online' };
    } catch {
        return { online: false, message: 'System Offline' };
    }
}

/**
 * Check fingerprint scanner connectivity
 * This would typically call a local RDMS service endpoint
 */
export async function checkScannerStatus(): Promise<{ connected: boolean; message?: string }> {
    // For Demo: bypass actual RDMS localhost check and force true
    return { connected: true, message: 'Scanner ready' };
}
