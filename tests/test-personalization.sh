#!/bin/bash

# =============================================================================
# Скрипт для тестирования персонализации по устройствам
# =============================================================================

URL="http://localhost:3000/webhook"

echo "🧪 Тестирование персонализации по устройствам"
echo "=============================================="
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Тест 1: Колонка в кухне
echo -e "${BLUE}📍 Тест 1: Колонка в кухонной зоне${NC}"
echo "-------------------------------------------"
curl -s -X POST $URL \
  -H "Content-Type: application/json" \
  -d '{
    "request": {
      "command": "",
      "original_utterance": ""
    },
    "session": {
      "new": true,
      "message_id": 0,
      "session_id": "test_kitchen",
      "skill_id": "test",
      "user": {
        "user_id": "test_user_kitchen"
      }
    },
    "meta": {
      "client_id": "test_user_kitchen"
    },
    "version": "1.0"
  }' | jq -r '.response.text'
echo ""
echo ""

# Тест 2: Колонка в спальне
echo -e "${BLUE}📍 Тест 2: Колонка в зоне спальни${NC}"
echo "-------------------------------------------"
curl -s -X POST $URL \
  -H "Content-Type: application/json" \
  -d '{
    "request": {
      "command": "",
      "original_utterance": ""
    },
    "session": {
      "new": true,
      "message_id": 0,
      "session_id": "test_bedroom",
      "skill_id": "test",
      "user": {
        "user_id": "test_user_bedroom"
      }
    },
    "meta": {
      "client_id": "test_user_bedroom"
    },
    "version": "1.0"
  }' | jq -r '.response.text'
echo ""
echo ""

# Тест 3: Колонка в гостиной
echo -e "${BLUE}📍 Тест 3: Колонка в гостиной${NC}"
echo "-------------------------------------------"
curl -s -X POST $URL \
  -H "Content-Type: application/json" \
  -d '{
    "request": {
      "command": "",
      "original_utterance": ""
    },
    "session": {
      "new": true,
      "message_id": 0,
      "session_id": "test_hall",
      "skill_id": "test",
      "user": {
        "user_id": "test_user_hall"
      }
    },
    "meta": {
      "client_id": "test_user_hall"
    },
    "version": "1.0"
  }' | jq -r '.response.text'
echo ""
echo ""

# Тест 4: Неизвестная колонка (контент по умолчанию)
echo -e "${BLUE}📍 Тест 4: Неизвестная колонка (по умолчанию)${NC}"
echo "-------------------------------------------"
curl -s -X POST $URL \
  -H "Content-Type: application/json" \
  -d '{
    "request": {
      "command": "",
      "original_utterance": ""
    },
    "session": {
      "new": true,
      "message_id": 0,
      "session_id": "test_unknown",
      "skill_id": "test",
      "user": {
        "user_id": "unknown_user"
      }
    },
    "meta": {
      "client_id": "unknown_device"
    },
    "version": "1.0"
  }' | jq -r '.response.text'
echo ""
echo ""

# Тест 5: Акции в кухонной зоне
echo -e "${BLUE}📍 Тест 5: Акции в кухонной зоне${NC}"
echo "-------------------------------------------"
curl -s -X POST $URL \
  -H "Content-Type: application/json" \
  -d '{
    "request": {
      "command": "какие есть акции",
      "original_utterance": "какие есть акции"
    },
    "session": {
      "new": false,
      "message_id": 1,
      "session_id": "test_kitchen",
      "skill_id": "test",
      "user": {
        "user_id": "test_user_kitchen"
      }
    },
    "meta": {
      "client_id": "test_user_kitchen"
    },
    "version": "1.0"
  }' | jq -r '.response.text'
echo ""
echo ""

# Тест 6: Акции в зоне спальни
echo -e "${BLUE}📍 Тест 6: Акции в зоне спальни${NC}"
echo "-------------------------------------------"
curl -s -X POST $URL \
  -H "Content-Type: application/json" \
  -d '{
    "request": {
      "command": "какие есть акции",
      "original_utterance": "какие есть акции"
    },
    "session": {
      "new": false,
      "message_id": 1,
      "session_id": "test_bedroom",
      "skill_id": "test",
      "user": {
        "user_id": "test_user_bedroom"
      }
    },
    "meta": {
      "client_id": "test_user_bedroom"
    },
    "version": "1.0"
  }' | jq -r '.response.text'
echo ""
echo ""

echo -e "${GREEN}✅ Тестирование завершено!${NC}"
echo ""
echo -e "${YELLOW}💡 Совет: Проверьте логи сервера для детальной информации об устройствах${NC}"


