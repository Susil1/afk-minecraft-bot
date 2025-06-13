const express = require('express');
const path = require('path');
const session = require('express-session');
const http = require('http');
const socketIo = require('socket.io');

const createBot = require('./bot');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

let bot = createBot(io);

app.use(session({
  secret: 'susilbot_secret',
  resave: false,
  saveUninitialized: true
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// AUTH MIDDLEWARE
function isAuthenticated(req, res, next) {
  if (req.session.authenticated) return next();
  res.redirect('/login.html');
}

// LOGIN
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === '1234') {
    req.session.authenticated = true;
    res.redirect('/');
  } else {
    res.send('Wrong credentials');
  }
});

// DASHBOARD (protected)
app.get('/', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// API endpoints
app.get('/api/sneak', (req, res) => {
  const state = bot.getControlState('sneak');
  bot.setControlState('sneak', !state);
  res.json({ sneak: !state });
});

app.get('/api/move/:direction', (req, res) => {
  const dir = req.params.direction;
  const valid = ['forward', 'back', 'left', 'right'];
  if (valid.includes(dir)) {
    bot.setControlState(dir, true);
    setTimeout(() => bot.setControlState(dir, false), 1000);
    res.json({ moved: dir });
  } else {
    res.status(400).json({ error: 'Invalid direction' });
  }
});

app.post('/api/chat', express.json(), (req, res) => {
  const msg = req.body.message;
  bot.chat(msg);
  res.json({ sent: msg });
});

app.get('/api/respawn', (req, res) => {
  if (bot && bot.health === 0) {
    bot.emit('respawn');
    res.json({ respawned: true });
  } else {
    res.json({ respawned: false });
  }
});

io.on('connection', (socket) => {
  console.log('📡 Client connected');
});

server.listen(PORT, () => {
  console.log(`🌍 Running on http://localhost:${PORT}`);
});
