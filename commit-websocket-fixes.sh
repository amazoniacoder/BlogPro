#!/bin/bash

# Скрипт для коммита исправлений WebSocket в GitHub

echo "🔧 Подготовка коммита исправлений WebSocket..."

# 1. Добавить все изменения
git add .

# 2. Создать коммит с описанием исправлений
git commit -m "🔧 Fix WebSocket connection and static files serving

- Fixed WebSocketProvider import in App.tsx to use correct context
- Enhanced WebSocket service with better logging for blog events  
- Added debug information for WebSocket connection URL
- Updated UI system WebSocketProvider to use full context logic
- Created Nginx configuration with proper WebSocket support
- Added CORS headers for static files serving
- Fixed WebSocket proxy configuration with proper timeouts
- Added environment variables for production deployment

Fixes:
- WebSocket connection to wss://blogpro.tech/ws
- Real-time blog updates on frontend
- Static images serving from /uploads
- Production deployment configuration"

# 3. Отправить в GitHub
git push origin main

echo "✅ Изменения отправлены в GitHub!"
echo "Теперь можно развернуть на сервере:"
echo "1. git pull origin main"
echo "2. npm run build"
echo "3. systemctl restart blogpro"