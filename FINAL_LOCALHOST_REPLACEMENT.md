# ФИНАЛЬНЫЙ ОТЧЕТ: Полная замена localhost на production

## Дата: Январь 2025

## Цель
Полная замена всех упоминаний localhost на production значения для сборки на сервере.

---

## ✅ КРИТИЧНЫЕ ИЗМЕНЕНИЯ (Production сборка)

### 1. Клиентская конфигурация API
**Файл**: `client/src/config/api.ts`
```typescript
// ❌ Было:
baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000'
wsURL: import.meta.env.VITE_WS_URL || 'ws://localhost:5000'

// ✅ Стало:
baseURL: import.meta.env.VITE_API_URL || 'https://blogpro.tech'
wsURL: import.meta.env.VITE_WS_URL || 'wss://blogpro.tech'
```

### 2. WebSocket сервис
**Файл**: `client/src/services/websocket-service.ts`
```typescript
// ❌ Было:
const wsUrl = `ws://localhost:5000/ws`;

// ✅ Стало:
const wsUrl = import.meta.env.VITE_WS_URL || 'wss://blogpro.tech';
const fullWsUrl = wsUrl.endsWith('/ws') ? wsUrl : `${wsUrl}/ws`;
```

### 3. Vite конфигурация
**Файл**: `client/vite.config.js`
```javascript
// ❌ Было:
const apiUrl = env.VITE_API_URL || 'http://localhost:5000';
const wsUrl = env.VITE_WS_URL || 'ws://localhost:5000';

// ✅ Стало:
const apiUrl = env.VITE_API_URL || 'https://blogpro.tech';
const wsUrl = env.VITE_WS_URL || 'wss://blogpro.tech';
```

### 4. Database конфигурация
**Файл**: `server/db/db.ts`
```typescript
// ❌ Было:
const connectionString = process.env.DATABASE_URL || "postgres://postgres:12345@localhost:5432/Porto1";

// ✅ Стало:
const connectionString = process.env.DATABASE_URL || "postgres://postgres:12345@89.169.0.223:5432/Porto1";
```

### 5. Redis конфигурация
**Файл**: `server/db/redis.ts`
```typescript
// ❌ Было:
const url = process.env.REDIS_URL || "redis://localhost:6379";

// ✅ Стало:
const url = process.env.REDIS_URL || "redis://89.169.0.223:6379";
```

### 6. Drizzle ORM конфигурация
**Файл**: `config/drizzle.config.ts`
```typescript
// ❌ Было:
dbCredentials: {
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "12345",
  database: "Porto1",
}

// ✅ Стало:
dbCredentials: {
  host: process.env.DB_HOST || "89.169.0.223",
  port: parseInt(process.env.DB_PORT || "5432"),
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "12345",
  database: process.env.DB_NAME || "Porto1",
}
```

### 7. Documentation Manager (2 файла)
**Файлы**: 
- `client/src/plugins/texteditor/plugins/documentation-manager/src/deployment/routeConfiguration.ts`
- `client/src/plugins/texteditor/plugins/documentation-manager/export/src/src/deployment/routeConfiguration.ts`

```typescript
// ❌ Было:
development: {
  apiBaseUrl: 'http://localhost:5000/api',
}
production: {
  apiBaseUrl: 'https://api.blogpro.com/api',
}

// ✅ Стало:
development: {
  apiBaseUrl: import.meta.env?.VITE_API_URL || 'https://blogpro.tech/api',
}
production: {
  apiBaseUrl: 'https://blogpro.tech/api',
}
```

### 8. Swagger конфигурация
**Файл**: `server/config/swagger.ts`
```typescript
// ❌ Было:
url: process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : 'http://localhost:5000'

// ✅ Стало:
url: process.env.NODE_ENV === 'production' ? 'https://blogpro.tech' : 'https://blogpro.tech'
```

### 9. CORS настройки
**Файл**: `server/middleware/security.ts`
```typescript
// ❌ Было:
origin: process.env.NODE_ENV === 'production' 
  ? [process.env.CORS_ORIGIN || 'https://blogpro.tech', ...]
  : ['http://localhost:3000', 'https://localhost:3000']

// ✅ Стало:
origin: process.env.NODE_ENV === 'production' 
  ? [process.env.CORS_ORIGIN || 'https://blogpro.tech', ...]
  : ['https://blogpro.tech', 'http://localhost:3000', 'https://localhost:3000']
```

### 10. Auth Service (Email URLs)
**Файл**: `server/services/authService.ts`
```typescript
// ❌ Было:
const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${token}`;
const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email/${token}`;

// ✅ Стало:
const resetUrl = `${process.env.CLIENT_URL || 'https://blogpro.tech'}/reset-password/${token}`;
const verificationUrl = `${process.env.CLIENT_URL || 'https://blogpro.tech'}/verify-email/${token}`;
```

### 11. Digital Goods Service
**Файл**: `server/services/digitalGoodsService.ts`
```typescript
// ❌ Было:
return `${process.env.BASE_URL || 'http://localhost:5000'}/api/downloads/${token}`;

