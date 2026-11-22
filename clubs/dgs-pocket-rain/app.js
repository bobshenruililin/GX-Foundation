/* Pocket Rain · DGS GX Club
   Pip the crocheted raindrop: squishy, draggable, pettable. No libraries. */
(() => {
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const read = k => { try { return localStorage.getItem(k) } catch { return null } };
const save = (k, v) => { try { localStorage.setItem(k, v) } catch {} };
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const still = () => motion.matches;

/* ------------------------------------------------------------------ language */
let zh = read('pocket-language') === 'zh';
const tr = (en, z) => zh ? z : en;
const copy = $$('[data-zh]').map(el => [el, el.innerHTML]);
const labels = $$('[data-label-zh]').map(el => [el, el.getAttribute('aria-label')]);
const alts = $$('[data-alt-zh]').map(el => [el, el.alt]);
const relang = [];
function language() {
  document.documentElement.lang = zh ? 'zh-Hant' : 'en';
  copy.forEach(([el, en]) => { el.innerHTML = zh ? el.dataset.zh : en });
  labels.forEach(([el, en]) => el.setAttribute('aria-label', zh ? el.dataset.labelZh : en));
  alts.forEach(([el, en]) => { el.alt = zh ? el.dataset.altZh : en });
  $('#lang').textContent = zh ? 'EN' : '繁中';
  $('#lang').setAttribute('aria-label', zh ? 'Switch to English' : '切換至繁體中文');
  relang.forEach(f => f());
}
$('#lang').onclick = () => { zh = !zh; save('pocket-language', zh ? 'zh' : 'en'); language(); sfx.pop(700) };

/* ------------------------------------------------------------------ sound + haptics */
let soundOn = read('pocket-sound') !== 'off';
let ctx;
function tone(f0, f1, dur, type = 'sine', vol = .16, delay = 0) {
  if (!soundOn) return;
  try {
    ctx ||= new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime + delay, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .012); g.gain.exponentialRampToValueAtTime(.0008, t + dur);
    o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + dur + .02);
  } catch {}
}
const buzz = ms => { if (soundOn && navigator.vibrate) try { navigator.vibrate(ms) } catch {} };
const sfx = {
  boing() { tone(rand(380, 460), 170, .32, 'sine', .2); tone(900, 600, .12, 'triangle', .05, .02); buzz(12) },
  squeak() { tone(rand(900, 1100), rand(1300, 1600), .14, 'sine', .1) },
  pop(f = 600) { tone(f, f * 1.6, .09, 'sine', .14) },
  plink(f = 1200) { tone(f, f * .7, .18, 'triangle', .08) },
  glug() { tone(rand(160, 220), rand(260, 320), .1, 'sine', .12) },
  yay() { [660, 830, 990, 1320].forEach((f, i) => tone(f, f, .16, 'triangle', .09, i * .09)); buzz([15, 40, 15]) },
};
function paintSound() {
  const b = $('#soundBtn');
  b.setAttribute('aria-pressed', soundOn);
  b.setAttribute('aria-label', soundOn ? tr('Sound on', '聲音：開') : tr('Sound off', '聲音：關'));
}
$('#soundBtn').onclick = () => { soundOn = !soundOn; save('pocket-sound', soundOn ? 'on' : 'off'); paintSound(); sfx.pop(800) };
relang.push(paintSound);

/* ------------------------------------------------------------------ Pip artwork */
// the real yarn shades on the DGS stall table
const YARN = {
  sky:        { base: '#86b9ee', light: '#c2defb', dark: '#5e93d0', stitch: '#4f82bf', en: 'sky', zh: '天空藍' },
  cornflower: { base: '#7f98de', light: '#bccaf6', dark: '#5d73bf', stitch: '#4f64ad', en: 'cornflower', zh: '矢車菊藍' },
  powder:     { base: '#aac6dc', light: '#dbe9f3', dark: '#7f9fb9', stitch: '#7091ab', en: 'powder', zh: '粉霧藍' },
  seafoam:    { base: '#c3e2df', light: '#e7f5f3', dark: '#94bdb8', stitch: '#83aea9', en: 'seafoam', zh: '海沫綠' },
};
let yarn = YARN[read('pocket-yarn')] ? read('pocket-yarn') : 'sky';

/* Club: fill in your real TDS readings (ppm) from the stall to show them on the page. */
const TDS = { filtered: null, tap: null };
let uid = 0;

/* ------------------------------------------------------------------ watercolor art slots (see ASSETS.md)
   Any file probed here that exists in assets/ replaces its vector fallback automatically. */
