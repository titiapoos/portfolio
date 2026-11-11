/* ==========================================================================
   projects.js : grille de projets et volet de détail (précédent / suivant, clavier, focus piégé).
   Dans le volet, un clic sur une image l'affiche en entier (visionneuse, ← → pour passer d'une image à l'autre).
   Sous les images, les fichiers du projet (champ files de content.js) : aperçu dans le navigateur ou téléchargement.
   ========================================================================== */
(function (P) {
  'use strict';
  var U = P.util,
    D = U.D,
    RM = U.RM,
    q = U.q,
    qa = U.qa,
    pad = U.pad;
  var confetti = P.confetti;
  var wipe = P.wipe;

  function projects(grid, layer, data) {
    data = data || P.sample.projects;
    var BAR = {
      c: 'var(--p1)',
      m: 'var(--p2)',
      y: 'var(--p3)',
      s: 'var(--sand)',
      k: 'var(--p4)',
    }; /* couleur de la barre du volet, par projet */
    grid.innerHTML = data
      .map(function (p, i) {
        return (
          '<button type="button" class="project" data-c="' +
          p.c +
          '" data-reveal data-tilt data-cursor="Ouvrir" aria-haspopup="dialog" data-i="' +
          i +
          '" style="--d:' +
          (i % 2 ? 120 : 0) +
          'ms">' +
          '<span class="project__top"><span class="tag">' +
          p.tag +
          '</span><span class="no">' +
          pad(i + 1) +
          '</span></span>' +
          '<span class="project__media"><img src="' +
          P.IMG[p.img] +
          '" alt=""></span>' +
          '<span class="project__foot"><span class="project__t"><strong>' +
          p.title +
          '</strong><span>' +
          p.meta +
          '</span></span><span class="project__go" aria-hidden="true">↗</span></span></button>'
        );
      })
      .join('');

    layer.innerHTML =
      '<aside class="panel" role="dialog" aria-modal="true" aria-labelledby="pt"><div class="panel__bar"><span class="mono panel__count"></span><div class="panel__nav">' +
      '<button type="button" class="panel__btn" data-d="-1" aria-label="Projet précédent">←</button><button type="button" class="panel__btn" data-d="1" aria-label="Projet suivant">→</button>' +
      '<button type="button" class="panel__close">Fermer ✕</button></div></div><div class="panel__body"></div></aside>' +
      '<div class="zoom" role="dialog" aria-modal="true" aria-label="Image agrandie" hidden><span class="mono zoom__count"></span>' +
      '<button type="button" class="zoom__close" aria-label="Fermer l’image">Fermer ✕</button>' +
      '<button type="button" class="zoom__nav zoom__nav--prev" data-z="-1" aria-label="Image précédente">←</button>' +
      '<img class="zoom__img" alt="">' +
      '<button type="button" class="zoom__nav zoom__nav--next" data-z="1" aria-label="Image suivante">→</button></div>';
    var panel = q('.panel', layer),
      bar = q('.panel__bar', layer),
      body = q('.panel__body', layer),
      count = q('.panel__count', layer),
      closeBtn = q('.panel__close', layer),
      cur = 0,
      lastBtn = null,
      hideT;
    var zoom = q('.zoom', layer),
      zImg = q('.zoom__img', zoom),
      zCount = q('.zoom__count', zoom),
      zClose = q('.zoom__close', zoom),
      zList = [],
      zi = 0,
      zFrom = null,
      zoomT;
    /* bouton qui entoure une image du volet : k est son rang dans la visionneuse (0 = visuel principal) */
    function zoomable(g, k, alt) {
      return (
        '<button type="button" class="panel__zoomable" data-k="' +
        k +
        '" data-cursor="Agrandir" aria-label="Agrandir l’image : ' +
        alt +
        '"><img src="' +
        P.IMG[g] +
        '" alt="' +
        alt +
        '"><span class="panel__zoomhint" aria-hidden="true">⤢</span></button>'
      );
    }

    /* fichiers du projet, sous les images : « Aperçu » l'ouvre dans un nouvel onglet (le navigateur affiche les PDF),
       « Télécharger » l'enregistre. Un lien externe (http…) n'a que « Ouvrir ». */
    function docs(files) {
      if (!files || !files.length) return '';
      return (
        '<div class="panel__docs"><span class="mono">Documents</span>' +
        files
          .map(function (f, k) {
            var ext = /^https?:/.test(f.file),
              type = f.type || (ext ? 'Lien' : (f.file.split('.').pop() || '').toUpperCase()),
              open =
                '<a class="doc__btn" href="' +
                f.file +
                '" target="_blank" rel="noopener" data-cursor="' +
                (ext ? 'Ouvrir' : 'Aperçu') +
                '" aria-label="' +
                (ext ? 'Ouvrir' : 'Aperçu') +
                ' : ' +
                f.label +
                '">' +
                (ext ? 'Ouvrir' : 'Aperçu') +
                ' <span aria-hidden="true">↗</span></a>',
              save = ext
                ? ''
                : '<a class="doc__btn doc__btn--save" href="' +
                  f.file +
                  '" download="' +
                  f.file.split('/').pop() +
                  '" data-cursor="Télécharger" aria-label="Télécharger : ' +
                  f.label +
                  '">Télécharger <span aria-hidden="true">↓</span></a>';
            return (
              '<div class="doc" style="--c:var(--k' +
              ((k % 3) + 1) +
              ')"><span class="doc__t"><strong>' +
              f.label +
              '</strong><span class="mono">' +
              type +
              '</span></span><span class="doc__acts">' +
              open +
              save +
              '</span></div>'
            );
          })
          .join('') +
        '</div>'
      );
    }

    /* force l'enregistrement sur l'ordinateur : le fichier est lu puis donné au navigateur comme un fichier à sauver,
       sinon certains navigateurs ouvrent le PDF au lieu de le télécharger. Si la lecture échoue
       (site ouvert en double-clic, fichier sur un autre site), on retombe sur le lien normal dans un nouvel onglet. */
    function save(a) {
      var href = a.getAttribute('href'),
        name = a.getAttribute('download');
      fetch(href)
        .then(function (r) {
          if (!r.ok) throw r;
          return r.blob();
        })
        .then(function (blob) {
          var url = URL.createObjectURL(new Blob([blob], { type: 'application/octet-stream' })),
            l = D.createElement('a');
          l.href = url;
          l.download = name;
          D.body.appendChild(l);
          l.click();
          l.remove();
          setTimeout(function () {
            URL.revokeObjectURL(url);
          }, 1000);
        })
        .catch(function () {
          window.open(href, '_blank', 'noopener');
        });
    }

    function fill(i) {
      cur = (i + data.length) % data.length;
      var p = data[cur];
      bar.style.setProperty('--c', BAR[p.c]);
      count.textContent = 'Projet ' + pad(cur + 1) + ' / ' + pad(data.length);
      body.innerHTML =
        '<span class="mono">' +
        p.tag +
        ' · ' +
        p.year +
        '</span><h2 id="pt">' +
        p.title +
        '</h2>' +
        '<figure class="panel__hero">' +
        zoomable(p.img, 0, 'Visuel principal : ' + p.title) +
        '</figure>' +
        '<dl class="fiche"><div><dt class="mono">Année</dt><dd>' +
        p.year +
        '</dd></div><div><dt class="mono">Format</dt><dd>' +
        p.format +
        '</dd></div><div><dt class="mono">Rôle</dt><dd>' +
        p.role +
        '</dd></div><div><dt class="mono">Outils</dt><dd>' +
        p.tools +
        '</dd></div></dl>' +
        '<div class="panel__text">' +
        p.text
          .map(function (t) {
            return '<p>' + t + '</p>';
          })
          .join('') +
        '</div>' +
        '<div class="panel__gallery">' +
        p.gallery
          .map(function (g, k) {
            return (
              '<figure>' + zoomable(g, k + 1, 'Visuel ' + (k + 2) + ' : ' + p.title) + '</figure>'
            );
          })
          .join('') +
        '</div>' +
        docs(p.files);
      var h = q('.panel__hero', body);
      setTimeout(
        function () {
          h.classList.add('is-dev');
        },
        RM ? 0 : 120,
      );
      panel.scrollTop = 0;
    }
    function show(i) {
      clearTimeout(hideT);
      fill(i);
      layer.hidden = false;
      void layer.offsetWidth;
      layer.classList.add('is-open');
      D.documentElement.style.overflow = 'hidden';
      closeBtn.focus();
    }
    function zoomGo(k) {
      zi = (k + zList.length) % zList.length;
      zImg.src = P.IMG[zList[zi]];
      zImg.alt = 'Visuel ' + (zi + 1) + ' : ' + data[cur].title;
      zCount.textContent = 'Image ' + pad(zi + 1) + ' / ' + pad(zList.length);
    }
    function zoomOpen(k) {
      clearTimeout(zoomT);
      zList = [data[cur].img].concat(data[cur].gallery);
      zFrom = D.activeElement;
      zoom.classList.toggle('is-single', zList.length < 2);
      zoomGo(k);
      zoom.hidden = false;
      void zoom.offsetWidth;
      zoom.classList.add('is-open');
      zClose.focus();
    }
    function zoomClose(instant) {
      if (zoom.hidden) return;
      zoom.classList.remove('is-open');
      if (instant === true || RM) zoom.hidden = true;
      else
        zoomT = setTimeout(function () {
          zoom.hidden = true;
        }, 300);
      if (zFrom && instant !== true) zFrom.focus();
    }
    function zoomed() {
      return zoom.classList.contains('is-open');
    }
    function hide() {
      zoomClose(true);
      layer.classList.remove('is-open');
      D.documentElement.style.overflow = '';
      hideT = setTimeout(
        function () {
          layer.hidden = true;
        },
        RM ? 0 : 560,
      );
      if (lastBtn) lastBtn.focus();
    }
    function swap(d) {
      body.classList.add('is-swap');
      setTimeout(
        function () {
          fill(cur + d);
          body.classList.remove('is-swap');
        },
        RM ? 0 : 260,
      );
    }

    grid.addEventListener('click', function (e) {
      var b = e.target.closest('.project');
      if (!b) return;
      lastBtn = b;
      b.classList.remove('is-pressed');
      void b.offsetWidth;
      b.classList.add('is-pressed');
      var i = +b.getAttribute('data-i'),
        r = b.getBoundingClientRect();
      confetti(e.clientX || r.left + r.width / 2, e.clientY || r.top + r.height / 2, 10);
      wipe(function () {
        show(i);
      });
    });
    layer.addEventListener('click', function (e) {
      if (e.target === layer) hide();
      var z = e.target.closest('.panel__zoomable');
      if (z) zoomOpen(+z.getAttribute('data-k'));
      var sv = e.target.closest('.doc__btn--save');
      if (sv) {
        e.preventDefault();
        save(sv);
      }
      var zn = e.target.closest('[data-z]');
      if (zn) zoomGo(zi + +zn.getAttribute('data-z'));
      if (e.target === zoom || e.target.closest('.zoom__close')) zoomClose();
      var d = e.target.closest('[data-d]');
      if (d) swap(+d.getAttribute('data-d'));
    });
    closeBtn.addEventListener('click', hide);
    D.addEventListener('keydown', function (e) {
      if (layer.hidden) return;
      if (zoomed()) {
        /* visionneuse ouverte : les touches pilotent les images, le focus reste dans la visionneuse */
        if (e.key === 'Escape') zoomClose();
        else if (e.key === 'ArrowRight') zoomGo(zi + 1);
        else if (e.key === 'ArrowLeft') zoomGo(zi - 1);
        else if (e.key === 'Tab') {
          var zb = qa('button', zoom).filter(function (b) {
            return b.offsetParent;
          });
          var at = zb.indexOf(D.activeElement);
          e.preventDefault();
          zb[(at + (e.shiftKey ? -1 : 1) + zb.length) % zb.length].focus();
        }
        return;
      }
      if (e.key === 'Escape') hide();
      else if (e.key === 'ArrowRight') swap(1);
      else if (e.key === 'ArrowLeft') swap(-1);
      else if (e.key === 'Tab') {
        var f = qa('button, a[href]', panel);
        if (!f.length) return;
        if (e.shiftKey && D.activeElement === f[0]) {
          e.preventDefault();
          f[f.length - 1].focus();
        } else if (!e.shiftKey && D.activeElement === f[f.length - 1]) {
          e.preventDefault();
          f[0].focus();
        }
      }
    });
    return { open: show, close: hide };
  }

  P.projects = projects;
})((window.Portfolio = window.Portfolio || {}));
