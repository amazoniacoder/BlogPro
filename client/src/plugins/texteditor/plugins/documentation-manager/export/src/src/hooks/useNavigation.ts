import React from 'react';

export const useNavigation = () => {
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.querySelector(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Update active link
      document.querySelectorAll('.sidebar-nav__link').forEach(link => {
        link.classList.remove('sidebar-nav__link--active');
      });
      e.currentTarget.classList.add('sidebar-nav__link--active');
    }
  };

  return { handleNavClick };
};
