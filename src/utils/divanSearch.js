const divansData = require('../data/divans.json');

/**
 * Транслитерация латиницы в кириллицу для поиска
 */
function transliterate(text) {
  // Специальные случаи для конкретных названий (приоритет)
  const specialCases = {
    'yuki': 'юкки',
    'yukki': 'юкки',
    'gizela': 'гизела',
    'chianti': 'кьянти',
    'kyanti': 'кьянти',
    'vito': 'вито',
    'bilbao': 'бильбао',
    'pekin': 'пекин',
    'beijing': 'пекин',
    'aisti': 'айсти',
    'isti': 'исти',
    'miami': 'майами',
    'aspen': 'аспен',
    'leyton': 'лейтон',
    'evas': 'эвас',
    'sonni': 'сонни',
    'eloy': 'элой',
    'kubo': 'кубо'
  };
  
  // Общая транслитерация
  const map = {
    'shch': 'щ', 'yo': 'ё', 'zh': 'ж', 'ch': 'ч', 'sh': 'ш', 
    'yu': 'ю', 'ya': 'я', 'ts': 'ц',
    'a': 'а', 'b': 'б', 'v': 'в', 'g': 'г', 'd': 'д', 'e': 'е',
    'z': 'з', 'i': 'и', 'y': 'й', 'k': 'к', 'l': 'л', 'm': 'м',
    'n': 'н', 'o': 'о', 'p': 'п', 'r': 'р', 's': 'с', 't': 'т', 
    'u': 'у', 'f': 'ф', 'h': 'х', 'w': 'в', 'x': 'кс', 'j': 'дж'
  };
  
  let result = text.toLowerCase();
  
  // Сначала заменяем специальные случаи
  for (const [lat, cyr] of Object.entries(specialCases)) {
    result = result.replace(new RegExp(lat, 'g'), cyr);
  }
  
  // Затем общую транслитерацию (длинные комбинации первыми)
  for (const [lat, cyr] of Object.entries(map).sort((a, b) => b[0].length - a[0].length)) {
    result = result.replace(new RegExp(lat, 'g'), cyr);
  }
  
  return result;
}

/**
 * Алиасы для брендов (латиница и кириллица)
 */
const brandAliases = {
  'veluna': ['veluna', 'велуна', 'велюна', 'илуна', 'iluna', 'вилуна'],
  'elva': ['elva', 'элва', 'эльва', 'елва', 'ельва'],
  'rivalli': ['rivalli', 'ривалли', 'ривали', 'риваллі', 'rivali'],
  'мебельград': ['мебельград', 'mebelgrad', 'мебелград', 'мебельграт'],
  'mio tesoro': ['mio tesoro', 'мио тесоро', 'мио тезоро', 'миа тесоро', 'миа тезоро', 'мио', 'миа', 'mia tesoro', 'mia'],
  'anderssen': ['anderssen', 'андерссен', 'андерсен', 'андерсон', 'андерсcен'],
  'moon trade': ['moon trade', 'мун трейд', 'мун трэйд', 'мун трейт', 'moon', 'мун'],
  'woodcraft': ['woodcraft', 'вудкрафт', 'вудкрафт', 'вуткрафт', 'wood craft'],
  'leset': ['leset', 'лесет', 'лесэт', 'лесет'],
  'homeme': ['homeme', 'хомми', 'хоумми', 'хомме', 'home me'],
  'askona': ['askona', 'аскона', 'аскона'],
  'lazurit': ['lazurit', 'лазурит', 'лазурит'],
  'pushe': ['pushe', 'пуше', 'пушэ', 'пуш'],
  'moon': ['moon', 'мун', 'мун'],
  'first': ['first', 'фирст', 'фёрст', 'ферст']
};

/**
 * Нормализация бренда - приведение к единому виду
 */
function normalizeBrand(brand) {
  const lowerBrand = brand.toLowerCase().trim();
  
  for (const [canonical, aliases] of Object.entries(brandAliases)) {
    if (aliases.some(alias => lowerBrand.includes(alias) || alias.includes(lowerBrand))) {
      return canonical;
    }
  }
  
  return lowerBrand;
}

/**
 * Поиск дивана по коду товара
 */
function findDivanByKod(kod) {
  // Убираем все нецифровые символы
  const cleanKod = String(kod).replace(/\D/g, '');
  
  return divansData.divans.find(d => 
    String(d.kod).replace(/\D/g, '') === cleanKod
  );
}

/**
 * Поиск дивана по бренду и модели (с использованием алиасов из JSON)
 */
