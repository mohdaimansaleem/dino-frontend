import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useRealTimeEvents } from '../../hooks/useRealTimeData';
import { useToast } from '../../contexts/ToastContext';
import { dashboardService } from '../../services/business';

interface ActivityItem {
  id: string;
  type: 'order' | 'table' | 'user' | 'venue' | 'system';
  title: string;
  description: string;
  timestamp: string;
  data?: any;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
}

interface ActivityFeedProps {
  className?: string;
  maxItems?: number;
  showFilters?: boolean;
  autoRefresh?: boolean;
  compact?: boolean;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  className = '',
  maxItems = 20,
  showFilters = true,
  autoRefresh = true,
  compact = false
}) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  
  const { orderUpdates, tableUpdates, userUpdates, venueUpdates } = useRealTimeEvents();
  const { showInfo } = useToast();

  // Convert real-time events to activity items
  useEffect(() => {
    const newActivities: ActivityItem[] = [];

    // Process order updates
    orderUpdates.forEach(update => {
      newActivities.push({
        id: `order_${update.order_id}_${Date.now()}`,
        type: 'order',
        title: `Order #${update.order_number}`,
        description: `Status changed to ${update.status}`,
        timestamp: new Date().toISOString(),
        data: update,
        priority: update.status === 'cancelled' ? 'high' : 'medium',
        read: false
      });
    });

    // Process table updates
    tableUpdates.forEach(update => {
      newActivities.push({
        id: `table_${update.table_id}_${Date.now()}`,
        type: 'table',
        title: `Table ${update.table_number}`,
        description: `Status changed to ${update.status}`,
        timestamp: new Date().toISOString(),
        data: update,
        priority: update.status === 'out_of_order' ? 'high' : 'low',
        read: false
      });
    });

    // Process user updates
    userUpdates.forEach(update => {
      newActivities.push({
        id: `user_${update.user_id}_${Date.now()}`,
        type: 'user',
        title: `User ${update.user_name}`,
        description: update.action || 'Profile updated',
        timestamp: new Date().toISOString(),
        data: update,
        priority: 'low',
        read: false
      });
    });

    // Process venue updates
    venueUpdates.forEach(update => {
      newActivities.push({
        id: `venue_${update.venue_id}_${Date.now()}`,
        type: 'venue',
        title: update.venue_name,
        description: `Venue ${update.is_open ? 'opened' : 'closed'}`,
        timestamp: new Date().toISOString(),
        data: update,
        priority: 'medium',
        read: false
      });
    });

    if (newActivities.length > 0) {
      setActivities(prev => {
        const combined = [...newActivities, ...prev];
        return combined.slice(0, maxItems);
      });
    }
  }, [orderUpdates, tableUpdates, userUpdates, venueUpdates, maxItems]);

  const getActivityIcon = (type: string, priority: string) => {
    const iconClass = `w-4 h-4 ${
      priority === 'urgent' ? 'text-red-600' :
      priority === 'high' ? 'text-orange-600' :
      priority === 'medium' ? 'text-blue-600' :
      'text-gray-600'
    }`;

    switch (type) {
      case 'order':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        );
      case 'table':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'user':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'venue':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      default:
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'medium': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const markAsRead = (id: string) => {
    setActivities(prev => 
      prev.map(activity => 
        activity.id === id ? { ...activity, read: true } : activity
      )
    );
  };

  const markAllAsRead = () => {
    setActivities(prev => 
      prev.map(activity => ({ ...activity, read: true }))
    );
  };

  const clearAll = () => {
    setActivities([]);
  };

  const filteredActivities = activities.filter(activity => {
    if (filter !== 'all' && activity.type !== filter) return false;
    if (showUnreadOnly && activity.read) return false;
    return true;
  });

  const unreadCount = activities.filter(a => !a.read).length;

  return (
    <Card className={`${className}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-900">Activity Feed</h3>
            {unreadCount > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Button
                variant="text"
                size="small"
                onClick={markAllAsRead}
              >
                Mark all read
              </Button>
            )}
            <Button
              variant="text"
              size="small"
              onClick={clearAll}
            >
              Clear
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-3 flex items-center space-x-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="all">All Activities</option>
              <option value="order">Orders</option>
              <option value="table">Tables</option>
              <option value="user">Users</option>
              <option value="venue">Venues</option>
            </select>
            
            <label className="flex items-center text-sm text-gray-600">
              <input
                type="checkbox"
                checked={showUnreadOnly}
                onChange={(e) => setShowUnreadOnly(e.target.checked)}
                className="mr-2"
              />
              Unread only
            </label>
          </div>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {filteredActivities.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className={`p-4 border-l-4 ${getPriorityColor(activity.priority)} ${
                  !activity.read ? 'bg-opacity-100' : 'bg-opacity-50'
                } hover:bg-opacity-75 transition-colors cursor-pointer`}
                onClick={() => markAsRead(activity.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getActivityIcon(activity.type, activity.priority)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${
                        !activity.read ? 'text-gray-900' : 'text-gray-600'
                      }`}>
                        {activity.title}
                      </p>
                      {!activity.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                    <p className={`text-sm ${
                      !activity.read ? 'text-gray-700' : 'text-gray-500'
                    }`}>
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {dashboardService.formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No activities</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'all' 
                ? 'No recent activities to display.'
                : `No ${filter} activities to display.`
              }
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ActivityFeed;