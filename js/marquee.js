/* ==========================================================================
   marquee.js : bandes de texte défilantes (la vitesse suit le défilement de la page).
   ========================================================================== */
(function (P) {
  'use strict';
  var U = P.util,
    RM = U.RM,
    q = U.q,
    qa = U.qa;

  /* ---------- Bande défilante ---------- */
  var marqs = [],
    mqOn = false,
    lastY = 0,
    boost = 0;
  function marquee(root) {
    qa('.marquee', root).forEach(function (m) {
      if (m.__mq) return;
      var track = q('.marquee__track', m);
      if (!track) return;
      var base = track.innerHTML,
        o = {
          m: m,
          track: track,
          x: 0,
          period: 0,
          v: +m.getAttribute('data-speed') || 70,
          dir: m.getAttribute('data-dir') === 'right' ? 1 : -1,
          on: true,
        };
      m.__mq = o;
      function fill() {
        var w = m.clientWidth,
          reps = 2;
        track.innerHTML = base + base;
        track.style.transform = '';
        while (track.scrollWidth < w * 2 + 400 && reps < 12) {
          track.innerHTML += base;
          reps++;
        }
        var kids = track.children,
          per = kids.length / reps;
        o.period = reps > 1 ? kids[per].offsetLeft - kids[0].offsetLeft : track.scrollWidth;
        o.x = o.dir < 0 ? 0 : -o.period;
      }
      fill();
      if ('ResizeObserver' in window)
        new ResizeObserver(function () {
          fill();
        }).observe(m);
      if ('IntersectionObserver' in window)
        new IntersectionObserver(function (es) {
          es.forEach(function (x) {
            o.on = x.isIntersecting;
          });
        }).observe(m);
      marqs.push(o);
    });
    if (RM || mqOn || !marqs.length) return;
    mqOn = true;
    var last = performance.now();
    lastY = scrollY;
    (function frame(t) {
      var dt = Math.min(48, t - last) / 1000;
      last = t;
      var dy = Math.abs(scrollY - lastY);
      lastY = scrollY;
      boost += (Math.min(dy * 0.25, 5) - boost) * 0.12;
      marqs.forEach(function (o) {
        if (!o.on || !o.period) return;
        o.x += o.dir * o.v * (1 + boost) * dt;
        if (o.x <= -o.period) o.x += o.period;
        else if (o.x > 0) o.x -= o.period;
        o.track.style.transform = 'translate3d(' + o.x.toFixed(1) + 'px,0,0)';
      });
      requestAnimationFrame(frame);
    })(last);
  }

  P.marquee = marquee;
})((window.Portfolio = window.Portfolio || {}));
