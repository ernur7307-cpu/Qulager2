/* Qulager — ортақ себет логикасы.
   Себет localStorage-та сақталады, сондықтан бір беттен екінші бетке өткенде жоғалмайды. */
(function () {
  'use strict';

  var KEY = 'qulager_cart';
  var PHONE = '77767278100';
  var cart = load();

  function load() {
    try {
      var data = JSON.parse(localStorage.getItem(KEY));
      if (!Array.isArray(data)) return [];
      return data.filter(function (i) { return i && i.name && Number(i.price) > 0 && Number(i.qty) > 0; });
    } catch (e) { return []; }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) { /* жад толы немесе өшірулі */ }
  }
  function total() { return cart.reduce(function (s, i) { return s + i.price * i.qty; }, 0); }
  function count() { return cart.reduce(function (s, i) { return s + i.qty; }, 0); }
  function fmt(n) { return n.toLocaleString('ru-RU') + ' ₸'; }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  /* ---------- UI (барлық бетке автоматты қосылады) ---------- */
  var iconBtn, countEl, modal, itemsEl, totalEl, toastEl;

  function buildUI() {
    iconBtn = el('button', 'cart-icon');
    iconBtn.type = 'button';
    iconBtn.setAttribute('aria-label', 'Себет');
    iconBtn.appendChild(document.createTextNode('🛒 '));
    countEl = el('span', '', '0');
    countEl.id = 'cart-count';
    iconBtn.appendChild(countEl);
    iconBtn.addEventListener('click', toggle);

    modal = el('div', 'cart-modal');
    modal.id = 'cart-modal';
    var box = el('div', 'cart-content');
    var close = el('button', 'close', '×');
    close.type = 'button';
    close.addEventListener('click', toggle);
    box.appendChild(close);
    box.appendChild(el('h2', '', 'Сіздің себетіңіз'));
    itemsEl = el('div');
    box.appendChild(itemsEl);
    var t = el('div', 'cart-total', 'Жалпы: ');
    totalEl = el('span', '', '0 ₸');
    t.appendChild(totalEl);
    box.appendChild(t);
    var actions = el('div', 'cart-actions');
    var clear = el('button', 'btn btn-clear', 'Тазалау');
    clear.type = 'button';
    clear.addEventListener('click', function () { cart = []; save(); render(); });
    var send = el('button', 'btn btn-block', 'WhatsApp арқылы тапсырыс беру');
    send.type = 'button';
    send.addEventListener('click', checkout);
    actions.appendChild(clear);
    actions.appendChild(send);
    box.appendChild(actions);
    modal.appendChild(box);
    modal.addEventListener('click', function (e) { if (e.target === modal) toggle(); });

    toastEl = el('div', 'toast');
    document.body.appendChild(iconBtn);
    document.body.appendChild(modal);
    document.body.appendChild(toastEl);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('open')) toggle();
    });
  }

  function render() {
    if (!itemsEl) return;
    itemsEl.textContent = '';
    if (!cart.length) {
      itemsEl.appendChild(el('p', 'cart-empty', 'Себет бос. Алдымен өнім таңдаңыз.'));
    }
    cart.forEach(function (item, idx) {
      var row = el('div', 'cart-item');
      row.appendChild(el('span', 'ci-name', item.name));

      var qty = el('div', 'qty');
      var minus = el('button', '', '−'); minus.type = 'button';
      minus.addEventListener('click', function () { changeQty(idx, -1); });
      var plus = el('button', '', '+'); plus.type = 'button';
      plus.addEventListener('click', function () { changeQty(idx, 1); });
      qty.appendChild(minus);
      qty.appendChild(el('span', '', String(item.qty)));
      qty.appendChild(plus);
      row.appendChild(qty);

      row.appendChild(el('span', 'ci-sum', fmt(item.price * item.qty)));
      var rm = el('button', 'ci-remove', '❌'); rm.type = 'button';
      rm.setAttribute('aria-label', 'Өшіру');
      rm.addEventListener('click', function () { removeFromCart(idx); });
      row.appendChild(rm);
      itemsEl.appendChild(row);
    });
    countEl.textContent = String(count());
    totalEl.textContent = fmt(total());
  }

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { toastEl.classList.remove('show'); }, 1800);
  }

  /* ---------- әрекеттер ---------- */
  function addToCart(id, name, price) {
    price = Number(price);
    var found = cart.filter(function (i) { return i.id === id; })[0];
    if (found) found.qty += 1; else cart.push({ id: id, name: name, price: price, qty: 1 });
    save(); render();
    toast(name + ' себетке қосылды!');
  }
  function changeQty(idx, d) {
    cart[idx].qty += d;
    if (cart[idx].qty <= 0) cart.splice(idx, 1);
    save(); render();
  }
  function removeFromCart(idx) { cart.splice(idx, 1); save(); render(); }
  function toggle() { modal.classList.toggle('open'); }

  function checkout() {
    if (!cart.length) { toast('Себет бос! Алдымен өнім таңдаңыз.'); return; }
    var msg = 'Сәлеметсіз бе! Qulager дүкенінен тапсырыс бергім келеді:\n\n';
    cart.forEach(function (i) {
      msg += '▫️ ' + i.name + ' × ' + i.qty + ' — ' + fmt(i.price * i.qty) + '\n';
    });
    msg += '\n💰 Жалпы сома: ' + fmt(total());
    window.open('https://wa.me/' + PHONE + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  }

  /* ---------- іске қосу ---------- */
  function init() {
    try { sessionStorage.setItem('ql_seen', '1'); } catch (e) {} // «Qulager» экраны қайта шықпауы үшін
    buildUI();
    render();
    document.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.add-to-cart') : null;
      if (!b) return;
      addToCart(b.dataset.id || b.dataset.name, b.dataset.name, b.dataset.price);
    });
    // басқа қойындыда өзгерсе — осында да жаңарту
    window.addEventListener('storage', function (e) {
      if (e.key === KEY) { cart = load(); render(); }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  window.QulagerCart = { add: addToCart, remove: removeFromCart, toggle: toggle };
})();
