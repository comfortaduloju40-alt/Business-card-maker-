// In-memory store — tracks each user's progress through the form
const sessions = {};

// Get a user's current session
function getSession(chatId) {
  return sessions[chatId] || null;
}

// Start a new session for a user
function createSession(chatId) {
  sessions[chatId] = {
    step: 'name',
    data: {
      name: '',
      title: '',
      company: '',
      email: '',
      phone: '',
      website: '',
      linkedin: ''
    }
  };
  return sessions[chatId];
}

// Move to next step and save the field value
function updateSession(chatId, nextStep, fieldData) {
  if (!sessions[chatId]) return;
  sessions[chatId].step = nextStep;
  if (fieldData) {
    Object.assign(sessions[chatId].data, fieldData);
  }
}

// Delete session when done or cancelled
function clearSession(chatId) {
  delete sessions[chatId];
}

module.exports = { getSession, createSession, updateSession, clearSession };