const ART_OK = {};
const ART_FILES = new Set();
function probe(f) {
  ART_FILES.add(f);
  return new Promise(r => { const i = new Image(); i.onload = () => r(ART_OK[f] = true); i.onerror = () => r(ART_OK[f] = false); i.src = 'assets/' + f });
}
const DROP = 'M100 14C95 56 30 96 30 152c0 44 32 72 70 72s70-28 70-72c0-56-65-96-70-138Z';
function pipSVG(color = yarn, { fuzz = true } = {}) {
  const c = YARN[color], id = 'p' + (++uid);
  if (ART_OK[`pip-${color}.webp`]) {
    const im = (f, cls) => `<image class="${cls}" href="assets/${f}" x="0" y="0" width="200" height="236" preserveAspectRatio="xMidYMax meet"/>`;
    return `<svg class="pip" viewBox="0 0 200 236" data-color="${color}"><g class="jelly">${im(`pip-${color}.webp`, 'calm')}${ART_OK[`pip-${color}-happy.webp`] ? im(`pip-${color}-happy.webp`, 'happy') : ''}</g></svg>`;
  }
  let rows = '';
  // crochet "V" stitches in curved rows that follow the body
  for (let y = 40, r = 0; y < 222; y += 9, r++) {
    const half = y < 150 ? 6 + (y - 14) * .48 : 70 * Math.sqrt(Math.max(0, 1 - ((y - 152) / 74) ** 2));
    const n = Math.max(1, Math.floor(half * 2 / 10));
    for (let i = 0; i <= n; i++) {
      const x = 100 - half + (i + (r % 2) * .5) * (half * 2 / n);
      const bend = ((x - 100) / 70) ** 2 * 5;
      rows += `M${(x - 3.6).toFixed(1)} ${(y - 3 + bend).toFixed(1)}l3.6 6 3.6-6`;
    }
  }
  return `<svg class="pip" viewBox="0 0 200 236" data-color="${color}">
<defs>
 <radialGradient id="${id}g" cx="40%" cy="52%" r="68%"><stop offset="0" stop-color="${c.light}"/><stop offset=".55" stop-color="${c.base}"/><stop offset="1" stop-color="${c.dark}"/></radialGradient>
 <clipPath id="${id}c"><path d="${DROP}"/></clipPath>
 ${fuzz ? `<filter id="${id}f" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="${uid}"/><feDisplacementMap in="SourceGraphic" scale="4"/></filter>` : ''}
</defs>
<g class="jelly">
 <ellipse class="shadow" cx="100" cy="226" rx="56" ry="8" fill="#5b6aa8" opacity=".14"/>
 <g ${fuzz ? `filter="url(#${id}f)"` : ''}>
  <path d="${DROP}" fill="url(#${id}g)"/>
  <g clip-path="url(#${id}c)"><path d="${rows}" fill="none" stroke="${c.stitch}" stroke-width="1.6" stroke-linecap="round" opacity=".42"/><path d="${rows}" fill="none" stroke="#fff" stroke-width=".9" opacity=".22" transform="translate(-.8 -1)"/></g>
  <path d="${DROP}" fill="none" stroke="${c.dark}" stroke-width="2" opacity=".5"/>
 </g>
 <path d="M100 16c-3-8 4-12 7-7" fill="none" stroke="${c.dark}" stroke-width="5" stroke-linecap="round"/>
 <circle cx="108" cy="5" r="7" fill="none" stroke="#c3c8d6" stroke-width="3"/>
 <ellipse cx="72" cy="116" rx="16" ry="22" fill="#fff" opacity=".22" transform="rotate(24 72 116)"/>
 <g class="face">
  <g class="eyes-open"><g class="lids">
   <g class="eye"><ellipse cx="74" cy="152" rx="7.5" ry="9" fill="#24243a"/><circle class="glint" cx="76.5" cy="148.5" r="2.8" fill="#fff"/></g>
   <g class="eye"><ellipse cx="126" cy="152" rx="7.5" ry="9" fill="#24243a"/><circle class="glint" cx="128.5" cy="148.5" r="2.8" fill="#fff"/></g>
  </g></g>
  <g class="eyes-closed" fill="none" stroke="#24243a" stroke-width="3.4" stroke-linecap="round"><path d="M66 154q8-9 16 0"/><path d="M118 154q8-9 16 0"/></g>
  <ellipse class="blush" cx="60" cy="168" rx="11" ry="6" fill="#ff9fb8" opacity=".55"/>
  <ellipse class="blush" cx="140" cy="168" rx="11" ry="6" fill="#ff9fb8" opacity=".55"/>
  <path class="mouth-w" d="M93 165q3.5 4 7 0q3.5 4 7 0" fill="none" stroke="#24243a" stroke-width="2.6" stroke-linecap="round"/>
  <ellipse class="mouth-o" cx="100" cy="168" rx="4" ry="5" fill="#24243a"/>
 </g>
</g></svg>`;
}

