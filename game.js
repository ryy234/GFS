'use strict';

// ── リーダー定義 ──────────────────────────────────────────────────────────
const LEADERS = [
  {
    id: 'roti',
    name: '#0704 ろてぃ',
    image: 'card_icon/リーダーカード/%230704%20ろてぃ.png',
    effect: 'カードを3枚プレイするごとに相手に2ダメージ',
    exclusive: ['roti_foxfire'],
  },
  {
    id: 'popeye',
    name: '星の観測者スーパーポパイ',
    image: 'card_icon/リーダーカード/星の観測者スーパーポパイ.png',
    effect: 'カード効果で合計12回復したとき覚醒。全アタックにライフスティール獲得',
    exclusive: [],
  },
  {
    id: 'autumn',
    name: '秋の魔法使い おーたむ',
    image: 'card_icon/リーダーカード/秋の魔法使い おーたむ.png',
    effect: 'ブロック成功（ダメージ0）時、相手に2ダメージ',
    exclusive: ['autumn_paradise'],
  },
];

// ── カード定義 ──────────────────────────────────────────────────────────────
const CARDS = [
  // Attack
  { id: 'natsuemon',     name: 'なつえもん',               image: 'card_icon/natsuemon.webp',                              type: 'attack',  cost: 1, atk: 2,                                                desc: 'ATK 2' },
  { id: 'tamuemon',      name: 'たむえもん',               image: 'card_icon/tamuemon.webp',                               type: 'attack',  cost: 2, atk: 4,                                                desc: 'ATK 4' },
  { id: 'abandoned_dog', name: '捨てられた犬',             image: 'card_icon/捨てられた犬.webp',                           type: 'attack',  cost: 1, atk: 2,                                                desc: 'ATK 2' },
  { id: 'bite',          name: '噛みつく',                 image: 'card_icon/噛みつく.webp',                               type: 'attack',  cost: 1, atk: 1, lifesteal: true,                               desc: 'ATK 1　ライフスティール' },
  { id: 'kopuemon',      name: 'こぷえもん',               image: 'card_icon/こぷえもん.webp',                             type: 'attack',  cost: 2, atk: 3, lifesteal: true,                               desc: 'ATK 3　ライフスティール' },
  { id: 'kirby',         name: '星のコービィ',             image: 'card_icon/星のコービィ.jpg',                           type: 'attack',  cost: 2, atk: 3, effect: { type: 'draw', value: 1 },            desc: 'ATK 3　カード1枚ドロー' },
  { id: 'running_koup',  name: '走るこうぷ',               image: 'card_icon/走るこうぷ.webp',                             type: 'attack',  cost: 1, atk: 1, effect: { type: 'pp',   value: 1 },            desc: 'ATK 1　PP+1' },
  { id: 'sion',          name: 'サイオンGFSフォルム',      image: 'card_icon/サイオンGFSフォルム.webp',                    type: 'attack',  cost: 3, atk: 7,                                                desc: 'ATK 7' },
  { id: 'monster',       name: '化け物',                   image: 'card_icon/化け物.webp',                                 type: 'attack',  cost: 3, atk: 5, lifesteal: true,                               desc: 'ATK 5　ライフスティール' },
  { id: 'demacia',       name: 'ﾃﾞﾏｰｼｱｱｱｱｱｱｱｱｱｱｱｱｱｱ',   image: 'card_icon/ﾃﾞﾏｰｼｱｱｱｱｱｱｱｱｱｱｱｱｱｱ.webp',              type: 'attack',  cost: 2, atk: 3, effect: { type: 'pp',   value: 1 },            desc: 'ATK 3　PP+1' },
  // Block
  { id: 'hamumu',        name: 'ハムム',                   image: 'card_icon/ハムム.webp',                                 type: 'block',   cost: 2, block: 4,                                              desc: 'ブロック 4' },
  { id: 'blockman',     name: 'ブロックマン',              image: 'card_icon/ブロックマン.png',                             type: 'block',   cost: 3, block: 7,                                              desc: 'ブロック 7' },
  { id: 'cupid',         name: '恋のキュービット',         image: 'card_icon/恋のキュービット.webp',                       type: 'block',   cost: 2, block: 3, effect: { type: 'draw', value: 1 },         desc: 'ブロック 3　カード1枚ドロー' },
  { id: 'hey_guys',      name: 'hey,guys!',                image: 'card_icon/hey,guys.webp',                               type: 'block',   cost: 1, block: 2, effect: { type: 'heal', value: 1 },         desc: 'ブロック 2　HP+1回復' },
  // Support
  { id: 'ton_tears',     name: 'とんの涙',                 image: 'card_icon/とんの涙.webp',                               type: 'support', cost: 1, effect: { type: 'heal', value: 2 },                   desc: 'HP 2回復' },
  { id: 'album1',        name: 'うさぎの涙',        image: 'card_icon/album_2025-04-29_02-41-49.gif',               type: 'support', cost: 2, effect: { type: 'heal', value: 4 },                   desc: 'HP 4回復' },
  { id: 'album2',        name: 'コーヒーカップ',        image: 'card_icon/album_2025-05-18_02-53-31.gif',               type: 'support', cost: 3, effect: { type: 'double_atk' },                       desc: '次のターンのアタックを2倍' },
  { id: 'mystery',       name: 'GFSの魔人',               image: 'card_icon/ランプの魔人.webp',          type: 'support', cost: 1, effect: { type: 'draw', value: 2 },                   desc: 'カード2枚ドロー' },
  { id: 'mari_tanuki',  name: 'マリのたぬき',              image: 'card_icon/マリのたぬき.jpg',             type: 'support', cost: 2, effect: { type: 'heal_draw', heal: 1, draw: 3 },         desc: 'カード3枚ドロー＋HP1回復' },
  // Leader Exclusive
  { id: 'darkin',        name: 'ダーキンの兆し',          image: 'card_icon/ダ―キンの兆し.png',                               type: 'support', cost: 2, exclusive: 'popeye', effect: { type: 'heal_draw', heal: 3, draw: 1 }, desc: 'HP 3回復＋カード1枚ドロー' },
  { id: 'roti_foxfire',  name: 'ろてぃのフォックスファイア',  image: 'card_icon/ろてぃのフォックスファイア.png',              type: 'support', cost: 1, exclusive: 'roti',    effect: { type: 'add_foxfire', value: 3 }, desc: 'フォックスファイア×3を手札に加える' },
  { id: 'autumn_paradise', name: 'おーたむ茨の楽園',    image: 'card_icon/おーたむの茨の楽園.png',                      type: 'block',   cost: 2, block: 5, counter: 1, exclusive: 'autumn',              desc: 'ブロック 5　反撃1' },
  // Generated (not in deck)
  { id: 'foxfire',       name: 'フォックスファイア',       image: 'card_icon/フォックスファイア.png',                                 type: 'attack',  cost: 0, atk: 1, lifesteal: true, generated: true,              desc: 'ATK 1　ライフスティール' },
];

