const { handleRequest } = require('../src/handlers/mainHandler');
const { extractIntent } = require('../src/utils/responseGenerator');
const { getProductsByCategory } = require('../src/data/products');

// Тестовый запрос для новой сессии
const createTestRequest = (command, isNew = false) => ({
  request: {
    command: command,
    original_utterance: command,
    type: 'SimpleUtterance'
  },
  session: {
    new: isNew,
    message_id: 0,
    session_id: 'test-session',
    skill_id: 'test-skill',
    user_id: 'test-user'
  },
  version: '1.0'
});

describe('Навык Алисы - Базовые тесты', () => {
  
  test('Новая сессия должна возвращать приветствие', async () => {
    const request = createTestRequest('', true);
    const response = await handleRequest(request);
    
    expect(response.response.text).toContain('Добро пожаловать');
    expect(response.response.end_session).toBe(false);
    expect(response.response.buttons).toBeDefined();
  });

  test('Должен правильно определять интент "помощь"', () => {
    const testCases = [
      'помощь',
      'справка',
      'что ты умеешь',
      'помоги'
    ];

    testCases.forEach(command => {
      const intent = extractIntent(command);
      expect(intent).toBe('help');
    });
  });

  test('Должен правильно определять интент категории товаров', () => {
    const testCases = [
      'расскажи про диваны',
      'какие есть кровати',
      'покажи шкафы',
      'что есть из столов'
    ];

    testCases.forEach(command => {
      const intent = extractIntent(command);
      expect(intent).toBe('category_info');
    });
  });

  test('Должен правильно определять интент акций', () => {
    const testCases = [
      'какие есть акции',
      'есть ли скидки',
      'какие предложения',
      'что по ценам'
    ];

    testCases.forEach(command => {
      const intent = extractIntent(command);
      expect(intent).toBe('promotions');
    });
  });

  test('Должен возвращать информацию о диванах', async () => {
    const request = createTestRequest('расскажи про диваны');
    const response = await handleRequest(request);
    
    expect(response.response.text).toContain('диван');
    expect(response.response.text).toContain('модел');
    expect(response.response.end_session).toBe(false);
  });

  test('Должен возвращать информацию об акциях', async () => {
    const request = createTestRequest('какие есть акции');
    const response = await handleRequest(request);
    
    expect(response.response.text).toContain('акци');
    expect(response.response.text).toContain('скидк');
    expect(response.response.end_session).toBe(false);
  });

  test('Должен направлять к консультанту', async () => {
    const request = createTestRequest('нужен консультант');
    const response = await handleRequest(request);
    
    expect(response.response.text).toContain('консультант');
    expect(response.response.text).toContain('сотрудник');
    expect(response.response.end_session).toBe(false);
  });

  test('Должен корректно завершать сессию', async () => {
    const request = createTestRequest('пока');
    const response = await handleRequest(request);
    
    expect(response.response.text).toContain('Спасибо');
    expect(response.response.end_session).toBe(true);
  });

  test('Должен обрабатывать неизвестные команды', async () => {
    const request = createTestRequest('расскажи про погоду');
    const response = await handleRequest(request);
    
    expect(response.response.text).toContain('Не понял');
    expect(response.response.end_session).toBe(false);
  });

});

describe('Данные о товарах', () => {
  
  test('Должен возвращать диваны', () => {
    const sofas = getProductsByCategory('sofas');
    expect(sofas).toBeDefined();
    expect(sofas.length).toBeGreaterThan(0);
    expect(sofas[0]).toHaveProperty('name');
    expect(sofas[0]).toHaveProperty('price');
  });

  test('Должен возвращать кровати', () => {
    const beds = getProductsByCategory('beds');
    expect(beds).toBeDefined();
    expect(beds.length).toBeGreaterThan(0);
  });

  test('Должен возвращать пустой массив для несуществующей категории', () => {
    const result = getProductsByCategory('nonexistent');
    expect(result).toEqual([]);
  });

});

