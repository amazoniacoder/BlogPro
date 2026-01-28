import { lazy } from 'react';
import { Route, Switch } from 'wouter';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from './store/auth-context';
import { CartProvider } from './store/cart-context';
import { FontSizeProvider } from '@/ui-system/components/accessibility';
import { NotificationProvider } from '@/ui-system/components/feedback';
import { SettingsProvider } from './store/settings-context';
import { ColorThemeProvider } from '@/ui-system/components/theme';
import { WebSocketProvider } from '@/ui-system/hooks/useWebSocket';
import { Layout } from '@/ui-system/components/layout';
import { ProtectedRoute } from './components/common/protected-route';
import { UpdateNotification } from '@/ui-system/components/feedback';
import ScrollToTop from './components/ScrollToTop';


// Direct import for immediate loading
import HomePage from './pages/home';
const AboutPage = lazy(() => import('./pages/about'));
const BlogPage = lazy(() => import('./pages/blog'));
const BlogDetailPage = lazy(() => import('./pages/blog-detail'));
const CategoryPage = lazy(() => import('./pages/categories/[slug]'));
const ContactPage = lazy(() => import('./pages/contact'));
const ProductsPage = lazy(() => import('./pages/products'));
const ProductDetailPage = lazy(() => import('./pages/products/[slug]'));
const ProductCategoryPage = lazy(() => import('./pages/products/category/[slug]'));
const AuthPage = lazy(() => import('./pages/auth'));
const ProfilePage = lazy(() => import('./pages/profile'));
const VerifyEmailPage = lazy(() => import('./pages/verify-email'));
const ResetPasswordPage = lazy(() => import('./pages/reset-password'));
const AdminPage = lazy(() => import('./admin'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const DocumentationPage = lazy(() => import('./pages/documentation'));
const PrivacyPage = lazy(() => import('./pages/privacy'));
const TermsPage = lazy(() => import('./pages/terms'));

const TextEditorDocsPage = lazy(() => import('./plugins/texteditor/plugins/documentation-manager/src/components/pages/TextEditorDocsPage'));
const SiteDocsPage = lazy(() => import('./plugins/texteditor/plugins/documentation-manager/src/components/pages/SiteDocsPage'));
const AdminManagerPage = lazy(() => import('./plugins/texteditor/plugins/documentation-manager/src/components/pages/AdminManagerPage'));
const UnauthorizedPage = lazy(() => import('./pages/unauthorized'));
const NotFoundPage = lazy(() => import('./pages/not-found'));

import { RouteProvider } from './components/layout/RouteContext';
import { ErrorBoundary } from '@/ui-system/components/feedback';
import { useAnalyticsTracking } from './hooks/useAnalyticsTracking';
// Removed SpriteLoader - icons work via CSS without sprite injection
import './i18n';

function App() {
  // Track page views for analytics
  useAnalyticsTracking();
  
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class">
        <ColorThemeProvider>
          <FontSizeProvider>
            <NotificationProvider>
              <SettingsProvider>
                <WebSocketProvider>
                  <AuthProvider>
                    <CartProvider>
                <RouteProvider>
                  <Switch>
                    {/* Plugin routes without Layout */}
                    <Route path="/plugins/texteditor/documentation-texteditor">
                      <TextEditorDocsPage />
                    </Route>
                    
                    <Route path="/plugins/texteditor/documentation-site">
                      <SiteDocsPage />
                    </Route>
                    
                    <Route path="/plugins/texteditor/documentation-manager">
                      <ProtectedRoute adminOrEditor>
                        <AdminManagerPage />
                      </ProtectedRoute>
                    </Route>
                    
                    {/* Main app routes with Layout */}
                    <Route>
                      <Layout>
                        <ScrollToTop />
                        <UpdateNotification className="app__notification" />
                        <Switch>
                          <Route path="/">
                            <HomePage />
                          </Route>
                          <Route path="/about" component={AboutPage} />
                          <Route path="/blog" component={BlogPage} />
                          <Route path="/blog/category/:slug" component={CategoryPage} />
                          <Route path="/blog/:id" component={BlogDetailPage} />
                          <Route path="/contact" component={ContactPage} />
                          <Route path="/products" component={ProductsPage} />
                          <Route path="/products/category/:slug" component={ProductCategoryPage} />
                          <Route path="/products/:slug" component={ProductDetailPage} />
                          <Route path="/cart" component={CartPage} />
                          <Route path="/checkout" component={CheckoutPage} />
                          <Route path="/privacy" component={PrivacyPage} />
                          <Route path="/terms" component={TermsPage} />
                          <Route path="/documentation/:categoryPath+/:slug" component={DocumentationPage} />
                          <Route path="/documentation/:slug?" component={DocumentationPage} />
                          <Route path="/auth" component={AuthPage} />
                          <Route path="/verify-email/:token" component={VerifyEmailPage} />
                          <Route path="/reset-password/:token" component={ResetPasswordPage} />
                          
                          <Route path="/profile">
                            <ProtectedRoute>
                              <ProfilePage />
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/admin">
                            <ProtectedRoute adminOnly>
                              <AdminPage />
                            </ProtectedRoute>
                          </Route>
                          <Route path="/admin/:rest+">
                            <ProtectedRoute adminOnly>
                              <AdminPage />
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/unauthorized" component={UnauthorizedPage} />
                          <Route component={NotFoundPage} />
                        </Switch>
                      </Layout>
                    </Route>
                  </Switch>
                </RouteProvider>
                    </CartProvider>
                  </AuthProvider>
                </WebSocketProvider>
              </SettingsProvider>
            </NotificationProvider>
          </FontSizeProvider>
        </ColorThemeProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
