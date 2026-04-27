const http = require('http');
const fs   = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const PORT     = process.env.PORT || 3000;
const BASE_DIR = __dirname;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.svg':  'image/svg+xml',
  '.webp': 'image/webp',
  '.png':  'image/png',
  '.gif':  'image/gif',
};

// ── カード定義（サーバー用） ─────────────────────────────────────────────
const CARDS_S = [
  { id: 'natsuemon',      type: 'attack',  cost: 1, atk: 2 },
  { id: 'tamuemon',       type: 'attack',  cost: 2, atk: 3 },
  { id: 'abandoned_dog',  type: 'attack',  cost: 1, atk: 2 },
  { id: 'bite',           type: 'attack',  cost: 1, atk: 1, lifesteal: true },
  { id: 'kopuemon',       type: 'attack',  cost: 2, atk: 2, lifesteal: true },
  { id: 'kirby',          type: 'attack',  cost: 2, atk: 2, effect: { type: 'draw', value: 1 } },
  { id: 'running_koup',   type: 'attack',  cost: 1, atk: 1, effect: { type: 'pp',   value: 1 } },
  { id: 'sion',           type: 'attack',  cost: 3, atk: 5 },
  { id: 'monster',        type: 'attack',  cost: 3, atk: 4, lifesteal: true },
  { id: 'demacia',        type: 'attack',  cost: 2, atk: 3, effect: { type: 'pp',   value: 1 } },
  { id: 'hamumu',         type: 'block',   cost: 1, block: 2 },
  { id: 'cupid',          type: 'block',   cost: 2, block: 3, effect: { type: 'draw', value: 1 } },
  { id: 'hey_guys',       type: 'block',   cost: 1, block: 2, effect: { type: 'heal', value: 1 } },
  { id: 'ton_tears',      type: 'support', cost: 1, effect: { type: 'heal', value: 2 } },
  { id: 'album1',         type: 'support', cost: 2, effect: { type: 'heal', value: 4 } },
  { id: 'album2',         type: 'support', cost: 3, effect: { type: 'double_atk' } },
  { id: 'mystery',        type: 'support', cost: 1, effect: { type: 'draw', value: 2 } },
  { id: 'roti_foxfire',   type: 'support', cost: 1, exclusive: 'roti',   effect: { type: 'add_foxfire', value: 3 } },
  { id: 'autumn_paradise',type: 'block',   cost: 2, block: 5, counter: 1, exclusive: 'autumn' },
  { id: 'foxfire',        type: 'attack',  cost: 0, atk: 1, lifesteal: true, generated: true },
];
const CMAP = Object.fromEntries(CARDS_S.map(c => [c.id, c]));

function shuffle(a) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

function createDeck(leaderId) {
  const deck = [];
  CARDS_S.forEach(c => {
    if (c.generated) return;
    if (c.exclusive && c.exclusive !== leaderId) return;
    deck.push(c.id, c.id);
  });
  return shuffle(deck);
}

function createPlayer(leaderId) {
  const deck = createDeck(leaderId);
  return { hp: 15, hand: deck.splice(0, 4), deck, leaderId, pp: 3, attackPPSpent: 0, blockPP: 3, attackZone: [], blockZone: [], doubleNextAttack: false, rotiCardsPlayed: 0, popeyeHealTotal: 0, popeyeAwake: false };
}

const rooms = new Map();

function genRoomId() {
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = '';
  for (let i = 0; i < 4; i++) id += c[Math.floor(Math.random() * c.length)];
  return rooms.has(id) ? genRoomId() : id;
}

function drawCard(p) {
  if (p.deck.length > 0 && p.hand.length < 7) p.hand.push(p.deck.pop());
}

function applyHeal(p, amount, log) {
  const prev = p.hp;
  p.hp = Math.min(15,p.hp + amount);
  const healed = p.hp - prev;
  if (healed > 0) {
    log.push(`💚 HP+${healed}回復（${p.hp}/20）`);
    if (p.leaderId === 'popeye' && !p.popeyeAwake) {
      p.popeyeHealTotal += healed;
      if (p.popeyeHealTotal >= 15) { p.popeyeAwake = true; log.push(`⭐ スーパーポパイ覚醒！`); }
    }
  }
}

