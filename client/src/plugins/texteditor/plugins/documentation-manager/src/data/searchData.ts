export interface SearchItem {
  title: string;
  section: string;
  type: 'feature' | 'reference' | 'concept';
  url: string;
  snippet: string;
}

export const searchData: SearchItem[] = [
  { title: 'Фабрика сервисов', section: 'Основные системы', type: 'feature', url: '#service-factory', snippet: 'Централизованная система внедрения зависимостей' },
  { title: 'Zero-Dictionary', section: 'Основные системы', type: 'feature', url: '#zero-dictionary', snippet: 'Революционная проверка орфографии с сокращением памяти на 99.97%' },
  { title: 'Система плагинов', section: 'Основные системы', type: 'feature', url: '#plugin-system', snippet: 'Расширяемая архитектура с управлением жизненным циклом плагинов' },
  { title: 'API Reference', section: 'Разработка', type: 'reference', url: '#api-reference', snippet: 'Полный справочник по API текстового редактора' },
  { title: 'Тестирование', section: 'Разработка', type: 'concept', url: '#testing', snippet: 'Комплексная система тестирования с покрытием 85%+' },
  { title: 'Безопасность', section: 'Ключевые функции', type: 'concept', url: '#security', snippet: 'Валидация ввода, защита от XSS и санитизация контента' }
];
