import React from 'react';
import { RealtimeVisitors as UIRealtimeVisitors } from '@/ui-system/components/admin';

interface RealtimeVisitorsProps {
  websocketService?: any;
}

const RealtimeVisitors: React.FC<RealtimeVisitorsProps> = ({ websocketService }) => {
  return <UIRealtimeVisitors websocketService={websocketService} />;
};

export default RealtimeVisitors;
