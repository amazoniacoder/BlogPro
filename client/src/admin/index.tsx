import { Suspense, useEffect } from "react";
import { useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";
import AdminLayout from "./components/AdminLayout";
import AdminRoutes from "./routes";
import { useAdminRouting } from "./hooks/useAdminRouting";

// Import the main admin stylesheet
// Admin styles are now included in UI System

export default function AdminPage() {
  const { activeSection, handleSectionChange } = useAdminRouting();
  const [location] = useLocation();

  // Debug log to help diagnose routing issues
  useEffect(() => {
    console.log("Admin page mounted, current location:", location);
  }, [location]);

  return (
    <QueryClientProvider client={queryClient}>
      <AdminLayout
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      >
        <Suspense fallback={<div className="admin-loading">Loading...</div>}>
          <AdminRoutes />
        </Suspense>
      </AdminLayout>
    </QueryClientProvider>
  );
}