describe('Формат ответов', () => {
  
  test('Ответ должен соответствовать формату Алисы', async () => {
    const request = createTestRequest('помощь');
    const response = await handleRequest(request);
    
    // Проверяем основную структуру
    expect(response).toHaveProperty('response');
    expect(response).toHaveProperty('version');
    expect(response.response).toHaveProperty('text');
    expect(response.response).toHaveProperty('end_session');
    
    // Проверяем типы данных
    expect(typeof response.response.text).toBe('string');
    expect(typeof response.response.end_session).toBe('boolean');
    expect(response.version).toBe('1.0');
  });

  test('Текст ответа не должен превышать 1024 символа', async () => {
    const request = createTestRequest('расскажи про диваны');
    const response = await handleRequest(request);
    
    expect(response.response.text.length).toBeLessThanOrEqual(1024);
  });

  test('Кнопки должны быть массивом и не более 5 штук', async () => {
    const request = createTestRequest('', true); // Новая сессия
    const response = await handleRequest(request);
    
    if (response.response.buttons) {
      expect(Array.isArray(response.response.buttons)).toBe(true);
      expect(response.response.buttons.length).toBeLessThanOrEqual(5);
      
      // Проверяем структуру кнопок
      response.response.buttons.forEach(button => {
        expect(button).toHaveProperty('title');
        expect(typeof button.title).toBe('string');
      });
    }
  });

});

