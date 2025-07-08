// База данных товаров (в реальном проекте это может быть подключение к API или БД)
const products = {
  sofas: [
    {
      id: 'sofa_1',
      name: 'Диван "Комфорт"',
      category: 'sofas',
      price: 45000,
      description: 'Прямой диван с ортопедическими пружинами, обивка из натуральной ткани',
      dimensions: '200x90x85 см',
      material: 'Ткань, пружинный блок',
      colors: ['серый', 'бежевый', 'синий'],
      features: ['раскладной', 'ортопедический', 'гипоаллергенный'],
      inStock: true,
      promotions: ['скидка 15%']
    },
    {
      id: 'sofa_2',
      name: 'Угловой диван "Релакс"',
      category: 'sofas',
      price: 78000,
      description: 'Большой угловой диван с функцией релакс, экокожа премиум класса',
      dimensions: '280x180x95 см',
      material: 'Экокожа, независимые пружины',
      colors: ['черный', 'белый', 'коричневый'],
      features: ['угловой', 'реклайнер', 'USB-зарядка'],
      inStock: true,
      promotions: []
    },
    {
      id: 'sofa_3',
      name: 'Диван-кровать "Трансформер"',
      category: 'sofas',
      price: 32000,
      description: 'Компактный диван с механизмом "клик-кляк", идеален для малогабаритных квартир',
      dimensions: '180x85x80 см',
      material: 'Рогожка, поролон высокой плотности',
      colors: ['красный', 'зеленый', 'фиолетовый'],
      features: ['механизм клик-кляк', 'ящик для белья', 'съемные чехлы'],
      inStock: true,
      promotions: ['бесплатная доставка']
    }
  ],

  beds: [
    {
      id: 'bed_1',
      name: 'Кровать "Мечта"',
      category: 'beds',
      price: 35000,
      description: 'Двуспальная кровать с мягким изголовьем и подъемным механизмом',
      dimensions: '160x200 см',
      material: 'ЛДСП, текстиль',
      colors: ['белый', 'венге', 'дуб сонома'],
      features: ['подъемный механизм', 'мягкое изголовье', 'ортопедическое основание'],
      inStock: true,
      promotions: ['матрас в подарок']
    },
    {
      id: 'bed_2',
      name: 'Кровать "Классика"',
      category: 'beds',
      price: 28000,
      description: 'Односпальная кровать в классическом стиле с резными элементами',
      dimensions: '90x200 см',
      material: 'Массив сосны',
      colors: ['натуральный', 'орех', 'белый'],
      features: ['натуральное дерево', 'ручная резьба', 'экологично'],
      inStock: true,
      promotions: []
    }
  ],

  wardrobes: [
    {
      id: 'wardrobe_1',
      name: 'Шкаф-купе "Простор"',
      category: 'wardrobes',
      price: 55000,
      description: 'Трехдверный шкаф-купе с зеркальными фасадами и LED-подсветкой',
      dimensions: '220x240x60 см',
      material: 'ЛДСП, зеркало, алюминий',
      colors: ['белый глянец', 'венге', 'дуб'],
      features: ['зеркальные двери', 'LED-подсветка', 'доводчики'],
      inStock: true,
      promotions: ['установка бесплатно']
    },
    {
      id: 'wardrobe_2',
      name: 'Распашной шкаф "Традиция"',
      category: 'wardrobes',
      price: 42000,
      description: 'Четырехдверный распашной шкаф с антресолями',
      dimensions: '200x220x55 см',
      material: 'МДФ с покрытием',
      colors: ['орех', 'беленый дуб', 'махагон'],
      features: ['4 секции', 'антресоли', 'штанги для одежды'],
      inStock: false,
      promotions: []
    }
  ],

  tables: [
    {
      id: 'table_1',
      name: 'Обеденный стол "Семейный"',
      category: 'tables',
      price: 25000,
      description: 'Раздвижной стол для кухни, вмещает до 8 человек',
      dimensions: '120-180x80 см',
      material: 'Дуб массив, лак',
      colors: ['натуральный дуб', 'темный орех'],
      features: ['раздвижной', 'массив дерева', 'лаковое покрытие'],
      inStock: true,
      promotions: ['скидка 20%']
    },
    {
      id: 'table_2',
      name: 'Журнальный столик "Модерн"',
      category: 'tables',
      price: 12000,
      description: 'Стеклянный журнальный столик на металлических ножках',
      dimensions: '100x60x45 см',
      material: 'Закаленное стекло, хром',
      colors: ['прозрачный', 'тонированный'],
      features: ['закаленное стекло', 'хромированные ножки', 'современный дизайн'],
      inStock: true,
      promotions: []
    }
  ],

  chairs: [
    {
      id: 'chair_1',
      name: 'Кресло "Директор"',
      category: 'chairs',
      price: 18000,
      description: 'Офисное кресло с ортопедической спинкой и массажем',
      dimensions: '65x70x120 см',
      material: 'Натуральная кожа, сталь',
      colors: ['черный', 'коричневый'],
      features: ['ортопедическая спинка', 'встроенный массаж', 'газ-лифт'],
      inStock: true,
      promotions: []
    }
  ]
};

