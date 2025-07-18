# 🚀 Быстрый старт - Навык Алисы для торгового зала

## За 5 минут до работающего навыка

### 1. Установка и запуск

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm start
```

Навык будет доступен по адресу: `http://localhost:3000`

### 2. Быстрый тест

Откройте второй терминал и протестируйте:

```bash
# Приветствие (новая сессия)
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{"request":{"command":"","original_utterance":""},"session":{"new":true,"message_id":0,"session_id":"test","skill_id":"test","user_id":"test"},"version":"1.0"}'

# Информация о товарах
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{"request":{"command":"расскажи про диваны","original_utterance":"расскажи про диваны"},"session":{"new":false,"message_id":1,"session_id":"test","skill_id":"test","user_id":"test"},"version":"1.0"}'
```

### 3. Что умеет навык:

✅ **Готово к использованию:**
- 🛋️ Рассказывает о товарах (диваны, кровати, шкафы, столы)
- 💰 Информирует об акциях и скидках
- 👥 Направляет к консультанту
- ❓ Справочная система

✅ **Фразы для тестирования:**
- "Расскажи про диваны"
- "Какие есть кровати?"
- "Нужен консультант"
- "Помощь"

## Следующие шаги

### Для тестирования в Яндекс.Диалогах:

1. **Создайте навык:**
   - Идите на https://dialogs.yandex.ru/
   - Создайте новый навык типа "Алиса"
   - Укажите webhook URL

2. **Для локального тестирования используйте ngrok:**
   ```bash
   # Установите ngrok
   npm install -g ngrok
   
   # Создайте туннель (в отдельном терминале)
   ngrok http 3000
   
   # Используйте полученный https URL как webhook
   ```

3. **Для production деплоя:**
   - Yandex Cloud Functions (рекомендуется)
   - VPS/VDS с PM2
   - Heroku

### Настройка под ваш магазин:

1. **Товары** - отредактируйте `src/data/products.js`
2. **Информация о магазине** - измените `config/config.js`
3. **Диалоги** - настройте `src/handlers/mainHandler.js`

## Возможности для расширения

🔄 **Легко добавить:**
- Интеграцию с реальной базой товаров
- Систему заказов
- Персонализацию по клиентам
- Аналитику использования
- Многоязычность

🎯 **Готовые сценарии:**
- Подбор товара по параметрам
- Сравнение характеристик
- Информация о наличии
- Расчет стоимости доставки
- Программы лояльности

## Поддержка

📚 **Документация:**
- `README.md` - полное описание
- `docs/deployment.md` - инструкции по деплою
- `docs/dialog-examples.md` - примеры диалогов

🧪 **Тестирование:**
```bash
npm test  # Запуск автотестов
```

🐛 **Отладка:**
```bash
npm run dev  # Запуск с nodemon для автоперезапуска
```

---

**⚡ Готово! Ваш навык Алисы для торгового зала работает!**

Теперь покупатели смогут получать информацию о товарах с помощью голосового помощника прямо в торговом зале. 