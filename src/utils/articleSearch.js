const fs = require('fs');
const path = require('path');
const { formatPriceForSpeech } = require('./priceFormatter');

// ВАЖНО: Этот модуль устарел и оставлен для обратной совместимости
// Используйте productSearch.js для новой функциональности

// Загружаем данные о диванах (старая функциональность)
let divansData = null;

function loadDivansData() {
  if (!divansData) {
    try {
      const dataPath = path.join(__dirname, '..', 'data', 'divans.json');
      const rawData = fs.readFileSync(dataPath, 'utf8');
      divansData = JSON.parse(rawData);
      console.log(`Загружено ${divansData.length} товаров из divans.json`);
    } catch (error) {
      console.error('Ошибка загрузки данных о диванах:', error);
      divansData = [];
    }
  }
  return divansData;
}

// Словарь для преобразования цифр из слов в числа
const digitWords = {
  'ноль': '0', 'нуль': '0',
  'один': '1', 'одна': '1', 'единица': '1',
  'два': '2', 'две': '2', 'двойка': '2',
  'три': '3', 'тройка': '3',
  'четыре': '4', 'четверка': '4',
  'пять': '5', 'пятерка': '5',
  'шесть': '6', 'шестерка': '6',
  'семь': '7', 'семерка': '7',
  'восемь': '8', 'восьмерка': '8',
  'девять': '9', 'девятка': '9'
};

// Преобразование цифр произнесенных словами в числа
function convertWordsToDigits(text) {
  if (!text) return text;
  
  let result = text.toLowerCase();
  
  // Замена слов на цифры (длинные слова сначала, чтобы избежать конфликтов)
  result = result.replace(/восьмерка/g, '8');
  result = result.replace(/восемь/g, '8');
  result = result.replace(/семерка/g, '7');
  result = result.replace(/семь/g, '7');
  result = result.replace(/шестерка/g, '6');
  result = result.replace(/шесть/g, '6');
  result = result.replace(/пятерка/g, '5');
  result = result.replace(/пять/g, '5');
  result = result.replace(/четверка/g, '4');
  result = result.replace(/четыре/g, '4');
  result = result.replace(/тройка/g, '3');
  result = result.replace(/три/g, '3');
  result = result.replace(/двойка/g, '2');
  result = result.replace(/две/g, '2');
  result = result.replace(/два/g, '2');
  result = result.replace(/единица/g, '1');
  result = result.replace(/одна/g, '1');
  result = result.replace(/один/g, '1');
  result = result.replace(/девятка/g, '9');
  result = result.replace(/девять/g, '9');
  result = result.replace(/ноль/g, '0');
  result = result.replace(/нуль/g, '0');
  
  // Извлекаем только цифры из результата
  const digits = result.match(/\d/g);
  if (digits && digits.length >= 5) {
    return digits.join('');
  }
  
  return text; // Возвращаем оригинальный текст если цифр меньше 5
}

// Функция для очистки артикула (убираем точки)
function cleanArticle(article) {
  if (!article) return '';
  return String(article).replace(/[.\s-]/g, '').toLowerCase();
}

// Поиск товара по артикулу
function findByArticle(searchArticle) {
  const data = loadDivansData();
  
  // Сначала преобразуем слова в цифры
  const convertedArticle = convertWordsToDigits(searchArticle);
  const cleanSearch = cleanArticle(convertedArticle);
  
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
    const price = parseFloat(properties['Цена']);
    if (!isNaN(price)) {
      response += `💰 Цена: ${formatPriceForSpeech(price)}\n`;
    } else {
      response += `💰 Цена: ${properties['Цена']} руб.\n`;
    }
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
  formatProductProperties,
  convertWordsToDigits
};
