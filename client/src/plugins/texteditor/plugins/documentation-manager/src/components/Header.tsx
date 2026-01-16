import React from 'react';

interface HeaderProps {
  onSearchToggle: () => void;
  onNavClick: (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearchToggle, onNavClick }) => {
  return (
    <header className="header">
      <a href="#" className="header__logo">BlogPro Редактор</a>
      <nav className="header__nav">
        <ul className="nav">
          <li className="nav__item">
            <a href="#architecture" className="nav__link" onClick={(e) => onNavClick(e, '#architecture')}>Архитектура</a>
          </li>
          <li className="nav__item">
            <a href="#service-factory" className="nav__link" onClick={(e) => onNavClick(e, '#service-factory')}>Сервисы</a>
          </li>
          <li className="nav__item">
            <a href="#zero-dictionary" className="nav__link" onClick={(e) => onNavClick(e, '#zero-dictionary')}>Zero-Dictionary</a>
          </li>
          <li className="nav__item">
            <a href="#api-reference" className="nav__link" onClick={(e) => onNavClick(e, '#api-reference')}>API</a>
          </li>
        </ul>
      </nav>
      <button className="search-toggle" aria-label="Открыть поиск" onClick={onSearchToggle}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
      </button>
      <button className="menu-toggle" aria-label="Переключить мобильное меню">☰</button>
    </header>
  );
};
