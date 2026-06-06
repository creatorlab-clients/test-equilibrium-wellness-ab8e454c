/* Equilibrium Wellness — script.js */

// ── Ano footer ──
(function () {
  document.querySelectorAll('[data-year]').forEach(function (el) {
    if (!el.textContent || el.textContent.trim().startsWith('{{')) {
      el.textContent = new Date().getFullYear();
    }
  });
})();

// ── Scroll canvas — cover mode §4.2 ──
(function () {
  var canvas  = document.getElementById('scroll-canvas');
  var section = document.getElementById('scroll-anim');
  if (!canvas || !section) return;

  var ctx  = canvas.getContext('2d');
  var pin  = section.querySelector('.scroll-anim-pin');

  var FRAME_PATH   = 'https://8ispuxmgjxgu2r5q.public.blob.vercel-storage.com/templates/fitness-003/frames/';
  var FRAME_COUNT  = 151;
  var FRAME_PREFIX = 'frame_';
  var FRAME_PAD    = 4;
  var FRAME_EXT    = '.webp';

  var images = [];
  var loaded = 0;

  function setupCanvas() {
    var dpr = window.devicePixelRatio || 1;
    var cw  = pin.clientWidth;
    var ch  = pin.clientHeight;
    canvas.width  = cw * dpr;
    canvas.height = ch * dpr;
    canvas.style.width  = cw + 'px';
    canvas.style.height = ch + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function renderFrame(img) {
    var cw = pin.clientWidth;
    var ch = pin.clientHeight;
    var iw = img.naturalWidth;
    var ih = img.naturalHeight;
    var scale = Math.max(cw / iw, ch / ih); /* COVER — §4.2 */
    var dw = iw * scale;
    var dh = ih * scale;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
  }

  function render(progress) {
    var idx = Math.min(FRAME_COUNT - 1, Math.max(0, Math.floor(progress * FRAME_COUNT)));
    var img = images[idx];
    if (!img || !img.complete || !img.naturalWidth) return;
    renderFrame(img);
  }

  for (var i = 1; i <= FRAME_COUNT; i++) {
    var img = new Image();
    img.src = FRAME_PATH + FRAME_PREFIX + String(i).padStart(FRAME_PAD, '0') + FRAME_EXT;
    (function (idx, image) {
      image.onload = function () {
        loaded++;
        if (loaded === 1) { setupCanvas(); render(0); }
      };
    })(i - 1, img);
    images.push(img);
  }

  function onScroll() {
    var rect       = section.getBoundingClientRect();
    var scrollable = section.offsetHeight - window.innerHeight;
    if (scrollable <= 0) { render(0); return; }
    render(Math.min(1, Math.max(0, -rect.top / scrollable)));
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { setupCanvas(); onScroll(); });
})();

// ── Nav active state ──
(function () {
  var sections = document.querySelectorAll('section[id], div[id]');
  var navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!navLinks.length || !sections.length) return;
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var id = '#' + entry.target.id;
        navLinks.forEach(function (link) {
          link.classList.toggle('active', link.getAttribute('href') === id);
        });
      }
    });
  }, { rootMargin: '-80px 0px -55% 0px', threshold: 0 });
  sections.forEach(function (s) { obs.observe(s); });
})();

// ── Parallax ──
(function () {
  var items = document.querySelectorAll('.gallery-item:nth-child(4) img');
  if (!items.length) return;
  function onParallax() {
    items.forEach(function (el) {
      var wrap   = el.parentElement;
      if (!wrap) return;
      var rect   = wrap.getBoundingClientRect();
      var vh     = window.innerHeight;
      var center = rect.top + rect.height / 2 - vh / 2;
      var pct    = center / vh;
      el.style.transform = 'translateY(' + (pct * 28) + 'px)';
    });
  }
  window.addEventListener('scroll', onParallax, { passive: true });
  onParallax();
})();

// ── IntersectionObservers ──
if ('IntersectionObserver' in window) {
  // Fade up
  var fadeObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        fadeObs.unobserve(e.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px -60px 0px' });
  document.querySelectorAll('.fade-up').forEach(function (el) { fadeObs.observe(el); });

  // Stagger cards
  var stagObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        var delay = parseInt(e.target.dataset.stagger || '0', 10);
        setTimeout(function () { e.target.classList.add('visible'); }, delay);
        stagObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.stagger-card').forEach(function (el) { stagObs.observe(el); });

  // Text reveal
  var revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal-wrapper').forEach(function (el) { revealObs.observe(el); });

} else {
  // Fallback: sem observer — mostra tudo
  document.querySelectorAll('.fade-up, .stagger-card').forEach(function (el) {
    el.classList.add('visible');
  });
  document.querySelectorAll('.reveal-wrapper').forEach(function (el) {
    el.classList.add('visible');
  });
}

// ── Failsafe fade-up (elementos visíveis ao carregar) ──
window.addEventListener('load', function () {
  setTimeout(function () {
    document.querySelectorAll('.fade-up:not(.visible), .stagger-card:not(.visible)').forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('visible');
      }
    });
  }, 120);
});

// ── Fallback imagens ──
window.__imgFallback = function (img, label) {
  var wrap = document.createElement('div');
  wrap.className = 'img-svg-fallback';
  wrap.setAttribute('role', 'img');
  wrap.setAttribute('aria-label', label || 'Imagem indisponível');
  var gid = 'g' + Date.now() + Math.random().toString(36).substr(2, 5);
  wrap.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">' +
    '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0%" stop-color="currentColor" stop-opacity="0.10"/>' +
    '<stop offset="100%" stop-color="currentColor" stop-opacity="0.04"/>' +
    '</linearGradient></defs>' +
    '<rect width="800" height="600" fill="url(#' + gid + ')"/>' +
    '<text x="400" y="310" text-anchor="middle" font-family="DM Serif Display, serif" font-size="18" fill="currentColor" opacity="0.35">' + label + '</text>' +
    '</svg>';
  img.replaceWith(wrap);
};
