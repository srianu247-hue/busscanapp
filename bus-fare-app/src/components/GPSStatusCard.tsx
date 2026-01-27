import React from 'react';
import { MapPin, Navigation, CheckCircle, Loader2 } from 'lucide-react';
import { GPSCoordinates, formatGPSCoordinates } from '../utils/gps';

interface GPSStatusCardProps {
    entryLocation: GPSCoordinates | null;
    exitLocation: GPSCoordinates | null;
    isCapturing: boolean;
    show: boolean;
}

const GPSStatusCard: React.FC<GPSStatusCardProps> = ({
    entryLocation,
    exitLocation,
    isCapturing,
    show
}) => {
    if (!show) return null;

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 animate-fadeIn">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Navigation className="w-6 h-6 text-blue-600" />
                GPS Location Tracking
            </h2>

            <div className="space-y-3">
                {/* Entry Location */}
                <div className={`p-4 rounded-xl ${entryLocation ? 'bg-green-50' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <MapPin className={`w-5 h-5 ${entryLocation ? 'text-green-600' : 'text-gray-400'}`} />
                            <div>
                                <p className="text-sm font-medium text-gray-700">Entry Location</p>
                                {entryLocation ? (
                                    <p className="text-xs text-gray-600 font-mono mt-1">
                                        {formatGPSCoordinates(entryLocation)}
                                    </p>
                                ) : (
                                    <p className="text-xs text-gray-500 mt-1">Not captured yet</p>
                                )}
                            </div>
                        </div>
                        {entryLocation && <CheckCircle className="w-5 h-5 text-green-500" />}
                    </div>
                </div>

                {/* Exit Location */}
                <div className={`p-4 rounded-xl ${exitLocation ? 'bg-green-50' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <MapPin className={`w-5 h-5 ${exitLocation ? 'text-green-600' : 'text-gray-400'}`} />
                            <div>
                                <p className="text-sm font-medium text-gray-700">Exit Location</p>
                                {exitLocation ? (
                                    <p className="text-xs text-gray-600 font-mono mt-1">
                                        {formatGPSCoordinates(exitLocation)}
                                    </p>
                                ) : (
                                    <p className="text-xs text-gray-500 mt-1">Not captured yet</p>
                                )}
                            </div>
                        </div>
                        {exitLocation && <CheckCircle className="w-5 h-5 text-green-500" />}
                    </div>
                </div>

                {/* Capturing Indicator */}
                {isCapturing && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                        <p className="text-sm text-blue-700 font-medium">Capturing GPS location...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GPSStatusCard;
