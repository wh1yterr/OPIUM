# Настройка Render для деплоя Backend

## Важно!

Render пытается собрать фронтенд из корня проекта, но нужно деплоить только backend.

## Настройки в Render Dashboard:

**ВАЖНО:** Если `render.yaml` не применяется автоматически, настройте вручную:

1. **Root Directory**: `backend` ⚠️ ОБЯЗАТЕЛЬНО!
   - В настройках сервиса (Settings → Build & Deploy) укажите Root Directory как `backend`
   - Без этого Render будет пытаться собрать фронтенд из корня

2. **Build Command**: `npm install`
   - Render автоматически перейдет в Root Directory (backend) и установит зависимости

3. **Start Command**: `npm start`
   - Это запустит `node server.js` из папки backend

### Проверка:
После настройки Root Directory, логи должны показывать:
- `==> Running 'npm install'` (в папке backend)
- `==> Running 'npm start'` (в папке backend)
- НЕ должно быть `react-scripts` или попыток собрать фронтенд

## Альтернативный способ (через render.yaml):

Если используете файл `render.yaml`, Render автоматически применит настройки из него.

**Важно:** 
- `render.yaml` должен быть в корне репозитория ИЛИ в папке `backend` (если Root Directory = `backend`)
- Создан файл `backend/render.yaml` для случая, когда Root Directory установлен как `backend`

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

