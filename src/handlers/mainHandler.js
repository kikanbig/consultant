const { generateResponse, extractIntent } = require('../utils/responseGenerator');
const content = require('../config/content');
const { generateArticleResponse, convertWordsToDigits } = require('../utils/articleSearch');
const { generateMatrasResponse } = require('../utils/matrasSearch');
const { generateDivanResponse } = require('../utils/divanSearch');
const { generateProductResponse } = require('../utils/productSearch');
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
  try {
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
    
    case 'divan_search':
      return handleDivanSearch(request.command, body);
    
    case 'matras_search':
      return handleMatrasSearch(request.command, body);
    
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
  } catch (error) {
    // Глобальный обработчик ошибок
    console.error('Ошибка в handleRequest:', error);
    return generateResponse(
      "Ой, что-то пошло не так. Попробуйте повторить вопрос или спросите что-нибудь другое.",
      false
    );
  }
}

// Приветствие для новой сессии
function handleNewSession(body) {
  // Получаем персонализированное приветствие (без кнопок - только голосовое управление)
  const welcomeText = getWelcomeMessage(body);
  
  // 10 весёлых вариантов призыва назвать артикул
  const articlePrompts = [
    "Диктуйте артикул — я мгновенно найду ваш товар! 🎯",
    "Назовите код товара, и я расскажу о нём всё! 🔍",
    "Артикул в студию — и я ваш личный гид по товару! 🎤",
    "Говорите артикул — я как поисковик, только быстрее! ⚡",
    "Продиктуйте код — я найду товар за секунду! ⏱️",
    "Артикул, пожалуйста — и я опишу товар во всех красках! 🎨",
    "Называйте номер товара — я ваш товарный детектив! 🕵️",
    "Диктуйте код — и я всё расскажу про ваш товар! 💬",
    "Артикул готов? Я готова рассказать о товаре! 🚀",
    "Говорите артикул — я эксперт по всем товарам! 🏆"
  ];
  
  const randomPrompt = articlePrompts[Math.floor(Math.random() * articlePrompts.length)];
  
  return generateResponse(
    welcomeText + " " + randomPrompt,
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

// Обработка поиска матрасов по названию модели
// Обработка поиска дивана
function handleDivanSearch(command, body) {
  const { location } = getPersonalizedContent(body);
  
  // Только для колонок Диван 1 и Диван 2
  if (location !== 'divans1' && location !== 'divans2') {
    return generateResponse("Извините, я могу рассказать о диванах только в зоне диванов.", false);
  }
  
  const result = generateDivanResponse(command);
  
  if (!result.found) {
    return generateResponse(result.response + ' ' + getActiveReminder(), false);
  }
  
  return generateResponse(result.response, false);
}

function handleMatrasSearch(command, body) {
  const { location } = getPersonalizedContent(body);
  
  // Только для колонки Матрасы 1
  if (location !== 'matrasy1') {
    return generateResponse("Тут такие классные матрасы, я еще сонная, не поняла ваш вопрос.", false);
  }
  
  const result = generateMatrasResponse(command);
  
  if (!result.found) {
    return generateResponse(result.response + ' ' + getActiveReminder(), false);
  }
  
  return generateResponse(result.response, false);
}

// Обработка поиска по артикулу (с зональной фильтрацией)
function handleArticleSearch(command, body) {
  // Используем новый модуль для поиска товаров
  const result = generateProductResponse(command);
  
  if (!result.found) {
    return generateResponse(
      result.response + " " + getActiveReminder(),
      false
    );
  }
  
  return generateResponse(
    result.response + " " + getActiveReminder(),
    false
  );
}

// Обработка неопознанных команд
function handleDefaultResponse(command, body) {
  const { location } = getPersonalizedContent(body);
  
  // Специальное сообщение для зоны матрасов
  if (location === 'matrasy1') {
    return generateResponse(
      "Тут такие классные матрасы, я еще сонная, не поняла ваш вопрос. " + getActiveReminder(),
      false
    );
  }
  
  // 15 весёлых и дружелюбных ответов когда Алиса не понимает вопрос
  const funnyResponses = [
    "Ой, кажется я немного запуталась в товарах! 😅 Но я точно знаю артикулы! Назовите артикул товара, и я расскажу всё-всё-всё!",
    "Хм-м-м, это сложный вопрос! 🤔 А давайте лучше я расскажу про конкретный товар? Просто назовите артикул!",
    "Упс! Я ещё учусь отвечать на такие вопросы! 🎓 Зато я отлично знаю все товары по артикулам! Попробуйте спросить про артикул!",
    "Ой-ой-ой, кажется мой процессор немного перегрелся! 🔥 Давайте проще: назовите артикул товара, и я всё расскажу! Или спросите про акции!",
    "Знаете, я как GPS для товаров - дайте мне артикул, и я найду всё! 🗺️ А вот без артикула я немного теряюсь...",
    "Хаха, вы меня поставили в тупик! 😄 Но не беда! Назовите артикул товара или спросите про акции - тут я эксперт!",
    "Ммм, интересный вопрос! 🧐 Но я больше специалист по артикулам! Назовите код товара, и я стану вашим личным консультантом!",
    "Ой, кажется я отвлеклась на красивые товары вокруг! 😍 Давайте вернёмся к делу: какой артикул вас интересует?",
    "Это не совсем моя специализация! 🤷 Зато я могу рассказать про любой товар по артикулу! Или могу позвать консультанта!",
    "Хм, тут нужен человек-консультант! 👨‍💼 А я пока расскажу про товары по артикулам! Или про акции! Что выберете?",
    "Ой, я немного растерялась! 😊 Но знаете что? Я отлично разбираюсь в артикулах! Назовите код товара!",
    "Это вопрос со звёздочкой! ⭐ Давайте я лучше расскажу про конкретный товар? Просто назовите артикул!",
    "Упс, кажется я пропустила этот урок в школе роботов! 🤖 Зато я знаю все артикулы наизусть! Проверим?",
    "Ха-ха, вы меня озадачили! 😅 Но я не сдаюсь! Спросите про артикул товара или про акции - и я вам всё расскажу!",
    "Ой, это не мой профиль! 🎯 Я больше по артикулам специалист! Назовите код товара, и я стану вашим гидом по характеристикам!"
  ];
  
  const randomResponse = funnyResponses[Math.floor(Math.random() * funnyResponses.length)];
  
  return generateResponse(
    randomResponse + " " + getActiveReminder(),
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