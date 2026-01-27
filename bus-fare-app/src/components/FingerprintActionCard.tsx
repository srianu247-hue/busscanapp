import React from 'react';
import { Fingerprint, LogIn, LogOut, Loader2 } from 'lucide-react';

interface FingerprintActionCardProps {
    mode: 'ENTRY' | 'EXIT';
    onScan: () => void;
    isScanning: boolean;
    disabled: boolean;
}

const FingerprintActionCard: React.FC<FingerprintActionCardProps> = ({
    mode,
    onScan,
    isScanning,
    disabled
}) => {
    const isEntry = mode === 'ENTRY';

    return (
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="text-center">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${isEntry ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                    {isEntry ? (
                        <LogIn className={`w-10 h-10 ${isEntry ? 'text-blue-600' : 'text-green-600'}`} />
                    ) : (
                        <LogOut className={`w-10 h-10 text-green-600`} />
                    )}
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {isEntry ? 'Passenger Entry' : 'Passenger Exit'}
                </h2>
                <p className="text-gray-600 mb-6">
                    {isEntry
                        ? 'Scan fingerprint to board the bus'
                        : 'Scan fingerprint to complete journey'}
                </p>

                <button
                    onClick={onScan}
                    disabled={disabled || isScanning}
                    className={`
            w-full py-6 px-8 rounded-xl font-semibold text-lg
            transition-all duration-300 transform
            flex items-center justify-center gap-3
            ${disabled || isScanning
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : isEntry
                                ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800 hover:scale-105 shadow-lg hover:shadow-xl'
                                : 'bg-gradient-to-r from-green-500 to-green-700 text-white hover:from-green-600 hover:to-green-800 hover:scale-105 shadow-lg hover:shadow-xl'
                        }
          `}
                >
                    {isScanning ? (
                        <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            Scanning...
                        </>
                    ) : (
                        <>
                            <Fingerprint className="w-6 h-6" />
                            Scan Fingerprint ({mode})
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default FingerprintActionCard;
