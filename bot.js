require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { getSession, createSession, updateSession, clearSession } = require('./sessions');
const { generateCard, generateTextCard } = require('./cardGenerator');

// Webhook mode — no polling
const bot = new TelegramBot(process.env.BOT_TOKEN, { webHook: true });

// Each step: what to ask, where to go next, which field to save
const STEPS = {
  name: {
    prompt: '👤 What is your *full name*?',
    next: 'title',
    field: 'name',
    required: true
  },
  title: {
    prompt: '💼 What is your *job title*?\n_(e.g. Software Engineer, CEO, Designer)_',
    next: 'company',
    field: 'title',
    required: true
  },
  company: {
    prompt: '🏢 What is your *company or organization name*?',
    next: 'email',
    field: 'company',
    required: true
  },
  email: {
    prompt: '📧 What is your *email address*?',
    next: 'phone',
    field: 'email',
    required: true
  },
  phone: {
    prompt: '📞 What is your *phone number*?\n_(e.g. +1 234 567 8900)_',
    next: 'website',
    field: 'phone',
    required: true
  },
  website: {
    prompt: '🌐 What is your *website URL*?\n_(optional — type *skip* to skip)_',
    next: 'linkedin',
    field: 'website',
    required: false
  },
  linkedin: {
    prompt: '🔗 What is your *LinkedIn URL or username*?\n_(optional — type *skip* to skip)_',
    next: 'done',
    field: 'linkedin',
    required: false
  }
};

// ─── /start ─────────────────────────────────────────
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const name = msg.from.first_name || 'there';

  bot.sendMessage(
    chatId,
    `👋 Hello, ${name}!\n\n` +
    `I'm your *Business Card Bot*. 🪪\n` +
    `I'll help you create a professional business card in seconds!\n\n` +
    `*Commands:*\n` +
    `🪪 /create — Start making your business card\n` +
    `❌ /cancel — Cancel current session\n` +
    `❓ /help — How to use this bot\n\n` +
    `Type /create to get started!`,
    { parse_mode: 'Markdown' }
  );
});

// ─── /help ──────────────────────────────────────────
bot.onText(/\/help/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `❓ *How to Use Business Card Bot*\n\n` +
    `1. Type /create to begin\n` +
    `2. Answer each question about yourself\n` +
    `3. Type *skip* for optional fields\n` +
    `4. Receive your card as an image + text!\n\n` +
    `*Fields I will ask for:*\n` +
    `• Full Name _(required)_\n` +
    `• Job Title _(required)_\n` +
    `• Company _(required)_\n` +
    `• Email _(required)_\n` +
    `• Phone _(required)_\n` +
    `• Website _(optional)_\n` +
    `• LinkedIn _(optional)_\n\n` +
    `Type /cancel at any time to stop.`,
    { parse_mode: 'Markdown' }
  );
});

// ─── /create ────────────────────────────────────────
bot.onText(/\/create/, (msg) => {
  const chatId = msg.chat.id;
  createSession(chatId);

  bot.sendMessage(
    chatId,
    `🪪 *Let's create your business card!*\n\n` +
    `I'll ask you a few quick questions.\n` +
    `Type /cancel at any time to stop.\n\n` +
    STEPS.name.prompt,
    { parse_mode: 'Markdown' }
  );
});

// ─── /cancel ────────────────────────────────────────
bot.onText(/\/cancel/, (msg) => {
  const chatId = msg.chat.id;
  clearSession(chatId);
  bot.sendMessage(chatId, '❌ Session cancelled.\n\nType /create to start a new card!');
});

// ─── Handle form answers ────────────────────────────
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Skip commands and empty messages
  if (!text || text.startsWith('/')) return;

  const session = getSession(chatId);

  // No active session
  if (!session) {
    bot.sendMessage(chatId, '👋 Type /create to build your business card!');
    return;
  }

  const currentStep = session.step;
  const stepConfig = STEPS[currentStep];
  if (!stepConfig) return;

  // Check for optional skip
  const isSkip = text.trim().toLowerCase() === 'skip';
  const value = isSkip && !stepConfig.required ? '' : text.trim();

  // Block empty required fields
  if (stepConfig.required && !value) {
    bot.sendMessage(
      chatId,
      `⚠️ This field is required. Please enter your *${stepConfig.field}*.`,
      { parse_mode: 'Markdown' }
    );
    return;
  }

  // Save value and advance step
  updateSession(chatId, stepConfig.next, { [stepConfig.field]: value });

  // All steps done — generate the card
  if (stepConfig.next === 'done') {
    const finalData = getSession(chatId).data;

    await bot.sendMessage(chatId, '⏳ Generating your business card...');

    try {
      // Send image card
      const imageBuffer = generateCard(finalData);
      await bot.sendPhoto(chatId, imageBuffer, {
        caption: '🪪 *Your Business Card*',
        parse_mode: 'Markdown'
      });

      // Send text card
      const textCard = generateTextCard(finalData);
      await bot.sendMessage(
        chatId,
        `📋 *Text Version* _(tap to copy)_\n\n${textCard}`,
        { parse_mode: 'Markdown' }
      );

      clearSession(chatId);

      await bot.sendMessage(
        chatId,
        '✅ Your business card is ready!\n\nType /create to make another one.'
      );
    } catch (err) {
      console.error('Card generation error:', err.message);
      bot.sendMessage(
        chatId,
        '❌ Something went wrong generating your card. Please try /create again.'
      );
      clearSession(chatId);
    }

    return;
  }

  // Ask the next question
  const nextStep = STEPS[stepConfig.next];
  if (nextStep) {
    bot.sendMessage(chatId, nextStep.prompt, { parse_mode: 'Markdown' });
  }
});

module.exports = { bot };
