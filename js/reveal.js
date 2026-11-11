/* ==========================================================================
   reveal.js : les éléments marqués data-reveal apparaissent quand ils entrent dans l'écran.
   ========================================================================== */
(function (P) {
  'use strict';
  var U = P.util,
    RM = U.RM,
    qa = U.qa;

  function reveal(root) {
    var els = qa('[data-reveal]', root);
    if (RM || !('IntersectionObserver' in window)) {
      els.forEach(function (e) {
        e.classList.add('is-in');
      });
      return;
    }
    var io = new IntersectionObserver(
      function (es) {
        es.forEach(function (x) {
          if (x.isIntersecting) {
            x.target.classList.add('is-in');
            io.unobserve(x.target);
          }
        });
      },
      { threshold: 0.01, rootMargin: '0px 0px -40px 0px' },
    );
    els.forEach(function (e) {
      io.observe(e);
    });
  }

  P.reveal = reveal;
})((window.Portfolio = window.Portfolio || {}));
