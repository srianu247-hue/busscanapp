/**
 * BusFingerprintFarePage.tsx
 * 
 * Bus-side fingerprint fare deduction system
 * Handles entry/exit scanning, GPS tracking, and automatic fare calculation
 * 
 * Flow:
 * 1. Entry scan → Capture GPS → Save session
 * 2. Exit scan → Capture GPS → Calculate distance & fare → Deduct wallet
 * 3. Display trip summary
 */

import React, { useState, useEffect } from 'react';
import { Bus, AlertCircle } from 'lucide-react';

// Components
import SystemStatusCard from '../components/SystemStatusCard';
import FingerprintActionCard from '../components/FingerprintActionCard';
import UserInfoCard from '../components/UserInfoCard';
import GPSStatusCard from '../components/GPSStatusCard';
import FareSummaryCard from '../components/FareSummaryCard';
import TripStatusBadge from '../components/TripStatusBadge';

// Services & Utils
import {
    verifyFingerprint,
    getUserById,
    deductWalletBalance,
    checkBackendStatus,
    checkScannerStatus,
    User
} from '../services/api';

import {
    captureGPSLocation,
    calculateDistance,
    calculateFare,
    formatGPSCoordinates,
    GPSCoordinates
} from '../utils/gps';

import {
    saveTripSession,
    getTripSession,
    clearTripSession,
    hasActiveTripSession,
    validateExitScan
} from '../utils/session';

// ==========================================
// TYPES
// ==========================================

type TripStatus = 'IDLE' | 'ONGOING' | 'COMPLETED' | 'ERROR';

interface TripSummary {
    userName: string;
    fromLocation: string;
    toLocation: string;
    distanceKm: number;
    fareAmount: number;
    walletBalanceBefore: number;
    walletBalanceAfter: number;
}

// ==========================================
// MAIN COMPONENT
// ==========================================

