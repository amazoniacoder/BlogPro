/**
 * Navigation Helper Component
 * Quick navigation between documentation routes
 * Max 100 lines - strict TypeScript compliance
 */

import React from 'react';
import { UserRole } from '../../types/SharedTypes';

interface NavigationHelperProps {
  readonly currentRoute: 'texteditor' | 'site' | 'manager';
  readonly userRole: UserRole;
}

/**
 * Navigation helper for quick route switching
 */
export const NavigationHelper: React.FC<NavigationHelperProps> = ({
  currentRoute,
  userRole
}) => {
  const canAccessAdmin = userRole === 'admin' || userRole === 'editor';

  const routes = [
    {
      id: 'texteditor',
      name: 'Text Editor Docs',
      path: '/plugins/texteditor/documentation-texteditor',
      icon: '📝',
      description: 'Text editor documentation and API reference'
    },
    {
      id: 'site',
      name: 'Website Docs',
      path: '/plugins/texteditor/documentation-site',
      icon: '🌐',
      description: 'Website documentation and user guides'
    },
    {
      id: 'manager',
      name: 'Admin Panel',
      path: '/plugins/texteditor/documentation-manager',
      icon: '<Icon name="gear" size={16} />',
      description: 'Content management and administration',
      requiresAuth: true
    }
  ];

  return (
    <div className="navigation-helper">
      <h3 className="navigation-helper__title">📚 Documentation</h3>
      
      <div className="navigation-helper__routes">
        {routes.map(route => {
          const isCurrent = route.id === currentRoute;
          const canAccess = !route.requiresAuth || canAccessAdmin;
          
          return (
            <a
              key={route.id}
              href={route.path}
              className={`navigation-helper__route ${
                isCurrent ? 'navigation-helper__route--current' : ''
              } ${
                !canAccess ? 'navigation-helper__route--disabled' : ''
              }`}
              title={route.description}
            >
              <span className="navigation-helper__icon">{route.icon}</span>
              <span className="navigation-helper__name">{route.name}</span>
              {isCurrent && (
                <span className="navigation-helper__current">Current</span>
              )}
              {route.requiresAuth && !canAccess && (
                <span className="navigation-helper__locked">🔒</span>
              )}
            </a>
          );
        })}
      </div>
      
      {!canAccessAdmin && (
        <div className="navigation-helper__notice">
          <p>🔒 Admin panel requires editor or admin permissions</p>
        </div>
      )}
    </div>
  );
};

export default NavigationHelper;
