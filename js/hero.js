/* ==========================================================================
   hero.js : accueil. Révélation du titre et léger décalage de couleur qui suit la souris.
   ========================================================================== */
(function (P) {
  'use strict';
  var U = P.util,
    RM = U.RM,
    FINE = U.FINE,
    q = U.q;

  function hero(root) {
    var name = q('.hero__name', root),
      cx = 15,
      cy = 10,
      tx = 3,
      ty = 2,
      vis = true,
      running = false;
    function draw() {
      if (name) {
        name.style.setProperty('--ox', cx.toFixed(2) + 'px');
        name.style.setProperty('--oy', cy.toFixed(2) + 'px');
      }
    }
    if (RM) {
      cx = 3;
      cy = 2;
      draw();
      root.classList.add('is-ready');
      return;
    }
    draw();
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        root.classList.add('is-ready');
      });
    });
    function tick() {
      if (!vis) {
        running = false;
        return;
      }
      cx += (tx - cx) * 0.07;
      cy += (ty - cy) * 0.07;
      draw();
      requestAnimationFrame(tick);
    }
    function go() {
      if (!running) {
        running = true;
        requestAnimationFrame(tick);
      }
    }
    if ('IntersectionObserver' in window)
      new IntersectionObserver(function (es) {
        es.forEach(function (x) {
          vis = x.isIntersecting;
          if (vis) go();
        });
      }).observe(root);
    go();
    if (FINE) {
      root.addEventListener('pointermove', function (e) {
        var r = root.getBoundingClientRect(),
          nx = (e.clientX - r.left) / r.width - 0.5,
          ny = (e.clientY - r.top) / r.height - 0.5;
        root.style.setProperty('--px', (-nx * 44).toFixed(1) + 'px');
        root.style.setProperty('--py', (-ny * 30).toFixed(1) + 'px');
        tx = -nx * 16;
        ty = -ny * 11;
      });
      root.addEventListener('pointerleave', function () {
        root.style.setProperty('--px', '0px');
        root.style.setProperty('--py', '0px');
        tx = 3;
        ty = 2;
      });
    }
  }

  P.hero = hero;
})((window.Portfolio = window.Portfolio || {}));
