import { randomInt, randomUUID } from 'node:crypto';
import { WebSocketServer, WebSocket } from 'ws';

const port = Number(process.env.GAME_PORT ?? 5174);
const questionDuration = 20;
const maxQuestions = 100;
const rooms = new Map();
const server = new WebSocketServer({ host: '0.0.0.0', port, maxPayload: 64 * 1024 });

function send(socket, message) {
  if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
}

function sendError(socket, message) {
  send(socket, { type: 'error', message });
}

function makeRoomCode() {
  let code;
  do {
    code = String(randomInt(0, 1000000)).padStart(6, '0');
  } while (rooms.has(code));
  return code;
}

function getPlayers(room) {
  return [...room.players.values()]
    .map(({ id, name, score }) => ({ id, name, score }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

function makePublicGame(room) {
  const { status, index, secondsLeft, answeredCount } = room.game;
  const game = { status, index, secondsLeft, answeredCount };
  if (status === 'question' || status === 'results') {
    const { q, opts } = room.questions[index];
    game.question = { q, opts };
  }
  if (status === 'results') game.correctIndex = room.questions[index].correct;
  return game;
}

function broadcastRoom(room) {
  const message = { type: 'room_state', game: makePublicGame(room), players: getPlayers(room) };
  send(room.host, message);
  for (const player of room.players.values()) send(player.socket, message);
}

function clearTimer(room) {
  if (room.timer) clearInterval(room.timer);
  room.timer = null;
}

function startQuestion(room, index) {
  clearTimer(room);
  room.answered.clear();
  if (index >= room.questions.length) {
    room.game = { status: 'finished', index, secondsLeft: 0, answeredCount: 0 };
    broadcastRoom(room);
    return;
  }

  room.game = { status: 'question', index, secondsLeft: questionDuration, answeredCount: 0 };
  broadcastRoom(room);
  room.timer = setInterval(() => {
    if (room.game.status !== 'question') {
      clearTimer(room);
      return;
    }
    room.game.secondsLeft = Math.max(0, room.game.secondsLeft - 1);
    if (room.game.secondsLeft === 0) {
      room.game.status = 'results';
      clearTimer(room);
    }
    broadcastRoom(room);
  }, 1000);
}

function closeRoom(room) {
  clearTimer(room);
  send(room.host, { type: 'room_closed' });
  for (const player of room.players.values()) {
    send(player.socket, { type: 'room_closed' });
    player.socket.roomCode = null;
    player.socket.role = null;
  }
  room.players.clear();
  rooms.delete(room.code);
}

function sanitizeQuestions(questions) {
  if (!Array.isArray(questions) || questions.length === 0 || questions.length > maxQuestions) return null;
  const sanitized = [];
  for (const item of questions) {
    if (
      typeof item?.q !== 'string'
      || item.q.trim().length === 0
      || item.q.length > 500
      || !Array.isArray(item.opts)
      || item.opts.length !== 4
      || item.opts.some((option) => typeof option !== 'string' || option.trim().length === 0 || option.length > 200)
      || new Set(item.opts.map((option) => option.trim().toLocaleLowerCase())).size !== 4
      || !Number.isInteger(item.correct)
      || item.correct < 0
      || item.correct > 3
    ) return null;
    sanitized.push({ q: item.q.trim(), opts: item.opts.map((option) => option.trim()), correct: item.correct });
  }
  return sanitized;
}

function handleMessage(socket, message) {
  if (!message || typeof message.type !== 'string') {
    sendError(socket, 'Vigane mänguserveri sõnum.');
    return;
  }

  if (message.type === 'room:create') {
    if (socket.roomCode) {
      sendError(socket, 'Sellest ühendusest on juba mängutoaga liitutud.');
      return;
    }
    const questions = sanitizeQuestions(message.questions);
    if (!questions) {
      sendError(socket, 'Lisa enne toa loomist 1–100 korrektset nelja vastusevariandiga küsimust.');
      return;
    }
    const room = {
      code: makeRoomCode(),
      host: socket,
      players: new Map(),
      questions,
      answered: new Set(),
      timer: null,
      game: { status: 'lobby', index: 0, secondsLeft: questionDuration, answeredCount: 0 },
    };
    rooms.set(room.code, room);
    socket.roomCode = room.code;
    socket.role = 'host';
    socket.playerId = randomUUID();
    send(socket, { type: 'room_created', code: room.code, playerId: socket.playerId });
    broadcastRoom(room);
    return;
  }

  if (message.type === 'room:join') {
    const code = typeof message.code === 'string' ? message.code.replace(/\D/g, '').slice(0, 6) : '';
    const name = typeof message.name === 'string' ? message.name.trim().slice(0, 24) : '';
    const room = rooms.get(code);
    if (socket.roomCode || !room || !name) {
      sendError(socket, 'Mängutuba ei leitud. Kontrolli koodi ja mängijanime.');
      return;
    }
    const playerId = randomUUID();
    room.players.set(playerId, { id: playerId, name, score: 0, socket });
    socket.roomCode = code;
    socket.role = 'player';
    socket.playerId = playerId;
    send(socket, { type: 'joined', code, playerId, name });
    broadcastRoom(room);
    return;
  }

  const room = rooms.get(socket.roomCode);
  if (!room) {
    sendError(socket, 'Mängutuba pole enam saadaval.');
    return;
  }

  if (socket.role === 'host') {
    if (message.type === 'host:start' && room.game.status === 'lobby') {
      startQuestion(room, 0);
    } else if (message.type === 'host:reveal') {
      clearTimer(room);
      if (room.game.status === 'question') room.game.status = 'results';
      broadcastRoom(room);
    } else if (message.type === 'host:next' && room.game.status === 'results') {
      startQuestion(room, room.game.index + 1);
    } else if (message.type === 'host:restart' && room.game.status === 'finished') {
      for (const player of room.players.values()) player.score = 0;
      startQuestion(room, 0);
    } else if (message.type === 'room:leave') {
      closeRoom(room);
    } else {
      sendError(socket, 'Seda tegevust ei saa praeguses mängufaasis teha.');
    }
    return;
  }

  if (socket.role === 'player' && message.type === 'player:answer') {
    if (
      room.game.status !== 'question'
      || message.index !== room.game.index
      || !Number.isInteger(message.optionIndex)
      || message.optionIndex < 0
      || message.optionIndex > 3
      || room.answered.has(socket.playerId)
    ) return;

    room.answered.add(socket.playerId);
    const player = room.players.get(socket.playerId);
    if (player && message.optionIndex === room.questions[room.game.index].correct) player.score += 100;
    room.game.answeredCount = room.answered.size;
    if (room.players.size > 0 && room.answered.size >= room.players.size) {
      room.game.status = 'results';
      clearTimer(room);
      clearTimer(room);
    }
    broadcastRoom(room);
    return;
  }

  if (socket.role === 'player' && message.type === 'room:leave') {
    room.players.delete(socket.playerId);
    socket.roomCode = null;
    socket.role = null;
    broadcastRoom(room);
    return;
  }

  sendError(socket, 'Seda tegevust ei saa teha.');
}

server.on('connection', (socket) => {
  socket.on('message', (rawMessage) => {
    try {
      handleMessage(socket, JSON.parse(rawMessage.toString()));
    } catch (error) {
      console.error('Mänguserveri sõnumi töötlemine ebaõnnestus:', error);
      sendError(socket, 'Sõnumit ei õnnestunud töödelda.');
    }
  });

  socket.on('close', () => {
    const room = rooms.get(socket.roomCode);
    if (!room) return;
    if (socket.role === 'host') {
      closeRoom(room);
      return;
    }
    if (socket.role === 'player') {
      room.players.delete(socket.playerId);
      broadcastRoom(room);
    }
  });
});

server.on('listening', () => {
  console.log(`Halloweeni mänguserver töötab pordil ${port}.`);
  console.log('Ühenda mängijad sama usaldatud Wi-Fi-võrguga ja luba Node.js tulemüüris.');
});

server.on('error', (error) => {
  console.error(`Mänguserveri käivitamine ebaõnnestus pordil ${port}:`, error);
  process.exitCode = 1;
});
