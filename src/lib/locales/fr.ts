/** French dictionary — source of truth original. */
export const fr = {
  ui: {
    seatingTitle: "Disposition du cercle",
    seatingHint: "Glissez un joueur sur un autre pour échanger leurs places. L'ordre du cercle détermine les voisins.",
    seatingTable: "La Table",
    seatingCount: "{n} joueurs",
    seatingNodeLabel: "Siège {n} — {name}",
    seatingConfirm: "Valider le cercle & Lancer la nuit",
    soloPackSuffix: " — Meute solo",
    stepWakeAlt: "Réveil du rôle {role}",
    narratorAlt: "Le Conteur, conteur masqué avec le grimoire lumineux",
    // Common
    back: "← Retour",
    next: "Suivant",
    continue: "Continuer",
    loading: "Chargement…",
    quit: "Quitter",
    yes: "Oui",
    no: "Non",
    validate: "Valider",
    skip: "Passer",
    random: "🎲 Tirage au sort",
    language: "Langue",
    sound: "Son",
    soundOn: "Coupé",
    soundOff: "Actif",
    offline: "100% Hors-ligne",

    // Home
    tagline: "Le village s'endort…",
    newGame: "Nouvelle Partie",
    grimoire: "Grimoire des rôles",
    footer: "Nightfall Oracle",
    logoAlt: "Loup hurlant devant une lune rose",

    // Grimoire
    grimoireTitle: "Grimoire des rôles",
    grimoireHint:
      "Touchez l'icône d'information sur une carte pour afficher sa description et son pouvoir.",
    narratorTitle: "Le Conteur (Meneur de jeu)",
    narratorIntro:
      "Je suis le Maître du Jeu. J'éveille les âmes, décompte les voix et annonce les morts. Suivez mes instructions : une nuit seulement sépare le village des crocs.",
    infoRole: "Voir la description",
    powerLabel: "Pouvoir : ",

    // Setup
    setupTitle: "Noms des joueurs",
    playerNamePlaceholder: "Nom du joueur",
    addPlayer: "+ Ajouter un joueur",
    remove: "Supprimer",
    defaultPlayer: "Joueur",
    debateTimer: "Chrono de débat",
    debateTimerDesc: "Chaque joueur dispose d'un temps de parole délimité.",
    debateTimerToggle: "Activer le chrono de débat",
    custom: "Personnalisé",
    perPlayerDebate: "{n} secondes par joueur pendant la phase de débat.",

    // Game Master
    gmTitle: "Meneur de Jeu",
    gmSubtitle:
      "Désignez le Meneur : il tiendra le téléphone et guidera le jeu. Il n'aura pas de carte de rôle.",
    gmRandom: "🎲 Tirer au sort",
    gmNext: "Continuer",
    gmChosen: "Meneur de Jeu",
    gmExcluded: "Le Meneur ne joue pas : {n} joueurs actifs.",

    // Composition
    compositionTitle: "Composition du village",
    compositionCount: "{r} rôles définis pour {p} joueurs.",
    distribute: "Distribuer les rôles",
    rolesProgress: "{r} / {p} rôles",

    // Distribution
    distributing: "Distribution des rôles…",
    playerXofY: "Joueur {i} / {n}",
    passPhoneTo: "Passez le téléphone à {name}, puis révélez la carte à l'abri des regards.",
    discoverRole: "Découvrir mon rôle",
    memorized: "J'ai mémorisé mon rôle",
    handoverTitle: "Donnez le téléphone au Meneur de Jeu",
    handoverText:
      "Les cartes sont distribuées. Je suis le Meneur : à partir de maintenant, je conserve le téléphone. Je vais diriger les nuits, les aubes et le vote du village.",
    captainElection: "Élection du Capitaine",
    captainElectionDesc:
      "Le village élit son Capitaine à main levée. Son rôle secret reste masqué : seul le MJ voit ce badge. Le Général ne peut pas être élu.",
    randomSelect: "🎲 Choix aléatoire",
    noCaptain: "Jouer sans Capitaine",
    startGame: "Lancer la partie",

    // Game
    nightN: "Nuit {n}",
    dayN: "Jour {n}",
    village: "Village ({n} vivants)",
    mjDashboard: "Tableau de bord MJ — Rôles secrets visibles",
    nightEnds: "La nuit s'achève sur le village endormi.",
    raiseDay: "Réveiller le village",
    captain: "Capitaine",
    captainX2: "Capitaine ×2",
    cannotVote: "Ne vote pas",
    immune: "Immunisé",
    wolfTag: "Loup",
    converted: " (Converti)",
    convertedInfo: "Changé en Loup-Garou (info MJ)",

    // Night
    secretWordTitle: "Mot secret du Loup Bavard",
    secretWordHint:
      "Montrez cet écran au Loup Bavard. Il doit obligatoirement placer ce mot dans le débat du matin.",
    editWord: "Modifier le mot",
    bavardSeen: "Le Loup Bavard a vu son mot",
    packAgrees: "La meute est d'accord",
    disagreement: "Désaccord — La Matriarche tranche seule",
    infectPlayer: "Infecter {name} (1 seule fois par partie)",
    noirSoloVictimTitle: "Désignation de la victime",
    noirSoloConfirm: "Le Loup Noir frappe",
    muteTitle: "Imposer le silence (optionnel)",
    muteUnavailable: "Le pouvoir de silence est disponible à partir de la Nuit 2.",
    bearNeighbors: "Voisins directs (info MJ)",
    left: "Gauche",
    right: "Droite",
    infected: " (Infecté)",
    bearSniff: "Le Montreur d'Ours renifle ses voisins",
    execPrisoner: "Exécuter le prisonnier",
    healSave: "Sauver {name}",
    poisonPotion: "Potion de mort (optionnel)",
    witchTargetProtected: "Le Salvateur protège déjà cette victime — Potion de vie inutile.",

    // Dawn & debate
    debateTitle: "Le Débat — Jour {n}",
    debateText:
      "Le Capitaine ouvre le débat, chaque joueur prend la parole, puis le Capitaine conclut.",
    captainMutedHint: "Capitaine rendu muet : il n'a pas de temps de parole (ni ouverture ni conclusion), mais conserve tous ses choix — sens du débat, sens du vote et timing de son vote.",
    mutedBy: "Rendus muets par le Loup Noir : {names}",
    dawnTitle: "L'Aube — Jour {n}",
    bavardWordOfDay: "Loup Bavard, ton mot du jour :",
    firstDayVoteQuestion: "Villageois, souhaitez-vous voter ce premier jour ? Ce matin seulement, le vote est optionnel.",
    vote: "Voter",
    noVote: "Pas de vote",
    forceVote: "Le MJ impose le vote du village",
    speaker: "Débat — Orateur {i} / {n}",
    opening: "Ouverture",
    closing: "Conclusion",
    pause: "Pause",
    resume: "Reprendre",
    endDebate: "Terminer le débat",
    extend30: "+30s",

    // Debate wheel & vote
    rotationClockwise: "Sens horaire",
    rotationCounter: "Sens antihoraire",
    captainDirTitle: "Sens du débat",
    captainDirText: "{name}, Capitaine, choisissez le sens du tour de table.",
    dirClockwise: "Sens horaire (vers la gauche du Capitaine)",
    dirCounterClockwise: "Sens antihoraire (vers la droite du Capitaine)",
    noCaptainDir: "Pas de Capitaine : Sens horaire appliqué.",
    setupDebateDir: "Sens du débat",
    setupVoteDir: "Sens du vote",
    setupCaptainTiming: "Vote du Capitaine",
    captainVotesFirst: "En premier",
    captainVotesLast: "En dernier",
    timerLockedHint: "Le chrono de débat ne démarre qu'après la validation de ces choix.",
    confirmCaptainSetup: "Valider & Lancer le débat",
    voteSetupTitle: "Configuration du vote",
    voteSetupText: "{name}, choisissez le sens du vote et le moment de votre vote.",
    confirmVoteSetup: "Valider & Ouvrir le vote",
    captainRevoteOneVote: "Revote : Le Capitaine n'a qu'une seule voix.",
    captainOpening: "Discours d'ouverture",
    captainClosing: "Discours de conclusion",
    captainSplitTitle: "Capitaine — 2 Points de Vote",
    captainVoteBoth: "Les 2 points sur 1 joueur",
    captainVoteSplit: "Scission : 1 point + 1 point",
    captainSplitPickA: "Premier point",
    captainSplitPickB: "Second point",
    captainSplitConfirm: "Valider le vote du Capitaine",
    splitBadge: "Vote scindé",
    auditSplitLine: "{voter} ➔ Scission : {target} + {target2}",
    auditDoubleLine: "{voter} ➔ {target} ×2",
    revoteTiedExcluded: "Les joueurs à égalité ne votent pas lors de ce revote.",
    doubleElimAnnounce: "2e égalité consécutive : les deux joueurs à égalité sont éliminés.",
    evalTitle: "Évaluation de la partie",
    evalMvp: "MVP — Meilleur Joueur",
    evalLvp: "LVP — Joueur le plus faible",
    evalFactions: "Performance des camps",
    evalScorecards: "Fiches individuelles",
    evalAccuracy: "Précision de vote",
    evalRoleEff: "Efficacité du rôle",
    evalVotesCast: "{n} points de vote attribués",
    evalLeader: "Moteur de vote",
    evalFollower: "Suiveur",
    evalNoData: "Pas assez de données pour l'évaluation.",
    factionWolves: "Loups-Garous",
    factionVillage: "Village",
    factionSolo: "Rôles Solo",
    currentSpeaker: "Orateur",
    villageLegend: "Légende du Village",
    startTimer: "Démarrer",
    pauseTimer: "Pause",
    resetTimer: "Réinitialiser",
    plus10: "+10s",
    nextSpeaker: "Orateur suivant",
    nowVoting: "Vote maintenant",
    abstain: "Abstention / Passer",
    auditTitle: "Audit des votes",
    auditLine: "{voter} ➔ a voté contre {target}",
    auditAbstain: "{voter} ➔ s'est abstenu",
    undoVote: "Annuler",
    tallyComplete: "Clôturer le dépouillement",
    topVoted: "En tête des votes",
    eliminateName: "Éliminer {name}",
    tieJudgeActive: "Égalité — Le Juge est actif !",
    passToJudge: "Transmettre la décision au Juge",
    tieDetectedWith: "Égalité détectée entre {names}",
    runRevoteTied: "Lancer le revote (joueurs à égalité)",
    captainBreaksTie: "Le Capitaine tranche l'égalité",
    skipElimination: "Pas d'élimination",
    voteProgress: "Vote {i} / {n}",
    votesUnit: "voix",

    // Vote
    voteTitle: "Vote du village — Jour {n}",
    revoteSuffix: " (Revote)",
    voteText:
      "Le village doit désigner le condamné. Comptez les voix : au moins un joueur doit être éliminé.",
    logRavenTarget: "Le Corbeau cible {name}. Ce joueur commence le vote avec {count} vote(s) contre lui.",
    voteTotal: "Total attribué : {c} / {t} voix",
    voteTotalHint:
      "Le total des voix possibles correspond au nombre de vivants + 1 (double voix du Capitaine).",
    addVote: "Ajouter une voix contre {name}",
    removeVote: "Retirer une voix à {name}",
    bavardCheck: "Vérification — Loup Bavard",
    bavardAsk: "A-t-il dit son mot '{word}' ?",
    bavardInactiveDay1: "Le Loup Bavard était inactif Nuit 1 — aucune vérification.",
    tieJudge:
      "Égalité : Le Juge tranche. Il désigne un ou plusieurs égalisés à éliminer ou ordonne un revote.",
    judgeExecute: "Appliquer le verdict du Juge",
    orderRevote: "Ordonner un revote",
    tieBreakOnly: "Départager l'égalité — seuls les {n} égalisés sont affichés",
    tieNote:
      "En cas de 2e égalité après revote, tous les égalisés sont éliminés.",
    validateExec: "Valider l'exécution",
    bavardPreVoteTitle: "Loup Bavard — Avant le vote",
    bavardPreVoteAsk: "A-t-il prononcé son mot '{word}' ?",
    bavardPreVoteYes: "Oui — Le vote continue",
    bavardPreVoteNo: "Non — Exécution immédiate",
    gmSelectElim: "Sélection du / des condamnés",
    gmSelectElimHint: "Cochez le ou les joueurs à éliminer.",
    gmConfirmElim: "Valider l'élimination",
    gmRevoteAction: "Ordonner un revote",
    undoStep: "← Retour arrière",

    // Suicide / Revelation
    causeSuicide: "Suicide / Révélation",
    gmSuicide: "Suicide / Révélation",
    suicideTitle: "Suicide / Révélation",
    suicideDesc: "Sélectionnez le joueur qui a enfreint les règles ou révélé son rôle. Il est éliminé immédiatement et la nuit tombe.",
    suicideConfirm: "💀 Valider l'élimination",
    suicideDone: "{name} a été éliminé : Suicide / Révélation.",

    // Undo
    undoLabel: "Annuler",
    undoDoneToast: "Action annulée",

    // Black Wolf — actions hub
    bwHubTitle: "Loup Noir — Actions",
    bwTabAttack: "Attaque",
    bwTabInfect: "Infection",
    bwTabMute: "Silence",
    bwInfectAvailable: "Infection disponible : 1/1",
    bwInfectUsed: "Infection déjà utilisée",
    bwPickAttack: "Désignez la victime de la nuit.",
    bwPickInfect: "Choisissez le joueur à infecter (rejoint la meute au lieu de mourir).",
    bwPickMute: "Choisissez le joueur réduit au silence pour le débat du matin.",
    bwNoVictimHint: "La meute n'a pas encore désigné de victime.",
    gmTurnGuide: "Tour du rôle {role} — {name}. Guidez le joueur puis validez l'action.",
    validateAction: "Valider l'action",
    passTurn: "Passer le tour",

    // Summary — badges & evaluation
    recapRounds: "{n} tours",
    turningPointTitle: "Tournant de la partie",
    turningPointNone: "Aucun tournant décisif enregistré.",
    turningPointLine: "Jour {d} : L'élimination de {name} ({role}) a fait basculer la partie.",
    badgesTitle: "Distinctions de fin de partie",
    badgeMastermind: "Cerveau de la Partie",
    badgeMastermindDesc: "MVP : Lecture parfaite et votes décisifs.",
    badgeEagleEye: "Œil de Lynx",
    badgeEagleEyeDesc: "Meilleure précision de vote.",
    badgeOscar: "Oscar du Meilleur Acteur",
    badgeOscarDesc: "Le Loup qui a fait éliminer le plus de villageois.",
    badgeGuardian: "Ange Gardien",
    badgeGuardianDesc: "A sauvé le plus de vies.",
    badgeBandwagoner: "Mouton de Panurge",
    badgeBandwagonerDesc: "Toujours avec la majorité, ne prend jamais d'initiative.",
    badgeBlindSniper: "Tireur Aveugle",
    badgeBlindSniperDesc: "Plus faible précision de vote.",
    badgeIceCold: "Sang-Froid",
    badgeIceColdDesc: "Décisif parmi les 4 derniers survivants.",
    badgeSuicidal: "Suicide Révélateur",
    badgeSuicidalDesc: "A révélé son rôle et gâché la partie.",
    evalDeception: "Indice de duperie",
    evalClutch: "Sauvetage in extremis",
    evalEarlyPush: "Initiatives",
    evalBandwagon: "Suivisme",
    evalHistory: "Historique des actions",

    // Events
    captainSuccession: "Succession du Capitaine",
    captainSuccessionText:
      "{name} s'effondre. Avant de partir, il désigne lui-même son successeur : aucun nouveau vote.",
    transmit: "Transmettre le pouvoir",
    hunterTitle: "Dernier souffle du Chasseur",
    hunterText: "Le Chasseur s'écroule, mais son fusil parle une dernière fois.",
    shoot: "Tirer",
    eliminated: "Éliminé",
    villageStrikes: "Le village frappe un grand coup",
    villageDecided: "Le village a tranché",

    // Transitions
    nightFalls: "La nuit tombe",
    dayRises: "Le jour se lève",
    tapToContinue: "Touchez pour continuer",
    nightSubtitle: "Nuit {n} — Que tout le monde ferme les yeux",
    daySubtitle: "Jour {n} — Le village se réveille",

    // Game Summary
    bilanTitle: "Bilan de la partie",
    bilanMvp: "⭐ MVP de la partie",
    bilanMvpScore: "{n} pts",
    bilanVoteHistory: "Historique des votes",
    bilanDayVote: "Jour {n}",
    bilanRevoteSuffix: " (Revote)",
    bilanElim: "→ {names}",
    bilanNobodyElim: "→ Personne",
    bilanTeamDomination: "Domination stratégique",
    bilanVillageCtrl: "🏘️ Village : {pct}%",
    bilanWolfCtrl: "🐺 Loups : {pct}%",
    bilanBalanced: "Partie très équilibrée",
    bilanDuration: "{d} jour(s) de jeu",
    bilanSurvivors: "Survivants : {n}",
    bilanNoVotes: "Aucun vote enregistré.",

    // End
    gameOver: "Fin de partie",
    gameOverFallback: "La partie est terminée.",
    recap: "Récapitulatif",
    colPlayer: "Joueur",
    colRole: "Rôle",
    colTeam: "Camp",
    colStatus: "Statut",
    statusAlive: "Vivant",
    statusDead: "Mort",
    statusContaminated: "Infecté",

    // Summary Card
    recapVictoryWolves: "Victoire des Loups-Garous",
    recapVictoryVillage: "Victoire du Village",
    recapVictoryLovers: "Victoire des Amoureux",
    recapVictorySolo: "Victoire Solo",
    recapVictoryBlackWolf: "Domination du Loup Noir",
    recapRoster: "L'effectif",
    recapTimeline: "Chronologie de la partie",
    recapNoEvents: "Aucun événement notable.",
    recapNightN: "Nuit {n}",
    recapDayN: "Jour {n}",
    recapRescued: "Rescapé — {role}",
    recapContaminatedBy: "Infecté par le Loup Noir",
    playAgain: "Rejouer",
    shareRecap: "Partager le récap",
    shareCopied: "Récap copié !",
    causeWolves: "Dévoré par les Loups-Garous",
    causePoison: "Empoisonné par la Sorcière",
    causeWhiteWolf: "Tué par le Loup Blanc",
    causeHunter: "Abattu par le Chasseur",
    causeHeartbreak: "Mort de chagrin",
    causeVote: "Exécuté par le Village",
    causeJailer: "Exécuté par le Geolier",
    causeSpy: "Surpris en train d'espionner",
    causeTalkative: "Le Loup Bavard a gardé le silence",
    causeGeneralStrike: "Frappé par le Général",
    causeGeneralFailed: "Le Général a échoué",
    causeManiac: "Assassiné par le Maniaque",
    causeThreeFacesPoison: "Empoisonné par les Trois Visages",
    causePuppetProtection: "Interception mortelle — la marionnette a subi les dégâts à la place du marionnettiste",

    // Night Report
    nightReportTitle: "Rapport de Nuit {n}",
    nightReportSubtitle: "Résumé complet des actions — Écran silencieux, réservé au Meneur.",
    nightReportActions: "Actions de la nuit",
    nightReportOutcomes: "Bilan de la nuit",
    nightReportEmpty: "Aucune action nocturne enregistrée.",
    nightReportClose: "Réveiller le village",
    nightReportMuted: "🔇 Pas de narration, pas de son.",

    // 3 faces
    facesChoosePower: "Choisissez le visage à révéler cette nuit (chaque pouvoir une seule fois)",
    facesProtect: "🛡️ Protection (Salvateur)",
    facesPotion: "⚗️ Potion (Sorcière)",
    facesInspect: "🔮 Inspection (Voyante)",
    facesLifePotion: "Potion de vie — Sauver {name}",
    facesPoisonPotion: "Potion de mort — Choisir une cible",
    facesPickTarget: "Choisir la cible",
    facesNoPowerLeft: "Les trois visages ont déjà été utilisés.",
    facesRemaining: "Pouvoirs restants : {n}",

    // Thief, Maniac & Puppeteer
    thiefPickTarget: "Choisissez le joueur dont vous volez le rôle",
    maniacPickTarget: "Choisissez la victime (aucune protection ne peut l'arrêter)",
    marionnettistePickTarget: "Choisissez le joueur qui sera votre marionnette",
    marionnetteTag: " (Marionnette)",

    ultimateShield: "Bouclier Ultime",
    ultimateShieldDesc: "Protège tout le village contre les loups et l'infection pour cette nuit. Usage unique.",
    ultimateShieldWarn: "Attention : Une fois activé, le Salvateur perd définitivement tous ses pouvoirs de protection.",
    ultimateShieldActivate: "Activer le Bouclier Ultime",
    ultimateShieldConfirm: "Oui, activer et perdre les pouvoirs",
    voteRanking: "Classement des votes — Du plus voté au moins voté",

    newWordPlaceholder: "Nouveau mot…",
    cancel: "Annuler",
    roleWakeAlt: "Réveil du rôle {role}",

    // GM Stars
    starAward: "Attribuer une étoile à {name}",
    starRemove: "Retirer une étoile à {name}",
    starsLabel: "Étoiles",
    starsHint: "Cliquez sur ⭐ sur la fiche d'un joueur pour récompenser une déduction brillante. Maintien long pour la retirer.",
    starsEarned: "{n} ⭐",
    badgeStarTown: "Enquêteur d'Élite",
    badgeStarTownDesc: "Le villageois ayant obtenu le plus d'étoiles du MJ.",
    badgeStarWolf: "Maître de la Duperie",
    badgeStarWolfDesc: "Le loup ayant obtenu le plus d'étoiles pour ses manœuvres subtiles.",

    // GM Guide
    guideButton: "Guide MJ",
    guideTitle: "Guide du Meneur de Jeu",
    guideStepOf: "Étape {i} / {n}",
    guideClose: "Fermer le guide",
    guideStart: "C'est parti !",
    guideStep1Kicker: "Étape 1",
    guideStep1Title: "Configuration & Joueurs",
    guideStep1Body:
      "Saisissez le nom de chaque joueur puis cliquez sur '+ Ajouter un joueur'. Choisissez la composition des rôles et le chrono de débat avant de lancer la partie.",
    guideStep2Kicker: "Étape 2",
    guideStep2Title: "Distribution & Rôles Secrets",
    guideStep2Body:
      "Faites passer le téléphone de main en main : chaque joueur découvre sa carte secrètement, la mémorise, puis la masque avant de transmettre au suivant.",
    guideStep3Kicker: "Étape 3",
    guideStep3Title: "Déroulement de la Nuit",
    guideStep3Body:
      "Le Meneur éveille les rôles un par un (Loups-Garous, Voyante, Sorcière...). Touchez le symbole du joueur pour appliquer l'action : dévorer, sauver, inspecter ou muer.",
    guideStep4Kicker: "Étape 4",
    guideStep4Title: "Le Jour, le Débat & les Étoiles ⭐",
    guideStep4Body:
      "Lisez le rapport de nuit, laissez le Capitaine choisir le sens, puis lancez la roue. Les joueurs rendus muets passent leur tour. Cliquez sur la star pour récompenser les belles déductions.",
    guideStep5Kicker: "Étape 5",
    guideStep5Title: "Le Vote & l'Élimination",
    guideStep5Body:
      "Enregistrez les voix une à une. La voix du Capitaine tranche en cas d'égalité, sinon un revote est proposé. Le mort révèle son rôle et déclenche ses pouvoirs.",
    guideStep6Kicker: "Étape 6",
    guideStep6Title: "Fin de partie & Évaluation",
    guideStep6Body:
      "À la victoire, la fiche d'évaluation affiche le classement des joueurs : précision du vote, efficacité du rôle, étoiles gagnées et badges d'honneur.",

    // Orientation
    rotateTitle: "Pivotez votre téléphone",
    rotateText:
      "Nightfall Oracle se joue en mode portrait. Remettez votre appareil à la verticale pour continuer.",
  },
  prompts: {
    cupidon: "Désignez les deux amoureux.",
    mime: "Sélectionnez le joueur dont vous copiez le rôle.",
    "enfant-sauvage": "Sélectionnez votre modèle.",
    geolier: "Qui emprisonnez-vous cette nuit ?",
    voyante: "Quel joueur souhaitez-vous inspecter ?",
    salvateur: "Qui protégez-vous cette nuit ? (Pas la même personne deux fois de suite)",
    "petite-fille": "Vous entrebâillez les yeux… Avez-vous espionné la meute ?",
    "loup-garou": "La meute désigne sa victime. En cas de désaccord, la Matriarche tranche seule.",
    "loup-noir": "Infectez la victime (1 seule fois par partie) et/ou imposez le silence à un joueur.",
    "loup-blanc": "Voulez-vous dévorer un loup-garou cette nuit ?",
    "loup-bavard": "Le MJ vous montre le mot secret : vous devez impérativement le placer lors du débat du matin.",
    sorciere: "Utilisez vos potions.",
    "joueur-de-flute": "Enchantez deux joueurs.",
    corbeau: "Sur qui déposez-vous la plume noire ?",
    tavernier: "À qui payez-vous un verre ?",
    general: "Désignez le joueur sur lequel vous tirez. S'il n'est pas un loup, vous perdez la vie.",
    "montreur-dours": "L'ours renifle ses voisins directs…",
    "trois-faces": "Choisissez l'un de vos trois visages : protection, potion ou inspection.",
    voleur: "Volez le rôle d'un joueur : il deviendra un simple villageois.",
    maniaque: "Désignez la victime qu'aucune protection ne peut l'arrêter.",
    marionnettiste: "Désignez votre marionnette. Si vous êtes attaqué, votre marionnette subit les dégâts à votre place et vous devenez muet durant le débat.",
    juge: "Désignez votre décision en cas d'égalité lors du vote.",
    ancien: "L'Ancien observe en silence le village."
  } as Record<string, string>,
  teams: {
    VILLAGEOIS: "Village",
    WEREWOLVES: "Loups-Garous",
    SOLO: "Solo",
    LOVERS: "Amoureux",
    DYNAMIC: "Dynamique",
  } as Record<string, string>,
  roles: {
    villageois: {
      name: "Simple Villageois",
      description: "Vous n'avez aucun pouvoir particulier, mais votre vote et votre perspicacité sont les meilleures armes du village.",
      power: "Participe aux débats et vote chaque jour pour éliminer un suspect."
    },
    "loup-garou": {
      name: "Loup-Garou",
      description: "Chaque nuit, vous vous réveillez avec la meute pour désigner un villageois à dévorer.",
      power: "Se réveille la nuit avec les autres loups pour éliminer une victime."
    },
    voyante: {
      name: "Voyante",
      description: "Chaque nuit, vous pouvez découvrir le rôle secret d'un joueur de votre choix.",
      power: "Inspecte la carte d'un joueur chaque nuit."
    },
    sorciere: {
      name: "Sorcière",
      description: "Vous possédez deux potions : une potion de vie pour sauver la victime des loups, et une potion de mort pour éliminer un joueur.",
      power: "Utilise la potion de vie et/ou la potion de mort une fois par partie."
    },
    salvateur: {
      name: "Salvateur",
      description: "Chaque nuit, vous désignez un joueur qui sera protégé contre l'attaque des loups.",
      power: "Protège un joueur par nuit (impossible de protéger le même joueur deux nuits consécutives)."
    },
    chasseur: {
      name: "Chasseur",
      description: "Si vous êtes éliminé, votre dernier réflexe est de tirer sur un joueur pour l'emporter dans la tombe.",
      power: "Élimine immédiatement un autre joueur au moment de sa propre mort."
    },
    cupidon: {
      name: "Cupidon",
      description: "La première nuit, vous désignez deux joueurs qui tombent amoureux. Si l'un meurt, l'autre meurt de chagrin.",
      power: "Lie deux joueurs en début de partie."
    },
    "petite-fille": {
      name: "Petite Fille",
      description: "Vous pouvez entrebâiller les yeux pendant le tour des Loups-Garous pour espionner leur identité.",
      power: "Espionne la meute la nuit (au risque de se faire repérer)."
    },
    voleur: {
      name: "Voleur",
      description: "Lors de la première nuit, vous pouvez voler le rôle d'un joueur. Votre cible devient alors un Simple Villageois.",
      power: "Vole la carte d'un joueur en début de partie."
    },
    "joueur-de-flute": {
      name: "Joueur de Flûte",
      description: "Enchantez deux joueurs par nuit. Votre objectif est d'enchanter tous les survivants pour remporter la victoire.",
      power: "Enchante deux joueurs chaque nuit."
    },
    "loup-noir": {
      name: "Loup Noir",
      description: "Chef charismatique de la meute. Une fois par partie, il peut infecter une victime pour la transformer en loup. Il peut aussi imposer le silence.",
      power: "Infecte une victime (1x) et/ou réduit un joueur au silence pendant le débat."
    },
    "loup-bavard": {
      name: "Loup Bavard",
      description: "Un loup bavard qui doit impérativement prononcer un mot secret imposé par le MJ durant le débat matinal.",
      power: "Doit placer son mot secret le jour sous peine d'élimination immédiate."
    },
    "loup-blanc": {
      name: "Loup Blanc",
      description: "Un loup solitaire qui se réveille une nuit sur deux pour dévorer un autre Loup-Garou.",
      power: "Peut éliminer un autre loup une nuit sur deux pour gagner seul."
    },
    "enfant-sauvage": {
      name: "Enfant Sauvage",
      description: "Vous choisissez un modèle en début de partie. Tant qu'il est vivant, vous êtes Villageois. S'il meurt, vous devenez Loup-Garou.",
      power: "Devient Loup-Garou à la mort de son modèle."
    },
    corbeau: {
      name: "Corbeau",
      description: "À la fin de la nuit, vous désignez un suspect. Ce dernier commencera le vote du village avec deux voix contre lui.",
      power: "Dépose deux voix d'office sur la cible de son choix pour le vote du jour."
    },
    geolier: {
      name: "Geôlier",
      description: "Chaque nuit, vous pouvez emprisonner un joueur : il sera protégé des attaques mais privé de pouvoir et de parole.",
      power: "Emprisonne et protège un joueur tout en neutralisant ses capacités."
    },
    juge: {
      name: "Juge",
      description: "En cas d'égalité lors du vote du village, le Juge intervient pour trancher seul ou ordonner un revote.",
      power: "Tranche les égalités lors du vote du village."
    },
    "montreur-dours": {
      name: "Montreur d'Ours",
      description: "Au lever du jour, si l'un de vos voisins directs est un Loup-Garou, votre ours grogne.",
      power: "Avertit le village par un grognement si un loup est assis à côté de lui."
    },
    general: {
      name: "Général",
      description: "Une fois par partie, vous pouvez exécuter publiquement un suspect. S'il était innocent, vous mourez sur-le-champ.",
      power: "Tire sur un joueur. Meurt de honte si sa cible n'est pas un Loup-Garou."
    },
    tavernier: {
      name: "Tavernier",
      description: "Vous offrez un verre à un joueur chaque nuit. Il est immunisé contre les votes le jour suivant.",
      power: "Immunise un joueur contre le vote du village pour la journée."
    },
    "trois-faces": {
      name: "Trois Visages",
      description: "Vous disposez de 3 pouvoirs à usage unique : Protection, Potion ou Inspection.",
      power: "Utilise tour à tour les facultés du Salvateur, de la Sorcière ou de la Voyante."
    },
    maniaque: {
      name: "Maniaque",
      description: "Tueur sanguinaire travaillant en solo. Aucune protection ne peut arrêter ses frappes nocturnes.",
      power: "Élimine une cible chaque nuit en offrant une frappe traversante."
    },
    mime: {
      name: "Mime",
      description: "Copiez le rôle d'un autre joueur en début de partie et adaptez votre stratégie.",
      power: "Prend l'apparence et le pouvoir d'un joueur sélectionné."
    },
    marionnettiste: {
      name: "Marionnettiste",
      description: "Vous liez votre destin à une marionnette. Si vous êtes attaqué la nuit, votre marionnette subit les dégâts à votre place et vous devenez muet lors du débat matinal.",
      power: "Choisissez une marionnette. Si vous êtes attaqué, la marionnette prend le coup à votre place et vous devenez muet."
    },
    ancien: {
      name: "L'Ancien",
      description: "Doyen résistant du village. Il survit à la première attaque des loups. Mais si le village l'élimine, tous les villageois perdent leurs pouvoirs.",
      power: "Résiste à la première attaque des Loups-Garous."
    }
  } as Record<string, { name: string; description: string; power: string }>,
};

export type UiKey = keyof typeof fr.ui;
export type Dictionary = typeof fr;
