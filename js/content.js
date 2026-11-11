/* ==========================================================================
   content.js : TES CONTENUS. C'est le fichier à modifier pour remplir le site :
   images, outils et projets. Le texte du reste de la page est dans index.html.
   ========================================================================== */
(function (P) {
  'use strict';

  /* Visuels : remplace les fichiers de assets/img/ ou change les chemins ci-dessous. */
  var IMG = {
    a: 'assets/img/duckpire/dp_logo.jpg',
    ab :'assets/img/duckpire/dp_cdv.jpg',
    c: 'assets/img/comvid/ae_ppt_titre.jpg',
    d:'assets/img/atelierécriture/ae_ppt_titre.jpg',
    e: 'assets/img/bookclub/nvlpl_titre.jpg',
    f : 'assets/img/sociotech/twitch_titre.jpg',
    g : 'assets/img/narrative/apt.jpg',
    h: 'assets/img/fevesenmouv/fem_logo.jpg',
    ha: 'assets/img/fevesenmouv/fem_affiche.jpg',
    hb: 'assets/img/fevesenmouv/fem_prof_Page_1.jpg',
    hc: 'assets/img/fevesenmouv/fem_prof_Page_2.jpg',
    hd: 'assets/img/fevesenmouv/fem_prgmrecto.jpg',
    he: 'assets/img/fevesenmouv/fem_prgmverso.jpg',
    hf : 'assets/img/fevesenmouv/fem_insta1.jpg',
    hg : 'assets/img/fevesenmouv/fem_insta2.jpg',
    i: 'assets/img//salongeek/salon_geek.png',
    j:'assets/img/mediapart/mediapart_titre.jpg',
    portrait: 'assets/img/POOS_Titia.png',
  };

  var SAMPLE = {
    tools: [
      ['InDesign', 'Id', 1],
      ['Illustrator', 'Ai', 3],
      ['Photoshop', 'Ps', 2],
      ['Adobe Acrobat', 'Ac', 4],
      ['Canva', 'Ca', 5],
      ['Pack Office', 'Po', 4],
      ['Unity', 'Un', 2],
      ['Visual Studio Code', 'Vs', 3],
    ],
    levels: ['Notions', 'Débutant', 'Intermédiaire', 'Avancé', 'Expert'],
    projects: [

        {
        title: 'Campagne municipale 2026',
        tag: 'PAO · Communinity Manager',
        meta: 'Réalisation des supports de communication de la liste Fèves en Mouvement',
        img: 'h',
        c: 's',
        year: '2026',
        format: 'Affiche, Flyer, Dépliant, Réseaux sociaux',
        role: 'Chargée de communication',
        tools: 'Illustrator, Photoshop, Canva, Adobe Acrobat, Word, Excel, Instagram, facebook, Business Suite',
        text: [
          'Dans le cadre de la campagne municipale de 2026, j\'ai rejoint la liste Fèves en Mouvement',
          'J\'ai réalisé l\'intégralité des supports de communication, papier et numérique, pour cette liste en respectant les constraintes de temps et les règlementations.',
        ],
        gallery: ['ha', 'hb', 'hc','hd','he', 'hf', 'hg'],
      },

     {
        title: 'Salon Geek & Fantaisy',
        tag: 'Gestion de projet · Esport ',
        meta: 'Gestion du stand Kaio Gaming',
        img: 'i',
        c: 'k',
        year: '2026',
        format: 'Logistique, budgétisation, freeplay, tournois esport, animation',
        role: 'Chef de projet',
        tools: 'Logiciel interne "Ninja", Instagram, photographie, start.gg, Console Nintendo & Sony',
        text: [
          'Dans le cadre de mes fonctions au sein de l\'association Kaio Gaming, j\'ai piloté la préparation et l\'organisation de notre participation au Salon Geek & Fantaisy organisé par la MJC de Saint Avold.',
          'Ce projet m\'a amenée à gérer différents aspects de l\'événement : échanges avec les organisateurs, préparation logistique et matérielle, coordination des bénévoles et organisation des animations proposées au public.',
          'J\'ai également pris en charge une partie de la communication autour de notre présence, notamment la création de publications pour les réseaux sociaux, la promotion des animations et des tournois, ainsi que la gestion des inscriptions à ceux-ci.'
        ],
        gallery: [],
      },

      {
        title: 'Duck Pire',
        tag: 'Projet universiataire',
        meta: 'PAO · Illustrator, Photoshop, InDesign',
        img: 'a',
        c: 'c',
        year: '2026',
        format: 'Logo, Carte de visite, magazine',
        role: 'Etudiante',
        tools: 'Illustrator, Photoshop, InDesign',
        text: [
          'Dans le cadre d\'un enseignement de PAO, j\'ai réalisé les supports de communication d\'une entreprise fictive de canards d\'halloween.',
          'J\'ai réalisé l\'identité visuelle de la marque avec son logo aisni que son nom, un carousel pour les réseaux sociaux ainsi qu\'une carte de visite et la première page d\'un magazine.',
        ],
        gallery: ['ab'],
      },

      {
        title: 'Analyse critique du web',
        tag: 'Projet d\'analyse universitaire',
        meta: 'Réalisation d\'un dossier d\'analyse du site web de Médiapart en collaboration avec Ylan SLIMANE et Critina BORRACCINO',
        img: 'j',
        c: 'y',
        year: '2026',
        format: 'Dossier d\'analyse critique',
        role: 'Etudiante',
        tools: 'Twitch, Word, Adobe Acrobat, Power Point, Canva',
        text: [
          'En nous appuyant sur Guide pratique de conception et d’évaluation ergonomique de sites Web de F. Millerand et O. Martial (CRIM) ainsi que sur "Grille de contrôle qualité des contenus Web" de J.-M. Hardy, nous avons réalisé une analyse critique du site web de Médiapart. ',
          'L\'objectif de cette analyse était de comprendre le fonctionnement du site web et de relever les aspects positifs et négatifs liés à l\'utilisation de celui-ci.',
        ],
        gallery: [],
        files: [{label:'Présentation de l\'analyse', file:'assets/img/mediapart/présentation_mediapart.pdf'}, { label: 'Dossier d\'analyse Médiapart', file: 'assets/img/mediapart/dossier_mediapart.pdf' }],
      },

      {
        title: 'L\’influence des communautés vidéoludiques sur l\’identité',
        tag: 'Projet de recherche universitaire',
        meta: 'Réalisation d\'un dossier sous la direction de Isabelle Gavillet',
        img: 'c',
        c: 'y',
        year: '2025',
        format: 'Introduction de mémoire',
        role: 'Etudiante',
        tools: 'Cairn, Word, Adobe Acrobat',
        text: [
          'Dans le cadre de ma licence j\'ai réalisé un projet de recherche sur l\'influence que les communautés au sein des jeux vidéo peuvent avoir sur la création de l\'identité des joueurs et joueuses.',
          'Je me suis nottament appuyée sur les recherches de la CPDirSIC, V. Berry, I. Compiègne, B. Disarbois, P. Schmoll, S. Tisseron, O. Servais, S. Genvo.',
        ],
        gallery: [],
        files: [{ label: 'Présentation des recherches', file: 'assets/img/comvid/ae_ppt.pdf' }, {label: 'Introduction de mémoire', file: 'assets/img/comvid/ae_dossier.pdf'}],
      },

      {
        title: 'Analyse sociotechnique de la plateforme Twitch',
        tag: 'Projet d\'analyse universitaire',
        meta: 'Réalisation d\'un dossier en collaboration avec Lou MAROTTA',
        img: 'f',
        c: 'y',
        year: '2026',
        format: 'Dossier d\'analyse',
        role: 'Etudiante',
        tools: 'Twitch, Word, Adobe Acrobat, Power Point, Canva',
        text: [
          'En nous appuyant sur les recherches de Jouet et le Caroff, nous avons réalisé une analyse sociotechnique de la platforme Twitch.',
          'Nous nous sommes appuyé sur la grille d’analyse du dispositif sociotechnique en 3 sections (architecture-fonctionnement, participation, lien social) et 6 sous-sections (ligne éditoriale, gestion du site, contributions, personnalisation, discussion, partage).',
        ],
        gallery: [],
        files: [{label:'Présentation de l\'analyse', file:'assets/img/sociotech/présentation_twitch.pdf'}, { label: 'Dossier d\'analyse Twitch', file: 'assets/img/sociotech/dossier_twitch.pdf' }],
      },

     {
        title: 'Analyse narrative du jeu A Plague Tale : Innocence',
        tag: 'Projet d\'analyse',
        meta: 'Réalisation d\'un dossier',
        img: 'g',
        c: 'y',
        year: '2026',
        format: 'Dossier d\'analyse',
        role: 'Analyse narrative, mise en page',
        tools: 'Twitch, Word, Adobe Acrobat, Jeu vidéo',
        text: [
          'En m\'appuyant sur le cours magistral dispensé par S. Genvos, j\'ai réalisé une analyse narrative du jeux A Plague Tale : Innocence, édité par Focus Home Interactive et développé par Asobo Studio',
          'J\'y ai abordé les différentes inspirations des concepteurs, le monde diégétique et le monde extradiégétique (HUD...) ainsi que la mise en place des pouvoir-faire, devoir-faire et savoir-faire qui impactent le déroulement et le développement de la narration.',
        ],
        gallery: [],
        files: [{label:'Dossier d\'analyse', file:'assets/img/narrative/dossier_apt.pdf'}]
      },

      {
        title: 'Enquête sur les nouvelles partiques de lecture',
        tag: 'Enquête',
        meta: 'Réalisation d\'une enquête qualitative et quantitative',
        img: 'e',
        c: 'y',
        year: '2025',
        format: 'Réalisation d\'un dossier',
        role: 'Enquête, approche mixte',
        tools: 'Word, Adobe Acrobat, Google Forms, réseaux sociaux',
        text: [
          'Dans le cadre de ma licence j\'ai réalisé une enquête en groupe avec 3 camarades.',
          'Je me suis nottament occupé de l\'enqupete quantitative, c\'est-à-dire de rédaction, de la publication et de la diffusion du questionnaire ainsi que de la synthèse des résultats obtenus.',
        ],
        gallery: [],
        files: [{ label: 'Présentation des résultats', file: 'assets/img/bookclub/nvlpl_présentation.pdf' }]
      },
    ],
  };

  P.IMG = IMG;
  P.sample = SAMPLE;
})((window.Portfolio = window.Portfolio || {}));
