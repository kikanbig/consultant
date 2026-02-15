const fs = require('fs');
const path = require('path');

// Загружаем данные о товарах
let productsData = null;

function loadProductsData() {
  if (!productsData) {
    try {
      const dataPath = path.join(__dirname, '..', '..', 'config', 'products.json');
      const rawData = fs.readFileSync(dataPath, 'utf8');
      productsData = JSON.parse(rawData);
      console.log(`✓ Загружено ${productsData.length} товаров из базы данных`);
    } catch (error) {
      console.error('✗ Ошибка загрузки данных о товарах:', error);
      productsData = [];
    }
  }
  return productsData;
}

// Словарь для преобразования цифр из слов в числа
const digitWords = {
  // Единицы
  'ноль': '0', 'нуль': '0',
  'один': '1', 'одна': '1', 'единица': '1',
  'два': '2', 'две': '2', 'двойка': '2',
  'три': '3', 'тройка': '3',
  'четыре': '4', 'четверка': '4',
  'пять': '5', 'пятерка': '5',
  'шесть': '6', 'шестерка': '6',
  'семь': '7', 'семерка': '7',
  'восемь': '8', 'восьмерка': '8',
  'девять': '9', 'девятка': '9',
  
  // Десятки
  'десять': '10',
  'одиннадцать': '11',
  'двенадцать': '12',
  'тринадцать': '13',
  'четырнадцать': '14',
  'пятнадцать': '15',
  'шестнадцать': '16',
  'семнадцать': '17',
  'восемнадцать': '18',
  'девятнадцать': '19',
  'двадцать': '20',
  'тридцать': '30',
  'сорок': '40',
  'пятьдесят': '50',
  'шестьдесят': '60',
  'семьдесят': '70',
  'восемьдесят': '80',
  'девяносто': '90',
  
  // Сотни
  'сто': '100',
  'двести': '200',
  'триста': '300',
  'четыреста': '400',
  'пятьсот': '500',
  'шестьсот': '600',
  'семьсот': '700',
  'восемьсот': '800',
  'девятьсот': '900'
};

// Преобразование цифр произнесенных словами в числа
// Поддерживает произнесение по одной цифре (основной режим для артикулов)
function convertWordsToDigits(text) {
  if (!text) return text;
  
  let result = text.toLowerCase();
  
  // Основной режим: произнесение по одной цифре
  // Замена слов на цифры (длинные слова сначала, чтобы избежать конфликтов)
  result = result.replace(/восьмерка/g, ' 8 ');
  result = result.replace(/восемь/g, ' 8 ');
  result = result.replace(/семерка/g, ' 7 ');
  result = result.replace(/семь/g, ' 7 ');
  result = result.replace(/шестерка/g, ' 6 ');
  result = result.replace(/шесть/g, ' 6 ');
  result = result.replace(/пятерка/g, ' 5 ');
  result = result.replace(/пять/g, ' 5 ');
  result = result.replace(/четверка/g, ' 4 ');
  result = result.replace(/четыре/g, ' 4 ');
  result = result.replace(/тройка/g, ' 3 ');
  result = result.replace(/три/g, ' 3 ');
  result = result.replace(/двойка/g, ' 2 ');
  result = result.replace(/две/g, ' 2 ');
  result = result.replace(/два/g, ' 2 ');
  result = result.replace(/единица/g, ' 1 ');
  result = result.replace(/одна/g, ' 1 ');
  result = result.replace(/один/g, ' 1 ');
  result = result.replace(/девятка/g, ' 9 ');
  result = result.replace(/девять/g, ' 9 ');
  result = result.replace(/ноль/g, ' 0 ');
  result = result.replace(/нуль/g, ' 0 ');
  
  // Дополнительно: поддержка числа 10 (десять) для последних двух цифр "1 0"
  result = result.replace(/десять/g, ' 1 0 ');
  
  return result;
}

