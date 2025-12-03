const matrasData = require('../data/matrasy.json');

/**
 * Поиск матраса по названию модели
 * УНИВЕРСАЛЬНЫЙ ПОИСК через алиасы из JSON
 */
function findMatrasByName(query) {
  const lowerQuery = query.toLowerCase().trim();
  
  // Логируем для отладки
  console.log(`🔍 Поиск матраса: "${lowerQuery}"`);
  
  // Проверяем бренды (для показа списка моделей)
  const velunaBrands = ['велуна', 'велюна', 'veluna', 'илуна', 'iluna', 'вилуна'];
  const lagomaBrands = ['лагома', 'lagoma', 'лагуна', 'lagoona', 'лагона', 'lagona'];
  
  let hasVelunaBrand = velunaBrands.some(brand => lowerQuery.includes(brand));
  let hasLagomaBrand = lagomaBrands.some(brand => lowerQuery.includes(brand));
  
  // Ищем точное совпадение по алиасам
  for (const matras of matrasData.matrasy) {
    for (const alias of matras.aliases) {
      if (lowerQuery.includes(alias.toLowerCase())) {
        return matras;
      }
    }
  }
  
  // Если нашли только бренд без модели - показываем список
  if (hasVelunaBrand && !hasLagomaBrand) {
    return 'multiple_veluna';
  }
  if (hasLagomaBrand && !hasVelunaBrand) {
    return 'multiple_lagoma';
  }
  
  return null;
}

/**
 * Генерация ответа с описанием матраса
 */
function generateMatrasResponse(query) {
  const matras = findMatrasByName(query);
  
  if (!matras) {
    return {
      found: false,
      response: "Тут такие классные матрасы, я еще сонная, не поняла ваш вопрос. Можете повторить название модели?"
    };
  }
  
  // Обработка запроса бренда без конкретной модели
  if (matras === 'multiple_veluna') {
    return {
      found: true,
      response: "У нас есть два премиальных матраса Veluna:\n\n" +
        "🛏️ Veluna Laoma - высота 30 см, 7 зон поддержки\n" +
        "🛏️ Veluna Palato - высота 35 см, 5 зон поддержки\n\n" +
        "Про какую модель хотите узнать подробнее?"
    };
  }
  
  if (matras === 'multiple_lagoma') {
    return {
      found: true,
      response: "У нас есть 8 моделей матрасов Lagoma:\n\n" +
        "🛏️ Alma, Asker, Glatta, Ilta\n" +
        "🛏️ Lenvik, Lund, Narvik, Ulvik\n\n" +
        "Назовите конкретную модель, и я расскажу подробнее!"
    };
  }
  
  let response = `🛏️ ${matras.fullName}\n\n`;
  response += `${matras.description}\n\n`;
  
  // Характеристики (компактно)
  let specs = [];
  if (matras.height) specs.push(`📏 ${matras.height}`);
  if (matras.firmness) specs.push(`💪 ${matras.firmness}`);
  if (matras.maxLoad) specs.push(`⚖️ до ${matras.maxLoad}`);
  if (matras.warranty) specs.push(`🛡️ ${matras.warranty}`);
  
  if (specs.length > 0) {
    response += specs.join(' | ') + '\n\n';
  }
  
  response += matras.inStock 
    ? "✅ Есть в наличии." 
    : "⏳ Под заказ.";
  
  // Обрезаем если превышает лимит Алисы (1024 символа)
  if (response.length > 1000) {
    // Обрезаем описание, оставляя место для остального
    const maxDescLen = 900;
    if (matras.description.length > maxDescLen) {
      const shortDesc = matras.description.substring(0, maxDescLen) + '...';
      response = `🛏️ ${matras.fullName}\n\n`;
      response += `${shortDesc}\n\n`;
      if (specs.length > 0) {
        response += specs.join(' | ') + '\n\n';
      }
      response += matras.inStock ? "✅ Есть в наличии." : "⏳ Под заказ.";
    }
  }
  
  return {
    found: true,
    response: response,
    matras: matras
  };
}

/**
 * Получить список всех матрасов
 */
function getAllMatrasy() {
  return matrasData.matrasy;
}

/**
 * Получить матрасы по бренду
 */
function getMatrasyByBrand(brand) {
  return matrasData.matrasy.filter(m => 
    m.brand.toLowerCase() === brand.toLowerCase()
  );
}

module.exports = {
  findMatrasByName,
  generateMatrasResponse,
  getAllMatrasy,
  getMatrasyByBrand
};

