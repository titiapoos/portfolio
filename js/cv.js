/* ==========================================================================
   cv.js : le parcours (CV). Un pion avance sur un chemin tracé en SVG pendant que la page défile ; le bloc reste épinglé jusqu'à l'arrivée.
   ========================================================================== */
(function (P) {
  'use strict';
  var U = P.util,
    D = U.D,
    RM = U.RM,
    NS = U.NS,
    q = U.q,
    qa = U.qa,
    clamp = U.clamp;
  var confetti = P.confetti;

  function cv(box) {
    var svg = q('.cv__svg', box),
      ctl = q('.cv__ctl', box),
      play = q('.cv__play', box),
      scrub = q('.cv__scrub', box),
      xpN = q('.cv__xpn', box),
      bar = q('.cv__bar i', box),
      hint = q('.cv__hint', box);
    var items = qa('.cv__item', box),
      mode = box.getAttribute('data-mode') || 'auto';
    var sec = box.closest('.cv-sec'),
      pin = box.closest('.cv-pin'),
      stick = box.closest('.cv-stick'),
      head = sec ? q('.sec-head', sec) : null;
    /* rang de chaque carte dans sa propre colonne : le serpentin lit les cartes deux par deux, école à gauche, pro à droite */
    /* couleur de chaque étape : rose pour l'école (cv__item--school), vert pour l'expérience (cv__item--pro), sinon celle de sa colonne */
    function isPro(it) {
      if (it.classList.contains('cv__item--pro')) return true;
      if (it.classList.contains('cv__item--school')) return false;
      return !!it.closest('.cv__col--pro');
    }
    var kIdx = items.map(function (it) {
      return qa('.cv__item', it.closest('.cv__col')).indexOf(it);
    });
    svg.innerHTML =
      '<path class="cv__edge"/><path class="cv__track"/><path class="cv__trail"/><path class="cv__trail cv__trail--b"/><path class="cv__core"/><g class="cv__handles"></g><g class="cv__anchors"></g>' +
      '<polygon class="cv__goal" points=""/><g class="pawn"></g><text class="pop" text-anchor="middle"></text>';
    var unitN = q('.cv__unit', sec || box);
    /* Pion, train, ciseaux ou surligneur : la variable CSS --cv-mover (tokens.css) choisit le mobile. */
    var MOVERS = {
      pawn: '<ellipse class="pawn__shadow" cx="0" cy="18" rx="17" ry="5"/><g class="pawn__bob"><path class="pawn__body" d="M-5,-4 L5,-4 Q5,5 10,9 Q15,11 15,16 L-15,16 Q-15,11 -10,9 Q-5,5 -5,-4 Z"/><circle class="pawn__body" cx="0" cy="-13" r="10"/></g>',
      train:
        '<g class="pawn__bob"><rect class="mv-b" x="-50" y="-8" width="17" height="16" rx="3"/><path class="mv-line" d="M-33,0 H-28"/><rect class="mv-a" x="-28" y="-10" width="40" height="20" rx="5"/><rect class="mv-b" x="-24" y="-6" width="13" height="12" rx="2"/><circle class="mv-c" cx="-1" cy="0" r="5.5"/><path class="mv-b" d="M12,-8 L25,0 L12,8 Z"/><circle class="mv-lamp" cx="23" cy="0" r="2.2"/></g>',
      scissors:
        '<g class="pawn__bob"><g class="sc sc--a"><path class="mv-a" d="M0,0 L34,-4.5 L34,-1 Z"/><path class="mv-line" d="M0,0 L-13,-9"/><circle class="mv-c" cx="-19" cy="-13" r="7"/></g><g class="sc sc--b"><path class="mv-a" d="M0,0 L34,4.5 L34,1 Z"/><path class="mv-line" d="M0,0 L-13,9"/><circle class="mv-c" cx="-19" cy="13" r="7"/></g><circle class="mv-lamp" cx="0" cy="0" r="3"/></g>',
      marker:
        '<g class="pawn__bob"><g transform="rotate(-38)"><path class="mv-b" d="M0,0 L13,-7 L13,7 Z"/><rect class="mv-a" x="13" y="-9" width="42" height="18" rx="3"/><rect class="mv-b" x="22" y="-9" width="7" height="18"/><rect class="mv-c" x="55" y="-10" width="15" height="20" rx="3"/></g></g>',
    };
    var C = {
      mover: 'pawn',
      rot: false,
      lift: 10,
      goal: 'star',
      gain: '+100 XP',
      win: 'LEVEL UP !',
      step: 100,
      unit: 'XP',
      hint: 'Défile pour avancer ↓',
      done: 'Niveau terminé · continue ↓',
    };
    function applyCfg() {
      var cs = getComputedStyle(box);
      function v(n, d) {
        var s = (cs.getPropertyValue(n) || '').trim();
        return s ? s.replace(/^(["'])([\s\S]*)\1$/, '$2') : d;
      }
      var m = v('--cv-mover', 'pawn');
      if (!MOVERS[m]) m = 'pawn';
      C.mover = m;
      C.rot = v('--cv-rot', '0') === '1';
      C.lift = parseFloat(v('--cv-lift', m === 'pawn' ? '10' : '0')) || 0;
      C.goal = v('--cv-goal', 'star');
      C.gain = v('--cv-gain', '+100 XP');
      C.win = v('--cv-win', 'LEVEL UP !');
      C.step = parseFloat(v('--cv-step', '100')) || 100;
      C.unit = v('--cv-unit', 'XP');
      C.hint = v('--cv-hint', 'Défile pour avancer ↓');
      C.done = v('--cv-done', 'Niveau terminé · continue ↓');
      if (pawn.getAttribute('data-m') !== m) {
        pawn.innerHTML = MOVERS[m];
        pawn.setAttribute('data-m', m);
      }
      box.classList.toggle('cv--rot', C.rot);
      if (unitN) unitN.textContent = C.unit;
    }
    var core = q('.cv__core', svg),
      edge = q('.cv__edge', svg),
      track = q('.cv__track', svg),
      trail = q('.cv__trail', svg),
      trailB = q('.cv__trail--b', svg),
      gH = q('.cv__handles', svg),
      gA = q('.cv__anchors', svg),
      goal = q('.cv__goal', svg),
      pawn = q('.pawn', svg),
      pop = q('.pop', svg);
    var L = 1,
      stops = [],
      anchors = [],
      lit = [],
      pts = { endX: 0, endY: 0 },
      p = 0,
      playing = true,
      last = 0,
      hold = 0,
      vis = true,
      done = false,
      DUR = 14000,
      xp = 0;
    var snake = false,
      lock = false,
      travel = 0,
      stickTop = 0,
      viewH = 0,
      target = 0,
      easing = false,
      bound = 0,
      nSchool = items.filter(function (it) {
        return !it.closest('.cv__col--pro');
      }).length;

    function poly(cx, cy, r, n, k) {
      var a = [],
        i;
      for (i = 0; i < n * 2; i++) {
        var rr = i % 2 ? r * k : r,
          an = -Math.PI / 2 + (i * Math.PI) / n;
        a.push((cx + rr * Math.cos(an)).toFixed(1) + ',' + (cy + rr * Math.sin(an)).toFixed(1));
      }
      return a.join(' ');
    }
    function star(cx, cy, r) {
      if (C.goal === 'burst') return poly(cx, cy, r * 1.08, 12, 0.8);
      if (C.goal === 'spark') return poly(cx, cy, r * 1.15, 4, 0.34);
      if (C.goal === 'diamond')
        return (
          cx +
          ',' +
          (cy - r * 1.1) +
          ' ' +
          (cx + r) +
          ',' +
          cy +
          ' ' +
          cx +
          ',' +
          (cy + r * 1.1) +
          ' ' +
          (cx - r) +
          ',' +
          cy
        );
      return poly(cx, cy, r, 5, 0.48);
    }

    /* Grand écran : le tracé serpente entre les rangées de cartes, et la section reste collée tant que le parcours n'est pas fini. */
    function layout() {
      snake = box.clientWidth >= 940;
      box.classList.toggle('cv--snake', snake);
      if (sec) sec.classList.toggle('is-snake', snake);
      items.forEach(function (it, k) {
        if (snake) it.style.setProperty('--k', kIdx[k]);
        else it.style.removeProperty('--k');
      });
      lock = mode === 'scroll' && !RM && !!(sec && pin && stick && head) && innerHeight >= 560;
      if (sec) sec.classList.toggle('is-lock', lock);
      /* pendant le verrou, le compteur d'XP quitte la boîte pour rester dans l'en-tête */
      if (ctl) {
        if (lock && ctl.parentNode !== head) head.appendChild(ctl);
        else if (!lock && ctl.parentNode !== box) box.appendChild(ctl);
      }
      if (lock) {
        stickTop = parseFloat(getComputedStyle(stick).top) || 0;
        viewH = stick.clientHeight - head.offsetHeight;
      } else {
        box.style.transform = '';
        if (pin) pin.style.height = '';
      }
    }

    /* tracé à coins arrondis ; chaque coin montre ses poignées de Bézier, clin d'œil à la plume d'Illustrator */
    function rounded(V, r) {
      var d = 'M' + V[0].x.toFixed(1) + ',' + V[0].y.toFixed(1),
        hs = '',
        i;
      for (i = 1; i < V.length - 1; i++) {
        var a = V[i - 1],
          b = V[i],
          c = V[i + 1],
          l1 = Math.hypot(a.x - b.x, a.y - b.y),
          l2 = Math.hypot(c.x - b.x, c.y - b.y),
          rr = Math.min(r, l1 / 2, l2 / 2);
        var p1 = { x: b.x + ((a.x - b.x) / l1) * rr, y: b.y + ((a.y - b.y) / l1) * rr },
          p2 = { x: b.x + ((c.x - b.x) / l2) * rr, y: b.y + ((c.y - b.y) / l2) * rr };
        d +=
          ' L' +
          p1.x.toFixed(1) +
          ',' +
          p1.y.toFixed(1) +
          ' Q' +
          b.x.toFixed(1) +
          ',' +
          b.y.toFixed(1) +
          ' ' +
          p2.x.toFixed(1) +
          ',' +
          p2.y.toFixed(1);
        hs +=
          '<polyline class="cv__handle" points="' +
          p1.x.toFixed(1) +
          ',' +
          p1.y.toFixed(1) +
          ' ' +
          b.x.toFixed(1) +
          ',' +
          b.y.toFixed(1) +
          ' ' +
          p2.x.toFixed(1) +
          ',' +
          p2.y.toFixed(1) +
          '"/>' +
          '<circle class="cv__hdot" cx="' +
          b.x.toFixed(1) +
          '" cy="' +
          b.y.toFixed(1) +
          '" r="4"/>' +
          '<rect class="cv__hdot" x="' +
          (p1.x - 4).toFixed(1) +
          '" y="' +
          (p1.y - 4).toFixed(1) +
          '" width="8" height="8"/><rect class="cv__hdot" x="' +
          (p2.x - 4).toFixed(1) +
          '" y="' +
          (p2.y - 4).toFixed(1) +
          '" width="8" height="8"/>';
      }
      var e = V[V.length - 1];
      return { d: d + ' L' + e.x.toFixed(1) + ',' + e.y.toFixed(1), hs: hs };
    }

    var lastSig = '';
    function build() {
      layout();
      /* rien n'a changé (par exemple le menu qui change d'état) : on ne recalcule pas le tracé */
      var sig = [
        box.clientWidth,
        box.clientHeight,
        snake,
        lock,
        stickTop,
        innerHeight,
        items.length ? items[items.length - 1].offsetTop : 0,
        getComputedStyle(box).getPropertyValue('--cv-mover'),
      ].join('|');
      if (sig === lastSig) return;
      lastSig = sig;
      var W = box.clientWidth,
        H = box.clientHeight,
        narrow = W < 700,
        withCtl = ctl && ctl.parentNode === box && getComputedStyle(ctl).display !== 'none';
      var x1 = narrow ? 26 : 38,
        x2 = W - 38,
        top = 12,
        R = 46,
        yb = H - (withCtl ? 92 : 38),
        d,
        hs = '',
        marks = [];
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      gA.innerHTML = '';
      stops = [];
      anchors = [];
      if (snake) {
        /* un couloir au-dessus de chaque rangée, un dernier sous la dernière ; les rails des deux côtés les relient en alternance */
        var G = parseFloat(getComputedStyle(box).rowGap) || 64,
          rows = [],
          ch = [],
          V,
          c,
          r;
        items.forEach(function (it, k) {
          var rk = kIdx[k],
            t = it.offsetTop,
            b = t + it.offsetHeight;
          if (!rows[rk]) rows[rk] = { top: t, bot: b };
          else {
            rows[rk].top = Math.min(rows[rk].top, t);
            rows[rk].bot = Math.max(rows[rk].bot, b);
          }
        });
        for (r = 0; r < rows.length; r++) ch.push(rows[r].top - G / 2);
        ch.push(rows[rows.length - 1].bot + G / 2);
        V = [
          { x: x1, y: Math.min(top + 28, ch[0] - 56) },
          { x: x1, y: ch[0] },
        ];
        for (c = 0; c < ch.length; c++) {
          var xe = c % 2 === 0 ? x2 : x1;
          V.push({ x: xe, y: ch[c] });
          if (c < ch.length - 1) V.push({ x: xe, y: ch[c + 1] });
        }
        var rd = rounded(V, 28);
        d = rd.d;
        hs = rd.hs;
        pts.endX = V[V.length - 1].x;
        pts.endY = V[V.length - 1].y;
        items.forEach(function (it, k) {
          marks.push({
            x: it.offsetLeft + it.offsetWidth / 2,
            y: ch[kIdx[k]],
            pro: isPro(it),
          });
        });
      } else if (narrow) {
        d = 'M' + x1 + ',' + top + ' L' + x1 + ',' + (H - 26);
        pts.endX = x1;
        pts.endY = H - 26;
      } else {
        d =
          'M' +
          x1 +
          ',' +
          top +
          ' L' +
          x1 +
          ',' +
          (yb - R) +
          ' C' +
          x1 +
          ',' +
          (yb - R * 0.45) +
          ' ' +
          (x1 + R * 0.45) +
          ',' +
          yb +
          ' ' +
          (x1 + R) +
          ',' +
          yb +
          ' L' +
          (x2 - R) +
          ',' +
          yb +
          ' C' +
          (x2 - R * 0.45) +
          ',' +
          yb +
          ' ' +
          x2 +
          ',' +
          (yb - R * 0.45) +
          ' ' +
          x2 +
          ',' +
          (yb - R) +
          ' L' +
          x2 +
          ',' +
          top;
        pts.endX = x2;
        pts.endY = top;
        [
          [x1, yb - R, 0, 1],
          [x1 + R, yb, 1, 0],
          [x2 - R, yb, 1, 0],
          [x2, yb - R, 0, 1],
        ].forEach(function (a) {
          var h = 24,
            ax = a[0],
            ay = a[1],
            dx = a[2] * h,
            dy = a[3] * h;
          hs +=
            '<line class="cv__handle" x1="' +
            (ax - dx) +
            '" y1="' +
            (ay - dy) +
            '" x2="' +
            (ax + dx) +
            '" y2="' +
            (ay + dy) +
            '"/>' +
            '<circle class="cv__hdot" cx="' +
            (ax - dx) +
            '" cy="' +
            (ay - dy) +
            '" r="4"/><circle class="cv__hdot" cx="' +
            (ax + dx) +
            '" cy="' +
            (ay + dy) +
            '" r="4"/>' +
            '<rect class="cv__hdot" x="' +
            (ax - 4) +
            '" y="' +
            (ay - 4) +
            '" width="8" height="8"/>';
        });
      }
      if (!snake)
        items.forEach(function (it) {
          var col = it.closest('.cv__col'),
            onRight = !narrow && col.classList.contains('cv__col--pro');
          marks.push({
            x: onRight ? x2 : x1,
            y: col.offsetTop + it.offsetTop + it.offsetHeight / 2,
            pro: isPro(it),
          });
        });
      gH.innerHTML = hs;
      [edge, track, trail, trailB, core].forEach(function (n) {
        n.setAttribute('d', d);
      });
      L = track.getTotalLength();
      goal.setAttribute(
        'points',
        snake ? star(pts.endX, pts.endY, 22) : star(pts.endX, pts.endY + (narrow ? 22 : -4), 22),
      );
      /* le tracé est échantillonné une seule fois (getPointAtLength est coûteux) ; chaque étape cherche ensuite son point le plus proche dans l'échantillon */
      var samp = [],
        sx,
        STEP = 12;
      for (sx = 0; sx <= L; sx += STEP) {
        var sp = track.getPointAtLength(sx);
        samp.push(sp.x, sp.y);
      }
      marks.forEach(function (m) {
        var best = 0,
          bd = 1e12,
          ii,
          dd;
        for (ii = 0; ii < samp.length; ii += 2) {
          dd = (samp[ii] - m.x) * (samp[ii] - m.x) + (samp[ii + 1] - m.y) * (samp[ii + 1] - m.y);
          if (dd < bd) {
            bd = dd;
            best = (ii / 2) * STEP;
          }
        }
        /* affinage autour du meilleur échantillon */
        var c0 = best,
          lo = Math.max(0, c0 - STEP),
          hi = Math.min(L, c0 + STEP),
          sl;
        for (sl = lo; sl <= hi; sl += 2) {
          var pt = track.getPointAtLength(sl);
          dd = (pt.x - m.x) * (pt.x - m.x) + (pt.y - m.y) * (pt.y - m.y);
          if (dd < bd) {
            bd = dd;
            best = sl;
          }
        }
        stops.push(best);
        var c2 = D.createElementNS(NS, 'circle');
        c2.setAttribute('class', 'cv__anchor' + (m.pro ? ' cv__anchor--pro' : ''));
        c2.setAttribute('cx', m.x);
        c2.setAttribute('cy', m.y);
        c2.setAttribute('r', 13);
        gA.appendChild(c2);
        anchors.push(c2);
      });
      /* cyan jusqu'à la dernière étape scolaire, magenta ensuite (le serpentin reste cyan, les points prennent la couleur de leur carte) */
      bound = snake ? L : nSchool > 0 ? stops[nSchool - 1] : 0;
      if (lock) {
        /* serpentin : trajet proportionnel au tracé ; tablette et mobile : la section reste collée le temps de défiler tout le parcours, à vitesse naturelle */
        var ovh = Math.max(0, box.offsetHeight - viewH);
        travel = snake
          ? Math.round(clamp(L * 0.3, innerHeight * 1.2, 3400))
          : Math.round(clamp(ovh + innerHeight * 0.7, innerHeight * 1.2, 7000));
        pin.style.height = stick.offsetHeight + travel + 'px';
      }
      lit = [];
      if (mode === 'scroll') p = target = scrollP();
      render(true);
    }

    function popAt(x, y, txt) {
      if (RM) return;
      pop.textContent = txt;
      pop.setAttribute('x', x);
      pop.setAttribute('y', y);
      pop.classList.remove('go');
      void pop.getBoundingClientRect();
      pop.classList.add('go');
    }

    /* pendant le verrou, la fenêtre est plus basse que le parcours : la caméra suit le pion */
    function camera(y) {
      var ov = lock ? Math.max(0, box.offsetHeight - viewH) : 0,
        c = ov ? clamp(y - viewH * 0.5, 0, ov) : 0,
        t = c ? 'translateY(' + (-c).toFixed(1) + 'px)' : '';
      if (box.style.transform !== t) box.style.transform = t;
    }

    function render(silent) {
      var len = p * L,
        pt = track.getPointAtLength(len);
      var ang = 0;
      if (C.rot) {
        var q1 = track.getPointAtLength(Math.min(L, len + 5)),
          q0 = track.getPointAtLength(Math.max(0, len - 5));
        ang = Math.atan2(q1.y - q0.y, q1.x - q0.x) * 57.29578;
      }
      pawn.setAttribute(
        'transform',
        'translate(' +
          pt.x.toFixed(1) +
          ',' +
          (pt.y - C.lift).toFixed(1) +
          ')' +
          (ang ? ' rotate(' + ang.toFixed(1) + ')' : ''),
      );
      trail.style.strokeDasharray = Math.min(len, bound).toFixed(1) + ' ' + L.toFixed(1);
      trailB.style.strokeDasharray = Math.max(0, len - bound).toFixed(1) + ' ' + L.toFixed(1);
      trailB.style.strokeDashoffset = (-bound).toFixed(1);
      trailB.style.opacity = len - bound > 0.5 ? 1 : 0;
      camera(pt.y);
      var n = 0;
      items.forEach(function (it, i) {
        var on = len >= stops[i] - 2;
        if (on) n++;
        if (on !== lit[i]) {
          lit[i] = on;
          it.classList.toggle('is-lit', on);
          anchors[i].classList.toggle('is-lit', on);
          if (on && !silent) popAt(pt.x, pt.y - 34, C.gain);
        }
      });
      xp = n * C.step;
      if (xpN) xpN.textContent = String(xp);
      if (bar) bar.style.width = (p * 100).toFixed(1) + '%';
      if (scrub) scrub.value = Math.round(p * 1000);
      if (hint) {
        var ht = p >= 0.995 ? C.done : C.hint;
        if (hint.textContent !== ht) hint.textContent = ht;
      }
      if (p >= 0.995 && !done) {
        done = true;
        if (!silent) {
          popAt(pt.x, pt.y - 44, C.win);
          var r = svg.getBoundingClientRect();
          confetti(r.left + pt.x, r.top + pt.y, 16);
        }
      } else if (p < 0.9) done = false;
    }

    function frame(t) {
      if (playing && mode === 'auto' && vis) {
        var dt = last ? Math.min(60, t - last) : 0;
        last = t;
        if (hold > 0) {
          hold -= dt;
          if (hold <= 0) {
            p = 0;
            done = false;
          }
        } else {
          p += dt / DUR;
          if (p >= 1) {
            p = 1;
            hold = 2600;
          }
        }
        render();
      } else last = 0;
      requestAnimationFrame(frame);
    }
    function setPlaying(v) {
      playing = v;
      last = 0;
      if (play) {
        play.textContent = v ? 'Pause' : 'Lecture';
        play.setAttribute('aria-label', v ? 'Mettre le parcours en pause' : 'Relancer le parcours');
      }
    }
    if (play)
      play.addEventListener('click', function () {
        setPlaying(!playing);
      });
    if (scrub)
      scrub.addEventListener('input', function () {
        setPlaying(false);
        hold = 0;
        p = scrub.value / 1000;
        render();
      });

    /* avancement voulu d'après le défilement : pendant le verrou, tout le trajet de la section collée ; sinon, la position de la boîte */
    function scrollP() {
      if (RM) return 1;
      if (lock) {
        var rp = pin.getBoundingClientRect(),
          lead = 40,
          tail = 170;
        return clamp((stickTop - rp.top - lead) / Math.max(1, travel - lead - tail), 0, 1);
      }
      var r = box.getBoundingClientRect();
      return clamp((innerHeight * 0.62 - r.top) / (r.height - innerHeight * 0.1), 0, 1);
    }
    function ease() {
      var dlt = target - p;
      if (Math.abs(dlt) < 0.0008) {
        p = target;
        easing = false;
        render();
        return;
      }
      p += dlt * 0.16;
      render();
      requestAnimationFrame(ease);
    }
    function onScroll(now) {
      var v = scrollP();
      if (lock && now !== true) {
        target = v;
        if (!easing) {
          easing = true;
          requestAnimationFrame(ease);
        }
      } else {
        p = target = v;
        render(now === true);
      }
    }
    if (mode === 'scroll') addEventListener('scroll', onScroll, { passive: true });
    var rz = 0;
    addEventListener('resize', function () {
      cancelAnimationFrame(rz);
      rz = requestAnimationFrame(build);
    });
    if ('IntersectionObserver' in window)
      new IntersectionObserver(
        function (es) {
          es.forEach(function (x) {
            vis = x.isIntersecting;
          });
        },
        { threshold: 0.2 },
      ).observe(box);
    if ('ResizeObserver' in window)
      new ResizeObserver(function () {
        build();
      }).observe(box);
    (D.fonts && D.fonts.ready ? D.fonts.ready : Promise.resolve()).then(function () {
      applyCfg();
      build();
      if (mode === 'scroll') onScroll(true);
    });
    applyCfg();
    build();
    if (RM) {
      p = 1;
      if (play) play.hidden = true;
      playing = false;
      render(true);
    } else if (mode === 'auto') requestAnimationFrame(frame);
  }

  P.cv = cv;
})((window.Portfolio = window.Portfolio || {}));
