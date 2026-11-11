/* ==========================================================================
   core.js : l'objet Portfolio et les petites fonctions partagées par tous les
   autres fichiers JS. À charger en premier.
   ========================================================================== */
(function (P) {
  'use strict';
  var D = document;

  P.util = {
    D: D,
    RM: !!(
      window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches
    ) /* l'utilisateur préfère moins d'animations */,
    FINE: !!(
      window.matchMedia && matchMedia('(pointer: fine)').matches
    ) /* souris ou trackpad (pas de tactile) */,
    NS: 'http://www.w3.org/2000/svg',
    q: function (s, r) {
      return (r || D).querySelector(s);
    },
    qa: function (s, r) {
      return [].slice.call((r || D).querySelectorAll(s));
    },
    el: function (tag, cls, html) {
      var e = D.createElement(tag);
      if (cls) e.className = cls;
      if (html != null) e.innerHTML = html;
      return e;
    },
    clamp: function (v, a, b) {
      return Math.max(a, Math.min(b, v));
    },
    pad: function (n) {
      return (n < 10 ? '0' : '') + n;
    },
  };

  D.documentElement.classList.add('js');
  if (P.util.RM) D.documentElement.classList.add('rm');
})((window.Portfolio = window.Portfolio || {}));