/* ------------------------------------------------------------------ jelly physics */
const pips = [];
class Pip {
  constructor(host, { fuzz = true, interactive = true, lines = null } = {}) {
    this.host = host; this.fuzz = fuzz; this.lines = lines;
    this.s = { sx: 1, sy: 1, r: 0, x: 0, y: 0 }; this.v = { sx: 0, sy: 0, r: 0, x: 0, y: 0 };
    this.t = { sx: 1, sy: 1, r: 0, x: 0, y: 0 };
    this.render(); pips.push(this);
    if (interactive) this.bind();
    this.blinkLater();
  }
  render() {
    this.host.innerHTML = pipSVG(yarn, { fuzz: this.fuzz });
    this.svg = $('svg', this.host); this.jelly = $('.jelly', this.svg); this.glints = $$('.eye', this.svg);
    this.apply();
  }
  apply() {
    const { sx, sy, r, x, y } = this.s;
    this.jelly.setAttribute('transform', `translate(${100 + x} ${224 + y}) rotate(${r}) scale(${sx} ${sy}) translate(-100 -224)`);
  }
  kick(dsx, dsy, dr = 0) { this.v.sx += dsx; this.v.sy += dsy; this.v.r += dr; wake(this) }
  step(dt) {
    let moving = false;
    for (const k of ['sx', 'sy', 'r', 'x', 'y']) {
      const stiff = k === 'r' ? 120 : 260, damp = k === 'r' ? 7 : 11;
      const a = (this.t[k] - this.s[k]) * stiff - this.v[k] * damp;
      this.v[k] += a * dt; this.s[k] += this.v[k] * dt;
      if (Math.abs(this.v[k]) > .002 || Math.abs(this.t[k] - this.s[k]) > .002) moving = true;
    }
    this.apply(); return moving;
  }
  look(px, py) {
    const b = this.svg.getBoundingClientRect(); if (!b.width) return;
    const dx = px - (b.left + b.width / 2), dy = py - (b.top + b.height * .62), d = Math.hypot(dx, dy) || 1;
    const m = Math.min(3.2, d / 60);
    this.glints.forEach(g => g.setAttribute('transform', `translate(${(dx / d * m).toFixed(2)} ${(dy / d * m).toFixed(2)})`));
  }
  face(cls, ms = 700) {
    this.svg.classList.add(cls); clearTimeout(this['_' + cls]);
    this['_' + cls] = setTimeout(() => this.svg.classList.remove(cls), ms);
  }
  blinkLater() {
    setTimeout(() => { this.svg.classList.add('blink'); setTimeout(() => { this.svg.classList.remove('blink'); this.blinkLater() }, 120) }, rand(1800, 5200));
  }
  burst(x, y, set = ['💙', '✨', '💧', '♡']) {
    const host = this.host.closest('.stage, .ending, .bagstage, .answer, section') || document.body;
    const hb = host.getBoundingClientRect();
    for (let i = 0; i < 5; i++) {
      const f = document.createElement('span'); f.className = 'fx'; f.textContent = pick(set);
      f.style.left = (x - hb.left + rand(-24, 24)) + 'px'; f.style.top = (y - hb.top + rand(-16, 10)) + 'px';
      f.style.setProperty('--dx', rand(-60, 60) + 'px'); f.style.setProperty('--rot', rand(-40, 40) + 'deg');
      f.style.animationDelay = i * 50 + 'ms'; f.style.fontSize = rand(16, 28) + 'px';
      if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
      host.append(f); setTimeout(() => f.remove(), 1400);
    }
  }
  poke(x, y) {
    this.kick(4.5, -6, rand(-60, 60)); this.face('squint', 650); sfx.boing();
    if (!still()) this.burst(x, y);
    this.onpoke?.();
  }
  bind() {
    const el = this.host; let grip = null, moved = 0, lastPet = 0, petAmt = 0, lx = 0, ly = 0;
    el.addEventListener('pointerdown', e => {
      grip = { x: e.clientX, y: e.clientY, id: e.pointerId }; moved = 0;
      el.setPointerCapture?.(e.pointerId);
      this.t.sx = 1.12; this.t.sy = .86; wake(this); sfx.squeak();
    });
    el.addEventListener('pointermove', e => {
      if (grip && e.pointerId === grip.id) {
        const dx = e.clientX - grip.x, dy = e.clientY - grip.y; moved = Math.max(moved, Math.hypot(dx, dy));
        const pull = clamp(Math.hypot(dx, dy) / 220, 0, .6);
        this.t.x = clamp(dx * .35, -46, 46); this.t.y = clamp(dy * .3, -60, 30);
        this.t.r = clamp(dx * .12, -22, 22);
        this.t.sy = 1 + pull * (dy < 0 ? .7 : -.25); this.t.sx = 1 / Math.sqrt(this.t.sy);
        if (moved > 40) this.svg.classList.add('surprised');
        wake(this);
      } else if (e.pointerType === 'mouse') {
        // petting: rub the mouse back and forth over her
        const sp = Math.hypot(e.clientX - lx, e.clientY - ly); lx = e.clientX; ly = e.clientY;
        petAmt = clamp(petAmt * .96 + sp / 400, 0, 2);
        if (petAmt > 1 && performance.now() - lastPet > 700) {
          lastPet = performance.now(); this.face('flush', 1400); this.face('squint', 900);
          this.kick(.6, -.8, rand(-10, 10)); sfx.plink(rand(1100, 1500));
          if (!still()) this.burst(e.clientX, e.clientY, ['💗', '♡', '✿']);
          this.onpet?.();
        }
      }
    });
    const up = e => {
      if (!grip) return; grip = null;
      Object.assign(this.t, { sx: 1, sy: 1, r: 0, x: 0, y: 0 });
      this.svg.classList.remove('surprised');
      if (moved < 12) this.poke(e.clientX, e.clientY);
      else { this.kick(-2, 3, this.s.r * -4); sfx.boing(); this.onfling?.() }
    };
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); const b = el.getBoundingClientRect(); this.poke(b.left + b.width / 2, b.top + b.height / 2) }
    });
  }
}
const awake = new Set(); let raf = 0, last = 0;
function wake(p) { if (still()) { Object.assign(p.s, p.t); p.apply(); return } awake.add(p); if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop) } }
function loop(now) {
  const dt = Math.min(.033, (now - last) / 1000); last = now;
  for (const p of awake) if (!p.step(dt)) awake.delete(p);
  raf = awake.size ? requestAnimationFrame(loop) : 0;
}
addEventListener('pointermove', e => pips.forEach(p => p.look(e.clientX, e.clientY)), { passive: true });
function recolor(c) { yarn = c; save('pocket-yarn', c); pips.forEach(p => p.render()) }