const CARD_MAP  = Object.fromEntries(CARDS.map(c => [c.id, c]));
const LEADER_MAP = Object.fromEntries(LEADERS.map(l => [l.id, l]));
const TYPE_COLOR = { attack: '#e74c3c', block: '#3498db', support: '#eab308' };

// ── フェーズ定数 ──────────────────────────────────────────────────────────
const PHASE = {
  LEADER_SELECT: 'leader_select',
  P1_ATTACK:     'p1_attack',
  P2_BLOCK:      'p2_block',
  RESOLVE_P1:    'resolve_p1',
  P2_ATTACK:     'p2_attack',
  P1_BLOCK:      'p1_block',
  RESOLVE_P2:    'resolve_p2',
  GAME_OVER:     'game_over',
};

// ── ユーティリティ ────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function createDeck(leaderId) {
  const deck = [];
  CARDS.forEach(c => {
    if (c.generated) return;
    if (c.exclusive && c.exclusive !== leaderId) return;
    // 専用カードは3枚（≈1.5x）で引き確率アップ、通常は2枚
    const copies = (c.exclusive === leaderId) ? 3 : 2;
    for (let i = 0; i < copies; i++) deck.push(c.id);
  });
  return shuffle(deck);
}

function createPlayer(leaderId) {
  const deck = createDeck(leaderId);
  return {
    hp: 20,
    hand: deck.splice(0, 4),
    deck,
    leaderId,
    pp: 3,
    attackPPSpent: 0,
    blockPP: 3,    // PP available for blocking (3 - attackPPSpent at end of attack phase)
    attackZone: [],
    blockZone: [],
    doubleNextAttack: false,
    doublePending: false,
    // leader counters
    rotiCardsPlayed: 0,
    popeyeHealTotal: 0,
    popeyeAwake: false,
  };
}

