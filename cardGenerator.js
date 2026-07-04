const { createCanvas } = require('canvas');

// Generate a PNG business card image
function generateCard(data) {
  const width = 900;
  const height = 500;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // --- Background gradient ---
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, '#0f0c29');
  bg.addColorStop(0.5, '#302b63');
  bg.addColorStop(1, '#24243e');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // --- Left accent bar ---
  const accent = ctx.createLinearGradient(0, 0, 0, height);
  accent.addColorStop(0, '#f093fb');
  accent.addColorStop(1, '#f5576c');
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, 10, height);

  // --- Full Name ---
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 52px sans-serif';
  ctx.fillText(data.name || 'Your Name', 60, 110);

  // --- Job Title ---
  ctx.fillStyle = '#f093fb';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText(data.title || '', 60, 158);

  // --- Company ---
  ctx.fillStyle = '#b0b8d0';
  ctx.font = '24px sans-serif';
  ctx.fillText(data.company || '', 60, 200);

  // --- Divider line ---
  ctx.strokeStyle = '#444466';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(60, 228);
  ctx.lineTo(840, 228);
  ctx.stroke();

  // --- Contact details ---
  ctx.font = '22px sans-serif';
  let y = 270;

  if (data.email) {
    ctx.fillStyle = '#a0aec0';
    ctx.fillText('Email :', 60, y);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(data.email, 200, y);
    y += 45;
  }
  if (data.phone) {
    ctx.fillStyle = '#a0aec0';
    ctx.fillText('Phone :', 60, y);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(data.phone, 200, y);
    y += 45;
  }
  if (data.website) {
    ctx.fillStyle = '#a0aec0';
    ctx.fillText('Web   :', 60, y);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(data.website, 200, y);
    y += 45;
  }
  if (data.linkedin) {
    ctx.fillStyle = '#a0aec0';
    ctx.fillText('LinkedIn:', 60, y);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(data.linkedin, 200, y);
  }

  // --- Corner badge ---
  ctx.strokeStyle = '#f093fb';
  ctx.lineWidth = 2;
  ctx.strokeRect(828, 18, 54, 54);
  ctx.fillStyle = '#f093fb';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('BC', 838, 53);

  return canvas.toBuffer('image/png');
}

// Generate a plain text version of the card for easy copying
function generateTextCard(data) {
  const line = '─'.repeat(38);
  let card = '```\n';
  card += `${line}\n`;
  card += `  ${data.name}\n`;
  if (data.title)   card += `  ${data.title}\n`;
  if (data.company) card += `  ${data.company}\n`;
  card += `${line}\n`;
  if (data.email)    card += `  Email   : ${data.email}\n`;
  if (data.phone)    card += `  Phone   : ${data.phone}\n`;
  if (data.website)  card += `  Website : ${data.website}\n`;
  if (data.linkedin) card += `  LinkedIn: ${data.linkedin}\n`;
  card += `${line}\n`;
  card += '```';
  return card;
}

module.exports = { generateCard, generateTextCard };
