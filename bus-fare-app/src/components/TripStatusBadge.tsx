import { FC } from 'react';
import { Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface TripStatusBadgeProps {
    status: 'IDLE' | 'ONGOING' | 'COMPLETED' | 'ERROR';
    message?: string;
}

const TripStatusBadge: FC<TripStatusBadgeProps> = ({ status, message }) => {
    const getStatusConfig = () => {
        switch (status) {
            case 'IDLE':
                return {
                    icon: <Clock className="w-5 h-5" />,
                    bgColor: 'bg-gray-100',
                    textColor: 'text-gray-700',
                    borderColor: 'border-gray-300',
                    label: 'Ready to Scan'
                };
            case 'ONGOING':
                return {
                    icon: <Loader2 className="w-5 h-5 animate-spin" />,
                    bgColor: 'bg-blue-100',
                    textColor: 'text-blue-700',
                    borderColor: 'border-blue-300',
                    label: 'Trip in Progress'
                };
            case 'COMPLETED':
                return {
                    icon: <CheckCircle className="w-5 h-5" />,
                    bgColor: 'bg-green-100',
                    textColor: 'text-green-700',
                    borderColor: 'border-green-300',
                    label: 'Trip Completed'
                };
            case 'ERROR':
                return {
                    icon: <XCircle className="w-5 h-5" />,
                    bgColor: 'bg-red-100',
                    textColor: 'text-red-700',
                    borderColor: 'border-red-300',
                    label: 'Error'
                };
        }
    };

    const config = getStatusConfig();

    return (
        <div className={`
      ${config.bgColor} ${config.textColor} 
      border-2 ${config.borderColor}
      rounded-xl p-4 mb-6
      flex items-center gap-3
      transition-all duration-300
    `}>
            {config.icon}
            <div className="flex-1">
                <p className="font-semibold">{config.label}</p>
                {message && <p className="text-sm mt-1 opacity-90">{message}</p>}
            </div>
        </div>
    );
};

export default TripStatusBadge;
