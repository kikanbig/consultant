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

});

// Запуск тестов: npm test 