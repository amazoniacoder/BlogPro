#!/bin/bash

# Автоматическая установка BlogPro с нуля на сервер
echo "🚀 Начинаем установку BlogPro с нуля..."

# Обновление системы
echo "📦 Обновление системы..."
apt update && apt upgrade -y

# Установка Node.js
echo "📦 Установка Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs git

# Установка PostgreSQL
echo "🗄️ Установка PostgreSQL..."
apt install -y postgresql postgresql-contrib
systemctl enable postgresql
systemctl start postgresql

# Настройка PostgreSQL
echo "🔧 Настройка PostgreSQL..."
sudo -u postgres psql -c "ALTER USER postgres PASSWORD '12345';"
sudo -u postgres createdb porto1 || echo "БД уже существует"

# Установка Nginx
echo "🌐 Установка Nginx..."
apt install -y nginx
systemctl enable nginx

# Клонирование репозитория
echo "📥 Клонирование репозитория..."
cd /root
rm -rf BlogPro
git clone https://github.com/amazoniacoder/BlogPro.git
cd BlogPro

# Установка зависимостей
echo "📦 Установка зависимостей..."
npm install
cd client && npm install && cd ..

# Сборка приложения
echo "🔨 Сборка приложения..."
cd client && npm run build && cd ..
npm run build:server

# Настройка окружения
echo "⚙️ Настройка окружения..."
cp .env.production .env

# Настройка Nginx
echo "🔧 Настройка Nginx..."
cp nginx-production.conf /etc/nginx/sites-available/blogpro
ln -sf /etc/nginx/sites-available/blogpro /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# Создание systemd сервиса
echo "🔧 Создание systemd сервиса..."
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

# Запуск сервиса
echo "🚀 Запуск сервиса..."
systemctl daemon-reload
systemctl enable blogpro
systemctl start blogpro

# Проверка статуса
echo "✅ Проверка статуса..."
sleep 3
systemctl status blogpro --no-pager

echo ""
echo "🎉 Установка завершена!"
echo "🌐 Сайт доступен по адресу: http://blogpro.tech"
echo "📊 Для настройки SSL запустите: certbot --nginx -d blogpro.tech -d www.blogpro.tech"
echo "📋 Логи: journalctl -u blogpro -f"