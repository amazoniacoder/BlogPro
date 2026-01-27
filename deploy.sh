#!/bin/bash

# Скрипт деплоя BlogPro через GitHub
echo "🚀 Деплой BlogPro на сервер..."

# Переменные
SERVER_IP="89.169.0.223"
SERVER_USER="root"
REPO_URL="git@github.com:amazoniacoder/BlogPro.git"
APP_DIR="/root/BlogPro"

echo "📡 Подключение к серверу $SERVER_IP..."

ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
    # Остановка приложения если запущено
    echo "⏹️ Остановка приложения..."
    pkill -f "node.*index.js" || true
    
    # Переход в директорию приложения или клонирование
    if [ -d "/root/BlogPro" ]; then
        echo "📂 Обновление репозитория..."
        cd /root/BlogPro
        git pull origin main
    else
        echo "📥 Клонирование репозитория..."
        cd /root
        git clone git@github.com:amazoniacoder/BlogPro.git
        cd BlogPro
    fi
    
    # Установка Node.js если не установлен
    if ! command -v node &> /dev/null; then
        echo "📦 Установка Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        apt-get install -y nodejs
    fi
    
    # Установка зависимостей
    echo "📦 Установка зависимостей..."
    npm install
    cd client && npm install && cd ..
    
    # Сборка приложения
    echo "🔨 Сборка приложения..."
    cd client
    npm run build
    cd ..
    npm run build:server
    
    # Создание .env файла если не существует
    if [ ! -f ".env" ]; then
        echo "⚙️ Создание .env файла..."
        cp .env.example .env
        # Здесь можно добавить автоматическое заполнение переменных
    fi
    
    # Обновление конфигурации Nginx
    echo "🔧 Обновление Nginx..."
    if [ -f "nginx-production.conf" ]; then
        cp nginx-production.conf /etc/nginx/sites-available/blogpro
        nginx -t && systemctl reload nginx
    fi
    
    # Создание systemd сервиса
    echo "🔧 Настройка systemd сервиса..."
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
    systemctl daemon-reload
    systemctl enable blogpro
    systemctl start blogpro
    
    echo "✅ Деплой завершен!"
    echo "🌐 Сайт доступен по адресу: https://blogpro.tech"
    
    # Проверка статуса
    sleep 3
    systemctl status blogpro --no-pager
ENDSSH

echo "🎉 Деплой завершен!"