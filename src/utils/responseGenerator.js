// Генерация ответа в формате Алисы
function generateResponse(text, endSession = false, additionalData = {}) {
  const response = {
    response: {
      text: text,
      end_session: endSession
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

// Определение намерения пользователя
function extractIntent(command) {
  const lowerCommand = command.toLowerCase();
  
  // Ключевые слова для определения интентов (порядок важен - специфичные сначала)
  const intents = {
    help: ['помощь', 'справка', 'что ты умеешь', 'что умеешь', 'как дела', 'помоги', 'что можешь'],
    
    promotions: [
      'акция', 'акции', 'скидка', 'скидки', 'распродажа', 'предложение', 'цена',
      'доставка', 'рассрочка', 'бесплатно', 'дешево', 'какие есть акции',
      'есть ли акции', 'какие акции', 'акционные', 'есть ли скидки', 
      'какие предложения', 'что по ценам'
    ],
    
    consultation: [
      'консультант', 'продавец', 'сотрудник', 'менеджер',
      'заказ', 'купить', 'оформить', 'нужен консультант',
      'позовите', 'вызовите', 'администратор',
      'нужна помощь', 'консультация'
    ],
    
    product_search: [
      'подобрать', 'найти', 'выбрать', 'поиск', 'нужен', 'хочу',
      'маленький', 'большой', 'красный', 'синий', 'дешевый', 'дорогой'
    ],
    
    category_info: [
      'диван', 'кровать', 'шкаф', 'стол', 'кресло', 'комод',
      'расскажи про диван', 'расскажи про кровать', 'расскажи про шкаф',
      'что есть', 'какие', 'покажи', 'мебель'
    ],
    
    detailed_info: [
      'подробнее', 'детали', 'характеристики', 'размеры', 'материал', 'цвета',
      'модели', 'полное описание', 'все модели', 'весь ассортимент'
    ],
    
    specific_product: [
      'комфорт', 'релакс', 'трансформер', 'мечта', 'элегант', 'классик',
      'угловой', 'раскладной', 'двуспальная', 'односпальная', 'купе', 'распашной',
      'нужен диван', 'нужна кровать', 'хочу диван'
    ],
    
    goodbye: [
      'пока', 'до свидания', 'спасибо', 'досвидания', 
      'увидимся', 'хватит', 'всё', 'конец'
    ]
  };

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