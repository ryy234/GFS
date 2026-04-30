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

// ── カード定義 ──────────────────────────────────────────────────────────────
const CARDS_S = [
  { id: 'natsuemon',       type: 'attack',  cost: 1, atk: 2 },
  { id: 'tamuemon',        type: 'attack',  cost: 2, atk: 4 },
  { id: 'abandoned_dog',   type: 'attack',  cost: 1, atk: 2 },
  { id: 'bite',            type: 'attack',  cost: 1, atk: 1, lifesteal: true },
  { id: 'kopuemon',        type: 'attack',  cost: 2, atk: 3, lifesteal: true },
  { id: 'kirby',           type: 'attack',  cost: 2, atk: 3, effect: { type: 'draw', value: 1 } },
  { id: 'running_koup',    type: 'attack',  cost: 1, atk: 1, effect: { type: 'pp',   value: 1 } },
  { id: 'sion',            type: 'attack',  cost: 3, atk: 7 },
  { id: 'monster',         type: 'attack',  cost: 3, atk: 5, lifesteal: true },
  { id: 'demacia',         type: 'attack',  cost: 2, atk: 3, effect: { type: 'pp',   value: 1 } },
  { id: 'hamumu',          type: 'block',   cost: 2, block: 4 },
  { id: 'blockman',        type: 'block',   cost: 3, block: 7 },
  { id: 'mari_tanuki',     type: 'support', cost: 2, effect: { type: 'heal_draw', heal: 1, draw: 3 } },
  { id: 'cupid',           type: 'block',   cost: 2, block: 3, effect: { type: 'draw', value: 1 } },
  { id: 'hey_guys',        type: 'block',   cost: 1, block: 2, effect: { type: 'heal', value: 1 } },
  { id: 'ton_tears',       type: 'support', cost: 1, effect: { type: 'heal', value: 2 } },
  { id: 'album1',          type: 'support', cost: 2, effect: { type: 'heal', value: 4 } },
  { id: 'album2',          type: 'support', cost: 3, effect: { type: 'double_atk' } },
  { id: 'mystery',         type: 'support', cost: 1, effect: { type: 'draw', value: 2 } },
  { id: 'darkin',          type: 'support', cost: 2, exclusive: 'popeye', effect: { type: 'heal_draw', heal: 3, draw: 1 } },
  { id: 'roti_foxfire',    type: 'support', cost: 1, exclusive: 'roti',   effect: { type: 'add_foxfire', value: 3 } },
  { id: 'autumn_paradise', type: 'block',   cost: 2, block: 5, counter: 1, exclusive: 'autumn' },
  { id: 'foxfire',         type: 'attack',  cost: 0, atk: 1, lifesteal: true, generated: true },
];
const CMAP = Object.fromEntries(CARDS_S.map(c => [c.id, c]));

// ── ユーティリティ ────────────────────────────────────────────────────────
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

function drawCard(p) {
  if (p.deck.length > 0 && p.hand.length < 7) p.hand.push(p.deck.pop());
}

function drawCards(p, n) {
  for (let i = 0; i < n; i++) drawCard(p);
}

function applyHeal(gs, p, amount) {
  const prev = p.hp;
  p.hp = Math.min(20, p.hp + amount);
  const healed = p.hp - prev;
  if (healed > 0) {
    addLog(gs, `💚 HP+${healed}回復（${p.hp}/20）`);
    gs.lastHeal = (gs.lastHeal || 0) + healed;
    gs.lastHealTarget = gs.players.p1 === p ? 'p1' : 'p2';
    if (p.leaderId === 'popeye' && !p.popeyeAwake) {
      p.popeyeHealTotal += healed;
      if (p.popeyeHealTotal >= 12) {
        p.popeyeAwake = true;
        addLog(gs, `⭐ スーパーポパイ覚醒！全アタックにLS！`);
      }
    }
  }
}

function calcLifeStealHeal(actor, actualDamage) {
  if (actualDamage <= 0) return 0;
  const rawTotal = actor.attackZone.reduce((s, id) => s + (CMAP[id]?.atk || 0), 0);
  if (rawTotal <= 0) return 0;
  if (actor.leaderId === 'popeye' && actor.popeyeAwake) return actualDamage;
  const rawLS = actor.attackZone.filter(id => CMAP[id]?.lifesteal).reduce((s, id) => s + (CMAP[id]?.atk || 0), 0);
  if (rawLS <= 0) return 0;
  return Math.min(rawLS, actualDamage);
}

function addLog(gs, msg) {
  gs.log.unshift(msg);
  if (gs.log.length > 20) gs.log.pop();
}

