import { useState, useCallback, useRef } from 'react';

interface QueuedOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  data: any;
  retryCount: number;
  timestamp: number;
}

export function useCommentQueue() {
  const [queue, setQueue] = useState<QueuedOperation[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const retryTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const addToQueue = useCallback((operation: Omit<QueuedOperation, 'id' | 'retryCount' | 'timestamp'>) => {
    const queuedOp: QueuedOperation = {
      ...operation,
      id: `${Date.now()}-${Math.random()}`,
      retryCount: 0,
      timestamp: Date.now()
    };
    
    setQueue(prev => [...prev, queuedOp]);
    return queuedOp.id;
  }, []);

  const removeFromQueue = useCallback((id: string) => {
    setQueue(prev => prev.filter(op => op.id !== id));
    const timeout = retryTimeouts.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      retryTimeouts.current.delete(id);
    }
  }, []);

  const retryOperation = useCallback((id: string, delay: number = 2000) => {
    const timeout = setTimeout(() => {
      setQueue(prev => prev.map(op => 
        op.id === id ? { ...op, retryCount: op.retryCount + 1 } : op
      ));
      retryTimeouts.current.delete(id);
    }, delay);
    
    retryTimeouts.current.set(id, timeout);
  }, []);

  const clearQueue = useCallback(() => {
    retryTimeouts.current.forEach(timeout => clearTimeout(timeout));
    retryTimeouts.current.clear();
    setQueue([]);
  }, []);

  return {
    queue,
    isProcessing,
    setIsProcessing,
    addToQueue,
    removeFromQueue,
    retryOperation,
    clearQueue
  };
}