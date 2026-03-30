const mineflayer = require('mineflayer');
const { internalGuard, getExpireDate, getHumanExpiry, expiredMessage } = require('./guard');

// ===== PUBLIC CONFIG (safe to edit) =====
const SERVER_HOST     = 'nokaam.falixsrv.me';
const SERVER_PORT     = 43905;
const BOT_USERNAME    = 'Gumasthaaan';
const MC_VERSION      = '1.16.5';
const DEFAULT_COMMAND = '/register aagop04';

const ENABLE_RANDOM_CHAT       = true;   // random chat on/off
const ENABLE_HUMAN_MOVEMENT    = true;   // human-like movement on/off
const ENABLE_BLOCK_BREAK_PLACE = true;   // block break/place loop on/off

const OWNER_NAME      = 'AAG OP';
const AFTER_SPAWN_COMMAND = '/home afk';
// =======================================

// First check + show expiry info
if (!internalGuard()) {
  expiredMessage();
  console.log('Bot expired on: ' + getHumanExpiry());
  process.exit(0);
} else {
  const exp = getExpireDate();
  console.log('==========================================');
  console.log('Bot session started successfully.');
  console.log('Bot will expire on: ' + getHumanExpiry());
  console.log('Expiry ISO: ' + exp.toISOString());
  console.log('==========================================');
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function createBot () {
  if (!internalGuard()) {
    expiredMessage();
    console.log('Bot expired on: ' + getHumanExpiry());
    process.exit(0);
  }

  const bot = mineflayer.createBot({
    host: SERVER_HOST,
    port: SERVER_PORT,
    username: BOT_USERNAME,
    version: MC_VERSION
  });

  bot.on('spawn', () => {
    console.log('Bot is online');

    // 6 hour auto reconnect
    setInterval(() => {
      if (!internalGuard()) {
        expiredMessage();
        console.log('Bot expired on: ' + getHumanExpiry());
        process.exit(0);
      }
      console.log('6 hours passed, restarting bot...');
      bot.end('Scheduled restart');
    }, 6 * 60 * 60 * 1000);

    // default register/login
    if (DEFAULT_COMMAND && DEFAULT_COMMAND.trim().length > 0) {
      setTimeout(() => bot.chat(DEFAULT_COMMAND), randomInt(800, 1500));
    }

    // spawn ke baad base/home pe jana (optional)
    if (AFTER_SPAWN_COMMAND && AFTER_SPAWN_COMMAND.trim().length > 0) {
      setTimeout(() => bot.chat(AFTER_SPAWN_COMMAND), randomInt(2000, 4000));
    }

    // HUMAN‑LIKE ANTI‑AFK LOOP (toggleable)
    if (ENABLE_HUMAN_MOVEMENT) {
      function humanAfkLoop() {
        if (!internalGuard()) return;

        const actions = [
          'forward',
          'back',
          'left',
          'right',
          'jump',
          'sneak',
          'look'
        ];

        const action = actions[randomInt(0, actions.length - 1)];
        const duration = randomInt(400, 1500); // 0.4–1.5s
        const delayBefore = randomInt(2000, 6000); // 2–6s

        setTimeout(() => {
          if (!internalGuard()) return;

          try {
            switch (action) {
              case 'forward':
              case 'back':
              case 'left':
              case 'right':
                bot.setControlState(action, true);
                setTimeout(() => bot.setControlState(action, false), duration);
                break;

              case 'jump':
                bot.setControlState('jump', true);
                setTimeout(() => bot.setControlState('jump', false), duration);
                break;

              case 'sneak':
                bot.setControlState('sneak', true);
                setTimeout(() => bot.setControlState('sneak', false), duration);
                break;

              case 'look':
                const yaw   = bot.entity.yaw + randomFloat(-0.6, 0.6);
                const pitch = bot.entity.pitch + randomFloat(-0.3, 0.3);
                bot.look(yaw, pitch, false);
                break;
            }
          } catch (e) {
            console.log('AFK action error:', e.message);
          }

          humanAfkLoop();
        }, delayBefore);
      }

      setTimeout(humanAfkLoop, randomInt(5000, 9000));
    }

    // RANDOM CHAT (toggleable)
    if (ENABLE_RANDOM_CHAT) {
      const chats = [
        'brb',
        'lag aa raha',
        'koi hai?',
        'afk thoda',
        'xd'
      ];

      function chatLoop() {
        if (!internalGuard()) return;

        const msg = chats[randomInt(0, chats.length - 1)];
        bot.chat(msg);

        const next = randomInt(45000, 180000); // 45–180s
        setTimeout(chatLoop, next);
      }

      setTimeout(chatLoop, randomInt(30000, 60000));
    }

    // BLOCK BREAK + PLACE (toggleable)
    if (ENABLE_BLOCK_BREAK_PLACE) {
      setInterval(async () => {
        try {
          if (!internalGuard()) return;

          const basePos = bot.entity.position.offset(0, -1, 0);
          const block = bot.blockAt(basePos);
          if (!block || block.type === 0) {
            console.log('No block under bot');
            return;
          }

          console.log('Trying to break:', block.name);
          await bot.dig(block);

          let targetItemName = block.name;
          if (block.name === 'grass_block') targetItemName = 'dirt';

          const item = bot.inventory.items().find(i => i.name === targetItemName);
          if (!item) {
            console.log('Item not in inventory (mapped):', targetItemName);
            return;
          }

          await bot.equip(item, 'hand');

          const ref = bot.blockAt(basePos.offset(0, -1, 0));
          if (!ref) {
            console.log('No ref block to place on');
            return;
          }

          await bot.placeBlock(ref, { x: 0, y: 1, z: 0 });
          console.log('Placed back item:', targetItemName);
        } catch (e) {
          console.log('Place loop error:', e.message);
        }
      }, 10 * 60 * 1000);
    }
  });

  // in‑game control: OWNER_NAME + "!bot msg"
  bot.on('chat', (username, message) => {
    if (username === OWNER_NAME && message.startsWith('!bot ')) {
      const msg = message.substring(5).trim();
      if (msg.length > 0) bot.chat(msg);
    }
  });

  bot.on('kicked', (reason) => {
    console.log('Kicked:', reason);
  });

  bot.on('error', console.log);

  bot.on('end', () => {
    if (!internalGuard()) {
      expiredMessage();
      console.log('Bot expired on: ' + getHumanExpiry());
      process.exit(0);
    }
    const delay = randomInt(10000, 20000); // 10–20s reconnect
    console.log('Bot disconnected, reconnecting in', delay / 1000, 'seconds...');
    setTimeout(createBot, delay);
  });
}

createBot();