// Текущие акции
const currentPromotions = [
  {
    id: 'promo_1',
    title: 'Скидки на диваны до 30%',
    description: 'На все диваны действует скидка от 15% до 30%',
    validUntil: '2024-12-31',
    categories: ['sofas']
  },
  {
    id: 'promo_2',
    title: 'Бесплатная доставка',
    description: 'При покупке от 50 000 рублей доставка бесплатно',
    validUntil: '2024-12-31',
    categories: ['all']
  },
  {
    id: 'promo_3',
    title: 'Матрас в подарок',
    description: 'К каждой кровати ортопедический матрас в подарок',
    validUntil: '2024-11-30',
    categories: ['beds']
  }
];

// Получение товаров по категории
function getProductsByCategory(category) {
  return products[category] || [];
}

// Получение всех товаров
function getAllProducts() {
  const allProducts = [];
  Object.values(products).forEach(categoryProducts => {
    allProducts.push(...categoryProducts);
  });
  return allProducts;
}

// Поиск товаров по названию или описанию
function searchProducts(query) {
  const allProducts = getAllProducts();
  const lowerQuery = query.toLowerCase();
  
  return allProducts.filter(product => 
    product.name.toLowerCase().includes(lowerQuery) ||
    product.description.toLowerCase().includes(lowerQuery) ||
    product.features.some(feature => feature.toLowerCase().includes(lowerQuery))
  );
}

// Фильтрация товаров по цене
function getProductsByPriceRange(minPrice, maxPrice) {
  const allProducts = getAllProducts();
  return allProducts.filter(product => 
    product.price >= minPrice && product.price <= maxPrice
  );
}

// Получение товаров в наличии
function getAvailableProducts() {
  const allProducts = getAllProducts();
  return allProducts.filter(product => product.inStock);
}

// Получение товаров с акциями
function getPromotionalProducts() {
  const allProducts = getAllProducts();
  return allProducts.filter(product => 
    product.promotions && product.promotions.length > 0
  );
}

// Получение информации об акциях
function getCurrentPromotions() {
  return currentPromotions;
}

// Получение акций по категории
function getPromotionsByCategory(category) {
  return currentPromotions.filter(promo => 
    promo.categories.includes(category) || promo.categories.includes('all')
  );
}

// Получение товара по ID
function getProductById(id) {
  const allProducts = getAllProducts();
  return allProducts.find(product => product.id === id);
}

// Случайные рекомендации
function getRandomProducts(count = 3) {
  const allProducts = getAllProducts();
  const shuffled = allProducts.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

module.exports = {
  getProductsByCategory,
  getAllProducts,
  searchProducts,
  getProductsByPriceRange,
  getAvailableProducts,
  getPromotionalProducts,
  getCurrentPromotions,
  getPromotionsByCategory,
  getProductById,
  getRandomProducts,
  products,
  currentPromotions
}; 