/* ------------------------------------------------------------------ hero */
const heroLines = [
  ['Hehe — that tickles!', '嘻嘻，好癢呀！'],
  ['I’m 100% yarn and 0% wet.', '我是 100% 毛線，0% 濕。'],
  ['A girl in your school crocheted me, one loop at a time.', '你學校的同學，一針一針把我鈎出來。'],
  ['They could’ve made me a bunny. Or a star. They made a drop.', '她們可以把我織成兔子、星星……結果織成一滴水。'],
  ['Wanna know why? Scroll down and come with me ↓', '想知道為甚麼？往下滑，跟我來 ↓'],
];
let heroI = -1;
const bubble = $('#heroBubble');
function say(en, z) {
  bubble.innerHTML = `<span>${tr(en, z)}</span>`; bubble.dataset.en = en; bubble.dataset.zh = z;
  bubble.classList.remove('again2'); void bubble.offsetWidth; bubble.classList.add('again2');
}
relang.push(() => { if (bubble.dataset.en) bubble.innerHTML = `<span>${tr(bubble.dataset.en, bubble.dataset.zh)}</span>` });
const hero = new Pip($('#heroPip'));
hero.onpoke = () => { heroI = (heroI + 1) % heroLines.length; say(...heroLines[heroI]); $('.puddle').style.setProperty('--pud', 1.25); setTimeout(() => $('.puddle').style.setProperty('--pud', 1), 220) };
hero.onpet = () => say('Mmm… more head pats please 🥹', '嗯……再摸摸我的頭 🥹');
hero.onfling = () => say('Wheee! Don’t stretch me too far, I’m handmade!', '嘩！別拉太遠，我是手工的！');
// idle wiggle so she feels alive
setInterval(() => { if (!still() && !awake.has(hero) && document.visibilityState === 'visible') hero.kick(rand(-.6, .6), rand(-.8, .4), rand(-14, 14)) }, 3400);
// sparkles
const sp = $('.sparkles');
for (let i = 0; i < 14; i++) { const s = document.createElement('i'); s.textContent = pick(['✦', '✧', '·', '♡']); s.style.left = rand(2, 96) + '%'; s.style.top = rand(4, 90) + '%'; s.style.fontSize = rand(10, 22) + 'px'; s.style.animationDelay = rand(0, 3) + 's'; sp.append(s) }

/* ------------------------------------------------------------------ minor pips */
const rider = new Pip($('[data-pip=rider]'), { fuzz: false, interactive: false });
const traveller = new Pip($('[data-pip=traveller]'), { fuzz: false, interactive: false });
const cupMini = new Pip($('.answer [data-pip=mini]'), { fuzz: false, interactive: false });
const bagPip = new Pip($('[data-pip=bag]'), { fuzz: false });
const endPip = new Pip($('[data-pip=end]'));
endPip.onpoke = () => { endPip.burst(innerWidth / 2, $('[data-pip=end]').getBoundingClientRect().top, ['👋', '💙', '✨']) };

