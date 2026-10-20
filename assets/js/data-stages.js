/* ==========================================================================
   Agenda des stages — fichier unique de données.
   Pour ajouter ou modifier un stage, éditer seulement ce tableau.
   Les stages sont triés automatiquement entre « à venir » et « passés »
   selon la date du jour (champ fin). Les stages sur mesure (sans date)
   restent toujours « à venir ».
   placesRestantes : null = « à compléter ».
   ========================================================================== */
window.ET_STAGES = [
  {
    id: "efficience-2027",
    titre: "Stage Efficience Triathlon",
    lieu: "Lac de Naussac",
    region: "Lozère",
    debut: "2027-04-18",
    fin: "2027-04-24",
    places: 8,
    placesRestantes: null,
    image: "nageuse-lac-bonnet",
    imageAlt: "Triathlète de dos face à un lac, bonnet de bain sur la tête",
    imageReelle: true,
    resume: "Six jours à charge d’entraînement élevée pour optimiser puissance, allure et fréquence cardiaque avant la saison, test d’effort compris.",
    tarifs: [
      { label: "Lancement", prix: 799, jusqua: "2026-12-01" },
      { label: "Anticipé", prix: 849, de: "2026-12-02", jusqua: "2027-02-17" },
      { label: "Normal", prix: 899, de: "2027-02-18" }
    ],
    prixNote: "Pension complète, base chambre double (hôtel ou chalet)",
    details: [
      ["Pour qui", "Triathlètes qui veulent mieux se connaître pour être plus performants, sur 6 jours à charge relativement élevée."],
      ["Prérequis", "Nager 1 000 m en continu en bassin · rouler seul 3 h à 27-28 km/h sur le plat en basse intensité · courir 1 h à 10 km/h sur le plat en basse intensité."],
      ["Contenus", "Test d’effort (lactate ou ventilation) en début de stage · contrôle du lactate en séance · Swimtalking · natation 3 à 4 séances en lignes d’eau privatisées · vélo 4 à 5 séances · course 3 à 4 séances · ateliers charge, nutrition, altitude et chaleur, récupération et sommeil."],
      ["Inclus", "Hébergement en pension complète, coaching all inclusive, analyse et retour des tests physiologiques, lignes d’eau privées, théorie. Chambre individuelle sur demande."],
      ["Options", "Massage, cryothérapie et pulsothérapie."],
      ["Hébergement", "Domaine de Naussac, entre Ardèche, Lozère et Haute-Loire."]
    ],
    lienSite: "https://www.efficiencetriathlontraining.com/stage-efficience-triathlon",
    page: null
  },
  {
    id: "montagne-2027",
    titre: "Stage Triathlon Montagne",
    lieu: "Briançon",
    region: "Hautes-Alpes",
    debut: "2027-07-03",
    fin: "2027-07-10",
    places: 8,
    placesRestantes: null,
    image: "lacets-col-aerien",
    imageAlt: "Vue aérienne d’une route de col en lacets dans les Hautes-Alpes",
    imageReelle: true,
    resume: "Une semaine dans les cols mythiques pour préparer Embrunman, l’Alpe d’Huez, Vercorsman ou l’Étape du Tour : technique de montée et de descente, pacing, nutrition.",
    prix: 840,
    prixNote: "Courses alimentaires en plus : 70 à 90 €",
    lienSite: "https://www.efficiencetriathlontraining.com/stagetriathlonmontagne",
    page: "stage-triathlon-montagne.html"
  },
  {
    id: "premium",
    titre: "Stage Ultra Premium",
    lieu: "Chez vous",
    region: "France, Suisse, Belgique",
    debut: null,
    fin: null,
    surMesure: true,
    places: 2,
    image: "coach-athlete-mesure",
    imageAlt: "Le coach relève une mesure sur la piste avec une athlète",
    imageReelle: true,
    resume: "Un stage construit pour vous seul (ou à deux) : je nage, je roule et je cours avec vous, et j’adapte chaque séance à votre niveau et à votre objectif.",
    prix: 1200,
    prixNote: "5 jours pour 1 personne · 1 800 € à deux · repas, hébergement et déplacement sur devis",
    details: [
      ["Pour qui", "Tous niveaux, du premier triathlon à l’Ironman, du XS au XXL."],
      ["Contenus", "Définis ensemble : analyse vidéo et correction dans l’eau, coordination de pédalage, puissance et force-vélocité, profil moteur en course, test lactate, stratégie nutritionnelle, chaleur et altitude."],
      ["Organisation", "Prise de rendez-vous, visio pour définir vos besoins, choix des dates et du lieu, puis toutes les séances et les moments du quotidien ensemble."],
      ["Où", "Je me déplace partout en France et dans les pays francophones : Suisse, Belgique."],
      ["Durée", "5 jours. Une durée plus courte est possible sur devis."]
    ],
    lienSite: "https://www.efficiencetriathlontraining.com/stagetriathlonpremiumsurmesure",
    page: null
  },
  {
    id: "technique-2026-03",
    titre: "Stage Technique natation et course à pied",
    lieu: "Voiron",
    region: "Isère",
    debut: "2026-03-28",
    fin: "2026-03-29",
    places: 10,
    placesRestantes: null,
    image: "analyse-video-crawl",
    imageAlt: "Analyse vidéo sous l’eau d’un nageur en crawl, angles annotés",
    imageReelle: true,
    resume: "Un week-end pour supprimer vos freins en crawl et construire une foulée adaptée à votre profil moteur, avec analyse vidéo et Swimtalking.",
    prix: 229,
    prixNote: "Tarif avant le 26/01/2026 · repas du midi inclus",
    details: [
      ["Pour qui", "Triathlètes, nageurs et coureurs, du débutant au confirmé."],
      ["Programme", "2 créneaux natation de 1 h 30 en lignes d’eau privatisées · Swimtalking · analyse vidéo · 2 séances course à pied de 1 h 30 (profil moteur, éducatifs, contrôle des intensités par lactate) · renforcement · apports théoriques."],
      ["Encadrement", "10 personnes maximum, 2 lignes d’eau minimum réservées."],
      ["Prochaines dates", "À compléter."]
    ],
    lienSite: "https://www.efficiencetriathlontraining.com/techniquenatationcourseapied",
    page: null
  },
  {
    id: "technique-2026-02",
    titre: "Stage Technique natation et course à pied",
    lieu: "Voiron",
    region: "Isère",
    debut: "2026-02-07",
    fin: "2026-02-08",
    places: 10,
    placesRestantes: null,
    image: "prelevement-lactate-doigt",
    imageAlt: "Prélèvement d’une goutte de sang au doigt pour mesurer le lactate",
    imageReelle: true,
    resume: "Première édition 2026 du week-end technique : crawl, foulée, renforcement et contrôle des intensités par lactate.",
    prix: 229,
    prixNote: "Tarif avant le 26/01/2026 · repas du midi inclus",
    lienSite: "https://www.efficiencetriathlontraining.com/techniquenatationcourseapied",
    page: null
  }
];
