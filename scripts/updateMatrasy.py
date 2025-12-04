#!/usr/bin/env python3
"""
Скрипт для обновления алиасов матрасов с фонетическими вариантами
"""

import json
import re

# Фонетические правила замен
PHONETIC_RULES = [
    ('е', 'э'), ('э', 'е'),  # е/э
    ('и', 'ы'), ('ы', 'и'),  # и/ы
    ('о', 'а'), ('а', 'о'),  # о/а
    ('ё', 'е'), ('е', 'ё'),  # ё/е
    ('й', 'и'), ('и', 'й'),  # й/и
    ('нн', 'н'), ('н', 'нн'),  # двойные согласные
    ('лл', 'л'), ('л', 'лл'),
    ('мм', 'м'), ('м', 'мм'),
    ('сс', 'с'), ('с', 'сс'),
    ('тт', 'т'), ('т', 'тт'),
]

# Специальные транслитерации для моделей
TRANSLIT_MAP = {
    # Lagoma модели
    'alma': ['альма', 'алма', 'аума', 'альмо', 'алмо', 'олма', 'оума'],
    'asker': ['аскер', 'аскэр', 'оскер', 'эскер', 'эскара', 'аскар', 'оскар', 'эскар', 'аскир'],
    'glatta': ['глатта', 'глата', 'глатто', 'глато', 'гллата', 'глота'],
    'ilta': ['ильта', 'илта', 'ильда', 'илда', 'ылта'],
    'lenvik': ['ленвик', 'ленвік', 'лэнвик', 'ленвиг', 'ланвик', 'ленвык', 'ленвиц'],
    'lund': ['лунд', 'ланд', 'лунт', 'лунтт', 'луннд'],
    'narvik': ['нарвик', 'нарвік', 'норвик', 'нарвыг', 'норвиг', 'нарвиг'],
    'ulvik': ['ульвик', 'улвик', 'ульвік', 'улвік', 'ульвиг', 'улвиг', 'ульвыг'],
    
    # Veluna модели
    'laoma': ['лаома', 'лаомо', 'лоома', 'лаамо'],
    'palato': ['палато', 'палатто', 'палата', 'полато', 'палотто'],
    
    # Латинские варианты
    'lanwick': ['ленвик'],
    'lenvick': ['ленвик'],
    'lanvik': ['ленвик'],
    'lenwig': ['ленвик'],
}

def generate_phonetic_variants(word):
    """
    Генерирует фонетические варианты произношения слова
    """
    variants = set([word])
    
    for old, new in PHONETIC_RULES:
        if old in word:
            variants.add(word.replace(old, new))
    
    return variants

def generate_model_aliases_enhanced(model_name, brand_name):
    """
    Генерирует расширенные алиасы для модели с фонетическими вариантами
    """
    aliases = set()
    model_lower = model_name.lower().strip()
    brand_lower = brand_name.lower().strip()
    
    # Добавляем оригинал
    aliases.add(model_lower)
    
    # Варианты бренда
    brand_variants = []
    if brand_lower == 'lagoma':
        brand_variants = ['лагома', 'лагуна', 'лагона', 'логома', 'лагомо']
    elif brand_lower == 'veluna':
        brand_variants = ['велуна', 'велюна', 'илуна', 'вилуна', 'вэлуна']
    
    # Фонетические варианты модели
    for variant in generate_phonetic_variants(model_lower):
        aliases.add(variant)
    
    # Специальные транслитерации
    if model_lower in TRANSLIT_MAP:
        for translit in TRANSLIT_MAP[model_lower]:
            aliases.add(translit)
            # Фонетические варианты транслитерации
            for phonetic in generate_phonetic_variants(translit):
                aliases.add(phonetic)
    
    # Ищем латинский ключ для кириллического слова
    for lat_key, cyr_variants in TRANSLIT_MAP.items():
        if model_lower in cyr_variants:
            aliases.add(lat_key)
    
    # Комбинации с брендом
    for brand_var in brand_variants:
        aliases.add(f"{brand_var} {model_lower}")
        
        # С транслитерациями
        if model_lower in TRANSLIT_MAP:
            for translit in TRANSLIT_MAP[model_lower]:
                aliases.add(f"{brand_var} {translit}")
    
    # Латинские комбинации
    aliases.add(f"{brand_lower} {model_lower}")
    
    # Убираем слишком короткие алиасы
    aliases = {a for a in aliases if len(a) >= 3}
    
    return sorted(list(aliases))

def update_matrasy_json(input_path, output_path):
    """
    Обновляет JSON файл с матрасами, добавляя фонетические алиасы
    """
    print(f"📖 Читаю файл: {input_path}")
    
    with open(input_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    updated_count = 0
    total_aliases_before = 0
    total_aliases_after = 0
    
    for matras in data['matrasy']:
        brand = matras['brand']
        model = matras['model']
        
        # Сохраняем старые алиасы для статистики
        old_aliases = matras.get('aliases', [])
        total_aliases_before += len(old_aliases)
        
        # Генерируем новые расширенные алиасы
        new_aliases = generate_model_aliases_enhanced(model, brand)
        
        # Объединяем со старыми (на случай если там есть уникальные)
        combined_aliases = list(set(old_aliases + new_aliases))
        combined_aliases.sort()
        
        matras['aliases'] = combined_aliases
        total_aliases_after += len(combined_aliases)
        updated_count += 1
    
    # Сохраняем обновлённый JSON
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Обновлено {updated_count} матрасов")
    print(f"\n📊 Статистика алиасов:")
    print(f"   Было: {total_aliases_before}")
    print(f"   Стало: {total_aliases_after}")
    print(f"   Прирост: +{total_aliases_after - total_aliases_before} ({int((total_aliases_after / total_aliases_before - 1) * 100)}%)")
    
    # Примеры
    print(f"\n📝 Примеры (первые 3):")
    for i, matras in enumerate(data['matrasy'][:3], 1):
        print(f"\n{i}. {matras['brand']} {matras['model']}")
        print(f"   Алиасов: {len(matras['aliases'])}")
        print(f"   Примеры: {', '.join(matras['aliases'][:10])}")
        if len(matras['aliases']) > 10:
            print(f"   ... и еще {len(matras['aliases']) - 10} алиасов")

if __name__ == '__main__':
    import os
    
    # Определяем пути
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.dirname(script_dir)
    input_path = os.path.join(project_dir, 'src', 'data', 'matrasy.json')
    output_path = input_path  # Перезаписываем тот же файл
    
    print("🚀 Обновление алиасов матрасов\n")
    update_matrasy_json(input_path, output_path)
    print("\n✨ Готово!")

