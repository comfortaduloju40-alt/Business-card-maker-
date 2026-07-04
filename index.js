require('dotenv').config();
const express = require('express');

// Check env vars on startup
if (!process.env.BOT_TOKEN) {
  console.error('ERROR: BOT_TOKEN is missing');
  process.exit(1);
}
if (!process.env.WEBHOOK_URL) {
  console.error('ERROR: WEBHOOK_URL is missing');
  process.exit(1);
}

const { bot } = require('./bot');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const WEBHOOK_URL = process.env.WEBHOOK_URL;

// Railway health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Business Card Bot is running!' });
});

// Telegram sends all updates here
app.post('/webhook', (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Start server and register webhook with Telegram
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  try {
    await bot.setWebHook(`${WEBHOOK_URL}/webhook`);
    console.log(`Webhook set: ${WEBHOOK_URL}/webhook`);
  } catch (err) {
    console.error('Failed to set webhook:', err.message);
  }
});
