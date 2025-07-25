// =============================================================================
// СЦЕНАРИИ ДИАЛОГОВ (FLOWS)
// =============================================================================
// Здесь настраиваются пути диалогов и логика переходов
//
// ИНСТРУКЦИЯ:
// 1. Настройте приоритеты распознавания команд
// 2. Добавьте новые ключевые слова
// 3. Настройте вероятности показа разных ответов
//
// ❗ Будьте осторожны с синтаксисом - это влияет на работу навыка
// =============================================================================

module.exports = {

  // =========================================================================
  // КЛЮЧЕВЫЕ СЛОВА ДЛЯ РАСПОЗНАВАНИЯ ИНТЕНТОВ
  // =========================================================================
  
  intents: {
    // ВАЖНО: Порядок важен - более специфичные интенты должны быть выше!
    
    // Справка и помощь
    help: [
      'помощь', 'справка', 'что ты умеешь', 'что умеешь', 'как дела', 
      'помоги', 'что можешь', 'инструкция', 'команды'
    ],
    
    // Вопросы о полке
    shelf_question: [
      'что стоит на этой полке', 'что находится на полке', 'что на этой полке',
      'что это за товар', 'что стоит на полке', 'что находится здесь',
      'что это', 'что здесь', 'что на полке', 'что тут стоит'
    ],
    
    // Приветствия пользователя
    user_greeting: [
      'привет', 'здравствуй', 'здравствуйте', 'добро пожаловать',
      'доброе утро', 'добрый день', 'добрый вечер', 'приветствую',
      'хай', 'салют', 'йо', 'хелло', 'хеллоу'
    ],
    
    // Поиск по артикулу
    article_search: [
      'артикул', 'код товара', 'номер товара', 'расскажи про артикул',
      'артикул номер', 'товар с артикулом', 'код', 'номер',
      'что это за артикул', 'информация по артикулу'
    ],
    
    // Поиск конкретных товаров (ПРОВЕРЯЕТСЯ ПЕРВЫМ!)
    specific_product: [
      'комфорт', 'релакс', 'трансформер', 'мечта', 'элегант', 'классик',
      'угловой', 'раскладной', 'двуспальная', 'односпальная', 'купе', 'распашной',
      'нужен диван', 'нужна кровать', 'хочу диван', 'диван комфорт', 'диван релакс',
      'кровать мечта', 'диван трансформер', 'угловой диван', 'раскладной диван'
    ],
    
    // Детальная информация о категориях
    detailed_info: [
      'подробнее', 'детали', 'характеристики', 'размеры', 'материал', 'цвета',
      'модели', 'полное описание', 'все модели', 'весь ассортимент'
    ],
    
    // Акции и скидки
    promotions: [
      'акция', 'акции', 'скидка', 'скидки', 'распродажа', 'предложение', 'цена',
      'доставка', 'рассрочка', 'бесплатно', 'дешево', 'какие есть акции',
      'есть ли акции', 'какие акции', 'акционные', 'есть ли скидки', 
      'какие предложения', 'что по ценам'
    ],
    
    // Консультанты
    consultation: [
      'консультант', 'продавец', 'сотрудник', 'менеджер',
      'заказ', 'купить', 'оформить', 'нужен консультант',
      'позовите', 'вызовите', 'администратор',
      'нужна помощь', 'консультация'
    ],
    
    // Поиск товаров по характеристикам
    product_search: [
      'подобрать', 'найти', 'выбрать', 'поиск', 'нужен', 'хочу',
      'маленький', 'большой', 'красный', 'синий', 'дешевый', 'дорогой'
    ],
    
    // Общая информация о категориях (ПРОВЕРЯЕТСЯ ПОСЛЕДНИМ!)
    category_info: [
      'диван', 'кровать', 'шкаф', 'стол', 'кресло', 'комод',
      'расскажи про диван', 'расскажи про кровать', 'расскажи про шкаф',
      'что есть', 'какие', 'покажи', 'мебель'
    ],
    
    // Выход из навыка
    goodbye: [
      'пока', 'до свидания', 'спасибо', 'досвидания', 
      'увидимся', 'хватит', 'всё', 'конец', 'выход', 'стоп',
      'закрыть', 'выйти', 'завершить', 'отключить', 'хватит помощи'
    ]
  },

  // =========================================================================
  // СООТВЕТСТВИЕ КАТЕГОРИЙ И КЛЮЧЕВЫХ СЛОВ
  // =========================================================================
  
  categoryKeywords: {
    'диван': 'sofas',
    'кровать': 'beds', 
    'шкаф': 'wardrobes',
    'стол': 'tables',
    'кресло': 'chairs',
    'комод': 'dressers'
  },

  // =========================================================================
  // НАСТРОЙКИ ПОВЕДЕНИЯ ДИАЛОГОВ
  // =========================================================================
  
  dialogSettings: {
    // Показывать случайные напоминания (в % случаев)
    showReminders: 30,
    
    // Максимальная длина ответа (символы)
    maxResponseLength: 1000,
    
    // Количество кнопок в интерфейсе
    maxButtons: 4,
    
    // Показывать эмодзи в ответах
    useEmojis: true,
    
    // Таймаут сессии (не используется, но для справки)
    sessionTimeout: 300 // 5 минут
  },

  // =========================================================================
  // ПРИМЕРЫ ДИАЛОГОВ (для обучения)
  // =========================================================================
  
  exampleDialogs: [
    {
      user: "Алиса, запусти навык 21 век дом",
      bot: "Добро пожаловать! Я ассистент торгового зала..."
    },
    {
      user: "Диван комфорт",
      bot: "🛋️ Диван \"Комфорт\" - сорок пять тысяч рублей..."
    },
    {
      user: "Расскажи про диваны",
      bot: "В нашем магазине двадцать первый век дом представлены 3 модели диванов..."
    },
    {
      user: "Какие есть акции?",
      bot: "Сейчас у нас действуют отличные акции!..."
    },
    {
      user: "Нужен консультант",
      bot: "Отличная идея обратиться к консультанту!..."
    },
    {
      user: "Выход",
      bot: "Спасибо за посещение нашего магазина!..."
    }
  ]

};