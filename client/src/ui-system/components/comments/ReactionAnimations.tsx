import { useState, useEffect } from 'react';
import { Icon } from '@/ui-system/icons/components';

interface AnimatedReactionProps {
  type: 'like' | 'dislike';
  count: number;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function AnimatedReaction({ type, count, isActive, onClick, disabled }: AnimatedReactionProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPulse, setShowPulse] = useState(false);

  const handleClick = () => {
    if (disabled) return;
    
    setIsAnimating(true);
    setShowPulse(true);
    onClick();
    
    setTimeout(() => setIsAnimating(false), 200);
    setTimeout(() => setShowPulse(false), 600);
  };

  return (
    <button
      className={`reaction-button reaction-button--${type} ${isActive ? 'reaction-button--active' : ''} ${isAnimating ? 'reaction-button--animating' : ''}`}
      onClick={handleClick}
      disabled={disabled}
      aria-label={`${type} this comment`}
    >
      <div className="reaction-button__icon-wrapper">
        <Icon 
          name={type === 'like' ? 'heart' : 'x'} 
          size={16} 
        />
        {showPulse && <div className="reaction-button__pulse" />}
      </div>
      <span className="reaction-button__count">{count}</span>
    </button>
  );
}

interface FloatingReactionProps {
  type: 'like' | 'dislike';
  show: boolean;
  onComplete: () => void;
}

export function FloatingReaction({ type, show, onComplete }: FloatingReactionProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onComplete, 1000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className={`floating-reaction floating-reaction--${type}`}>
      <Icon 
        name={type === 'like' ? 'heart' : 'x'} 
        size={20} 
      />
    </div>
  );
}