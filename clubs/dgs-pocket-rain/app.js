const $ = (selector) => document.querySelector(selector);
const drawer = $('#drawer');
const price = 50;
function read(key) { try { return localStorage.getItem(key) } catch { return null } }
function save(key, value) { try { localStorage.setItem(key, value) } catch {} }
let chinese = read('pocket-language') === 'zh';
let qty = Math.max(0, Math.min(99, parseInt(read('pocket-bag'), 10) || 0));
let tipped = false;
let checkout = false;
let toastTimer;
const tr = (en, zh) => chinese ? zh : en;
const copy = [...document.querySelectorAll('[data-zh]')].map(el => [el, el.textContent]);
const labels = [...document.querySelectorAll('[data-label-zh]')].map(el => [el, el.getAttribute('aria-label')]);
function announce(msg) {
  clearTimeout(toastTimer);
  $('#toast').textContent = msg;
  toastTimer = setTimeout(() => $('#toast').textContent = '', 2300);
}
function adjust(amount) {
  qty = Math.max(0, Math.min(99, qty + amount));
  save('pocket-bag', String(qty));
  checkout = false;
  renderBag();
}
function renderBag() {
  $('#count').textContent = qty;
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
function renderGarden() {
  $('.garden').classList.toggle('tipped', tipped);
  $('#tip').textContent = tipped ? tr('Try again ↺','再試一次 ↺') : tr('Tip the saucer ↷','倒掉底碟積水 ↷');
  $('#tipStatus').textContent = tipped ? tr('All tipped out. Empty plant saucers at least once a week.', '倒清了！記得每星期至少一次清除花盆底碟的積水。') : '';
}
function language() {
  document.documentElement.lang = chinese ? 'zh-Hant' : 'en';
  copy.forEach(([el, en]) => el.textContent = chinese ? el.dataset.zh : en);
  labels.forEach(([el, en]) => el.setAttribute('aria-label', chinese ? el.dataset.labelZh : en));
  $('#lang').textContent = chinese ? 'EN' : '繁中';
  $('#lang').setAttribute('aria-label', chinese ? 'Switch to English' : '切換至繁體中文');
  renderGarden(); renderBag();
}
$('#lang').onclick = () => { chinese = !chinese; save('pocket-language', chinese ? 'zh' : 'en'); language() };
function openBag() { checkout = false; renderBag(); drawer.showModal() }
$('#add').onclick = () => { adjust(1); openBag() };
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
$('#tip').onclick = () => { tipped = !tipped; renderGarden() };
$('#hello').onclick = () => {
  const art = $('#hello');
  art.classList.remove('wave');
  void art.offsetWidth;
  art.classList.add('wave');
  announce(tr('A little hello from Hong Kong.','來自香港的小水滴跟你打招呼！'));
};
const cup = document.createElementNS('http://www.w3.org/2000/svg','svg');
cup.setAttribute('viewBox','0 0 85 63');cup.setAttribute('class','cupmark');cup.setAttribute('aria-hidden','true');
cup.innerHTML='<path d="m19 33 5 23q10 6 22 0l4-23" fill="#a9c7d8" stroke="#526f86" stroke-width="1.8"/><path d="M50 36q16-5 8 9l-10 2" fill="none" stroke="#526f86" stroke-width="2"/><ellipse cx="35" cy="33" rx="15" ry="3.5" fill="#dbe8ed" stroke="#526f86"/><path class="bead" d="M34 6q-9 12 0 12 9 0 0-12Z"/><ellipse class="ring" cx="35" cy="33" rx="10" ry="2"/>';
$('#project .eyebrow').before(cup);
new IntersectionObserver(entries => entries.forEach(e => cup.classList.toggle('travelling',e.isIntersecting))).observe(cup);
language();