function onLeaderCard(actor, target, log) {
  if (actor.leaderId === 'roti') {
    actor.rotiCardsPlayed++;
    if (actor.rotiCardsPlayed % 3 === 0) {
      target.hp = Math.max(0, target.hp - 3);
      log.push(`🦊 ろてぃ効果：3ダメージ！`);
    }
  }
}

// HTTP サーバー
const server = http.createServer((req, res) => {
  let urlPath;
  try { urlPath = decodeURIComponent(req.url === '/' ? '/index.html' : req.url); }
  catch { res.writeHead(400); return res.end('Bad Request'); }
  const fp = path.normalize(path.join(BASE_DIR, urlPath));
  if (!fp.startsWith(BASE_DIR)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(fp).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  });
});

// WebSocket サーバー
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  ws.roomId = null; ws.playerId = null;

  ws.on('message', raw => {
    try { handle(ws, JSON.parse(raw)); } catch(e) { console.error(e); }
  });

  ws.on('close', () => {
    const room = rooms.get(ws.roomId);
    if (!room) return;
    room.players.forEach(p => { if (p !== ws && p.readyState === 1) p.send(JSON.stringify({ type: 'opponent_disconnected' })); });
    rooms.delete(ws.roomId);
  });
});

function send(ws, obj)   { ws.send(JSON.stringify(obj)); }
function bcast(room, fn) { room.players.forEach((p, i) => send(p, fn(room.playerIds[i], room.playerIds[1-i]))); }

function clientState(gs, myId, oppId) {
  const me = gs.players[myId], opp = gs.players[oppId];
  return {
    myHp: me.hp, myHand: me.hand, myStatus: { awake: me.popeyeAwake },
    myPP: me.pp, myBlockPP: me.blockPP,
    myAttackZone: me.attackZone, myBlockZone: me.blockZone,
    opHp: opp.hp, opHandCount: opp.hand.length,
    opAttackZone: opp.attackZone, opBlockZone: opp.blockZone,
    opStatus: { awake: opp.popeyeAwake },
    phase: gs.phase, round: gs.round, log: [...gs.log], winner: gs.winner,
    myLeader: me.leaderId, opLeader: opp.leaderId,
    isMyTurn: gs.phase === 'p1_attack' && myId === gs.p1 || gs.phase === 'p1_block' && myId === gs.p1 ||
              gs.phase === 'p2_attack' && myId === gs.p2 || gs.phase === 'p2_block' && myId === gs.p2,
  };
}

function handle(ws, msg) {
  switch (msg.type) {
    case 'create_room': {
      const rid = genRoomId();
      ws.playerId = 'p1'; ws.roomId = rid;
      rooms.set(rid, { id: rid, players: [ws], playerIds: ['p1'], gs: null, p1Leader: msg.leaderId });
      send(ws, { type: 'room_created', roomId: rid });
      break;
    }
    case 'join_room': {
      const room = rooms.get(msg.roomId?.toUpperCase());
      if (!room) return send(ws, { type: 'error', message: 'ルームが見つかりません' });
      if (room.players.length >= 2) return send(ws, { type: 'error', message: '満員です' });
      ws.playerId = 'p2'; ws.roomId = room.id;
      room.players.push(ws); room.playerIds.push('p2');
      const gs = {
        players: { p1: createPlayer(room.p1Leader), p2: createPlayer(msg.leaderId) },
        phase: 'p1_attack', round: 1, p1: 'p1', p2: 'p2', log: [], winner: null,
      };
      drawCard(gs.players.p1); gs.players.p1.pp = 3;
      room.gs = gs;
      bcast(room, (myId, oppId) => ({ type: 'game_start', state: clientState(gs, myId, oppId) }));
      break;
    }
    case 'play_card':
    case 'end_attack':
    case 'play_block':
    case 'end_block': {
      const room = rooms.get(ws.roomId);
      if (!room?.gs) return;
      // Online game logic would go here (mirrors game.js logic)
      // For brevity, broadcast state after action
      bcast(room, (myId, oppId) => ({ type: 'game_update', state: clientState(room.gs, myId, oppId) }));
      break;
    }
  }
}

server.listen(PORT, () => {
  console.log(`🃏 GFS CARD GAME: http://localhost:${PORT}`);
});
