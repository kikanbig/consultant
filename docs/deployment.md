# Инструкция по деплою навыка Алисы

## Подготовка к деплою

### 1. Регистрация в Яндекс.Диалогах
1. Перейдите на [https://dialogs.yandex.ru/](https://dialogs.yandex.ru/)
2. Войдите в систему с помощью Яндекс ID
3. Нажмите "Создать навык"
4. Выберите тип навыка: "Алиса"

### 2. Настройка навыка
**Основная информация:**
- Название: "Ассистент торгового зала"
- Описание: "Помощник для покупателей в выборе мебели"
- Категория: "Покупки"
- Иконка: загрузите логотип магазина

**Настройки навыка:**
- Тип активации: "Фраза-активатор"
- Фразы активации:
  - "Покажи товары"
  - "Расскажи про мебель"
  - "Что у вас есть"
  - "Помоги выбрать"

## Варианты деплоя

### Вариант 1: Yandex Cloud Functions (рекомендуется)

1. **Создание функции:**
```bash
# Архивируем код
zip -r alice-skill.zip src/ package.json

# Загружаем в Yandex Cloud через CLI или веб-интерфейс
```

2. **Настройка функции:**
- Runtime: Node.js 18
- Entrypoint: `src/index.handler`
- Timeout: 15 секунд
- Memory: 128 MB

3. **Переменные окружения:**
```
NODE_ENV=production
ALICE_SKILL_ID=ваш_skill_id
```

4. **Код-адаптер для Cloud Functions:**
```javascript
// src/cloud-handler.js
const app = require('./index');

module.exports.handler = async (event, context) => {
  return new Promise((resolve, reject) => {
    const req = {
      body: event.body,
      method: 'POST',
      headers: event.headers
    };
    
    const res = {
      json: (data) => resolve({
        statusCode: 200,
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      })
    };
    
    app.handleRequest(req, res);
  });
};
```

### Вариант 2: Обычный VPS/VDS

1. **Установка на сервер:**
```bash
# Клонируем репозиторий
git clone https://github.com/your-repo/alice-store-skill.git
cd alice-store-skill

# Устанавливаем зависимости
npm install

# Настраиваем PM2 для автозапуска
npm install -g pm2
pm2 start src/index.js --name "alice-skill"
pm2 startup
pm2 save
```

2. **Настройка Nginx:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Вариант 3: Heroku

1. **Подготовка:**
```bash
# Создаем Procfile
echo "web: node src/index.js" > Procfile

# Настраиваем package.json
npm run build
```

2. **Деплой:**
```bash
heroku create your-alice-skill
git push heroku main
heroku config:set NODE_ENV=production
```

## Настройка Webhook в Яндекс.Диалогах

1. **URL webhook'а:**
   - Cloud Functions: `https://functions.yandexcloud.net/function-id`
   - VPS: `https://your-domain.com/webhook`
   - Heroku: `https://your-app.herokuapp.com/webhook`

2. **Заголовки запроса:**
   - `Content-Type: application/json`
   - `User-Agent: Yandex-Dialogs/1.0`

## Тестирование

### 1. Локальное тестирование
```bash
# Запуск в режиме разработки
npm run dev

# Тест webhook'а
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "request": {
      "command": "привет",
      "original_utterance": "привет"
    },
    "session": {
      "new": true,
      "message_id": 0,
      "session_id": "test",
      "skill_id": "test",
      "user_id": "test"
    },
    "version": "1.0"
  }'
```

### 2. Тестирование в Яндекс.Диалогах
1. Откройте консоль навыка
2. Перейдите в раздел "Тестирование"
3. Введите тестовые фразы:
   - "Привет"
   - "Расскажи про диваны"
   - "Какие есть акции?"

## Мониторинг и логи

### Просмотр логов
```bash
# Cloud Functions
yc serverless function logs function-id

# PM2
pm2 logs alice-skill

# Heroku
heroku logs --tail
```

### Метрики навыка
Следите за метриками в консоли Яндекс.Диалогов:
- Количество активаций
- Время ответа
- Ошибки и их частота
- Пользовательская вовлеченность

## Обновление навыка

### Обновление кода
```bash
# Cloud Functions
zip -r alice-skill-v2.zip src/ package.json
# Загрузите новую версию в консоли

# VPS
git pull origin main
npm install
pm2 restart alice-skill

# Heroku
git push heroku main
```

### Версионирование
- Используйте теги Git для версий
- Обновляйте версию в `package.json`
- Ведите CHANGELOG.md

## Безопасность

1. **Валидация запросов:**
   - Проверяйте подпись запросов от Яндекса
   - Ограничивайте источники запросов

2. **Переменные окружения:**
   - Не храните секреты в коде
   - Используйте .env файлы локально

3. **HTTPS:**
   - Обязательно используйте HTTPS для webhook'а
   - Получите SSL-сертификат (Let's Encrypt)

## Поддержка

При возникновении проблем:
1. Проверьте логи навыка
2. Убедитесь в корректности URL webhook'а
3. Проверьте формат ответов
4. Обратитесь к документации Яндекс.Диалогов 