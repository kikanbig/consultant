#!/usr/bin/env node
/**
 * Быстрый тест для проверки одного товара
 * Использование: node scripts/test_single_product.js "девять пять семь четыре шесть один ноль"
 */

const { generateProductResponse } = require('../src/utils/productSearch');

// Получаем команду из аргументов командной строки
const command = process.argv.slice(2).join(' ');

if (!command) {
  console.log('Использование: node scripts/test_single_product.js "команда"');
  console.log('\nПримеры:');
  console.log('  node scripts/test_single_product.js "девять пять семь четыре шесть один ноль"');
  console.log('  node scripts/test_single_product.js "9574610"');
  console.log('  node scripts/test_single_product.js "артикул 9574610"');
  process.exit(1);
}

console.log('='.repeat(80));
console.log('ТЕСТ ПОИСКА ТОВАРА');
console.log('='.repeat(80));
console.log(`\nКоманда: "${command}"\n`);

const result = generateProductResponse(command);

console.log(`Статус: ${result.found ? '✓ НАЙДЕН' : '✗ НЕ НАЙДЕН'}\n`);

if (result.found && result.product) {
  console.log('ИНФОРМАЦИЯ О ТОВАРЕ:');
  console.log('-'.repeat(80));
  console.log(`Код товара: ${result.product['Код товара']}`);
  console.log(`Название: ${result.product['Название']}`);
  if (result.product['Цвет']) console.log(`Цвет: ${result.product['Цвет']}`);
  if (result.product['Материал']) console.log(`Материал: ${result.product['Материал']}`);
  if (result.product['Размеры']) console.log(`Размеры: ${result.product['Размеры']}`);
  if (result.product['Вес']) console.log(`Вес: ${result.product['Вес']}`);
  if (result.product['Комплектация']) console.log(`Комплектация: ${result.product['Комплектация']}`);
  console.log('-'.repeat(80));
}

console.log('\nОТВЕТ АЛИСЫ:');
console.log('-'.repeat(80));
console.log(result.response);
console.log('-'.repeat(80));
console.log();