function leaderOnCard(gs, actor, opponent) {
  if (actor.leaderId === 'roti') {
    actor.rotiCardsPlayed++;
    if (actor.rotiCardsPlayed % 3 === 0) {
      opponent.hp = Math.max(0, opponent.hp - 2);
      addLog(gs, `🦊 ろてぃ効果：2ダメ！（${opponent.hp}/20）`);
      checkWin(gs);
    }
  }
}

function checkWin(gs) {
  if (gs.players.p1.hp <= 0 && gs.players.p2.hp <= 0) gs.winner = 'draw';
  else if (gs.players.p2.hp <= 0) gs.winner = 'p1';
  else if (gs.players.p1.hp <= 0) gs.winner = 'p2';
}

// ── ゲーム作成 ──────────────────────────────────────────────────────────────
function createPlayerState(leaderId) {
  const deck = createDeck(leaderId);
  return {
    hp: 20, hand: deck.splice(0, 4), deck, leaderId,
    pp: 3, attackPPSpent: 0, blockPP: 3,
    attackZone: [], blockZone: [], supportZone: [],
    doubleNextAttack: false, doublePending: false,
    rotiCardsPlayed: 0, popeyeHealTotal: 0, popeyeAwake: false,
  };
}

function createGame(p1Leader, p2Leader) {
  const gs = {
    players: { p1: createPlayerState(p1Leader), p2: createPlayerState(p2Leader) },
    phase: 'p1_attack', round: 1, log: [], winner: null,
    lastDamage: 0, lastDamageTarget: null,
    lastExclusiveCard: null, lastExclusiveCardOwner: null,
  };
  drawCard(gs.players.p1);
  addLog(gs, `🃏 ゲーム開始！P1のアタックフェーズ`);
  return gs;
}

// ── ゲームアクション ─────────────────────────────────────────────────────────
function applySupport(gs, actor, c) {
  const eff = c.effect;
  if (!eff) return;
  switch (eff.type) {
    case 'heal':       applyHeal(gs, actor, eff.value); break;
    case 'draw':       drawCards(actor, eff.value); break;
    case 'pp':         actor.pp = Math.min(3, actor.pp + eff.value); addLog(gs, `💎 PP+${eff.value}`); break;
    case 'double_atk': actor.doublePending = true; addLog(gs, `⬆️ 次ターンのアタック2倍！`); break;
    case 'heal_draw':  applyHeal(gs, actor, eff.heal); drawCards(actor, eff.draw); break;
    case 'add_foxfire':
      for (let i = 0; i < eff.value; i++) actor.hand.push('foxfire');
      addLog(gs, `🦊 フォックスファイア×${eff.value}追加`); break;
  }
}

function actionPlayAttack(gs, actorId, cardId) {
  const oppId = actorId === 'p1' ? 'p2' : 'p1';
  const actor = gs.players[actorId], opp = gs.players[oppId];
  const c = CMAP[cardId];
  if (!c) return 'invalid card';
  if (!actor.hand.includes(cardId)) return 'not in hand';
  if (c.type === 'block') return 'block card in attack phase';
  if (actor.pp < c.cost) return 'not enough PP';
  actor.pp -= c.cost; actor.attackPPSpent += c.cost;
  actor.hand.splice(actor.hand.indexOf(cardId), 1);
  if (c.type === 'attack') {
    actor.attackZone.push(cardId);
    addLog(gs, `⚔️ ${cardId}（ATK ${c.atk}）を出した`);
    if (c.effect?.type === 'draw') drawCards(actor, c.effect.value);
    if (c.effect?.type === 'pp') { actor.pp = Math.min(3, actor.pp + c.effect.value); addLog(gs, `💎 PP+${c.effect.value}`); }
  } else {
    actor.supportZone.push(cardId);
    addLog(gs, `✨ ${cardId}を発動`);
    applySupport(gs, actor, c);
  }
  if (c.exclusive) { gs.lastExclusiveCard = cardId; gs.lastExclusiveCardOwner = actorId; }
  leaderOnCard(gs, actor, opp);
  checkWin(gs);
  return null;
}

function actionPlayBlock(gs, actorId, cardId) {
  const oppId = actorId === 'p1' ? 'p2' : 'p1';
  const actor = gs.players[actorId], opp = gs.players[oppId];
  const c = CMAP[cardId];
  if (!c || c.type !== 'block') return 'not a block card';
  if (!actor.hand.includes(cardId)) return 'not in hand';
  if (actor.blockPP < c.cost) return 'not enough block PP';
  actor.blockPP -= c.cost;
  actor.hand.splice(actor.hand.indexOf(cardId), 1);
  actor.blockZone.push(cardId);
  addLog(gs, `🛡 ${cardId}（BLK ${c.block}）でブロック`);
  if (c.effect?.type === 'draw') drawCards(actor, c.effect.value);
  if (c.effect?.type === 'heal') applyHeal(gs, actor, c.effect.value);
  if (c.exclusive) { gs.lastExclusiveCard = cardId; gs.lastExclusiveCardOwner = actorId; }
  leaderOnCard(gs, actor, opp);
  return null;
}

