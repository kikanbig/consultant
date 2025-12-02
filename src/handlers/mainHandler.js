const { generateResponse, extractIntent } = require('../utils/responseGenerator');
const content = require('../config/content');
const { generateArticleResponse, convertWordsToDigits } = require('../utils/articleSearch');
const { 
  getWelcomeMessage, 
  getPromotionsMessage,
  getPersonalizedContent 
} = require('../utils/deviceManager');

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
    return handleNewSession(body);
  }
  
  // Обработка команд
  const intentResult = extractIntent(request.command);
  const sessionState = session.session_id ? SESSION_STATES.START : SESSION_STATES.START;
  
  console.log(`Intent: ${intentResult}, State: ${sessionState}`);
  
  // Получаем intent
  const intent = intentResult;
  
  switch (intent) {
    case 'show_device_id':
      return handleShowDeviceId(body);
    
    case 'user_greeting':
      return handleUserGreeting(body);
    
    case 'article_search':
      return handleArticleSearch(request.command, body);
    
    case 'promotions':
      return handlePromotions(body);
    
    case 'consultation':
      return handleConsultation();
    
    case 'goodbye':
      return generateGoodbyeResponse();
    
    default:
      return handleDefaultResponse(request.command, body);
  }
}

// Приветствие для новой сессии
function handleNewSession(body) {
  // Получаем персонализированное приветствие (без кнопок - только голосовое управление)
  const welcomeText = getWelcomeMessage(body);
  
  return generateResponse(
    welcomeText,
    false
  );
}

// УДАЛЕНО: Функции для работы с категориями, детальными списками и поиском товаров
// Теперь работаем только с артикулами и названиями конкретных товаров

// Информация об акциях (зональные акции)
function handlePromotions(body) {
  // Получаем персонализированную информацию об акциях для конкретной зоны
  const promotionsText = getPromotionsMessage(body);
  
  return generateResponse(
    promotionsText + getActiveReminder(),
    false
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

// УДАЛЕНО: Функция справки (команда "Помощь" больше не используется)

// Прощание
function generateGoodbyeResponse() {
  return generateResponse(
    "Спасибо за посещение нашего магазина! Навык отключен. Удачных покупок!",
    true
  );
}

// Показать ID устройства (для настройки)
function handleShowDeviceId(body) {
  const { deviceInfo, location, content } = getPersonalizedContent(body);
  
  let response = "📱 Информация об устройстве:\n\n";
  
  if (deviceInfo.applicationId) {
    response += `🔑 Application ID:\n${deviceInfo.applicationId}\n\n`;
    response += "Это уникальный ID вашей колонки!\n\n";
  } else {
    response += "Application ID: не определен\n\n";
  }
  
  if (deviceInfo.userId) {
    response += `User ID: ${deviceInfo.userId.substring(0, 20)}...\n`;
  }
  
  response += `Тип устройства: ${deviceInfo.deviceType === 'screen' ? 'с экраном' : 'колонка'}\n`;
  
  if (location) {
    response += `\nЛокация: ${content.name} ✅ (настроена)\n`;
  } else {
    response += `\nЛокация: не настроена\n`;
    response += "💡 Скопируйте Application ID и добавьте в deviceContent.js";
  }
  
  return generateResponse(
    response,
    false,
    {
      buttons: [
        { title: "Понятно", hide: true },
        { title: "Помощь", hide: true }
      ]
    }
  );
}

// УДАЛЕНО: Функция для вопросов о полках (больше не используется)

// Обработка приветствий пользователя
function handleUserGreeting(body) {
  const greetingResponses = content.messages.greetingResponses;
  const randomGreeting = greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
  
  return generateResponse(
    randomGreeting + " Чем могу помочь с выбором?",
    false
  );
}

// Обработка поиска по артикулу (с зональной фильтрацией)
function handleArticleSearch(command, body) {
  // Сначала преобразуем слова в цифры для поддержки "восемь четыре семь четыре..."
  const convertedCommand = convertWordsToDigits(command);
  
  // Извлекаем артикул из команды (ищем в оригинальной и преобразованной)
  let articleMatch = command.match(/(\d{5,})/);
  if (!articleMatch) {
    articleMatch = convertedCommand.match(/(\d{5,})/);
  }
  
  if (!articleMatch) {
    return generateResponse(
      "Назовите артикул товара. Например: 'артикул 9174297' или просто '9174297'." + getActiveReminder(),
      false
    );
  }
  
  const article = articleMatch[1];
  const result = generateArticleResponse(article);
  
  if (!result.found) {
    return generateResponse(
      result.response + getActiveReminder(),
      false
    );
  }
  
  return generateResponse(
    result.response + getActiveReminder(),
    false
  );
}

// Обработка неопознанных команд
function handleDefaultResponse(command, body) {
  const suggestions = [
    "Назовите артикул товара для получения информации.",
    "Хотите узнать об акциях?",
    "Могу вызвать консультанта для вас!",
    "Скажите 'мой айди' чтобы узнать информацию об устройстве."
  ];
  
  const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
  
  return generateResponse(
    "Не понял ваш вопрос. " + randomSuggestion + " " + getActiveReminder(),
    false
  );
}

// УДАЛЕНО: Функции для работы с категориями (больше не используются)

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

// УДАЛЕНО: Функции для работы со стеллажами (больше не используются)

module.exports = {
  handleRequest
}; 