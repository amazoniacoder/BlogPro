# Устранение ошибки 502 Bad Gateway

## Проблемы найденные:

1. **Отсутствуют собранные файлы клиента** - папка `client/dist` не существует
2. **Неправильный путь к статическим файлам** - сервер ищет файлы в `server/public` вместо `client/dist`
3. **Неполная конфигурация Nginx** - файл конфигурации обрезан и содержит синтаксические ошибки

## Решение:

### 1. Локальная сборка (на вашем компьютере):

```bash
# Запустите скрипт сборки
./build-and-deploy.bat
```

Или вручную:
```bash
# Установка зависимостей
npm install
cd client && npm install && cd ..

# Сборка клиента
cd client
npm run build
cd ..

# Сборка сервера
npm run build:server
```

### 2. Загрузка на сервер:

```bash
# Загрузите архив blogpro-production.tar.gz на сервер
scp blogpro-production.tar.gz root@89.169.0.223:/root/

# На сервере распакуйте
cd /root
tar -xzf blogpro-production.tar.gz
```

### 3. Обновление конфигурации Nginx:

```bash
# Скопируйте новую конфигурацию
sudo cp /root/BlogPro/nginx-production.conf /etc/nginx/sites-available/blogpro

# Проверьте конфигурацию
sudo nginx -t

# Перезапустите nginx
sudo systemctl reload nginx
```

### 4. Запуск приложения:

```bash
cd /root/BlogPro
NODE_ENV=production node dist/index.js
```

## Структура файлов на сервере должна быть:

```
/root/BlogPro/
├── client/dist/          # Собранные файлы клиента
├── dist/                 # Собранный сервер
├── public/uploads/       # Загруженные файлы
├── package.json
├── .env.production
└── nginx-production.conf
```

## Проверка работы:

1. Проверьте что сервер запущен: `curl http://localhost:5000`
2. Проверьте nginx: `sudo systemctl status nginx`
3. Проверьте логи: `sudo tail -f /var/log/nginx/blogpro_error.log`

## Автоматический запуск (опционально):

Создайте systemd сервис:
```bash
sudo nano /etc/systemd/system/blogpro.service
```

Содержимое:
```ini
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
```

Активация:
```bash
sudo systemctl enable blogpro
sudo systemctl start blogpro
```