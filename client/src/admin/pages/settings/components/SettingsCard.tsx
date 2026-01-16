import React from "react";

interface SettingsCardProps {
  title: string;
  children: React.ReactNode;
}

const SettingsCard: React.FC<SettingsCardProps> = ({ title, children }) => {
  return (
    <div className="admin-card">
      <div className="admin-card__header">
        <h3 className="admin-card__title">{title}</h3>
      </div>
      <div className="admin-card__body">{children}</div>
    </div>
  );
};

export default SettingsCard;
