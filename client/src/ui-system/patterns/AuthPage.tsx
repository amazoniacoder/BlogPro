import React from 'react';

export interface AuthPageProps {
  children: React.ReactNode;
  className?: string;
}

export const AuthPage: React.FC<AuthPageProps> = ({ children, className = '' }) => {
  return (
    <>
      <div className="hero__overlay"></div>
      <div className={`auth ${className}`}>
        <div className="auth__container">
          {children}
        </div>
      </div>
    </>
  );
};
