import React from 'react';
import { useAuth } from '@/store/auth-context';
import { ErrorPage } from '@/ui-system/patterns/ErrorPage';
import { Text } from '@/ui-system/components/typography';

const Unauthorized: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  const illustration = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="240"
      height="240"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 12l2 2 4-4"></path>
      <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
      <path d="M3 12c1 0 3-1-3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
      <path d="M12 3v6"></path>
      <path d="M12 15v6"></path>
    </svg>
  );

  const actions = [
    { label: "Go to Homepage", href: "/", variant: "primary" as const },
    !isAuthenticated 
      ? { label: "Login", href: "/auth", variant: "secondary" as const }
      : { label: "Go to Profile", href: "/profile", variant: "secondary" as const }
  ];

  return (
    <div className="container">
      <ErrorPage
        code="403"
        title="Access Denied"
        description={!isAuthenticated 
          ? "You need to be logged in to access this page."
          : "You don't have sufficient permissions to access this page. Administrator rights are required."
        }
        actions={actions}
        illustration={illustration}
      />
      {user && (
        <Text className="error-page__user-info" align="center">
          Current role: <strong>{user.role}</strong>
        </Text>
      )}
    </div>
  );
};

export default Unauthorized;
