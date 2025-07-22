// Функция для правильного произношения белорусских рублей
function formatPriceForSpeech(price, roundToWhole = false) {
  if (price === 0) return "бесплатно";
  
  // Округляем до целого если нужно
  if (roundToWhole) {
    price = Math.round(price);
  }
  
  // Разделяем на рубли и копейки
  const rubles = Math.floor(price);
  const kopecks = Math.round((price - rubles) * 100);
  
  // Словарь для чисел
  const numbers = {
    1: "один", 2: "два", 3: "три", 4: "четыре", 5: "пять",
    6: "шесть", 7: "семь", 8: "восемь", 9: "девять", 10: "десять",
    11: "одиннадцать", 12: "двенадцать", 13: "тринадцать", 14: "четырнадцать", 15: "пятнадцать",
    16: "шестнадцать", 17: "семнадцать", 18: "восемнадцать", 19: "девятнадцать", 20: "двадцать",
    30: "тридцать", 40: "сорок", 50: "пятьдесят", 60: "шестьдесят", 
    70: "семьдесят", 80: "восемьдесят", 90: "девяносто", 100: "сто",
    200: "двести", 300: "триста", 400: "четыреста", 500: "пятьсот",
    600: "шестьсот", 700: "семьсот", 800: "восемьсот", 900: "девятьсот"
  };
  
  // Женский род для рублей (одна тысяча, две тысячи)
  const numbersF = {
    1: "одна", 2: "две"
  };
  
  // Функция для преобразования числа в слова
  function numberToWords(num, isFeminine = false) {
    if (num === 0) return "ноль";
    if (num <= 20) return (isFeminine && numbersF[num]) ? numbersF[num] : (numbers[num] || num.toString());
    
    let result = "";
    
    // Тысячи
    if (num >= 1000) {
      const thousands = Math.floor(num / 1000);
      result += numberToWords(thousands, true) + " ";
      
      if (thousands % 10 === 1 && thousands % 100 !== 11) {
        result += "тысяча ";
      } else if ([2, 3, 4].includes(thousands % 10) && ![12, 13, 14].includes(thousands % 100)) {
        result += "тысячи ";
      } else {
        result += "тысяч ";
      }
      
      num = num % 1000;
    }
    
    // Сотни
    if (num >= 100) {
      const hundreds = Math.floor(num / 100);
      result += numbers[hundreds * 100] + " ";
      num = num % 100;
    }
    
    // Десятки и единицы
    if (num >= 20) {
      const tens = Math.floor(num / 10) * 10;
      result += numbers[tens];
      num = num % 10;
      if (num > 0) {
        result += " " + ((isFeminine && numbersF[num]) ? numbersF[num] : numbers[num]);
      }
    } else if (num > 0) {
      result += (isFeminine && numbersF[num]) ? numbersF[num] : numbers[num];
    }
    
    return result.trim();
  }
  
  // Функция склонения рублей
  function getRubleForm(num) {
    const lastDigit = num % 10;
    const lastTwoDigits = num % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return "рублей";
    } else if (lastDigit === 1) {
      return "рубль";
    } else if ([2, 3, 4].includes(lastDigit)) {
      return "рубля";
    } else {
      return "рублей";
    }
  }
  
  // Функция склонения копеек  
  function getKopeckForm(num) {
    const lastDigit = num % 10;
    const lastTwoDigits = num % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return "копеек";
    } else if (lastDigit === 1) {
      return "копейка";
    } else if ([2, 3, 4].includes(lastDigit)) {
      return "копейки";
    } else {
      return "копеек";
    }
  }
  
  let result = numberToWords(rubles) + " " + getRubleForm(rubles);
  
  // Добавляем копейки если они есть и не округляем (используем женский род для копеек)
  if (!roundToWhole && kopecks > 0) {
    result += " " + numberToWords(kopecks, true) + " " + getKopeckForm(kopecks);
  }
  
  return result;
}

module.exports = {
  formatPriceForSpeech
};
