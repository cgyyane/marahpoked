/* =========================================================
   MARA.HPOKED — comportamiento del sitio
   ========================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;
  var WA_NUMBER = '5491124007520';
  var MAIL = 'maraalopez16@gmail.com';

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  /* ---------- Año del footer ---------- */
  var yr = $('#year');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Título del hero: letra por letra ---------- */
  (function splitTitle() {
    var title = $('#heroTitle');
    if (!title) return;
    var i = 0;
    $$('.w', title).forEach(function (w) {
      var text = w.textContent;
      w.textContent = '';
      w.setAttribute('aria-hidden', 'true');
      text.split('').forEach(function (ch) {
        var s = document.createElement('span');
        s.className = 'l';
        s.style.setProperty('--i', i++);
        s.textContent = ch;
        w.appendChild(s);
      });
    });
  })();

  /* ---------- Navegación ---------- */
  var nav = $('#nav');
  var burger = $('#burger');
  var menu = $('#mobileMenu');

  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!document.body.classList.contains('menu-open')); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    window.addEventListener('resize', function () { if (window.innerWidth >= 1024) setMenu(false); });
  }

  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 24);
  }
  onScroll();

  /* Link activo según la sección visible */
  var links = $$('.nav-links a:not(.nav-cta)');
  var sections = links.map(function (a) { return $(a.getAttribute('href')); }).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id); });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Reveal al hacer scroll ---------- */
  var revealEls = $$('.reveal, .g-item, .d-card');
  if ('IntersectionObserver' in window && !reduceMotion) {
    revealEls.forEach(function (el) { if (!el.classList.contains('reveal')) el.classList.add('reveal'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Parallax suave ---------- */
  var par = $$('[data-parallax]');
  var ticking = false;
  function parallax() {
    var y = window.scrollY;
    par.forEach(function (el) {
      var k = parseFloat(el.getAttribute('data-parallax')) || 0.05;
      el.style.transform = 'translate3d(0,' + (-y * k).toFixed(1) + 'px,0)';
    });
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    onScroll();
    if (!reduceMotion && !ticking) { ticking = true; requestAnimationFrame(parallax); }
  }, { passive: true });

  /* ---------- Botón magnético ---------- */
  if (finePointer && !reduceMotion) {
    $$('.magnetic').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.18;
        var y = (e.clientY - r.top - r.height / 2) * 0.28;
        b.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  /* ---------- Destellos (estrellas como las de la gift card) ---------- */
  (function sparks() {
    var box = $('#sparks');
    if (!box || reduceMotion) return;
    var n = window.innerWidth < 700 ? 24 : 44;
    for (var i = 0; i < n; i++) {
      var s = document.createElement('span');
      s.className = 'spark';
      var size = 8 + Math.random() * 14;
      s.style.width = s.style.height = size.toFixed(0) + 'px';
      s.style.left = (Math.random() * 100).toFixed(1) + '%';
      s.style.top = (Math.random() * 100).toFixed(1) + '%';
      s.style.setProperty('--t', (5 + Math.random() * 6).toFixed(1) + 's');
      s.style.setProperty('--dl', (-Math.random() * 8).toFixed(1) + 's');
      s.style.setProperty('--o', (0.18 + Math.random() * 0.25).toFixed(2));
      if (Math.random() < 0.4) s.style.color = '#6a645f';
      s.innerHTML = '<svg viewBox="0 0 24 24"><use href="#i-star"/></svg>';
      box.appendChild(s);
    }
  })();

  /* ---------- Fondo: puntitos de tinta que deja el cursor ---------- */
  (function ink() {
    var canvas = $('#ink');
    if (!canvas || !canvas.getContext) return;
    if (reduceMotion || !finePointer) { canvas.style.display = 'none'; return; }
    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, dpr = 1;
    var WINE = '106,34,49';
    var trail = [];

    function rand(a, b) { return a + Math.random() * (b - a); }
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function loop(now) {
      ctx.clearRect(0, 0, W, H);
      trail = trail.filter(function (d) {
        var f = 1 - (now - d.born) / 1500;
        if (f <= 0) return false;
        ctx.fillStyle = 'rgba(' + WINE + ',' + (0.55 * f).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 6.283); ctx.fill();
        return true;
      });
      requestAnimationFrame(loop);
    }
    window.addEventListener('resize', function () { clearTimeout(resize._t); resize._t = setTimeout(resize, 150); });
    resize();
    requestAnimationFrame(loop);

    var last = 0;
    window.addEventListener('pointermove', function (e) {
      var now = performance.now();
      if (now - last < 55) return;
      last = now;
      trail.push({ x: e.clientX + rand(-2, 2), y: e.clientY + rand(-2, 2), r: rand(1, 1.9), born: now });
      if (trail.length > 70) trail.shift();
    }, { passive: true });
  })();

  /* ---------- Línea de puntos (sección handpoke) ---------- */
  (function () {
    var nl = $('#needleLine');
    if (!nl) return;
    if (!('IntersectionObserver' in window)) { nl.classList.add('in'); return; }
    var o = new IntersectionObserver(function (e) {
      if (e[0].isIntersecting) { nl.classList.add('in'); o.disconnect(); }
    }, { threshold: 0.4 });
    o.observe(nl);
  })();

  /* ---------- Visor de imágenes ---------- */
  (function () {
    var lb = $('#lb'), img = $('#lbImg'), cap = $('#lbCap'), count = $('#lbCount'), cta = $('#lbCta');
    var btnClose = $('#lbClose'), btnPrev = $('#lbPrev'), btnNext = $('#lbNext');
    if (!lb) return;
    var list = [], idx = 0, lastFocus = null, mode = 'tattoo';

    function collect(grid) {
      return $$('.g-item:not(.is-hidden) .g-btn, .d-card .d-btn', grid).map(function (b) {
        var im = $('img', b);
        return { src: im.currentSrc || im.src, alt: im.alt, label: b.getAttribute('data-label') || '', num: b.getAttribute('data-num') || '' };
      });
    }

    function show(i, instant) {
      idx = (i + list.length) % list.length;
      var item = list[idx];
      var apply = function () {
        img.src = item.src; img.alt = item.alt;
        count.textContent = (idx + 1) + ' / ' + list.length;
        if (mode === 'design') {
          cap.textContent = 'Diseño N° ' + item.num;
          cta.hidden = false;
          cta.href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent('Hola Mara! Me llamo ___, tengo ___ años y soy de ___. Quiero consultar por el diseño N° ' + item.num + '.');
        } else {
          cap.textContent = 'Algunos de mis trabajos';
          cta.hidden = true;
        }
        img.classList.remove('swap');
      };
      if (instant || reduceMotion) { apply(); return; }
      img.classList.add('swap');
      setTimeout(apply, 160);
    }

    function open(grid, btn) {
      mode = grid.getAttribute('data-gallery') === 'design' ? 'design' : 'tattoo';
      list = collect(grid);
      var all = $$(mode === 'design' ? '.d-card .d-btn' : '.g-item:not(.is-hidden) .g-btn', grid);
      lastFocus = document.activeElement;
      lb.classList.add('open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lb-open');
      show(all.indexOf(btn), true);
      btnClose.focus();
    }
    function close() {
      lb.classList.remove('open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lb-open');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    ['#tattooGrid', '#designGrid'].forEach(function (sel) {
      var grid = $(sel);
      if (!grid) return;
      grid.addEventListener('click', function (e) {
        var b = e.target.closest('.g-btn, .d-btn');
        if (b) open(grid, b);
      });
    });

    btnClose.addEventListener('click', close);
    btnPrev.addEventListener('click', function () { show(idx - 1); });
    btnNext.addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.id === 'lbStage') close(); });

    window.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(idx - 1);
      else if (e.key === 'ArrowRight') show(idx + 1);
      else if (e.key === 'Tab') {
        var f = $$('button, a[href]', lb).filter(function (el) { return !el.hidden && el.offsetParent !== null; });
        if (!f.length) return;
        var first = f[0], lastEl = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); }
        else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
      }
    });

    // Swipe en mobile
    var sx = 0;
    lb.addEventListener('touchstart', function (e) { sx = e.changedTouches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) show(dx < 0 ? idx + 1 : idx - 1);
    }, { passive: true });
  })();

  /* ---------- Formulario de contacto ---------- */
  (function () {
    var form = $('#contactForm');
    if (!form) return;
    var status = $('#formStatus');

    function val(id) { return ($('#' + id).value || '').trim(); }
    function setErr(id, bad) { $('#' + id).closest('.field').classList.toggle('invalid', bad); $('#' + id).setAttribute('aria-invalid', bad ? 'true' : 'false'); return bad; }

    function validate() {
      var bad = false;
      bad = setErr('f-nombre', val('f-nombre').length < 2) || bad;
      bad = setErr('f-tel', val('f-tel').replace(/\D/g, '').length < 8) || bad;
      var ed = parseInt(val('f-edad'), 10);
      bad = setErr('f-edad', !(ed >= 1 && ed <= 99)) || bad;
      bad = setErr('f-ciudad', val('f-ciudad').length < 2) || bad;
      var em = val('f-email');
      bad = setErr('f-email', em !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) || bad;
      bad = setErr('f-msg', val('f-msg').length < 5) || bad;
      if (bad) {
        var first = $('.field.invalid input, .field.invalid textarea', form);
        if (first) first.focus();
        status.textContent = 'Revisá los campos marcados.';
      }
      return !bad;
    }

    function buildText(forMail) {
      var lines = ['Hola Mara! Me llamo ' + val('f-nombre') + ', tengo ' + val('f-edad') + ' años y soy de ' + val('f-ciudad') + '. Quiero consultar por ' + val('f-msg')];
      if (val('f-zona')) lines.push('Zona: ' + val('f-zona'));
      if (val('f-tam')) lines.push('Tamaño: ' + val('f-tam'));
      if (forMail) lines.push('Mi WhatsApp: ' + val('f-tel'));
      if (val('f-email')) lines.push('Mi email: ' + val('f-email'));
      return lines.join('\n');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate()) return;
      var url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(buildText(false));
      window.open(url, '_blank', 'noopener');
      status.textContent = 'Listo. Se abrió WhatsApp con tu mensaje, solo falta enviarlo.';
    });

    $('#sendMail').addEventListener('click', function () {
      if (!validate()) return;
      var href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent('Consulta de tatuaje handpoke — ' + val('f-nombre')) + '&body=' + encodeURIComponent(buildText(true));
      window.location.href = href;
      status.textContent = 'Se abrió tu app de correo con el mensaje listo.';
    });

    $$('input, textarea, select', form).forEach(function (el) {
      el.addEventListener('input', function () {
        var f = el.closest('.field');
        if (f && f.classList.contains('invalid')) f.classList.remove('invalid');
      });
    });
  })();
})();
