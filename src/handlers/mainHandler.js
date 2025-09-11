const { getProductsByCategory } = require('../data/products');
const { generateResponse, extractIntent } = require('../utils/responseGenerator');
const content = require('../config/content');
const { generateArticleResponse, convertWordsToDigits } = require('../utils/articleSearch');
const { formatPriceForSpeech } = require('../utils/priceFormatter');
const { generateShelfResponse, generateShelfLevelResponse, findProductByArticle } = require('../utils/shelfManager');

// Состояния сессии
const SESSION_STATES = {
  START: 'start',
  CATEGORY_SELECTION: 'category_selection',
  PRODUCT_INFO: 'product_info',
  CONSULTATION: 'consultation'
};

// Основной обработчик запросов
async function handleRequest(body) {
  const { request, session, version } = body;
  
  // Новая сессия
  if (session.new) {
    return handleNewSession();
  }
  
  // Обработка команд
  const intentResult = extractIntent(request.command);
  const sessionState = session.session_id ? SESSION_STATES.START : SESSION_STATES.START;
  
  console.log(`Intent: ${intentResult}, State: ${sessionState}`);
  
  // Если intent - объект с полями intent, shelfId, levelId
  if (typeof intentResult === 'object' && intentResult.intent) {
    const intent = intentResult.intent;
    const shelfId = intentResult.shelfId;
    const levelId = intentResult.levelId;
    
    switch (intent) {
      case 'shelf_direct':
        return handleShelfDirect(shelfId, levelId);
      default:
        return handleDefaultResponse(request.command);
    }
  }
  
  // Если intent - строка (старая логика)
  const intent = intentResult;
  
  switch (intent) {
    case 'help':
      return generateHelpResponse();
    
    case 'shelf_question':
      return handleShelfQuestion();
    
    case 'shelf_info':
      return handleShelfInfo(request.command);
    
    case 'user_greeting':
      return handleUserGreeting();
    
    case 'article_search':
      return handleArticleSearch(request.command);
    
    case 'category_info':
      return handleCategoryInfo(request.command);
    
    case 'detailed_info':
      return handleDetailedInfo(request.command);
    
    case 'specific_product':
      return handleSpecificProduct(request.command);
    
    case 'product_search':
      return handleProductSearch(request.command);
    
    case 'promotions':
      return handlePromotions();
    
    case 'consultation':
      return handleConsultation();
    
    case 'goodbye':
      return generateGoodbyeResponse();
    
    default:
      return handleDefaultResponse(request.command);
  }
}

// Приветствие для новой сессии
function handleNewSession() {
  return generateResponse(
    "Добро пожаловать! Я ассистент торгового зала магазина двадцать первый век дом. " +
    "просто задавайте вопросы о товарах, акциях или просите консультанта. " +
    "Для выхода скажите 'выход' или 'стоп'. Команда 'помощь' покажет все возможности.",
    false,
    {
      buttons: [
        { title: "Диваны", hide: true },
        { title: "Диван Комфорт", hide: true },
        { title: "Акции", hide: true },
        { title: "Помощь", hide: true }
      ]
    }
  );
}

// Информация о категории товаров
function handleCategoryInfo(command) {
  const category = extractCategory(command);
  
  if (!category) {
    return generateResponse(
      "Какая категорию товаров вас интересует? У нас есть диваны, кровати, шкафы, столы, кресла и многое другое.",
      false,
      {
        buttons: [
          { title: "Диваны", hide: true },
          { title: "Кровати", hide: true },
          { title: "Шкафы", hide: true },
          { title: "Столы", hide: true }
        ]
      }
    );
  }
  
  const products = getProductsByCategory(category);
  
  if (products.length === 0) {
    return generateResponse(
      `К сожалению, информации о категории "${category}" пока нет. Могу рассказать про диваны, кровати, шкафы или столы.`,
      false
    );
  }
  
  const categoryInfo = generateCategoryDescription(category, products);
  
  return generateResponse(
    categoryInfo + getActiveReminder(),
    false,
    {
      buttons: [
        { title: "Подробнее", hide: true },
        { title: "Цены", hide: true },
        { title: "Другая категория", hide: true },
        { title: "Консультант", hide: true }
      ]
    }
  );
}

