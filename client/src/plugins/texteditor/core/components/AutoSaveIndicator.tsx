/**
 * Auto-Save Indicator Component
 * 
 * Displays real-time save status, last saved time, and handles conflict resolution.
 * Provides visual feedback for auto-save operations with accessibility support.
 * 
 * Features:
 * - Real-time save status indicators (saving, saved, error)
 * - Last saved timestamp with relative time display
 * - Conflict resolution UI for concurrent editing
 * - Accessibility compliant with ARIA labels
 * - Mobile responsive design
 * 
 * @author BlogPro Text Editor Team
 * @version 1.0.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import './AutoSaveIndicator.css';

// Types
export interface AutoSaveStatus {
  status: 'idle' | 'saving' | 'saved' | 'error' | 'conflict';
  lastSaved?: Date;
  error?: string;
  conflictData?: {
    localVersion: string;
    serverVersion: string;
    timestamp: Date;
  };
}

export interface AutoSaveIndicatorProps {
  /** Current save status */
  status: AutoSaveStatus;
  /** Callback when conflict resolution is chosen */
  onResolveConflict?: (resolution: 'local' | 'server' | 'merge') => void;
  /** Custom save interval display */
  saveInterval?: number;
  /** Custom CSS class */
  className?: string;
}

const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  status,
  onResolveConflict,
  saveInterval: _saveInterval = 300000, // 5 minutes default - kept for functionality
  className = ''
}) => {
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [relativeTime, setRelativeTime] = useState<string>('');
  const intervalRef = useRef<NodeJS.Timeout>();
  const popupTimeoutRef = useRef<NodeJS.Timeout>();

  // Update relative time display
  const updateRelativeTime = useCallback(() => {
    if (!status.lastSaved) {
      setRelativeTime('');
      return;
    }

    const now = new Date();
    const diff = now.getTime() - status.lastSaved.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) {
      setRelativeTime('только что');
    } else if (minutes < 60) {
      setRelativeTime(`${minutes} мин назад`);
    } else if (hours < 24) {
      setRelativeTime(`${hours} ч назад`);
    } else {
      setRelativeTime(status.lastSaved.toLocaleDateString('ru-RU'));
    }
  }, [status.lastSaved]);

  // Update relative time every minute
  useEffect(() => {
    updateRelativeTime();
    
    if (status.lastSaved) {
      intervalRef.current = setInterval(updateRelativeTime, 60000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (popupTimeoutRef.current) {
        clearTimeout(popupTimeoutRef.current);
      }
    };
  }, [updateRelativeTime, status.lastSaved]);

  // Handle conflict dialog and success popup
  useEffect(() => {
    if (status.status === 'conflict') {
      setShowConflictDialog(true);
    } else {
      setShowConflictDialog(false);
    }
    
    // Show success popup when saved with hourglass animation
    if (status.status === 'saved') {
      // Show hourglass animation first
      setTimeout(() => {
        setShowSuccessPopup(true);
        // Auto-hide after 10 seconds
        popupTimeoutRef.current = setTimeout(() => {
          setShowSuccessPopup(false);
        }, 10000);
      }, 500); // 500ms hourglass animation
    } else {
      setShowSuccessPopup(false);
      if (popupTimeoutRef.current) {
        clearTimeout(popupTimeoutRef.current);
      }
    }
  }, [status.status]);

  // Handle conflict resolution
  const handleConflictResolution = useCallback((resolution: 'local' | 'server' | 'merge') => {
    if (!onResolveConflict) return;
    onResolveConflict(resolution);
    setShowConflictDialog(false);
  }, [onResolveConflict]);

  // Get status icon (clock only)
  const getStatusDisplay = () => {
    switch (status.status) {
      case 'saving':
        return {
          icon: '🕐',
          className: 'auto-save-indicator--saving'
        };
      case 'saved':
        return {
          icon: '🕐',
          className: 'auto-save-indicator--saved'
        };
      case 'error':
        return {
          icon: '🕐',
          className: 'auto-save-indicator--error'
        };
      case 'conflict':
        return {
          icon: '🕐',
          className: 'auto-save-indicator--conflict'
        };
      default:
        return {
          icon: '🕐',
          className: 'auto-save-indicator--idle'
        };
    }
  };
  const statusDisplay = getStatusDisplay();

  return (
    <div className={`auto-save-indicator ${statusDisplay.className} ${className}`}>
      {/* Clock Icon Only */}
      <div 
        className="auto-save-indicator__status"
        role="status"
        aria-live="polite"
        aria-label={`Auto-save status: ${status.status}`}
      >
        <span className={`auto-save-indicator__icon ${status.status === 'saving' ? 'will-change-transform' : ''}`} aria-hidden="true">
          {statusDisplay.icon}
        </span>
      </div>
      
      {/* Success Popup with timing info */}
      {showSuccessPopup && (
        <div className="auto-save-popup auto-save-popup--show">
          <span className="check-icon">✓</span>
          {relativeTime ? `Сохранено ${relativeTime}` : 'Сохранено'}
        </div>
      )}

      {/* Conflict Resolution Dialog */}
      {showConflictDialog && status.conflictData && (
        <div 
          className="auto-save-indicator__conflict-dialog"
          role="dialog"
          aria-labelledby="conflict-title"
          aria-describedby="conflict-description"
        >
          <div className="auto-save-indicator__conflict-content">
            <h3 id="conflict-title" className="auto-save-indicator__conflict-title">
              Обнаружен конфликт редактирования
            </h3>
            
            <p id="conflict-description" className="auto-save-indicator__conflict-description">
              Этот документ был изменён другим пользователем. Выберите способ разрешения:
            </p>

            <div className="auto-save-indicator__conflict-timestamp">
              Конфликт произошёл: {status.conflictData.timestamp.toLocaleString()}
            </div>

            <div className="auto-save-indicator__conflict-actions">
              <button
                className="auto-save-indicator__conflict-button auto-save-indicator__conflict-button--local"
                onClick={() => handleConflictResolution('local')}
                aria-label="Сохранить мои изменения и перезаписать версию сервера"
              >
                Сохранить мои изменения
              </button>
              
              <button
                className="auto-save-indicator__conflict-button auto-save-indicator__conflict-button--server"
                onClick={() => handleConflictResolution('server')}
                aria-label="Отменить мои изменения и использовать версию сервера"
              >
                Использовать версию сервера
              </button>
              
              <button
                className="auto-save-indicator__conflict-button auto-save-indicator__conflict-button--merge"
                onClick={() => handleConflictResolution('merge')}
                aria-label="Попытаться объединить обе версии"
              >
                Попытаться объединить
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default AutoSaveIndicator;