/* ------------------------------------------------------------------ ch1 · cups */
let cupChoice = null;
function cupText() {
  if (!cupChoice) return;
  const t = cupChoice === 'tap'
    ? tr('Brave! And honestly, in Hong Kong you’d be fine — clean water reaches our taps so easily we hardly think about it.', '好勇敢！其實在香港也沒問題——乾淨的水輕易就流到我們的水龍頭，我們幾乎從來不用想。')
    : tr('Fair! But here’s the funny thing: in Hong Kong, either cup is fine. Clean water reaches our taps so easily we hardly think about it.', '合理！不過有趣的是：在香港，兩杯都可以喝。乾淨的水輕易就流到我們的水龍頭，我們幾乎從來不用想。');
  $('#cupAnswerText').innerHTML = tr('Even with my two bead eyes, I couldn’t tell them apart. I had to read the handwriting. ', '兩杯水看起來一模一樣。我有兩顆眼睛，還是得靠那幾個手寫字，才分得出哪杯是哪杯。') + t
    + '<br><em>' + tr('Those cups held water. I carried a question: how does a drink you can trust get into somebody’s hands?', '紙杯盛水。我盛得下一個問題：一杯可以放心喝的水，是怎樣來到手上的？') + '</em>';
}
relang.push(cupText);
function tdsText() {
  const el = $('#tdsRead'); if (TDS.filtered == null || TDS.tap == null) return;
  el.hidden = false;
  el.innerHTML = tr(`At our stall the meters read <b>${TDS.filtered} ppm</b> for Filtered and <b>${TDS.tap} ppm</b> for Tap water.`, `攤位上，測試筆讀數：過濾水 <b>${TDS.filtered} ppm</b>，自來水 <b>${TDS.tap} ppm</b>。`);
}
relang.push(tdsText);
$$('.papercup').forEach(b => b.onclick = () => {
  cupChoice = b.dataset.cup;
  $$('.papercup').forEach(o => { o.classList.toggle('picked', o === b); o.classList.toggle('dim', o !== b); o.setAttribute('aria-pressed', o === b) });
  $('#cupAnswer').hidden = false; cupText(); sfx.pop(520); setTimeout(() => sfx.pop(780), 90);
  cupMini.kick(3, -4, 30);
});

/* ------------------------------------------------------------------ ch2 · rain */
let rainN = 0;
const rainBox = $('#rainBox');
$$('.cloud').forEach(c => c.onclick = () => {
  c.classList.remove('squish'); void c.offsetWidth; c.classList.add('squish');
  const bb = rainBox.getBoundingClientRect(), cb = c.getBoundingClientRect();
  const n = 7;
  for (let i = 0; i < n; i++) {
    const d = document.createElement('span'); d.className = 'rdrop';
    const x = cb.left - bb.left + rand(.2, .8) * cb.width, y = cb.bottom - bb.top - 10;
    const fall = rand(.55, .9) * (bb.height - y), t = .6 + fall / 700;
    d.style.left = x + 'px'; d.style.top = y + 'px'; d.style.setProperty('--fall', fall + 'px'); d.style.setProperty('--t', t + 's');
    d.style.animationDelay = i * 70 + 'ms'; rainBox.append(d);
    setTimeout(() => {
      d.remove(); const s = document.createElement('span'); s.className = 'splash';
      s.style.left = x + 'px'; s.style.top = (y + fall + 10) + 'px'; rainBox.append(s); setTimeout(() => s.remove(), 650);
      rainN++; $('#rainN').textContent = rainN; sfx.plink(rand(1300, 2100));
    }, (t * 1000) + i * 70);
  }
  buzz(8);
});

/* ------------------------------------------------------------------ ch3 · journey */
const journey = $('#journey'), route = $('#route'), mapwrap = $('.mapwrap');
const routeLen = route.getTotalLength();
const jNotes = [
  [0, 'Bye, Victoria Harbour! 👋', '拜拜，維多利亞港！👋'],
  [.18, 'Over the South China Sea — so much water, and you can’t drink a drop of it (salty!).', '飛過南海——到處都是水，卻一滴也不能喝（鹹的！）。'],
  [.5, 'Past the Philippines, past Borneo… my yarn is getting short.', '經過菲律賓、婆羅洲……我的毛線快用完了。'],
  [.8, 'Almost there… I can see a long island shaped like a crocodile 🐊', '快到了……我看見一個像鱷魚的長長小島 🐊'],
  [.95, 'Timor-Leste! Hello! 🌺', '東帝汶！你好！🌺'],
];
let jStage = -1;
function paintNote() { if (jStage >= 0) $('#jNote').textContent = tr(jNotes[jStage][1], jNotes[jStage][2]) }
relang.push(paintNote);

