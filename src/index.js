const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const { handleRequest } = require('./handlers/mainHandler');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Логирование запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Основной эндпоинт для Алисы
app.post('/webhook', async (req, res) => {
  try {
    console.log('Incoming request:', JSON.stringify(req.body, null, 2));
    
    const response = await handleRequest(req.body);
    
    console.log('Response:', JSON.stringify(response, null, 2));
    res.json(response);
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({
      response: {
        text: 'Извините, произошла ошибка. Попробуйте еще раз.',
        end_session: false
      },
      version: '1.0'
    });
  }
});

// Проверка работоспособности
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Главная страница
app.get('/', (req, res) => {
  res.json({
    message: 'Навык Алисы для торгового зала',
    version: '1.0.0',
    endpoints: {
      webhook: '/webhook',
      health: '/health'
    }
  });
});

app.listen(port, () => {
  console.log(`🎯 Навык Алисы запущен на порту ${port}`);
  console.log(`📡 Webhook URL: http://localhost:${port}/webhook`);
  console.log(`🏥 Health check: http://localhost:${port}/health`);
}); 