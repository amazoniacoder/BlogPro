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
cp .env.production .env
# Отредактируйте .env если нужно изменить настройки БД
nano .env
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