const fs = require('fs');
const path = require('path');
const { formatPriceForSpeech } = require('./priceFormatter');

// Загружаем данные о стеллажах
let shelvesData = null;

function loadShelvesData() {
  if (!shelvesData) {
    try {
      const dataPath = path.join(__dirname, '../data/shelves.json');
      const rawData = fs.readFileSync(dataPath, 'utf8');
      shelvesData = JSON.parse(rawData);
      console.log(`Загружено ${Object.keys(shelvesData.shelves).length} стеллажей`);
    } catch (error) {
      console.error('Ошибка загрузки данных о стеллажах:', error);
      shelvesData = { shelves: {} };
    }
  }
  return shelvesData;
}

// Получить список всех стеллажей
function getAllShelves() {
  const data = loadShelvesData();
  return Object.keys(data.shelves).map(id => ({
    id,
    name: data.shelves[id].name,
    description: data.shelves[id].description
  }));
}

// Получить информацию о конкретном стеллаже
function getShelfInfo(shelfId) {
  const data = loadShelvesData();
  const shelf = data.shelves[shelfId];
  
  if (!shelf) {
    return null;
  }
  
  const shelfLevels = Object.keys(shelf.shelves).map(levelId => ({
    id: levelId,
    name: shelf.shelves[levelId].name,
    productCount: shelf.shelves[levelId].products.length
  }));
  
  return {
    id: shelfId,
    name: shelf.name,
    description: shelf.description,
    levels: shelfLevels
  };
}

// Получить товары с конкретной полки
function getShelfLevelProducts(shelfId, levelId) {
  const data = loadShelvesData();
  const shelf = data.shelves[shelfId];
  
  if (!shelf || !shelf.shelves[levelId]) {
    return null;
  }
  
  return shelf.shelves[levelId].products.map(product => ({
    ...product,
    priceFormatted: formatPriceForSpeech(product.price)
  }));
}

// Поиск товара по артикулу на всех стеллажах
function findProductByArticle(article) {
  const data = loadShelvesData();
  
  for (const shelfId in data.shelves) {
    const shelf = data.shelves[shelfId];
    for (const levelId in shelf.shelves) {
      const level = shelf.shelves[levelId];
      const product = level.products.find(p => p.article === article);
      if (product) {
        return {
          product: {
            ...product,
            priceFormatted: formatPriceForSpeech(product.price)
          },
          shelfId,
          shelfName: shelf.name,
          levelId,
          levelName: level.name
        };
      }
    }
  }
  
  return null;
}

// Генерация ответа о стеллаже
function generateShelfResponse(shelfId) {
  const shelfInfo = getShelfInfo(shelfId);
  
  if (!shelfInfo) {
    return {
      text: `Стеллаж номер ${shelfId} не найден. У нас есть стеллажи с номерами: ${getAllShelves().map(s => s.id).join(', ')}.`,
      endSession: false
    };
  }
  
  let response = `На стеллаже "${shelfInfo.name}" есть следующие полки:\n\n`;
  
  shelfInfo.levels.forEach((level, index) => {
    response += `${index + 1}. ${level.name} (${level.productCount} товаров)\n`;
  });
  
  response += `\nНа какой полке вас интересует? Скажите номер полки.`;
  
  return {
    text: response,
    endSession: false,
    buttons: shelfInfo.levels.map((level, index) => ({
      title: `Полка ${index + 1}`,
      payload: {
        shelf_id: shelfId,
        level_id: level.id
      }
    }))
  };
}

// Генерация ответа о полке
function generateShelfLevelResponse(shelfId, levelId) {
  const products = getShelfLevelProducts(shelfId, levelId);
  const shelfInfo = getShelfInfo(shelfId);
  
  if (!products) {
    return {
      text: `Полка не найдена на стеллаже ${shelfId}.`,
      endSession: false
    };
  }
  
  const level = shelfInfo.levels.find(l => l.id === levelId);
  let response = `На полке "${level.name}" стеллажа "${shelfInfo.name}" находится:\n\n`;
  
  if (products.length === 0) {
    response += "На этой полке пока нет товаров.";
  } else {
    products.forEach((product, index) => {
      response += `${index + 1}. ${product.name}\n`;
      response += `   Бренд: ${product.brand}\n`;
      response += `   Цена: ${product.priceFormatted}\n`;
      response += `   Артикул: ${product.article}\n`;
      if (product.description) {
        response += `   Описание: ${product.description}\n`;
      }
      response += `   Наличие: ${product.availability}\n\n`;
    });
  }
  
  return {
    text: response,
    endSession: false
  };
}

module.exports = {
  loadShelvesData,
  getAllShelves,
  getShelfInfo,
  getShelfLevelProducts,
  findProductByArticle,
  generateShelfResponse,
  generateShelfLevelResponse
};
