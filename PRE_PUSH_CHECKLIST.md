# Чеклист перед отправкой на GitHub

## ✅ Что уже сделано

1. **Конфигурация окружения**
   - ✅ Создан `.env.production` с настройками для продакшн
   - ✅ Создан `client/.env.production` с API URL
   - ✅ Обновлены `.env.example` файлы
   - ✅ Создан `client/src/config/api.ts` для динамических URL

2. **Настройки базы данных**
   - ✅ DATABASE_URL: `postgres://postgres:12345@localhost:5432/porto1`

3. **Настройки email (Yandex)**
   - ✅ SMTP_HOST: `smtp.yandex.ru`
   - ✅ SMTP_PORT: `465`
   - ✅ SMTP_SECURE: `true`
   - ✅ SMTP_USER: `amazoniacoder@yandex.ru`
   - ✅ SMTP_PASS: `kvwvegerqlinnmqu`

4. **Настройки домена и сервера**
   - ✅ Домен: `blogpro.tech`
   - ✅ IP сервера: `89.169.0.223`
   - ✅ CORS настроен на домен
   - ✅ API URL в клиенте использует переменные окружения

5. **Git репозиторий**
   - ✅ Инициализирован Git
   - ✅ Добавлен remote: `git@github.com:amazoniacoder/BlogPro.git`
   - ✅ Создан первый коммит
   - ✅ Создан коммит с конфигурацией деплоя

6. **Документация**
   - ✅ `DEPLOYMENT.md` - полная инструкция по деплою
   - ✅ `QUICK_DEPLOY.md` - быстрая инструкция на русском

## 🔐 Перед отправкой на GitHub

### 1. Проверьте SSH ключ

```bash
ssh -T git@github.com
```

Должно вывести: `Hi amazoniacoder! You've successfully authenticated...`

### 2. Убедитесь, что .env файлы не попадут в репозиторий

```bash
# Проверьте .gitignore
cat .gitignore | grep ".env"
```

Должно быть:
```
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Keep example files
!.env.example
!.env.production.example
```

⚠️ **ВАЖНО**: Файлы `.env.production` и `client/.env.production` содержат реальные пароли и НЕ должны попасть в Git!

### 3. Проверьте, что файлы не добавлены в Git

```bash
git status
```

Убедитесь, что `.env.production` и `client/.env.production` НЕ в списке для коммита.

## 📤 Отправка на GitHub

```bash
# Отправьте код на GitHub
git push -u origin main
```

Если возникнет ошибка с веткой, используйте:

```bash
git branch -M main
git push -u origin main
```

## 🚀 После отправки на GitHub

### На сервере (89.169.0.223)

1. **Клонируйте репозиторий**
   ```bash
   git clone git@github.com:amazoniacoder/BlogPro.git
   cd BlogPro
   ```

2. **Создайте .env файлы вручную**
   ```bash
   # Скопируйте содержимое из локальных файлов
   nano .env
   # Вставьте содержимое из D:\BlogPro\.env.production
   
   nano client/.env
   # Вставьте содержимое из D:\BlogPro\client\.env.production
   ```

3. **Следуйте инструкциям из QUICK_DEPLOY.md**

## 📋 Содержимое .env файлов для сервера

### Корневой .env (скопируйте на сервер)

```env
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

DATABASE_URL=postgres://postgres:12345@localhost:5432/porto1

SESSION_SECRET=blogpro-production-secret-key-change-this-in-production

REDIS_URL=redis://localhost:6379

SMTP_HOST=smtp.yandex.ru
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=amazoniacoder@yandex.ru
SMTP_PASS=kvwvegerqlinnmqu

API_URL=https://blogpro.tech
CLIENT_URL=https://blogpro.tech
SERVER_IP=89.169.0.223

JWT_SECRET=blogpro-jwt-secret-change-this-in-production
JWT_EXPIRES_IN=7d

MAX_FILE_SIZE=50mb
UPLOAD_DIR=public/uploads

CORS_ORIGIN=https://blogpro.tech

SSL_ENABLED=true
```

### client/.env (скопируйте на сервер)

```env
VITE_API_URL=https://blogpro.tech
VITE_WS_URL=wss://blogpro.tech

VITE_NODE_ENV=production

VITE_ENABLE_MODERN_FORMATTING=true
VITE_ENABLE_MODERN_DELETION=true
VITE_ENABLE_MODERN_INPUT_EVENTS=true
VITE_ENABLE_SEMANTIC_HTML=true
VITE_ENABLE_PERFORMANCE_MONITORING=true
```

## ⚠️ Важные замечания

1. **Не коммитьте .env файлы с реальными паролями!**
2. **Измените SESSION_SECRET и JWT_SECRET на сервере на уникальные значения**
3. **Используйте сильные пароли для базы данных**
4. **Настройте firewall на сервере**
5. **Используйте SSL сертификаты (Let's Encrypt)**

## 🆘 Если что-то пошло не так

### Если случайно закоммитили .env с паролями

```bash
# Удалите файл из Git (но оставьте локально)
git rm --cached .env.production
git rm --cached client/.env.production

# Закоммитьте изменения
git commit -m "Remove sensitive .env files"

# Отправьте на GitHub
git push origin main

# Смените все пароли!
```

### Если нужно изменить remote URL

```bash
git remote set-url origin git@github.com:amazoniacoder/BlogPro.git
```

## ✅ Готово к деплою!

После успешной отправки на GitHub, следуйте инструкциям в `QUICK_DEPLOY.md` для развертывания на сервере.
