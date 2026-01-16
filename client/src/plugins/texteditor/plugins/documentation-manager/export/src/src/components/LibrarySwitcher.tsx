/**
 * Library Switcher Component
 * Allows switching between different documentation libraries
 */

import React from 'react';
import { LIBRARY_CONFIGS } from '../types/LibraryContext';

interface LibrarySwitcherProps {
  activeLibrary: string;
  onSwitch: (libraryType: string) => void;
  userRole?: 'admin' | 'editor' | 'user' | null;
  className?: string;
}

export const LibrarySwitcher: React.FC<LibrarySwitcherProps> = ({
  activeLibrary,
  onSwitch,
  userRole = null,
  className = ''
}) => {
  const canSwitchLibraries = userRole === 'admin' || userRole === 'editor';

  const handleLibrarySwitch = (libraryType: string) => {
    if (canSwitchLibraries || libraryType === activeLibrary) {
      onSwitch(libraryType);
    }
  };

  return (
    <div className={`library-switcher ${className}`}>
      <div className="library-switcher__header">
        <span className="library-switcher__label">Documentation Library:</span>
      </div>
      
      <div className="library-switcher__options">
        {Object.entries(LIBRARY_CONFIGS).map(([key, config]) => {
          const isActive = activeLibrary === key;
          const isDisabled = !canSwitchLibraries && !isActive;
          
          return (
            <button
              key={key}
              className={`
                library-option 
                ${isActive ? 'library-option--active' : ''} 
                ${isDisabled ? 'library-option--disabled' : ''}
              `.trim()}
              onClick={() => handleLibrarySwitch(key)}
              disabled={isDisabled}
              title={isDisabled ? 'Admin or Editor access required' : config.libraryName}
            >
              <span className="library-option__icon">
                {key === 'texteditor' ? '📝' : '🌐'}
              </span>
              <span className="library-option__name">
                {config.libraryName}
              </span>
              {isActive && (
                <span className="library-option__indicator">✓</span>
              )}
            </button>
          );
        })}
      </div>
      
      {!canSwitchLibraries && (
        <div className="library-switcher__notice">
          <small>Library switching requires editor or admin privileges</small>
        </div>
      )}
    </div>
  );
};
