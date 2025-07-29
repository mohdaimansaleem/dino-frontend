import React from 'react';
import { useConnectionStatus } from '../../hooks/useRealTimeData';
import { useWebSocket } from './WebSocketProvider';

interface ConnectionStatusProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  className = '',
  showLabel = true,
  size = 'md'
}) => {
  const { isOnline, isWebSocketConnected, connectionStatus, isFullyConnected } = useConnectionStatus();

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-2 h-2 text-xs';
      case 'lg': return 'w-4 h-4 text-base';
      default: return 'w-3 h-3 text-sm';
    }
  };

  const getStatusInfo = () => {
    if (!isOnline) {
      return {
        color: 'bg-red-500',
        label: 'Offline',
        description: 'No internet connection'
      };
    }
    
    if (!isWebSocketConnected) {
      return {
        color: connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-orange-500',
        label: connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected',
        description: 'Real-time updates unavailable'
      };
    }

    return {
      color: 'bg-green-500',
      label: 'Connected',
      description: 'Real-time updates active'
    };
  };

  const status = getStatusInfo();

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`rounded-full ${status.color} ${getSizeClasses()}`} title={status.description}></div>
      {showLabel && (
        <span className={`font-medium ${getSizeClasses()} ${
          status.label === 'Connected' ? 'text-green-700' :
          status.label === 'Connecting...' ? 'text-yellow-700' :
          'text-red-700'
        }`}>
          {status.label}
        </span>
      )}
    </div>
  );
};

interface LiveDataIndicatorProps {
  lastUpdated?: Date | null;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

export const LiveDataIndicator: React.FC<LiveDataIndicatorProps> = ({
  lastUpdated,
  isLoading = false,
  error = null,
  className = ''
}) => {
  const getTimeSinceUpdate = () => {
    if (!lastUpdated) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    return lastUpdated.toLocaleTimeString();
  };

  if (error) {
    return (
      <div className={`flex items-center space-x-2 text-red-600 ${className}`}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-xs">Error loading data</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 text-blue-600 ${className}`}>
        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs">Updating...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 text-gray-600 ${className}`}>
      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
      <span className="text-xs">Updated {getTimeSinceUpdate()}</span>
    </div>
  );
};

interface OrderStatusIndicatorProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

export const OrderStatusIndicator: React.FC<OrderStatusIndicatorProps> = ({
  status,
  size = 'md',
  showLabel = true,
  animated = false,
  className = ''
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          color: 'bg-yellow-500',
          textColor: 'text-yellow-700',
          label: 'Pending',
          icon: (
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      case 'confirmed':
        return {
          color: 'bg-blue-500',
          textColor: 'text-blue-700',
          label: 'Confirmed',
          icon: (
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      case 'preparing':
        return {
          color: 'bg-orange-500',
          textColor: 'text-orange-700',
          label: 'Preparing',
          icon: (
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            </svg>
          )
        };
      case 'ready':
        return {
          color: 'bg-green-500',
          textColor: 'text-green-700',
          label: 'Ready',
          icon: (
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )
        };
      case 'served':
        return {
          color: 'bg-gray-500',
          textColor: 'text-gray-700',
          label: 'Served',
          icon: (
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      case 'cancelled':
        return {
          color: 'bg-red-500',
          textColor: 'text-red-700',
          label: 'Cancelled',
          icon: (
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )
        };
      default:
        return {
          color: 'bg-gray-400',
          textColor: 'text-gray-600',
          label: status,
          icon: (
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-4 h-4 text-xs';
      case 'lg': return 'w-8 h-8 text-base';
      default: return 'w-6 h-6 text-sm';
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`
        ${config.color} ${getSizeClasses()} rounded-full flex items-center justify-center text-white
        ${animated && status === 'preparing' ? 'animate-pulse' : ''}
      `}>
        {config.icon}
      </div>
      {showLabel && (
        <span className={`font-medium ${config.textColor} ${getSizeClasses()}`}>
          {config.label}
        </span>
      )}
    </div>
  );
};

interface TableStatusIndicatorProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const TableStatusIndicator: React.FC<TableStatusIndicatorProps> = ({
  status,
  size = 'md',
  showLabel = true,
  className = ''
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'available':
        return { color: 'bg-green-500', textColor: 'text-green-700', label: 'Available' };
      case 'occupied':
        return { color: 'bg-red-500', textColor: 'text-red-700', label: 'Occupied' };
      case 'reserved':
        return { color: 'bg-yellow-500', textColor: 'text-yellow-700', label: 'Reserved' };
      case 'cleaning':
        return { color: 'bg-blue-500', textColor: 'text-blue-700', label: 'Cleaning' };
      case 'maintenance':
        return { color: 'bg-purple-500', textColor: 'text-purple-700', label: 'Maintenance' };
      case 'out_of_order':
        return { color: 'bg-gray-500', textColor: 'text-gray-700', label: 'Out of Order' };
      default:
        return { color: 'bg-gray-400', textColor: 'text-gray-600', label: status };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-3 h-3 text-xs';
      case 'lg': return 'w-5 h-5 text-base';
      default: return 'w-4 h-4 text-sm';
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`${config.color} ${getSizeClasses()} rounded-full`}></div>
      {showLabel && (
        <span className={`font-medium ${config.textColor} ${getSizeClasses()}`}>
          {config.label}
        </span>
      )}
    </div>
  );
};

interface NotificationBadgeProps {
  count: number;
  maxCount?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  maxCount = 99,
  size = 'md',
  className = ''
}) => {
  if (count <= 0) return null;

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'text-xs px-1.5 py-0.5 min-w-[1rem] h-4';
      case 'lg': return 'text-sm px-2 py-1 min-w-[1.5rem] h-6';
      default: return 'text-xs px-1.5 py-0.5 min-w-[1.25rem] h-5';
    }
  };

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <span className={`
      inline-flex items-center justify-center font-medium text-white bg-red-500 rounded-full
      ${getSizeClasses()} ${className}
    `}>
      {displayCount}
    </span>
  );
};