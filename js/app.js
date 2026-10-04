/* Pokedex XP — Windows XP / 98 style guide for Pokémon Legends: Z-A */
(function () {
  'use strict';
  var D = window.ZA_DATA, P = D.pokemon, MV = D.moves, TH_TYPE = D.tH, CHART = D.chart;
  var STAT_KEYS = ['HP', 'Atk', 'Def', 'SpA', 'SpD', 'Spe'];
  var CAT_NAME = { P: 'physical', S: 'special', T: 'status' };
  var GAMES = [
    { id: 'legends-z-a', name: 'Pokémon Legends: Z-A', ok: true },
    { id: 'sv', name: 'Pokémon Scarlet / Violet', ok: false },
    { id: 'swsh', name: 'Pokémon Sword / Shield', ok: false },
    { id: 'pla', name: 'Pokémon Legends: Arceus', ok: false }
  ];
  var BASE_BULBA = 'https://bulbapedia.bulbagarden.net/wiki/';

  /* ---------- language ---------- */
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
  /* ---------- sound (synthesised with Web Audio — no audio files, no copyrighted samples) ---------- */
  var SND = (function () {
    var ctx = null, on = lsGet('za_snd') !== '0', master = null;
    function ac() {
      if (ctx) return ctx;
      var C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
      try { ctx = new C(); master = ctx.createGain(); master.gain.value = .5; master.connect(ctx.destination); } catch (e) { ctx = null; }
      return ctx;
    }
    function tone(f, t0, d, type, vol, f2) {
      var c = ac(); if (!c) return; var o = c.createOscillator(), g = c.createGain(), t = c.currentTime + t0;
      o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || .2, t + .015); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + d + .05);
    }
    function ok() { if (!on) return false; var c = ac(); if (!c) return false; if (c.state === 'suspended') c.resume(); return c.state !== 'closed'; }
    var N = { C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, B5: 987.77, C6: 1046.5, E6: 1318.5, G6: 1568, C4: 261.63, E4: 329.63, G4: 392 };
    var S = {
      click: function () { tone(1400, 0, .05, 'square', .05, 900); },
      open: function () { tone(N.E5, 0, .09, 'triangle', .12); tone(N.A5, .07, .12, 'triangle', .12); },
      close: function () { tone(N.A5, 0, .08, 'triangle', .1); tone(N.E5, .06, .11, 'triangle', .1); },
      heart: function () { tone(N.G5, 0, .1, 'sine', .15); tone(N.C6, .08, .18, 'sine', .15); },
      unheart: function () { tone(N.C6, 0, .08, 'sine', .1); tone(N.G5, .06, .12, 'sine', .1); },
      start: function () { [[N.E5, 0, .35], [N.B5, .11, .35], [N.A5, .22, .3], [N.E6, .36, .85]].forEach(function (n) { tone(n[0], n[1], n[2], 'sine', .16); tone(n[0] * 2, n[1], n[2] * .6, 'sine', .035); }); tone(N.C4, 0, .8, 'triangle', .08); tone(N.E5, .36, .85, 'triangle', .06); tone(N.G5, .36, .85, 'triangle', .05); },
      evoOut: function () { tone(220, 0, 1.1, 'sawtooth', .06, 2200); tone(330, 0, 1.1, 'sine', .12, 3300); tone(110, 0, 1.1, 'triangle', .1, 440); for (var k = 0; k < 8; k++) tone(1000 + k * 240, .12 + k * .105, .1, 'sine', .06); },
      revOut: function () { tone(1800, 0, .95, 'sine', .11, 260); tone(900, 0, .95, 'triangle', .1, 130); for (var k = 0; k < 5; k++) tone(1900 - k * 240, .05 + k * .16, .12, 'triangle', .05); },
      revIn: function () { [N.G5, N.E5, N.C5].forEach(function (f, i) { tone(f, i * .1, .7, 'sine', .12); }); tone(N.C4, 0, .8, 'triangle', .08); tone(1500, 0, .4, 'sine', .04, 600); },
      evoIn: function () { [N.C5, N.E5, N.G5, N.C6].forEach(function (f) { tone(f, 0, 1.1, 'triangle', .13); }); tone(N.E6, .05, .9, 'sine', .1); tone(N.G6, .12, .8, 'sine', .07); tone(2400, 0, .5, 'sine', .05, 4200); }
    };
    return {
      play: function (k) { if (ok() && S[k]) S[k](); },
      isOn: function () { return on; },
      set: function (v) { on = !!v; lsSet('za_snd', on ? '1' : '0'); if (on) { ok(); S.click(); } },
      unlock: function () { if (on) ac(); },
      canAutoplay: function () { if (!on) return true; var c = ac(); return !!c && c.state === 'running'; }
    };
  })();
  var lang = 'th';
  var APP_VERSION = '0.8.1', APP_STAGE = 'Beta', APP_NAME = 'Pokedex XP', GAME_NAME = 'Pokémon Legends: Z-A';
  function B(en, th) { return lang === 'th' ? th : en; }
  function L(en, th) { return lang === 'th' ? th : en; }
  function tyName(t) { return lang === 'th' ? t + ' (' + TH_TYPE[t] + ')' : t; }
  function tyShort(t) { return lang === 'th' ? TH_TYPE[t] : t; }
  function statName(k) { return lang === 'th' ? { HP: 'HP', Atk: 'โจมตี', Def: 'ป้องกัน', SpA: 'โจมตีพิเศษ', SpD: 'ป้องกันพิเศษ', Spe: 'ความเร็ว' }[k] : { HP: 'HP', Atk: 'Attack', Def: 'Defense', SpA: 'Sp. Atk', SpD: 'Sp. Def', Spe: 'Speed' }[k]; }
  function catName(c) { return L({ P: 'Physical', S: 'Special', T: 'Status' }[c], { P: 'กายภาพ', S: 'พิเศษ', T: 'สถานะ' }[c]); }
  function roleName(r) {
    var m = { main: ['Main move', 'ท่าหลัก'], stab2: ['2nd-type main move', 'ท่าหลักธาตุที่ 2'], cover: ['Coverage move', 'ท่าครอบคลุมธาตุ'], setup: ['Power-up move', 'ท่าเสริมพลัง'], heal: ['Recovery move', 'ท่าฟื้นฟู'], screen: ['Barrier move', 'ท่ากำแพง'], status: ['Status / debuff move', 'ท่าสถานะ/ลดพลัง'], hazard: ['Hazard move', 'ท่าวางกับดัก'], filler: ['Filler move', 'ท่าเสริม'] }[r];
    return L(m[0], m[1]);
  }
  var EFFECT = {
    buffA: ['Attack +2', 'โจมตี +2 ขั้น'], buffD: ['Defense up', 'ป้องกันเพิ่ม'], buffS: ['Sp. Atk +2', 'โจมตีพิเศษ +2 ขั้น'], buffAD: ['Attack & Defense +1', 'โจมตีและป้องกัน +1'], buffSD: ['Sp. Def up', 'ป้องกันพิเศษเพิ่ม'], buffSSD: ['Sp. Atk & Sp. Def +1', 'โจมตีพิเศษและป้องกันพิเศษ +1'], buffSpe: ['Speed +2', 'ความเร็ว +2 ขั้น'], buffAS: ['Attack & Sp. Atk +1', 'โจมตีและโจมตีพิเศษ +1'], buffAll: ['Raises several stats', 'ค่าสถานะหลายอย่างเพิ่ม'], buffBig: ['Raises several stats a lot', 'เพิ่มค่าสถานะหลายอย่างอย่างแรง'],
    debuffA: ['Lowers foe Attack', 'ลดโจมตีของศัตรู'], debuffD: ['Lowers foe Defense', 'ลดป้องกันของศัตรู'], debuffS: ['Lowers foe Sp. Atk', 'ลดโจมตีพิเศษของศัตรู'], debuffSD: ['Lowers foe Sp. Def', 'ลดป้องกันพิเศษของศัตรู'], debuffSpe: ['Lowers foe Speed', 'ลดความเร็วของศัตรู'], debuffAcc: ['Lowers foe accuracy', 'ลดความแม่นยำของศัตรู'],
    paralyze: ['Paralyzes the foe', 'ทำให้ศัตรูเป็นอัมพาต'], burn: ['Burns the foe (weakens physical hits)', 'ทำให้ติดไฟ (โจมตีกายภาพลดลง)'], sleep: ['Puts the foe to sleep', 'ทำให้หลับ'], poison: ['Poisons the foe', 'ทำให้ติดพิษ'], confuse: ['Confuses the foe', 'ทำให้สับสน'], heal: ['Restores HP', 'ฟื้นฟู HP'], protect: ['Blocks attacks', 'ป้องกันการโจมตี'], screen: ['Reduces damage taken', 'ลดความเสียหายที่ได้รับ'], hazard: ['Sets a hazard', 'วางกับดักบนสนาม'], taunt: ['Forces foe to attack only', 'ยั่วให้ใช้แต่ท่าโจมตี'], switch: ['Forces / causes a switch', 'บังคับ/เปลี่ยนตัว'], misc: ['Special effect', 'ท่าพิเศษ'], evade: ['Raises evasion', 'เพิ่มหลบหลีก'], crit: ['Raises crit chance', 'เพิ่มโอกาสคริติคอล'], none: ['No effect', 'ไม่มีผล'],
    delay: ['Delayed hit', 'โจมตีหน่วงเวลา'], rc: ['Very strong, needs recovery', 'แรงมากแต่ต้องพักหลังใช้'], sd: ['Strong, lowers own stats', 'แรง แต่ลดค่าสถานะตัวเอง'], recoil: ['Strong, has recoil', 'แรง แต่ได้รับแรงสะท้อน'], ch: ['Needs charge / dodge first', 'ต้องชาร์จ/หลบก่อนโจมตี'], lo: ['Strong but can miss', 'แรงแต่พลาดได้'], sx: ['Faints the user', 'ทำลายตัวเอง'], ohko: ['KO if it hits (rarely does)', 'น็อกทันทีถ้าโดน (พลาดง่าย)'], prio: ['Fast, no wind-up', 'ออกไว ไม่มีช่วงเตรียมท่า'], drain: ['Drains HP', 'ดูด HP ศัตรูมาเติม'], weak: ['Leaves foe at 1 HP', 'ลด HP ไม่เกินเหลือ 1'], cond: ['Only works on sleeping foes', 'ใช้ได้เฉพาะศัตรูหลับ']
  };
  function effectText(mv) { var m = MV[mv], e = EFFECT[m.tag]; return e ? L(e[0], e[1]) : ''; }
  function originText(c) { if (c === 'TM') return L('TM / taught', 'TM / สอนท่า'); if (c === 'E') return L('On evolving', 'ตอนวิวัฒนาการ'); if (c === 'R') return L('Move Reminder', 'ผู้สอนท่า (Reminder)'); return L('Level ', 'เลเวล ') + c.slice(1); }
  function whyText(b, p) {
    var m = MV[b.move], t = m.type;
    switch (b.role) {
      case 'main': return L('STAB ' + t + ' move — the strongest in ' + p.en + "'s learnset (about " + m.power + ' power).', 'ท่า STAB ธาตุ' + TH_TYPE[t] + ' แรงที่สุดของ ' + p.en + ' (พลังประมาณ ' + m.power + ')');
      case 'stab2': return L('STAB from its second type (' + t + ') so one wall can’t stop it.', 'ท่า STAB ธาตุที่สอง (' + TH_TYPE[t] + ') ทำให้ไม่ติดกำแพงธาตุเดียว');
      case 'cover': var x = b.extra && b.extra.length ? b.extra.map(tyShort).join(', ') : L('types the other moves hit poorly', 'ธาตุที่ท่าอื่นตีไม่แรง'); return L('Coverage (' + t + ') — hits ' + x + ' hard.', 'ท่าครอบคลุม ธาตุ' + TH_TYPE[t] + ' — ตีได้ผลดีกับ ' + x);
      case 'setup': return L('Power-up: ' + effectText(b.move) + '. Use when safe, before attacking.', 'ท่าเสริมพลัง: ' + effectText(b.move) + ' กดตอนปลอดภัยก่อนบุก');
      case 'heal': return L('Recovery / drain to stay in the fight longer.', 'ท่าฟื้นฟู/ดูดเลือด ช่วยให้อึดขึ้น');
      case 'screen': return L('Barrier that cuts damage for the team.', 'ท่ากำแพง ลดความเสียหายที่ทั้งทีมได้รับ');
      case 'hazard': return L('Hazard for long-term advantage.', 'ท่าวางกับดัก สร้างความได้เปรียบระยะยาว');
      case 'status': return L('Status / debuff: ' + effectText(b.move), 'ท่าสถานะ/ลดพลัง: ' + effectText(b.move));
      default: return L('Filler when nothing better is available.', 'ท่าเสริมเมื่อไม่มีท่าที่ดีกว่า');
    }
  }
  var ARCH = { sweeper: ['Fast attacker', 'สายบุกเร็ว'], bulky: ['Bulky attacker', 'สายอึดตีกลาง'], tank: ['Tank / wall', 'สายถึก ตั้งรับ'], support: ['Support / status', 'สายซัพพอร์ต สถานะ'] };
  var ARCH_DESC = { sweeper: ['Hits hard and fast — wins by finishing fights before the foe can act.', 'ตีแรงและเร็ว — จบการต่อสู้ก่อนที่ศัตรูจะทันขยับ'], bulky: ['Takes a hit and hits back — balanced offence and bulk.', 'รับได้ ตีกลับได้ — สมดุลระหว่างพลังโจมตีกับความอึด'], tank: ['Soaks up damage, recovers and stalls — great for beginners who want to survive.', 'ทนทาน ฟื้นฟู และถ่วงเวลา — เหมาะกับมือใหม่ที่อยากเอาตัวรอด'], support: ['Uses status, debuffs and barriers to help the team rather than dealing damage.', 'ใช้ท่าสถานะ ลดพลังศัตรู และกำแพง ช่วยทีมมากกว่าตีเอง'] };
  var MEDAL = ['🥇', '🥈', '🥉', '▫️'], RANKTXT = ['เหมาะที่สุด', 'รองลงมา', 'เหมาะน้อย', 'ไม่ค่อยเหมาะ'];
  function natureWhy(p) {
    var n = p.nature, st = p.stats, spe = st[5], phys = p.catDom === 'P';
    if (p.arch === 'support' && n.up === 'Spe') return L('It leans on status moves and is fast (Speed ' + spe + '), so Speed is boosted — its moves come off cooldown sooner.', 'ใช้ท่าสถานะเป็นหลัก และความเร็วสูง (Spe ' + spe + ') จึงเพิ่มความเร็ว ท่าเสริม/สถานะพร้อมใช้ซ้ำเร็วขึ้น');
    if (p.arch === 'tank' || p.arch === 'support') {
      var d = n.name === 'Bold' || n.name === 'Impish';
      return L('A support / defensive Pokémon (low offense, high bulk), so it raises its better defensive stat (' + (d ? 'Defense' : 'Sp. Def') + ') and lowers the offense it doesn’t use.', 'เป็นสายซัพพอร์ต/ตั้งรับ (โจมตีต่ำ ป้องกันสูง) จึงเพิ่มค่าป้องกันที่เด่นกว่า (' + (d ? 'ป้องกัน' : 'ป้องกันพิเศษ') + ') และลดโจมตีฝั่งที่ไม่ได้ใช้');
    }
    var s = phys ? L('physical Attack', 'โจมตีกายภาพ') : L('Sp. Atk', 'โจมตีพิเศษ');
    if (spe >= 75) return L('It mainly attacks with ' + s + ' and is fast (Speed ' + spe + '). In Z-A Speed shortens move cooldowns, so Speed is boosted and the unused attack stat is lowered.', 'โจมตีฝั่ง ' + s + ' เป็นหลัก และความเร็วสูง (Spe ' + spe + ') — ใน Z-A ความเร็วช่วยลดคูลดาวน์ท่า จึงเพิ่มความเร็ว ลดโจมตีฝั่งที่ไม่ได้ใช้');
    return L('It mainly attacks with ' + s + ' but isn’t very fast (Speed ' + spe + '), so the nature boosts ' + s + ' directly for harder hits and lowers the unused attack stat.', 'โจมตีฝั่ง ' + s + ' เป็นหลัก แต่ความเร็วไม่สูง (Spe ' + spe + ') จึงเพิ่ม ' + s + ' ตรง ๆ ให้ท่าแรงที่สุด ลดโจมตีฝั่งที่ไม่ได้ใช้');
  }
  var GENDER_TXT = {
    none: ['Genderless — nothing to choose.', 'ไม่มีเพศ — ไม่ต้องเลือก'], f: ['Female only — nothing to choose.', 'มีแต่เพศเมีย — ไม่ต้องเลือก'], m: ['Male only — nothing to choose.', 'มีแต่เพศผู้ — ไม่ต้องเลือก'],
    free: ['Gender doesn’t change stats, moves or power — pick either; look at IVs and nature instead.', 'เพศไม่มีผลต่อค่าพลัง ท่า หรือความแรง — เลือกเพศไหนก็ได้ ให้ดูที่ IV และนิสัยเป็นหลัก'],
    meowstic: ['♀ recommended for attackers (gets Dark Pulse / Shadow Ball / Future Sight / Earth Power) • ♂ suits support (Taunt / Heal Block / Wish / Charm).', '♀ แนะนำสำหรับสายโจมตี (ได้ Dark Pulse / Shadow Ball / Future Sight / Earth Power) • ♂ เหมาะสายซัพพอร์ต (Taunt / Heal Block / Wish / Charm)']
  };
  var COSM = {
    Pikachu: ['♀ has a heart-shaped tail', '♀ หางเป็นรูปหัวใจ'], Meganium: ['♀ has slightly different face markings', '♀ มีลวดลายหน้าที่ต่างกันเล็กน้อย'], Alakazam: ['♂ has a longer moustache', '♂ มีหนวดเครายาว'], Kadabra: ['♂ has a longer moustache', '♂ มีหนวดเครายาว'],
    Pyroar: ['♂ has a full mane, ♀ doesn’t', '♂ มีแผงคอเต็มตัว ♀ ไม่มี'], Hippopotas: ['♂ dark brown, ♀ light pink', '♂ ผิวน้ำตาลเข้ม ♀ ผิวชมพูอ่อน'], Hippowdon: ['♂ dark brown, ♀ light pink', '♂ ผิวน้ำตาลเข้ม ♀ ผิวชมพูอ่อน'],
    Gible: ['♀ has slightly different markings', '♀ มีลวดลายต่างเล็กน้อย'], Gabite: ['♀ has slightly different markings', '♀ มีลวดลายต่างเล็กน้อย'], Garchomp: ['♀ has slightly different markings', '♀ มีลวดลายต่างเล็กน้อย'], Medicham: ['♀ has a different mouth', '♀ ปากต่างจาก ♂'], Meditite: ['♀ has a different mouth', '♀ ปากต่างจาก ♂']
  };

  /* ---------- helpers ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pad3(n) { return ('00' + n).slice(-3); }
  var NMAIN = D.nMain, EVO = D.evo, EVOIDX = D.evoIdx;
  var SECS = [
    { k: 'main', name: 'Pokédex หลัก', sub: 'Pokémon Legends: Z-A', from: 1, to: NMAIN },
    { k: 'md', name: 'Mega Dimension DLC', sub: 'ต่อจาก Pokédex หลัก', from: NMAIN + 1, to: P.length }
  ];
  function dexNo(p) { return pad3(p.no); }
  function secOf(p) { return p.sec === 'md' ? SECS[1] : SECS[0]; }
  function norm(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function tyIcon(t, cls) { return '<img class="' + (cls || 'tyi') + '" src="img/types/' + t.toLowerCase() + '.png" alt="' + t + '" title="' + tyName(t) + '">'; }
  function tyChip(t, extra) { return '<span class="tychip"><img src="img/types/' + t.toLowerCase() + '.png" alt="">' + tyName(t) + (extra || '') + '</span>'; }
  function tyRow(types) { return '<span class="tys">' + types.map(function (t) { return tyIcon(t); }).join('') + '</span>'; }
  function mvLabel(name) {
    var m = MV[name]; if (!m) return esc(name);
    return '<span class="mv"><span class="mvi"><img class="t" src="img/types/' + m.type.toLowerCase() + '.png" alt="' + m.type + '" title="' + tyName(m.type) + '"><img class="c" src="img/cat/' + CAT_NAME[m.cat] + '.svg" alt="' + catName(m.cat) + '" title="' + catName(m.cat) + '"></span><span class="mvn">' + esc(name) + '</span></span>';
  }
  var ART_URL = 'https://img.pokemondb.net/artwork/large/', HAVE_MEGA = {'abomasnow-mega':1,'absol-mega':1,'absol-mega-z':1,'aerodactyl-mega':1,'aggron-mega':1,'alakazam-mega':1,'altaria-mega':1,'ampharos-mega':1,'audino-mega':1,'banette-mega':1,'barbaracle-mega':1,'baxcalibur-mega':1,'beedrill-mega':1,'blastoise-mega':1,'blaziken-mega':1,'camerupt-mega':1,'chandelure-mega':1,'charizard-mega-x':1,'charizard-mega-y':1,'chesnaught-mega':1,'chimecho-mega':1,'clefable-mega':1,'crabominable-mega':1,'darkrai-mega':1,'delphox-mega':1,'diancie-mega':1,'dragalge-mega':1,'dragonite-mega':1,'drampa-mega':1,'eelektross-mega':1,'emboar-mega':1,'excadrill-mega':1,'falinks-mega':1,'feraligatr-mega':1,'floette-mega':1,'froslass-mega':1,'gallade-mega':1,'garchomp-mega':1,'garchomp-mega-z':1,'gardevoir-mega':1,'gengar-mega':1,'glalie-mega':1,'glimmora-mega':1,'golisopod-mega':1,'golurk-mega':1,'greninja-mega':1,'gyarados-mega':1,'hawlucha-mega':1,'heatran-mega':1,'heracross-mega':1,'houndoom-mega':1,'kangaskhan-mega':1,'latias-mega':1,'latios-mega':1,'lopunny-mega':1,'lucario-mega':1,'lucario-mega-z':1,'magearna-mega':1,'magearna-original-mega':1,'malamar-mega':1,'manectric-mega':1,'mawile-mega':1,'medicham-mega':1,'meganium-mega':1,'meowstic-female-mega':1,'meowstic-male-mega':1,'metagross-mega':1,'mewtwo-mega-x':1,'mewtwo-mega-y':1,'pidgeot-mega':1,'pinsir-mega':1,'pyroar-mega':1,'raichu-mega-x':1,'raichu-mega-y':1,'rayquaza-mega':1,'sableye-mega':1,'salamence-mega':1,'sceptile-mega':1,'scizor-mega':1,'scolipede-mega':1,'scovillain-mega':1,'scrafty-mega':1,'sharpedo-mega':1,'skarmory-mega':1,'slowbro-mega':1,'staraptor-mega':1,'starmie-mega':1,'steelix-mega':1,'swampert-mega':1,'tatsugiri-curly-mega':1,'tatsugiri-droopy-mega':1,'tatsugiri-stretchy-mega':1,'tyranitar-mega':1,'venusaur-mega':1,'victreebel-mega':1,'zeraora-mega':1,'zygarde-mega':1};
  var HAVE_F = { meowstic: 1 };
  var PH = '<span class=ph9>?</span>';
  /* sprite: Sugimori artwork stored in img/mon (trimmed, scaled to fit and centred in a square) */
  function sprite(p, box) {
    var k = Math.round(box * 0.84);
    return '<span class="spb" style="width:' + box + 'px;height:' + box + 'px"><img src="img/mon/' + p.slug + '.webp" alt="' + esc(p.en) + '" style="width:' + k + 'px;height:' + k + 'px" onerror="this.parentNode.innerHTML=\'' + PH + '\'"></span>';
  }
  /* mega artwork: local Sugimori art when we have it, otherwise pokemondb official artwork (JPG), otherwise "?" */
  function megaArt(slug, box, alt) {
    var k = Math.round(box * (0.84)), loc = HAVE_MEGA[slug];
    return '<span class="spb' + (loc ? '' : ' art') + '" style="width:' + box + 'px;height:' + box + 'px"><img src="' + (loc ? 'img/mega/' + slug + '.webp' : 'img/mega/' + slug + '.jpg') + '" data-r="' + ART_URL + slug + '.jpg" alt="' + esc(alt || '') + '" style="width:' + (loc ? k : box) + 'px;height:' + (loc ? k : box) + 'px" referrerpolicy="no-referrer" onload="zaTrim(this)" onerror="zaArt(this)"></span>';
  }
  /* trim white margins of JPG artwork and re-centre it (same 84% fit as local sprites) */
  window.zaTrim = function (img) {
    if (img.dataset.t || !img.parentNode.classList.contains('art')) return;
    img.dataset.t = 1;
    try {
      var w = img.naturalWidth, h = img.naturalHeight, c = document.createElement('canvas'), x, y, d, i, a = w, b = h, e = -1, f = -1;
      c.width = w; c.height = h; var g = c.getContext('2d'); g.drawImage(img, 0, 0);
      d = g.getImageData(0, 0, w, h).data;
      for (y = 0; y < h; y++) for (x = 0; x < w; x++) { i = (y * w + x) * 4; if (d[i + 3] > 20 && (d[i] < 238 || d[i + 1] < 238 || d[i + 2] < 238)) { if (x < a) a = x; if (x > e) e = x; if (y < b) b = y; if (y > f) f = y; } }
      if (e < a || f < b) return;
      var cw = e - a + 1, ch = f - b + 1, S = 320, r = Math.min(S * 0.96 / cw, S * 0.96 / ch), o = document.createElement('canvas'); o.width = o.height = S;
      var q = o.getContext('2d'); q.fillStyle = '#fff'; q.fillRect(0, 0, S, S);
      q.drawImage(c, a, b, cw, ch, (S - cw * r) / 2, (S - ch * r) / 2, cw * r, ch * r);
      var u = o.toDataURL('image/png'); img.style.width = img.style.height = Math.round(img.parentNode.offsetWidth * 0.9) + 'px'; img.src = u;
    } catch (er) { /* cross-origin without CORS: keep object-fit:contain */ }
  };
  /* mega art fallback: local webp -> local jpg (tools/fetch_art.py) -> pokemondb -> "?" */
  window.zaArt = function (img) {
    if (img.dataset.r && img.src.indexOf('img.pokemondb.net') < 0) { img.style.width = img.style.height = '100%'; img.parentNode.classList.add('art'); img.crossOrigin = 'anonymous'; img.src = img.dataset.r; img.dataset.r = ''; img.dataset.c = 1; return; }
    if (img.dataset.c === '1') { img.dataset.c = 2; img.removeAttribute('crossorigin'); var u2 = img.src; img.src = ''; img.src = u2; return; }
    img.parentNode.innerHTML = PH;
  };
  function byId(id) { return P[id - 1]; }
  function bulba(p) { return BASE_BULBA + encodeURIComponent(p.en.replace(/ /g, '_')) + '_(Pok%C3%A9mon)'; }
  function pdb(p) { return 'https://pokemondb.net/pokedex/' + p.slug; }
  function mult2txt(m) { return m === 4 ? '×4' : m === 2 ? '×2' : m === 0.5 ? '×½' : m === 0.25 ? '×¼' : m === 0 ? '×0' : '×' + m; }

  /* ---------- window manager ---------- */
  var desktop = $('#desktop'), tasksEl = $('#tasks');
  var wins = {}, zTop = 100, activeId = null, cascade = 0;
  function isMobile() { return window.innerWidth <= 760; }

  function openWin(o) {
    if (wins[o.id]) { focus(o.id); return wins[o.id]; }
    SND.play('open');
    var el = document.createElement('section');
    el.className = 'win';
    el.setAttribute('role', 'dialog');
    el.innerHTML = '<div class="titlebar"><img class="ti" src="' + (o.icon || 'img/ico_pokedex.png') + '" alt=""><span class="tt"></span>' +
      '<button class="tbtn mn" aria-label="Minimize" title="Minimize">_</button><button class="tbtn mx" aria-label="Maximize" title="Maximize">□</button><button class="tbtn x" aria-label="Close" title="Close">✕</button></div>' +
      '<div class="wbody"></div><div class="statusbar"></div>';
    var w = { id: o.id, el: el, o: o, icon: o.icon || 'img/ico_pokedex.png' };
    w.body = $('.wbody', el); w.status = $('.statusbar', el);
    w.setTitle = function (t) { w.title = t; $('.tt', el).textContent = t; el.setAttribute('aria-label', t); updateTask(w); };
    w.setStatus = function (h) { w.status.innerHTML = h; };
    w.setTitle(typeof o.title === 'function' ? o.title() : o.title);
    desktop.appendChild(el);
    var dw = desktop.clientWidth, dh = desktop.clientHeight;
    var ww = Math.min(940, dw - 20), hh = Math.min(780, dh - 12);
    el.style.width = ww + 'px'; el.style.height = hh + 'px';
    el.style.left = Math.max(4, (dw - ww) / 2 + (cascade % 5) * 22 - 44) + 'px';
    el.style.top = Math.max(4, (dh - hh) / 2 + (cascade % 5) * 18 - 36) + 'px';
    cascade++;
    if (o.max) el.classList.add('max');
    wins[o.id] = w;
    makeTask(w);
    $('.mn', el).onclick = function (e) { e.stopPropagation(); minimize(w.id); };
    $('.mx', el).onclick = function (e) { e.stopPropagation(); el.classList.toggle('max'); focus(w.id); };
    $('.x', el).onclick = function (e) { e.stopPropagation(); closeWin(w.id); };
    $('.titlebar', el).addEventListener('dblclick', function (e) { if (!isMobile() && !e.target.closest('.tbtn')) el.classList.toggle('max'); });
    el.addEventListener('pointerdown', function () { focus(w.id); });
    drag(w);
    o.render(w);
    focus(w.id);
    return w;
  }
  function rerender(w) {
    var nb = w.body.cloneNode(false), ns = w.status.cloneNode(false);
    w.body.replaceWith(nb); w.status.replaceWith(ns); w.body = nb; w.status = ns;
    w.setTitle(typeof w.o.title === 'function' ? w.o.title() : w.o.title);
    w.o.render(w);
  }
  function drag(w) {
    var tb = $('.titlebar', w.el), sx, sy, ox, oy, on = false;
    tb.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.tbtn') || isMobile() || w.el.classList.contains('max')) return;
      on = true; sx = e.clientX; sy = e.clientY; ox = w.el.offsetLeft; oy = w.el.offsetTop; tb.setPointerCapture(e.pointerId);
    });
    tb.addEventListener('pointermove', function (e) {
      if (!on) return;
      w.el.style.left = Math.min(Math.max(ox + e.clientX - sx, 60 - w.el.offsetWidth), desktop.clientWidth - 60) + 'px';
      w.el.style.top = Math.min(Math.max(oy + e.clientY - sy, 0), desktop.clientHeight - 30) + 'px';
    });
    function end() { on = false; }
    tb.addEventListener('pointerup', end); tb.addEventListener('pointercancel', end);
  }
  function topVisible() { return Object.keys(wins).filter(function (k) { return !wins[k].el.classList.contains('min'); }).sort(function (a, b) { return wins[b].el.style.zIndex - wins[a].el.style.zIndex; })[0]; }
  function focus(id) {
    var w = wins[id]; if (!w) return;
    w.el.classList.remove('min'); w.el.style.zIndex = ++zTop; activeId = id;
    Object.keys(wins).forEach(function (k) { wins[k].el.classList.toggle('active', k === id); });
    refreshTasks();
  }
  function minimize(id) {
    var w = wins[id]; if (!w) return; w.el.classList.add('min'); w.el.classList.remove('active');
    if (activeId === id) { activeId = null; var n = topVisible(); if (n) focus(n); }
    refreshTasks();
  }
  function closeWin(id) {
    var w = wins[id]; if (!w) return; SND.play('close'); w.el.remove(); w.task.remove(); delete wins[id];
    if (activeId === id) { activeId = null; var n = topVisible(); if (n) focus(n); }
    if (id.indexOf('mon-') === 0 && location.hash.indexOf('#/mon/') === 0) history.replaceState(null, '', location.pathname + location.search);
    refreshTasks();
  }
  function makeTask(w) {
    var b = document.createElement('button'); b.className = 'task'; b.setAttribute('role', 'listitem');
    b.innerHTML = '<img src="' + w.icon + '" alt=""><span class="lab"><i></i></span>';
    b.onclick = function () { if (activeId === w.id && !w.el.classList.contains('min')) minimize(w.id); else focus(w.id); };
    tasksEl.appendChild(b); w.task = b; updateTask(w);
  }
  function updateTask(w) { if (w.task) { $('i', w.task).textContent = w.title; w.task.title = w.title; marq(); } }
  function refreshTasks() { Object.keys(wins).forEach(function (k) { var w = wins[k]; w.task.classList.toggle('active', k === activeId && !w.el.classList.contains('min')); }); marq(); }
  /* scrolling "marquee" for task labels that don't fit */
  var marqT;
  function marq() {
    clearTimeout(marqT);
    marqT = setTimeout(function () {
      Object.keys(wins).forEach(function (k) {
        var t = wins[k].task, lab = $('.lab', t), i = $('i', t);
        t.classList.remove('marq'); t.style.removeProperty('--d');
        var diff = i.scrollWidth - lab.clientWidth;
        if (diff > 2) { t.style.setProperty('--d', diff + 'px'); t.style.setProperty('--t', Math.max(4, diff / 22) + 's'); t.classList.add('marq'); }
      });
    }, 30);
  }
  window.addEventListener('resize', marq);

  /* ---------- favourites ---------- */
  var favs = (function () { try { var a = JSON.parse(lsGet('za_fav') || '[]'); return Array.isArray(a) ? a.filter(function (x) { return typeof x === 'number' && byId(x); }) : []; } catch (e) { return []; } })();
  function isFav(id) { return favs.indexOf(id) >= 0; }
  function heartBtn(id, cls) { var on = isFav(id); return '<button type="button" class="heart ' + cls + (on ? ' on' : '') + '" data-id="' + id + '" aria-pressed="' + on + '" title="' + (on ? 'นำออกจากรายการโปรด' : 'เพิ่มในรายการโปรด') + '">' + (on ? 'ถูกใจ' : 'ไม่ได้ถูกใจ') + '</button>'; }
  function toggleFav(id) {
    var i = favs.indexOf(id); if (i >= 0) favs.splice(i, 1); else favs.push(id); SND.play(i >= 0 ? 'unheart' : 'heart');
    lsSet('za_fav', JSON.stringify(favs));
    [].forEach.call(document.querySelectorAll('.heart[data-id="' + id + '"]'), function (el) {
      var on = isFav(id); el.classList.toggle('on', on); el.setAttribute('aria-pressed', on); el.textContent = on ? 'ถูกใจ' : 'ไม่ได้ถูกใจ'; el.title = on ? 'นำออกจากรายการโปรด' : 'เพิ่มในรายการโปรด';
    });
    if (wins.favs) rerender(wins.favs);
    updateFavCount();
  }
  function updateFavCount() { var el = $('#favbtn'); if (el) { el.innerHTML = '<i class="ph' + (favs.length ? ' on' : '') + '"></i>' + favs.length; } }
  function fitLine(p, sel) { return sel ? '<span class="fit">' + p.builds[sel].fit + '% · อันดับ ' + (p.rank.indexOf(sel) + 1) + '</span>' : ''; }
  function cardHTML(p, sel) {
    return '<div class="cw"><button class="card" role="listitem" data-id="' + p.id + '" aria-label="' + esc(p.en) + '"><span class="sp">' + sprite(p, 92) + '</span><span class="no">#' + dexNo(p) + (p.sec === 'md' ? ' · DLC' : '') + '</span>' +
      '<span class="jp">' + esc(p.jp) + '</span><span class="en">' + esc(p.romaji) + '</span><span class="enn">(' + esc(p.en) + ')</span>' + tyRow(p.types) + fitLine(p, sel) + '</button>' + heartBtn(p.id, 'hc') + '</div>';
  }
  function gridClick(e) {
    var h = e.target.closest('.heart'); if (h) { toggleFav(+h.dataset.id); return; }
    var sh = e.target.closest('.sech[data-sec]'); if (sh) { toggleSec(sh); return; }
    var c = e.target.closest('.card'); if (c) openMon(+c.dataset.id);
  }
  function toggleSec(sh) {
    var on = !sh.classList.contains('collapsed'); sh.classList.toggle('collapsed', on); sh.setAttribute('aria-expanded', on ? 'false' : 'true');
    dexState.col[sh.dataset.sec] = on ? 1 : 0;
    var g = sh.nextElementSibling; if (g && g.classList.contains('grid')) g.hidden = on;
  }
  function openFavs() {
    openWin({ id: 'favs', title: function () { return 'รายการโปรด'; }, icon: ico('favs'), w: 920, h: 600, render: function (w) {
      var list = favs.map(byId).sort(function (a, b) { return a.id - b.id; });
      w.body.innerHTML = list.length ? '<div class="note">กดปุ่มหัวใจที่การ์ดเพื่อนำออกจากรายการโปรด · ข้อมูลเก็บไว้ในเบราว์เซอร์นี้ (รีโหลดแล้วไม่หาย)</div><div class="grid" role="list">' + list.map(function (p) { return cardHTML(p); }).join('') + '</div>'
        : '<div class="empty"><div><span class="heart" style="display:inline-block;width:52px;height:48px"></span></div><b>ยังไม่มีรายการโปรด</b><br>กดปุ่มหัวใจที่การ์ดโปเกมอนในหน้า Pokédex หรือในหน้ารายละเอียด เพื่อเก็บไว้ที่นี่</div>';
      w.body.addEventListener('click', gridClick);
      w.setStatus('<span>โปเกมอนที่ชอบ ' + list.length + ' ตัว</span>');
    } });
  }

  /* ---------- Pokédex window ---------- */
  var dexState = { q: '', type: '', build: '', sort: 'dex', col: {} };
  function openDex() {
    openWin({
      id: 'dex', title: function () { return 'Pokédex — ' + GAME_NAME; }, icon: ico('dex'), max: true, w: 1000, h: 640,
      render: function (w) {
        var typeOpts = '<option value="">' + L('All types', 'ทุกธาตุ') + '</option>' + D.types.map(function (t) { return '<option value="' + t + '">' + tyName(t) + '</option>'; }).join('');
        w.body.innerHTML =
          '<div id="welcome" class="note" style="display:none"><b>' + L('👋 New here?', '👋 มือใหม่ใช่ไหม?') + '</b> ' + 'กดที่โปเกมอนตัวไหนก็ได้เพื่อดู <b>นิสัย • เพศ • วิวัฒนาการ • ท่า 4 ท่า + ปุ่ม A/B/X/Y • ท่าที่เรียนได้ทั้งหมด • ธาตุแพ้/ชนะ • การเทรน IV/EV</b> · เลื่อนลงไปดู <b>Mega Dimension DLC</b> ต่อจาก Pokédex หลัก ' +
          '<button class="btn" data-open="guide">' + '📘 ' + B('Beginner Guide', 'คู่มือมือใหม่') + '</button> <button class="btn" id="wx">' + L('Dismiss', 'ปิดข้อความนี้') + '</button></div>' +
          '<div class="toolbar"><label class="grow"><span style="position:absolute;left:-9999px">' + L('Search', 'ค้นหา') + '</span><input type="search" id="q" placeholder="' + L('🔍 Search: Japanese / English / romaji / number, e.g. ピカチュウ, pika, 25', '🔍 ค้นหา: ชื่อญี่ปุ่น / อังกฤษ / โรมาจิ / เลข เช่น ピカチュウ, pika, 25') + '" style="width:100%" autocomplete="off"></label>' +
          '<select id="fb" aria-label="กรองตามสายการเล่น"><option value="">' + L('All play styles', 'ทุกสายการเล่น') + '</option>' + ['sweeper', 'bulky', 'tank', 'support'].map(function (k) { return '<option value="' + k + '">' + L('Best fit: ', 'เหมาะกับ: ') + L(ARCH[k][0], ARCH[k][1]) + '</option>'; }).join('') + '</select>' +
          '<select id="ft" aria-label=""' + L('Filter by type', 'กรองตามธาตุ') + '">' + typeOpts + '</select>' +
          '<select id="so" aria-label="' + L('Sort', 'เรียงลำดับ') + '"><option value="dex">' + L('Sort: Pokédex order', 'เรียง: ลำดับ Pokédex') + '</option><option value="en">' + L('Sort: English name A–Z', 'เรียง: ชื่ออังกฤษ A–Z') + '</option><option value="bst">' + L('Sort: highest total stats', 'เรียง: ค่าพลังรวมสูงสุด') + '</option><option value="spe">' + L('Sort: fastest', 'เรียง: ความเร็วสูงสุด') + '</option><option value="fit">' + L('Sort: best fit for chosen style', 'เรียง: เหมาะกับสายที่เลือกที่สุด') + '</option></select></div>' +
          '<div class="secnav" id="secnav"></div><div id="grid" role="list"></div>';
        if (!lsGet('za_welcome_seen')) $('#welcome', w.body).style.display = 'block';
        $('#wx', w.body).onclick = function () { $('#welcome', w.body).style.display = 'none'; lsSet('za_welcome_seen', '1'); };
        var q = $('#q', w.body), ft = $('#ft', w.body), fb = $('#fb', w.body), so = $('#so', w.body), grid = $('#grid', w.body);
        q.value = dexState.q; ft.value = dexState.type; fb.value = dexState.build; so.value = dexState.sort;
        function draw() {
          dexState.q = q.value; dexState.type = ft.value; dexState.build = fb.value; dexState.sort = so.value;
          var s = norm(q.value.trim().replace(/^#/, ''));
          var list = P.filter(function (p) {
            if (dexState.type && p.types.indexOf(dexState.type) < 0) return false;
            if (dexState.build && p.rank[0] !== dexState.build && p.rank[1] !== dexState.build) return false;
            if (!s) return true;
            return norm(p.en).indexOf(s) >= 0 || norm(p.romaji).indexOf(s) >= 0 || p.jp.indexOf(q.value.trim()) >= 0 || String(p.no) === s || pad3(p.no) === s;
          });
          var sorters = { dex: function (a, b) { return a.id - b.id; }, en: function (a, b) { return a.en.localeCompare(b.en); }, bst: function (a, b) { return b.bst - a.bst || a.id - b.id; }, spe: function (a, b) { return b.stats[5] - a.stats[5] || a.id - b.id; }, fit: function (a, b) { var k = dexState.build; return k ? b.builds[k].fit - a.builds[k].fit || a.id - b.id : a.id - b.id; } };
          list.sort(sorters[dexState.sort]);
          var html = '', nav = '';
          SECS.forEach(function (sc) {
            var part = list.filter(function (p) { return p.sec === sc.k; }), tot = sc.to - sc.from + 1;
            nav += '<button class="btn" data-jump="' + sc.k + '"' + (part.length ? '' : ' disabled') + '>' + (sc.k === 'md' ? '✨ ' : '📖 ') + sc.name + ' <b>' + part.length + (part.length === tot ? '' : '/' + tot) + '</b></button>';
            if (!part.length) return;
            var cl = dexState.col[sc.k]; html += '<div class="sech' + (cl ? ' collapsed' : '') + '" id="sec-' + sc.k + '" data-sec="' + sc.k + '" role="button" tabindex="0" aria-expanded="' + (cl ? 'false' : 'true') + '" title="กดเพื่อหุบ/เปิด"><span class="shc">▾</span><span class="shn">' + (sc.k === 'md' ? '✨ ' : '📖 ') + sc.name + '</span><span class="shs">' + sc.sub + ' · ' + part.length + (part.length === tot ? '' : ' / ' + tot) + ' ตัว</span></div><div class="grid"' + (cl ? ' hidden' : '') + '>' + part.map(function (p) { return cardHTML(p, dexState.build); }).join('') + '</div>';
          });
          $('#secnav', w.body).innerHTML = nav;
          grid.innerHTML = list.length ? html : '<div class="empty">ไม่พบโปเกมอนที่ตรงกับ “' + esc(q.value) + '”</div>';
          w.setStatus('<span>แสดง ' + list.length + ' / ' + P.length + ' ตัว</span><span style="margin-left:auto">เวอร์ชันเกม: ' + GAME_NAME + '</span>');
        }
        q.addEventListener('input', draw); ft.addEventListener('change', draw); so.addEventListener('change', draw);
        fb.addEventListener('change', function () { if (fb.value) so.value = 'fit'; else if (so.value === 'fit') so.value = 'dex'; draw(); });
        grid.addEventListener('click', gridClick);
        grid.addEventListener('keydown', function (e) { var sh = e.target.closest && e.target.closest('.sech[data-sec]'); if (sh && e.target === sh && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggleSec(sh); } });
        w.body.addEventListener('click', function (e) {
          var b = e.target.closest('[data-open]'); if (b) { openApp(b.dataset.open); return; }
          var j = e.target.closest('[data-jump]'); if (j) { var t = $('#sec-' + j.dataset.jump, w.body); if (t) w.body.scrollTop = t.offsetTop - w.body.offsetTop - ($('.toolbar', w.body) ? 0 : 0); }
        });
        draw();
      }
    });
  }

  /* ---------- Pokémon detail window ---------- */
  function findMega(p, slug) { var r = null; (function walk(n) { if (n.mega && n.s === slug) r = n; n.c.forEach(walk); })(EVO[EVOIDX[p.id]]); return r; }
  function megaMatch(types) {
    var weak = [], resist = [], immune = [], st = {};
    D.types.forEach(function (a) { var m = 1; types.forEach(function (t) { m *= CHART[a][t]; }); if (m > 1) weak.push({ type: a, mult: m }); else if (m === 0) immune.push(a); else if (m < 1) resist.push({ type: a, mult: m }); });
    types.forEach(function (t) { D.types.forEach(function (d) { if (CHART[t][d] === 2) st[d] = 1; }); });
    return { weak: weak, resist: resist, immune: immune, strongStab: D.types.filter(function (d) { return st[d]; }) };
  }
  function megaBanner(mg, p) {
    if (!mg) return '';
    var abil = mg.ab && mg.ab.length ? mg.ab.join(' / ') : '—';
    return '<div class="note megab"><b>🔶 กำลังดูร่าง ' + esc(mg.n) + '</b> · ธาตุ ' + mg.ty.map(tyShort).join(' / ') + ' · ความสามารถ: <b>' + esc(abil) + '</b> · ค่าพลังรวม ' + mg.st.reduce(function (a, b) { return a + b; }, 0) + ' (ร่างปกติ ' + (p.baseStats ? p.baseStats.reduce(function (a, b) { return a + b; }, 0) : p.bst) + ')<br><small>ค่าพลัง ธาตุ และตารางแพ้/ชนะ แสดงตามร่าง Mega · นิสัย เพศ ท่า และแผน IV/EV ใช้ของร่างปกติ</small></div>';
  }
  function statBars(p) {
    var D4 = !!p.baseStats;
    return p.stats.map(function (v, i) {
      var pct = Math.min(100, Math.round(v / 160 * 100)), col = v >= 120 ? '#2e9d4a' : v >= 90 ? '#7cb82f' : v >= 60 ? '#e6b800' : '#e0662b';
      var dl = D4 ? v - p.baseStats[i] : 0, dtx = D4 ? '<span class="dl" style="color:' + (dl > 0 ? '#2e9d4a' : '#c0392b') + '">' + (dl ? (dl > 0 ? '+' : '') + dl : '') + '</span>' : '';
      return '<div class="stat d"><span>' + statName(STAT_KEYS[i]) + '</span><b>' + v + '</b>' + (dtx || '<span class="dl"></span>') + '<div class="bar"><i style="width:' + pct + '%;background:' + col + '"></i></div></div>';
    }).join('') + '<div class="stat d"><span>' + L('Total', 'รวม') + '</span><b>' + p.bst + '</b>' + (D4 ? '<span class="dl" style="color:#2e9d4a">+' + (p.bst - p.baseStats.reduce(function (a, b) { return a + b; }, 0)) + '</span>' : '<span class="dl"></span>') + '<span></span></div>';
  }
  function megaCounters(p, mg, mm) {
    var own = {}; p.ls.lv.forEach(function (x) { own[x[1]] = 1; }); p.ls.tm.forEach(function (x) { own[x] = 1; });
    var atk = mg.st[1], spa = mg.st[3], mx = Math.max(atk, spa);
    return mm.weak.slice().sort(function (a, b) { return b.mult - a.mult; }).map(function (w) {
      var l = Object.keys(own).filter(function (k) { var m = MV[k]; return m && m.cat !== 'T' && ['sx', 'ohko', 'weak'].indexOf(m.tag) < 0 && CHART[m.type][w.type] === 2; }).map(function (k) {
        var m = MV[k], f = TAGF[m.tag]; f = f === undefined ? 1 : f;
        return { k: k, s: m.power * f * (mg.ty.indexOf(m.type) >= 0 ? 1.5 : 1) * (m.cat === 'P' ? atk : spa) / mx };
      }).sort(function (a, b) { return b.s - a.s; }).slice(0, 3);
      return { type: w.type, mult: w.mult, ownMoves: l.map(function (x) { return x.k; }), counterTypes: D.types.filter(function (t) { return CHART[t][w.type] === 2; }) };
    });
  }
  function megaList(p) { var r = []; (function walk(n, par) { if (n.mega && par && par.i === p.id) r.push(n); n.c.forEach(function (c) { walk(c, n); }); })(EVO[EVOIDX[p.id]], null); return r; }
  function megaBar(p, mg) {
    var l = megaList(p); if (!l.length) return '';
    return '<div class="megabox"><div class="bl">🔶 Mega Evolution — กดเพื่อดูค่าพลัง ธาตุ และตารางแพ้/ชนะของร่าง Mega</div><div class="mgs">' + l.map(function (m) { return '<button type="button" class="btn mgb' + (mg && mg.s === m.s ? ' on' : '') + '" data-mega="' + m.s + '">' + esc(m.jp) + ' <small>' + esc(m.n) + '</small></button>'; }).join('') + (mg ? '<button type="button" class="btn" data-mega-off="1">↩ กลับร่างปกติ</button>' : '') + '</div></div>';
  }
  function tabOverview(p) {
    var n = p.nature, g = p.gender, gt = GENDER_TXT[g.kind], cs = COSM[g.cosmetic];
    return '<div class="cols"><div><div class="group"><span class="gt">' + L('Base stats', 'ค่าพลังพื้นฐาน') + '</span>' + statBars(p) + '</div>' +
      '<div class="note">' + L('Role: ', 'ประเภท: ') + '<b>' + L(ARCH[p.arch][0], ARCH[p.arch][1]) + '</b> · ' + L('mainly hits with ', 'ตีหลักด้วย') + '<b>' + (p.catDom === 'P' ? L('physical moves', 'ท่ากายภาพ') : L('special moves', 'ท่าพิเศษ')) + '</b></div>' + megaBanner(p.mega, p) + '</div>' +
      '<div><div class="group"><span class="gt">' + L('⭐ Best nature', '⭐ นิสัยที่ดีที่สุด') + '</span><div style="font-size:20px;font-weight:700">' + n.name + '</div>' +
      '<div style="margin:4px 0"><span class="chipw up">▲ ' + L('Raises ', 'เพิ่ม ') + statName(n.up) + '</span><span class="chipw dn">▼ ' + L('Lowers ', 'ลด ') + statName(n.down) + '</span></div>' +
      '<p style="margin:4px 0">' + esc(natureWhy(p)) + '</p>' +
      '<div class="note">' + L('💡 Got a different nature? Use a <b>Mint</b> to change the nature’s <i>effect</i> to ' + n.name + ' (shop locations in the <a href="#/iv" data-open="iv">IV/EV guide</a>).', '💡 ได้นิสัยอื่นมาก็ไม่ต้องเริ่มใหม่ — ใช้ <b>Mint</b> เปลี่ยน “ผลของนิสัย” เป็น ' + n.name + ' ได้ (ดูที่ซื้อใน <a href="#/iv" data-open="iv">คู่มือ IV/EV</a>)') + '</div></div>' +
      '<div class="group"><span class="gt">' + L('⚥ Best gender', '⚥ เพศที่ดีที่สุด') + '</span><b>' + esc(g.ratio === 'genderless' ? L('Genderless', 'ไม่มีเพศ') : g.ratio) + '</b><p style="margin:4px 0">' + esc(L(gt[0], gt[1])) + '</p>' +
      (cs ? '<p style="margin:4px 0;color:#444">' + L('Looks: ', 'รูปลักษณ์: ') + esc(L(cs[0], cs[1])) + '</p>' : '') + '</div></div></div>';
  }
  function padSlot(b) {
    var m = MV[b.move];
    return '<div class="btnslot ' + b.slot.toLowerCase() + '"><span class="slotb">' + b.slot + '</span><b>' + mvLabel(b.move) + '</b><span style="color:#555">' + roleName(b.role) + (m.power ? ' · ' + L('Pow ', 'พลัง ') + m.power : '') + '</span></div>';
  }
  function moveTable(set, p) {
    if (!set.length) return '<div class="empty">' + L('Too few moves available for a backup set.', 'มีท่าให้เลือกน้อยเกินไป ไม่มีชุดสำรอง') + '</div>';
    return '<div class="tablewrap"><table class="t"><thead><tr><th>' + L('Btn', 'ปุ่ม') + '</th><th>' + L('Move', 'ท่า') + '</th><th>' + L('Type / power', 'หมวด/พลัง') + '</th><th>' + L('Role & why', 'บทบาท & เหตุผล') + '</th><th>' + L('Learned from', 'เรียนจาก') + '</th></tr></thead><tbody>' +
      set.map(function (b) {
        var m = MV[b.move];
        return '<tr><td><span class="slotb">' + b.slot + '</span></td><td>' + mvLabel(b.move) + '</td><td>' + catName(m.cat) + (m.power ? ' / ' + m.power : '') + '<br><small>' + esc(effectText(b.move)) + '</small></td>' +
          '<td><b>' + roleName(b.role) + '</b><br>' + esc(whyText(b, p)) + '</td><td>' + esc(originText(b.origin)) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }
  function tabMoves(p) {
    var pad = { x: '', y: '', a: '', b: '' };
    p.best.forEach(function (b) { pad[b.slot.toLowerCase()] = padSlot(b); });
    function cell(k) { return pad[k] || '<div class="btnslot ' + k + '"><span class="slotb">' + k.toUpperCase() + '</span><span style="color:#777">—</span></div>'; }
    return '<div class="group"><span class="gt">' + L('🎮 Best 4 moves (all move types) — placed on the buttons', '🎮 ชุดท่าดีที่สุด 4 ท่า (นับทุกประเภท) — วางบนปุ่ม') + ' · ' + L(ARCH[p.arch][0], ARCH[p.arch][1]) + '</span>' +
      '<div class="pad">' + cell('x') + cell('y') + '<div class="mid">' + L('Nintendo<br>Switch layout', 'แบบเครื่อง<br>Switch') + '</div>' + cell('a') + cell('b') + '</div>' + moveTable(p.best, p) +
      '<div class="note">' + L('<b>Button logic:</b> <b>A</b> = main move you press most · <b>X</b> = 2nd attack / coverage · <b>Y</b> = power-up (press when safe) · <b>B</b> = recovery / status / extra coverage (press when needed). This is a suggestion — the game lets you reassign moves.', '<b>หลักการจัดปุ่ม:</b> <b>A</b> = ท่าหลักที่กดบ่อยสุด · <b>X</b> = ท่าตีตัวที่ 2/ครอบคลุม · <b>Y</b> = ท่าเสริมพลัง (กดตอนปลอดภัย) · <b>B</b> = ท่ารับมือ/สถานะ/ครอบคลุมเสริม (กดเมื่อจำเป็น) — เป็นข้อเสนอแนะ เกมให้สลับท่าได้') + '</div></div>' +
      '<div class="group"><span class="gt">' + L('🔁 Backup 4 moves (if you can’t get the first set)', '🔁 ชุดสำรอง 4 ท่า (ถ้าไม่มีชุดแรก)') + '</span>' + moveTable(p.backup, p) + '</div>';
  }
  function tabMatch(p) {
    var w4 = p.weak.filter(function (x) { return x.mult >= 4; }), w2 = p.weak.filter(function (x) { return x.mult === 2; });
    var chips = function (arr, f) { return arr.length ? arr.map(f).join(' ') : '<span style="color:#666">—</span>'; };
    var res = p.resist.map(function (x) { return tyChip(x.type, ' <b>' + mult2txt(x.mult) + '</b>'); });
    var out = '<div class="cols"><div class="group"><span class="gt">' + L('❌ Weak to (takes extra damage)', '❌ แพ้ธาตุ (โดนแรง)') + '</span>' +
      (w4.length ? '<div><b style="color:#c0392b">×4 ' + L('very dangerous', 'อันตรายมาก') + '</b><br>' + chips(w4, function (x) { return tyChip(x.type); }) + '</div>' : '') +
      '<div style="margin-top:4px"><b style="color:#d9822b">×2</b><br>' + chips(w2, function (x) { return tyChip(x.type); }) + '</div></div>' +
      '<div class="group"><span class="gt">' + L('🛡️ Resists / immune', '🛡️ ทนทาน / ไม่โดน') + '</span>' + (res.length ? res.join(' ') : '<span style="color:#666">' + L('No resistances', 'ไม่มีธาตุที่ต้านได้') + '</span>') +
      (p.immune.length ? '<div style="margin-top:4px"><b>×0 ' + L('no damage at all', 'ไม่โดนเลย') + '</b><br>' + p.immune.map(function (t) { return tyChip(t); }).join(' ') + '</div>' : '') + '</div></div>' +
      '<div class="cols"><div class="group"><span class="gt">' + L('✅ Strong against (own-type STAB ×2)', '✅ ชนะธาตุ (ท่า STAB ตีแรง ×2)') + '</span>' + chips(p.strongStab, function (t) { return tyChip(t); }) + '</div>' +
      '<div class="group"><span class="gt">' + L('⚔️ Recommended set hits hard on', '⚔️ ชุดท่าแนะนำตีแรงใส่') + '</span>' + chips(p.strongSet, function (t) { return tyChip(t); }) + '</div></div>';
    if (p.counters) {
      out += '<div class="group"><span class="gt">' + L('🧰 How to counter what it’s weak to', '🧰 ใช้อะไรแก้ทาง (เมื่อเจอธาตุที่เราแพ้)') + '</span><div class="tablewrap"><table class="t"><thead><tr><th>' + L('Foe type', 'ศัตรูธาตุ') + '</th><th>' + L('' + p.en + '’s moves to answer it', 'ท่าของ ' + (p.mega ? p.mega.n : p.en) + ' ที่ใช้สวน') + '</th><th>' + L('Or send out these types', 'หรือเรียกตัวธาตุเหล่านี้มาสู้') + '</th></tr></thead><tbody>' +
        p.counters.map(function (c) {
          return '<tr><td>' + tyChip(c.type, ' <b>' + mult2txt(c.mult) + '</b>') + '</td><td>' + (c.ownMoves.length ? c.ownMoves.map(mvLabel).join('<br>') : '<span style="color:#a33">' + L('No direct answer — dodge / back off, then swap', 'ไม่มีท่าตรง — หลบ/ถอย แล้วสลับตัว') + '</span>') + '</td><td>' + c.counterTypes.map(function (t) { return tyIcon(t); }).join('') + '</td></tr>';
        }).join('') + '</tbody></table></div><div class="note">' + L('Many foes have 2 types, so real damage can be ×4 or ×¼ — see the full <a href="#/types" data-open="types">type chart</a>.', 'ศัตรูหลายตัวมี 2 ธาตุ ผลจริงอาจเป็น ×4 หรือ ×¼ ดูตารางเต็มที่ <a href="#/types" data-open="types">ตารางธาตุ</a>') + '</div></div>';
    }
    return out;
  }
  function tabTrain(p) {
    var ivs = p.ivPriority.map(function (s) { return '<span class="chipw" style="background:#2e6fd8">' + statName(s) + '</span>'; }).join('');
    var total = p.evPlan.reduce(function (a, b) { return a + b.ev; }, 0);
    var evs = p.evPlan.map(function (e) { return '<div class="stat"><span>' + statName(e.stat) + '</span><b>' + e.ev + '</b><div class="bar"><i style="width:' + Math.round(e.ev / 252 * 100) + '%;background:#2e6fd8"></i></div></div>'; }).join('');
    return '<div class="cols"><div class="group"><span class="gt">' + L('🔬 IV — hidden genes (0–31)', '🔬 IV — ค่าพันธุกรรม (0–31)') + '</span>' +
      '<p style="margin:2px 0">' + L('Max these to 31 first: ', 'ค่าที่ควรดันเป็น 31 ก่อน: ') + ivs + '</p>' +
      '<ol style="margin:4px 0 0 18px;padding:0">' + L('<li>Catch a big <b>Alpha</b> — it has at least 3 perfect IVs.</li><li>After the story, use the <b>Judge</b> to check IVs.</li><li>At the <b>Justice Dojo (Jaune District)</b> do <b>Hyper Training</b>: Bottle Cap = one stat to 31 · Gold Bottle Cap = all 6.</li>', '<li>จับ <b>Alpha</b> ตัวใหญ่ — การันตีอย่างน้อย 3 IV เต็ม</li><li>หลังจบเนื้อเรื่อง ใช้ <b>Judge</b> ตรวจ IV</li><li>ไปที่ <b>Justice Dojo (เขต Jaune)</b> ทำ <b>Hyper Training</b>: Bottle Cap = ดัน 1 ค่าเป็น 31 · Gold Bottle Cap = ดันทั้ง 6 ค่า</li>') + '</ol>' +
      '<div class="note">' + L('More details and where to get Caps: <a href="#/iv" data-open="iv">IV/EV guide</a>', 'รายละเอียด + ที่มาของ Cap อยู่ใน <a href="#/iv" data-open="iv">คู่มือ IV/EV</a>') + '</div></div>' +
      '<div class="group"><span class="gt">' + L('💪 EV — effort values', '💪 EV — ค่าความพยายาม') + '</span><p style="margin:2px 0">' + L('Suggested spread (total ' + total + '):', 'แผนแนะนำ (รวม ' + total + '):') + '</p>' + evs +
      '<div class="note warn">' + L('The 252 per stat / 510 total cap is the main-series rule — Bulbapedia doesn’t state the cap for Z-A, so treat it as a guideline.', 'เพดาน 252 ต่อค่า / 510 รวม เป็นกฎของเกมหลัก — Bulbapedia ไม่ได้ระบุเพดานของ Z-A ให้ถือเป็นแนวทาง') + '</div></div></div>' +
      '<div class="group"><span class="gt">' + L('🔗 More info', '🔗 ดูข้อมูลเพิ่ม') + '</span><a href="' + bulba(p) + '" target="_blank" rel="noopener">Bulbapedia: ' + esc(p.en) + '</a> · <a href="' + pdb(p) + '/moves/9" target="_blank" rel="noopener">' + L('pokemondb: all Z-A moves', 'pokemondb: ท่าทั้งหมดใน Z-A') + '</a></div>';
  }

  /* ---------- evolution ---------- */
  function evSprite(p) { return sprite(p, 72); }
  var curMega = null;
  function evNode(n, hl) {
    if (n.mega) return '<button type="button" class="evn mega' + (curMega === n.s ? ' hl' : '') + '" data-mega="' + n.s + '"><span class="evs">' + megaArt(n.s, 72, n.n) + '</span><b>' + esc(n.jp) + '</b><small>' + esc(n.n) + '</small><small class="evno">Mega Evolution</small></button>';
    var p = n.i ? byId(n.i) : null, gl = n.g ? (n.g === '♂' ? ' ♂ ตัวผู้' : ' ♀ ตัวเมีย') : '';
    return '<button type="button" class="evn' + (n.i && n.i === hl && !curMega ? ' hl' : '') + (p ? '' : ' off') + '"' + (p ? ' data-mon="' + p.id + '"' : ' disabled') + '><span class="evs">' + (p ? (n.g === '♀' && HAVE_F[p.slug] ? '<span class="spb" style="width:72px;height:72px"><img src="img/mon/' + p.slug + '-f.webp" alt="" style="width:60px;height:60px"></span>' : evSprite(p)) : '<span class="qm">?</span>') + '</span><b>' + esc(p ? p.jp : n.n) + '</b><small>' + esc(n.n) + gl + '</small><small class="evno">' + (p ? '#' + dexNo(p) + (p.sec === 'md' ? ' · DLC' : '') : 'ไม่มีใน Z-A') + '</small></button>';
  }
  function evLabels(c) { return c.d.map(function (m) { return '<span class="evl">' + (m.f ? '<em>' + esc(m.f) + '</em> ' : '') + esc(m.t) + '</span>'; }).join(''); }
  function evKids(n) {
    var out = [];
    n.c.filter(function (c) { return !c.mega; }).forEach(function (c) {
      var gs = c.d.map(function (m) { return /♂/.test(m.t) ? '♂' : /♀/.test(m.t) ? '♀' : ''; });
      if (c.d.length > 1 && gs.every(function (g) { return g; }) && gs[0] !== gs[1]) c.d.forEach(function (m, i) { out.push(Object.assign({}, c, { d: [m], g: gs[i] })); });
      else out.push(c);
    });
    return out;
  }
  function evTree(n, hl) {
    var h = '<div class="evt">' + evNode(n, hl), kids = evKids(n);
    if (kids.length) {
      h += '<div class="evc">' + kids.map(function (c) {
        return '<div class="eve"><div class="evm">' + evLabels(c) + '<span class="arr">➜</span></div>' + evTree(c, hl) + '</div>';
      }).join('') + '</div>';
    }
    return h + '</div>';
  }
  function evFlat(n, out, par) { out.push({ n: n, par: par }); n.c.filter(function (c) { return !c.mega; }).forEach(function (c) { evFlat(c, out, n); }); return out; }
  function evCount(n) { return 1 + n.c.filter(function (c) { return !c.mega; }).reduce(function (a, c) { return a + evCount(c); }, 0); }
  function tabEvo(p) {
    var root = EVO[EVOIDX[p.id]], total = evCount(root);
    if (total < 2) return '<div class="empty"><b>' + esc(p.jp) + ' (' + esc(p.en) + ')</b> ไม่มีวิวัฒนาการ<br>ไม่ได้วิวัฒนาการมาจากตัวไหน และไม่วิวัฒนาการต่อ</div>';
    var flat = evFlat(root, [], null), me = flat.filter(function (x) { return x.n.i === p.id; })[0];
    function nm(n) { return '<b>' + esc(n.n) + '</b>'; }
    function dets(c) { return c.d.map(function (m) { return '<li>' + (m.f ? '<span class="chipw" style="background:#7a5bb5">ฟอร์ม ' + esc(m.f) + '</span> ' : '') + esc(m.t) + '</li>'; }).join(''); }
    var from = me && me.par ? '<div class="group"><span class="gt">⬅️ วิวัฒนาการมาจาก</span>' + nm(me.par) + '<ul class="evd">' + dets(me.n) + '</ul></div>' : '<div class="group"><span class="gt">⬅️ วิวัฒนาการมาจาก</span><span style="color:#666">— (เป็นร่างแรกของสายนี้)</span></div>';
    var kids = me ? evKids(me.n) : [];
    var to = kids.length ? '<div class="group"><span class="gt">➡️ วิวัฒนาการไปเป็น</span>' + kids.map(function (c) { return '<div style="margin:0 0 6px">' + nm(c) + (c.g ? ' <span class="chipw" style="background:' + (c.g === '♂' ? '#2e6fd8' : '#d8478f') + '">' + (c.g === '♂' ? '♂ ตัวผู้' : '♀ ตัวเมีย') + '</span>' : '') + (c.i || c.mega ? '' : ' <small style="color:#888">(ไม่มีใน Z-A)</small>') + '<ul class="evd">' + dets(c) + '</ul></div>'; }).join('') + '</div>' : '<div class="group"><span class="gt">➡️ วิวัฒนาการไปเป็น</span><span style="color:#666">— (เป็นร่างสุดท้ายของสายนี้)</span></div>';
    return '<div class="group"><span class="gt">🧬 สายวิวัฒนาการ (กดที่ตัวโปเกมอนเพื่อไปดูรายละเอียด)</span><div class="evwrap">' + evTree(root, p.id) + '</div></div>' +
      '<div class="cols">' + from + to + '</div>' +
      '<div class="note">เงื่อนไขอ้างอิงจากข้อมูลวิวัฒนาการของ PokeAPI (เกมหลัก) — ใน Z-A บางตัวอาจต่างออกไป · ชื่อฟอร์ม (Alola / Galar / Hisui / Paldea) หมายถึงต้องเป็นร่างภูมิภาคนั้น · ตัวที่เป็นสีจางมีใน Pokédex แต่ไม่มีใน Z-A</div>';
  }

  /* ---------- moves learned ---------- */
  var TAGF = { rc: .55, sd: .68, ch: .75, delay: .5, lo: .82, recoil: .85, sx: .08, ohko: 0, weak: .03, cond: .35, prio: 1.18, drain: 1.08 };
  var STAT_SC = { buffA: 62, buffS: 62, buffSpe: 58, buffAD: 56, buffSSD: 56, buffAS: 60, buffAll: 64, buffBig: 76, buffD: 42, buffSD: 42, heal: 66, paralyze: 54, burn: 50, sleep: 54, taunt: 30, screen: 46, hazard: 40, debuffA: 32, debuffD: 32, debuffS: 32, debuffSD: 32, debuffSpe: 30, debuffAcc: 22, poison: 30, confuse: 26, protect: 24, switch: 18, misc: 14, evade: 20, crit: 20 };
  var BMUL = { sweeper: [1.1, .8], bulky: [1, .95], tank: [.85, 1.1], support: [.7, 1.4] };
  function moveScore(mv, p, key) {
    var m = MV[mv], mu = BMUL[key] || [1, 1];
    if (m.cat === 'T') {
      var v = STAT_SC[m.tag] || 0;
      if ((m.tag === 'buffA' || m.tag === 'debuffS') && p.catDom === 'S') v *= .45;
      if ((m.tag === 'buffS' || m.tag === 'debuffA') && p.catDom === 'P') v *= .45;
      if (m.tag === 'burn' && p.catDom !== 'P') v *= .4;
      return v * mu[1];
    }
    var f = TAGF[m.tag]; f = f === undefined ? 1 : f;
    var s = m.power * f; if (p.types.indexOf(m.type) >= 0) s *= 1.5;
    var atk = p.stats[1], spa = p.stats[3]; s *= (m.cat === 'P' ? atk : spa) / Math.max(atk, spa);
    return s * mu[0];
  }
  function learnLabel(l) { return l === 0 ? 'ตอนวิวัฒนาการ' : 'เลเวล ' + l; }
  function tabLearn(p) {
    var key = p.arch, ls = p.ls, w = wins['mon-' + p.id] || null;
    var inBest = {}, inBack = {};
    p.best.forEach(function (b) { inBest[b.move] = b.slot; }); p.backup.forEach(function (b) { inBack[b.move] = b.slot; });
    var all = {}; ls.lv.forEach(function (x) { all[x[1]] = 1; }); ls.tm.forEach(function (x) { all[x] = 1; });
    var sc = {}, mx = 1; Object.keys(all).forEach(function (m) { sc[m] = moveScore(m, p, key); if (sc[m] > mx) mx = sc[m]; });
    function row(mv, when, rank) {
      var m = MV[mv], pct = Math.max(0, Math.min(100, Math.round(sc[mv] / mx * 100)));
      var mark = inBest[mv] ? '<span class="lsb best" title="อยู่ในชุดท่าดีที่สุดของสายนี้ (ปุ่ม ' + inBest[mv] + ')">★ ปุ่ม ' + inBest[mv] + '</span>' : inBack[mv] ? '<span class="lsb back" title="อยู่ในชุดสำรอง (ปุ่ม ' + inBack[mv] + ')">☆ สำรอง</span>' : '';
      return '<tr><td class="c">' + rank + '</td><td><span class="mvc">' + mvLabel(mv) + '</span></td><td>' + catName(m.cat) + (m.power ? ' · ' + m.power : '') + '<br><small>' + esc(effectText(mv)) + '</small></td><td class="nw">' + when + '</td><td class="sc"><span class="scb"><i style="width:' + pct + '%"></i></span><b>' + pct + '</b></td></tr>';
    }
    function table(rows) { return '<div class="tablewrap"><table class="t lst"><thead><tr><th class="c">#</th><th>ท่า</th><th>หมวด / พลัง</th><th>เรียนที่</th><th>คะแนน</th></tr></thead><tbody>' + rows + '</tbody></table></div>'; }
    var byMove = {}; ls.lv.forEach(function (x) { (byMove[x[1]] = byMove[x[1]] || []).push(x[0]); });
    var lvItems = Object.keys(byMove).map(function (m) { return { m: m, lv: Math.min.apply(null, byMove[m]) }; });
    lvItems.sort(function (a, b) { return sc[b.m] - sc[a.m] || a.lv - b.lv; });
    var tmItems = ls.tm.slice().sort(function (a, b) { return sc[b] - sc[a]; });
    var tmSet = {}; ls.tm.forEach(function (m) { tmSet[m] = 1; });
    var lvRows = lvItems.map(function (x, i) { return row(x.m, learnLabel(x.lv) + (tmSet[x.m] ? ' <small>+ TM</small>' : ''), i + 1); }).join('');
    var tmRows = tmItems.map(function (m, i) { return row(m, byMove[m] ? 'TM <small>+ ' + learnLabel(Math.min.apply(null, byMove[m])) + '</small>' : 'TM', i + 1); }).join('');
    return '<div class="note" style="margin-top:0">คะแนนคิดจากพลังท่า × STAB × ค่าโจมตีที่ตรงหมวด ปรับตามสายการเล่นที่เลือก (' + esc(ARCH[key][1]) + ') — ท่าสถานะ/เสริมพลังให้คะแนนตามความมีประโยชน์ · ข้อมูลท่าจาก pokemondb (Z-A)</div>' +
      '<div class="group"><span class="gt">⬆️ เรียนตามเลเวล (' + lvItems.length + ' ท่า) — เรียงจากดีที่สุดไปน้อยที่สุด</span>' +
      (lvItems.length ? table(lvRows) : '<div class="empty">ไม่มีท่าที่เรียนตามเลเวลใน Z-A</div>') + '</div>' +
      '<div class="group"><span class="gt">💿 เรียนจาก TM (' + tmItems.length + ' ท่า) — เรียงจากดีที่สุดไปน้อยที่สุด</span>' + (tmItems.length ? table(tmRows) : '<div class="empty">ไม่มี TM ที่ใช้ได้ใน Z-A</div>') + '</div>';
  }
  var curMonWin = null;
  function tabs() { return [['ov', '📋 ภาพรวม', tabOverview], ['evo', '🧬 วิวัฒนาการ', tabEvo], ['mv', '🎮 ท่า & ปุ่ม', tabMoves], ['ls', '📚 ท่าที่เรียนได้', tabLearn], ['mt', '⚔️ ธาตุ', tabMatch], ['tr', '🏋️ IV / EV', tabTrain]]; }
  /* evolution effect: white-out the current art, swap form, then flash in the new one */
  function megaFx(big) {
    var f = document.createElement('div'); f.className = 'mfx';
    f.innerHTML = '<i class="rays"></i><i class="orb"></i>' + [0, 1, 2, 3, 4, 5, 6, 7].map(function (n) { return '<i class="spk s' + n + '"></i>'; }).join('');
    big.appendChild(f);
  }
  function megaSwap(w, to) {
    if (w.fxBusy || (w.mega || null) === (to || null)) return;
    var big = $('.hd .big', w.body), still = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    if (!big || still) { w.mega = to; showMon(w, w.monId); return; }
    w.fxBusy = true; megaFx(big); big.classList.add('fx-out'); SND.play(to ? 'evoOut' : 'revOut');
    setTimeout(function () {
      w.mega = to; w.fxBusy = false; showMon(w, w.monId);
      var nb = $('.hd .big', w.body); SND.play(to ? 'evoIn' : 'revIn'); if (nb) { megaFx(nb); nb.classList.add('fx-in'); setTimeout(function () { nb.classList.remove('fx-in'); var f = $('.mfx', nb); if (f) f.remove(); }, 950); }
    }, 1100);
  }
  function showMon(w, id, tab, build) {
    curMonWin = w; var p = byId(id), keep = (w.monId === id && w.body) ? w.body.scrollTop : 0;
    if (w.monId !== id) { w.build = null; w.mega = null; }
    w.monId = id; w.tab = tab || w.tab || 'ov';
    if (build) w.build = build;
    if (!w.build || !p.builds[w.build]) w.build = p.rank[0];
    var key = w.build, v = Object.assign({}, p, p.builds[key], { arch: key });
    var mg = w.mega ? findMega(p, w.mega) : null; if (!mg) w.mega = null; curMega = w.mega;
    if (mg) { var mm = megaMatch(mg.ty); v.baseStats = p.stats; v.stats = mg.st; v.bst = mg.st.reduce(function (a, b) { return a + b; }, 0); v.types = mg.ty; v.weak = mm.weak; v.resist = mm.resist; v.immune = mm.immune; v.strongStab = mm.strongStab; v.counters = megaCounters(p, mg, mm); v.mega = mg; }
    w.setTitle('#' + dexNo(p) + ' ' + p.jp + ' (' + p.en + ')');
    var T = tabs();
    var blds = '<div class="builds"><div class="bl">' + L('🎯 Choose a play style — ranked best fit first', '🎯 เลือกสายการเล่น — เรียงจากเหมาะที่สุด') + '</div><div class="bw">' +
      p.rank.map(function (k, n) {
        var f = p.builds[k].fit;
        return '<button class="bld' + (k === key ? ' on' : '') + '" data-b="' + k + '" aria-pressed="' + (k === key) + '"><span class="bn">' + MEDAL[n] + ' ' + L(ARCH[k][0], ARCH[k][1]) + '</span><span class="bf">' + RANKTXT[n] + ' · ' + f + '%</span><span class="bb"><i style="width:' + f + '%"></i></span></button>';
      }).join('') + '</div><div class="bd">' + L(ARCH_DESC[key][0], ARCH_DESC[key][1]) + '</div></div>';
    w.body.innerHTML = '<div class="hd"><div class="big" data-n="' + dexNo(p) + '">' + (mg ? megaArt(mg.s, 200, mg.n) : sprite(p, 200)) + '</div><div><h2>' + esc(mg ? mg.jp : p.jp) + ' <span class="hrm"><span class="hsep">·</span> ' + esc(mg ? 'Mega ' + p.romaji : p.romaji) + '</span> ' + heartBtn(p.id, 'hb') + '</h2>' +
      '<div class="rom en2">' + esc(mg ? mg.n : p.en) + ' · #' + dexNo(p) + (p.sec === 'md' ? ' · Mega Dimension DLC' : '') + '</div><div class="sub">' + v.types.map(function (t) { return tyChip(t); }).join(' ') + '</div>' +
      '<div><span class="chipw" style="background:#555">' + L(ARCH[key][0], ARCH[key][1]) + '</span><span class="chipw" style="background:#7a5bb5">' + L('Nature ', 'นิสัย ') + v.nature.name + '</span></div></div></div>' + megaBar(p, mg) + blds +
      '<div class="tabs" role="tablist">' + T.map(function (t) { return '<button class="tab" role="tab" data-tab="' + t[0] + '" aria-selected="' + (t[0] === w.tab) + '">' + t[1] + '</button>'; }).join('') + '</div>' +
      '<div class="tabpane" role="tabpanel">' + T.filter(function (t) { return t[0] === w.tab; })[0][2](v) + '</div>';
    var sc = secOf(p);
    w.setStatus('<button class="btn" data-nav="-1" ' + (id <= sc.from ? 'disabled' : '') + '>◀ ก่อนหน้า</button><button class="btn" data-nav="1" ' + (id >= sc.to ? 'disabled' : '') + '>ถัดไป ▶</button><span style="margin-left:auto">' + sc.name + ' · ' + p.no + ' / ' + (sc.to - sc.from + 1) + '</span>');
    w.body.scrollTop = keep;
  }
  function openMon(id, tab) {
    id = +id; if (!byId(id)) return;
    openWin({
      id: 'mon-' + id, title: '#' + dexNo(byId(id)), icon: 'img/ico_pokedex.png', w: 940, h: 780,
      render: function (w) {
        if (!w.bound) {
          w.bound = true;
        }
        w.body.addEventListener('click', function (e) {
          var h = e.target.closest('.heart'); if (h) { toggleFav(+h.dataset.id); return; }
          var bl = e.target.closest('.bld'); if (bl) { w.build = bl.dataset.b; showMon(w, w.monId); return; }
          var t = e.target.closest('.tab'); if (t) { w.tab = t.dataset.tab; showMon(w, w.monId); return; }
          var o = e.target.closest('[data-open]'); if (o) { e.preventDefault(); openApp(o.dataset.open); return; }
          var mo = e.target.closest('[data-mega-off]'); if (mo) { megaSwap(w, null); return; }
          var mgb = e.target.closest('[data-mega]'); if (mgb) { megaSwap(w, mgb.dataset.mega); return; }
          var mn = e.target.closest('[data-mon]'); if (mn) { var tid = +mn.dataset.mon; if (tid !== w.monId) showMon(w, tid, w.tab); else if (w.mega) { megaSwap(w, null); } return; }
        });
        w.status.addEventListener('click', function (e) { var b = e.target.closest('[data-nav]'); if (b && !b.disabled) showMon(w, w.monId + (+b.dataset.nav)); });
        showMon(w, w.monId || id, tab);
      }
    });
  }


  /* ---------- static windows ---------- */
  function guideHTML() {
    return '<div class="group"><span class="gt">' + L('🧭 How to use this site', '🧭 ใช้เว็บนี้ยังไง') + '</span><ol style="margin:0 0 0 18px;padding:0">' + L('<li>Open the <b>Pokédex</b> (home) → search / filter by type → click a Pokémon.</li><li>The detail window has 4 tabs: <b>Overview</b> (nature/gender) · <b>Moves & buttons</b> · <b>Types</b> · <b>IV/EV</b>.</li><li>Follow the “best” move set; if you can’t get those moves yet, use the “backup” set.</li>', '<li>เปิดหน้า <b>Pokédex</b> (หน้าแรก) → ค้นหา/กรองธาตุ → กดที่ตัวที่ต้องการ</li><li>หน้าต่างรายละเอียดมี 6 แท็บ: <b>ภาพรวม</b> (นิสัย/เพศ) · <b>วิวัฒนาการ</b> · <b>ท่า & ปุ่ม</b> · <b>ท่าที่เรียนได้</b> (ตามเลเวล/TM เรียงจากดีที่สุด) · <b>ธาตุ</b> · <b>IV/EV</b></li><li><b>Mega Dimension DLC</b> อยู่ต่อจาก Pokédex หลักในหน้า Pokédex</li><li>ทำตามชุดท่า “ดีที่สุด” ถ้ายังไม่มี ให้ใช้ “ชุดสำรอง”</li>') + '</ol></div>' +
      '<div class="group"><span class="gt">' + L('📖 Words to know', '📖 ศัพท์ที่ควรรู้') + '</span><table class="t"><tbody>' + (lang === 'th' ?
        '<tr><td><b>นิสัย (Nature)</b></td><td>เพิ่ม 1 ค่า/ลด 1 ค่า (±10%) เช่น Jolly เพิ่มความเร็ว ลดโจมตีพิเศษ</td></tr><tr><td><b>STAB</b></td><td>ท่าธาตุเดียวกับตัวโปเกมอน แรงขึ้น ×1.5</td></tr><tr><td><b>IV</b></td><td>พันธุกรรมติดตัว 0–31 ต่อค่า 6 ค่า</td></tr><tr><td><b>EV</b></td><td>ค่าที่สะสมจากการต่อสู้ เพิ่มค่าพลังตามที่เราเลือก</td></tr><tr><td><b>ท่าครอบคลุม</b></td><td>ท่าต่างธาตุที่เก็บไว้ตีธาตุที่ท่าหลักตีไม่ออก</td></tr><tr><td><b>ท่าเสริม/ลดพลัง</b></td><td>ท่าไม่ทำดาเมจ แต่เพิ่มค่าเราหรือลดค่าศัตรู (เช่น Swords Dance, Thunder Wave)</td></tr>' :
        '<tr><td><b>Nature</b></td><td>Raises one stat and lowers another (±10%) — e.g. Jolly raises Speed, lowers Sp. Atk.</td></tr><tr><td><b>STAB</b></td><td>A move matching the Pokémon’s own type — ×1.5 damage.</td></tr><tr><td><b>IV</b></td><td>Innate genes, 0–31 for each of the 6 stats.</td></tr><tr><td><b>EV</b></td><td>Points earned in battle that raise the stats you choose.</td></tr><tr><td><b>Coverage move</b></td><td>A different-type move kept for foes your main move can’t hurt.</td></tr><tr><td><b>Power-up / debuff</b></td><td>Moves that deal no damage but raise your stats or lower the foe’s (Swords Dance, Thunder Wave…).</td></tr>') +
      '</tbody></table></div>' +
      '<div class="group"><span class="gt">' + L('⚡ Battling in Z-A (real-time)', '⚡ การต่อสู้ใน Z-A (เรียลไทม์)') + '</span><ul style="margin:0 0 0 18px;padding:0">' + L(
        '<li>No PP — each move has a <b>cooldown</b> (roughly 3–60 s). Speed shortens cooldowns; Drowsy doubles them.</li><li>Most moves have a wind-up. Priority moves have none, and flinching cancels a wind-up.</li><li>Your 4 moves sit on <b>A / B / X / Y</b>. <b>ZL</b> locks on · D-pad up sends out / down recalls · left-right swaps party members · press the right stick for Mega Evolution.</li>',
        '<li>ไม่มี PP — แต่ละท่ามี <b>คูลดาวน์</b> (ราว 3–60 วินาที) ความเร็วช่วยลดคูลดาวน์ ส่วนง่วง (Drowsy) ทำให้นานขึ้นเป็น 2 เท่า</li><li>ท่าส่วนใหญ่มีช่วงเตรียมท่า ท่า priority ไม่มี และการสะดุ้ง (flinch) ยกเลิกท่าที่กำลังเตรียม</li><li>ท่า 4 ท่าอยู่บนปุ่ม <b>A / B / X / Y</b> ใช้ <b>ZL</b> ล็อกเป้า · D-pad ขึ้นเรียกตัวออก/ลงเก็บ ซ้าย-ขวาสลับตัว · กดสติ๊กขวาเพื่อ Mega Evolution</li>') +
      '<li style="list-style:none;margin-left:-18px"><div class="note warn" style="margin:4px 0 0">' + L('Compiled from outside guides/wikis; it may change with game updates. If it differs on your console, trust the game.', 'รวบรวมจากคู่มือ/วิกิภายนอก อาจเปลี่ยนตามอัปเดต ถ้าไม่ตรงกับเครื่องคุณ ให้ยึดตามเกม') + '</div></li></ul></div>' +
      '<div class="group"><span class="gt">' + L('🎯 How this site assigns A/B/X/Y', '🎯 วิธีจัดปุ่ม A/B/X/Y ของเว็บนี้') + '</span><table class="t"><thead><tr><th>' + L('Button', 'ปุ่ม') + '</th><th>' + L('Move type', 'ใส่ท่าแบบไหน') + '</th><th>' + L('Why', 'เหตุผล') + '</th></tr></thead><tbody>' + L(
        '<tr><td><span class="slotb">A</span></td><td>Main STAB move — strongest, used most</td><td>Easiest button; spam it whenever the cooldown ends</td></tr><tr><td><span class="slotb">X</span></td><td>2nd attack / 2nd-type STAB / coverage</td><td>Swap to it when the foe resists A</td></tr><tr><td><span class="slotb">Y</span></td><td>Self power-up (Swords Dance, Nasty Plot…)</td><td>Press when safe, before attacking</td></tr><tr><td><span class="slotb">B</span></td><td>Recovery / status / debuff / extra coverage</td><td>Reactive moves for when you need them</td></tr>',
        '<tr><td><span class="slotb">A</span></td><td>ท่าหลัก STAB ที่แรงและใช้บ่อยสุด</td><td>ปุ่มหลักกดง่ายที่สุด ใช้ทุกครั้งที่คูลดาวน์หมด</td></tr><tr><td><span class="slotb">X</span></td><td>ท่าตีตัวที่ 2 / STAB ที่ 2 / ครอบคลุม</td><td>สลับใช้เมื่อศัตรูต้านท่า A</td></tr><tr><td><span class="slotb">Y</span></td><td>ท่าเสริมพลังตัวเอง (Swords Dance, Nasty Plot ...)</td><td>ใช้ตอนปลอดภัยก่อนบุก</td></tr><tr><td><span class="slotb">B</span></td><td>ท่าฟื้นฟู / สถานะ / ลดพลัง / ครอบคลุมเสริม</td><td>ท่ารับมือที่กดเมื่อจำเป็น</td></tr>') +
      '</tbody></table><div class="note">' + L('Assignment order: main → 2nd STAB → coverage → power-up → recovery/status. This is analysis from this site, not a game rule.', 'ลำดับการแจกท่า: ท่าหลัก → STAB ที่ 2 → ครอบคลุม → เสริมพลัง → ฟื้นฟู/สถานะ — เป็นการวิเคราะห์ของเว็บนี้ ไม่ใช่กฎของเกม') + '</div></div>';
  }
  function ivHTML() {
    return L(
      '<div class="group"><span class="gt">🔬 Finding IVs</span><ol style="margin:0 0 0 18px;padding:0"><li><b>Alpha Pokémon</b> (big, red-eyed) have at least 3 perfect (31) IVs.</li><li>The <b>Judge</b> checks IVs (unlocks after the story).</li><li>Missing an IV? Use <b>Hyper Training</b> below instead of hunting new ones.</li></ol></div>' +
      '<div class="group"><span class="gt">🧢 Hyper Training — set IVs to 31</span><ul style="margin:0 0 0 18px;padding:0"><li>Go to the <b>Justice Dojo</b> (Jaune District) — available post-game.</li><li><b>Bottle Cap</b> = set 1 stat to 31 · <b>Gold Bottle Cap</b> = set all 6.</li><li>Caps come from <b>Mable’s Research</b> (level 36: 10 Bottle Caps · level 48: 3 Gold Bottle Caps) and <b>Infinite Z-A Royale</b>.</li></ul></div>' +
      '<div class="group"><span class="gt">💪 Training EVs</span><ul style="margin:0 0 0 18px;padding:0"><li>EVs come from <b>winning battles</b>; each species gives different EVs (see “EV yield” on the foe’s page at pokemondb/Bulbapedia) — fight the ones that give what you need.</li><li>Smashing <b>Mega Crystals</b> with a Power Item gives <b>no EVs</b> (only EXP).</li><li>Misallocated? <b>Lady Clear</b> (Rust Syndicate Office lobby) resets EVs for <b>5 Mega Shards</b>.</li><li>Standard spreads: fast attacker = <b>252 attack stat + 252 Speed + 4 HP</b>, bulky = <b>252 HP + 252 Defense</b>.</li></ul><div class="note warn">The 252/510 cap is the main-series rule; Bulbapedia doesn’t state it for Z-A.</div></div>' +
      '<div class="group"><span class="gt">🌿 Mints — change a nature’s effect</span><ul style="margin:0 0 0 18px;padding:0"><li>A Mint doesn’t change the real nature, only <b>which stats are raised/lowered</b>.</li><li>Attack / Sp. Atk / Defense / Sp. Def Mints: <b>Rouge Sector 1</b> (alley between Autumnal Avenue and Rouge Plaza).</li><li>Speed Mints: <b>Vert Sector 6</b> (stand north of Restaurant Le Nah, by the water).</li><li><b>Serious Mint</b> = neutral (no raise/lower).</li></ul></div>',
      '<div class="group"><span class="gt">🔬 หา IV ยังไง</span><ol style="margin:0 0 0 18px;padding:0"><li><b>Alpha Pokémon</b> (ตัวใหญ่ ตาแดง) มี IV เต็ม 31 อย่างน้อย 3 ค่า</li><li><b>Judge</b> ตรวจ IV ได้ (ปลดล็อกหลังจบเนื้อเรื่อง)</li><li>ไม่ได้ IV ที่ต้องการ → ใช้ <b>Hyper Training</b> แทนการวิ่งหาตัวใหม่</li></ol></div>' +
      '<div class="group"><span class="gt">🧢 Hyper Training — ดัน IV เป็น 31</span><ul style="margin:0 0 0 18px;padding:0"><li>ไปที่ <b>Justice Dojo</b> (เขต Jaune) — ใช้ได้หลังจบเนื้อเรื่อง</li><li><b>Bottle Cap</b> = ตั้ง 1 ค่าเป็น 31 · <b>Gold Bottle Cap</b> = ตั้งทั้ง 6 ค่า</li><li>ได้ Cap จาก <b>Mable’s Research</b> (เลเวล 36 ได้ Bottle Cap 10 อัน · เลเวล 48 ได้ Gold Bottle Cap 3 อัน) และ <b>Infinite Z-A Royale</b></li></ul></div>' +
      '<div class="group"><span class="gt">💪 หา/ฝึก EV ยังไง</span><ul style="margin:0 0 0 18px;padding:0"><li>EV ได้จาก <b>ชนะการต่อสู้</b> ศัตรูแต่ละสายพันธุ์ให้ EV ต่างกัน (ดู “EV yield” ที่หน้าศัตรูบน pokemondb/Bulbapedia)</li><li>ทุบ <b>Mega Crystal</b> แล้วใส่ Power Item <b>ไม่ได้ EV</b> (ได้แต่ EXP)</li><li>อยากรีเซ็ตไปที่ <b>Lady Clear</b> ล็อบบี้ Rust Syndicate Office — ใช้ <b>Mega Shard ×5</b></li><li>สูตรมาตรฐาน: สายตีเร็ว = <b>252 ค่าโจมตี + 252 ความเร็ว + 4 HP</b>, สายอึด = <b>252 HP + 252 ป้องกัน</b></li></ul><div class="note warn">เพดาน 252/510 เป็นกฎเกมหลัก Bulbapedia ไม่ได้ระบุสำหรับ Z-A</div></div>' +
      '<div class="group"><span class="gt">🌿 Mint — เปลี่ยนผลของนิสัย</span><ul style="margin:0 0 0 18px;padding:0"><li>Mint ไม่เปลี่ยนนิสัยจริง แต่เปลี่ยน <b>ค่าที่ถูกเพิ่ม/ลด</b></li><li>Mint โจมตี / โจมตีพิเศษ / ป้องกัน / ป้องกันพิเศษ ขายที่ <b>Rouge Sector 1</b> (ซอยระหว่าง Autumnal Avenue กับ Rouge Plaza)</li><li>Mint ความเร็ว ขายที่ <b>Vert Sector 6</b> (แผงทางเหนือของร้าน Restaurant Le Nah ริมน้ำ)</li><li><b>Serious Mint</b> = ไม่เพิ่ม/ลดค่าใด</li></ul></div>');
  }
  function typesHTML() {
    var head = '<tr><th class="sticky">' + L('Attack ↓ / Defend →', 'โจมตี ↓ / ป้องกัน →') + '</th>' + D.types.map(function (t) { return '<th class="c">' + tyIcon(t) + '</th>'; }).join('') + '</tr>';
    var rows = D.types.map(function (a) {
      return '<tr><th class="sticky"><span class="tyl">' + tyIcon(a) + '<span>' + tyShort(a) + '</span></span></th>' + D.types.map(function (d) {
        var m = CHART[a][d], cls = m === 2 ? 'c se' : m === 0.5 ? 'c nv' : m === 0 ? 'c im' : 'c';
        return '<td class="' + cls + '">' + (m === 1 ? '' : m === 2 ? '2' : m === 0.5 ? '½' : '0') + '</td>';
      }).join('') + '</tr>';
    }).join('');
    return '<div class="note">' + L('Read a row = that attacking type vs. the defending type in each column · ', 'อ่านแถวแนวนอน = ท่าธาตุนั้นตีใส่ธาตุป้องกันตามคอลัมน์ · ') + '<b style="background:#8ee08e;padding:0 4px">2</b> ' + L('super effective', 'ตีแรง') + ' · <b style="background:#f3c3c3;padding:0 4px">½</b> ' + L('not very effective', 'ตีเบา') + ' · <b style="background:#555;color:#fff;padding:0 4px">0</b> ' + L('no effect', 'ไม่โดน') + '</div><div class="tablewrap"><table class="t typechart">' + head + rows + '</table></div>';
  }
  function aboutHTML() {
    var ver = '<div class="group"><span class="gt">🏷️ เวอร์ชัน</span><b>' + APP_NAME + ' v' + APP_VERSION + ' ' + APP_STAGE + '</b><br>เวอร์ชันเกม: <b>' + GAME_NAME + '</b> (รวม Mega Dimension DLC)<br><span style="color:#555">เบต้า: ข้อมูลและคำอธิบายยังอยู่ระหว่างตรวจสอบ อาจมีการเปลี่ยนแปลง</span></div>';
    return ver +
      '<div class="group"><span class="gt">ℹ️ เกี่ยวกับเว็บนี้</span><p style="margin:0">' + APP_NAME + ' เป็นโปรเจกต์แฟนเมดเพื่อช่วยมือใหม่ใน ' + GAME_NAME + ' ไม่เกี่ยวข้องกับ Nintendo / Creatures / Game Freak / The Pokémon Company ชื่อและภาพโปเกมอนเป็นลิขสิทธิ์ของเจ้าของเดิม</p></div>' +
      '<div class="group"><span class="gt">📚 ที่มาและข้อควรระวัง</span><ul style="margin:0 0 0 18px;padding:0"><li><b>รายชื่อโปเกมอนและท่าที่เรียนได้</b> (เลเวล / TM) — ดึงจากหน้า Z-A ของ <a href="https://pokemondb.net/pokedex/game/legends-z-a" target="_blank" rel="noopener">pokemondb</a> · Pokédex หลัก 232 ตัว + <a href="https://pokemondb.net/pokedex/game/legends-z-a/mega-dimension" target="_blank" rel="noopener">Mega Dimension DLC</a> 132 ตัว</li><li><b>สายวิวัฒนาการและเงื่อนไข</b> — จาก <a href="https://pokeapi.co/" target="_blank" rel="noopener">PokeAPI</a> (อ้างอิงเกมหลัก ใน Z-A บางตัวอาจต่างออกไป)</li><li><b>ค่าพลังพื้นฐาน / ธาตุ / อัตราส่วนเพศ ของ DLC</b> — จาก PokeAPI · ส่วนของ Pokédex หลักและชื่อญี่ปุ่นบางส่วนเขียนจากความรู้ แนะนำให้ตรวจกับ Bulbapedia</li><li><b>พลังของท่า</b> เป็นค่าโดยประมาณตามเกมหลัก ใน Z-A อาจต่างกัน (ใช้คูลดาวน์แทน PP)</li><li><b>ชุดท่า / นิสัย / เพศ / ปุ่ม A-B-X-Y / คะแนนท่าที่เรียนได้</b> คำนวณจากสูตรวิเคราะห์ ไม่ใช่การทดสอบในเกมจริง ใช้เป็นจุดเริ่มต้น</li><li>ท่าที่เรียนได้ของบางตัวอาจไม่ครบหรือคลาดเคลื่อน (เช่น Nacli ประมาณจากร่างวิวัฒนาการ) ถ้าไม่ตรงกับเกม ให้ยึดตามเกม</li><li>IV/EV/Hyper Training/Mint อ้างอิงจาก Bulbapedia และคู่มือภายนอก</li></ul></div>' +
      '<div class="group"><span class="gt">🧩 เครดิต</span><ul style="margin:0 0 0 18px;padding:0"><li>รูปโปเกมอน: artwork ของ Ken Sugimori (ชุด Sugimori Pokémon Gen1-9 DLC3 ที่เจ้าของโปรเจกต์รวบรวมไว้) ตัดขอบ จัดกึ่งกลาง และย่อเก็บไว้ในโฟลเดอร์ <code>img/mon</code> / <code>img/mega</code> · ร่าง Mega ใหม่ของ Z-A ที่ไม่มีในชุดนั้นดึง artwork จาก <a href="https://pokemondb.net/sprites" target="_blank" rel="noopener">pokemondb</a></li><li>ข้อมูลท่า: pokemondb.net · ข้อมูลทั่วไป: Bulbapedia · วิวัฒนาการ: PokeAPI</li><li><b>สร้างด้วย AI:</b> เว็บนี้ทั้งโค้ดและการวิเคราะห์ข้อมูลสร้างโดย AI ผ่าน <b>Claude (โมเดล Claude Sonnet 5.5)</b> ของ Anthropic อาจมีข้อผิดพลาด ควรตรวจสอบกับเกมก่อนใช้</li></ul></div>';
  }
  function openStatic(id, titleFn, icon, htmlFn, w, h) {
    openWin({ id: id, title: titleFn, icon: icon, w: w || 760, h: h || 600, render: function (win) {
      win.body.innerHTML = htmlFn();
      win.body.addEventListener('click', function (e) { var o = e.target.closest('[data-open]'); if (o) { e.preventDefault(); openApp(o.dataset.open); } });
      win.setStatus('<span>' + APP_NAME + ' · ' + GAME_NAME + ' · ' + APP_STAGE + '</span>');
    } });
  }
  function openApp(name) {
    var map = {
      dex: function () { openDex(); },
      favs: function () { openFavs(); },
      guide: function () { openStatic('guide', function () { return '📘 ' + B('Beginner Guide', 'คู่มือมือใหม่'); }, ico('guide'), guideHTML, 780, 640); },
      iv: function () { openStatic('iv', function () { return '🔬 คู่มือ IV & EV'; }, ico('iv'), ivHTML, 780, 640); },
      types: function () { openStatic('types', function () { return '🧪 ' + B('Type Chart', 'ตารางธาตุ'); }, ico('types'), typesHTML, 900, 660); },
      about: function () { openStatic('about', function () { return 'ℹ️ ' + B('About', 'เกี่ยวกับ') + ' · ' + APP_STAGE; }, ico('about'), aboutHTML, 700, 520); }
    };
    if (map[name]) { map[name](); }
    closeMenus();
  }

  /* ---------- desktop icons, start & version menus ---------- */
  function ico(k, n) { return 'img/ico/' + k + '-' + (n || 32) + '.png'; }
  var ICONS = [
    ['guide', function () { return 'คู่มือสำหรับมือใหม่'; }],
    ['dex', function () { return 'Pokédex'; }],
    ['types', function () { return 'ตารางธาตุ'; }],
    ['iv', function () { return 'คู่มือ IV & EV'; }],
    ['favs', function () { return 'รายการโปรด'; }],
    ['about', function () { return 'เกี่ยวกับ'; }]
  ];
  function buildIcons() {
    $('#icons').innerHTML = ICONS.map(function (i) { return '<button class="dicon" data-app="' + i[0] + '"><span class="ic"><img class="px" src="' + ico(i[0], 48) + '" alt=""></span>' + i[1]() + '</button>'; }).join('');
  }
  $('#icons').addEventListener('click', function (e) { var b = e.target.closest('.dicon'); if (b) openApp(b.dataset.app); });

  var startMenu = $('#startmenu'), verMenu = $('#vermenu');
  function themeBtn() { var n = document.body.classList.contains('theme-98'); $('#themebtn').textContent = n ? '🖥️ 98' : '🪟 XP'; $('#themebtn').title = n ? L('Switch to Windows XP theme', 'สลับเป็นธีม Windows XP') : L('Switch to Windows 98 theme', 'สลับเป็นธีม Windows 98'); }
  function buildStart() {
    startMenu.innerHTML = '<div class="mh">' + APP_NAME + ' <small>' + APP_STAGE + '</small></div>' +
      ICONS.map(function (i) { return '<button role="menuitem" data-app="' + i[0] + '"><img class="px" src="' + ico(i[0]) + '" width="32" height="32" alt="">' + i[1]() + '</button>'; }).join('');
  }
  function verItems() {
    return GAMES.map(function (g) {
      return '<button role="menuitem" data-game="' + g.id + '" class="' + (g.ok ? '' : 'dis') + '"' + (g.ok ? '' : ' aria-disabled="true"') + '><span>' + (g.ok ? '✔️' : '🔒') + '</span><span>' + g.name + '<small>' + (g.ok ? L('Available', 'พร้อมใช้งาน') : L('Coming soon (no data yet)', 'เร็ว ๆ นี้ (ยังไม่มีข้อมูล)')) + '</small></span></button>';
    }).join('');
  }
  function buildVer() { verMenu.innerHTML = '<div class="mh">' + L('Game version', 'เลือกเวอร์ชันเกม') + '</div>' + verItems(); }
  function closeMenus() { [startMenu, verMenu].forEach(function (m) { m.classList.remove('open'); }); $('#start').setAttribute('aria-expanded', 'false'); }
  $('#start').onclick = function (e) { e.stopPropagation(); var o = !startMenu.classList.contains('open'); closeMenus(); if (o) { buildStart(); startMenu.classList.add('open'); this.setAttribute('aria-expanded', 'true'); } };
  $('#verbtn').onclick = function (e) {
    e.stopPropagation(); var o = !verMenu.classList.contains('open'); closeMenus();
    if (o) {
      buildVer(); verMenu.classList.add('open');
      var br = this.getBoundingClientRect(), w = verMenu.offsetWidth;
      verMenu.style.left = Math.max(4, Math.min(window.innerWidth - w - 4, br.left + br.width / 2 - w / 2)) + 'px';
    }
  };
  document.addEventListener('click', function (e) { if (!e.target.closest('.menu')) closeMenus(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenus(); });
  startMenu.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.app) openApp(b.dataset.app);
  });
  function pickGame(e) {
    var b = e.target.closest('button'); if (!b) return;
    var g = GAMES.filter(function (x) { return x.id === b.dataset.game; })[0];
    closeMenus();
    if (!g.ok) { openStatic('nover', function () { return L('⚠️ Not available yet', '⚠️ ยังไม่พร้อมใช้งาน'); }, ico('dex'), function () { return '<div class="note warn">' + L('No data for <b>' + g.name + '</b> yet — only <b>Pokémon Legends: Z-A</b> is supported for now. More versions will come later.', 'ยังไม่มีข้อมูลของ <b>' + g.name + '</b> — ตอนนี้รองรับเฉพาะ <b>Pokémon Legends: Z-A</b> เวอร์ชันอื่นจะเพิ่มทีหลัง') + '</div>'; }, 440, 200); return; }
    openApp('dex');
  }
  verMenu.addEventListener('click', pickGame);
  function setTheme(t) { document.body.classList.toggle('theme-98', t === '98'); lsSet('za_theme', t); themeBtn(); }
  $('#themebtn').onclick = function (e) { e.stopPropagation(); setTheme(document.body.classList.contains('theme-98') ? 'xp' : '98'); closeMenus(); };
  var vb = $('#verbadge'); vb.textContent = APP_STAGE; vb.onclick = function (e) { e.stopPropagation(); openApp('about'); };
  function setLang(l) {
    lang = l; lsSet('za_lang', l); document.documentElement.lang = l;
    buildIcons(); tick(); themeBtn(); vb.title = 'v' + APP_VERSION + ' ' + APP_STAGE;
    Object.keys(wins).forEach(function (k) { rerender(wins[k]); });
    marq();
  }
  setTheme(lsGet('za_theme') === '98' ? '98' : 'xp');
  function tick() {
    var d = new Date(), loc = lang === 'th' ? 'th-TH' : 'en-GB';
    $('#clock').innerHTML = '<b>' + d.toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit', hour12: false }) + '</b><span>' + d.toLocaleDateString(loc, { day: '2-digit', month: 'short', year: 'numeric' }) + '</span>';
  }
  setInterval(tick, 15000);

  /* ---------- routing ---------- */
  function route() {
    var h = location.hash.replace(/^#\/?/, ''), m = h.match(/^mon\/(\d+)/);
    if (m) { openMon(+m[1]); return; }
    if (['guide', 'iv', 'types', 'about'].indexOf(h) >= 0) openApp(h);
  }
  window.addEventListener('hashchange', route);
  document.documentElement.lang = lang;
  buildIcons(); tick(); themeBtn(); vb.title = 'v' + APP_VERSION + ' ' + APP_STAGE;
  (function () {
    var b = document.createElement('button'); b.id = 'sndbtn'; b.className = 'trbtn'; b.type = 'button';
    function paint() { b.textContent = SND.isOn() ? '🔊' : '🔇'; b.title = SND.isOn() ? 'ปิดเสียง' : 'เปิดเสียง'; b.setAttribute('aria-pressed', SND.isOn()); }
    b.onclick = function (e) { e.stopPropagation(); SND.set(!SND.isOn()); paint(); };
    paint(); var tray = $('#tray'), clk = $('#clock'); tray.insertBefore(b, clk || null);
    document.addEventListener('pointerdown', function () { SND.unlock(); }, { once: true });
    document.addEventListener('click', function (e) { if (e.target.closest('.btn,.tab,.bld,.card,.evn,.dicon,#start,.menu button,.menu li')) SND.play('click'); }, true);
  })();
  $('#favbtn').onclick = function (e) { e.stopPropagation(); openApp('favs'); };
  updateFavCount();
  openDex(); route();
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);

  /* ---------- boot screen ---------- */
  var boot = $('#boot');
  if (boot) {
    var done = false, pct = 0, SEG = 20;
    var bar = $('#pbar', boot), run = $('#runway', boot), segs = '';
    for (var k = 0; k < SEG; k++) segs += '<i></i>';
    bar.innerHTML = segs;
    var cells = bar.children;
    function pick5() { var a = P.slice().sort(function () { return Math.random() - .5; }).slice(0, 5); return a.map(function (p) { return '<span class="slot"><img src="img/mon/' + p.slug + '.webp" alt="" onerror="this.style.visibility=\'hidden\'"></span>'; }).join(''); }
    run.innerHTML = pick5();
    var swap = setInterval(function () {
      if (done) return;
      [].forEach.call(run.children, function (e) { e.classList.add('bye'); });
      setTimeout(function () { if (!done) run.innerHTML = pick5(); }, 220);
    }, 1100);
    $('#pct', boot).textContent = '0%';
    var fast = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    function endBoot() { if (done) return; done = true; SND.play('start'); clearInterval(iv); clearInterval(swap); boot.classList.add('out'); setTimeout(function () { boot.remove(); }, 500); }
    var iv = setInterval(function () {
      pct = Math.min(100, pct + 2 + Math.random() * 5);
      for (var n = 0; n < SEG; n++) cells[n].className = n < Math.floor(pct / 100 * SEG) ? 'on' : '';
      $('#pct', boot).textContent = Math.floor(pct) + '%';
      if (pct >= 100) {
        clearInterval(iv);
        if (SND.canAutoplay()) setTimeout(endBoot, 350);
        else { var go = document.createElement('div'); go.className = 'bootgo'; go.textContent = 'แตะ / กดปุ่มใดก็ได้เพื่อเข้าสู่ Pokedex XP'; $('.bootbox', boot).appendChild(go); document.addEventListener('keydown', endBoot, { once: true }); }
      }
    }, fast ? 10 : 140);
    boot.addEventListener('click', endBoot);
  }
})();