// ── ゲーム状態 ──────────────────────────────────────────────────────────────
const G = {
  phase: PHASE.LEADER_SELECT,
  round: 1,
  player: null,
  cpu: null,
  log: [],
  winner: null,
  mode: 'cpu',

  // ── 初期化 ──
  startGame(playerLeaderId, cpuLeaderId) {
    this.phase = PHASE.P1_ATTACK;
    this.round = 1;
    this.player = createPlayer(playerLeaderId);
    this.cpu    = createPlayer(cpuLeaderId);
    this.log = [];
    this.winner = null;
    // P1 first turn: draw + PP
    this._drawCard(this.player);
    this.player.pp = 3;
    this.player.attackPPSpent = 0;
    this.addLog(`🃏 ゲーム開始！あなたのアタックフェーズ`);
    UI.render();
  },

  addLog(msg) {
    this.log.unshift(msg);
    if (this.log.length > 20) this.log.pop();
  },

  _drawCard(p) {
    if (p.deck.length > 0 && p.hand.length < 7) {
      p.hand.push(p.deck.pop());
    }
  },

  // ── カードをプレイ（アタックフェーズ） ──
  playAttackCard(cardId) {
    if (this.phase !== PHASE.P1_ATTACK) return false;
    return this._playCard(this.player, this.cpu, cardId, 'attack_phase');
  },

  // ── カードをプレイ（ブロックフェーズ） ──
  playBlockCard(cardId) {
    if (this.phase !== PHASE.P1_BLOCK) return false;
    const p = this.player;
    const c = CARD_MAP[cardId];
    if (!c) return false;
    if (c.type !== 'block') { this.addLog('⚠️ ブロックフェーズではブロックカードのみ使用可'); return false; }
    if (!p.hand.includes(cardId)) return false;
    const cost = c.cost;
    if (p.blockPP < cost) { this.addLog('⚠️ ブロックPPが足りない！'); return false; }

    p.blockPP -= cost;
    p.hand.splice(p.hand.indexOf(cardId), 1);
    p.blockZone.push(cardId);
    this.addLog(`🛡 ${c.name}（ブロック${c.block}）を出した`);
    if (c.effect?.type === 'draw')  this._applyDraw(p, c.effect.value);
    if (c.effect?.type === 'heal')  this._applyHeal(p, c.effect.value);
    this._leaderOnCard(p, cardId);
    if (c.exclusive) UI._showExclusiveAnimation(c);
    UI.render();
    return true;
  },

  _playCard(actor, target, cardId, phase) {
    const c = CARD_MAP[cardId];
    if (!c) return false;
    if (!actor.hand.includes(cardId)) return false;
    if (phase === 'attack_phase' && c.type === 'block') {
      this.addLog('⚠️ アタックフェーズではブロックカードは出せない');
      return false;
    }
    if (actor.pp < c.cost) { this.addLog('⚠️ PPが足りない！'); return false; }

    actor.pp -= c.cost;
    actor.attackPPSpent += c.cost;
    actor.hand.splice(actor.hand.indexOf(cardId), 1);

    if (c.type === 'attack') {
      actor.attackZone.push(cardId);
      this.addLog(`⚔️ ${c.name}（ATK ${c.atk}）を出した`);
      if (c.effect?.type === 'draw') this._applyDraw(actor, c.effect.value);
      if (c.effect?.type === 'pp')   { actor.pp = Math.min(3, actor.pp + c.effect.value); this.addLog(`💎 PP+${c.effect.value}`); }
    } else if (c.type === 'support') {
      this.addLog(`✨ ${c.name}を発動`);
      this._applySupport(actor, target, c);
    }
    // 専用カード演出（プレイヤーが使った時のみ）
    if (c.exclusive && actor === this.player) UI._showExclusiveAnimation(c);

    // リーダー効果：カード枚数カウント
    this._leaderOnCard(actor, cardId);
    UI.render();
    return true;
  },

  _applySupport(actor, _target, c) {
    const eff = c.effect;
    if (!eff) return;
    switch (eff.type) {
      case 'heal':
        this._applyHeal(actor, eff.value);
        break;
      case 'draw':
        this._applyDraw(actor, eff.value);
        break;
      case 'pp':
        actor.pp = Math.min(3, actor.pp + eff.value);
        this.addLog(`💎 PP+${eff.value}`);
        break;
      case 'double_atk':
        actor.doublePending = true;
        this.addLog(`⬆️ 次ターンのアタック2倍！`);
        break;
      case 'add_foxfire':
        for (let i = 0; i < eff.value; i++) actor.hand.push('foxfire');
        this.addLog(`🦊 フォックスファイア×${eff.value}を手札に加えた`);
        break;
      case 'heal_draw':
        this._applyHeal(actor, eff.heal);
        this._applyDraw(actor, eff.draw);
        break;
    }
  },

  _applyHeal(actor, amount) {
    const prev = actor.hp;
    actor.hp = Math.min(20,actor.hp + amount);
    const healed = actor.hp - prev;
    if (healed > 0) {
      this.addLog(`💚 HP+${healed}回復（${actor.hp}/20）`);
      // スーパーポパイ覚醒チェック
      if (actor.leaderId === 'popeye' && !actor.popeyeAwake) {
        actor.popeyeHealTotal += healed;
        if (actor.popeyeHealTotal >= 12) {
          actor.popeyeAwake = true;
          this.addLog(`⭐ スーパーポパイ覚醒！全アタックにライフスティール！`);
        }
      }
    }
  },

  _applyDraw(actor, count) {
    let drawn = 0;
    for (let i = 0; i < count; i++) {
      if (actor.deck.length > 0 && actor.hand.length < 7) {
        actor.hand.push(actor.deck.pop());
        drawn++;
      }
    }
    if (drawn > 0) this.addLog(`📤 カード${drawn}枚ドロー`);
  },

  // ── リーダー効果：カードプレイ時 ──
  _leaderOnCard(actor) {
    const opponent = actor === this.player ? this.cpu : this.player;
    if (actor.leaderId === 'roti') {
      actor.rotiCardsPlayed++;
      if (actor.rotiCardsPlayed % 3 === 0) {
        opponent.hp = Math.max(0, opponent.hp - 2);
        this.addLog(`🦊 ろてぃリーダー効果：相手に2ダメージ！（${opponent.hp}/20）`);
        this._checkWin();
      }
    }
  },

  // ── アタック終了ボタン ──
  endAttack() {
    if (this.phase !== PHASE.P1_ATTACK) return;
    this.player.blockPP = this.player.pp;
    this.phase = PHASE.P2_BLOCK;
    const totalAtk = this._calcTotalAtk(this.player);
    this.addLog(`📊 アタック合計: ${totalAtk}。CPUがブロック中...`);
    UI.render();
    setTimeout(() => this._cpuBlock(), 900);
  },

  // ── CPUブロック（自動） ──
  _cpuBlock() {
    const cpu = this.cpu;
    const totalAtk = this._calcTotalAtk(this.player);
    let remaining = totalAtk;

    // ブロック可能カード（コスト≤blockPP）をソートして使う
    const blockCards = cpu.hand
      .filter(id => {
        const c = CARD_MAP[id];
        return c?.type === 'block' && c.cost <= cpu.blockPP;
      })
      .sort((a, b) => (CARD_MAP[b].block || 0) - (CARD_MAP[a].block || 0));

    for (const id of blockCards) {
      const c = CARD_MAP[id];
      if (cpu.blockPP < c.cost) continue;
      if (remaining <= 0) break;
      cpu.blockPP -= c.cost;
      cpu.hand.splice(cpu.hand.indexOf(id), 1);
      cpu.blockZone.push(id);
      this.addLog(`🤖 CPUが${c.name}（ブロック${c.block}）でブロック`);
      if (c.effect?.type === 'draw') this._applyDraw(cpu, c.effect.value);
      if (c.effect?.type === 'heal') this._applyHeal(cpu, c.effect.value);
      this._leaderOnCard(cpu, id);
      remaining -= (c.block || 0);
    }

    this.phase = PHASE.RESOLVE_P1;
    UI.render();
    setTimeout(() => this._resolveAttack(this.player, this.cpu), 600);
  },

  // ── ダメージ解決 ──
  _resolveAttack(attacker, defender) {
    const totalAtk = this._calcTotalAtk(attacker);
    const totalBlk = this._calcTotalBlk(defender);
    const damage = Math.max(0, totalAtk - totalBlk);

    this.addLog(`⚡ アタック${totalAtk} vs ブロック${totalBlk} → ダメージ${damage}`);

    if (damage > 0) {
      defender.hp = Math.max(0, defender.hp - damage);
      this.addLog(`💥 ${damage}ダメージ！（${defender.hp}/20）`);
      // ダメージ演出
      const defWho = defender === this.player ? 'player' : 'cpu';
      UI._showDamageAnimation(defWho, damage);
      const lsHeal = this._calcLifeStealHeal(attacker, damage);
      if (lsHeal > 0) this._applyHeal(attacker, lsHeal);
    }

    // カウンター判定（ブロックゾーンにcounterがある場合）
    const counterDmg = defender.blockZone.reduce((s, id) => s + (CARD_MAP[id]?.counter || 0), 0);
    if (damage === 0 && counterDmg > 0) {
      attacker.hp = Math.max(0, attacker.hp - counterDmg);
      this.addLog(`🌿 反撃${counterDmg}ダメージ！`);
    }

    // おーたむリーダー効果（ブロックカードを使用してダメージ0になった場合のみ）
    if (defender.leaderId === 'autumn' && damage === 0 && totalBlk > 0) {
      attacker.hp = Math.max(0, attacker.hp - 2);
      this.addLog(`🍂 おーたむリーダー効果：反撃2ダメージ！`);
    }

    // ゾーンをクリア
    attacker.attackZone = [];
    defender.blockZone = [];
    attacker.doubleNextAttack = attacker.doublePending;
    attacker.doublePending = false;

    this._checkWin();
    if (this.winner) { UI.render(); return; }

    if (attacker === this.player) {
      // P1→P2 解決後、P2のアタック開始
      this.phase = PHASE.P2_ATTACK;
      this.addLog(`🔄 CPUのアタックフェーズ`);
      UI.render();
      setTimeout(() => this._cpuAttack(), 800);
    } else {
      // P2→P1 解決後、次ラウンドへ
      this.round++;
      this.phase = PHASE.P1_ATTACK;
      this._drawCard(this.player);
      this.player.pp = 3;
      this.player.attackPPSpent = 0;
      this.addLog(`─── Round ${this.round} ───　あなたのアタックフェーズ`);
      UI.render();
    }
  },

  _calcTotalAtk(actor) {
    let total = actor.attackZone.reduce((s, id) => s + (CARD_MAP[id]?.atk || 0), 0);
    if (actor.doubleNextAttack) total *= 2;
    return total;
  },

  _calcTotalBlk(actor) {
    return actor.blockZone.reduce((s, id) => s + (CARD_MAP[id]?.block || 0), 0);
  },

  // ライフスティールカードの割合だけ回復量を計算
  _calcLifeStealHeal(actor, actualDamage) {
    if (actualDamage <= 0) return 0;
    const rawTotal = actor.attackZone.reduce((s, id) => s + (CARD_MAP[id]?.atk || 0), 0);
    if (rawTotal <= 0) return 0;
    // ポパイ覚醒時は全カードがLS扱い
    if (actor.leaderId === 'popeye' && actor.popeyeAwake) return actualDamage;
    const rawLS = actor.attackZone
      .filter(id => CARD_MAP[id]?.lifesteal)
      .reduce((s, id) => s + (CARD_MAP[id]?.atk || 0), 0);
    if (rawLS <= 0) return 0;
    return Math.min(rawLS, actualDamage);
  },

  // ── CPUアタック（自動） ──
  _cpuAttack() {
    const cpu = this.cpu;
    cpu.pp = 3;
    cpu.attackPPSpent = 0;
    this._drawCard(cpu);

    // CPUはHPが低ければサポート優先、それ以外は攻撃最大化
    const tryPlay = (filter) => {
      let played = true;
      while (played && cpu.pp > 0) {
        played = false;
        const candidates = cpu.hand.filter(id => {
          const c = CARD_MAP[id];
          return c && c.type !== 'block' && c.cost <= cpu.pp && filter(c);
        });
        if (!candidates.length) break;
        // コスト高い順
        candidates.sort((a, b) => CARD_MAP[b].cost - CARD_MAP[a].cost);
        const pick = candidates[0];
        this._playCard(cpu, this.player, pick, 'attack_phase');
        played = true;
      }
    };

    if (cpu.hp <= 8) {
      // 回復サポート優先
      tryPlay(c => c.type === 'support' && c.effect?.type === 'heal');
    }
    // アタックカード
    tryPlay(c => c.type === 'attack');
    // 残PPでサポート
    tryPlay(c => c.type === 'support');

    cpu.blockPP = cpu.pp;
    this.phase = PHASE.P1_BLOCK;
    const totalAtk = this._calcTotalAtk(cpu);
    this.addLog(`📊 CPU アタック合計: ${totalAtk}。あなたのブロックフェーズ！`);
    UI.render();
  },

  // ── ブロック終了ボタン ──
  endBlock() {
    if (this.phase !== PHASE.P1_BLOCK) return;
    this.phase = PHASE.RESOLVE_P2;
    UI.render();
    setTimeout(() => this._resolveAttack(this.cpu, this.player), 600);
  },

  _checkWin() {
    if (this.cpu.hp <= 0 && this.player.hp <= 0) {
      this.winner = 'draw';
      this.phase = PHASE.GAME_OVER;
      UI.showResult(null);
    } else if (this.cpu.hp <= 0) {
      this.winner = 'player';
      this.phase = PHASE.GAME_OVER;
      UI.showResult(true);
    } else if (this.player.hp <= 0) {
      this.winner = 'cpu';
      this.phase = PHASE.GAME_OVER;
      UI.showResult(false);
    }
  },
};

