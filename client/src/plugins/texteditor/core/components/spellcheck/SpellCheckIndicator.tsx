import React from 'react';
import './SpellCheckIndicator.css';

export interface SpellCheckIndicatorProps {
  readonly isChecking: boolean;
  readonly errorCount: number;
  readonly enabled: boolean;
  readonly onToggle?: () => void;
  readonly className?: string;
}

export const SpellCheckIndicator: React.FC<SpellCheckIndicatorProps> = ({
  isChecking,
  errorCount,
  enabled,
  onToggle,
  className = ''
}) => {
  const getStatusDisplay = () => {
    console.log('🔍 SpellCheck Status:', { isChecking, errorCount, enabled });
    
    if (isChecking) {
      console.log('⏳ SpellCheck: Checking in progress...');
      return {
        icon: '⏳',
        text: 'Проверка...',
        className: 'spell-check-indicator--checking'
      };
    }
    
    if (!enabled) {
      console.log('🚫 SpellCheck: Disabled');
      return {
        icon: '○',
        text: 'Отключена',
        className: 'spell-check-indicator--disabled'
      };
    }
    
    if (errorCount > 0) {
      console.log(`⚠️ SpellCheck: Found ${errorCount} errors`);
      return {
        icon: '⚠️',
        text: `${errorCount} ошибок`,
        className: 'spell-check-indicator--errors'
      };
    }
    
    console.log('✅ SpellCheck: No errors found');
    return {
      icon: '✓',
      text: 'Проверено',
      className: 'spell-check-indicator--clean'
    };
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className={`spell-check-indicator ${statusDisplay.className} ${className}`}>
      <div 
        className="spell-check-indicator__status"
        role="status"
        aria-live="polite"
        aria-label={`Проверка орфографии: ${statusDisplay.text}`}
      >
        <span className="spell-check-indicator__icon" aria-hidden="true">
          {statusDisplay.icon}
        </span>
        <span className="spell-check-indicator__text">
          {statusDisplay.text}
        </span>
      </div>
      
      {onToggle && (
        <button
          className="spell-check-indicator__toggle"
          onClick={onToggle}
          title={enabled ? 'Отключить проверку орфографии' : 'Включить проверку орфографии'}
          aria-label={enabled ? 'Отключить проверку орфографии' : 'Включить проверку орфографии'}
        >
          {enabled ? '🔍' : '🚫'}
        </button>
      )}
    </div>
  );
};