// Детальная информация о товарах категории
function handleDetailedInfo(command) {
  const category = extractCategory(command);
  
  if (!category) {
    return generateResponse(
      "О какой категории товаров вы хотите узнать подробности? Скажите, например: 'подробнее о диванах' или 'все модели кроватей'.",
      false,
      {
        buttons: [
          { title: "Подробнее о диванах", hide: true },
          { title: "Все модели кроватей", hide: true },
          { title: "Характеристики столов", hide: true }
        ]
      }
    );
  }
  
  const products = getProductsByCategory(category);
  
  if (products.length === 0) {
    return generateResponse(
      `К сожалению, подробной информации о категории "${category}" пока нет.`,
      false
    );
  }
  
  const detailedInfo = generateDetailedCategoryDescription(category, products);
  
  return generateResponse(
    detailedInfo,
    false,
    {
      buttons: [
        { title: "Акции", hide: true },
        { title: "Консультант", hide: true },
        { title: "Другая категория", hide: true }
      ]
    }
  );
}

// Поиск конкретного товара/модели
function handleSpecificProduct(command) {
  const { searchProducts } = require('../data/products');
  
  // Убираем лишние слова из запроса для лучшего поиска
  const cleanQuery = command
    .replace(/расскажи про|покажи|нужен|нужна|хочу|диван|кровать|шкаф|стол/gi, '')
    .trim();
  
  if (cleanQuery.length < 2) {
    return generateResponse(
      "Уточните, пожалуйста, какую модель или характеристика товара вас интересует? " +
      "Например: 'Диван Комфорт', 'угловой диван', 'кровать Мечта' или 'раскладной диван'.",
      false,
      {
        buttons: [
          { title: "Диван Комфорт", hide: true },
          { title: "Угловой диван", hide: true },
          { title: "Кровать Мечта", hide: true },
          { title: "Все модели", hide: true }
        ]
      }
    );
  }
  
  const foundProducts = searchProducts(cleanQuery);
  
  if (foundProducts.length === 0) {
    return generateResponse(
      `К сожалению, не нашел товаров по запросу "${cleanQuery}". ` +
      "Попробуйте поискать по названию модели, цвету или характеристике. " +
      "Или скажите 'все модели диванов' для полного списка.",
      false,
      {
        buttons: [
          { title: "Все модели диванов", hide: true },
          { title: "Все кровати", hide: true },
          { title: "Консультант", hide: true }
        ]
      }
    );
  }
  
  if (foundProducts.length === 1) {
    // Нашли точно один товар - показываем детально
    const product = foundProducts[0];
    const productInfo = generateSingleProductDescription(product);
    
    return generateResponse(
      productInfo,
      false,
      {
        buttons: [
          { title: "Акции", hide: true },
          { title: "Консультант", hide: true },
          { title: "Похожие товары", hide: true }
        ]
      }
    );
  }
  
  // Нашли несколько товаров - показываем список
  const productsList = foundProducts.slice(0, 3).map((product, index) => 
    `${index + 1}. ${product.name} - ${formatPriceForSpeech(product.price)}`
  ).join('\n');
  
  let response = `Нашел ${foundProducts.length} товаров по вашему запросу:\n\n${productsList}`;
  
  if (foundProducts.length > 3) {
    response += `\n\nИ еще ${foundProducts.length - 3} моделей.`;
  }
  
  response += "\n\nУточните название конкретной модели для подробной информации.";
  
  return generateResponse(
    response,
    false,
    {
      buttons: foundProducts.slice(0, 3).map(product => ({
        title: product.name.replace(/[""]/g, ''),
        hide: true
      }))
    }
  );
}

