import React from 'react';
import { Link } from 'wouter';
import { AboutSection } from '@/ui-system/patterns/AboutSection';

// Технологии и инструменты
const technologies = [
  {
    name: 'React',
    description: 'Современная библиотека для создания пользовательских интерфейсов',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
    link: 'https://reactjs.org/'
  },
  {
    name: 'TypeScript',
    description: 'Типизированный JavaScript для надежной разработки',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
    link: 'https://www.typescriptlang.org/'
  },
  {
    name: 'Node.js',
    description: 'Серверная платформа на базе JavaScript',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
    link: 'https://nodejs.org/'
  },
  {
    name: 'PostgreSQL',
    description: 'Мощная объектно-реляционная база данных',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg',
    link: 'https://www.postgresql.org/'
  },
  {
    name: 'Redis',
    description: 'Высокопроизводительная система кэширования',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg',
    link: 'https://redis.io/'
  },
  {
    name: 'Express.js',
    description: 'Быстрый и минималистичный веб-фреймворк',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg',
    link: 'https://expressjs.com/'
  }
];

// Основные возможности
const features = [
  {
    icon: '📝',
    title: 'Управление контентом',
    description: 'Полнофункциональная система управления блогом с богатым текстовым редактором'
  },
  {
    icon: '📊',
    title: 'Аналитика',
    description: 'Подробная аналитика посещений, просмотров страниц и поведения пользователей'
  },
  {
    icon: '🔒',
    title: 'Безопасность',
    description: 'JWT аутентификация, защита от XSS, CSRF и других угроз'
  },
  {
    icon: '⚡',
    title: 'Производительность',
    description: 'Многоуровневое кэширование, оптимизация изображений, быстрая загрузка'
  },
  {
    icon: '📱',
    title: 'Адаптивность',
    description: 'Полностью адаптивный дизайн для всех устройств и экранов'
  },
  {
    icon: '🌐',
    title: 'Интернационализация',
    description: 'Поддержка нескольких языков (русский, английский)'
  }
];

const About: React.FC = () => {
  return (
    <>
        <div className="container">
        <AboutSection
        title="BlogPro"
        subtitle="Professional blogging platform with modern technologies"
        badges={['React + TypeScript', 'Real-time', 'Responsive']}
        description="BlogPro is a modern full-featured blogging platform with real-time content management capabilities. Built on React, TypeScript and PostgreSQL with focus on performance, security and user experience."
        features={features}
        technologies={technologies}
      />
      
      {/* Additional sections */}
      <div className="about__section">
        <h2 className="about__section-title">Get Started</h2>
        <div className="about__content">
          <p className="about__description">
            Explore the platform capabilities and start creating your blog today.
          </p>
          <div className="about__actions">
            <Link href="/blog" className="button button--primary">
              Go to Blog
            </Link>
            <Link href="/contact" className="button button--outline">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default About;
