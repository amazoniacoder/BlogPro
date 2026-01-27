# BlogPro - Инструкция по развертыванию на сервере

## СТРУКТУРА ПРИЛОЖЕНИЯ НА СЕРВЕРЕ

**ВАЖНО: Данная структура является стандартной и НЕ ДОЛЖНА изменяться!**

```
/root/BlogPro/                          # Корневая папка приложения
├── server/                             # Серверная часть (TypeScript)
│   ├── index.ts                        # Главный файл сервера
│   ├── api/                            # API маршруты
│   ├── db/                             # База данных
│   └── services/                       # Сервисы
├── client/                             # Клиентская часть
│   ├── src/                            # Исходники React
│   ├── dist/                           # Собранные файлы клиента
│   └── package.json                    # Зависимости клиента
├── public/                             # Статические файлы
│   └── uploads/                        # Загруженные файлы
├── .env                                # Переменные окружения
└── package.json                        # Зависимости сервера
```

**СПОСОБ ЗАПУСКА:**
- Сервер: `tsx server/index.ts` (из корневой папки)
- Клиент: собирается в `client/dist/`
- Статические файлы: `public/uploads/`

---

## 1. Подключение к серверу
```bash
ssh root@89.169.0.223
```

## 2. Установка Node.js и зависимостей
```bash
# Установка Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Установка tsx для запуска TypeScript
npm install -g tsx

# Проверка версий
node --version
npm --version
tsx --version
```

## 3. Клонирование и настройка приложения
```bash
cd /root

# Остановка старого приложения
systemctl stop blogpro || true
pkill -f "tsx.*server/index.ts" || true

# Сохранение данных (если нужно)
if [ -d "BlogPro/public/uploads" ]; then
    cp -r BlogPro/public/uploads /tmp/uploads_backup
fi

# Клонирование
rm -rf BlogPro
git clone https://github.com/amazoniacoder/BlogPro.git
cd BlogPro

# Восстановление uploads
if [ -d "/tmp/uploads_backup" ]; then
    mkdir -p public/uploads
    cp -r /tmp/uploads_backup/* public/uploads/
    rm -rf /tmp/uploads_backup
fi
```

## 4. Установка зависимостей
```bash
# Серверные зависимости
npm install --legacy-peer-deps

# Клиентские зависимости
cd client && npm install --legacy-peer-deps && cd ..
```

## 5. Сборка приложения
```bash
# Сборка клиента
cd client && npm run build && cd ..

# Проверка что клиент собрался
ls -la client/dist/
```

## 6. Настройка переменных окружения
```bash
cat > .env << 'EOF'
NODE_ENV=production
PORT=5000
DATABASE_URL=postgres://postgres:12345@localhost:5432/porto1
SESSION_SECRET=8f3a9b2c5d7e1f4a6b8c9d0e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a
JWT_SECRET=1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=amazoniacoder@yandex.ru
SMTP_PASS=kvwvegerqlinnmqu
DOMAIN=blogpro.tech
PUBLIC_URL=https://blogpro.tech
VITE_API_URL=https://blogpro.tech
VITE_WS_URL=wss://blogpro.tech
REDIS_URL=redis://localhost:6379
EOF
```

## 7. Настройка базы данных PostgreSQL
```bash
# Установка PostgreSQL
apt install -y postgresql postgresql-contrib

# Запуск сервиса
systemctl enable postgresql
systemctl start postgresql

# Настройка базы данных
sudo -u postgres psql -c "ALTER USER postgres PASSWORD '12345';"
sudo -u postgres createdb porto1 || echo "БД уже существует"
```

## 8. Создание systemd сервиса
```bash
cat > /etc/systemd/system/blogpro.service << 'EOF'
[Unit]
Description=BlogPro Application
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/BlogPro
Environment=NODE_ENV=production
ExecStart=/usr/bin/tsx server/index.ts
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Запуск сервиса
systemctl daemon-reload
systemctl enable blogpro
systemctl start blogpro
systemctl status blogpro
```

## 9. Настройка Nginx
```bash
# Установка Nginx
apt update && apt install -y nginx

# Создание конфигурации
cat > /etc/nginx/sites-available/blogpro << 'EOF'
# HTTP редирект на HTTPS
server {
    listen 80;
    server_name blogpro.tech www.blogpro.tech;
    return 301 https://blogpro.tech$request_uri;
}

# HTTPS редирект с www на основной домен
server {
    listen 443 ssl http2;
    server_name www.blogpro.tech;
    
    ssl_certificate /etc/letsencrypt/live/blogpro.tech/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/blogpro.tech/privkey.pem;
    
    return 301 https://blogpro.tech$request_uri;
}

# Основной сервер
server {
    listen 443 ssl http2;
    server_name blogpro.tech;

    # SSL конфигурация
    ssl_certificate /etc/letsencrypt/live/blogpro.tech/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/blogpro.tech/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Размер загружаемых файлов
    client_max_body_size 50M;

    # Логи
    access_log /var/log/nginx/blogpro_access.log;
    error_log /var/log/nginx/blogpro_error.log;

    # Статические файлы uploads
    location /uploads {
        alias /root/BlogPro/public/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
        add_header Cross-Origin-Resource-Policy "cross-origin";
    }

    # Статические файлы приложения (CSS, JS, изображения)
    location ~* \.(css|js|mjs|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root /root/BlogPro/client/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # WebSocket соединение
    location /ws {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # API маршруты
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Основное приложение
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Активация конфигурации
ln -sf /etc/nginx/sites-available/blogpro /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

## 10. Настройка SSL (Let's Encrypt)
```bash
# Установка Certbot
apt install -y certbot python3-certbot-nginx

# Получение SSL сертификата
certbot --nginx -d blogpro.tech -d www.blogpro.tech

# Перезапуск Nginx
systemctl reload nginx
```

## 11. Проверка работы
```bash
# Проверка статуса сервисов
systemctl status blogpro
systemctl status nginx

# Проверка портов
ss -tlnp | grep :5000
ss -tlnp | grep :443

# Проверка работы приложения
curl http://localhost:5000

# Просмотр логов
journalctl -u blogpro -f
```

## 12. Обновление приложения
```bash
cd /root/BlogPro

# Остановка сервиса
systemctl stop blogpro

# Обновление кода
git pull origin main

# Установка зависимостей (если изменились)
npm install --legacy-peer-deps
cd client && npm install --legacy-peer-deps && cd ..

# Сборка клиента
cd client && npm run build && cd ..

# Запуск сервиса
systemctl start blogpro
systemctl status blogpro
```

## Важные моменты:

Команда git pull загрузит только измененные файлы, не удаляя остальные

Папка public/uploads/ с загруженными файлами останется нетронутой

База данных и настройки (.env) сохранятся

Пересборка клиента (npm run build) обновит только файлы в client/dist/

Если нужно посмотреть логи после запуска:

journalctl -u blogpro -f

Copy
bash
Этот процесс безопасен и не затронет пользовательские данные.

## Готово! Сайт доступен по адресу: https://blogpro.tech

---

## ВАЖНЫЕ ЗАМЕЧАНИЯ:

1. **НЕ ИЗМЕНЯЙТЕ** структуру папок на сервере
2. **ВСЕГДА** используйте `tsx server/index.ts` для запуска сервера
3. **ОБЯЗАТЕЛЬНО** собирайте клиент в `client/dist/`
4. **НИКОГДА** не запускайте сервер из других папок
5. **ВСЕГДА** проверяйте статус сервиса после изменений

Эта структура проверена и работает стабильно!