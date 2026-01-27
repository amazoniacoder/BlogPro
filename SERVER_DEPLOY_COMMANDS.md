# Первоначальная установка BlogPro на сервер

## 1. Подключение к серверу:
```bash
ssh root@89.169.0.223
```

## 2. Установка Node.js (если не установлен):
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs
node --version
npm --version
```

## 3. Клонирование репозитория:
```bash
cd /root
git clone https://github.com/amazoniacoder/BlogPro.git
cd BlogPro
```

## 4. Установка зависимостей:
```bash
npm install
cd client && npm install && cd ..
```

## 5. Сборка приложения:
```bash
cd client && npm run build && cd ..
npm run build:server
```

## 6. Настройка окружения:
```bash
# Создание .env файла
cat > .env << 'EOF'
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=postgres://postgres:12345@localhost:5432/porto1

# Security
SESSION_SECRET=8f3a9b2c5d7e1f4a6b8c9d0e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a
JWT_SECRET=1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b

# Email
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=amazoniacoder@yandex.ru
SMTP_PASS=kvwvegerqlinnmqu

# Domain
DOMAIN=blogpro.tech
PUBLIC_URL=https://blogpro.tech

# Redis (optional)
REDIS_URL=redis://localhost:6379
EOF
```

## 7. Настройка Nginx:
```bash
# Установка Nginx если не установлен
apt update && apt install -y nginx

# Копирование конфигурации
cp nginx-production.conf /etc/nginx/sites-available/blogpro
ln -sf /etc/nginx/sites-available/blogpro /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Проверка и перезапуск
nginx -t
systemctl enable nginx
systemctl restart nginx
```

## 8. Настройка базы данных PostgreSQL:
```bash
# Установка PostgreSQL если не установлен
apt install -y postgresql postgresql-contrib

# Запуск сервиса
systemctl enable postgresql
systemctl start postgresql

# Создание базы данных (если не существует)
sudo -u postgres psql -c "ALTER USER postgres PASSWORD '12345';"
sudo -u postgres createdb porto1 || echo "БД уже существует"
```

## 9. Создание systemd сервиса:
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
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
```

## 10. Запуск сервиса:
```bash
systemctl daemon-reload
systemctl enable blogpro
systemctl start blogpro
```

## 11. Проверка:
```bash
# Проверка статуса сервиса
systemctl status blogpro

# Проверка работы приложения
curl http://localhost:5000

# Просмотр логов
journalctl -u blogpro -f
```

## 12. Настройка SSL (опционально):
```bash
# Установка Certbot
apt install -y certbot python3-certbot-nginx

# Получение SSL сертификата
certbot --nginx -d blogpro.tech -d www.blogpro.tech

# Перезапуск Nginx
systemctl reload nginx
```

## Готово! Сайт доступен по адресу: https://blogpro.tech