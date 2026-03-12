import { FC } from 'react';
import { Receipt, MapPin, ArrowRight, CreditCard, TrendingDown, TrendingUp } from 'lucide-react';

interface FareSummaryCardProps {
    userName: string;
    fromLocation: string;
    toLocation: string;
    distanceKm: number;
    fareAmount: number;
    walletBalanceBefore: number;
    walletBalanceAfter: number;
    show: boolean;
}

const FareSummaryCard: FC<FareSummaryCardProps> = ({
    userName,
    fromLocation,
    toLocation,
    distanceKm,
    fareAmount,
    walletBalanceBefore,
    walletBalanceAfter,
    show
}) => {
    if (!show) return null;

    return (
        <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl shadow-xl p-8 mb-6 animate-fadeIn">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-600 p-3 rounded-xl">
                    <Receipt className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Trip Summary</h2>
                    <p className="text-sm text-gray-600">Fare deducted successfully</p>
                </div>
            </div>

            <div className="space-y-4">
                {/* Passenger Name */}
                <div className="bg-white p-4 rounded-xl">
                    <p className="text-sm text-gray-500">Passenger</p>
                    <p className="text-xl font-bold text-gray-800">{userName}</p>
                </div>

                {/* Journey Route */}
                <div className="bg-white p-4 rounded-xl">
                    <p className="text-sm text-gray-500 mb-3">Journey Route</p>
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 text-blue-600">
                                <MapPin className="w-4 h-4" />
                                <span className="text-sm font-medium">{fromLocation}</span>
                            </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                        <div className="flex-1">
                            <div className="flex items-center gap-2 text-green-600">
                                <MapPin className="w-4 h-4" />
                                <span className="text-sm font-medium">{toLocation}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Distance & Fare */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl">
                        <p className="text-sm text-gray-500">Distance Travelled</p>
                        <p className="text-2xl font-bold text-blue-600">{distanceKm} km</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl">
                        <p className="text-sm text-gray-500">Fare Amount</p>
                        <p className="text-2xl font-bold text-green-600">₹{fareAmount.toFixed(2)}</p>
                    </div>
                </div>

                {/* Wallet Balance */}
                <div className="bg-white p-5 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                        <CreditCard className="w-5 h-5 text-gray-600" />
                        <p className="text-sm font-medium text-gray-700">Wallet Balance</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="flex items-center gap-2 text-gray-500 mb-1">
                                <TrendingUp className="w-4 h-4" />
                                <p className="text-xs">Before</p>
                            </div>
                            <p className="text-lg font-bold text-gray-700">₹{walletBalanceBefore.toFixed(2)}</p>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 text-green-600 mb-1">
                                <TrendingDown className="w-4 h-4" />
                                <p className="text-xs">After</p>
                            </div>
                            <p className="text-lg font-bold text-green-600">₹{walletBalanceAfter.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                {/* Success Message */}
                <div className="bg-green-100 border-2 border-green-300 p-4 rounded-xl text-center">
                    <p className="text-green-800 font-semibold">✓ Journey Completed Successfully</p>
                    <p className="text-sm text-green-700 mt-1">Thank you for traveling with us!</p>
                </div>
            </div>
        </div>
    );
};

export default FareSummaryCard;