// ── UI ────────────────────────────────────────────────────────────────────
const UI = {
  init() {
    this._bindEvents();
    this.show('menu');
  },

  show(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(`screen-${name}`).classList.remove('hidden');
  },

  _bindEvents() {
    document.getElementById('btn-vs-cpu').onclick = () => this.show('leader');
    document.getElementById('btn-back-leader').onclick = () => this.show('menu');
    document.getElementById('btn-end-attack').onclick = () => { G.endAttack(); };
    document.getElementById('btn-end-block').onclick  = () => { G.endBlock(); };
    document.getElementById('btn-result-retry').onclick = () => this.show('leader');
    document.getElementById('btn-result-menu').onclick  = () => this.show('menu');
    document.getElementById('btn-cardlist')?.addEventListener('click', () => this.showCardList());
    document.getElementById('btn-cardlist-back')?.addEventListener('click', () => this.show('menu'));
    document.getElementById('card-modal-close-btn')?.addEventListener('click', () => this.closeCardModal());
    document.getElementById('card-modal-close-bg')?.addEventListener('click',  () => this.closeCardModal());

    // リーダー選択
    document.querySelectorAll('.leader-option').forEach(el => {
      el.onclick = () => {
        const leaderId = el.dataset.leader;
        const others = LEADERS.filter(l => l.id !== leaderId);
        const cpuLeader = others[Math.floor(Math.random() * others.length)];
        G.startGame(leaderId, cpuLeader.id);
        this.show('game');
      };
    });
  },

  showCardList() {
    const grid = document.getElementById('cardlist-grid');
    if (!grid) return;
    grid.innerHTML = '';
    CARDS.filter(c => !c.generated).forEach(card => {
      const el = this._makeCard(card, card.cost, false);
      // 暗くならないようdisabledを外してpreviewクラスにする
      el.classList.remove('disabled');
      el.classList.add('preview');
      el.onclick = () => this.showCardDetail(card);
      grid.appendChild(el);
    });
    this.show('cardlist');
  },

  showCardDetail(card) {
    const modal = document.getElementById('card-detail-modal');
    const inner = document.getElementById('card-modal-inner');
    if (!modal || !inner) return;
    // プレイ中と同じ構造のカードをそのまま拡大表示
    const bigCard = this._makeCard(card, card.cost, false);
    bigCard.classList.remove('disabled');
    bigCard.classList.add('preview', 'card-enlarged');
    inner.innerHTML = '';
    inner.appendChild(bigCard);
    modal.classList.remove('hidden');
  },

  closeCardModal() {
    document.getElementById('card-detail-modal')?.classList.add('hidden');
  },

  // CPU手札を裏面で表示
  _renderCpuHand(count) {
    const el = document.getElementById('cpu-hand-display');
    if (!el) return;
    el.innerHTML = Array(count).fill(0).map(() =>
      `<img class="card-back-thumb" src="card_icon/GFSカード_裏面.png" alt="card back" onerror="this.style.background='#1a1a2e'">`
    ).join('');
  },

  // 専用カード発動演出
  _showExclusiveAnimation(card) {
    const overlay = document.createElement('div');
    overlay.className = 'exclusive-anim-overlay';
    overlay.innerHTML = `
      <div class="exclusive-anim-box">
        <img src="${card.image}" class="exclusive-anim-img" alt="${card.name}" onerror="this.src=''">
        <div class="exclusive-anim-name">${card.name}</div>
      </div>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => {
      overlay.classList.add('exclusive-fade-out');
      setTimeout(() => overlay.remove(), 500);
    }, 1600);
  },

  // ダメージ演出（リーダーの上にdamage.png + テキスト）
  _showDamageAnimation(who, amount) {
    const targetId = who === 'player' ? 'player-leader-block' : 'cpu-leader-block';
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return;
    const rect = targetEl.getBoundingClientRect();
    const el = document.createElement('div');
    el.className = 'damage-anim';
    el.style.left = `${rect.left + rect.width / 2}px`;
    el.style.top  = `${rect.top  + rect.height / 2}px`;
    el.innerHTML  = `
      <img src="card_icon/damage.png" class="damage-img" alt="damage" onerror="this.style.display='none'">
      <div class="damage-text">${amount} ダメージ！</div>
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1400);
  },

  render() {
    const p = G.player, c = G.cpu;
    if (!p || !c) return;

    const phase = G.phase;
    const isAttackPhase = phase === PHASE.P1_ATTACK;
    const isBlockPhase  = phase === PHASE.P1_BLOCK;
    const playerPP = isAttackPhase ? p.pp : isBlockPhase ? p.blockPP : 0;

    // リーダーブロック（HP数値 + PP横並び）
    this._renderLeaderBlock('player-leader-block', p.leaderId, p.popeyeAwake, p.hp, playerPP);
    this._renderLeaderBlock('cpu-leader-block',    c.leaderId, c.popeyeAwake, c.hp, c.pp);

    // フェーズ
    const phaseText = {
      [PHASE.P1_ATTACK]:  '⚔️ あなたのアタック',
      [PHASE.P2_BLOCK]:   '🛡 CPU ブロック中...',
      [PHASE.RESOLVE_P1]: '⚡ ダメージ計算中...',
      [PHASE.P2_ATTACK]:  '🤖 CPU アタック中...',
      [PHASE.P1_BLOCK]:   '🛡 あなたのブロック',
      [PHASE.RESOLVE_P2]: '⚡ ダメージ計算中...',
      [PHASE.GAME_OVER]:  '🏁 ゲーム終了',
    };
    document.getElementById('phase-display').textContent = phaseText[phase] || '';
    document.getElementById('round-display').textContent = `Round ${G.round}`;

    // ゾーンラベル
    const plbl = document.getElementById('player-zone-label');
    const clbl = document.getElementById('cpu-zone-label');
    if (plbl) plbl.textContent = isAttackPhase ? '⚔️ あなたのアタックゾーン' : isBlockPhase ? '🛡 あなたのブロックゾーン' : '🃏 プレイゾーン';
    if (clbl) clbl.textContent = (phase === PHASE.P2_ATTACK) ? '⚔️ CPU アタックゾーン' : (phase === PHASE.P2_BLOCK) ? '🛡 CPU ブロックゾーン' : '🃏 CPU プレイゾーン';

    this._renderZone('cpu-play-zone',    [...c.attackZone, ...c.blockZone]);
    this._renderZone('player-play-zone', [...p.attackZone, ...p.blockZone]);
    this._renderCpuHand(c.hand.length);
    this._renderHand(p, isAttackPhase, isBlockPhase);

    document.getElementById('btn-end-attack').disabled = !isAttackPhase;
    document.getElementById('btn-end-block').disabled  = !isBlockPhase;

    const logEl = document.getElementById('battle-log');
    logEl.innerHTML = G.log.map(l => `<div class="log-line">${l}</div>`).join('');
  },

  _renderLeaderBlock(elId, leaderId, awake, hp, pp) {
    const el = document.getElementById(elId);
    if (!el || !leaderId) return;
    const leader = LEADER_MAP[leaderId];
    const imgSrc = (leaderId === 'popeye' && awake)
      ? 'card_icon/リーダーカード/星の観測者スーパーポパイ_覚醒状態.png'
      : leader.image;
    const hpColor = hp > 13 ? '#4ade80' : hp > 7 ? '#fbbf24' : '#f87171';
    const dots = [0,1,2].map(i => `<span class="pp-dot ${i < pp ? 'filled' : ''}"></span>`).join('');
    el.innerHTML = `
      <div class="leader-block ${awake ? 'awake' : ''}">
        <div class="leader-img-wrap">
          <img src="${imgSrc}" alt="${leader.name}" onerror="this.parentNode.style.background='#1a1a2e'">
          <div class="leader-hp-num" style="color:${hpColor}">❤️${hp}</div>
          ${awake ? '<div class="awake-badge">覚醒</div>' : ''}
        </div>
        <div class="leader-name-sm">${leader.name}</div>
        <div class="pp-row-h">${dots}</div>
      </div>
    `;
  },

  _renderLeaderCard(elId, leaderId, awake) {
    const el = document.getElementById(elId);
    if (!el || !leaderId) return;
    const leader = LEADER_MAP[leaderId];
    const imgSrc = (leaderId === 'popeye' && awake)
      ? 'card_icon/リーダーカード/星の観測者スーパーポパイ_覚醒状態.png'
      : leader.image;
    el.innerHTML = `
      <div class="leader-card ${awake ? 'awake' : ''}">
        <img src="${imgSrc}" alt="${leader.name}">
        <div class="leader-name">${leader.name}</div>
        ${awake ? '<div class="awake-badge">覚醒</div>' : ''}
      </div>
    `;
  },

  _renderPP(elId, pp, label) {
    const el = document.getElementById(elId);
    if (!el) return;
    const dots = [0,1,2].map(i => `<span class="pp-dot ${i < pp ? 'filled' : ''}"></span>`).join('');
    el.innerHTML = `<span class="pp-label">${label}</span>${dots}`;
  },

  _renderZone(elId, zone) {
    const el = document.getElementById(elId);
    if (!el) return;
    // innerHTML で一括再構築（appendChild の積み重ねによる欠落を防ぐ）
    if (!zone || zone.length === 0) {
      el.innerHTML = '<div class="zone-empty">—</div>';
      return;
    }
    el.innerHTML = zone.map(cardId => {
      const card = CARD_MAP[cardId];
      if (!card) return '';
      const statLine = card.type === 'attack'
        ? `ATK ${card.atk}`
        : card.type === 'block'
        ? `BLK ${card.block}${card.counter ? ' 反撃' + card.counter : ''}`
        : 'サポート';
      return `
        <div class="card disabled" style="--card-color:${TYPE_COLOR[card.type] || '#555'}">
          <div class="card-header">
            <span class="card-cost">${card.cost}💎</span>
            <span class="card-type-label">${card.type === 'attack' ? '⚔️' : card.type === 'block' ? '🛡' : '✨'}</span>
          </div>
          <div class="card-img-wrap">
            <img src="${card.image}" alt="${card.name}" loading="lazy" onerror="this.parentNode.style.background='#1a1a2e'">
          </div>
          <div class="card-footer">
            <div class="card-name">${card.name}</div>
            <div class="card-stat">${statLine}</div>
          </div>
        </div>`;
    }).join('');
  },

  _renderHand(p, isAttackPhase, isBlockPhase) {
    const el = document.getElementById('player-hand');
    el.innerHTML = '';
    p.hand.forEach(cardId => {
      const card = CARD_MAP[cardId];
      if (!card) return;

      let canPlay = false;
      if (isAttackPhase && card.type !== 'block' && card.cost <= p.pp) canPlay = true;
      if (isBlockPhase  && card.type === 'block' && card.cost <= p.blockPP) canPlay = true;

      const el2 = this._makeCard(card, card.cost, canPlay);
      if (canPlay) {
        el2.onclick = () => {
          if (isAttackPhase) G.playAttackCard(cardId);
          if (isBlockPhase)  G.playBlockCard(cardId);
        };
      }
      el.appendChild(el2);
    });
  },

  _makeCard(card, cost, playable) {
    const el = document.createElement('div');
    el.className = `card ${playable ? 'playable' : 'disabled'}`;
    el.style.setProperty('--card-color', TYPE_COLOR[card.type] || '#555');

    const statLine = card.type === 'attack'
      ? `ATK ${card.atk}`
      : card.type === 'block'
      ? `BLK ${card.block}${card.counter ? ' 反撃' + card.counter : ''}`
      : 'サポート';

    const badges = [];
    if (card.lifesteal) badges.push('<span class="badge badge-ls">LS</span>');
    if (card.exclusive) badges.push('<span class="badge badge-ex">専用</span>');
    if (card.generated) badges.push('<span class="badge badge-gen">生成</span>');

    el.innerHTML = `
      <div class="card-header">
        <span class="card-cost">${cost}💎</span>
        <span class="card-type-label">${card.type === 'attack' ? '⚔️' : card.type === 'block' ? '🛡' : '✨'}</span>
      </div>
      <div class="card-img-wrap">
        <img src="${card.image}" alt="${card.name}" loading="lazy" onerror="this.parentNode.style.background='#1a1a2e'">
      </div>
      <div class="card-footer">
        <div class="card-name">${card.name}</div>
        <div class="card-stat">${statLine}</div>
        <div class="card-desc">${card.desc}</div>
        <div class="card-badges">${badges.length ? badges.join('') : '<span class="badge-spacer"></span>'}</div>
      </div>
    `;
    return el;
  },

  showResult(isWin) {
    const title = isWin === null ? '引き分け' : isWin ? '🏆 WIN！' : '💀 LOSE...';
    document.getElementById('result-title').textContent = title;
    document.getElementById('result-msg').textContent = isWin
      ? 'GFS-CARDGAMEでの勝利！'
      : isWin === null ? 'お互いに全力を出し切った！' : 'またチャレンジしよう！';
    this.show('result');
  },
};

