/**
 * BlogPro Toaster Component
 * Container for managing multiple toast notifications
 */

import React from 'react';
import { useToast } from '../../../hooks/use-toast';
import { Toast } from './Toast';

export interface ToasterProps {
  className?: string;
}

export const Toaster: React.FC<ToasterProps> = ({
  className = ''
}) => {
  const { toasts } = useToast();

  const toasterClasses = [
    'toaster',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={toasterClasses}>
      {toasts.map(function ({ id, title, description, variant = 'info', ...props }) {
        const message = String(title ? 
          (description ? `${title}: ${description}` : title) : 
          (description || ''));
          
        return (
          <Toast 
            key={id} 
            variant={variant}
            onClose={props.onClose || (() => {})}
            {...props}
          >
            {message}
          </Toast>
        );
      })}
    </div>
  );
};

export default Toaster;
