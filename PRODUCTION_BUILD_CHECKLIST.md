# Production Build Checklist

## Перед сборкой на сервере

### 1. Проверка переменных окружения

```bash
# На сервере проверьте файлы .env
cat .env
cat client/.env
```

Убедитесь, что установлены:
- ✅ `VITE_API_URL=https://blogpro.tech`
- ✅ `VITE_WS_URL=wss://blogpro.tech`
- ✅ `API_URL=https://blogpro.tech`
- ✅ `CLIENT_URL=https://blogpro.tech`
- ✅ `NODE_ENV=production`

### 2. Сборка приложения

```bash
# Установка зависимостей
npm install
cd client && npm install && cd ..

# Сборка клиента
cd client
npm run build
cd ..

# Сборка сервера
npm run build
```

### 3. Проверка собранных файлов

```bash
# Проверка на наличие localhost в клиентской сборке
cd client/dist
grep -r "localhost" . || echo "✅ Нет localhost в сборке"
cd ../..

# Проверка серверной сборки
cd dist
grep -r "localhost" . | grep -v "node_modules" || echo "✅ Нет localhost в сборке"
cd ..
```

### 4. Запуск production сервера

```bash
# Остановка старой версии
pm2 stop blogpro

# Запуск новой версии
pm2 start dist/index.js --name blogpro

# Сохранение конфигурации
pm2 save

# Проверка статуса
pm2 status
pm2 logs blogpro --lines 50
```

## Проверка работоспособности

### 1. Проверка API
```bash
curl https://blogpro.tech/api/health
```

Ожидаемый ответ: `{"status":"ok"}`

### 2. Проверка WebSocket
```bash
# В браузере откройте консоль и выполните:
# const ws = new WebSocket('wss://blogpro.tech/ws');
# ws.onopen = () => console.log('✅ WebSocket connected');
# ws.onerror = (e) => console.error('❌ WebSocket error:', e);
```

### 3. Проверка статических файлов
```bash
curl -I https://blogpro.tech/uploads/placeholder.webp
```

### 4. Проверка админки
Откройте: `https://blogpro.tech/admin`

## Troubleshooting

### Проблема: API возвращает 502/504
```bash
# Проверьте логи сервера
pm2 logs blogpro

# Проверьте статус
pm2 status

# Перезапустите
pm2 restart blogpro
```

### Проблема: WebSocket не подключается
```bash
# Проверьте Nginx конфигурацию
sudo nginx -t

# Проверьте логи Nginx
sudo tail -f /var/log/nginx/error.log

# Убедитесь, что WebSocket проксируется
grep -A 5 "location /ws" /etc/nginx/sites-available/blogpro.tech
```

### Проблема: Клиент пытается подключиться к localhost
```bash
# Пересоберите клиент с правильными переменными
cd client
cat .env  # Проверьте содержимое
npm run build
cd ..
pm2 restart blogpro
```

## Rollback процедура

Если что-то пошло не так:

```bash
# Откатитесь к предыдущему коммиту
git log --oneline -5
git checkout <previous-commit-hash>

# Пересоберите
npm run build

# Перезапустите
pm2 restart blogpro
```

## Мониторинг после деплоя

```bash
# Следите за логами в реальном времени
pm2 logs blogpro

# Мониторинг ресурсов
pm2 monit

# Проверка использования памяти
pm2 show blogpro
```

## Финальная проверка

- [ ] Сайт открывается по https://blogpro.tech
- [ ] API отвечает на /api/health
- [ ] WebSocket подключается (проверить в консоли браузера)
- [ ] Админка доступна и работает
- [ ] Загрузка файлов работает
- [ ] Email отправка работает (проверить форму контактов)
- [ ] База данных подключена
- [ ] Redis кэширование работает (опционально)
- [ ] SSL сертификат валиден
- [ ] Нет ошибок в логах PM2
- [ ] Нет ошибок в логах Nginx
