const matrasData = require('../data/matrasy.json');

/**
 * Поиск матраса по названию модели
 * Алиса может передавать текст как на кириллице, так и на латинице!
 */
function findMatrasByName(query) {
  const lowerQuery = query.toLowerCase().trim();
  
  // Логируем для отладки
  console.log(`🔍 Поиск матраса: "${lowerQuery}"`);
  
  // === VELUNA (велуна/veluna) ===
  if (lowerQuery.includes('велуна') || lowerQuery.includes('велюна') || lowerQuery.includes('veluna')) {
    // Laoma
    if (lowerQuery.includes('лаома') || lowerQuery.includes('laoma')) {
      return matrasData.matrasy.find(m => m.id === 'veluna-laoma');
    }
    // Palato
    if (lowerQuery.includes('палато') || lowerQuery.includes('палатто') || 
        lowerQuery.includes('palato') || lowerQuery.includes('palatto')) {
      return matrasData.matrasy.find(m => m.id === 'veluna-palato');
    }
    // Только бренд
    return 'multiple_veluna';
  }
  
  // === LAGOMA (лагома/lagoma) ===
  if (lowerQuery.includes('лагома') || lowerQuery.includes('lagoma')) {
    // Alma
    if (lowerQuery.includes('альма') || lowerQuery.includes('алма') || lowerQuery.includes('alma')) {
      return matrasData.matrasy.find(m => m.id === 'lagoma-alma');
    }
    // Asker
    if (lowerQuery.includes('аскер') || lowerQuery.includes('аскэр') || lowerQuery.includes('оскер') || 
        lowerQuery.includes('asker')) {
      return matrasData.matrasy.find(m => m.id === 'lagoma-asker');
    }
    // Glatta
    if (lowerQuery.includes('глатта') || lowerQuery.includes('глата') || lowerQuery.includes('глатто') ||
        lowerQuery.includes('glatta') || lowerQuery.includes('glattta') || lowerQuery.includes('glata')) {
      return matrasData.matrasy.find(m => m.id === 'lagoma-glatta');
    }
    // Ilta
    if (lowerQuery.includes('ильта') || lowerQuery.includes('илта') || lowerQuery.includes('ilta')) {
      return matrasData.matrasy.find(m => m.id === 'lagoma-ilta');
    }
    // Lenvik
    if (lowerQuery.includes('ленвик') || lowerQuery.includes('lenvik')) {
      return matrasData.matrasy.find(m => m.id === 'lagoma-lenvik');
    }
    // Lund
    if (lowerQuery.includes('лунд') || lowerQuery.includes('ланд') || lowerQuery.includes('лунт') ||
        lowerQuery.includes('lund')) {
      return matrasData.matrasy.find(m => m.id === 'lagoma-lund');
    }
    // Narvik
    if (lowerQuery.includes('нарвик') || lowerQuery.includes('норвик') || lowerQuery.includes('narvik')) {
      return matrasData.matrasy.find(m => m.id === 'lagoma-narvik');
    }
    // Ulvik
    if (lowerQuery.includes('ульвик') || lowerQuery.includes('улвик') || lowerQuery.includes('ulvik')) {
      return matrasData.matrasy.find(m => m.id === 'lagoma-ulvik');
    }
    // Только бренд
    return 'multiple_lagoma';
  }
  
  // === ПОИСК ТОЛЬКО ПО МОДЕЛИ (без бренда) ===
  
  // Veluna модели
  if (lowerQuery.includes('лаома') || lowerQuery.includes('laoma')) {
    return matrasData.matrasy.find(m => m.id === 'veluna-laoma');
  }
  if (lowerQuery.includes('палато') || lowerQuery.includes('палатто') || 
      lowerQuery.includes('palato') || lowerQuery.includes('palatto')) {
    return matrasData.matrasy.find(m => m.id === 'veluna-palato');
  }
  
  // Lagoma модели
  if (lowerQuery.includes('альма') || lowerQuery.includes('алма') || lowerQuery.includes('alma')) {
    return matrasData.matrasy.find(m => m.id === 'lagoma-alma');
  }
  if (lowerQuery.includes('аскер') || lowerQuery.includes('аскэр') || lowerQuery.includes('оскер') || 
      lowerQuery.includes('asker')) {
    return matrasData.matrasy.find(m => m.id === 'lagoma-asker');
  }
  if (lowerQuery.includes('глатта') || lowerQuery.includes('глата') || lowerQuery.includes('глатто') ||
      lowerQuery.includes('glatta') || lowerQuery.includes('glattta') || lowerQuery.includes('glata')) {
    return matrasData.matrasy.find(m => m.id === 'lagoma-glatta');
  }
  if (lowerQuery.includes('ильта') || lowerQuery.includes('илта') || lowerQuery.includes('ilta')) {
    return matrasData.matrasy.find(m => m.id === 'lagoma-ilta');
  }
  if (lowerQuery.includes('ленвик') || lowerQuery.includes('lenvik')) {
    return matrasData.matrasy.find(m => m.id === 'lagoma-lenvik');
  }
  if (lowerQuery.includes('лунд') || lowerQuery.includes('ланд') || lowerQuery.includes('лунт') ||
      lowerQuery.includes('lund')) {
    return matrasData.matrasy.find(m => m.id === 'lagoma-lund');
  }
  if (lowerQuery.includes('нарвик') || lowerQuery.includes('норвик') || lowerQuery.includes('narvik')) {
    return matrasData.matrasy.find(m => m.id === 'lagoma-narvik');
  }
  if (lowerQuery.includes('ульвик') || lowerQuery.includes('улвик') || lowerQuery.includes('ulvik')) {
    return matrasData.matrasy.find(m => m.id === 'lagoma-ulvik');
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

