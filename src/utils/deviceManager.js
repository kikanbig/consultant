// =============================================================================
// МЕНЕДЖЕР УСТРОЙСТВ - определение локации по устройству
// =============================================================================

const deviceConfig = require('../config/deviceContent');

/**
 * Извлекает информацию об устройстве из запроса Яндекс.Диалогов
 * @param {Object} body - тело запроса от Яндекс.Диалогов
 * @returns {Object} информация об устройстве
 */
function getDeviceInfo(body) {
  const deviceInfo = {
    clientId: null,
    userId: null,
    sessionId: null,
    applicationId: null,
    deviceType: 'unknown'
  };

  // Извлекаем client_id из meta (уникальный ID устройства)
  if (body.meta && body.meta.client_id) {
    deviceInfo.clientId = body.meta.client_id;
  }

  // Извлекаем user_id
  if (body.session && body.session.user && body.session.user.user_id) {
    deviceInfo.userId = body.session.user.user_id;
  }

  // Извлекаем session_id
  if (body.session && body.session.session_id) {
    deviceInfo.sessionId = body.session.session_id;
  }

  // Извлекаем application_id
  if (body.session && body.session.application && body.session.application.application_id) {
    deviceInfo.applicationId = body.session.application.application_id;
  }

  // Определяем тип устройства из interfaces
  if (body.meta && body.meta.interfaces) {
    if (body.meta.interfaces.screen) {
      deviceInfo.deviceType = 'screen'; // Устройство с экраном (Станция Макс и т.д.)
    } else {
      deviceInfo.deviceType = 'speaker'; // Колонка без экрана
    }
  }

  return deviceInfo;
}

/**
 * Определяет локацию устройства на основе его ID
 * @param {Object} deviceInfo - информация об устройстве
 * @returns {string} название локации или null
 */
function getDeviceLocation(deviceInfo) {
  if (!deviceConfig.settings.enableDevicePersonalization) {
    return null;
  }

  const { deviceMapping } = deviceConfig;

  // Проверяем по client_id (основной способ)
  if (deviceInfo.clientId && deviceMapping[deviceInfo.clientId]) {
    return deviceMapping[deviceInfo.clientId];
  }

  // Проверяем по user_id (запасной вариант)
  if (deviceInfo.userId && deviceMapping[deviceInfo.userId]) {
    return deviceMapping[deviceInfo.userId];
  }

  // Проверяем по session_id (для тестирования)
  if (deviceInfo.sessionId && deviceMapping[deviceInfo.sessionId]) {
    return deviceMapping[deviceInfo.sessionId];
  }

  return null;
}

/**
 * Получает контент для конкретной локации
 * @param {string} location - название локации
 * @returns {Object} контент для локации
 */
function getLocationContent(location) {
  if (!location || !deviceConfig.locationContent[location]) {
    return deviceConfig.defaultContent;
  }

  return deviceConfig.locationContent[location];
}

/**
 * Главная функция - получает персонализированный контент для устройства
 * @param {Object} body - тело запроса от Яндекс.Диалогов
 * @returns {Object} персонализированный контент
 */
function getPersonalizedContent(body) {
  const deviceInfo = getDeviceInfo(body);
  const location = getDeviceLocation(deviceInfo);
  const content = getLocationContent(location);

  // Логирование для отладки
  if (deviceConfig.settings.logDeviceInfo) {
    console.log('=== DEVICE INFO ===');
    console.log('Client ID:', deviceInfo.clientId || 'не определен');
    console.log('User ID:', deviceInfo.userId || 'не определен');
    console.log('Session ID:', deviceInfo.sessionId || 'не определен');
    console.log('Device Type:', deviceInfo.deviceType);
    console.log('Location:', location || 'не определена (используется контент по умолчанию)');
    console.log('Content Name:', content.name);
    console.log('==================');
  }

  return {
    deviceInfo,
    location,
    content,
    isPersonalized: location !== null
  };
}

/**
 * Получает приветствие для устройства
 * @param {Object} body - тело запроса от Яндекс.Диалогов
 * @returns {string} текст приветствия
 */
function getWelcomeMessage(body) {
  const { content, location } = getPersonalizedContent(body);
  
  let welcome = content.welcome;
  
  // Опционально добавляем название локации
  if (deviceConfig.settings.showLocationInWelcome && location) {
    welcome = `Зона: ${content.name}. ${welcome}`;
  }
  
  return welcome;
}

/**
 * Получает информацию об акциях для устройства
 * @param {Object} body - тело запроса от Яндекс.Диалогов
 * @returns {string} текст об акциях
 */
function getPromotionsMessage(body) {
  const { content } = getPersonalizedContent(body);
  return content.promotions;
}

/**
 * Получает кнопки по умолчанию для устройства
 * @param {Object} body - тело запроса от Яндекс.Диалогов
 * @returns {Array} массив кнопок
 */
function getDefaultButtons(body) {
  const { content } = getPersonalizedContent(body);
  return content.defaultButtons;
}

/**
 * Получает рекомендуемые стеллажи для локации
 * @param {Object} body - тело запроса от Яндекс.Диалогов
 * @returns {Array} массив номеров стеллажей
 */
function getRecommendedShelves(body) {
  const { content } = getPersonalizedContent(body);
  return content.recommendedShelves || [];
}

/**
 * Проверяет, находится ли стеллаж в рекомендуемых для данной локации
 * @param {Object} body - тело запроса от Яндекс.Диалогов
 * @param {string} shelfId - ID стеллажа
 * @returns {boolean} true если стеллаж рекомендован для этой локации
 */
function isShelfRelevant(body, shelfId) {
  const recommendedShelves = getRecommendedShelves(body);
  
  // Если список пустой - все стеллажи доступны
  if (recommendedShelves.length === 0) {
    return true;
  }
  
  return recommendedShelves.includes(parseInt(shelfId));
}

/**
 * Получает основные категории для локации
 * @param {Object} body - тело запроса от Яндекс.Диалогов
 * @returns {Array} массив категорий
 */
function getMainCategories(body) {
  const { content } = getPersonalizedContent(body);
  return content.mainCategories || [];
}

module.exports = {
  getDeviceInfo,
  getDeviceLocation,
  getLocationContent,
  getPersonalizedContent,
  getWelcomeMessage,
  getPromotionsMessage,
  getDefaultButtons,
  getRecommendedShelves,
  isShelfRelevant,
  getMainCategories
};


