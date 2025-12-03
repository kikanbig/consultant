const matrasData = require('../data/matrasy.json');

/**
 * Поиск матраса по названию модели
 * Алиса передаёт текст на русском - как слышит
 * Lagoma → лагома, Veluna → велуна
 */
function findMatrasByName(query) {
  const lowerQuery = query.toLowerCase().trim();
  
  // Логируем для отладки
  console.log(`🔍 Поиск матраса: "${lowerQuery}"`);
  
  // Специальная обработка для бренда без модели
  // Veluna = велуна, велюна
  if (lowerQuery.includes('велуна') || lowerQuery.includes('велюна')) {
    // Проверяем, есть ли конкретная модель
    if (lowerQuery.includes('лаома') || lowerQuery.includes('laoma')) {
      return matrasData.matrasy.find(m => m.id === 'veluna-laoma');
    }
    if (lowerQuery.includes('палато') || lowerQuery.includes('палатто')) {
      return matrasData.matrasy.find(m => m.id === 'veluna-palato');
    }
    // Если только бренд - показываем список
    return 'multiple_veluna';
  }
  
  // Lagoma = лагома
  if (lowerQuery.includes('лагома')) {
    // Проверяем конкретные модели
    if (lowerQuery.includes('альма') || lowerQuery.includes('алма')) {
      return matrasData.matrasy.find(m => m.id === 'lagoma-alma');
    }
    if (lowerQuery.includes('аскер') || lowerQuery.includes('аскэр') || lowerQuery.includes('оскер')) {
      return matrasData.matrasy.find(m => m.id === 'lagoma-asker');
    }
    if (lowerQuery.includes('глатта') || lowerQuery.includes('глата') || lowerQuery.includes('глатто')) {
      return matrasData.matrasy.find(m => m.id === 'lagoma-glatta');
    }
    if (lowerQuery.includes('ильта') || lowerQuery.includes('илта')) {
      return matrasData.matrasy.find(m => m.id === 'lagoma-ilta');
    }
    if (lowerQuery.includes('ленвик')) {
      return matrasData.matrasy.find(m => m.id === 'lagoma-lenvik');
    }
    if (lowerQuery.includes('лунд') || lowerQuery.includes('ланд') || lowerQuery.includes('лунт')) {
      return matrasData.matrasy.find(m => m.id === 'lagoma-lund');
    }
    if (lowerQuery.includes('нарвик') || lowerQuery.includes('норвик')) {
      return matrasData.matrasy.find(m => m.id === 'lagoma-narvik');
    }
    if (lowerQuery.includes('ульвик') || lowerQuery.includes('улвик')) {
      return matrasData.matrasy.find(m => m.id === 'lagoma-ulvik');
    }
    // Если только бренд - показываем список
    return 'multiple_lagoma';
  }
  
  // Поиск по названию модели без бренда
  // Модели Veluna
  if (lowerQuery.includes('лаома')) {
    return matrasData.matrasy.find(m => m.id === 'veluna-laoma');
  }
  if (lowerQuery.includes('палато') || lowerQuery.includes('палатто')) {
    return matrasData.matrasy.find(m => m.id === 'veluna-palato');
  }
  
  // Модели Lagoma
  if (lowerQuery.includes('альма') || lowerQuery.includes('алма')) {
    return matrasData.matrasy.find(m => m.id === 'lagoma-alma');
  }
  if (lowerQuery.includes('аскер') || lowerQuery.includes('аскэр') || lowerQuery.includes('оскер')) {
    return matrasData.matrasy.find(m => m.id === 'lagoma-asker');
  }
  if (lowerQuery.includes('глатта') || lowerQuery.includes('глата') || lowerQuery.includes('глатто')) {
    return matrasData.matrasy.find(m => m.id === 'lagoma-glatta');
  }
  if (lowerQuery.includes('ильта') || lowerQuery.includes('илта')) {
    return matrasData.matrasy.find(m => m.id === 'lagoma-ilta');
  }
  if (lowerQuery.includes('ленвик')) {
    return matrasData.matrasy.find(m => m.id === 'lagoma-lenvik');
  }
  if (lowerQuery.includes('лунд') || lowerQuery.includes('ланд') || lowerQuery.includes('лунт')) {
    return matrasData.matrasy.find(m => m.id === 'lagoma-lund');
  }
  if (lowerQuery.includes('нарвик') || lowerQuery.includes('норвик')) {
    return matrasData.matrasy.find(m => m.id === 'lagoma-narvik');
  }
  if (lowerQuery.includes('ульвик') || lowerQuery.includes('улвик')) {
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

