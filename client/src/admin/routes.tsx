import React, { lazy } from "react";
import { Route, Switch } from "wouter";
import { AdminRoutes as Routes } from "./utils/routePatterns";

// Lazy load admin page components
// Use dynamic import with explicit default export handling
// Import directly without using .then() syntax
const Dashboard = lazy(() => import("./pages/dashboard/index.tsx"));
const AnalyticsPage = lazy(() => import("./pages/analytics/index.tsx"));

const BlogPage = lazy(() => import("./pages/blog/index.tsx"));
const CategoriesPage = lazy(() => import("./pages/categories/index.tsx"));
const MediaPage = lazy(() => import("./pages/media/index.tsx"));
// Import the users page component
const UsersPage = lazy(() => import("./pages/users/index.tsx"));
// Import the test component
const UserEditPage = lazy(() => import("./pages/users/UserEditPage.tsx"));
const SettingsPage = lazy(() => import("./pages/settings/index.tsx"));
const DocumentationPage = lazy(() => import("./pages/documentation/index.tsx"));
const SiteEditorPage = lazy(() => import("./pages/site-editor/index.tsx"));
const ShopPage = lazy(() => import("./pages/shop/ShopPage.tsx"));

const CommentsPage = lazy(() => import("./pages/comments/index.tsx"));

const AdminRoutes: React.FC = () => {
  return (
    <Switch>

      <Route path="/admin">
        <Dashboard />
      </Route>
      <Route path="/admin/analytics">
        <AnalyticsPage />
      </Route>
      <Route path={Routes.BLOG}>
        <BlogPage />
      </Route>
      <Route path={Routes.CATEGORIES}>
        <CategoriesPage />
      </Route>
      <Route path={Routes.MEDIA}>
        <MediaPage />
      </Route>
      <Route path={Routes.USER_EDIT}>
        {(params) => {
          console.log('Route params for user edit:', params);
          return (
            <div className="admin-content-wrapper">
              <UserEditPage />
            </div>
          );
        }}
      </Route>
      <Route path={Routes.USERS}>
        <UsersPage />
      </Route>
      <Route path={Routes.SETTINGS}>
        <SettingsPage />
      </Route>
      <Route path="/admin/documentation">
        <DocumentationPage />
      </Route>
      <Route path="/admin/site-editor">
        <SiteEditorPage />
      </Route>
      <Route path="/admin/comments">
        <CommentsPage />
      </Route>
      <Route path="/admin/shop" nest>
        <ShopPage />
      </Route>

      <Route>
        <div>Admin page not found</div>
      </Route>
    </Switch>
  );
};

export default AdminRoutes;