// ── オンラインマネージャー ────────────────────────────────────────────────
const Online = {
  ws: null,
  roomId: null,
  playerId: null,
  pendingLeader: null,

  connect(onOpen) {
    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.ws = new WebSocket(`${proto}//${location.host}`);
    this.ws.onopen    = onOpen;
    this.ws.onmessage = e => this._onMsg(JSON.parse(e.data));
    this.ws.onclose   = () => {
      document.getElementById('online-status').textContent = '⚠️ 切断されました';
    };
  },

  send(obj) { if (this.ws?.readyState === 1) this.ws.send(JSON.stringify(obj)); },

  createRoom() {
    this.connect(() => this.send({ type: 'create_room' }));
  },

  joinRoom(code) {
    this.connect(() => this.send({ type: 'join_room', roomId: code }));
  },

  chooseLeader(leaderId) {
    this.pendingLeader = leaderId;
    this.send({ type: 'choose_leader', leaderId });
    document.getElementById('online-status').textContent = '⏳ 相手のリーダー選択を待っています...';
  },

  _onMsg(msg) {
    switch (msg.type) {
      case 'room_created':
        this.roomId = msg.roomId;
        document.getElementById('online-room-code').textContent = msg.roomId;
        document.getElementById('online-status').textContent = '⏳ 相手の参加を待っています...';
        UI.show('online-wait');
        break;

      case 'select_leader':
        document.getElementById('online-status').textContent = 'リーダーを選択してください';
        UI.show('online-leader');
        break;

      case 'leader_chosen':
        document.getElementById('online-status').textContent = '⏳ 相手のリーダー選択を待っています...';
        break;

      case 'game_start':
        this.playerId = msg.playerId;
        UI.show('game');
        this._render(msg.state);
        break;

      case 'game_update':
        this._render(msg.state);
        break;

      case 'game_over':
        UI.showResult(msg.isWinner);
        break;

      case 'opponent_disconnected':
        alert('相手が切断しました');
        UI.show('menu');
        break;

      case 'error':
        document.getElementById('online-status').textContent = `❌ ${msg.message}`;
        break;
    }
  },

  _render(state) {
    // リーダーブロック（HP + PP 統合）
    const ppVal = state.isAttacking ? state.myPP : state.isBlocking ? state.myBlockPP : 0;
    UI._renderLeaderBlock('player-leader-block', state.myLeader, state.myPopeyeAwake, state.myHp, ppVal);
    UI._renderLeaderBlock('cpu-leader-block',    state.opLeader, state.opPopeyeAwake, state.opHp, 0);

    // フェーズ
    const phaseLabel = {
      p1_attack: state.playerId === 'p1' ? '⚔️ あなたのアタック' : '🤖 相手のアタック中...',
      p2_block:  state.playerId === 'p2' ? '🛡 あなたのブロック' : '⏳ 相手ブロック中...',
      p2_attack: state.playerId === 'p2' ? '⚔️ あなたのアタック' : '🤖 相手のアタック中...',
      p1_block:  state.playerId === 'p1' ? '🛡 あなたのブロック' : '⏳ 相手ブロック中...',
    };
    document.getElementById('phase-display').textContent = phaseLabel[state.phase] || state.phase;
    document.getElementById('round-display').textContent = `Round ${state.round}`;

    const plbl = document.getElementById('player-zone-label');
    const clbl = document.getElementById('cpu-zone-label');
    if (plbl) plbl.textContent = state.isAttacking ? '⚔️ あなたのアタックゾーン' : state.isBlocking ? '🛡 あなたのブロックゾーン' : '🃏 プレイゾーン';
    if (clbl) clbl.textContent = (!state.isMyTurn) ? '⚔️/🛡 相手のプレイゾーン' : '🃏 相手プレイゾーン';

    // ゾーン
    UI._renderZone('player-play-zone', [...state.myAttackZone, ...state.myBlockZone]);
    UI._renderZone('cpu-play-zone',    [...state.opAttackZone, ...state.opBlockZone]);

    // 手札
    const handEl = document.getElementById('player-hand');
    handEl.innerHTML = '';
    state.myHand.forEach(cardId => {
      const card = CARD_MAP[cardId];
      if (!card) return;
      const cost = card.cost;
      const canPlay = state.isMyTurn &&
        ((state.isAttacking && card.type !== 'block' && state.myPP >= cost) ||
         (state.isBlocking  && card.type === 'block' && state.myBlockPP >= cost));
      const el = UI._makeCard(card, cost, canPlay);
      if (canPlay) {
        el.onclick = () => {
          if (state.isAttacking) Online.send({ type: 'play_attack_card', cardId });
          if (state.isBlocking)  Online.send({ type: 'play_block_card',  cardId });
        };
      }
      handEl.appendChild(el);
    });

    // 相手手札（裏向き）
    UI._renderCpuHand(state.opHandCount ?? 0);

    // ボタン
    document.getElementById('btn-end-attack').disabled = !(state.isMyTurn && state.isAttacking);
    document.getElementById('btn-end-block').disabled  = !(state.isMyTurn && state.isBlocking);
    document.getElementById('btn-end-attack').onclick = () => Online.send({ type: 'end_attack' });
    document.getElementById('btn-end-block').onclick  = () => Online.send({ type: 'end_block' });

    // ログ
    document.getElementById('battle-log').innerHTML = state.log.map(l => `<div class="log-line">${l}</div>`).join('');
  },
};

// UI._bindEvents に追加するオンライン部分
const _origInit = UI.init.bind(UI);
UI.init = function() {
  _origInit();
  // オンラインボタン
  const btnOnline = document.getElementById('btn-online');
  if (btnOnline) {
    btnOnline.disabled = false;
    btnOnline.onclick = () => UI.show('online-setup');
  }
  document.getElementById('btn-create-room')?.addEventListener('click', () => Online.createRoom());
  document.getElementById('btn-join-room')?.addEventListener('click', () => {
    const code = document.getElementById('room-code-input')?.value?.trim()?.toUpperCase();
    if (code?.length === 4) Online.joinRoom(code);
    else document.getElementById('online-status').textContent = '❌ 4文字のコードを入力してください';
  });
  document.getElementById('btn-back-online')?.addEventListener('click', () => UI.show('menu'));
  document.querySelectorAll('.online-leader-option').forEach(el => {
    el.onclick = () => Online.chooseLeader(el.dataset.leader);
  });
};

window.addEventListener('DOMContentLoaded', () => UI.init());
