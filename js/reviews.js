/* Qulager — пікірлер.
   Кез келген адам оқиды және жаза алады, өшіруді тек пікір иесі (өз браузері арқылы) жасай алады.
   firebase-config.js толтырылса — ортақ Firebase дерекқоры, әйтпесе — осы браузердегі демо режим. */
(function () {
  'use strict';

  var form = document.getElementById('reviewForm');
  if (!form) return;

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  var listEl = $('reviewList'), msgEl = $('rvMsg'), noteEl = $('rvNote'), totalEl = $('rvTotal');
  var nameEl = $('rvName'), textEl = $('rvText'), countEl = $('rvCount'), submitBtn = $('rvSubmit');
  var cfg = window.QULAGER_FIREBASE || {};
  var cloud = !!(cfg.apiKey && cfg.projectId);
  var COOLDOWN_MS = 20000;
  var reviews = [];
  var myUid = null;

  /* ---------- Демо режим: localStorage ---------- */
  function localStore() {
    var KEY = 'qulager_reviews', UID = 'qulager_uid', emit = function () {};
    var uid = null;
    try {
      uid = localStorage.getItem(UID);
      if (!uid) {
        uid = 'u' + Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem(UID, uid);
      }
    } catch (e) { uid = 'u' + Math.random().toString(36).slice(2); }
    function read() {
      try { var d = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(d) ? d : []; } catch (e) { return []; }
    }
    function write(a) { localStorage.setItem(KEY, JSON.stringify(a)); }
    return {
      uid: function () { return Promise.resolve(uid); },
      subscribe: function (cb) {
        emit = function () { cb(read().sort(function (a, b) { return b.createdAt - a.createdAt; })); };
        emit();
        window.addEventListener('storage', function (e) { if (e.key === KEY) emit(); });
      },
      add: function (r) {
        try {
          var a = read();
          r.id = 'l' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
          r.createdAt = Date.now();
          a.push(r); write(a); emit();
          return Promise.resolve();
        } catch (e) { return Promise.reject(e); }
      },
      remove: function (id) {
        try { write(read().filter(function (x) { return x.id !== id; })); emit(); return Promise.resolve(); }
        catch (e) { return Promise.reject(e); }
      }
    };
  }

  /* ---------- Ортақ режим: Firebase (Auth anonymous + Firestore) ---------- */
  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = src; s.onload = res;
      s.onerror = function () { rej(new Error('Жүктелмеді: ' + src)); };
      document.head.appendChild(s);
    });
  }
  function cloudStore() {
    var base = 'https://www.gstatic.com/firebasejs/10.12.2/';
    var db, authPromise;
    var ready = loadScript(base + 'firebase-app-compat.js')
      .then(function () { return Promise.all([loadScript(base + 'firebase-auth-compat.js'), loadScript(base + 'firebase-firestore-compat.js')]); })
      .then(function () {
        firebase.initializeApp(cfg);
        db = firebase.firestore();
        authPromise = firebase.auth().signInAnonymously()
          .then(function (c) { return c.user.uid; })
          .catch(function () { return null; });
      });
    return {
      uid: function () { return ready.then(function () { return authPromise; }); },
      subscribe: function (cb, onErr) {
        ready.then(function () {
          db.collection('reviews').orderBy('createdAt', 'desc').limit(100).onSnapshot(function (snap) {
            cb(snap.docs.map(function (d) {
              var x = d.data({ serverTimestamps: 'estimate' });
              x.id = d.id;
              x.createdAt = x.createdAt && x.createdAt.toMillis ? x.createdAt.toMillis() : Date.now();
              return x;
            }));
          }, onErr);
        }).catch(onErr);
      },
      add: function (r) {
        return ready.then(function () {
          r.createdAt = firebase.firestore.FieldValue.serverTimestamp();
          return db.collection('reviews').add(r);
        });
      },
      remove: function (id) { return ready.then(function () { return db.collection('reviews').doc(id).delete(); }); }
    };
  }

  var store = cloud ? cloudStore() : localStore();

  /* ---------- Көрсету ---------- */
  function fmtDate(ms) {
    try { return new Date(ms).toLocaleDateString('ru-RU'); } catch (e) { return ''; }
  }

  function render() {
    listEl.textContent = '';
    totalEl.textContent = reviews.length ? '(' + reviews.length + ')' : '';
    if (!reviews.length) {
      listEl.appendChild(el('p', 'rv-empty', 'Әзірге пікір жоқ. Бірінші болып жазыңыз!'));
      return;
    }
    reviews.forEach(function (r) {
      var card = el('div', 'review-card');
      var rating = Math.max(1, Math.min(5, parseInt(r.rating, 10) || 5));
      card.appendChild(el('div', 'stars', '★'.repeat(rating) + '☆'.repeat(5 - rating)));
      card.appendChild(el('p', 'review-text', r.text));
      var who = el('div', 'reviewer');
      who.appendChild(el('div', 'reviewer-avatar', (r.name || '?').charAt(0).toUpperCase()));
      var info = el('div', 'rv-info');
      info.appendChild(el('h4', 'reviewer-name', r.name));
      info.appendChild(el('p', 'reviewer-status', fmtDate(r.createdAt)));
      who.appendChild(info);
      if (myUid && r.uid === myUid) {
        var del = el('button', 'rv-del', '🗑 Өшіру');
        del.type = 'button';
        del.addEventListener('click', function () { removeReview(r.id, del); });
        who.appendChild(del);
      }
      card.appendChild(who);
      listEl.appendChild(card);
    });
  }

  function removeReview(id, btn) {
    if (!window.confirm('Пікірді өшіресіз бе?')) return;
    btn.disabled = true;
    store.remove(id).catch(function () {
      btn.disabled = false;
      setMsg('Өшіру мүмкін болмады. Тек өз пікіріңізді өшіре аласыз.', true);
    });
  }

  function setMsg(text, isError) {
    msgEl.textContent = text || '';
    msgEl.className = 'rf-msg' + (text ? (isError ? ' err' : ' ok') : '');
  }

  /* ---------- Форма ---------- */
  try { nameEl.value = localStorage.getItem('qulager_review_name') || ''; } catch (e) {}
  textEl.addEventListener('input', function () { countEl.textContent = textEl.value.length + ' / 500'; });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = nameEl.value.replace(/\s+/g, ' ').trim();
    var text = textEl.value.trim();
    var checked = form.querySelector('input[name="rvRating"]:checked');
    var rating = checked ? parseInt(checked.value, 10) : 0;

    if (!name) { setMsg('Атыңызды жазыңыз.', true); nameEl.focus(); return; }
    if (!rating) { setMsg('Жұлдызшаны басып баға беріңіз.', true); return; }
    if (text.length < 3) { setMsg('Пікір тым қысқа (кемінде 3 таңба).', true); textEl.focus(); return; }

    var last = 0;
    try { last = Number(localStorage.getItem('qulager_last_review')) || 0; } catch (err) {}
    var wait = COOLDOWN_MS - (Date.now() - last);
    if (wait > 0) { setMsg('Біраз күте тұрыңыз (' + Math.ceil(wait / 1000) + ' сек) және қайталаңыз.', true); return; }

    submitBtn.disabled = true;
    setMsg('Жіберілуде...');
    store.uid().then(function (uid) {
      if (!uid) throw new Error('auth');
      return store.add({ uid: uid, name: name, text: text, rating: rating });
    }).then(function () {
      try {
        localStorage.setItem('qulager_last_review', String(Date.now()));
        localStorage.setItem('qulager_review_name', name);
      } catch (err) {}
      form.reset();
      nameEl.value = name;
      countEl.textContent = '0 / 500';
      setMsg('Рахмет! Пікіріңіз қосылды.');
    }).catch(function () {
      setMsg('Жіберу мүмкін болмады. Интернетті тексеріп, кейінірек қайталаңыз.', true);
    }).then(function () { submitBtn.disabled = false; });
  });

  /* ---------- Іске қосу ---------- */
  if (!cloud) noteEl.textContent = 'Демо режим: пікірлер әзірге тек осы құрылғыда сақталады.';

  store.uid().then(function (uid) {
    myUid = uid;
    if (cloud && !uid) {
      noteEl.textContent = 'Пікірлерді оқуға болады, бірақ қазір жазу мүмкін емес.';
      submitBtn.disabled = true;
    }
    render();
  });
  store.subscribe(function (list) { reviews = list; render(); }, function () {
    listEl.textContent = '';
    listEl.appendChild(el('p', 'rv-empty', 'Пікірлерді жүктеу мүмкін болмады. Кейінірек қайталап көріңіз.'));
  });
})();
