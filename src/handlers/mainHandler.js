const { getProductsByCategory } = require('../data/products');
const { generateResponse, extractIntent } = require('../utils/responseGenerator');
const content = require('../config/content');

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
  const intent = extractIntent(request.command);
  const sessionState = session.session_id ? SESSION_STATES.START : SESSION_STATES.START;
  
  console.log(`Intent: ${intent}, State: ${sessionState}`);
  
  switch (intent) {
    case 'help':
      return generateHelpResponse();
    
    case 'shelf_question':
      return handleShelfQuestion();
    
    case 'user_greeting':
      return handleUserGreeting();
    
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
    "Отличная идея обратиться к консультанту! Наши специалисты находятся в зале. " +
    "Ищите сотрудников в фирменных футболках или обратитесь к администратору на входе. " +
    "Они помогут с выбором и оформлением заказа." + getActiveReminder(),
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
    "🎯 Навык АКТИВЕН и постоянно слушает команды!\n\n" +
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
    randomAnswer + " " + content.messages.shelfInstructions,
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

// Обработка неопознанных команд
function handleDefaultResponse(command) {
  return generateResponse(
    "не понял ваш вопрос. Попробуйте спросить про категории товаров, акции или попросить консультанта. " +
    "Скажите 'помощь', чтобы узнать, что я умею. Навык активен и слушает!",
    false,
    {
      buttons: [
        { title: "Помощь", hide: true },
        { title: "Товары", hide: true },
        { title: "Акции", hide: true }
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
  const descriptions = {
    'sofas': `У нас представлены ${products.length} моделей диванов: угловые, прямые и модульные. ` +
             'Материалы обивки: ткань, экокожа, натуральная кожа. Есть модели с функцией "клик-кляк" и ортопедическими матрасами.',
    
    'beds': `В ассортименте ${products.length} моделей кроватей разных размеров. ` +
            'Односпальные, полуторные, двуспальные и king-size. С подъемным механизмом и без, с мягким изголовьем.',
    
    'wardrobes': `Предлагаем ${products.length} вариантов шкафов: распашные, купе и модульные системы. ` +
                 'Двух-, трех- и четырехдверные модели. Возможна комплектация под ваши потребности.',
    
    'tables': `У нас ${products.length} моделей столов: обеденные, журнальные, компьютерные и туалетные. ` +
              'Материалы: дерево, стекло, металл. Раздвижные и стационарные варианты.'
  };
  
  return descriptions[category] || `Доступно ${products.length} товаров в данной категории.`;
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

// Случайные напоминания о том, что навык активен
function getActiveReminder() {
  const reminders = [
    "Задавайте еще вопросы!",
    "Навык слушает и готов помочь!",
    "Можете спросить что-то еще.",
    "Навык активен - продолжайте общение!",
    "Что еще хотите узнать?"
  ];
  
  // Показывать напоминание в 30% случаев
  if (Math.random() < 0.3) {
    return " " + reminders[Math.floor(Math.random() * reminders.length)];
  }
  
  return "";
}

// Функция для правильного произношения цен
function formatPriceForSpeech(price) {
  if (price === 0) return "бесплатно";
  
  // Преобразуем в тысячи для более читаемого произношения
  if (price >= 1000 && price % 1000 === 0) {
    const thousands = price / 1000;
    
    // Словарь для чисел
    const numbers = {
      1: "одна", 2: "две", 3: "три", 4: "четыре", 5: "пять",
      6: "шесть", 7: "семь", 8: "восемь", 9: "девять", 10: "десять",
      11: "одиннадцать", 12: "двенадцать", 13: "тринадцать", 14: "четырнадцать", 15: "пятнадцать",
      16: "шестнадцать", 17: "семнадцать", 18: "восемнадцать", 19: "девятнадцать", 20: "двадцать",
      30: "тридцать", 40: "сорок", 50: "пятьдесят", 60: "шестьдесят", 
      70: "семьдесят", 80: "восемьдесят", 90: "девяносто"
    };
    
    let result = "";
    
    if (thousands <= 20) {
      result = numbers[thousands] || thousands.toString();
    } else if (thousands < 100) {
      const tens = Math.floor(thousands / 10) * 10;
      const units = thousands % 10;
      result = numbers[tens];
      if (units > 0) {
        result += " " + numbers[units];
      }
    } else {
      // Для больших чисел используем обычное форматирование
      return price.toLocaleString('ru-RU') + " рублей";
    }
    
    // Добавляем правильное склонение слова "тысяча"
    if (thousands === 1) {
      result += " тысяча";
    } else if (thousands >= 2 && thousands <= 4) {
      result += " тысячи";
    } else {
      result += " тысяч";
    }
    
    return result + " рублей";
  }
  
  // Для цен меньше 1000 или не кратных 1000
  return price.toLocaleString('ru-RU') + " рублей";
}

module.exports = {
  handleRequest
}; 