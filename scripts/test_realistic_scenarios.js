#!/usr/bin/env node
/**
 * Реалистичные сценарии использования для проверки работы модуля
 */

const { 
  generateProductResponse, 
  extractArticle,
  convertWordsToDigits 
} = require('../src/utils/productSearch');

console.log('='.repeat(80));
console.log('РЕАЛИСТИЧНЫЕ СЦЕНАРИИ ИСПОЛЬЗОВАНИЯ');
console.log('='.repeat(80));
console.log();

// Реалистичные тестовые команды
const scenarios = [
  {
    name: 'Произнесение по одной цифре',
    commands: [
      'девять пять семь четыре шесть один ноль',
      'артикул девять пять семь четыре шесть один ноль',
      'код девять пять семь четыре шесть один ноль',
      'девять пять семь четыре четыре девять три'
    ]
  },
  {
    name: 'Произнесение по две цифры',
    commands: [
      'девяносто пять семьдесят четыре шестьдесят один ноль',
      'девяносто пять семьдесят четыре сорок девять три'
    ]
  },
  {
    name: 'Произнесение по три цифры',
    commands: [
      'девятьсот пятьдесят семьсот сорок шестьсот десять',
      'девятьсот пятьдесят семьсот сорок сорок девяносто три'
    ]
  },
  {
    name: 'Смешанное произнесение',
    commands: [
      'девять пять семьдесят четыре шесть один ноль',
      'девяносто пять семь четыре шесть один ноль',
      'девять пятьдесят семь четыре шесть десять'
    ]
  },
  {
    name: 'Прямой ввод цифрами',
    commands: [
      '9574610',
      'артикул 9574610',
      'код товара 9574610',
      '9574493'
    ]
  },
  {
    name: 'Частичный артикул',
    commands: [
      '74610',
      'семь четыре шесть один ноль',
      '4493'
    ]
  }
];

scenarios.forEach((scenario, scenarioIndex) => {
  console.log(`\n${'═'.repeat(80)}`);
  console.log(`СЦЕНАРИЙ ${scenarioIndex + 1}: ${scenario.name}`);
  console.log('═'.repeat(80));
  
  scenario.commands.forEach((command, commandIndex) => {
    console.log(`\n${'-'.repeat(80)}`);
    console.log(`Команда ${commandIndex + 1}: "${command}"`);
    console.log('-'.repeat(80));
    
    // Показываем преобразование
    const converted = convertWordsToDigits(command);
    if (converted !== command) {
      console.log(`Преобразовано: "${converted}"`);
    }
    
    // Показываем извлеченный артикул
    const article = extractArticle(command);
    console.log(`Извлеченный артикул: ${article || 'НЕ НАЙДЕН'}`);
    
    // Получаем результат поиска
    const result = generateProductResponse(command);
    
    console.log(`Статус: ${result.found ? '✓ НАЙДЕН' : '✗ НЕ НАЙДЕН'}`);
    
    if (result.found && result.product) {
      console.log(`Товар: ${result.product['Название']}`);
      console.log(`Код: ${result.product['Код товара']}`);
      console.log(`\nОтвет (первые 200 символов):`);
      console.log(result.response.substring(0, 200) + '...');
    } else {
      console.log(`\nОтвет:`);
      console.log(result.response);
    }
  });
});

console.log('\n' + '='.repeat(80));
console.log('ТЕСТИРОВАНИЕ ЗАВЕРШЕНО');
console.log('='.repeat(80));
