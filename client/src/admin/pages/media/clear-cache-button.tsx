import React, { useState } from 'react';
import { mediaService } from '@/services/api/media';
import { Button } from '@/ui-system/components/button';

interface ClearCacheButtonProps {
  onSuccess?: () => void;
}

const ClearCacheButton: React.FC<ClearCacheButtonProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleClearCache = async () => {
    try {
      setLoading(true);
      setMessage(null);
      
      await mediaService.clearCache();
      
      setMessage('Media cache cleared successfully.');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to clear media cache:', error);
      setMessage('Failed to clear media cache. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-clear-cache">
      <Button 
        variant="secondary"
        onClick={handleClearCache}
        loading={loading}
      >
        Clear Media Cache
      </Button>
      
      {message && (
        <div className="admin-clear-cache__message">
          {message}
        </div>
      )}
    </div>
  );
};

export default ClearCacheButton;