// Функция для извлечения артикула из команды
function extractArticle(command) {
  if (!command) return null;
  
  // Преобразуем слова в цифры
  const converted = convertWordsToDigits(command);
  
  // Убираем все пробелы и дефисы между цифрами для извлечения артикула
  const digitsOnly = converted.replace(/[\s\-]+/g, '');
  
  // Ищем последовательность цифр (минимум 5 цифр, максимум 10)
  const patterns = [
    /(\d{10})/g, // 10 цифр
    /(\d{9})/g,  // 9 цифр
    /(\d{8})/g,  // 8 цифр
    /(\d{7})/g,  // 7 цифр
    /(\d{6})/g,  // 6 цифр
    /(\d{5})/g   // 5 цифр (минимум)
  ];
  
  for (const pattern of patterns) {
    const matches = digitsOnly.match(pattern);
    if (matches && matches.length > 0) {
      // Возвращаем самое длинное совпадение
      return matches.sort((a, b) => b.length - a.length)[0];
    }
  }
  
  return null;
}

// Поиск товара по артикулу
function findProductByArticle(searchArticle) {
  const data = loadProductsData();
  
  if (!searchArticle) return null;
  
  // Преобразуем артикул в число для сравнения
  const searchCode = parseInt(searchArticle, 10);
  
  // Ищем точное совпадение
  const product = data.find(item => {
    const itemCode = parseInt(item['Код товара'], 10);
    return itemCode === searchCode;
  });
  
  // Если не нашли точное совпадение, ищем частичное (последние цифры)
  if (!product && searchArticle.length >= 5) {
    const partialMatch = data.find(item => {
      const itemCode = String(item['Код товара']);
      return itemCode.endsWith(searchArticle);
    });
    return partialMatch || null;
  }
  
  return product || null;
}

// Функция для преобразования числа в произносимый формат (по одной цифре)
function formatArticleForSpeech(article) {
  if (!article) return '';
  
  const digits = String(article).split('');
  return digits.join(' ');
}

// Генерация описания товара по схеме
function generateProductDescription(product) {
  if (!product) return null;
  
  let description = '';
  
  // Слой A — идентификация (всегда)
  const articleForSpeech = formatArticleForSpeech(product['Код товара']);
  description += `По коду ${articleForSpeech} — товар: ${product['Название']}.`;
  
  // Слой B — описание (главное)
  if (product['Описание (для Алисы)']) {
    description += ` Коротко: ${product['Описание (для Алисы)']}.`;
  }
  
  // Слой C — факты (3–5 максимум, только если заполнены)
  const facts = [];
  
  // 1. Цвет
  if (product['Цвет']) {
    facts.push(`цвет — ${product['Цвет']}`);
  }
  
  // 2. Материал
  if (product['Материал']) {
    facts.push(`материал — ${product['Материал']}`);
  }
  
  // 3. Размеры
  if (product['Размеры']) {
    facts.push(`размеры: ${product['Размеры']}`);
  }
  
  // 4. Вес
  if (product['Вес']) {
    facts.push(`вес — ${product['Вес']}`);
  }
  
  // 5. Комплектация
  if (product['Комплектация']) {
    facts.push(product['Комплектация']);
  }
  
  // Добавляем факты, если они есть
  if (facts.length > 0) {
    // Ограничиваем до 5 фактов
    const limitedFacts = facts.slice(0, 5);
    description += ` Основные параметры: ${limitedFacts.join(', ')}.`;
  }
  
  return description;
}

// Генерация ответа для поиска по артикулу
function generateProductResponse(command) {
  // Извлекаем артикул из команды
  const article = extractArticle(command);
  
  if (!article) {
    return {
      found: false,
      response: 'Не удалось распознать артикул. Назовите артикул товара, например: "артикул девять пять семь четыре шесть один ноль" или просто "девять пять семь четыре шесть один ноль".'
    };
  }
  
  // Ищем товар
  const product = findProductByArticle(article);
  
  if (!product) {
    const articleForSpeech = formatArticleForSpeech(article);
    return {
      found: false,
      response: `Товар с кодом ${articleForSpeech} не найден в базе данных. Проверьте правильность артикула или обратитесь к консультанту.`
    };
  }
  
  // Генерируем описание
  const description = generateProductDescription(product);
  
  return {
    found: true,
    product: product,
    response: description
  };
}

// Экспорт функций
module.exports = {
  loadProductsData,
  findProductByArticle,
  generateProductResponse,
  extractArticle,
  convertWordsToDigits,
  formatArticleForSpeech,
  generateProductDescription
};
