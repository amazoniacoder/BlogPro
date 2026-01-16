import React from 'react';
import { Icon, type IconName } from '@/ui-system/icons/components';

interface SettingsFormSectionProps {
  title: string;
  description?: string;
  icon?: IconName;
  children: React.ReactNode;
  className?: string;
}

const SettingsFormSection: React.FC<SettingsFormSectionProps> = ({
  title,
  description,
  icon,
  children,
  className = ''
}) => {
  return (
    <div className={`settings-form-section ${className}`}>
      <div className="settings-form-section__header">
        <h3 className="settings-form-section__title">
          {icon && <Icon name={icon} size={18} />}
          {title}
        </h3>
        {description && (
          <p className="settings-form-section__description">{description}</p>
        )}
      </div>
      <div className="settings-form-section__content">
        {children}
      </div>
    </div>
  );
};

export default SettingsFormSection;
