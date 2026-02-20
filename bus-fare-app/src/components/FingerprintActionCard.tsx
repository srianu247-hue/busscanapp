import React, { useState, useEffect, useRef } from 'react';
import { Fingerprint, Loader2, CheckCircle2, Bus } from 'lucide-react';

interface FingerprintActionCardProps {
    mode: 'ENTRY' | 'EXIT';
    onScan: () => void;
    isScanning: boolean;
    disabled: boolean;
}

const FingerprintActionCard: React.FC<FingerprintActionCardProps> = ({
    mode,
    onScan,
    isScanning: parentIsScanning,
    disabled
}) => {
    const isEntry = mode === 'ENTRY';

    // Configurable durations
    const HOLD_DURATION = isEntry ? 5000 : 3000;

    // Internal states
    const [scanState, setScanState] = useState<'idle' | 'holding' | 'success'>('idle');
    const [progress, setProgress] = useState(0);
    const [showPopup, setShowPopup] = useState(false);

    // Refs for tracking animation timing accurately
    const requestRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);

    // Reset state on mode change
    useEffect(() => {
        setScanState('idle');
        setProgress(0);
        setShowPopup(false);
        cancelHold();
    }, [mode]);

    const animateProgress = (timestamp: number) => {
        if (startTimeRef.current === null) startTimeRef.current = timestamp;

        const elapsed = timestamp - startTimeRef.current;
        const newProgress = Math.min((elapsed / HOLD_DURATION) * 100, 100);

        setProgress(newProgress);

        if (elapsed < HOLD_DURATION) {
            requestRef.current = requestAnimationFrame(animateProgress);
        } else {
            // Successfully held for the full duration
            completeScan();
        }
    };

    const handleHoldStart = () => {
        if (disabled || parentIsScanning || scanState !== 'idle') return;
        setScanState('holding');
        setProgress(0);
        startTimeRef.current = null;
        requestRef.current = requestAnimationFrame(animateProgress);
    };

    const handleHoldEnd = () => {
        // If they released early before success state
        if (scanState === 'holding') {
            cancelHold();
        }
    };

    const cancelHold = () => {
        if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
        }
        setScanState('idle');
        setProgress(0);
    };

    const completeScan = () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);

        setScanState('success');
        setProgress(100);
        setShowPopup(true);

        // Hide pop-up, reset to idle, and trigger API flow after small delay
        setTimeout(() => {
            setShowPopup(false);
            setScanState('idle');
            setProgress(0);
            onScan();
        }, 3000);
    };

    // Clean up animation frames
    useEffect(() => {
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);


    // SVG Math for progress circle
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 relative overflow-hidden">

            {/* Pop-up Notification (Absolute Overlay) */}
            {showPopup && (
                <div className="absolute top-4 left-0 w-full flex justify-center z-50 animate-fadeIn">
                    <div className="bg-green-600 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3 font-semibold tracking-wide">
                        <CheckCircle2 className="w-5 h-5" />
                        {isEntry ? 'Trip has started successfully!' : 'Trip ended successfully!'}
                    </div>
                </div>
            )}

            <div className="text-center relative pt-4">

                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {isEntry ? 'Passenger Entry' : 'Passenger Exit'}
                </h2>
                <p className="text-gray-500 mb-10 text-sm max-w-[250px] mx-auto">
                    {isEntry
                        ? 'Press and hold the fingerprint icon to start the trip'
                        : 'Press and hold the fingerprint icon to end the trip'
                    }
                </p>

                {/* Main Interactive Fingerprint Node */}
                <div className="flex justify-center mb-8">
                    <div
                        className={`relative inline-flex items-center justify-center w-40 h-40 transition-transform duration-300 ${(disabled || parentIsScanning) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'
                            }`}
                        onMouseDown={handleHoldStart}
                        onMouseUp={handleHoldEnd}
                        onMouseLeave={handleHoldEnd}
                        onTouchStart={handleHoldStart}
                        onTouchEnd={handleHoldEnd}
                        style={{ WebkitTapHighlightColor: 'transparent' }} // Remove mobile tap highlight
                    >

                        {/* Background Pulsing Halo indicating interactivity */}
                        {scanState === 'idle' && !disabled && !parentIsScanning && (
                            <div className={`absolute inset-0 rounded-full animate-pulse opacity-20 ${isEntry ? 'bg-blue-400' : 'bg-green-400'}`}></div>
                        )}

                        {/* Holding Background Ping Overlay */}
                        {scanState === 'holding' && (
                            <div className={`absolute inset-0 rounded-full animate-ping opacity-30 ${isEntry ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                        )}

                        {/* Progress Ring (visible while holding or success) */}
                        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                            {/* Track */}
                            <circle
                                cx="80"
                                cy="80"
                                r={radius}
                                stroke="currentColor"
                                strokeWidth="6"
                                fill="transparent"
                                className="text-gray-100"
                            />
                            {/* Progress Fill */}
                            <circle
                                cx="80"
                                cy="80"
                                r={radius}
                                stroke="currentColor"
                                strokeWidth="6"
                                fill="transparent"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                className={`${isEntry ? 'text-blue-500' : 'text-green-500'} transition-[stroke-dashoffset] duration-75`}
                            />
                        </svg>

                        {/* Center Icon Background */}
                        <div className={`
                            inline-flex items-center justify-center w-24 h-24 rounded-full bg-white shadow-md relative z-10 transition-colors duration-300
                            ${scanState === 'success' ? 'bg-green-50' : ''}
                        `}>
                            {scanState === 'success' ? (
                                <CheckCircle2 className="w-12 h-12 text-green-600 animate-in zoom-in" />
                            ) : (
                                <Fingerprint className={`
                                    w-12 h-12 transition-colors duration-300
                                    ${disabled || parentIsScanning ? 'text-gray-400' :
                                        scanState === 'holding'
                                            ? (isEntry ? 'text-blue-600 drop-shadow-[0_0_8px_rgba(37,99,235,0.8)]' : 'text-green-600 drop-shadow-[0_0_8px_rgba(22,163,74,0.8)]')
                                            : (isEntry ? 'text-blue-500' : 'text-green-500')
                                    }
                                 `} />
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Status Status Text */}
                <div className="h-12 flex items-center justify-center">
                    {parentIsScanning ? (
                        <div className="flex items-center gap-2 text-gray-600 font-medium">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing transaction...
                        </div>
                    ) : scanState === 'holding' ? (
                        <div className={`font-medium ${isEntry ? 'text-blue-600' : 'text-green-600'} animate-pulse`}>
                            Keep holding... ({Math.round(progress)}%)
                        </div>
                    ) : scanState === 'success' ? (
                        <div className="font-medium text-green-600 flex items-center gap-2">
                            <Bus className="w-5 h-5 animate-bounce" /> Processing completion...
                        </div>
                    ) : (
                        <div className="text-gray-400 text-sm font-medium">
                            Scanner Ready
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FingerprintActionCard;