function actionEndAttack(gs, actorId) {
  const actor = gs.players[actorId];
  actor.blockPP = actor.pp;
  if (gs.phase === 'p1_attack') { gs.phase = 'p2_block'; addLog(gs, `📊 P1アタック終了 → P2ブロックフェーズ`); }
  else if (gs.phase === 'p2_attack') { gs.phase = 'p1_block'; addLog(gs, `📊 P2アタック終了 → P1ブロックフェーズ`); }
  return null;
}

function actionEndBlock(gs, blockerId) {
  const attackerId = blockerId === 'p1' ? 'p2' : 'p1';
  const blocker = gs.players[blockerId], attacker = gs.players[attackerId];
  const rawTotal = attacker.attackZone.reduce((s, id) => s + (CMAP[id]?.atk || 0), 0);
  const totalAtk = attacker.doubleNextAttack ? rawTotal * 2 : rawTotal;
  const totalBlk = blocker.blockZone.reduce((s, id) => s + (CMAP[id]?.block || 0), 0);
  const damage = Math.max(0, totalAtk - totalBlk);
  addLog(gs, `⚡ ATK${totalAtk} vs BLK${totalBlk} → DMG${damage}`);
  gs.lastDamage = 0;
  gs.lastDamageTarget = null;
  if (damage > 0) {
    blocker.hp = Math.max(0, blocker.hp - damage);
    addLog(gs, `💥 ${damage}ダメ！（${blocker.hp}/20）`);
    gs.lastDamage = damage;
    gs.lastDamageTarget = blockerId;
    const lsHeal = calcLifeStealHeal(attacker, damage);
    if (lsHeal > 0) applyHeal(gs, attacker, lsHeal);
  }
  const counterDmg = blocker.blockZone.reduce((s, id) => s + (CMAP[id]?.counter || 0), 0);
  if (damage === 0 && counterDmg > 0) {
    attacker.hp = Math.max(0, attacker.hp - counterDmg);
    addLog(gs, `🌿 反撃${counterDmg}ダメ！`);
  }
  if (blocker.leaderId === 'autumn' && damage === 0 && totalBlk > 0) {
    attacker.hp = Math.max(0, attacker.hp - 2);
    addLog(gs, `🍂 おーたむ反撃2ダメ！`);
  }
  attacker.attackZone = []; attacker.supportZone = []; blocker.blockZone = [];
  attacker.doubleNextAttack = attacker.doublePending;
  attacker.doublePending = false;
  checkWin(gs);
  if (gs.winner) return null;
  if (gs.phase === 'p2_block') {
    drawCard(gs.players.p2); gs.players.p2.pp = 3; gs.players.p2.attackPPSpent = 0;
    gs.phase = 'p2_attack';
    addLog(gs, `─── P2アタックフェーズ ───`);
  } else if (gs.phase === 'p1_block') {
    gs.round++; drawCard(gs.players.p1); gs.players.p1.pp = 3; gs.players.p1.attackPPSpent = 0;
    gs.phase = 'p1_attack';
    addLog(gs, `─── Round ${gs.round} P1アタックフェーズ ───`);
  }
  return null;
}

// ── クライアント向けState構築 ────────────────────────────────────────────────
function buildState(gs, myId) {
  const oppId = myId === 'p1' ? 'p2' : 'p1';
  const me = gs.players[myId], opp = gs.players[oppId];
  const myPhases   = { p1: ['p1_attack', 'p1_block'], p2: ['p2_attack', 'p2_block'] };
  const isMyTurn   = myPhases[myId]?.includes(gs.phase) ?? false;
  const isAttacking = gs.phase === `${myId}_attack`;
  const isBlocking  = gs.phase === `${myId}_block`;
  return {
    myHp: me.hp, myHand: me.hand, myLeader: me.leaderId,
    myPP: me.pp, myBlockPP: me.blockPP,
    myAttackZone: me.attackZone, myBlockZone: me.blockZone, mySupportZone: me.supportZone,
    myPopeyeAwake: me.popeyeAwake, myPopeyeHealTotal: me.popeyeHealTotal,
    opHp: opp.hp, opHandCount: opp.hand.length, opLeader: opp.leaderId,
    opPP: opp.pp, opBlockPP: opp.blockPP,
    opAttackZone: opp.attackZone, opBlockZone: opp.blockZone, opSupportZone: opp.supportZone,
    opPopeyeAwake: opp.popeyeAwake, opPopeyeHealTotal: opp.popeyeHealTotal,
    phase: gs.phase, isMyTurn, isAttacking, isBlocking,
    round: gs.round, log: [...gs.log],
    winner: gs.winner ? (gs.winner === myId ? 'me' : gs.winner === 'draw' ? 'draw' : 'opponent') : null,
    lastDamage: gs.lastDamage || 0,
    lastDamageIsMe: gs.lastDamageTarget === myId,
    lastHeal: gs.lastHeal || 0,
    lastHealIsMe: gs.lastHealTarget === myId,
    lastExclusiveCard: gs.lastExclusiveCard && gs.lastExclusiveCardOwner === myId ? gs.lastExclusiveCard : null,
  };
}

