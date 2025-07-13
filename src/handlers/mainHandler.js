const { getProductsByCategory } = require('../data/products');
const { generateResponse, extractIntent } = require('../utils/responseGenerator');

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
    
    case 'category_info':
      return handleCategoryInfo(request.command);
    
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
    "Добро пожаловать! Я ассистент торгового зала магазина двадцать первый век дом, помогу выбрать мебель и узнать о товарах. " +
    "Скажите 'расскажи про диваны' для информации о категории, 'какие есть акции' для спецпредложений, " +
    "или 'нужен консультант' чтобы позвать продавца. Команды 'помощь' и 'что ты умеешь' покажут все возможности.",
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
    categoryInfo,
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
    "Сейчас у нас действуют отличные предложения! Скидки до 30% на диваны, " +
    "бесплатная доставка при покупке от 50 тысяч рублей, и специальная рассрочка без переплат. " +
    "Хотите узнать подробности по какой-то категории?",
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
    "Они помогут с выбором и оформлением заказа.",
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
    "• Рассказывать о товарах: 'расскажи про диваны', 'какие есть кровати'\n" +
    "• Информировать об акциях: 'какие есть скидки', 'есть ли акции'\n" +
    "• Помогать с подбором: 'нужен маленький диван', 'подбери кровать'\n" +
    "• Вызывать консультанта: 'нужен продавец', 'позовите консультанта'\n" +
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
    "Спасибо за посещение нашего магазина! Удачных покупок!",
    true
  );
}

// Обработка неопознанных команд
function handleDefaultResponse(command) {
  return generateResponse(
    "Не совсем понял ваш вопрос. Попробуйте спросить про категории товаров, акции или попросить консультанта. " +
    "Скажите 'помощь', чтобы узнать, что я умею.",
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

module.exports = {
  handleRequest
}; 