/* ------------------------------------------------------------------ ch4 · jar */
const specks = $('.specks');
for (let i = 0; i < 34; i++) {
  const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  c.setAttribute('cx', rand(44, 156)); c.setAttribute('cy', rand(100, 222)); c.setAttribute('r', rand(1.4, 3.6));
  c.style.transitionDelay = rand(0, .5) + 's'; specks.append(c);
}
let jarClean = false;
function jarCopy() {
  $('#cleanBtn').innerHTML = jarClean ? tr('Pour in another jar ↺', '再倒一瓶 ↺') : tr('Run it through a purifier ✨', '放進淨水機 ✨');
  $('#jarText').textContent = jarClean
    ? tr('Clear! Safe to drink straight away — no boiling, no buying bottles.', '清澈了！可以直接喝——不用煲，也不用買樽裝水。')
    : tr('GX’s machines use nanotechnology filters to turn unsafe water into water you can drink straight away.', '共享基金會的淨水機用納米科技，把不安全的水變成可以直接喝的水。');
}
relang.push(jarCopy);
$('#cleanBtn').onclick = () => {
  const jar = $('#jar');
  if (!jarClean) { jar.classList.add('shake'); setTimeout(() => jar.classList.remove('shake'), 500); setTimeout(() => { jar.classList.add('clean'); sfx.yay() }, still() ? 0 : 450); }
  else { jar.classList.remove('clean'); sfx.glug() }
  jarClean = !jarClean; jarCopy();
};
$('#jar').onclick = () => { $('#jar').classList.add('shake'); sfx.glug(); setTimeout(() => $('#jar').classList.remove('shake'), 500) };

/* ------------------------------------------------------------------ ch5 · hold to fill */
const glass = $('#glass'), holdBtn = $('#holdBtn');
let fill = 0, holding = false, fillRaf = 0, glugT = 0, filledOnce = false;
function setFill(v) { fill = clamp(v); glass.style.setProperty('--fill', fill); holdBtn.style.setProperty('--fill', fill) }
function fillLoop(now) {
  if (!holding) return;
  setFill(fill + (still() ? .03 : .011));
  if (now - glugT > 180) { glugT = now; sfx.glug(); buzz(6) }
  if (fill >= 1) { stopHold(); return doneFill() }
  fillRaf = requestAnimationFrame(fillLoop);
}
function startHold(e) { e?.preventDefault?.(); if (fill >= 1) { setFill(0); glass.classList.remove('full'); fillCopy(false) } holding = true; glass.classList.add('pouring'); fillRaf = requestAnimationFrame(fillLoop) }
function stopHold() { holding = false; glass.classList.remove('pouring'); cancelAnimationFrame(fillRaf) }
function fillCopy(done) {
  const t = $('#fillText');
  t.dataset.done = done ? 1 : '';
  t.innerHTML = done
    ? tr('One cup, filled. 💙<br>Now picture that again and again — GX Foundation says its machines give about <b>400,000 gallons</b> a year.', '一杯水，盛滿了。💙<br>現在想像這件事一次又一次地發生——共享基金會說，淨水機每年提供大約 <b>40 萬加侖</b>水。')
    : tr('Keep holding… a cup takes patience.', '繼續按住……盛水要有耐性。');
  holdBtn.querySelector('.lbl').textContent = done ? tr('Fill another ↺', '再盛一杯 ↺') : tr('Press & hold to fill the cup', '按住，盛一杯水');
}
function doneFill() { glass.classList.add('full'); sfx.yay(); fillCopy(true); filledOnce = true }
relang.push(() => { if ($('#fillText').innerHTML) fillCopy(!!$('#fillText').dataset.done) });
holdBtn.addEventListener('pointerdown', e => { holdBtn.setPointerCapture?.(e.pointerId); startHold(e); if (!filledOnce && fill < 1) fillCopy(false) });
['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => holdBtn.addEventListener(ev, stopHold));
holdBtn.addEventListener('contextmenu', e => e.preventDefault());
holdBtn.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat && !holding) startHold(e) });
holdBtn.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') stopHold() });

/* ------------------------------------------------------------------ ch6 · 100 drops */
const grid = $('#dropGrid'), pal = ['#8fa3ef', '#b49be8', '#9fd9bd', '#8ec0ee', '#f4a9c0'];
const drops = Array.from({ length: 100 }, (_, i) => { const d = document.createElement('i'); d.style.setProperty('--c', pal[(i * 7 + Math.floor(i / 10)) % pal.length]); grid.append(d); return d });
let lit = 0, celebrated = false;
function light(d) {
  if (!d || d.classList.contains('lit')) return;
  d.classList.add('lit'); setTimeout(() => d.classList.add('settle'), 250);
  lit++; $('#litN').textContent = lit; sfx.pop(420 + lit * 9);
  if (lit === 100 && !celebrated) { celebrated = true; grid.classList.add('done'); sfx.yay(); const b = grid.getBoundingClientRect(); hero.burst.call({ host: grid }, b.left + b.width / 2, b.top + b.height / 2, ['💧', '💙', '✨', '🎉']) }
}
let painting = false;
grid.addEventListener('pointerdown', e => { painting = true; grid.setPointerCapture?.(e.pointerId); light(e.target.closest('i')) });
grid.addEventListener('pointermove', e => { if (!painting) return; const el = document.elementFromPoint(e.clientX, e.clientY); if (el && el.parentNode === grid) light(el) });
['pointerup', 'pointercancel'].forEach(ev => grid.addEventListener(ev, () => painting = false));
$('#allBtn').onclick = () => { const off = drops.filter(d => !d.classList.contains('lit')); off.forEach((d, i) => setTimeout(() => light(d), still() ? 0 : i * 18)) };

