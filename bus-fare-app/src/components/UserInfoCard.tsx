import { FC } from 'react';
import { User, Wallet, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { User as UserType } from '../services/api';

interface UserInfoCardProps {
    user: UserType | null;
    show: boolean;
}

const UserInfoCard: FC<UserInfoCardProps> = ({ user, show }) => {
    if (!show || !user) return null;

    const isActive = user.status === 'active';
    const hasBalance = user.walletBalance > 0;

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 animate-fadeIn">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User className="w-6 h-6 text-blue-600" />
                Passenger Information
            </h2>

            <div className="space-y-4">
                {/* Name */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="text-lg font-semibold text-gray-800">{user.name}</p>
                    </div>
                </div>

                {/* Wallet Balance */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-500 p-3 rounded-lg">
                            <Wallet className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-blue-700">Wallet Balance</p>
                            <p className="text-2xl font-bold text-blue-900">₹{user.walletBalance.toFixed(2)}</p>
                        </div>
                    </div>
                    {hasBalance ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                        <AlertCircle className="w-6 h-6 text-amber-500" />
                    )}
                </div>

                {/* Status Badge */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                        <p className="text-sm text-gray-500">Account Status</p>
                        <div className="flex items-center gap-2 mt-1">
                            {isActive ? (
                                <>
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <span className="font-semibold text-green-700">Active</span>
                                </>
                            ) : (
                                <>
                                    <XCircle className="w-5 h-5 text-red-500" />
                                    <span className="font-semibold text-red-700">Blocked</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm font-medium text-gray-800">{user.phone}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm font-medium text-gray-800 truncate">{user.email}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserInfoCard;
