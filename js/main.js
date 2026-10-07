/* Qulager — басты беттің скрипттері (себеттен бөлек) */
(function () {
  'use strict';

  // 1. Preloader
  // (Экран тек сессиядағы алғашқы кіруде ғана бар — қалған кезде index.html оны өшіріп тастайды)
  function hidePreloader() {
    var p = document.getElementById('preloader');
    if (p) p.classList.add('hide');
  }
  window.addEventListener('load', function () { setTimeout(hidePreloader, 400); });
  setTimeout(hidePreloader, 2500); // сурет кешіксе де экран қатып қалмайды

  // 2. Scroll анимациясы
  var faders = document.querySelectorAll('.fade-in');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('visible');
        obs.unobserve(en.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    faders.forEach(function (f) { io.observe(f); });
  } else {
    faders.forEach(function (f) { f.classList.add('visible'); });
  }

  // 3. Жоғарыға секіру батырмасы
  var topBtn = document.getElementById('scrollTopBtn');
  window.addEventListener('scroll', function () {
    if (topBtn) topBtn.classList.toggle('show', (window.scrollY || document.documentElement.scrollTop) > 300);
  });

  // 4. Мобильді мәзір
  var toggle = document.getElementById('menuToggle');
  var nav = document.getElementById('mainNav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () { nav.classList.toggle('open'); });
    nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') nav.classList.remove('open'); });
  }

  // 5. FAQ аккордеон
  var items = document.querySelectorAll('.faq-item');
  items.forEach(function (item) {
    var q = item.querySelector('.faq-question');
    q.addEventListener('click', function () {
      items.forEach(function (o) {
        if (o !== item) { o.classList.remove('active'); o.querySelector('.faq-question').setAttribute('aria-expanded', 'false'); }
      });
      var open = item.classList.toggle('active');
      q.setAttribute('aria-expanded', String(open));
    });
  });
})();
