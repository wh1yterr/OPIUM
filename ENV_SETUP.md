# Настройка переменных окружения

## Frontend (Vercel)

В настройках проекта на Vercel добавьте следующие переменные окружения:

```
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
REACT_APP_FRONTEND_URL=https://your-frontend-url.vercel.app
```

### Где добавить:
1. Зайдите в настройки проекта на Vercel
2. Перейдите в раздел "Environment Variables"
3. Добавьте переменные:
   - `REACT_APP_API_URL` = ваш URL бэкенда (например: `https://opium-backend.onrender.com/api`)
   - `REACT_APP_FRONTEND_URL` = ваш URL фронтенда (например: `https://opium.vercel.app`)

## Backend (Render)

В настройках проекта на Render добавьте следующие переменные окружения:

```
FRONTEND_URL=https://your-frontend-url.vercel.app,http://localhost:3000
DB_USER=ваш_пользователь_БД
DB_HOST=ваш_хост_БД
DB_NAME=ваше_имя_БД
DB_PASSWORD=ваш_пароль_БД
DB_PORT=5432
JWT_SECRET=ваш_секретный_ключ
PORT=5000
```

### Где добавить:
1. Зайдите в настройки проекта на Render
2. Перейдите в раздел "Environment"
3. Добавьте все переменные

### Важно:
- `FRONTEND_URL` может содержать несколько URL через запятую (для продакшена и локальной разработки)
- Не коммитьте файл `.env` в Git (он уже в `.gitignore`)

## Локальная разработка

Создайте файл `.env` в корне проекта (для фронтенда) и `backend/.env` (для бэкенда):

### `.env` (в корне проекта):
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_FRONTEND_URL=http://localhost:3000
```

### `backend/.env`:
```
FRONTEND_URL=http://localhost:3000
DB_USER=ваш_пользователь_БД
DB_HOST=localhost
DB_NAME=ваше_имя_БД
DB_PASSWORD=ваш_пароль_БД
DB_PORT=5432
JWT_SECRET=ваш_секретный_ключ
PORT=5000
```

