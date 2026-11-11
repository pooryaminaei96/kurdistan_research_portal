/* ==========================================================
   فراخوان هفته پژوهش ۱۴۰۵ — اسکریپت‌های کمکی
   اگر جاوااسکریپت کار نکند، سایت همچنان کامل نمایش داده می‌شود.
   ========================================================== */
(function () {
  'use strict';

  /* ---- تنظیم مهلت: ۱۱ آذر ۱۴۰۵ = ۲ دسامبر ۲۰۲۶، پایان روز به وقت ایران ---- */
  var DEADLINE = new Date('2026-12-02T23:59:59+03:30').getTime();

  var fa = new Intl.NumberFormat('fa-IR');
  var each = function (list, fn) { Array.prototype.forEach.call(list, fn); };

  /* ---------- شمارش معکوس ---------- */
  function renderCountdown() {
    var els = document.querySelectorAll('[data-countdown]');
    if (!els.length) { return; }
    var ms = DEADLINE - Date.now();
    var html;
    if (ms <= 0) {
      html = 'مهلت ارسال آثار به پایان رسیده است.';
    } else {
      var totalMin = Math.floor(ms / 60000);
      var d = Math.floor(totalMin / 1440);
      var h = Math.floor((totalMin % 1440) / 60);
      var m = totalMin % 60;
      html = d > 0
        ? '<b>' + fa.format(d) + '</b> روز و <b>' + fa.format(h) + '</b> ساعت تا پایان مهلت'
        : '<b>' + fa.format(h) + '</b> ساعت و <b>' + fa.format(m) + '</b> دقیقه تا پایان مهلت';
    }
    each(els, function (el) { el.innerHTML = html; });
  }
  renderCountdown();
  setInterval(renderCountdown, 60000);

  /* ---------- نمایش بزرگ پوستر ---------- */
  var dlg = document.getElementById('lightbox');
  if (dlg && typeof dlg.showModal === 'function') {
    var img = dlg.querySelector('img');
    var title = dlg.querySelector('.lightbox-title');
    var dl = dlg.querySelector('.lightbox-dl');
    each(document.querySelectorAll('[data-lightbox]'), function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var href = a.getAttribute('href');
        img.src = href;
        img.alt = a.getAttribute('data-alt') || '';
        title.textContent = a.getAttribute('data-title') || '';
        dl.href = href;
        dlg.showModal();
      });
    });
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg || e.target.hasAttribute('data-close')) { dlg.close(); }
    });
    dlg.addEventListener('close', function () { img.removeAttribute('src'); });
  }

  /* ---------- کپی در کلیپ‌بورد ---------- */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy') ? resolve() : reject(); } catch (err) { reject(err); }
      document.body.removeChild(ta);
    });
  }

  function flash(btn, msg) {
    if (!btn.hasAttribute('data-label')) { btn.setAttribute('data-label', btn.textContent); }
    btn.textContent = msg;
    clearTimeout(btn._t);
    btn._t = setTimeout(function () { btn.textContent = btn.getAttribute('data-label'); }, 1800);
  }

  each(document.querySelectorAll('[data-copy],[data-copy-target]'), function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      if (text === null) {
        var target = document.querySelector(btn.getAttribute('data-copy-target'));
        text = target ? target.textContent : '';
      }
      copyText(text).then(
        function () { flash(btn, 'کپی شد ✓'); },
        function () { flash(btn, 'کپی نشد'); }
      );
    });
  });

  /* ---------- اشتراک‌گذاری ---------- */
  each(document.querySelectorAll('[data-share]'), function (btn) {
    btn.addEventListener('click', function () {
      var canon = document.querySelector('link[rel="canonical"]');
      var url = canon ? canon.href : location.href.split('#')[0];
      if (navigator.share) {
        navigator.share({
          title: document.title,
          text: 'فراخوان هفته پژوهش؛ ارسال مقالات و آثار مکتوب',
          url: url
        }).catch(function () {});
      } else {
        copyText(url).then(
          function () { flash(btn, 'پیوند کپی شد ✓'); },
          function () { flash(btn, 'کپی نشد'); }
        );
      }
    });
  });

  /* ---------- مشخص‌کردن بخش فعال در فهرست صفحه راهنما ---------- */
  var links = document.querySelectorAll('.toc a[href^="#"]');
  if (links.length && 'IntersectionObserver' in window) {
    var map = {};
    each(links, function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          each(links, function (l) { l.removeAttribute('aria-current'); });
          map[en.target.id].setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-15% 0px -75% 0px' });
    Object.keys(map).forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) { io.observe(sec); }
    });
  }
})();
