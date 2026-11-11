/* ==========================================================================
   main.js : branche tout. À charger en dernier.
   ========================================================================== */
(function (P) {
  'use strict';
  var U = P.util,
    D = U.D,
    q = U.q,
    qa = U.qa;

  /* Règle les images de la page (<img data-img="nom">) sur les chemins de content.js */
  function images(root) {
    qa('img[data-img]', root).forEach(function (i) {
      i.src = P.IMG[i.getAttribute('data-img')] || '';
    });
  }

  /* Effets communs à toute la page */
  P.init = function (root) {
    root = root || D;
    images(root);
    P.cursor();
    P.reveal(root);
    P.tilt(root);
    P.magnet(root);
    P.roll(root);
    P.dice(root);
    P.marquee(root);
    P.navdock();
  };

  P.navForce = function (s) {
    var n = P.navdock();
    if (n) n.force(s);
  }; /* force « top », « side » ou « bottom » (tests) */
  P.spy = function () {
    P.navdock();
  };

  function boot() {
    P.hero(q('.hero'));
    P.cv(D.getElementById('cvbox'));
    P.tools(D.getElementById('tools'));
    P.projects(D.getElementById('grid'), D.getElementById('layer'));
    P.init();
    P.overlays();
  }

  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', boot);
  else boot();
})((window.Portfolio = window.Portfolio || {}));