const BusFingerprintFarePage: React.FC = () => {
    // System Status
    const [backendOnline, setBackendOnline] = useState(false);
    const [scannerConnected, setScannerConnected] = useState(false);
    const [backendMessage, setBackendMessage] = useState('');
    const [scannerMessage, setScannerMessage] = useState('');

    // Trip State
    const [tripStatus, setTripStatus] = useState<TripStatus>('IDLE');
    const [statusMessage, setStatusMessage] = useState('');

    // User Data
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    // GPS Data
    const [entryLocation, setEntryLocation] = useState<GPSCoordinates | null>(null);
    const [exitLocation, setExitLocation] = useState<GPSCoordinates | null>(null);
    const [isCapturingGPS, setIsCapturingGPS] = useState(false);

    // Trip Summary
    const [tripSummary, setTripSummary] = useState<TripSummary | null>(null);

    // Loading States
    const [isScanning, setIsScanning] = useState(false);

    // Error State
    const [error, setError] = useState<string | null>(null);

    // ==========================================
    // INITIALIZATION
    // ==========================================

    useEffect(() => {
        checkSystemStatus();
        restoreSession();
    }, []);

    /**
     * Check backend and scanner connectivity
     */
    const checkSystemStatus = async () => {
        try {
            const backendStatus = await checkBackendStatus();
            setBackendOnline(backendStatus.online);
            setBackendMessage(backendStatus.message || '');

            const scannerStatus = await checkScannerStatus();
            setScannerConnected(scannerStatus.connected);
            setScannerMessage(scannerStatus.message || '');
        } catch (err) {
            console.error('System status check failed:', err);
        }
    };

    /**
     * Restore active session if exists
     */
    const restoreSession = () => {
        if (hasActiveTripSession()) {
            const session = getTripSession();
            if (session) {
                setTripStatus('ONGOING');
                setEntryLocation(session.entryLocation);
                setStatusMessage(`Trip in progress for ${session.userName}`);

                // Restore user data
                getUserById(session.userId)
                    .then(setCurrentUser)
                    .catch(console.error);
            }
        }
    };

    // ==========================================
    // ENTRY SCAN HANDLER
    // ==========================================

    const handleEntryScan = async () => {
        setIsScanning(true);
        setError(null);

        try {
            // Step 1: Verify fingerprint
            setStatusMessage('Scanning fingerprint...');
            const fingerprintResult = await verifyFingerprint();

            if (!fingerprintResult.success || !fingerprintResult.verified) {
                throw new Error('Fingerprint not recognized');
            }

            // Step 2: Fetch user data
            setStatusMessage('Loading passenger data...');
            const user = await getUserById(fingerprintResult.userId);
            setCurrentUser(user);

            // Step 3: Validate user
            if (user.status !== 'active') {
                throw new Error('Account is blocked. Please contact support.');
            }

            if (user.walletBalance <= 0) {
                throw new Error('Insufficient wallet balance. Please recharge.');
            }

            // Step 4: Capture GPS location
            setStatusMessage('Capturing entry location...');
            setIsCapturingGPS(true);
            const gpsLocation = await captureGPSLocation();
            setEntryLocation(gpsLocation);
            setIsCapturingGPS(false);

            // Step 5: Save session
            saveTripSession({
                userId: user._id,
                userName: user.name,
                fingerprintId: fingerprintResult.fingerprintId,
                entryLocation: gpsLocation,
                entryTime: new Date().toISOString(),
                walletBalanceBefore: user.walletBalance,
                status: 'ONGOING'
            });

            // Step 6: Update UI
            setTripStatus('ONGOING');
            setStatusMessage(`Welcome aboard, ${user.name}!`);

        } catch (err: any) {
            setError(err.message || 'Entry scan failed');
            setTripStatus('ERROR');
            setStatusMessage(err.message || 'Entry scan failed');
        } finally {
            setIsScanning(false);
        }
    };

    // ==========================================
    // EXIT SCAN HANDLER
    // ==========================================

    const handleExitScan = async () => {
        setIsScanning(true);
        setError(null);

        try {
            // Step 1: Verify fingerprint
            setStatusMessage('Scanning fingerprint...');
            const fingerprintResult = await verifyFingerprint();

            if (!fingerprintResult.success || !fingerprintResult.verified) {
                throw new Error('Fingerprint not recognized');
            }

            // Step 2: Validate same user
            validateExitScan(fingerprintResult.userId);

            // Step 3: Get session data
            const session = getTripSession();
            if (!session) {
                throw new Error('No active trip found');
            }

            // Step 4: Capture exit GPS
            setStatusMessage('Capturing exit location...');
            setIsCapturingGPS(true);
            const exitGPS = await captureGPSLocation();
            setExitLocation(exitGPS);
            setIsCapturingGPS(false);

            // Step 5: Calculate distance and fare
            setStatusMessage('Calculating fare...');
            const distance = calculateDistance(session.entryLocation, exitGPS);
            const fare = calculateFare(distance);

            // Step 6: Fetch latest user data
            const user = await getUserById(session.userId);

            // Step 7: Validate wallet balance
            if (user.walletBalance < fare) {
                throw new Error(`Insufficient balance. Required: ₹${fare.toFixed(2)}, Available: ₹${user.walletBalance.toFixed(2)}`);
            }

            // Step 8: Deduct fare
            setStatusMessage('Processing payment...');
            const deductResult = await deductWalletBalance(session.userId, {
                amount: fare,
                description: `Bus fare: ${formatGPSCoordinates(session.entryLocation)} → ${formatGPSCoordinates(exitGPS)}`
            });

            // Step 9: Prepare trip summary
            const summary: TripSummary = {
                userName: session.userName,
                fromLocation: formatGPSCoordinates(session.entryLocation),
                toLocation: formatGPSCoordinates(exitGPS),
                distanceKm: distance,
                fareAmount: fare,
                walletBalanceBefore: session.walletBalanceBefore,
                walletBalanceAfter: deductResult.newBalance
            };

            setTripSummary(summary);

            // Step 10: Update status
            setTripStatus('COMPLETED');
            setStatusMessage('Journey completed successfully!');

            // Step 11: Clear session
            clearTripSession();

        } catch (err: any) {
            setError(err.message || 'Exit scan failed');
            setTripStatus('ERROR');
            setStatusMessage(err.message || 'Exit scan failed');
        } finally {
            setIsScanning(false);
        }
    };

    // ==========================================
    // RESET HANDLER
    // ==========================================

    const handleReset = () => {
        setTripStatus('IDLE');
        setStatusMessage('');
        setCurrentUser(null);
        setEntryLocation(null);
        setExitLocation(null);
        setTripSummary(null);
        setError(null);
        clearTripSession();
    };

    // ==========================================
    // RENDER
    // ==========================================

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-6 shadow-lg">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-3">
                        <Bus className="w-10 h-10" />
                        <div>
                            <h1 className="text-3xl font-bold">Bus Fare System</h1>
                            <p className="text-blue-100">Entry/Exit Scanner - Fingerprint Based</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8 max-w-4xl">
                {/* System Status */}
                <SystemStatusCard
                    backendOnline={backendOnline}
                    scannerConnected={scannerConnected}
                    backendMessage={backendMessage}
                    scannerMessage={scannerMessage}
                />

                {/* Trip Status Badge */}
                <TripStatusBadge status={tripStatus} message={statusMessage} />

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 mb-6 flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="font-semibold text-red-800">Error</p>
                            <p className="text-sm text-red-700 mt-1">{error}</p>
                        </div>
                    </div>
                )}

                {/* Fingerprint Action Card */}
                {tripStatus !== 'COMPLETED' && (
                    <FingerprintActionCard
                        mode={tripStatus === 'ONGOING' ? 'EXIT' : 'ENTRY'}
                        onScan={tripStatus === 'ONGOING' ? handleExitScan : handleEntryScan}
                        isScanning={isScanning}
                        disabled={!backendOnline || !scannerConnected}
                    />
                )}

                {/* User Info Card */}
                <UserInfoCard
                    user={currentUser}
                    show={tripStatus === 'ONGOING' || tripStatus === 'COMPLETED'}
                />

                {/* GPS Status Card */}
                <GPSStatusCard
                    entryLocation={entryLocation}
                    exitLocation={exitLocation}
                    isCapturing={isCapturingGPS}
                    show={tripStatus === 'ONGOING' || tripStatus === 'COMPLETED'}
                />

                {/* Fare Summary Card */}
                {tripSummary && (
                    <FareSummaryCard
                        userName={tripSummary.userName}
                        fromLocation={tripSummary.fromLocation}
                        toLocation={tripSummary.toLocation}
                        distanceKm={tripSummary.distanceKm}
                        fareAmount={tripSummary.fareAmount}
                        walletBalanceBefore={tripSummary.walletBalanceBefore}
                        walletBalanceAfter={tripSummary.walletBalanceAfter}
                        show={tripStatus === 'COMPLETED'}
                    />
                )}

                {/* Reset Button */}
                {tripStatus === 'COMPLETED' && (
                    <button
                        onClick={handleReset}
                        className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                        Start New Trip
                    </button>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-4 mt-12">
                <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
                    <p>© 2026 Bus Fingerprint Fare System | Powered by Precision Biometric RDMS</p>
                </div>
            </footer>
        </div>
    );
};

export default BusFingerprintFarePage;
