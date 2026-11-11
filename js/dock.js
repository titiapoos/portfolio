/* ==========================================================================
   dock.js : petit panneau de réglages en bas à gauche (mode nuit, grille).
   ========================================================================== */
(function (P) {
  'use strict';
  var U = P.util,
    D = U.D,
    q = U.q,
    el = U.el;
  var guides = P.guides;

  function theme(t) {
    var r = D.documentElement,
      cur = r.getAttribute('data-theme') || 'light';
    r.setAttribute('data-theme', t || (cur === 'dark' ? 'light' : 'dark'));
  }

  function dock() {
    if (q('.dock')) return;
    var d = el(
      'div',
      'dock',
      '<button type="button" class="dock__t" aria-expanded="false" aria-label="Réglages d’affichage"></button><button type="button" data-act="grid" aria-pressed="false">Grille · G</button><button type="button" data-act="theme"></button>',
    );
    d.setAttribute('role', 'group');
    d.setAttribute('aria-label', 'Réglages d’affichage');
    D.body.appendChild(d);
    var g = guides(),
      gb = q('[data-act="grid"]', d),
      tb = q('[data-act="theme"]', d),
      dt = q('.dock__t', d);
    function lab() {
      tb.textContent = D.documentElement.getAttribute('data-theme') === 'dark' ? 'Mode papier' : 'Mode nuit';
    }
    function tog() {
      var on = g.classList.toggle('on');
      gb.setAttribute('aria-pressed', String(on));
    }
    function openDock(on) {
      d.classList.toggle('is-open', on);
      dt.setAttribute('aria-expanded', String(on));
    }
    dt.addEventListener('click', function () {
      openDock(!d.classList.contains('is-open'));
    });
    D.addEventListener('click', function (e) {
      if (d.classList.contains('is-open') && !d.contains(e.target)) openDock(false);
    });
    D.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && d.classList.contains('is-open')) {
        openDock(false);
        dt.focus();
      }
      var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName || '');
      if ((e.key === 'g' || e.key === 'G') && !e.metaKey && !e.ctrlKey && !e.altKey && !typing) tog();
    });
    gb.addEventListener('click', tog);
    tb.addEventListener('click', function () {
      theme();
      lab();
    });
    lab();
  }

  function overlays(o) {
    o = o || {};
    if (o.progress !== false) P.progress();
    if (o.dock !== false) dock();
  }

  P.theme = theme;
  P.dock = dock;
  P.overlays = overlays;
})((window.Portfolio = window.Portfolio || {}));
