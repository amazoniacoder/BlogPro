import React, { useState, useEffect } from 'react';

interface RealtimeVisitorsProps {
  websocketService?: any;
}

const RealtimeVisitors: React.FC<RealtimeVisitorsProps> = React.memo(({ websocketService }) => {
  const [activeVisitors, setActiveVisitors] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!websocketService) return;

    const handleVisitorUpdate = (data: { activeVisitors: number; currentPageViews?: Record<string, number> }) => {
      console.log('👥 Visitor count updated:', data.activeVisitors);
      setActiveVisitors(data.activeVisitors);
    };

    const handleConnection = () => {
      setIsConnected(true);
      console.log('RealtimeVisitors: WebSocket connected');
    };
    
    const handleDisconnection = () => {
      setIsConnected(false);
      console.log('RealtimeVisitors: WebSocket disconnected');
    };

    // Check initial connection state
    setIsConnected(websocketService.isConnected());

    // Subscribe to real-time updates
    websocketService.subscribe('visitor_count_updated', handleVisitorUpdate);
    websocketService.subscribe('_open', handleConnection);
    websocketService.subscribe('_close', handleDisconnection);

    // Connect if not already connected
    if (!websocketService.isConnected()) {
      console.log('RealtimeVisitors: Connecting WebSocket');
      websocketService.connect();
    }

    return () => {
      websocketService.unsubscribe('visitor_count_updated', handleVisitorUpdate);
      websocketService.unsubscribe('_open', handleConnection);
      websocketService.unsubscribe('_close', handleDisconnection);
    };
  }, [websocketService]);

  return (
    <div className="admin-analytics__realtime">
      <div className="admin-analytics__realtime-header">
        <h3 className="admin-analytics__realtime-title">Live Visitors</h3>
        <div className={`admin-analytics__status ${isConnected ? 'admin-analytics__status--connected' : 'admin-analytics__status--disconnected'}`}>
          <span className="admin-analytics__status-dot"></span>
          {isConnected ? 'Live' : 'Offline'}
        </div>
      </div>
      <div className="admin-analytics__realtime-count">
        <span className="admin-analytics__realtime-number">{activeVisitors}</span>
        <span className="admin-analytics__realtime-label">Active now</span>
      </div>
    </div>
  );
});

RealtimeVisitors.displayName = 'RealtimeVisitors';

export default RealtimeVisitors;
