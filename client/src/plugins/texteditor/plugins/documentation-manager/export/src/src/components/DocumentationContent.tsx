import { Icon } from '../../../../../../../../ui-system/icons/components';
/**
 * Documentation Content Component
 */

import React from 'react';

interface DocumentationContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const DocumentationContent: React.FC<DocumentationContentProps> = ({
  activeTab,
  setActiveTab
}) => {
  return (
    <>
      <div className="hero" id="overview">
        <h1 className="hero__title">Документация BlogPro Текстовый Редактор</h1>
        <p className="hero__subtitle">Профессиональное редактирование текста с продвинутыми функциями и революционной системой проверки орфографии Zero-Dictionary</p>
        
        <div className="hero-stats">
          <div className="stat">
            <span className="stat__value">99.97%</span>
            <span className="stat__label">Сокращение памяти</span>
          </div>
          <div className="stat">
            <span className="stat__value">85%+</span>
            <span className="stat__label">Покрытие тестами</span>
          </div>
          <div className="stat">
            <span className="stat__value">60fps</span>
            <span className="stat__label">Производительность</span>
          </div>
          <div className="stat">
            <span className="stat__value">712</span>
            <span className="stat__label">Слов протестировано</span>
          </div>
        </div>
      </div>

      <section className="features-section" id="features">
        <h2>Ключевые функции</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-card__icon"><Icon name="gear" size={16} /></div>
            <h3 className="feature-card__title">Фабрика сервисов</h3>
            <p className="feature-card__description">Централизованная система внедрения зависимостей с паттерном Singleton и управлением жизненным циклом</p>
            <a href="#service-factory" className="feature-card__link">Подробнее →</a>
          </div>

          <div className="feature-card">
            <div className="feature-card__icon">🔌</div>
            <h3 className="feature-card__title">Система плагинов</h3>
            <p className="feature-card__description">Расширяемая архитектура с управлением жизненным циклом плагинов и событийно-ориентированной коммуникацией</p>
            <a href="#plugin-system" className="feature-card__link">Подробнее →</a>
          </div>

          <div className="feature-card">
            <div className="feature-card__icon">🎯</div>
            <h3 className="feature-card__title">Zero-Dictionary</h3>
            <p className="feature-card__description">Революционная проверка орфографии с сокращением памяти на 99.97% и серверной валидацией</p>
            <a href="#zero-dictionary" className="feature-card__link">Подробнее →</a>
          </div>

          <div className="feature-card">
            <div className="feature-card__icon">📊</div>
            <h3 className="feature-card__title">Аналитика</h3>
            <p className="feature-card__description">Мониторинг производительности в реальном времени с комплексными метриками и интеграцией APM</p>
            <a href="#analytics" className="feature-card__link">Подробнее →</a>
          </div>

          <div className="feature-card">
            <div className="feature-card__icon">🧪</div>
            <h3 className="feature-card__title">Тестирование</h3>
            <p className="feature-card__description">Комплексная система тестирования с покрытием 85%+ и обеспечением качества</p>
            <a href="#testing" className="feature-card__link">Подробнее →</a>
          </div>

          <div className="feature-card">
            <div className="feature-card__icon">🔒</div>
            <h3 className="feature-card__title">Безопасность</h3>
            <p className="feature-card__description">Валидация ввода, защита от XSS и санитизация контента с лучшими практиками безопасности</p>
            <a href="#security" className="feature-card__link">Подробнее →</a>
          </div>
        </div>
      </section>

      <section className="getting-started" id="getting-started">
        <h2>Быстрый старт</h2>
        <div className="tab-container">
          <div className="tab-container__header">
            <button 
              className={`tab-container__tab ${activeTab === 'installation' ? 'tab-container__tab--active' : ''}`}
              onClick={() => setActiveTab('installation')}
            >
              Установка
            </button>
            <button 
              className={`tab-container__tab ${activeTab === 'basic-usage' ? 'tab-container__tab--active' : ''}`}
              onClick={() => setActiveTab('basic-usage')}
            >
              Базовое использование
            </button>
            <button 
              className={`tab-container__tab ${activeTab === 'configuration' ? 'tab-container__tab--active' : ''}`}
              onClick={() => setActiveTab('configuration')}
            >
              Конфигурация
            </button>
          </div>
          
          {activeTab === 'installation' && (
            <div className="tab-container__content tab-container__content--active">
              <h3>Установка</h3>
              <div className="code-example">
                <div className="code-example__header">
                  <span>Установка через npm</span>
                  <button className="code-example__copy">Копировать</button>
                </div>
                <pre><code className="language-bash">npm install @blogpro/text-editor</code></pre>
              </div>
              
              <div className="code-example">
                <div className="code-example__header">
                  <span>Импорт в проект</span>
                  <button className="code-example__copy">Копировать</button>
                </div>
                <pre><code className="language-typescript">{`import { ServiceFactory } from '@blogpro/text-editor';

// Инициализация редактора
const editor = await ServiceFactory.getUnifiedSpellCheckService();`}</code></pre>
              </div>
            </div>
          )}
          
          {activeTab === 'basic-usage' && (
            <div className="tab-container__content tab-container__content--active">
              <h3>Базовое использование</h3>
              <div className="code-example">
                <div className="code-example__header">
                  <span>Включение проверки орфографии</span>
                  <button className="code-example__copy">Копировать</button>
                </div>
                <pre><code className="language-typescript">{`// Получение сервиса проверки орфографии
const spellCheckService = await ServiceFactory.getUnifiedSpellCheckService();

// Включение для текстового элемента
const textElement = document.getElementById('editor');
spellCheckService.enableSpellCheck(textElement, 'ru');

// Программная проверка текста
const result = await spellCheckService.checkText('Привет мир!');`}</code></pre>
              </div>
            </div>
          )}
          
          {activeTab === 'configuration' && (
            <div className="tab-container__content tab-container__content--active">
              <h3>Конфигурация</h3>
              <div className="code-example">
                <div className="code-example__header">
                  <span>Параметры конфигурации</span>
                  <button className="code-example__copy">Копировать</button>
                </div>
                <pre><code className="language-typescript">{`const config = {
  enabled: true,
  languages: ['ru', 'en'],
  autoDetect: true,
  debounceDelay: 500,
  maxCacheSize: 10000
};

await spellCheckService.initialize(config);`}</code></pre>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};
