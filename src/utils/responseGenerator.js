const { convertWordsToDigits } = require('./articleSearch');

// Генерация ответа в формате Алисы
function generateResponse(text, endSession = false, additionalData = {}) {
  const response = {
    response: {
      text: text,
      end_session: endSession,
      // Поле для сигнала о том, что навык активно слушает
      should_listen: !endSession
    },
    version: '1.0'
  };

  // Добавляем кнопки, если они есть
  if (additionalData.buttons) {
    response.response.buttons = additionalData.buttons;
  }

  // Добавляем карточку, если есть
  if (additionalData.card) {
    response.response.card = additionalData.card;
  }

  return response;
}

// УДАЛЕНО: Функция extractShelfNumbers (больше не используется)

// Определение намерения пользователя
function extractIntent(command) {
  const lowerCommand = command.toLowerCase();
  
  // Секретная команда для получения ID устройства (для настройки)
  if (lowerCommand.includes('мой айди') || 
      lowerCommand.includes('мой id') || 
      lowerCommand.includes('покажи айди') ||
      lowerCommand.includes('покажи id')) {
    return 'show_device_id';
  }
  
  // Ключевые слова для определения интентов (только нужные команды)
  const intents = {
    matras_search: [
      'матрас', 'матрасы', 'veluna', 'lagoma', 'велуна', 'лагома',
      'laoma', 'palato', 'alma', 'asker', 'glatta', 'ilta', 'lenvik', 'lund', 'narvik', 'ulvik',
      'лаома', 'палато', 'альма', 'алма', 'аскер', 'глатта', 'глата', 'ильта', 'илта',
      'ленвик', 'лунд', 'ланд', 'нарвик', 'ульвик', 'улвик',
      'расскажи про', 'хочу узнать', 'что за матрас', 'какой матрас'
    ],
    
    user_greeting: [
      'привет', 'здравствуй', 'здравствуйте', 'добро пожаловать',
      'доброе утро', 'добрый день', 'добрый вечер', 'приветствую',
      'хай', 'салют', 'йо', 'хелло', 'хеллоу'
    ],
    
    article_search: [
      'артикул', 'код товара', 'номер товара', 'расскажи про артикул',
      'артикул номер', 'товар с артикулом', 'код', 'номер',
      'что это за артикул', 'информация по артикулу'
    ],
    
    promotions: [
      'акция', 'акции', 'скидка', 'скидки', 'распродажа', 'предложение',
      'доставка', 'рассрочка', 'какие есть акции',
      'есть ли акции', 'какие акции', 'акционные', 'есть ли скидки', 
      'какие предложения', 'что по ценам', 'какие скидки'
    ],
    
    consultation: [
      'консультант', 'продавец', 'сотрудник', 'менеджер',
      'заказ', 'купить', 'оформить', 'нужен консультант',
      'позовите', 'вызовите', 'администратор',
      'нужна помощь', 'консультация'
    ],
    
    goodbye: [
      'пока', 'до свидания', 'спасибо', 'досвидания', 
      'увидимся', 'хватит', 'всё', 'конец', 'выход', 'стоп',
      'закрыть', 'выйти', 'завершить', 'отключить', 'хватит помощи'
    ]
  };

  // Специальная проверка на артикулы (числовые коды от 5 цифр)
  // Сначала проверяем обычные числа
  const articleMatch = lowerCommand.match(/\d{5,}/);
  if (articleMatch) {
    return 'article_search';
  }
  
  // Затем проверяем цифры произнесенные словами
  const convertedCommand = convertWordsToDigits(lowerCommand);
  const convertedArticleMatch = convertedCommand.match(/\d{5,}/);
  if (convertedArticleMatch) {
    return 'article_search';
  }

  // Проверяем каждый интент
  for (const [intent, keywords] of Object.entries(intents)) {
    for (const keyword of keywords) {
      if (lowerCommand.includes(keyword)) {
        return intent;
      }
    }
  }

  return 'unknown';
}

// Генерация карточки товара
function generateProductCard(product) {
  return {
    type: 'BigImage',
    image_id: product.image_id || '1521359/default-product',
    title: product.name,
    description: `${product.description}\n\nЦена: ${product.price} руб.`,
    button: {
      text: 'Подробнее',
      url: product.url || '#'
    }
  };
}

// Формирование списка товаров в текстовом виде
function formatProductsList(products, maxCount = 3) {
  if (products.length === 0) {
    return 'Товары не найдены.';
  }

  const displayProducts = products.slice(0, maxCount);
  const productTexts = displayProducts.map(product => 
    `${product.name} - ${product.price} руб.`
  );

  let result = productTexts.join(', ');
  
  if (products.length > maxCount) {
    result += ` и ещё ${products.length - maxCount} вариантов`;
  }

  return result;
}

// Случайный выбор фразы
function randomChoice(phrases) {
  return phrases[Math.floor(Math.random() * phrases.length)];
}

// Вариации приветствий
function getRandomGreeting() {
  const greetings = [
    "Добро пожаловать в наш магазин двадцать первый век дом!",
    "Привет! Рада помочь с выбором мебели!",
    "Здравствуйте! Что вас интересует?",
    "Добро пожаловать! Я расскажу о наших товарах."
  ];
  return randomChoice(greetings);
}

// Вариации переспросов
function getRandomClarification() {
  const clarifications = [
    "Не совсем поняла, уточните пожалуйста.",
    "Можете сформулировать по-другому?",
    "Расскажите подробнее, что вас интересует.",
    "Не расслышала, повторите пожалуйста."
  ];
  return randomChoice(clarifications);
}

// Валидация ответа Алисы
function validateResponse(response) {
  // Проверяем обязательные поля
  if (!response.response || !response.response.text) {
    throw new Error('Response must contain response.text');
  }

  // Проверяем длину текста (максимум 1024 символа)
  if (response.response.text.length > 1024) {
    throw new Error('Response text is too long (max 1024 characters)');
  }

  // Проверяем формат кнопок
  if (response.response.buttons) {
    if (!Array.isArray(response.response.buttons)) {
      throw new Error('Buttons must be an array');
    }
    
    if (response.response.buttons.length > 5) {
      throw new Error('Maximum 5 buttons allowed');
    }
  }

  return true;
}

module.exports = {
  generateResponse,
  extractIntent,
  generateProductCard,
  formatProductsList,
  randomChoice,
  getRandomGreeting,
  getRandomClarification,
  validateResponse
}; 