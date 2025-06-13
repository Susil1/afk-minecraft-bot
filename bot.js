const mineflayer = require('mineflayer');

function createBot(io) {
  const bot = mineflayer.createBot({
    host: 'Susilcreation.aternos.me',
    port: 23321,
    username: 'AFK_Bot',
    version: '1.21.5'
  });

  bot.on('spawn', () => {
    console.log('✅ Bot spawned');
    bot.setControlState('sneak', true);
  });

  bot.on('chat', (username, message) => {
    if (io) io.emit('chat', `${username}: ${message}`);
  });

  bot.on('end', () => {
    console.log('⚠️ Bot disconnected, reconnecting...');
    setTimeout(() => createBot(io), 10000);
  });

  bot.on('error', (err) => {
    console.log('❌ Bot error:', err.message);
  });

  return bot;
}

module.exports = createBot;
