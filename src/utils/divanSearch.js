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
    'kubo': 'кубо',
    'montreal': 'монреаль',
    'douglas': 'дуглас',
    'emma': 'эмма',
    'dijon': 'дижон',
    'orleans': 'орлеан',
    'parma': 'парма',
    'discovery': 'дискавери',
    'porto': 'порто',
    'somerset': 'сомерсет',
    'rimini': 'римини',
    'valencia': 'валенсия'
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
 * Конвертирует произнесённые цифры в числа
 * Например: "один ноль ноль семь" → "1007"
 */
function spokenDigitsToNumbers(text) {
  const digitMap = {
    'ноль': '0', 'нуль': '0',
    'один': '1', 'раз': '1', 'адин': '1',
    'два': '2', 'двойка': '2',
    'три': '3', 'тройка': '3',
    'четыре': '4', 'четверка': '4', 'читыре': '4',
    'пять': '5', 'пятерка': '5', 'пьять': '5',
    'шесть': '6', 'шестерка': '6', 'шэсть': '6',
    'семь': '7', 'семерка': '7', 'сем': '7',
    'восемь': '8', 'восьмерка': '8', 'восем': '8',
    'девять': '9', 'девятка': '9', 'дивять': '9'
  };
  
  let result = '';
  const words = text.toLowerCase().split(/\s+/);
  
  for (const word of words) {
    if (digitMap[word]) {
      result += digitMap[word];
    }
  }
  
  return result;
}

/**
 * Поиск дивана по коду товара (артикулу)
 * Поддерживает как цифры, так и произнесённые названия цифр
 */
function findDivanByKod(kod) {
  // Убираем все нецифровые символы
  const cleanKod = String(kod).replace(/\D/g, '');
  
  // Если есть цифры, ищем по ним
  if (cleanKod.length > 0) {
    const found = divansData.divans.find(d => 
      String(d.kod).replace(/\D/g, '') === cleanKod
    );
    if (found) return found;
  }
  
  // Пробуем конвертировать произнесённые цифры
  const spokenNumber = spokenDigitsToNumbers(String(kod));
  if (spokenNumber.length >= 4) {  // Минимум 4 цифры для поиска
    return divansData.divans.find(d => {
      const divanKod = String(d.kod).replace(/\D/g, '');
      // Ищем частичное совпадение (начало или полное)
      return divanKod.startsWith(spokenNumber) || divanKod === spokenNumber;
    });
  }
  
  return null;
}

/**
 * Поиск дивана по бренду и модели (с использованием алиасов из JSON)
 */
function findDivanByBrandModel(query) {
  let lowerQuery = query.toLowerCase().trim();
  
  // Убираем служебные слова из запроса
  const stopWords = ['диван', 'кресло', 'расскажи', 'про', 'о', 'об', 'мне', 'пожалуйста', 'хочу', 'узнать', 'спасибо', 'также', 'хорошо', 'еще', 'ещё'];
  for (const word of stopWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    lowerQuery = lowerQuery.replace(regex, ' ');
  }
  lowerQuery = lowerQuery.replace(/\s+/g, ' ').trim(); // Убираем лишние пробелы
  
  // ФОНЕТИЧЕСКАЯ НОРМАЛИЗАЦИЯ (как для матрасов)
  // Исправляем частые ошибки распознавания
  lowerQuery = lowerQuery
    .replace(/порта/g, 'порто')
    .replace(/парта/g, 'порто')
    .replace(/милано/g, 'милан')
    .replace(/джижон/g, 'дижон')
    .replace(/porta/g, 'porto')
    .replace(/parta/g, 'porto')
    .replace(/milano/g, 'milan');
  
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
        // Проверяем точное совпадение или вхождение в обе стороны
        return aliasLower === lowerQuery || 
               aliasLower === translitQuery ||
               (lowerQuery.length > 3 && (aliasLower.includes(lowerQuery) || lowerQuery.includes(aliasLower))) ||
               (translitQuery.length > 3 && (aliasLower.includes(translitQuery) || translitQuery.includes(aliasLower)));
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
  console.log(`🔍 Поиск дивана по запросу: "${query}"`);
  
  // ЭТАП 1: Поиск по коду (если в запросе есть 5+ цифр подряд)
  const kodMatch = query.match(/\d{5,}/);
  if (kodMatch) {
    console.log(`   Найдены цифры в запросе: ${kodMatch[0]}`);
    const divan = findDivanByKod(kodMatch[0]);
    if (divan) {
      console.log(`   ✓ Найден по коду: ${divan.name}`);
      return formatDivanResponse(divan);
    }
  }
  
  // ЭТАП 2: ВСЕГДА пробуем искать по произнесённым цифрам
  // Конвертируем "один ноль ноль семь" → "1007"
  const spokenNumber = spokenDigitsToNumbers(query);
  if (spokenNumber.length >= 4) {
    console.log(`   Обнаружены произнесённые цифры: "${spokenNumber}"`);
    const divan = findDivanByKod(spokenNumber);
    if (divan) {
      console.log(`   ✓ Найден по произнесённым цифрам: ${divan.name}`);
      return formatDivanResponse(divan);
    }
  }
  
  // ЭТАП 3: Поиск по бренду и модели
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

