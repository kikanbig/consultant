// Конфигурация навыка
const config = {
  // Основные настройки
  app: {
    name: 'Ассистент торгового зала',
    version: '1.0.0',
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development'
  },

  // Настройки Алисы
  alice: {
    skillId: process.env.ALICE_SKILL_ID || '',
    webhook: {
      timeout: 15000, // 15 секунд
      maxRetries: 3
    },
    session: {
      maxLength: 600000, // 10 минут
      stateTimeout: 300000 // 5 минут без активности
    }
  },

  // Настройки магазина
  store: {
    name: 'Мебельный центр "Комфорт"',
    workingHours: {
      weekdays: '10:00-21:00',
      weekend: '10:00-20:00'
    },
    contacts: {
      phone: '+7 (495) 123-45-67',
      email: 'info@furniture-comfort.ru',
      address: 'г. Москва, ул. Мебельная, д. 15'
    },
    features: [
      'Бесплатная доставка от 50,000 руб',
      'Рассрочка 0-0-12',
      'Гарантия качества',
      'Профессиональная сборка'
    ]
  },

  // Лимиты и ограничения
  limits: {
    maxProductsInResponse: 3,
    maxButtonsPerResponse: 5,
    maxTextLength: 1024,
    maxSessionDuration: 600000 // 10 минут
  },

  // Настройки логирования
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'json',
    maxFiles: 7,
    maxSize: '10m'
  },

  // API настройки (для интеграции с внешними системами)
  api: {
    timeout: 5000,
    retries: 2,
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3000'
  },

  // Настройки для различных окружений
  development: {
    debug: true,
    logRequests: true,
    enableCors: true
  },

  production: {
    debug: false,
    logRequests: false,
    enableCors: false,
    compression: true
  },

  // Аналитика и метрики
  analytics: {
    enabled: process.env.ANALYTICS_ENABLED === 'true',
    trackUserInteractions: true,
    trackErrors: true,
    trackPerformance: true
  }
};

// Получение конфигурации для текущего окружения
function getConfig() {
  const env = config.app.environment;
  return {
    ...config,
    ...config[env]
  };
}

// Валидация конфигурации
function validateConfig() {
  const requiredVars = ['PORT'];
  const missing = requiredVars.filter(varName => !process.env[varName] && !config.app[varName.toLowerCase()]);
  
  if (missing.length > 0) {
    console.warn(`Отсутствуют переменные окружения: ${missing.join(', ')}`);
  }
  
  return missing.length === 0;
}

module.exports = {
  config: getConfig(),
  validateConfig
}; 