// Интеграционные тесты
describe('Интеграционные тесты', () => {
  
  test('Полный диалог: приветствие -> категория -> прощание', async () => {
    // Новая сессия
    const greeting = await handleRequest(createTestRequest('', true));
    expect(greeting.response.text).toContain('Добро пожаловать');
    
    // Запрос категории
    const category = await handleRequest(createTestRequest('расскажи про диваны'));
    expect(category.response.text).toContain('диван');
    
    // Прощание
    const goodbye = await handleRequest(createTestRequest('спасибо'));
    expect(goodbye.response.end_session).toBe(true);
  });

  test('Цепочка: акции -> подробности -> консультант', async () => {
    // Запрос акций
    const promotions = await handleRequest(createTestRequest('какие есть акции'));
    expect(promotions.response.text).toContain('скидк');
    
    // Подробности по диванам
    const details = await handleRequest(createTestRequest('скидки на диваны'));
    expect(details.response.text).toContain('диван');
    
    // Консультант
    const consultant = await handleRequest(createTestRequest('нужен консультант'));
    expect(consultant.response.text).toContain('консультант');
  });

  test('Поиск по артикулу должен работать', async () => {
    // Тест с существующим артикулом
    const validArticle = await handleRequest(createTestRequest('артикул 9174297'));
    expect(validArticle.response.text).toContain('9174297');
    
    // Тест с несуществующим артикулом
    const invalidArticle = await handleRequest(createTestRequest('артикул 99999'));
    expect(invalidArticle.response.text).toContain('не найден');
    
    // Тест с числовым кодом без слова "артикул"
    const numericCode = await handleRequest(createTestRequest('9174297'));
    expect(numericCode.response.text).toContain('9174297');
    
    // Тест с артикулом произнесенным по цифрам
    const spokenDigits = await handleRequest(createTestRequest('артикул девять один семь четыре два девять семь'));
    expect(spokenDigits.response.text).toContain('9174297');
    
    // Тест с произнесенными цифрами без слова "артикул"
    const onlySpokenDigits = await handleRequest(createTestRequest('восемь четыре семь четыре шесть четыре шесть'));
    expect(onlySpokenDigits.response.text).toContain('8474646');
  });

  test('Поиск по артикулу должен обрабатывать некорректные запросы', async () => {
    // Тест без номера
    const noNumber = await handleRequest(createTestRequest('артикул'));
    expect(noNumber.response.text).toContain('Назовите артикул');
    
    // Тест с коротким номером
    const shortNumber = await handleRequest(createTestRequest('артикул 123'));
    expect(shortNumber.response.text).toContain('Назовите артикул');
    
    // Тест с короткими произнесенными цифрами (должны обрабатываться как unknown)
    const shortSpokenDigits = await handleRequest(createTestRequest('один два три'));
    expect(shortSpokenDigits.response.text).toContain('Не понял ваш вопрос');
  });

  test('Преобразование произнесенных цифр должно работать', async () => {
    const { convertWordsToDigits } = require('../src/utils/articleSearch');
    
    // Тест основных цифр
    expect(convertWordsToDigits('один два три четыре пять')).toBe('12345');
    expect(convertWordsToDigits('восемь четыре семь четыре шесть четыре шесть')).toBe('8474646');
    expect(convertWordsToDigits('ноль один два три четыре пять шесть семь восемь девять')).toBe('0123456789');
    
    // Тест с текстом и цифрами
    expect(convertWordsToDigits('артикул девять один семь четыре два')).toBe('91742');
    
    // Тест с коротким числом - должен вернуть оригинальный текст
    expect(convertWordsToDigits('один два три')).toBe('один два три');
  });

  test('Форматирование цен в белорусских рублях должно работать', async () => {
    const { formatPriceForSpeech } = require('../src/utils/priceFormatter');
    
    // Тест цен с копейками
    expect(formatPriceForSpeech(1082.62)).toBe('одна тысяча восемьдесят два рубля шестьдесят две копейки');
    expect(formatPriceForSpeech(2.50)).toBe('два рубля пятьдесят копеек');
    expect(formatPriceForSpeech(1.01)).toBe('один рубль одна копейка');
    
    // Тест округления
    expect(formatPriceForSpeech(1082.62, true)).toBe('одна тысяча восемьдесят три рубля');
    expect(formatPriceForSpeech(2.49, true)).toBe('два рубля');
    
    // Тест целых чисел
    expect(formatPriceForSpeech(1)).toBe('один рубль');
    expect(formatPriceForSpeech(21)).toBe('двадцать один рубль');
    expect(formatPriceForSpeech(100)).toBe('сто рублей');
    expect(formatPriceForSpeech(1000)).toBe('одна тысяча рублей');
    
    // Тест нуля
    expect(formatPriceForSpeech(0)).toBe('бесплатно');
  });

  test('Работа со стеллажами должна функционировать', async () => {
    const { getAllShelves, getShelfInfo, getShelfLevelProducts } = require('../src/utils/shelfManager');
    
    // Тест получения списка стеллажей
    const shelves = getAllShelves();
    expect(shelves).toBeDefined();
    expect(shelves.length).toBeGreaterThan(0);
    expect(shelves[0]).toHaveProperty('id');
    expect(shelves[0]).toHaveProperty('name');
    
    // Тест получения информации о стеллаже
    const shelfInfo = getShelfInfo('1');
    expect(shelfInfo).toBeDefined();
    expect(shelfInfo.name).toContain('Стеллаж 1');
    expect(shelfInfo.levels).toBeDefined();
    expect(shelfInfo.levels.length).toBeGreaterThan(0);
    
    // Тест получения товаров с полки
    const products = getShelfLevelProducts('1', '1');
    expect(products).toBeDefined();
    expect(products.length).toBeGreaterThan(0);
    expect(products[0]).toHaveProperty('name');
    expect(products[0]).toHaveProperty('priceFormatted');
  });

  test('Поиск товара по артикулу на стеллажах должен работать', async () => {
    const { findProductByArticle } = require('../src/utils/shelfManager');
    
    // Тест поиска существующего товара
    const result = findProductByArticle('TB001');
    expect(result).toBeDefined();
    expect(result.product).toBeDefined();
    expect(result.product.article).toBe('TB001');
    expect(result.shelfId).toBe('1');
    expect(result.levelId).toBe('1');
    
    // Тест поиска несуществующего товара
    const notFound = findProductByArticle('NONEXISTENT');
    expect(notFound).toBeNull();
  });

  test('Обработка вопросов о стеллажах должна работать', async () => {
    const { handleRequest } = require('../src/handlers/mainHandler');
    
    // Тест вопроса о стеллаже без номера
    const result1 = await handleRequest({
      request: { command: 'что на стеллаже', type: 'SimpleUtterance' },
      session: { new: false, session_id: 'test' },
      version: '1.0'
    });
    
    expect(result1.response.text).toContain('стеллаж');
    expect(result1.response.end_session).toBe(false);
    
    // Тест вопроса о конкретном стеллаже
    const result2 = await handleRequest({
      request: { command: 'стеллаж номер 1', type: 'SimpleUtterance' },
      session: { new: false, session_id: 'test' },
      version: '1.0'
    });
    
    expect(result2.response.text).toContain('стеллаже номер один');
    expect(result2.response.buttons).toBeDefined();
    expect(result2.response.buttons.length).toBeGreaterThan(0);
  });

});

// Запуск тестов: npm test 