// count-up stats
const fmt = n => n.toLocaleString('en-US');
function countUp(el) {
  const end = +el.dataset.count, pre = el.dataset.prefix || '', t0 = performance.now(), dur = still() ? 0 : 1600;
  const f = now => { const k = dur ? clamp((now - t0) / dur) : 1, e = 1 - (1 - k) ** 3; el.textContent = pre + fmt(Math.round(end * e)); if (k < 1) requestAnimationFrame(f) };
  requestAnimationFrame(f);
}

/* ------------------------------------------------------------------ adopt + bag */
let bag = []; try { bag = JSON.parse(read('pocket-bag-v2') || '[]').filter(x => YARN[x.color]).slice(0, 30) } catch {}
const oldQty = parseInt(read('pocket-bag'), 10); if (!bag.length && oldQty > 0) bag = Array.from({ length: Math.min(oldQty, 30) }, () => ({ color: 'sky', name: 'Pip' }));
let checkout = false;
function setSwatches() { $$('.sw').forEach(s => s.setAttribute('aria-checked', s.dataset.color === yarn)) }
$$('.sw').forEach(s => s.onclick = () => { recolor(s.dataset.color); setSwatches(); sfx.pop(640); bagPip.kick(3, -5, 40); swing(30) });
setSwatches();
const nameIn = $('#pipName');
nameIn.value = read('pocket-name') || '';
nameIn.oninput = () => save('pocket-name', nameIn.value.trim());
function persist() { save('pocket-bag-v2', JSON.stringify(bag)) }
function esc(s) { return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]) }
function renderBag() {
  $('#count').textContent = bag.length; $('#bagBtn').hidden = !bag.length;
  const body = $('#bagBody');
  if (!bag.length) { body.innerHTML = `<p>${tr('Your bag is empty — there’s a little drop waiting at the stall.', '袋子還是空的——攤位上有一滴小水滴在等你。')}</p>`; return }
  const rows = bag.map((b, i) => `<div class="bagrow"><span class="mini" data-i="${i}"></span><div><strong>${esc(b.name || 'Pip')}</strong><small>${tr(YARN[b.color].en, YARN[b.color].zh)} · HK$50</small></div>${checkout ? '' : `<button class="rm" data-rm="${i}" aria-label="${tr('Remove', '移除')}">×</button>`}</div>`).join('');
  const total = `<div class="subtotal"><span>${tr('Total', '合計')}</span><span>HK$${bag.length * 50}</span></div>`;
  body.innerHTML = rows + total + (checkout
    ? `<p>${tr('This is just a preview — the club hasn’t received an order or payment. Show this screen at the DGS GX Club stall to collect your drops!', '這只是預覽——學會尚未收到訂單或款項。到拔萃女書院 GX 學會攤位出示此畫面，就可以領取小水滴！')}</p><div class="bagbtns"><button class="bigbtn ghost" data-act="edit">${tr('Edit bag', '修改')}</button></div>`
    : `<div class="bagbtns"><button class="bigbtn" data-act="review">${tr('Preview order', '預覽訂單')}</button><button class="bigbtn ghost" data-act="more">${tr('Adopt one more', '多帶一顆')}</button></div><p>${tr('Demo checkout · no payment taken.', '示範結帳 · 不會收款。')}</p>`);
  $$('.mini', body).forEach(m => { const c = bag[m.dataset.i].color; m.innerHTML = pipSVG(c, { fuzz: false }) });
}
relang.push(renderBag);
const drawer = $('#drawer');
function openBag() { checkout = false; renderBag(); if (drawer.showModal) { if (!drawer.open) drawer.showModal() } else drawer.setAttribute('open', '') }
$('#bagBtn').onclick = openBag;
$('#close').onclick = () => drawer.close();
drawer.addEventListener('click', e => {
  if (e.target === drawer) { drawer.close(); return }
  const rm = e.target.closest('[data-rm]'), act = e.target.closest('[data-act]')?.dataset.act;
  if (rm) { bag.splice(+rm.dataset.rm, 1); persist(); renderBag(); sfx.pop(400) }
  else if (act === 'review') { checkout = true; renderBag(); sfx.yay() }
  else if (act === 'edit') { checkout = false; renderBag() }
  else if (act === 'more') { drawer.close(); $('#adopt').scrollIntoView({ behavior: still() ? 'auto' : 'smooth' }) }
});
const dangle = $('#dangle');
let sw = 0, swv = 0, swRaf = 0;
function swing(v) { swv += v; if (!swRaf && !still()) swRaf = requestAnimationFrame(swingLoop) }
function swingLoop() { swv += -sw * .06; swv *= .94; sw += swv * .5; dangle.style.setProperty('--sw', sw.toFixed(2)); swRaf = (Math.abs(sw) + Math.abs(swv) > .05) ? requestAnimationFrame(swingLoop) : 0 }
$('#bagStage').addEventListener('pointermove', e => { if (e.pointerType === 'mouse') swing(clamp(e.movementX * .25, -6, 6)) });
$('#adoptBtn').onclick = () => {
  bag.push({ color: yarn, name: nameIn.value.trim().slice(0, 14) || 'Pip' }); persist();
  dangle.classList.remove('hop'); void dangle.offsetWidth; dangle.classList.add('hop');
  $('#bagStage').classList.add('wiggle'); setTimeout(() => $('#bagStage').classList.remove('wiggle'), 500);
  sfx.yay(); swing(40); renderBag();
  const bb = $('#bagBtn'); bb.classList.remove('bump'); void bb.offsetWidth; bb.classList.add('bump');
  setTimeout(openBag, still() ? 0 : 750);
};

