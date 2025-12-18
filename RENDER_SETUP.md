# Настройка Render для деплоя Backend

## Важно!

Render пытается собрать фронтенд из корня проекта, но нужно деплоить только backend.

## Настройки в Render Dashboard:

1. **Root Directory**: `backend`
   - В настройках сервиса укажите Root Directory как `backend`

2. **Build Command**: оставьте пустым или `npm install`
   - Render автоматически установит зависимости из `backend/package.json`

3. **Start Command**: `npm start`
   - Это запустит `node server.js` из папки backend

## Альтернативный способ (через render.yaml):

Если используете файл `render.yaml`, Render автоматически применит настройки из него.

## Переменные окружения на Render:

Добавьте следующие переменные в настройках сервиса:

```
FRONTEND_URL=https://your-frontend-url.vercel.app,http://localhost:3000
DB_USER=ваш_пользователь_БД
DB_HOST=ваш_хост_БД
DB_NAME=ваше_имя_БД
DB_PASSWORD=ваш_пароль_БД
DB_PORT=5432
JWT_SECRET=ваш_секретный_ключ
PORT=5000
NODE_ENV=production
```

## Проверка:

После настройки Render должен:
- Установить зависимости из `backend/package.json`
- Запустить `backend/server.js`
- НЕ пытаться собрать фронтенд