// Генерация описания одного товара
function generateSingleProductDescription(product) {
  let description = `🛋️ ${product.name}\n\n`;
  description += `💰 Цена: ${formatPriceForSpeech(product.price)}\n\n`;
  description += `📝 ${product.description}\n\n`;
  description += `📏 Размеры: ${product.dimensions}\n`;
  description += `🧵 Материал: ${product.material}\n`;
  
  if (product.colors && product.colors.length > 0) {
    description += `🎨 Доступные цвета: ${product.colors.join(', ')}\n`;
  }
  
  if (product.features && product.features.length > 0) {
    description += `✨ Особенности: ${product.features.join(', ')}\n`;
  }
  
  if (product.promotions && product.promotions.length > 0) {
    description += `🔥 Действующие акции: ${product.promotions.join(', ')}\n`;
  }
  
  description += `\n📋 Товар ${product.inStock ? 'есть в наличии' : 'под заказ'}.`;
  
  return description;
}

// Поиск конкретного товара
function handleProductSearch(command) {
  // Логика поиска товара по характеристикам
  return generateResponse(
    "Давайте подберем товар под ваши потребности. Какие у вас требования к размеру, цвету или стилю?",
    false,
    {
      buttons: [
        { title: "Маленький размер", hide: true },
        { title: "Средний размер", hide: true },
        { title: "Большой размер", hide: true }
      ]
    }
  );
}

// Информация об акциях
function handlePromotions() {
  return generateResponse(
    "Сейчас у нас действуют отличные акции! скидки до 30% на диваны, " +
    "бесплатная доставка при покупке от 50 тысяч рублей, и специальная рассрочка без переплат. " +
    "Хотите узнать подробности по какой-то категории?" + getActiveReminder(),
    false,
    {
      buttons: [
        { title: "Скидки на диваны", hide: true },
        { title: "Условия доставки", hide: true },
        { title: "Рассрочка", hide: true }
      ]
    }
  );
}

// Вызов консультанта
function handleConsultation() {
  return generateResponse(
    content.messages.consultation + getActiveReminder(),
    false,
    {
      buttons: [
        { title: "Спасибо", hide: true },
        { title: "Ещё вопросы", hide: true }
      ]
    }
  );
}

// Справка
function generateHelpResponse() {
  return generateResponse(
    "Я ассистент торгового зала. Умею:\n" +
    "• Общая информация: 'расскажи про диваны', 'какие есть кровати'\n" +
    "• Детальные списки: 'все модели диванов', 'подробнее о кроватях'\n" +
    "• Конкретные товары: 'диван Комфорт', 'угловой диван', 'кровать Мечта'\n" +
    "• Информация об акциях: 'какие есть скидки', 'есть ли акции'\n" +
    "• Вызов консультанта: 'нужен продавец', 'позовите консультанта'\n" +
    "• Выход из навыка: 'выход', 'стоп', 'закрыть'\n\n" +
    "Доступны категории: диваны, кровати, шкафы, столы, кресла.",
    false,
    {
      buttons: [
        { title: "Диваны", hide: true },
        { title: "Акции", hide: true },
        { title: "Консультант", hide: true }
      ]
    }
  );
}

// Прощание
function generateGoodbyeResponse() {
  return generateResponse(
    "Спасибо за посещение нашего магазина! Навык отключен. Удачных покупок!",
    true
  );
}

// Обработка вопросов о полке
function handleShelfQuestion() {
  const shelfAnswers = content.messages.shelfAnswers;
  const randomAnswer = shelfAnswers[Math.floor(Math.random() * shelfAnswers.length)];
  
  return generateResponse(
    randomAnswer,
    false,
    {
      buttons: [
        { title: "Помощь", hide: true },
        { title: "Товары", hide: true },
        { title: "Консультант", hide: true }
      ]
    }
  );
}

