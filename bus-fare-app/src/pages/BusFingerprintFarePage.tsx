import { FC, useState, useEffect, useRef } from 'react';
import { Bus, AlertCircle, Fingerprint, LayoutDashboard } from 'lucide-react';

// Components
import FingerprintActionCard from '../components/FingerprintActionCard';
import GPSStatusCard from '../components/GPSStatusCard';
import LiveMapCard from '../components/LiveMapCard';

// Services & Utils
import {
    verifyFingerprint,
    getUserById,
    deductWalletBalance,
    checkBackendStatus,
    checkScannerStatus
} from '../services/api';

import { sendLiveLocation } from '../services/locationService';

import {
    captureGPSLocation,
    calculateDistance,
    calculateFare,
    formatGPSCoordinates,
    requestLocationPermission,
    startRealTimeGPSTracking,
    stopGPSTracking,
    GPSCoordinates
} from '../utils/gps';

import {
    saveTripSession,
    getTripSession,
    clearTripSession,
    hasActiveTripSession,
    getAllTripSessions,
    subscribeToSessions,
    TripSession
} from '../utils/session';

// ==========================================
// TYPES
// ==========================================

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

const BusFingerprintFarePage: FC = () => {
    const [currentTab, setCurrentTab] = useState<'SCANNER' | 'DETAILS'>('SCANNER');

    // System Status
    const [backendOnline, setBackendOnline] = useState(false);
    const [scannerConnected, setScannerConnected] = useState(false);
    const [backendMessage, setBackendMessage] = useState('');
    const [scannerMessage, setScannerMessage] = useState('');

    // Trip State
    const [statusMessage, setStatusMessage] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Live Tracking & GPS
    const [isTracking, setIsTracking] = useState(false);
    const [liveLocation, setLiveLocation] = useState<GPSCoordinates | null>(null);
    const [gpsError, setGpsError] = useState<string | null>(null);
    const [busEntryLocation, setBusEntryLocation] = useState<GPSCoordinates | null>(null);

    // Active Sessions
    const [activeSessions, setActiveSessions] = useState<TripSession[]>([]);
    const [recentSummaries, setRecentSummaries] = useState<TripSummary[]>([]);

    // Quick Toast (for scanner)
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // Demo State
    const handleScanRef = useRef<(key?: string) => void>(() => {}); // always points to latest handleFingerprintScan

    // ==========================================
    // INITIALIZATION
    // ==========================================

    // Keep handleScanRef always up-to-date so keydown listener avoids stale closure
    useEffect(() => {
        handleScanRef.current = handleFingerprintScan;
    });

    useEffect(() => {
        checkSystemStatus();
        updateSessionsList();

        // Re-check every 30s so UI auto-updates when Render wakes from cold start
        const statusInterval = setInterval(() => {
            checkSystemStatus();
        }, 30000);

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                handleScanRef.current('Enter');
            } else if (e.key === '+' || e.key === '=') {
                handleScanRef.current('+');
            } else if (e.key === '9' || e.key === '6' || e.key === '3') {
                handleScanRef.current(e.key);
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        const unsubscribe = subscribeToSessions(() => {
            updateSessionsList();
        });

        // Cleanup tracking on unmount
        return () => {
            clearInterval(statusInterval);
            stopGPSTracking();
            window.removeEventListener('keydown', handleKeyDown);
            unsubscribe();
        };
    }, []);

    const updateSessionsList = () => {
        const sessionsObj = getAllTripSessions();
        const ongoing = Object.values(sessionsObj).filter(s => s.status === 'ONGOING');
        setActiveSessions(ongoing);

        // Manage global tracking - start if we have at least one active trip, stop if zero
        if (ongoing.length > 0 && !isTracking) {
             // Usually this is handled in the entry handler, but just in case we restore session:
             setTimeout(() => {
                 if (!isTracking) {
                     beginLiveTracking();
                     if (!busEntryLocation) {
                         setBusEntryLocation(ongoing[0].entryLocation);
                     }
                 }
             }, 0);
        } else if (ongoing.length === 0 && isTracking) {
             endLiveTracking();
             setBusEntryLocation(null);
        }
    };

    /**
     * Check backend and scanner connectivity
     */
    const checkSystemStatus = async () => {
        setBackendMessage('Connecting...');
        try {
            const backendStatus = await checkBackendStatus();
            setBackendOnline(backendStatus.online);
            setBackendMessage(backendStatus.message || '');

            const scannerStatus = await checkScannerStatus();
            setScannerConnected(scannerStatus.connected);
            setScannerMessage(scannerStatus.message || '');
        } catch (err) {
            console.error('System status check failed:', err);
            setBackendOnline(false);
            setBackendMessage('System Offline');
        }
    };

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
    };

    // ==========================================
    // REAL-TIME GPS TRACKING
    // ==========================================

    const beginLiveTracking = async () => {
        if (isTracking) return; // Already tracking the bus
        setGpsError(null);

        const permission = await requestLocationPermission();
        if (permission === 'denied') {
            setGpsError('Location access was denied.');
            return;
        }

        setIsTracking(true);
        startRealTimeGPSTracking(
            (coords: GPSCoordinates) => {
                setLiveLocation(coords);

                // For the demo, we continuously push the bus's location linked to the first active passenger
                const sessions = Object.values(getAllTripSessions()).filter(s => s.status === 'ONGOING');
                if (sessions.length > 0) {
                     sendLiveLocation({
                         userId: sessions[0].userId,
                         lat: coords.lat,
                         lng: coords.lng,
                         accuracy: coords.accuracy,
                         timestamp: coords.timestamp || Date.now(),
                         tripPhase: 'inTrip'
                     });
                }
            },
            (message: string) => {
                setGpsError(message);
                setIsTracking(false);
            }
        );
    };

    const endLiveTracking = () => {
        stopGPSTracking();
        setIsTracking(false);
        setLiveLocation(null);
        setGpsError(null);
    };

    // ==========================================
    // UNIVERSAL SCAN HANDLER
    // ==========================================

    const handleFingerprintScan = async (shortcutKey?: string) => {
        setIsScanning(true);
        setError(null);
        setStatusMessage('Scanning fingerprint...');

        try {
            // Determine which fingerprint to scan
            let fpToScan = 'FP_RANDOM';

            // 1. Check if we are in EXIT mode (shortcut '+')
            if (shortcutKey === '+') {
                const sessionsObj = getAllTripSessions();
                const ongoing = Object.values(sessionsObj).filter(s => s.status === 'ONGOING');
                ongoing.sort((a, b) => new Date(a.entryTime).getTime() - new Date(b.entryTime).getTime());
                
                if (ongoing.length === 0) {
                    throw new Error('No active trips to end');
                }

                fpToScan = ongoing[0].fingerprintId;
            } 
            // 2. Check for named shortcut key (9, 6, 3)
            else if (shortcutKey === '9' || shortcutKey === '6' || shortcutKey === '3') {
                const keyMap: Record<string, string> = {
                    '9': 'FP_TEST_001',
                    '6': 'FP_TEST_002',
                    '3': 'FP_TEST_003'
                };
                fpToScan = keyMap[shortcutKey] || 'FP_TEST_001';
            } 
            // 3. Check for anonymous scan (Enter)
            else if (shortcutKey === 'Enter') {
                fpToScan = 'FP_ANONYMOUS';
            } 
            // 4. Default to random scan
            else {
                fpToScan = 'FP_RANDOM';
            }

            // Verify
            const fingerprintResult = await verifyFingerprint(fpToScan);
            if (!fingerprintResult.success || !fingerprintResult.verified) {
                throw new Error('Fingerprint not recognized');
            }

            const userId = fingerprintResult.userId;

            // Check if this user is entering or exiting
            if (hasActiveTripSession(userId)) {
                await processExit(userId);
            } else {
                await processEntry(userId, fingerprintResult.fingerprintId);
            }

        } catch (err: any) {
            setError(err.message || 'Scan failed');
            triggerToast(`Error: ${err.message}`);
        } finally {
            setIsScanning(false);
            setStatusMessage('');
        }
    };

    const processEntry = async (userId: string, fpId: string) => {
        setStatusMessage('Loading passenger data...');
        const user = await getUserById(userId);

        if (user.status !== 'active') {
            throw new Error(`Account is blocked for ${user.name}.`);
        }

        const MINIMUM_FARE = 10;
        if (user.walletBalance < MINIMUM_FARE) {
            throw new Error(`Insufficient wallet balance for ${user.name}. Required: ₹${MINIMUM_FARE}.`);
        }

        setStatusMessage('Capturing location...');
        const gpsLocation = await captureGPSLocation();
        
        saveTripSession({
            userId: user._id,
            userName: user.name,
            fingerprintId: fpId,
            entryLocation: gpsLocation,
            entryTime: new Date().toISOString(),
            walletBalanceBefore: user.walletBalance,
            status: 'ONGOING'
        });

        if (!isTracking) {
             setBusEntryLocation(gpsLocation);
             await beginLiveTracking();
        }

        triggerToast(`🟢 Entry: ${user.name} boarded!`);
    };

    const processExit = async (userId: string) => {
        const session = getTripSession(userId);
        if (!session) throw new Error('Session data missing');

        setStatusMessage('Capturing exit location...');
        const exitGPS = await captureGPSLocation();

        setStatusMessage('Calculating fare...');
        const distance = calculateDistance(session.entryLocation, exitGPS);
        const fare = calculateFare(distance);

        const user = await getUserById(session.userId);

        if (user.walletBalance < fare) {
            // Demo fallback: Clear session anyway to prevent getting completely stuck
            clearTripSession(userId);
            throw new Error(`Insufficient exit balance for ${user.name}. Required: ₹${fare.toFixed(2)}`);
        }

        setStatusMessage('Processing payment...');
        const deductResult = await deductWalletBalance(session.userId, {
            amount: fare,
            description: `Bus fare: ${formatGPSCoordinates(session.entryLocation)} → ${formatGPSCoordinates(exitGPS)}`
        });

        const summary: TripSummary = {
            userName: session.userName,
            fromLocation: formatGPSCoordinates(session.entryLocation),
            toLocation: formatGPSCoordinates(exitGPS),
            distanceKm: distance,
            fareAmount: fare,
            walletBalanceBefore: session.walletBalanceBefore,
            walletBalanceAfter: deductResult.newBalance
        };

        // Prepend to recent summaries
        setRecentSummaries(prev => [summary, ...prev].slice(0, 5));
        clearTripSession(userId);

        triggerToast(`🔴 Exit: ${session.userName} completed trip.`);
    };

    // ==========================================
    // RENDER HELPERS
    // ==========================================

    const renderScannerView = () => (
        <div className="max-w-md mx-auto fade-in">
            {error && (
                <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 mb-6 flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="font-semibold text-red-800">Error</p>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                </div>
            )}

            <FingerprintActionCard
                mode="ENTRY"
                onScan={handleFingerprintScan}
                isScanning={isScanning}
                disabled={!backendOnline || !scannerConnected}
            />

            {statusMessage && (
                <div className="text-center mt-4 mb-2">
                    <p className="text-blue-600 font-medium animate-pulse">{statusMessage}</p>
                </div>
            )}

            {showToast && (
                <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl z-50 animate-bounce">
                    <p className="font-semibold text-center">{toastMessage}</p>
                </div>
            )}
            
            <div className="text-center mt-6">
                 <p className="text-sm text-gray-500">
                     Active Bus Passengers: <span className="font-bold text-blue-600">{activeSessions.length}</span>
                 </p>
            </div>

        </div>
    );

    const renderDetailsView = () => (
        <div className="gap-6 grid grid-cols-1 lg:grid-cols-2 fade-in">
            {/* Left Column: Live Map & Status */}
            <div className="space-y-6">
                <GPSStatusCard
                    entryLocation={busEntryLocation}
                    exitLocation={null} // Bus is moving
                    isCapturing={false}
                    show={true}
                    gpsError={gpsError}
                    isTracking={isTracking}
                />
                
                <LiveMapCard
                    liveLocation={liveLocation}
                    entryLocation={busEntryLocation}
                    show={isTracking}
                />
            </div>

            {/* Right Column: Active Users & Recent Summaries */}
            <div className="space-y-6">
                
                {/* Active Passengers Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-xl font-bold border-b pb-3 mb-4 flex items-center gap-2 text-gray-800">
                        <Fingerprint className="text-blue-500" /> Active Passengers
                    </h3>
                    
                    {activeSessions.length === 0 ? (
                        <p className="text-gray-500 italic text-center py-4">No active passengers on board.</p>
                    ) : (
                        <ul className="space-y-3">
                            {activeSessions.map(session => (
                                <li key={session.userId} className="p-3 bg-blue-50 rounded-lg flex justify-between items-center border border-blue-100">
                                    <div>
                                        <p className="font-semibold text-gray-800">{session.userName}</p>
                                        <p className="text-xs text-gray-500">Boarded: {new Date(session.entryTime).toLocaleTimeString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-blue-800">Traveling</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Recent Summaries */}
                {recentSummaries.length > 0 && (
                     <div className="bg-white rounded-2xl shadow-lg p-6">
                         <h3 className="text-xl font-bold border-b pb-3 mb-4 text-gray-800">Recent Completed Trips</h3>
                         <div className="space-y-4">
                             {recentSummaries.map((summary, idx) => (
                                 <div key={idx} className="bg-green-50 rounded-lg p-4 border border-green-100">
                                     <div className="flex justify-between items-start mb-2">
                                         <p className="font-bold text-gray-900">{summary.userName}</p>
                                     </div>
                                     <p className="text-sm text-gray-600">{summary.distanceKm.toFixed(2)} km traveled</p>
                                 </div>
                             ))}
                         </div>
                     </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Header & Nav */}
            <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 md:py-6 lg:flex lg:items-center lg:justify-between">
                    <div className="flex items-center gap-3 mb-4 lg:mb-0">
                        <Bus className="w-8 h-8 md:w-10 md:h-10 text-blue-200" />
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Bus Fare System</h1>
                            <p className="text-blue-100 hidden md:block opacity-80 text-sm">Entry/Exit Scanner & Tracking Dashboard</p>
                        </div>
                    </div>

                    <div className="flex bg-blue-700/50 p-1 rounded-xl shadow-inner overflow-hidden">
                        <button 
                            onClick={() => setCurrentTab('SCANNER')}
                            className={`flex flex-1 items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${
                                currentTab === 'SCANNER' ? 'bg-white text-blue-700 shadow-md scale-100' : 'text-blue-100 hover:text-white hover:bg-blue-600/50 scale-95 opacity-80'
                            }`}
                        >
                            <Fingerprint className="w-5 h-5" /> Scanner View
                        </button>
                        <button 
                            onClick={() => setCurrentTab('DETAILS')}
                            className={`flex flex-1 items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${
                                currentTab === 'DETAILS' ? 'bg-white text-blue-700 shadow-md scale-100' : 'text-blue-100 hover:text-white hover:bg-blue-600/50 scale-95 opacity-80'
                            }`}
                        >
                            <LayoutDashboard className="w-5 h-5" /> Details View
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8 max-w-6xl">
                 {currentTab === 'SCANNER' ? renderScannerView() : renderDetailsView()}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-6 mt-12">
                <div className="container mx-auto px-4 text-center text-gray-500 text-sm font-medium">
                    <div className="flex justify-center items-center gap-6 mb-4 text-xs">
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></span>
                            <span>Backend Server: {backendMessage || 'Checking...'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${scannerConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></span>
                            <span>Fingerprint Scanner: {scannerMessage || 'Checking...'}</span>
                        </div>
                    </div>
                    <p>© 2026 Bus Fingerprint Fare System | Powered by Precision Biometric RDMS</p>
                </div>
            </footer>
        </div>
    );
};

export default BusFingerprintFarePage;
