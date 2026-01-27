# BlogPro - Инструкция по коммиту и деплою на GitHub

## Подготовка к коммиту

### 1. Проверка статуса изменений
```bash
cd D:\BlogPro
git status
```

### 2. Проверка что папка docs исключена
```bash
# Убедиться что в .gitignore есть строка:
# docs/
cat .gitignore | grep docs
```

## Коммит изменений

### 3. Добавление файлов в индекс
```bash
# Добавить все измененные файлы
git add .

# Или добавить конкретные файлы:
git add server/services/emailService.ts
git add README.md
git add server/utils/createAdminUser.ts
git add .gitignore
```

### 4. Создание коммита
```bash
git commit -m "Update admin credentials and email settings

- Changed default admin email to genavinogradov@gmail.com
- Updated admin username to Gena with secure password
- Removed sensitive admin data from README
- Added docs/ folder to .gitignore for security
- Updated email service default recipient"
```

## Выгрузка на GitHub

### 5. Настройка удаленного репозитория (если нужно)
```bash
# Проверить текущий remote
git remote -v

# Если нужно добавить или изменить:
git remote add origin git@github.com:amazoniacoder/BlogPro.git
# или
git remote set-url origin git@github.com:amazoniacoder/BlogPro.git
```

### 6. Отправка изменений на GitHub
```bash
# Отправить в основную ветку
git push origin main

# Если это первый push:
git push -u origin main
```

## Деплой на сервер

### 7. Подключение к серверу и обновление
```bash
# Подключиться к серверу
ssh root@89.169.0.223

# Перейти в папку приложения
cd /root/BlogPro

# Остановить сервис
systemctl stop blogpro

# Обновить код с GitHub
git pull origin main

# Установить зависимости (если изменились)
npm install --legacy-peer-deps
cd client && npm install --legacy-peer-deps && cd ..

# Собрать клиент
cd client && npm run build && cd ..

# Запустить сервис
systemctl start blogpro

# Проверить статус
systemctl status blogpro
```

### 8. Обновление настроек в базе данных
```bash
# Подключиться к PostgreSQL
sudo -u postgres psql porto1

# Обновить email в настройках
UPDATE settings SET value = 'genavinogradov@gmail.com' WHERE key = 'contactRecipientEmail';

# Проверить изменение
SELECT * FROM settings WHERE key = 'contactRecipientEmail';

# Выйти из PostgreSQL
\q
```

## Проверка работы

### 9. Тестирование после деплоя
```bash
# Проверить что сайт работает
curl -I https://blogpro.tech

# Проверить логи
journalctl -u blogpro --since "5 minutes ago"

# Проверить что новый администратор создается правильно
# (при первом запуске на новом сервере)
```

### 10. Проверка в браузере
- Открыть https://blogpro.tech
- Зайти в админку https://blogpro.tech/admin
- Проверить отправку писем через контактную форму
- Убедиться что письма приходят на genavinogradov@gmail.com

## Важные замечания

### Безопасность
- ✅ Данные администратора удалены из README
- ✅ Папка docs/ исключена из коммитов
- ✅ Пароли не попадают в публичный репозиторий

### Файлы в коммите
- `server/services/emailService.ts` - обновлен email получателя
- `README.md` - удалены чувствительные данные
- `server/utils/createAdminUser.ts` - новые данные администратора
- `.gitignore` - добавлена папка docs/

### После деплоя
- Новый администратор: username `Gena`
- Email для писем: `genavinogradov@gmail.com`
- Настройки БД обновлены вручную

## Команды одной строкой

### Быстрый коммит и push
```bash
cd D:\BlogPro && git add . && git commit -m "Update admin credentials and email settings" && git push origin main
```

### Быстрый деплой на сервере
```bash
ssh root@89.169.0.223 "cd /root/BlogPro && systemctl stop blogpro && git pull origin main && npm install --legacy-peer-deps && cd client && npm install --legacy-peer-deps && npm run build && cd .. && systemctl start blogpro && systemctl status blogpro"
```

---

## ✅ Готово!

После выполнения всех шагов:
- Код обновлен на GitHub
- Сервер получил последние изменения
- Новые настройки применены
- Сайт работает с обновленными данными