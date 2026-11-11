/* ==========================================================================
   nav.js : menu principal. Pastille en haut, rail à gauche ou barre en bas selon le défilement et la largeur, avec l'animation de transmutation entre les trois. Surligne aussi la section visible.
   ========================================================================== */
(function (P) {
  'use strict';
  var U = P.util,
    D = U.D,
    RM = U.RM,
    q = U.q,
    qa = U.qa,
    el = U.el;

  /* Surligne dans le menu la section visible. */
  var navState = null;
  function navdock() {
    var nav = q('.nav'),
      list = nav && q('.nav__links', nav);
    if (!nav || !list) return null;
    if (navState) {
      navState.sync();
      return navState;
    }
    var R = D.documentElement,
      top = q('.top'),
      links = qa('a[href^="#"]', list);
    var secs = links.map(function (a) {
      return D.getElementById(a.getAttribute('href').slice(1));
    });
    var real = secs.filter(Boolean).length >= 2;
    var cur = '',
      forced = '',
      peekT = 0,
      last = -1,
      raf = 0,
      morphing = false,
      mCleanup = null;
    links.forEach(function (a, k) {
      a.style.setProperty('--k', k);
    });
    list.style.setProperty('--n', links.length);

    /* Le menu passe de la pastille du haut à un rail latéral (grand écran) ou à une barre du bas (tablette, mobile). */
    function target() {
      var w = innerWidth;
      if (forced) return forced;
      if (w <= 760) return 'bottom';
      if (!real) return 'top';
      var past = scrollY > (cur === 'top' || !cur ? 150 : 70);
      return past ? (w >= 1180 ? 'side' : 'bottom') : 'top';
    }
    function hold() {
      if (!top) return;
      if (innerWidth <= 760) {
        top.style.minHeight = '';
        return;
      }
      if (cur === 'top' || !cur) {
        top.style.minHeight = '';
        top.style.minHeight = top.offsetHeight + 'px';
      }
    }
    function setState(s) {
      var first = !cur;
      hold();
      cur = s;
      R.setAttribute('data-nav', s);
      R.removeAttribute('data-nav-phase');
      R.removeAttribute('data-nav-m');
      if (first) {
        R.setAttribute('data-nav-boot', '');
        setTimeout(function () {
          R.removeAttribute('data-nav-boot');
        }, 900);
      } else window.dispatchEvent(new Event('resize'));
    }
    /* Transmutation : la pastille du haut se déforme en rail (ou en barre), les libellés s'envolent vers leur icône, des éclats de papier jaillissent. Et inversement. */
    function endMorph() {
      if (mCleanup) {
        var f = mCleanup;
        mCleanup = null;
        f();
      }
      morphing = false;
      R.removeAttribute('data-nav-phase');
    }
    function rectOf(e) {
      var r = e.getBoundingClientRect();
      return { l: r.left, t: r.top, w: r.width, h: r.height };
    }
    function radOf(e, r) {
      return Math.min(parseFloat(getComputedStyle(e).borderTopLeftRadius) || 0, Math.min(r.w, r.h) / 2);
    }
    function iconPt(a, st) {
      var r = a.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: st === 'bottom' ? r.top + r.height * 0.38 : r.top + r.height / 2 };
    }
    function topLook(a, o) {
      var l = q('.roll i', a) || a,
        cs = getComputedStyle(l),
        ca = getComputedStyle(a);
      o.r = rectOf(a);
      o.font = cs.font;
      o.color = ca.color;
      o.ls = cs.letterSpacing;
      o.bg = ca.backgroundColor;
    }
    function morph(to) {
      var from = cur,
        D0 = 780,
        reveal = 0.6,
        brand = q('.nav__brand', nav);
      var fromBox = from === 'top' ? nav : list,
        fr = rectOf(fromBox);
      fr.r = radOf(fromBox, fr);
      var brF = brand ? rectOf(brand) : null;
      var lab = links.map(function (a) {
        var t = ((q('.roll i', a) || a).textContent || '').trim(),
          o = { txt: t };
        if (from === 'top') {
          topLook(a, o);
        } else {
          o.pFrom = iconPt(a, from);
          var cb = getComputedStyle(a);
          o.ic = {
            mask: cb.getPropertyValue('--ic'),
            color: cb.color,
            on: a.getAttribute('aria-current') === 'true',
            r: rectOf(a),
            st: from,
          };
        }
        return o;
      });
      morphing = true;
      R.setAttribute('data-nav-m', '');
      R.setAttribute('data-nav-phase', 'morph');
      hold();
      cur = to;
      R.setAttribute('data-nav', to);
      window.dispatchEvent(new Event('resize'));
      var toBox = to === 'top' ? nav : list,
        tr = rectOf(toBox);
      tr.r = radOf(toBox, tr);
      var brT = brand ? rectOf(brand) : null;
      links.forEach(function (a, k) {
        var o = lab[k];
        if (to === 'top') {
          topLook(a, o);
        } else o.p = iconPt(a, to);
      });
      var layer = el('div', 'nav-morph'),
        body = el('i', 'nav-morph__b'),
        anims = [],
        timers = [];
      layer.setAttribute('aria-hidden', 'true');
      layer.appendChild(body);
      D.body.appendChild(layer);
      function px(r) {
        return {
          left: r.l + 'px',
          top: r.t + 'px',
          width: r.w + 'px',
          height: r.h + 'px',
          borderRadius: r.r + 'px',
        };
      }
      var k0 = px(fr),
        k1 = px(tr);
      k0.opacity = 1;
      k1.opacity = 0;
      anims.push(
        body.animate([k0, { opacity: 1, offset: reveal }, k1], {
          duration: D0,
          easing: 'cubic-bezier(.6,0,.2,1.12)',
          fill: 'both',
        }),
      );
      /* libellés : portés par la métamorphose, du texte vers l'icône, ou de l'icône vers le texte au retour */
      var EZ = 'cubic-bezier(.6,0,.2,1)';
      lab.forEach(function (o, k) {
        if (!o.r) return; /* rail <-> barre : pas de mots, seulement des icônes */
        var g = el('span', 'nav-morph__t'),
          c = o.r,
          dir = k % 2 ? 1 : -1,
          ic = to === 'top' ? o.pFrom : o.p;
        g.textContent = o.txt;
        g.style.font = o.font || '';
        g.style.color = o.color || '';
        g.style.letterSpacing = o.ls || '';
        if (o.bg && o.bg !== 'rgba(0, 0, 0, 0)') g.style.background = o.bg;
        g.style.left = c.l + 'px';
        g.style.top = c.t + 'px';
        g.style.width = c.w + 'px';
        g.style.height = c.h + 'px';
        layer.appendChild(g);
        var off =
          'translate(' +
          (ic.x - (c.l + c.w / 2)) +
          'px,' +
          (ic.y - (c.t + c.h / 2)) +
          'px) scale(.3) rotate(' +
          dir * 90 +
          'deg)';
        anims.push(
          g.animate(
            to === 'top'
              ? [
                  { transform: off, opacity: 0 },
                  { opacity: 0, offset: 0.35 },
                  { transform: 'none', opacity: 1, offset: 0.62 },
                  { transform: 'none', opacity: 0 },
                ]
              : [
                  { transform: 'none', opacity: 1 },
                  { opacity: 1, offset: 0.4 },
                  { transform: off, opacity: 0 },
                ],
            { duration: D0 - k * 20, delay: k * 20, easing: EZ, fill: 'both' },
          ),
        );
      });
      /* icônes et pastille d'encre : elles se défont en mots (retour en haut), ou glissent d'une forme de menu à l'autre (rail <-> barre) */
      if (from !== 'top')
        lab.forEach(function (o, k) {
          var m = o.ic,
            c = o.r,
            dir = k % 2 ? 1 : -1,
            back = to === 'top';
          if (!m) return;
          var tx = back ? c.l + c.w / 2 : o.p.x,
            ty = back ? c.t + c.h / 2 : o.p.y,
            ang = back ? -dir * 90 : dir * 180,
            sc = back ? '.3' : '.6',
            parts = [],
            fade = back ? 0.55 : 0.8;
          var fly =
            'translate(' +
            (tx - o.pFrom.x) +
            'px,' +
            (ty - o.pFrom.y) +
            'px) scale(' +
            sc +
            ') rotate(' +
            ang +
            'deg)';
          if (m.on) {
            var d = el('span', 'nav-morph__d'),
              side = m.st === 'side',
              dr = side
                ? { l: m.r.l + (m.r.w - 44) / 2, t: m.r.t + (m.r.h - 44) / 2, w: 44, h: 44 }
                : { l: m.r.l, t: m.r.t + 6, w: m.r.w, h: 50 };
            d.style.cssText =
              'left:' + dr.l + 'px;top:' + dr.t + 'px;width:' + dr.w + 'px;height:' + dr.h + 'px';
            var dfly =
              'translate(' +
              (tx - (dr.l + dr.w / 2)) +
              'px,' +
              (ty - (dr.t + dr.h / 2)) +
              'px) scale(' +
              sc +
              ') rotate(' +
              ang +
              'deg)';
            layer.insertBefore(d, layer.children[1]);
            parts.push([d, dfly]);
          }
          var ig = el('span', 'nav-morph__i');
          ig.style.left = o.pFrom.x - 11 + 'px';
          ig.style.top = o.pFrom.y - 11 + 'px';
          ig.style.background = m.color;
          ig.style.setProperty('-webkit-mask', m.mask + ' center/contain no-repeat');
          ig.style.setProperty('mask', m.mask + ' center/contain no-repeat');
          layer.appendChild(ig);
          parts.push([ig, fly]);
          parts.forEach(function (x) {
            anims.push(
              x[0].animate(
                [
                  { transform: 'none', opacity: 1 },
                  { opacity: 0, offset: fade },
                  { transform: x[1], opacity: 0 },
                ],
                { duration: D0 - k * 20, delay: k * 20, easing: EZ, fill: 'both' },
              ),
            );
          });
        });
      /* nom : il rétrécit vers le haut du rail, ou en revient */
      if (brand && brF && brT && (from === 'top' || to === 'top')) {
        var bg = brand.cloneNode(true);
        bg.className = 'nav__brand nav-morph__n';
        bg.removeAttribute('href');
        bg.setAttribute('aria-hidden', 'true');
        layer.appendChild(bg);
        var bb = to === 'top' ? brT : brF;
        bg.style.left = bb.l + 'px';
        bg.style.top = bb.t + 'px';
        var rc = to === 'top' ? fr : tr,
          ddx = rc.l + rc.w / 2 - (bb.l + bb.w / 2),
          ddy = rc.t + 18 - (bb.t + bb.h / 2),
          away = 'translate(' + ddx + 'px,' + ddy + 'px) scale(.2)';
        anims.push(
          bg.animate(
            to === 'top'
              ? [
                  { transform: away, opacity: 0 },
                  { opacity: 0, offset: 0.35 },
                  { transform: 'none', opacity: 1, offset: 0.62 },
                  { transform: 'none', opacity: 0 },
                ]
              : [
                  { transform: 'none', opacity: 1 },
                  { opacity: 1, offset: 0.35 },
                  { transform: away, opacity: 0 },
                ],
            { duration: D0, easing: EZ, fill: 'both' },
          ),
        );
      }
      /* éclats de papier */
      var cols = ['var(--cf1)', 'var(--cf2)', 'var(--cf3)', 'var(--cf4)'],
        cx = tr.l + tr.w / 2,
        cy = tr.t + tr.h / 2,
        n = 9,
        m;
      for (m = 0; m < n; m++) {
        var sp = el('i', 'nav-morph__s'),
          an = (m / n) * Math.PI * 2 + 0.4,
          dist = 56 + (m % 3) * 26 + Math.min(40, Math.max(tr.w, tr.h) / 14);
        sp.style.left = cx + 'px';
        sp.style.top = cy + 'px';
        sp.style.setProperty('--c', cols[m % cols.length]);
        layer.appendChild(sp);
        anims.push(
          sp.animate(
            [
              { transform: 'translate(0,0) scale(0) rotate(0)', opacity: 0 },
              { opacity: 1, offset: 0.25 },
              {
                transform:
                  'translate(' +
                  Math.cos(an) * dist +
                  'px,' +
                  Math.sin(an) * dist * 0.8 +
                  'px) scale(1) rotate(' +
                  (m % 2 ? 200 : -200) +
                  'deg)',
                opacity: 0,
              },
            ],
            { duration: 620, delay: D0 * 0.34 + m * 14, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'both' },
          ),
        );
      }
      timers.push(
        setTimeout(function () {
          R.removeAttribute('data-nav-phase');
          toBox.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, easing: 'ease-out' });
        }, D0 * reveal),
      );
      timers.push(
        setTimeout(function () {
          endMorph();
          schedule();
        }, D0 + 60),
      );
      mCleanup = function () {
        timers.forEach(clearTimeout);
        anims.forEach(function (x) {
          try {
            x.cancel();
          } catch (e) {}
        });
        if (layer.parentNode) layer.parentNode.removeChild(layer);
      };
    }
    function apply() {
      var t = target();
      if (t === cur) return;
      if (!cur || RM || !(D.body.animate && nav.animate)) {
        setState(t);
        return;
      }
      if (morphing) return;
      morph(t);
    }
    function frame() {
      raf = 0;
      apply();
      if (!real) {
        /* Sans vraies sections (aperçu, page partielle) : la pastille suit le lien marqué aria-current. */
        var c = 0,
          j;
        for (j = 0; j < links.length; j++) if (links[j].getAttribute('aria-current') === 'true') c = j;
        list.style.setProperty('--i', c);
        list.style.setProperty('--p', c);
        links.forEach(function (a, m) {
          a.classList.toggle('is-past', m < c);
        });
        return;
      }
      var y = scrollY,
        vh = innerHeight,
        line = y + vh * 0.4,
        n = secs.length,
        i = 0,
        t = 0,
        k,
        tp = [];
      for (k = 0; k < n; k++) tp.push(secs[k] ? secs[k].getBoundingClientRect().top + y : Infinity);
      for (k = 0; k < n; k++) if (tp[k] <= line) i = k;
      if (y + vh >= D.documentElement.scrollHeight - 6) {
        i = n - 1;
        t = 0;
      } else if (i < n - 1 && isFinite(tp[i + 1]))
        t = Math.max(0, Math.min(1, (line - tp[i]) / (tp[i + 1] - tp[i])));
      list.style.setProperty('--i', i);
      list.style.setProperty('--p', (i + t).toFixed(3));
      if (i !== last) {
        links.forEach(function (a, j) {
          if (j === i) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
          a.classList.toggle('is-past', j < i);
          a.classList.remove('is-peek');
        });
        if (last !== -1 && cur === 'side') {
          links[i].classList.add('is-peek');
          clearTimeout(peekT);
          peekT = setTimeout(function () {
            links[i].classList.remove('is-peek');
          }, 1400);
        }
        last = i;
      }
    }
    function schedule() {
      if (!raf) raf = requestAnimationFrame(frame);
    }
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    addEventListener('load', schedule);
    navState = {
      sync: schedule,
      force: function (s) {
        forced = s || '';
        apply();
        schedule();
      },
    };
    frame();
    return navState;
  }

  function roll(root) {
    qa('.nav__links a', root).forEach(function (a) {
      if (q('.roll', a)) return;
      var t = a.textContent.trim();
      a.innerHTML = '<span class="roll"><i>' + t + '</i><i aria-hidden="true">' + t + '</i></span>';
    });
  }

  P.navdock = navdock;
  P.roll = roll;
})((window.Portfolio = window.Portfolio || {}));
