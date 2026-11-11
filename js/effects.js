/* ==========================================================================
   effects.js : effets d'interaction : inclinaison 3D, boutons magnétiques, confettis, dé, rideau de transition.
   ========================================================================== */
(function (P) {
  'use strict';
  var U = P.util,
    D = U.D,
    RM = U.RM,
    FINE = U.FINE,
    q = U.q,
    qa = U.qa,
    el = U.el;

  /* ---------- Inclinaison 3D ---------- */
  function tilt(root) {
    if (RM || !FINE) return;
    qa('[data-tilt]', root).forEach(function (n) {
      if (n.__tilt) return;
      n.__tilt = 1;
      n.addEventListener('pointermove', function (e) {
        var r = n.getBoundingClientRect(),
          px = (e.clientX - r.left) / r.width - 0.5,
          py = (e.clientY - r.top) / r.height - 0.5;
        n.style.setProperty('--ry', (px * 9).toFixed(2) + 'deg');
        n.style.setProperty('--rx', (-py * 7).toFixed(2) + 'deg');
      });
      n.addEventListener('pointerleave', function () {
        n.style.setProperty('--rx', '0deg');
        n.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ---------- Boutons magnétiques ---------- */
  var mags = [],
    magOn = false;
  function magnet(root) {
    if (RM || !FINE) return;
    qa('[data-magnet]', root).forEach(function (n) {
      if (n.__mag) return;
      n.__mag = { n: n, x: 0, y: 0, tx: 0, ty: 0 };
      mags.push(n.__mag);
    });
    if (magOn || !mags.length) return;
    magOn = true;
    var run = false;
    function loop() {
      var busy = false;
      mags.forEach(function (m) {
        m.x += (m.tx - m.x) * 0.18;
        m.y += (m.ty - m.y) * 0.18;
        var settled = Math.abs(m.tx - m.x) < 0.05 && Math.abs(m.ty - m.y) < 0.05 && !m.tx && !m.ty;
        m.n.style.translate = settled ? '' : m.x.toFixed(2) + 'px ' + m.y.toFixed(2) + 'px';
        if (!settled) busy = true;
      });
      if (busy) requestAnimationFrame(loop);
      else run = false;
    }
    D.addEventListener('pointermove', function (e) {
      mags.forEach(function (m) {
        var r = m.n.getBoundingClientRect(),
          cx = r.left + r.width / 2,
          cy = r.top + r.height / 2,
          dx = e.clientX - cx,
          dy = e.clientY - cy,
          reach = Math.max(r.width, r.height) / 2 + 50;
        if (Math.hypot(dx, dy) < reach) {
          m.tx = dx * 0.28;
          m.ty = dy * 0.28;
        } else {
          m.tx = 0;
          m.ty = 0;
        }
      });
      if (!run) {
        run = true;
        requestAnimationFrame(loop);
      }
    });
  }

  /* ---------- Confettis CMJN ---------- */
  function confetti(x, y, n) {
    if (RM) return;
    n = n || 18;
    var cols = ['var(--cf1)', 'var(--cf2)', 'var(--cf3)', 'var(--cf4)']; /* couleurs définies dans base.css */
    for (var i = 0; i < n; i++) {
      var p = el('i'),
        s = 7 + Math.random() * 8;
      p.setAttribute('aria-hidden', 'true');
      p.style.cssText =
        'position:fixed;left:' +
        x +
        'px;top:' +
        y +
        'px;width:' +
        s +
        'px;height:' +
        s +
        'px;margin:' +
        -s / 2 +
        'px 0 0 ' +
        -s / 2 +
        'px;border:2px solid var(--ink);border-radius:' +
        (i % 2 ? '50%' : '3px') +
        ';background:' +
        cols[i % 4] +
        ';z-index:290;pointer-events:none';
      D.body.appendChild(p);
      var a = Math.random() * Math.PI * 2,
        d = 70 + Math.random() * 120,
        dx = Math.cos(a) * d,
        dy = Math.sin(a) * d - 50;
      var an = p.animate(
        [
          { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
          {
            transform:
              'translate(' +
              dx.toFixed(0) +
              'px,' +
              (dy + 100).toFixed(0) +
              'px) rotate(' +
              (Math.random() * 600 - 300).toFixed(0) +
              'deg)',
            opacity: 0,
          },
        ],
        { duration: 750 + Math.random() * 450, easing: 'cubic-bezier(.2,.8,.2,1)' },
      );
      an.onfinish = (function (n) {
        return function () {
          n.remove();
        };
      })(p);
    }
  }

  /* ---------- Dé ---------- */
  var PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
  function dice(root) {
    qa('.die', root).forEach(function (d) {
      if (d.__die) return;
      d.__die = 1;
      if (!d.children.length) d.innerHTML = '<i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>';
      var pips = qa('i', d),
        v = +d.getAttribute('data-v') || 5;
      function set(k) {
        v = k;
        d.setAttribute('data-v', k);
        d.setAttribute('aria-label', 'Lancer le dé, face ' + k);
        pips.forEach(function (p, i) {
          p.classList.toggle('on', PIPS[k].indexOf(i) > -1);
        });
      }
      set(v);
      d.addEventListener('click', function () {
        var k;
        do {
          k = 1 + Math.floor(Math.random() * 6);
        } while (k === v);
        set(k);
        d.classList.remove('is-roll');
        void d.offsetWidth;
        d.classList.add('is-roll');
        var r = d.getBoundingClientRect();
        confetti(r.left + r.width / 2, r.top + r.height / 2);
      });
    });
  }

  /* ---------- Rideau CMJN ---------- */
  var wiping = false;
  function wipe(mid) {
    if (RM) {
      if (mid) mid();
      return;
    }
    if (wiping) return;
    wiping = true;
    var w = q('.wipe');
    if (!w) {
      w = el('div', 'wipe', '<i></i><i></i><i></i><i></i>');
      w.setAttribute('aria-hidden', 'true');
      D.body.appendChild(w);
    }
    w.className = 'wipe in';
    setTimeout(function () {
      if (mid) mid();
      w.className = 'wipe out';
      setTimeout(function () {
        w.className = 'wipe';
        wiping = false;
      }, 680);
    }, 700);
  }

  P.tilt = tilt;
  P.magnet = magnet;
  P.confetti = confetti;
  P.dice = dice;
  P.wipe = wipe;
})((window.Portfolio = window.Portfolio || {}));
