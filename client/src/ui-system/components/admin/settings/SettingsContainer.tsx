import React from 'react';
interface SettingsContainerProps {
  children: React.ReactNode;
}

const SettingsContainer: React.FC<SettingsContainerProps> = ({
  children
}) => {

  return (
    <div className="settings-container">

      <div className="settings-container__content">
        {children}
      </div>
    </div>
  );
};

export default SettingsContainer;
