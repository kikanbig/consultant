const fs = require('fs');
const path = require('path');

// Загружаем данные о диванах
let divansData = null;

function loadDivansData() {
  if (!divansData) {
    try {
      const dataPath = path.join(__dirname, '..', 'data', 'divans.json');
      const rawData = fs.readFileSync(dataPath, 'utf8');
      divansData = JSON.parse(rawData);
      console.log(`Загружено ${divansData.length} товаров`);
    } catch (error) {
      console.error('Ошибка загрузки данных о диванах:', error);
      divansData = [];
    }
  }
  return divansData;
}

// Функция для очистки артикула (убираем точки)
function cleanArticle(article) {
  if (!article) return '';
  return String(article).replace(/[.\s-]/g, '').toLowerCase();
}

// Поиск товара по артикулу
function findByArticle(searchArticle) {
  const data = loadDivansData();
  const cleanSearch = cleanArticle(searchArticle);
  
  // Ищем точное совпадение
  const product = data.find(item => {
    const cleanItemArticle = cleanArticle(item.article);
    return cleanItemArticle === cleanSearch;
  });
  
  return product || null;
}

// Форматирование свойств товара для ответа
function formatProductProperties(product) {
  if (!product || !product.properties) {
    return "К сожалению, не нашла информации о свойствах этого товара.";
  }
  
  let response = `Товар с артикулом ${product.article}:\n\n`;
  
  // Группируем свойства для лучшего восприятия
  const properties = product.properties;
  
  // Основная информация
  if (properties['Заголовок']) {
    response += `📋 Название: ${properties['Заголовок']}\n`;
  }
  
  if (properties['Цена']) {
    response += `💰 Цена: ${properties['Цена']} руб.\n`;
  }
  
  // Добавляем остальные свойства
  Object.entries(properties).forEach(([key, value]) => {
    if (key !== 'Заголовок' && key !== 'Цена' && value) {
      // Сокращаем очень длинные значения
      let displayValue = String(value);
      if (displayValue.length > 100) {
        displayValue = displayValue.substring(0, 97) + '...';
      }
      response += `• ${key}: ${displayValue}\n`;
    }
  });
  
  return response.trim();
}

// Генерация ответа для найденного товара
function generateArticleResponse(searchArticle) {
  const product = findByArticle(searchArticle);
  
  if (!product) {
    return {
      found: false,
      response: `Товар с артикулом ${searchArticle} не найден. Проверьте правильность артикула или обратитесь к консультанту в фирменных футболках двадцать первый век дом.`
    };
  }
  
  const formattedInfo = formatProductProperties(product);
  
  return {
    found: true,
    product: product,
    response: formattedInfo
  };
}

module.exports = {
  findByArticle,
  generateArticleResponse,
  cleanArticle,
  formatProductProperties
};
