# Быстрая инструкция по деплою BlogPro

## Что было сделано

✅ Созданы файлы конфигурации:
- `.env.production` - конфигурация сервера для продакшн
- `client/.env.production` - конфигурация клиента для продакшн
- `.env.example` - обновлен шаблон конфигурации
- `client/.env.example` - создан шаблон для клиента
- `client/src/config/api.ts` - конфигурация API URL
- `DEPLOYMENT.md` - полная инструкция по деплою

✅ Обновлены настройки:
- База данных: `postgres://postgres:12345@localhost:5432/porto1`
- Email (Yandex): `amazoniacoder@yandex.ru`
- Домен: `blogpro.tech`
- IP сервера: `89.169.0.223`
- CORS настроен на домен
- API клиент использует переменные окружения

✅ Git репозиторий:
- Инициализирован Git
- Добавлен remote: `git@github.com:amazoniacoder/BlogPro.git`
- Создан первый коммит

## Следующие шаги

### 1. Отправка кода на GitHub

```bash
# Проверьте SSH ключ
ssh -T git@github.com

# Отправьте код
git push -u origin main
```

### 2. На сервере (89.169.0.223)

```bash
# Клонируйте репозиторий
git clone git@github.com:amazoniacoder/BlogPro.git
cd BlogPro

# Скопируйте production конфигурацию
cp .env.production .env
cp client/.env.production client/.env

# Установите зависимости
npm install
cd client && npm install && cd ..

# Соберите приложение
npm run build

# Установите PM2 (если еще не установлен)
npm install -g pm2

# Запустите приложение
pm2 start dist/index.js --name blogpro
pm2 save
pm2 startup
```

### 3. Настройка Nginx (рекомендуется)

Создайте файл `/etc/nginx/sites-available/blogpro.tech`:

```nginx
server {
    listen 80;
    server_name blogpro.tech www.blogpro.tech;
    
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /ws {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Активируйте конфигурацию:

```bash
sudo ln -s /etc/nginx/sites-available/blogpro.tech /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. SSL сертификат (Let's Encrypt)

```bash
# Установите certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Получите сертификат
sudo certbot --nginx -d blogpro.tech -d www.blogpro.tech

# Автоматическое обновление
sudo certbot renew --dry-run
```

### 5. Настройка базы данных

```bash
# Подключитесь к PostgreSQL
psql -U postgres

# Создайте базу данных (если не существует)
CREATE DATABASE porto1;

# Выйдите из psql
\q

# Запустите миграции
cd /path/to/BlogPro
npm run db:push
```

## Проверка работы

1. Откройте браузер: `https://blogpro.tech`
2. Проверьте API: `https://blogpro.tech/api/health`
3. Проверьте WebSocket: `wss://blogpro.tech/ws`
4. Войдите в админку: `https://blogpro.tech/admin`
   - Логин: `admin`
   - Пароль: `admin123`

## Обновление приложения

```bash
cd /path/to/BlogPro
git pull origin main
npm install
npm run build
pm2 restart blogpro
```

## Полезные команды

```bash
# Просмотр логов
pm2 logs blogpro

# Статус приложения
pm2 status

# Перезапуск
pm2 restart blogpro

# Остановка
pm2 stop blogpro

# Мониторинг
pm2 monit
```

## Важные замечания

⚠️ **Безопасность:**
- Измените `SESSION_SECRET` и `JWT_SECRET` в `.env` на уникальные значения
- Смените пароль администратора после первого входа
- Настройте firewall (UFW)
- Используйте SSH ключи вместо паролей

⚠️ **Производительность:**
- Убедитесь, что Redis установлен и запущен для кэширования
- Настройте регулярные бэкапы базы данных
- Мониторьте использование ресурсов

## Поддержка

Полная документация: `DEPLOYMENT.md`

Структура проекта: `README.md`