// Обработка приветствий пользователя
function handleUserGreeting() {
  const greetingResponses = content.messages.greetingResponses;
  const randomGreeting = greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
  
  return generateResponse(
    randomGreeting + " Чем могу помочь с выбором мебели?",
    false,
    {
      buttons: [
        { title: "Диваны", hide: true },
        { title: "Кровати", hide: true },
        { title: "Акции", hide: true },
        { title: "Помощь", hide: true }
      ]
    }
  );
}

// Обработка поиска по артикулу
function handleArticleSearch(command) {
  // Сначала преобразуем слова в цифры для поддержки "восемь четыре семь четыре..."
  const convertedCommand = convertWordsToDigits(command);
  
  // Извлекаем артикул из команды (ищем в оригинальной и преобразованной)
  let articleMatch = command.match(/(\d{5,})/);
  if (!articleMatch) {
    articleMatch = convertedCommand.match(/(\d{5,})/);
  }
  
  if (!articleMatch) {
    return generateResponse(
      "Назовите артикул товара. Например: 'артикул 9174297', просто '9174297' или по цифрам 'девять один семь четыре два девять семь'.",
      false,
      {
        buttons: [
          { title: "Помощь", hide: true },
          { title: "Консультант", hide: true }
        ]
      }
    );
  }
  
  const article = articleMatch[1];
  const result = generateArticleResponse(article);
  
  if (!result.found) {
    return generateResponse(
      result.response,
      false,
      {
        buttons: [
          { title: "Консультант", hide: true },
          { title: "Другой артикул", hide: true },
          { title: "Каталог", hide: true }
        ]
      }
    );
  }
  
  return generateResponse(
    result.response,
    false,
    {
      buttons: [
        { title: "Консультант", hide: true },
        { title: "Другой товар", hide: true },
        { title: "Акции", hide: true }
      ]
    }
  );
}

// Обработка неопознанных команд
function handleDefaultResponse(command) {
  const suggestions = [
    "Может быть, вас интересуют диваны или кровати?",
    "Хотите узнать об акциях?",
    "Нужна помощь с выбором мебели?",
    "Расскажу про любую категорию товаров!",
    "Могу вызвать консультанта для вас!"
  ];
  
  const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
  
  return generateResponse(
    "Не понял ваш вопрос. " + randomSuggestion + " " +
    "Скажите 'помощь', чтобы узнать все возможности." +
    getActiveReminder(),
    false,
    {
      buttons: [
        { title: "Помощь", hide: true },
        { title: "Диваны", hide: true },
        { title: "Акции", hide: true },
        { title: "Консультант", hide: true }
      ]
    }
  );
}

// Извлечение категории из команды
function extractCategory(command) {
  const categories = {
    'диван': 'sofas',
    'кровать': 'beds', 
    'шкаф': 'wardrobes',
    'стол': 'tables',
    'кресло': 'chairs',
    'комод': 'dressers'
  };
  
  const lowerCommand = command.toLowerCase();
  
  for (const [keyword, category] of Object.entries(categories)) {
    if (lowerCommand.includes(keyword)) {
      return category;
    }
  }
  
  return null;
}

// Генерация описания категории
function generateCategoryDescription(category, products) {
  const description = content.categoryDescriptions[category];
  if (description) {
    return description.replace('{count}', products.length);
  }
  return `В нашем магазине двадцать первый век дом доступно ${products.length} товаров в данной категории.`;
}

