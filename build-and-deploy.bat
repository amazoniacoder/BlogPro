@echo off
echo 🚀 Начинаем сборку BlogPro...

REM 1. Установка зависимостей
echo 📦 Установка зависимостей...
call npm install
cd client
call npm install
cd ..

REM 2. Сборка клиента
echo 🔨 Сборка клиента...
cd client
call npm run build
cd ..

REM 3. Сборка сервера
echo 🔨 Сборка сервера...
call npm run build:server

REM 4. Проверка сборки
echo ✅ Проверка сборки...
if not exist "client\dist" (
    echo ❌ Ошибка: client\dist не найден
    exit /b 1
)

if not exist "dist" (
    echo ❌ Ошибка: server\dist не найден
    exit /b 1
)

echo ✅ Сборка завершена успешно!

REM 5. Создание архива
echo 📦 Создание архива...
tar -czf blogpro-production.tar.gz client/dist dist public package.json .env.production nginx-production.conf

echo ✅ Архив blogpro-production.tar.gz создан

echo.
echo 📋 Инструкции для деплоя на сервер:
echo 1. Загрузите blogpro-production.tar.gz на сервер
echo 2. Распакуйте: tar -xzf blogpro-production.tar.gz
echo 3. Скопируйте nginx-production.conf в /etc/nginx/sites-available/blogpro
echo 4. Перезапустите nginx: sudo systemctl reload nginx
echo 5. Запустите приложение: NODE_ENV=production node dist/index.js

pause