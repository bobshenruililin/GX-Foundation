const $ = (selector) => document.querySelector(selector);
const drawer = $('#drawer');
const price = 50;
function read(key) { try { return localStorage.getItem(key) } catch { return null } }
function save(key, value) { try { localStorage.setItem(key, value) } catch {} }
let chinese = read('pocket-language') === 'zh';
let qty = Math.max(0, Math.min(99, parseInt(read('pocket-bag'), 10) || 0));
const altText = [...document.querySelectorAll('[data-alt-zh]')].map(el => [el, el.alt]);
let checkout = false;

const tr = (en, zh) => chinese ? zh : en;
const copy = [...document.querySelectorAll('[data-zh]')].map(el => [el, el.textContent]);
const labels = [...document.querySelectorAll('[data-label-zh]')].map(el => [el, el.getAttribute('aria-label')]);
function adjust(amount) {
  qty = Math.max(0, Math.min(99, qty + amount));
  save('pocket-bag', String(qty));
  checkout = false;
  renderBag();
}
function renderBag() {
  $('#count').textContent = qty;
  $('#bagBtn').hidden = qty === 0;
  const body = $('#bagBody');
  if (!qty) {
    body.innerHTML = '<p>' + tr('Your bag is empty. There’s a little blue drop waiting at the stall.', '購物袋還是空的，攤位上的小水滴在等你。') + '</p>';
    return;
  }
  const line = '<div class="bagrow"><img src="assets/pocket-rain.webp" alt=""><div><strong>' + tr('Water Droplet Plushie', '水滴毛線公仔') + '</strong><p>HK$50 × ' + qty + '</p></div></div>';
  const total = '<div class="subtotal"><span>' + tr('Total', '合計') + '</span><strong>HK$' + qty * price + '</strong></div>';
  if (checkout) {
    body.innerHTML = line + total + '<p>' + tr('This is an order preview. The club has not received an order or payment.', '這是訂單預覽。學會尚未收到訂單或款項。') + '</p><button class="outline" data-action="edit">' + tr('Edit bag', '修改購物袋') + '</button>';
  } else {
    body.innerHTML = line + '<div class="quantity"><button data-action="less" aria-label="' + tr('Remove one droplet','減少一個') + '">−</button><span>' + qty + '</span><button data-action="more" aria-label="' + tr('Add one droplet','增加一個') + '"' + (qty === 99 ? ' disabled' : '') + '>+</button></div>' + total + '<button class="primary" data-action="review">' + tr('Preview order', '預覽訂單') + '</button><p>' + tr('Demo checkout · No payment required.', '示範結帳 · 毋須付款。') + '</p>';
  }
}
function language() {
  document.documentElement.lang = chinese ? 'zh-Hant' : 'en';
  copy.forEach(([el, en]) => el.textContent = chinese ? el.dataset.zh : en);
  labels.forEach(([el, en]) => el.setAttribute('aria-label', chinese ? el.dataset.labelZh : en));
  $('#lang').textContent = chinese ? 'EN' : '繁中';
  $('#lang').setAttribute('aria-label', chinese ? 'Switch to English' : '切換至繁體中文');
  for (const [el, en] of altText) el.alt = chinese ? el.dataset.altZh : en;
  renderBag();
}
$('#lang').onclick = () => { chinese = !chinese; save('pocket-language', chinese ? 'zh' : 'en'); language() };
function openBag() { checkout = false; renderBag(); drawer.showModal() }
$('.tag').onclick = $('#endBuy').onclick = () => { adjust(1); openBag() };
$('#bagBtn').onclick = openBag;
$('#close').onclick = () => drawer.close();
drawer.addEventListener('click', e => {
  if (e.target === drawer) {
    const r = drawer.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) drawer.close();
  }
  const action = e.target.dataset.action;
  if (!action) return;
  if (action === 'more' || action === 'less') adjust(action === 'more' ? 1 : -1);
  else { checkout = action === 'review'; renderBag() }
  (drawer.querySelector('[data-action="'+action+'"]:not(:disabled)') || drawer.querySelector('[data-action]') || $('#close')).focus();
});
const charm = $('.charm');
const plush = $('.plush');
const tag = $('.tag');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const journey = $('.journey');
const frame = $('.frame');
const cupButton = $('#fillCup');
const ns = 'http://www.w3.org/2000/svg';
$('.thread path').setAttribute('pathLength','1');
const spray = document.createElement('span');
spray.className = 'stitch-cloud';
spray.setAttribute('aria-hidden','true');
for (let i = 0; i < 11; i++) {
  const bead = document.createElement('i');
  const angle = Math.PI * (1.04 + i / 12);
  bead.style.setProperty('--dx', Math.cos(angle) * (60 + (i % 3) * 17) + 'px');
  bead.style.setProperty('--dy', Math.sin(angle) * (75 + (i % 4) * 16) + 'px');
  bead.style.setProperty('--delay', (i % 3) * 35 + 'ms');
  spray.append(bead);
}
charm.append(spray);
function tug() {
  charm.classList.add('unspooled');
  charm.classList.remove('plucked');
  void charm.offsetWidth;
  charm.classList.add('plucked');
  tag.hidden = false;
}
let grip = null;
plush.addEventListener('pointerdown', e => {
  grip = { x:e.clientX, y:e.clientY, id:e.pointerId };
  plush.setPointerCapture(e.pointerId);
});
plush.addEventListener('pointermove', e => {
  if (!grip || e.pointerId !== grip.id) return;
  const x = Math.max(-30, Math.min(30, (e.clientX - grip.x) * .4));
  const y = Math.max(-30, Math.min(30, (e.clientY - grip.y) * .4));
  plush.style.setProperty('--dragX',x+'px'); plush.style.setProperty('--dragY',y+'px');
  plush.style.setProperty('--tilt',x/4+'deg'); plush.style.setProperty('--pull',String(1+Math.hypot(x,y)/180));
});
function release() {
  grip=null;
  for (const name of ['--dragX','--dragY','--tilt','--pull']) plush.style.removeProperty(name);
}
plush.addEventListener('pointerup', () => { release(); tug() });
plush.addEventListener('pointercancel',release);
plush.addEventListener('click', e => { if (e.detail === 0) { tug(); tag.focus() } });
const palette = ['#739ab9','#81a8ae','#7896b9','#95b3ca','#819eaf'];
const drops = Array.from({length:100}, (_, i) => {
  const row = Math.floor(i/20), col = i%20;
  const outer = document.createElementNS(ns,'g');
  outer.setAttribute('transform','translate('+(4+col*20.8+(row%2)*3)+' '+(3+row*24+Math.sin(col*1.8)*1.8)+') rotate('+((i*17)%19-9)+')');
  const d = document.createElementNS(ns,'use');
  d.setAttribute('href','#d'); d.setAttribute('width','11'); d.setAttribute('height','16'); d.setAttribute('fill',palette[(col+row*2)%palette.length]); d.setAttribute('class','inkdrop');
  outer.append(d); $('#hundred').append(outer); return d;
});
const clamp = x => Math.max(0, Math.min(1, x));
const traveler = document.createElementNS(ns,'svg');
traveler.setAttribute('viewBox','0 0 32 42');
traveler.setAttribute('aria-hidden','true');
traveler.setAttribute('class','traveler');
traveler.innerHTML = '<path d="M17 2C15 15 4 20 4 28c0 15 25 14 25 0C29 20 19 12 17 2Z" fill="#adc8e0" stroke="#7292ad" stroke-width="1.1"/><g class="loops" stroke="#849fbe" fill="none" stroke-linecap="round"><path d="M9 23q8 4 16-1M7 29q10 5 20-1M8 34q9 4 17 0"/></g><g class="eyes" fill="#364456"><circle cx="11" cy="26" r="1.3"/><circle cx="22" cy="26" r="1.3"/></g>';
document.body.append(traveler);
let queued = false;
let lastCount = -1;
function paintScroll() {
  queued = false;
  const box = journey.getBoundingClientRect();
  const transition = clamp((innerHeight*.9-box.top)/(innerHeight*.9));
  if (transition > .03) charm.classList.add('unspooled');
  const travelOn = !motion.matches && transition>.015 && transition<.99;
  traveler.hidden = !travelOn;
  traveler.style.display = travelOn ? 'block' : 'none';
  if (travelOn) {
    const x = 50 + Math.sin(transition*Math.PI*1.7)*11;
    const y = 52 + Math.sin(transition*Math.PI*.7)*12;
    traveler.style.left=x+'%'; traveler.style.top=y+'%';
    traveler.style.opacity=Math.min(transition*6,(1-transition)*7,1);
    traveler.style.transform='translate(-50%,-50%) rotate('+Math.sin(transition*5)*16+'deg) scale('+(1.25-transition*.55)+')';
    traveler.querySelector('.loops').style.opacity=1-transition;
    traveler.querySelector('.eyes').style.opacity=1-transition;
  }
  const progress = clamp(-box.top / Math.max(1,box.height-frame.offsetHeight));
  const mix = clamp((progress-.39)/.29);
  const eased = mix*mix*(3-2*mix);
  frame.style.setProperty('--rain',1-eased);
  frame.style.setProperty('--cup',eased);
  frame.style.setProperty('--drift',(progress*-17)+'px');
  frame.style.setProperty('--zoom',1+progress*.13);
  frame.style.setProperty('--rise',(1-eased)*27+'px');
  frame.style.setProperty('--focus',1.04-.04*eased);
  frame.style.setProperty('--fall',(59+clamp(progress/.4)*16)+'%');
  frame.style.setProperty('--glint',Math.sin(clamp(progress/.43)*Math.PI)*.88);
  frame.style.setProperty('--ripple',Math.sin(clamp((progress-.27)/.38)*Math.PI)*.9);
  frame.style.setProperty('--spread',.38+clamp((progress-.27)/.38)*1.08);
  journey.classList.toggle('arrived',progress>.63 || motion.matches);
  const arrayTop = $('#hundred').getBoundingClientRect().top;
  const visibleCount = motion.matches ? 100 : Math.ceil(clamp((innerHeight*.95-arrayTop)/(innerHeight*.34))*100);
  if (visibleCount !== lastCount) {
    drops.forEach((d,i) => d.classList.toggle('uninked', i >= visibleCount));
    lastCount = visibleCount;
  }
}
function queuePaint() { if (!queued) { queued=true; requestAnimationFrame(paintScroll) } }
addEventListener('scroll',queuePaint,{passive:true}); addEventListener('resize',queuePaint);
motion.addEventListener('change',queuePaint);
let finishPour;
cupButton.onclick = () => {
  if (frame.classList.contains('pouring')) return;
  clearTimeout(finishPour);
  frame.classList.add('pouring');
  cupButton.hidden = true;
  const afterPour = $('.after-pour');
  afterPour.hidden = false;
  finishPour=setTimeout(() => {
    $('#works').scrollIntoView({behavior:motion.matches?'instant':'smooth',block:'center'});
    frame.classList.remove('pouring');
    cupButton.hidden = false;
    afterPour.hidden = true;
  }, motion.matches ? 1300 : 2300);
};
language(); paintScroll();
