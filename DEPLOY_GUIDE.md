# Деплой BlogPro через GitHub

## 1. Подготовка к деплою

### Проверьте файлы:
- `.gitignore` - исключает ненужные файлы
- `.env.production` - production настройки
- `nginx-production.conf` - конфигурация Nginx
- `deploy.sh` - скрипт автоматического деплоя

## 2. Загрузка в GitHub

```bash
# Добавить все файлы
git add .

# Коммит
git commit -m "Production ready version"

# Загрузка в репозиторий
git push origin main
```

## 3. Деплой на сервер

### Автоматический деплой:
```bash
# Запустить скрипт деплоя
chmod +x deploy.sh
./deploy.sh
```

### Ручной деплой:

```bash
# Подключение к серверу
ssh root@89.169.0.223

# Клонирование репозитория
cd /root
git clone git@github.com:amazoniacoder/BlogPro.git
cd BlogPro

# Установка зависимостей
npm install
cd client && npm install && cd ..

# Сборка
cd client && npm run build && cd ..
npm run build:server

# Настройка окружения
cp .env.production .env

# Настройка Nginx
cp nginx-production.conf /etc/nginx/sites-available/blogpro
nginx -t
systemctl reload nginx

# Запуск приложения
NODE_ENV=production node dist/index.js
```

## 4. Настройка автозапуска

```bash
# Создание systemd сервиса
sudo systemctl enable blogpro
sudo systemctl start blogpro

# Проверка статуса
sudo systemctl status blogpro
```

## 5. Проверка работы

- Сайт: https://blogpro.tech
- API: https://blogpro.tech/api/health
- Логи: `sudo journalctl -u blogpro -f`