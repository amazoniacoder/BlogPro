#!/bin/bash

# Скрипт исправления WebSocket и изображений на production сервере
# Выполнить на сервере: bash fix-websocket-images.sh

echo "🔧 Исправление WebSocket и изображений на blogpro.tech"

# 1. Обновление переменных окружения
echo "📝 Обновление .env файла..."
cat > /root/BlogPro/.env << 'EOF'
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

# 2. Исправление конфигурации Nginx
echo "🌐 Обновление конфигурации Nginx..."
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

    # Статические файлы uploads - КРИТИЧНО для отображения изображений
    location /uploads {
        alias /root/BlogPro/public/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
        add_header Cross-Origin-Resource-Policy "cross-origin";
        
        # Обработка CORS preflight запросов
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "*";
            add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
            add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range";
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type "text/plain; charset=utf-8";
            add_header Content-Length 0;
            return 204;
        }
    }

    # WebSocket соединение - КРИТИЧНО для работы WebSocket
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
        proxy_send_timeout 86400;
        
        # Дополнительные заголовки для WebSocket
        proxy_set_header Sec-WebSocket-Extensions $http_sec_websocket_extensions;
        proxy_set_header Sec-WebSocket-Key $http_sec_websocket_key;
        proxy_set_header Sec-WebSocket-Protocol $http_sec_websocket_protocol;
        proxy_set_header Sec-WebSocket-Version $http_sec_websocket_version;
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
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
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
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }
}
EOF

# 3. Проверка и перезапуск Nginx
echo "🔄 Перезапуск Nginx..."
nginx -t
if [ $? -eq 0 ]; then
    systemctl reload nginx
    echo "✅ Nginx перезапущен успешно"
else
    echo "❌ Ошибка в конфигурации Nginx"
    exit 1
fi

# 4. Проверка папки uploads
echo "📁 Проверка папки uploads..."
if [ ! -d "/root/BlogPro/public/uploads" ]; then
    mkdir -p /root/BlogPro/public/uploads
    echo "✅ Папка uploads создана"
fi

# Установка правильных прав доступа
chown -R www-data:www-data /root/BlogPro/public/uploads
chmod -R 755 /root/BlogPro/public/uploads
echo "✅ Права доступа установлены"

# 5. Перезапуск приложения
echo "🔄 Перезапуск BlogPro..."
systemctl restart blogpro
sleep 5

# 6. Проверка статуса
echo "📊 Проверка статуса сервисов..."
echo "Nginx:"
systemctl is-active nginx
echo "BlogPro:"
systemctl is-active blogpro

# 7. Тест WebSocket соединения
echo "🔌 Тест WebSocket..."
timeout 5 curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" -H "Sec-WebSocket-Key: test" -H "Sec-WebSocket-Version: 13" https://blogpro.tech/ws 2>/dev/null | head -5

echo "🎉 Исправления применены!"
echo "Проверьте:"
echo "- WebSocket: wss://blogpro.tech/ws"
echo "- Изображения: https://blogpro.tech/uploads/"
echo "- Логи: journalctl -u blogpro -f"