// ── HTTP サーバー ──────────────────────────────────────────────────────────
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

// ── WebSocket ────────────────────────────────────────────────────────────────
const wss = new WebSocketServer({ server });
const rooms = new Map();

function genRoomId() {
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = '';
  for (let i = 0; i < 4; i++) id += c[Math.floor(Math.random() * c.length)];
  return rooms.has(id) ? genRoomId() : id;
}

function send(ws, obj) { if (ws.readyState === 1) ws.send(JSON.stringify(obj)); }

function bcast(room, fn) {
  room.players.forEach((ws, i) => {
    const myId = room.playerIds[i];
    send(ws, fn(myId));
  });
}

wss.on('connection', (ws) => {
  ws.roomId = null; ws.playerId = null;
  ws.on('message', raw => { try { handle(ws, JSON.parse(raw)); } catch(e) { console.error(e); } });
  ws.on('close', () => {
    const room = rooms.get(ws.roomId);
    if (!room) return;
    room.players.forEach(p => { if (p !== ws) send(p, { type: 'opponent_disconnected' }); });
    rooms.delete(ws.roomId);
  });
});

function handle(ws, msg) {
  switch (msg.type) {

    case 'create_room': {
      const roomId = genRoomId();
      ws.playerId = 'p1'; ws.roomId = roomId;
      rooms.set(roomId, { id: roomId, players: [ws], playerIds: ['p1'], gs: null, leaders: {} });
      send(ws, { type: 'room_created', roomId });
      break;
    }

    case 'join_room': {
      const room = rooms.get(msg.roomId?.toUpperCase());
      if (!room) return send(ws, { type: 'error', message: 'ルームが見つかりません' });
      if (room.players.length >= 2) return send(ws, { type: 'error', message: '満員です' });
      ws.playerId = 'p2'; ws.roomId = room.id;
      room.players.push(ws); room.playerIds.push('p2');
      room.players.forEach(p => send(p, { type: 'select_leader' }));
      break;
    }

    case 'choose_leader': {
      const room = rooms.get(ws.roomId);
      if (!room) return;
      room.leaders[ws.playerId] = msg.leaderId;
      send(ws, { type: 'leader_chosen', leaderId: msg.leaderId });
      if (room.leaders.p1 && room.leaders.p2) {
        room.gs = createGame(room.leaders.p1, room.leaders.p2);
        bcast(room, myId => ({ type: 'game_start', state: buildState(room.gs, myId), playerId: myId }));
      }
      break;
    }

    case 'play_attack_card':
    case 'play_block_card':
    case 'end_attack':
    case 'end_block': {
      const room = rooms.get(ws.roomId);
      if (!room?.gs || room.gs.winner) return;
      const gs = room.gs;
      let err = null;
      if (msg.type === 'play_attack_card') err = actionPlayAttack(gs, ws.playerId, msg.cardId);
      if (msg.type === 'play_block_card')  err = actionPlayBlock(gs,  ws.playerId, msg.cardId);
      if (msg.type === 'end_attack')       err = actionEndAttack(gs,  ws.playerId);
      if (msg.type === 'end_block')        err = actionEndBlock(gs,   ws.playerId);
      if (err) return send(ws, { type: 'error', message: err });
      bcast(room, myId => ({ type: 'game_update', state: buildState(gs, myId) }));
      // 一時フィールドをリセット
      gs.lastDamage = 0; gs.lastDamageTarget = null;
      gs.lastHeal = 0; gs.lastHealTarget = null;
      gs.lastExclusiveCard = null; gs.lastExclusiveCardOwner = null;
      if (gs.winner) bcast(room, myId => ({ type: 'game_over', isWinner: buildState(gs, myId).winner === 'me' }));
      break;
    }
  }
}

server.listen(PORT, () => console.log(`🃏 GFS CARD GAME: http://localhost:${PORT}`));
