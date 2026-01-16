import React, { useState } from 'react';
import { mediaService } from '@/services/api/media';

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
      <button 
        className="admin-button admin-button--secondary"
        onClick={handleClearCache}
        disabled={loading}
      >
        {loading ? 'Clearing...' : 'Clear Media Cache'}
      </button>
      
      {message && (
        <div className="admin-clear-cache__message">
          {message}
        </div>
      )}
    </div>
  );
};

export default ClearCacheButton;