// Генерация детального описания товаров категории
function generateDetailedCategoryDescription(category, products) {
  if (products.length === 0) return "Товары в данной категории отсутствуют.";
  
  let description = `В категории ${getCategoryName(category)} представлено ${products.length} товаров:\n\n`;
  
  products.slice(0, 3).forEach((product, index) => {
    description += `${index + 1}. ${product.name}\n`;
    description += `   Цена: ${formatPriceForSpeech(product.price)}\n`;
    description += `   ${product.description}\n`;
    description += `   Размеры: ${product.dimensions}\n`;
    description += `   Материал: ${product.material}\n`;
    if (product.colors.length > 0) {
      description += `   Цвета: ${product.colors.join(', ')}\n`;
    }
    if (product.features.length > 0) {
      description += `   Особенности: ${product.features.join(', ')}\n`;
    }
    if (product.promotions.length > 0) {
      description += `   🔥 Акция: ${product.promotions.join(', ')}\n`;
    }
    description += '\n';
  });
  
  if (products.length > 3) {
    description += `И еще ${products.length - 3} моделей. Спросите про конкретную модель или обратитесь к консультанту.`;
  }
  
  return description;
}

// Получение читаемого названия категории
function getCategoryName(category) {
  const names = {
    'sofas': 'Диваны',
    'beds': 'Кровати',
    'wardrobes': 'Шкафы',
    'tables': 'Столы',
    'chairs': 'Кресла',
    'dressers': 'Комоды'
  };
  return names[category] || category;
}

// Случайные вопросы для продолжения диалога
function getActiveReminder() {
  const reminders = [
    "Задавайте еще вопросы!",
    "Хотите узнать что-либо еще?",
    "Можете спросить что-то еще.",
    "Что еще хотите узнать?",
    "Я готова рассказать больше!",
    "Продолжайте, я слушаю!",
    "Есть еще вопросы по товарам?"
  ];
  
  // Увеличиваем частоту до 50% для поддержания активности сессии
  if (Math.random() < 0.5) {
    return " " + reminders[Math.floor(Math.random() * reminders.length)];
  }
  
  return "";
}

// Обработчик вопросов о стеллажах
function handleShelfInfo(command) {
  // Извлекаем номер стеллажа из команды
  const shelfMatch = command.match(/(?:стеллаж|полка)\s*(?:номер\s*)?(\d+)/i);
  
  if (shelfMatch) {
    const shelfId = shelfMatch[1];
    const shelfResponse = generateShelfResponse(shelfId);
    return generateResponse(shelfResponse.text, shelfResponse.endSession, { buttons: shelfResponse.buttons });
  }
  
  // Если номер не указан, показываем список доступных стеллажей
  const { getAllShelves } = require('../utils/shelfManager');
  const shelves = getAllShelves();
  
  let response = "У нас есть следующие стеллажи:\n\n";
  shelves.forEach(shelf => {
    response += `Стеллаж ${shelf.id} - ${shelf.name}\n`;
  });
  response += "\nСкажите номер стеллажа, который вас интересует.";
  
  return generateResponse(response, false, [
    { title: "Стеллаж 1", payload: { shelf_id: "1" } },
    { title: "Стеллаж 2", payload: { shelf_id: "2" } },
    { title: "Стеллаж 3", payload: { shelf_id: "3" } }
  ]);
}

// Обработчик уточнения полки (для кнопок)
function handleShelfLevel(shelfId, levelId) {
  return generateShelfLevelResponse(shelfId, levelId);
}

// Обработчик прямых запросов о стеллажах с номерами
function handleShelfDirect(shelfId, levelId) {
  if (!shelfId && !levelId) {
    return generateResponse(
      "Не поняла номер стеллажа. Скажите, например: 'стеллаж 4' или 'что на стеллаже 6'",
      false
    );
  }
  
  // Если указан и стеллаж, и полка - показываем товары на полке
  if (shelfId && levelId) {
    return generateShelfLevelResponse(shelfId, levelId);
  }
  
  // Если указан только стеллаж - показываем полки
  if (shelfId) {
    return generateShelfResponse(shelfId);
  }
  
  // Если указана только полка - это ошибка, нужен стеллаж
  if (levelId) {
    return generateResponse(
      "Для поиска по полке нужно указать номер стеллажа. Скажите, например: 'стеллаж 4 полка 3'",
      false
    );
  }
}

module.exports = {
  handleRequest,
  handleShelfLevel,
  handleShelfDirect
}; 