import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ThemeToggle } from "@/ui-system/components/theme";
import { ThemeColorPicker } from "@/ui-system/components/input";
import { AccessibilityMenu } from "@/ui-system/components/accessibility";
import { useAuth } from "@/store/auth-context";
import { setupHeaderScroll } from "@/utils/headerScroll";

import { LanguageSwitcher } from "@/ui-system/components/utility";
import { useSettings } from "@/store/settings-context";
import { SearchToggle } from "@/ui-system/components/search";
import { HeaderProvider, Header, NavigationItem } from "../../ui-system/components/header";
import { Icon } from "../../ui-system/icons/components";
import { CartIcon } from "../../ui-system/components/ecommerce/cart/CartIcon";
import { menuApi } from '../../services/api/menu';
import type { MenuItem } from '../../../../shared/types/menu';
import { useTranslation } from "@/hooks/useTranslation";

const AppHeader = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { settings } = useSettings();
  const [location] = useLocation();
  const { t } = useTranslation('nav');
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([]);
  const [originalMenuItems, setOriginalMenuItems] = useState<MenuItem[]>([]);

  // Convert API menu items to NavigationItems
  const convertToNavigationItems = (menuItems: MenuItem[]): NavigationItem[] => {
    return menuItems.map((item, index) => ({
      id: item.id.toString(),
      label: item.title,
      href: item.url || '#',
      priority: item.order_index || index + 1
    }));
  };


  // Set up header scroll effect
  useEffect(() => {
    const cleanup = setupHeaderScroll();
    return () => cleanup();
  }, []);

  // Always use translated navigation items
  useEffect(() => {
    const setupNavigation = async () => {
      try {
        // Fetch menu structure from API
        const items = await menuApi.getMenuTree();
        setOriginalMenuItems(items || []);
        
        // Convert API items to NavigationItems
        if (items && items.length > 0) {
          const navItems = convertToNavigationItems(items);
          setNavigationItems(navItems);
        } else {
          // Fallback to static menu if API fails
          setNavigationItems([
            { id: '1', label: t('home'), href: '/', priority: 1 },
            { id: '2', label: t('about'), href: '/about', priority: 2 },
            { id: '3', label: t('blog'), href: '/blog', priority: 3 },
            { id: '4', label: t('products'), href: '/products', priority: 4 },
            { id: '5', label: t('contact'), href: '/contact', priority: 5 }
          ]);
        }
      } catch (err) {
        // API failed, use translated static menu
        setOriginalMenuItems([]);
        setNavigationItems([
          { id: '1', label: t('home'), href: '/', priority: 1 },
          { id: '2', label: t('about'), href: '/about', priority: 2 },
          { id: '3', label: t('blog'), href: '/blog', priority: 3 },
          { id: '4', label: t('products'), href: '/products', priority: 4 },
          { id: '5', label: t('contact'), href: '/contact', priority: 5 }
        ]);
      }
    };
    
    setupNavigation();
  }, [t]);

  // Listen for menu updates via WebSocket
  useEffect(() => {
    const handleMenuUpdate = async () => {
      try {
        const items = await menuApi.getMenuTree();
        setOriginalMenuItems(items || []);
        
        // Update navigation items when menu changes
        if (items && items.length > 0) {
          const navItems = convertToNavigationItems(items);
          setNavigationItems(navItems);
        }
      } catch (err) {
        console.error('Failed to update menu:', err);
      }
    };

    // Listen for custom events (fallback)
    const events = ['menu_updated'];
    events.forEach(event => {
      window.addEventListener(event, handleMenuUpdate);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleMenuUpdate);
      });
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      // Silent logout
    }
  };

  // Function to check if a link is active
  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  // User menu component
  const UserMenu = () => {
    // Force re-render when auth state changes
    if (!isAuthenticated || !user) {
      return (
        <Link
          href="/auth"
          className={`header__icon-link ${isActive("/auth") ? "header__icon-link--active" : ""}`}
          title={t('login', 'Login')}
        >
          <Icon name="login" size={20} />
        </Link>
      );
    }
    
    return (
        <div className="header__user-menu">
          <Link
            href="/profile?tab=comments"
            className={`header__icon-link ${isActive("/profile") && location.includes('tab=comments') ? "header__icon-link--active" : ""}`}
            title="My Comments"
          >
            <Icon name="reply" size={20} />
          </Link>
          {user?.role === "admin" ? (
            <Link
              href="/admin"
              className={`header__icon-link ${isActive("/admin") ? "header__icon-link--active" : ""}`}
              title={t('admin')}
            >
              <Icon name="admin" size={20} />
            </Link>
          ) : (
            <Link
              href="/profile"
              className={`header__icon-link ${isActive("/profile") && !location.includes('tab=comments') ? "header__icon-link--active" : ""}`}
              title={t('profile')}
            >
              <Icon name="user" size={20} />
            </Link>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleLogout();
            }}
            className="header__icon-link header__icon-link--logout"
            title={t('logout', 'Logout')}
          >
            <Icon name="logout" size={20} />
          </button>
        </div>
    );
  };

  const actions = (
    <>
      <SearchToggle />
      <AccessibilityMenu />
      <ThemeColorPicker />
      <ThemeToggle />
       <LanguageSwitcher />
       <UserMenu />
    </>
  );

  // Separate cart actions for slide menu
  const slideMenuActions = (
    <>
      <SearchToggle />
      <CartIcon />
      <AccessibilityMenu />
      <ThemeColorPicker />
      <ThemeToggle />
       <LanguageSwitcher />
       <UserMenu />
    </>
  );

  return (
    <HeaderProvider>
      <Header
        logo={
          <Link 
            href="/" 
            className="header__logo-link"
            onClick={(e) => {
              if (location === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            {settings.siteTitle}
          </Link>
        }
        navigationItems={navigationItems}
        menuItems={originalMenuItems}
        actions={actions}
        slideMenuActions={slideMenuActions}
      />
    </HeaderProvider>
  );
};

export default AppHeader;
