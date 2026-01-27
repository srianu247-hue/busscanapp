import React from 'react';
import { Wifi, WifiOff, Fingerprint, CheckCircle, XCircle } from 'lucide-react';

interface SystemStatusCardProps {
    backendOnline: boolean;
    scannerConnected: boolean;
    backendMessage?: string;
    scannerMessage?: string;
}

const SystemStatusCard: React.FC<SystemStatusCardProps> = ({
    backendOnline,
    scannerConnected,
    backendMessage,
    scannerMessage
}) => {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Wifi className="w-6 h-6 text-blue-600" />
                System Status
            </h2>

            <div className="space-y-3">
                {/* Backend Status */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                        {backendOnline ? (
                            <Wifi className="w-5 h-5 text-green-500" />
                        ) : (
                            <WifiOff className="w-5 h-5 text-red-500" />
                        )}
                        <div>
                            <p className="font-medium text-gray-800">Backend Server</p>
                            <p className="text-sm text-gray-500">{backendMessage || 'Checking...'}</p>
                        </div>
                    </div>
                    {backendOnline ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                        <XCircle className="w-6 h-6 text-red-500" />
                    )}
                </div>

                {/* Scanner Status */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                        <Fingerprint className={`w-5 h-5 ${scannerConnected ? 'text-green-500' : 'text-red-500'}`} />
                        <div>
                            <p className="font-medium text-gray-800">Fingerprint Scanner</p>
                            <p className="text-sm text-gray-500">{scannerMessage || 'Checking...'}</p>
                        </div>
                    </div>
                    {scannerConnected ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                        <XCircle className="w-6 h-6 text-red-500" />
                    )}
                </div>
            </div>
        </div>
    );
};

export default SystemStatusCard;
