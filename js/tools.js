/* ==========================================================================
   tools.js : liste des outils (puces à trame dont la densité suit le niveau).
   ========================================================================== */
(function (P) {
  'use strict';
  var sample = P.sample;

  function halftone(lv) {
    var s = '',
      f = 0.3 + lv * 0.14;
    for (var row = 0; row < 8; row++)
      for (var col = 0; col < 14; col++) {
        var x = 9 + col * 18 + (row % 2) * 9,
          y = 9 + row * 18,
          g = (col + (row % 2) * 0.5) / 13.5,
          r = Math.min(8.6, Math.max(0.9, (0.6 + g * 7.6) * f));
        s +=
          '<circle cx="' + x + '" cy="' + y + '" r="' + r.toFixed(1) + '" style="--i:' + (col + row) + '"/>';
      }
    return s;
  }
  function tools(list, data) {
    list.innerHTML = (data || sample.tools)
      .map(function (t, i) {
        var lv = t[2],
          word = sample.levels[lv - 1],
          dots = '';
        for (var k = 1; k <= 5; k++) dots += '<i' + (k <= lv ? ' class="on"' : '') + '></i>';
        return (
          '<li class="tool" data-reveal style="--d:' +
          (i % 4) * 80 +
          'ms"><div class="tool__chip"><svg viewBox="0 0 252 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
          halftone(lv) +
          '</svg><span class="tool__mono" aria-hidden="true">' +
          t[1] +
          '</span></div>' +
          '<div class="tool__body"><div class="tool__row"><h3>' +
          t[0] +
          '</h3><span class="lv" aria-hidden="true">' +
          dots +
          '</span></div>' +
          '<span class="mono" role="img" aria-label="Niveau ' +
          word.toLowerCase() +
          ', ' +
          lv +
          ' sur 5">' +
          word +
          ' · ' +
          lv +
          '/5</span></div></li>'
        );
      })
      .join('');
  }

  P.halftone = halftone;
  P.tools = tools;
})((window.Portfolio = window.Portfolio || {}));
