/* ==========================================================================
   atmosphere.js : curseur à étiquette, barre de progression en bas, grille de repérage (touche G).
   ========================================================================== */
(function (P) {
  'use strict';
  var U = P.util,
    D = U.D,
    RM = U.RM,
    FINE = U.FINE,
    q = U.q,
    qa = U.qa,
    el = U.el,
    clamp = U.clamp;

  function cursor() {
    if (RM || !FINE || q('.cursor')) return;
    var c = el('div', 'cursor', '<span></span>'),
      lab = c.firstChild,
      x = -100,
      y = -100,
      tx = x,
      ty = y,
      on = false;
    c.setAttribute('aria-hidden', 'true');
    D.body.appendChild(c);
    (function loop() {
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      c.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      requestAnimationFrame(loop);
    })();
    D.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      tx = e.clientX;
      ty = e.clientY;
      if (!on) {
        on = true;
        x = tx;
        y = ty;
        c.classList.add('is-on');
      }
      var t = e.target.closest
        ? e.target.closest('[data-cursor],a,button,input,label,[role="button"]')
        : null;
      var text = t && t.getAttribute('data-cursor');
      c.classList.toggle('is-label', !!text);
      c.classList.toggle('is-link', !!t && !text);
      if (text) lab.textContent = text;
    });
    D.documentElement.addEventListener('mouseleave', function () {
      on = false;
      c.classList.remove('is-on');
    });
  }

  function progress() {
    if (q('.progress')) return;
    var p = el('div', 'progress', '<i></i><i></i><i></i><i></i>'),
      seg = qa('i', p);
    p.setAttribute('aria-hidden', 'true');
    D.body.appendChild(p);
    function upd() {
      var h = D.documentElement.scrollHeight - innerHeight,
        v = h > 0 ? scrollY / h : 0;
      seg.forEach(function (s, i) {
        s.style.setProperty('--p', clamp(v * 4 - i, 0, 1).toFixed(3));
      });
    }
    addEventListener('scroll', upd, { passive: true });
    addEventListener('resize', upd);
    upd();
  }

  function guides() {
    var g = q('.guides');
    if (!g) {
      g = el('div', 'guides');
      g.setAttribute('aria-hidden', 'true');
      D.body.appendChild(g);
    }
    return g;
  }

  P.cursor = cursor;
  P.progress = progress;
  P.guides = guides;
})((window.Portfolio = window.Portfolio || {}));
