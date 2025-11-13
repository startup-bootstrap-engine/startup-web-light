import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { JSX } from 'react';
import { RealtimeStatus as Status } from '../../hooks/useRealtimeOpportunities';

interface RealtimeStatusProps {
  status: Status;
}

export const RealtimeStatus = ({ status }: RealtimeStatusProps): JSX.Element => {
  const { isConnected, error } = status;

  return (
    <div className="flex items-center gap-2">
      {isConnected ? (
        <>
          <div className="relative">
            <Wifi className="w-4 h-4 text-green-400" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          </div>
          <span className="text-xs text-green-400">Live</span>
        </>
      ) : error ? (
        <>
          <AlertCircle className="w-4 h-4 text-yellow-400" />
          <span className="text-xs text-yellow-400" title={error}>
            Reconnecting...
          </span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-400">Offline</span>
        </>
      )}
    </div>
  );
};