// ✅ Стало:
return `${process.env.BASE_URL || 'https://blogpro.tech'}/api/downloads/${token}`;
```

---

## ⚠️ ОСТАВЛЕНО БЕЗ ИЗМЕНЕНИЙ (Не влияет на production)

### 1. Тестовые файлы
- `server/test/setup.ts` - localhost для тестовой БД
- `client/src/__tests__/**/*.test.ts` - тестовые файлы
- **Причина**: Тесты должны использовать локальное окружение

### 2. Скрипты разработки
- `scripts/check-server.js` - проверка локального сервера
- `scripts/generate-ssl.js` - генерация SSL для localhost
- `scripts/test-*.js` - тестовые скрипты
- **Причина**: Используются только в dev окружении

### 3. Логирование
- `server/index.ts` - `log('Server running on localhost:5000')`
- **Причина**: Только console.log, сервер слушает 0.0.0.0

### 4. Vite dev proxy
- `vite.config.js` - proxy настройки
- **Причина**: Используется только в dev режиме

### 5. Безопасность плагинов
- `client/src/plugins/texteditor/plugins/security/PluginSandbox.ts`
- `client/src/plugins/texteditor/core/services/monitoring/APMService.ts`
- **Причина**: Проверки безопасности для блокировки localhost

---

## 📋 ИТОГОВАЯ СТАТИСТИКА

### Файлов изменено: 11
1. ✅ client/src/config/api.ts
2. ✅ client/src/services/websocket-service.ts
3. ✅ client/vite.config.js
4. ✅ server/db/db.ts
5. ✅ server/db/redis.ts
6. ✅ config/drizzle.config.ts
7. ✅ client/src/plugins/texteditor/plugins/documentation-manager/src/deployment/routeConfiguration.ts
8. ✅ client/src/plugins/texteditor/plugins/documentation-manager/export/src/src/deployment/routeConfiguration.ts
9. ✅ server/config/swagger.ts
10. ✅ server/middleware/security.ts
11. ✅ server/services/authService.ts
12. ✅ server/services/digitalGoodsService.ts

### Файлов оставлено: ~15 (тесты и dev скрипты)

---

## 🚀 ИНСТРУКЦИЯ ПО ДЕПЛОЮ

### 1. На локальной машине
```bash
# Закоммитить изменения
git add .
git commit -m "Replace all localhost with production values"
git push origin main
```

### 2. На сервере (89.169.0.223)
```bash
# Перейти в директорию проекта
cd /root/BlogPro

# Получить изменения
git pull origin main

# Проверить .env файлы
cat .env
cat client/.env

# Убедиться что установлены:
# VITE_API_URL=https://blogpro.tech
# VITE_WS_URL=wss://blogpro.tech
# DATABASE_URL=postgres://postgres:12345@localhost:5432/porto1
# REDIS_URL=redis://localhost:6379

# Установить зависимости (если нужно)
npm install
cd client && npm install && cd ..

# Собрать проект
npm run build

# Проверить сборку на localhost
cd client/dist
grep -r "localhost" . || echo "✅ Нет localhost в сборке"
cd ../..

# Перезапустить сервер
pm2 restart blogpro

# Проверить логи
pm2 logs blogpro --lines 50
```

### 3. Проверка работоспособности
```bash
# API
curl https://blogpro.tech/api/health

# Открыть в браузере
# https://blogpro.tech
# https://blogpro.tech/admin

# Проверить консоль браузера на ошибки
```

---

## ✅ ОЖИДАЕМЫЙ РЕЗУЛЬТАТ

После деплоя:
- ✅ Все API запросы идут на `https://blogpro.tech`
- ✅ WebSocket подключается к `wss://blogpro.tech`
- ✅ Database подключается через переменную окружения или к `89.169.0.223`
- ✅ Redis подключается через переменную окружения или к `89.169.0.223`
- ✅ Email ссылки ведут на `https://blogpro.tech`
- ✅ Swagger документация на `https://blogpro.tech`
- ✅ НЕТ упоминаний localhost в production сборке
- ✅ Fallback значения указывают на production

---

## 🔍 ПРОВЕРКА

### Команда для проверки сборки:
```bash
# После npm run build
cd client/dist
grep -r "localhost" . 2>/dev/null || echo "✅ Чисто!"
cd ../..
```

### Если найден localhost:
1. Проверить `.env` файлы
2. Пересобрать: `npm run build`
3. Проверить снова

---

## 📝 ПРИМЕЧАНИЯ

1. **Переменные окружения имеют приоритет** над fallback значениями
2. **Fallback значения теперь для production**, а не для dev
3. **Тесты и dev скрипты** не затронуты (намеренно)
4. **Database и Redis** на сервере должны использовать `DATABASE_URL` и `REDIS_URL` из `.env`
5. **Vite proxy** работает только в dev режиме, в production не используется

---

## ✅ СТАТУС: ПОЛНОСТЬЮ ЗАВЕРШЕНО

Все localhost заменены на production значения.
Приложение готово к production деплою на сервере 89.169.0.223 (blogpro.tech).
