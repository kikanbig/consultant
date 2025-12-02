const matrasData = require('../data/matrasy.json');

/**
 * Поиск матраса по названию модели
 * Поддерживает разные варианты транскрипции
 */
function findMatrasByName(query) {
  const lowerQuery = query.toLowerCase().trim();
  
  // Ищем по всем алиасам
  for (const matras of matrasData.matrasy) {
    for (const alias of matras.aliases) {
      if (lowerQuery.includes(alias.toLowerCase())) {
        return matras;
      }
    }
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
  
  let response = `🛏️ ${matras.fullName}\n\n`;
  response += `${matras.description}\n\n`;
  
  if (matras.features && matras.features.length > 0) {
    response += `✨ Особенности:\n`;
    matras.features.forEach(feature => {
      response += `• ${feature}\n`;
    });
    response += '\n';
  }
  
  // Характеристики
  if (matras.height) {
    response += `📏 Высота: ${matras.height}\n`;
  }
  if (matras.firmness) {
    response += `💪 Жесткость: ${matras.firmness}\n`;
  }
  if (matras.maxLoad) {
    response += `⚖️ Макс. нагрузка: ${matras.maxLoad}\n`;
  }
  if (matras.warranty) {
    response += `🛡️ Гарантия: ${matras.warranty}\n`;
  }
  
  response += '\n';
  response += matras.inStock 
    ? "✅ Матрас есть в наличии." 
    : "⏳ Матрас под заказ.";
  
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

