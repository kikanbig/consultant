#!/usr/bin/env node
/**
 * Тестовый скрипт для проверки работы модуля поиска товаров
 */

const { 
  generateProductResponse, 
  extractArticle,
  convertWordsToDigits,
  formatArticleForSpeech 
} = require('../src/utils/productSearch');

console.log('='.repeat(80));
console.log('ТЕСТИРОВАНИЕ МОДУЛЯ ПОИСКА ТОВАРОВ');
console.log('='.repeat(80));
console.log();

// Тестовые команды
const testCommands = [
  // Прямой ввод артикула цифрами
  'артикул 9574610',
  '9574610',
  'код товара 9574610',
  
  // Произнесение по одной цифре
  'девять пять семь четыре шесть один ноль',
  'артикул девять пять семь четыре шесть один ноль',
  
  // Произнесение по две цифры
  'девяносто пятьдесят семьдесят сорок шестьдесят десять',
  
  // Произнесение по три цифры
  'девятьсот пятьсот семьсот четыреста шестьсот десять',
  
  // Частичный артикул (последние цифры)
  '74610',
  'шесть один ноль',
  
  // Другие товары
  '9574493',
  'девять пять семь четыре четыре девять три',
  
  // Несуществующий артикул
  '1234567',
  'один два три четыре пять шесть семь'
];

console.log('Тестирование различных форматов ввода артикулов:\n');

testCommands.forEach((command, index) => {
  console.log(`\n${'─'.repeat(80)}`);
  console.log(`Тест ${index + 1}: "${command}"`);
  console.log('─'.repeat(80));
  
  // Показываем преобразование
  const converted = convertWordsToDigits(command);
  if (converted !== command) {
    console.log(`Преобразовано: "${converted}"`);
  }
  
  // Показываем извлеченный артикул
  const article = extractArticle(command);
  console.log(`Извлеченный артикул: ${article || 'не найден'}`);
  
  if (article) {
    console.log(`Формат для речи: "${formatArticleForSpeech(article)}"`);
  }
  
  // Получаем результат поиска
  const result = generateProductResponse(command);
  
  console.log(`\nРезультат поиска:`);
  console.log(`Найдено: ${result.found ? 'ДА' : 'НЕТ'}`);
  console.log(`\nОтвет Алисы:`);
  console.log(result.response);
  
  if (result.product) {
    console.log(`\nДанные товара:`);
    console.log(`  Код: ${result.product['Код товара']}`);
    console.log(`  Название: ${result.product['Название']}`);
  }
});

console.log('\n' + '='.repeat(80));
console.log('ТЕСТИРОВАНИЕ ЗАВЕРШЕНО');
console.log('='.repeat(80));
