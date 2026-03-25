import { FC, useState, useEffect } from 'react';
import { Fingerprint, Loader2, CheckCircle2 } from 'lucide-react';

interface FingerprintActionCardProps {
    mode: 'ENTRY' | 'EXIT';
    onScan: (shortcut?: string) => void;
    isScanning: boolean;
    disabled: boolean;
}

const FingerprintActionCard: FC<FingerprintActionCardProps> = ({
    mode,
    onScan,
    isScanning: parentIsScanning,
    disabled
}) => {
    const isEntry = mode === 'ENTRY';

    // Internal states
    const [scanState, setScanState] = useState<'idle' | 'success'>('idle');
    const [showPopup, setShowPopup] = useState(false);

    // Reset state on mode change
    useEffect(() => {
        setScanState('idle');
        setShowPopup(false);
    }, [mode]);

    const handleOneClickScan = (shortcut?: string) => {
        if (disabled || parentIsScanning || scanState !== 'idle') return;
        
        setScanState('success');
        setShowPopup(true);

        // Hide pop-up, reset to idle, and trigger API flow after small delay
        setTimeout(() => {
            setShowPopup(false);
            setScanState('idle');
            // We pass the shortcut key if it exists, but the existing onScan prop 
            // doesn't support it yet. I will update the parent to handle it.
            // For now, I'll just trigger the scan. If I need the shortcut, 
            // I'll need to update the prop signature.
            // Actually, I'll update the prop signature in FingerprintActionCardProps.
            (onScan as any)(shortcut);
        }, 800);
    };

    // SVG Math for progress circle (still useful for success state)
    const radius = 60;
    const circumference = 2 * Math.PI * radius;

    return (
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 relative overflow-hidden">

            {/* Pop-up Notification (Absolute Overlay) */}
            {showPopup && (
                <div className="absolute top-4 left-0 w-full flex justify-center z-50 animate-fadeIn">
                    <div className="bg-green-600 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3 font-semibold tracking-wide">
                        <CheckCircle2 className="w-5 h-5" />
                        Capture successful!
                    </div>
                </div>
            )}

            <div className="text-center relative pt-4">

                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {isEntry ? 'Passenger Entry' : 'Passenger Exit'}
                </h2>
                <p className="text-gray-500 mb-6 text-sm max-w-[250px] mx-auto">
                    {isEntry
                        ? 'Click the fingerprint icon to simulate entry'
                        : 'Click the fingerprint icon to simulate exit'
                    }
                </p>

                {/* Main Interactive Fingerprint Node */}
                <div className="flex justify-center mb-6">
                    <div
                        className={`relative inline-flex items-center justify-center w-40 h-40 transition-transform duration-300 ${(disabled || parentIsScanning) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110 active:scale-90'
                            }`}
                        onClick={() => handleOneClickScan()}
                        style={{ WebkitTapHighlightColor: 'transparent' }} // Remove mobile tap highlight
                    >

                        {/* Background Pulsing Halo indicating interactivity */}
                        {scanState === 'idle' && !disabled && !parentIsScanning && (
                            <div className={`absolute inset-0 rounded-full animate-pulse opacity-20 ${isEntry ? 'bg-blue-400' : 'bg-green-400'}`}></div>
                        )}

                        {/* Success Background Ping */}
                        {scanState === 'success' && (
                            <div className={`absolute inset-0 rounded-full animate-ping opacity-30 ${isEntry ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                        )}

                        {/* Static Circle Trace */}
                        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                            <circle
                                cx="80"
                                cy="80"
                                r={radius}
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="transparent"
                                className="text-gray-100"
                            />
                            {/* Completion Fill */}
                            <circle
                                cx="80"
                                cy="80"
                                r={radius}
                                stroke="currentColor"
                                strokeWidth="6"
                                fill="transparent"
                                strokeDasharray={circumference}
                                strokeDashoffset={scanState === 'success' ? 0 : circumference}
                                strokeLinecap="round"
                                className={`${isEntry ? 'text-blue-500' : 'text-green-500'} transition-all duration-500`}
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
                                        (isEntry ? 'text-blue-500' : 'text-green-500')
                                    }
                                 `} />
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Status Status Text */}
                <div className="h-10 flex items-center justify-center">
                    {parentIsScanning ? (
                        <div className="flex items-center gap-2 text-gray-600 font-medium">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                        </div>
                    ) : (
                        <div className="text-gray-400 text-sm font-medium">
                            {scanState === 'success' ? 'Captured!' : 'Ready to Scan'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FingerprintActionCard;