/* ------------------------------------------------------------------ swap in watercolor art */
$$('img[data-art]').forEach(img => probe(img.dataset.art).then(ok => {
  if (!ok) return; img.src = 'assets/' + img.dataset.art; img.classList.add('on'); img.parentElement.classList.add('has-art');
}));
probe('paper-texture.webp').then(ok => ok && document.documentElement.classList.add('art-paper'));
Promise.all(Object.keys(YARN).flatMap(c => [probe(`pip-${c}.webp`), probe(`pip-${c}-happy.webp`)])).then(() => {
  if (Object.keys(YARN).some(c => ART_OK[`pip-${c}.webp`])) { pips.forEach(p => p.render()); renderBag() }
});
Promise.all([1, 2, 3, 4, 5].map(n => probe(`grid-drop-${n}.png`))).then(() => {
  const ok = [1, 2, 3, 4, 5].filter(n => ART_OK[`grid-drop-${n}.png`]);
  if (!ok.length) return;
  drops.forEach((d, i) => d.style.setProperty('--img', `url(assets/grid-drop-${ok[(i * 7 + Math.floor(i / 10)) % ok.length]}.png)`));
  grid.classList.add('has-art');
});
['og-card.png', 'murky-river.webp', 'water-machine.webp', 'ending-hands.webp', 'sticker-umbrella.png', 'sticker-flower.png', 'sticker-yarn.png'].forEach(f => ART_FILES.add(f));
// open the page with ?assets to see which art slots are filled
if (/[?&]assets\b/.test(location.search)) setTimeout(async () => {
  const box = document.createElement('div'); box.className = 'assetlist';
  const rows = await Promise.all([...ART_FILES].sort().map(async f => (ART_OK[f] ?? await probe(f)) ? '✅ ' + f : '⬜ ' + f));
  box.innerHTML = '<b>art slots</b><br>' + rows.join('<br>'); document.body.append(box);
}, 1200);

/* ------------------------------------------------------------------ optional scene art */
$$('img[data-optional]').forEach(img => {
  const gone = () => img.remove();
  if (img.complete && !img.naturalWidth) gone(); else img.addEventListener('error', gone);
});

/* ------------------------------------------------------------------ scroll choreography */
const bar = $('.yarnbar');
const reveal = $$('.chapter > *:not(.sticker), .ending > *, .hello .lede, .hello .follow');
reveal.forEach(el => el.classList.add('rv'));
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); if (e.target.id === 'stats') $$('[data-count]').forEach(countUp) }
}), { rootMargin: '0px 0px -8% 0px', threshold: .12 });
reveal.forEach(el => io.observe(el));
let queued = false, lastP = 0;
function paint() {
  queued = false;
  const max = document.documentElement.scrollHeight - innerHeight, p = clamp(scrollY / Math.max(1, max));
  bar.style.setProperty('--p', p.toFixed(4)); bar.style.setProperty('--tilt', clamp((p - lastP) * 4000, -25, 25).toFixed(1)); lastP = p;
  // journey
  const jb = journey.getBoundingClientRect();
  const jp = still() ? 1 : clamp(-jb.top / Math.max(1, jb.height - innerHeight));
  mapwrap.style.setProperty('--jp', jp.toFixed(4));
  const pt = route.getPointAtLength(jp * routeLen), ahead = route.getPointAtLength(Math.min(routeLen, jp * routeLen + 4));
  traveller.host.style.setProperty('--tx', (pt.x / 4).toFixed(2)); traveller.host.style.setProperty('--ty', (pt.y / 3).toFixed(2));
  traveller.host.style.setProperty('--tr', clamp(Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * 18, -24, 24).toFixed(1));
  const st = jNotes.reduce((a, n, i) => jp >= n[0] ? i : a, 0);
  if (st !== jStage) { jStage = st; paintNote(); if (jb.top < innerHeight && jb.bottom > 0) { sfx.plink(900 + st * 160); traveller.kick(2, -3, 20) } }
}
const queue = () => { if (!queued) { queued = true; requestAnimationFrame(paint) } };
addEventListener('scroll', queue, { passive: true }); addEventListener('resize', queue);
motion.addEventListener?.('change', queue);

language(); paintSound(); renderBag(); paint();
})();
