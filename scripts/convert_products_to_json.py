#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для конвертации Excel файла с товарами в JSON формат для навыка Алисы
"""

import pandas as pd
import json
import sys
from pathlib import Path

def convert_excel_to_json(excel_path, json_path):
    """
    Читает Excel файл и конвертирует его в JSON формат
    """
    try:
        # Читаем Excel файл
        print(f"Читаю файл: {excel_path}")
        df = pd.read_excel(excel_path)
        
        # Выводим названия колонок для проверки
        print(f"\nНайденные колонки:")
        for i, col in enumerate(df.columns):
            print(f"  {i}: {col}")
        
        # Выводим первые несколько строк для понимания структуры
        print(f"\nПервые 5 строк данных:")
        print(df.head())
        
        # Конвертируем в список словарей
        products = []
        for idx, row in df.iterrows():
            product = {}
            for col in df.columns:
                value = row[col]
                # Обрабатываем NaN значения
                if pd.isna(value):
                    product[col] = None
                elif isinstance(value, (int, float)):
                    product[col] = value
                else:
                    product[col] = str(value)
            products.append(product)
        
        # Сохраняем в JSON
        print(f"\nСохраняю {len(products)} товаров в JSON файл: {json_path}")
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(products, f, ensure_ascii=False, indent=2)
        
        print(f"✓ Конвертация завершена успешно!")
        return True
        
    except Exception as e:
        print(f"✗ Ошибка при конвертации: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    # Пути к файлам
    base_dir = Path(__file__).parent.parent
    excel_path = base_dir / "Все товары" / "Описание ДОМа_идеально_для_Алисы_v3.xlsx"
    json_path = base_dir / "config" / "products.json"
    
    # Создаем директорию config если её нет
    json_path.parent.mkdir(exist_ok=True)
    
    # Конвертируем
    success = convert_excel_to_json(excel_path, json_path)
    sys.exit(0 if success else 1)
