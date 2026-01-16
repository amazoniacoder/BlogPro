// client/src/components/common/protected-route.tsx
import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/store/auth-context";
import { Spinner } from "@/ui-system/components/feedback";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  adminOrEditor?: boolean;
}

export function ProtectedRoute({
  children,
  adminOnly = false,
  adminOrEditor = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // Redirect to login page
        setLocation("/auth");
      } else if (adminOnly && user?.role !== "admin") {
        // Redirect to unauthorized page
        setLocation("/unauthorized");
      } else if (adminOrEditor && !['admin', 'editor'].includes(user?.role || '')) {
        // Redirect to unauthorized page
        setLocation("/unauthorized");
      }
    }
  }, [isAuthenticated, user, loading, adminOnly, adminOrEditor, setLocation]);

  if (loading) {
    return (
      <div className="page-loading">
        <Spinner size="lg" />
        <p className="page-loading__text">Проверка авторизации...</p>
      </div>
    );
  }

  if (!isAuthenticated || 
      (adminOnly && user?.role !== "admin") ||
      (adminOrEditor && !['admin', 'editor'].includes(user?.role || ''))) {
    return null;
  }

  return <>{children}</>;
}

// Add default export
export default ProtectedRoute;
