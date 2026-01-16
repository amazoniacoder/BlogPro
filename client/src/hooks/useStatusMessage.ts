// client/src/hooks/useStatusMessage.ts
import { useState, useCallback } from 'react';

type MessageType = 'success' | 'error' | 'info';

interface StatusMessage {
  text: string;
  type: MessageType;
  id: number;
}

export const useStatusMessage = () => {
  const [messages, setMessages] = useState<StatusMessage[]>([]);
  
  const showMessage = useCallback((text: string, type: MessageType = 'info') => {
    const id = Date.now();
    setMessages(prev => [...prev, { text, type, id }]);
    return id;
  }, []);
  
  const showSuccess = useCallback((text: string) => {
    return showMessage(text, 'success');
  }, [showMessage]);
  
  const showError = useCallback((text: string) => {
    return showMessage(text, 'error');
  }, [showMessage]);
  
  const removeMessage = useCallback((id: number) => {
    setMessages(prev => prev.filter(message => message.id !== id));
  }, []);
  
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);
  
  return {
    messages,
    showMessage,
    showSuccess,
    showError,
    removeMessage,
    clearMessages
  };
};
