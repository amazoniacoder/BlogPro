import React from 'react';
import { Button, ButtonProps } from '../button';

interface AdminButtonProps extends ButtonProps {
  // Дополнительные пропсы для админ кнопок
}

export const AdminButton: React.FC<AdminButtonProps> = (props) => {
  return <Button {...props} className={`admin-button ${props.className || ''}`} />;
};

export { type ButtonProps } from '../button';