function findDivanByBrandModel(query) {
  const lowerQuery = query.toLowerCase().trim();
  const translitQuery = transliterate(lowerQuery);
  
  console.log(`🔍 Поиск дивана: "${lowerQuery}"`);
  if (translitQuery !== lowerQuery) {
    console.log(`   Транслит: "${translitQuery}"`);
  }
  
  // Сначала пробуем найти точное совпадение по полному названию
  for (const divan of divansData.divans) {
    const divanName = divan.name.toLowerCase();
    if ((divanName.includes(lowerQuery) || divanName.includes(translitQuery)) && lowerQuery.length > 5) {
      return divan;
    }
  }
  
  // Затем ищем по алиасам бренда и модели из JSON
  for (const divan of divansData.divans) {
    // Проверяем бренд через алиасы из JSON
    let brandMatch = false;
    
    if (divan.brandAliases && Array.isArray(divan.brandAliases)) {
      brandMatch = divan.brandAliases.some(alias => 
        lowerQuery.includes(alias.toLowerCase()) || 
        translitQuery.includes(alias.toLowerCase())
      );
    }
    
    // Fallback: прямое вхождение бренда
    if (!brandMatch && divan.brand) {
      const divanBrand = divan.brand.toLowerCase();
      brandMatch = lowerQuery.includes(divanBrand) || translitQuery.includes(divanBrand);
    }
    
    if (brandMatch) {
      // Проверяем модель через алиасы из JSON
      let modelMatch = false;
      
      if (divan.modelAliases && Array.isArray(divan.modelAliases)) {
        modelMatch = divan.modelAliases.some(alias => {
          const aliasLower = alias.toLowerCase();
          return lowerQuery.includes(aliasLower) || 
                 translitQuery.includes(aliasLower) ||
                 aliasLower.includes(lowerQuery) ||
                 aliasLower.includes(translitQuery);
        });
      }
      
      // Fallback: прямое вхождение модели
      if (!modelMatch && divan.model) {
        const divanModel = divan.model.toLowerCase();
        const modelFirstWord = divanModel.split(/\s+/)[0];
        
        modelMatch = lowerQuery.includes(modelFirstWord) || 
                     translitQuery.includes(modelFirstWord) ||
                     lowerQuery.includes(divanModel) ||
                     translitQuery.includes(divanModel);
      }
      
      if (modelMatch) {
        return divan;
      }
    }
  }
  
  // НОВАЯ ЛОГИКА: Поиск только по модели без бренда
  // Если не нашли с брендом, пробуем найти только по модели
  console.log(`   Поиск только по модели...`);
  
  for (const divan of divansData.divans) {
    // Проверяем модель через алиасы
    if (divan.modelAliases && Array.isArray(divan.modelAliases)) {
      const modelMatch = divan.modelAliases.some(alias => {
        const aliasLower = alias.toLowerCase();
        // Проверяем точное совпадение или вхождение
        return aliasLower === lowerQuery || 
               aliasLower === translitQuery ||
               (lowerQuery.length > 3 && aliasLower.includes(lowerQuery)) ||
               (translitQuery.length > 3 && aliasLower.includes(translitQuery));
      });
      
      if (modelMatch) {
        console.log(`   ✓ Найден по модели: ${divan.brand} ${divan.model}`);
        return divan;
      }
    }
    
    // Fallback: прямое совпадение с моделью
    if (divan.model) {
      const divanModel = divan.model.toLowerCase();
      const modelFirstWord = divanModel.split(/\s+/)[0];
      
      if (modelFirstWord.length > 3 && 
          (lowerQuery.includes(modelFirstWord) || translitQuery.includes(modelFirstWord))) {
        console.log(`   ✓ Найден по первому слову модели: ${divan.brand} ${divan.model}`);
        return divan;
      }
    }
  }
  
  return null;
}

/**
 * Генерация ответа с описанием дивана
 */
function generateDivanResponse(query) {
  // Сначала пробуем найти по коду (если в запросе есть 5+ цифр подряд)
  const kodMatch = query.match(/\d{5,}/);
  if (kodMatch) {
    const divan = findDivanByKod(kodMatch[0]);
    if (divan) {
      return formatDivanResponse(divan);
    }
  }
  
  // Иначе ищем по бренду и модели
  const divan = findDivanByBrandModel(query);
  
  if (!divan) {
    return {
      found: false,
      response: "Не могу найти такой диван. Назовите код товара или артикул."
    };
  }
  
  return formatDivanResponse(divan);
}

/**
 * Форматирование ответа о диване
 */
function formatDivanResponse(divan) {
  let response = `🛋️ ${divan.name}\n\n`;
  response += `Код товара: ${divan.kod}\n\n`;
  
  // Добавляем описание
  let description = divan.description;
  
  // Обрезаем если превышает лимит (оставляем место для заголовка и кода)
  const maxDescLen = 850; // Лимит для описания
  if (description.length > maxDescLen) {
    description = description.substring(0, maxDescLen) + '...';
  }
  
  response += description;
  
  // Финальная проверка длины
  if (response.length > 1000) {
    const overhead = `🛋️ ${divan.name}\n\nКод товара: ${divan.kod}\n\n`.length;
    const maxDesc = 1000 - overhead - 3;
    description = divan.description.substring(0, maxDesc) + '...';
    response = `🛋️ ${divan.name}\n\nКод товара: ${divan.kod}\n\n${description}`;
  }
  
  return {
    found: true,
    response: response,
    divan: divan
  };
}

/**
 * Получить все диваны
 */
function getAllDivans() {
  return divansData.divans;
}

module.exports = {
  findDivanByKod,
  findDivanByBrandModel,
  generateDivanResponse,
  getAllDivans
};

