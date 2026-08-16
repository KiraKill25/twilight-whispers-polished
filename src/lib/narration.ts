/** Narration localisée du moteur de jeu.
 *
 *  Le moteur (`src/game/engine.ts`) ne stocke plus de phrases françaises :
 *  il émet des jetons `⟦clé⟧{"var":"valeur"}` créés par `nk()`.
 *  L'interface les rend dans la langue active via `resolveNarration()`.
 *
 *  Les valeurs de variables peuvent elles-mêmes être des jetons (imbrication),
 *  ce qui permet de traduire une cause de mort ou un nom de rôle à l'intérieur
 *  d'une phrase.
 */

import type { Lang } from "@/lib/i18n";
import { ROLE_BY_ID } from "@/data/roles";
import { fr as frDict } from "@/lib/locales/fr";
import { en as enDict } from "@/lib/locales/en";
import { ar as arDict } from "@/lib/locales/ar";

const OPEN = "\u27E6";
const CLOSE = "\u27E7";

/** Construit un jeton de narration traduisible. */
export function nk(key: string, vars: Record<string, string | number> = {}): string {
  return `${OPEN}${key}${CLOSE}${JSON.stringify(vars)}`;
}

/** Jeton spécial : nom de rôle traduit. */
export function nrole(roleId: string): string {
  return nk("@role", { id: roleId });
}

type Table = Record<string, string>;

const NARRATION: Partial<Record<Lang, Table>> & { fr: Table } = {
  fr: {
    logVoteTally: "Jour {d} — Vote : [{tally}] → Éliminé(s) : {names}",
    lovers: "{a} et {b} sont désormais amoureux.",
    logCupid: "Cupidon lie {a} et {b}.",
    mimeCopy: "Tu copies le rôle : {role}.",
    wildModel: "Ton modèle est {name}.",
    jailExecuted: "{name} est exécuté dans sa geôle.",
    jailLocked: "{name} passe la nuit sous les verrous, à l'abri des crocs.",
    seerSees: "{name} est : {role}.",
    shieldUltimate:
      "Le Bouclier Ultime enveloppe le village entier — le Salvateur perd ses pouvoirs.",
    logShieldUltimate: "Nuit {n} : Bouclier Ultime activé par {name}.",
    protectedTonight: "{name} est protégé cette nuit.",
    spyCaught: "Tu as été repérée par la meute… tu ne verras pas l'aube.",
    spyHint: "Tu aperçois une silhouette : l'initiale « {letter} ».",
    spyNothing: "Tu n'aperçois rien dans l'obscurité.",
    eyesClosed: "Tu gardes les yeux fermés.",
    packDisagree:
      "Désaccord dans la meute : les loups se rendorment, la Matriarche va trancher.",
    packChose: "La meute a choisi {name}.",
    matriarchImpose: "La Matriarche impose {name}.",
    logMatriarch: "La Matriarche tranche : {name}.",
    logSoloKill: "{role} dévore {name} (meute solitaire).",
    talkativeWord:
      "Mot imposé au Loup Bavard : « {word} ». Il devra le prononcer pendant le débat.",
    infectBlocked: "La contamination échoue : la cible est protégée.",
    logInfectBlocked: "Contamination bloquée par le Salvateur — pouvoir conservé.",
    infectJoin: "{name} rejoint la meute en gardant son pouvoir.",
    logInfect: "Le Loup Noir contamine {name}.",
    silenceNote: "{name} ne pourra pas débattre demain matin.",
    logSilence: "Le Loup Noir impose le silence à {name}.",
    packAsPlanned: "La meute dévore comme prévu.",
    whiteTarget: "{name} sera dévoré par le Loup Blanc.",
    witchSaved: "La victime des loups est sauvée.",
    poisoned: "{name} est empoisonné.",
    fluteCharm: "La mélodie envoûte deux nouvelles âmes.",
    ravenVotes: "{name} commencera le vote avec 2 voix.",
    tavernDrink: "{name} a bu : demain il ne pourra pas voter, mais sera intouchable.",
    bearGrowl: "🐻 L'Ours grogne.",
    bearCalm: "Tout va bien.",
    generalWolf: "{name} était un Loup : il est abattu. {actor} devient le nouveau Capitaine.",
    logGeneralWolf: "Le Général abat {name} et devient Capitaine.",
    generalFail: "{name} n'était pas un Loup : le Général est éliminé par le Maître du Jeu.",
    logGeneralFail: "Le coup du Général échoue sur {name}.",
    generalIdle: "Le Général n'agit pas cette nuit.",
    survivedAttack: "{name} a survécu à l'attaque… pour cette fois.",
    deathLine: "{name} est mort — {cause}.",
    logDeath: "{name} ({role}) — {cause}.",
    elderFall:
      "L'Ancien est tombé par la main du village : tous les villageois perdent leurs pouvoirs.",
    wildAwaken: "{name} sent la bête s'éveiller en lui…",
    redRidingHood: "Le Chaperon Rouge est resté sous la garde du Chasseur : l'attaque échoue.",
    villageShieldSaved: "🛡️ Le Bouclier Ultime a protégé le village entier cette nuit.",
    saviorFoiled: "Le Salvateur a déjoué l'attaque des loups.",
    jailerSafe: "Le prisonnier du Geôlier était hors d'atteinte.",
    bearNear: "🐻 L'ours grogne : un loup est tout près !",
    mutedToday: "{name} est muet : il ne peut pas débattre aujourd'hui.",
    nobodyDied: "Étrangement, personne n'est mort cette nuit.",
    newCaptain: "{name} devient le nouveau Capitaine.",
    day1NoVote: "Jour 1 : le village a refusé de voter.",
    logTalkativeExecuted: "Jour {d} — Loup Bavard exécuté (mot non prononcé) ; vote annulé.",
    nightHeader: "— Nuit {n} —",
    killerFallback: "Nuit {n} : aucun loup standard — la mise à mort revient au {role}.",
    idiotSurvives: "{name} est l'Idiot du Village : il survit mais perd son droit de vote.",
    untouchableToday: "{name} était intouchable aujourd'hui.",
    winAngel: "{name} — l'Ange gagne : le village l'a exécuté au premier jour.",
    winNobody: "Personne ne survit. Le village est éteint.",
    winLovers: "Les Amoureux gagnent : {a} & {b}.",
    winWhiteWolf: "Le Loup Blanc {name} reste seul : victoire solitaire.",
    winPiper: "Le Joueur de Flûte {name} a envoûté le village entier.",
    winVillage: "Le Village triomphe : plus aucun loup ne rôde.",
    winWolves: "Les Loups-Garous ont dévoré le village.",
    thiefSteal: "Tu voles le rôle de {name} : {role}. {name} devient Simple Villageois.",
    logThiefSteal: "Le Voleur vole le rôle de {name} ({role}).",
    facesProtectMsg: "3 faces protège {name} cette nuit.",
    facesInspectMsg: "3 faces découvre : {name} est {role}.",
    facesLifeMsg: "3 faces utilise la potion de vie : la victime des loups est sauvée.",
    facesPoisonMsg: "3 faces empoisonne {name}.",
    logFaces: "3 faces utilise le visage « {power} » sur {name}.",
    maniacTargetMsg: "Le Maniaque frappe {name} — aucune protection ne l'arrête.",
    logManiac: "Le Maniaque assassine {name}.",
    winManiac: "Le Maniaque {name} reste maître du village : victoire solitaire.",
    repWolvesTarget: "🐺 Meute des Loups → {name}",
    repNoWolvesTarget: "🐺 Meute des Loups → aucune victime",
    repManiacTarget: "🔪 Maniaque → {name} (attaque imparable)",
    repSeerCheck: "🔮 {role} inspecte {name} → {result}",
    repProtect: "🛡️ {role} protège {name}",
    repVillageShield: "🛡️ Bouclier Ultime : village entier protégé",
    repWitchLife: "⚗️ Potion de vie utilisée sur {name}",
    repWitchPoison: "☠️ Potion de mort utilisée sur {name}",
    repSilence: "🤐 Loup Noir impose le silence à {name}",
    repSilenceSelf: "🤐 Loup Noir s'impose le silence à lui-même ({name})",
    repInfect: "🩸 Loup Noir contamine {name}",
    repThief: "🎭 Le Voleur ({thief}) vole le rôle de {name} → {role} ; {name} devient Simple Villageois",
    repFaces: "🎭 3 faces utilise « {power} » sur {name}",
    repDied: "💀 {name} ({role}) — {cause}",
    repSavedBy: "✨ {name} sauvé par {role}",
    repMuted: "🤐 {name} ne pourra pas débattre aujourd'hui",
    repNoDeaths: "Aucune mort cette nuit.",
    repFacePower_protect: "Protection",
    repFacePower_life: "Potion de vie",
    repFacePower_poison: "Potion de mort",
    repFacePower_inspect: "Inspection",
    cause_MANIAC: "assassiné par le Maniaque",
    cause_SUICIDE_REVEAL: "Suicide / Révélation de rôle",
    logSuicideReveal: "{name} a révélé son identité : suicide immédiat.",
    cause_THREE_FACES_POISON: "empoisonné par 3 faces",
    // Causes de mort
    cause_WOLVES: "dévoré par les loups",
    cause_WITCH_POISON: "empoisonné par la Sorcière",
    cause_WHITE_WOLF_KILL: "égorgé par le Loup Blanc",
    cause_HUNTER_SHOT: "abattu par le Chasseur",
    cause_HEARTBREAK: "mort de chagrin",
    cause_VILLAGE_VOTE: "exécuté par le village",
    cause_JAILER_EXECUTION: "exécuté par le Geôlier",
    cause_SPY_DETECTED: "repérée par la meute",
    cause_TALKATIVE_WOLF: "trahi par son silence",
    cause_GENERAL_STRIKE: "abattu par le Général",
    cause_GENERAL_FAILED: "éliminé par le Maître du Jeu (coup manqué du Général)",
  },
  en: {
    logVoteTally: "Day {d} — Vote: [{tally}] → Eliminated: {names}",
    lovers: "{a} and {b} are now lovers.",
    logCupid: "Cupid binds {a} and {b}.",
    mimeCopy: "You copy the role: {role}.",
    wildModel: "Your model is {name}.",
    jailExecuted: "{name} is executed in the cell.",
    jailLocked: "{name} spends the night locked up, safe from the fangs.",
    seerSees: "{name} is: {role}.",
    shieldUltimate:
      "The Ultimate Shield wraps the whole village — the Savior loses their powers.",
    logShieldUltimate: "Night {n}: Ultimate Shield activated by {name}.",
    protectedTonight: "{name} is protected tonight.",
    spyCaught: "The pack spotted you… you will not see the dawn.",
    spyHint: "You glimpse a silhouette: initial “{letter}”.",
    spyNothing: "You see nothing in the darkness.",
    eyesClosed: "You keep your eyes shut.",
    packDisagree:
      "The pack disagrees: the wolves fall back asleep, the Matriarch will decide.",
    packChose: "The pack chose {name}.",
    matriarchImpose: "The Matriarch imposes {name}.",
    logMatriarch: "The Matriarch decides: {name}.",
    logSoloKill: "{role} devours {name} (lone pack).",
    talkativeWord:
      "Secret word for the Talkative Wolf: “{word}”. He must say it during the debate.",
    infectBlocked: "The infection fails: the target is protected.",
    logInfectBlocked: "Infection blocked by the Savior — power retained.",
    infectJoin: "{name} joins the pack and keeps their power.",
    logInfect: "The Black Wolf infects {name}.",
    silenceNote: "{name} will not be able to debate tomorrow morning.",
    logSilence: "The Black Wolf silences {name}.",
    packAsPlanned: "The pack devours as planned.",
    whiteTarget: "{name} will be devoured by the White Wolf.",
    witchSaved: "The wolves' victim is saved.",
    poisoned: "{name} is poisoned.",
    fluteCharm: "The melody charms two more souls.",
    ravenVotes: "{name} starts the vote with 2 votes.",
    tavernDrink: "{name} drank: tomorrow they cannot vote, but they are untouchable.",
    bearGrowl: "🐻 The Bear growls.",
    bearCalm: "All is well.",
    generalWolf: "{name} was a Wolf: shot down. {actor} becomes the new Captain.",
    logGeneralWolf: "The General shoots {name} and becomes Captain.",
    generalFail: "{name} was not a Wolf: the General is removed by the Game Master.",
    logGeneralFail: "The General's shot fails on {name}.",
    generalIdle: "The General does not act tonight.",
    survivedAttack: "{name} survived the attack… this time.",
    deathLine: "{name} is dead — {cause}.",
    logDeath: "{name} ({role}) — {cause}.",
    elderFall:
      "The Elder fell by the village's hand: every villager loses their powers.",
    wildAwaken: "{name} feels the beast awaken within…",
    redRidingHood: "Little Red Riding Hood stayed under the Hunter's guard: the attack fails.",
    villageShieldSaved: "🛡️ The Ultimate Shield protected the whole village tonight.",
    saviorFoiled: "The Savior thwarted the wolves' attack.",
    jailerSafe: "The Jailer's prisoner was out of reach.",
    bearNear: "🐻 The bear growls: a wolf is very close!",
    mutedToday: "{name} is silenced: they cannot debate today.",
    nobodyDied: "Strangely, nobody died tonight.",
    newCaptain: "{name} becomes the new Captain.",
    day1NoVote: "Day 1: the village refused to vote.",
    logTalkativeExecuted: "Day {d} — Talkative Wolf executed (word not said); vote cancelled.",
    nightHeader: "— Night {n} —",
    killerFallback: "Night {n}: no standard wolf — the kill falls to the {role}.",
    idiotSurvives: "{name} is the Village Idiot: they survive but lose the right to vote.",
    untouchableToday: "{name} was untouchable today.",
    winAngel: "{name} — the Angel wins: the village executed them on the first day.",
    winNobody: "Nobody survives. The village is extinguished.",
    winLovers: "The Lovers win: {a} & {b}.",
    winWhiteWolf: "The White Wolf {name} stands alone: solitary victory.",
    winPiper: "The Pied Piper {name} charmed the entire village.",
    winVillage: "The Village triumphs: no wolf prowls anymore.",
    winWolves: "The Werewolves have devoured the village.",
    thiefSteal: "You steal {name}'s role: {role}. {name} becomes a plain Villager.",
    logThiefSteal: "The Thief steals {name}'s role ({role}).",
    facesProtectMsg: "3 faces protects {name} tonight.",
    facesInspectMsg: "3 faces discovers: {name} is {role}.",
    facesLifeMsg: "3 faces uses the life potion: the wolves' victim is saved.",
    facesPoisonMsg: "3 faces poisons {name}.",
    logFaces: "3 faces uses the “{power}” face on {name}.",
    maniacTargetMsg: "The Maniac strikes {name} — no protection can stop it.",
    logManiac: "The Maniac murders {name}.",
    winManiac: "The Maniac {name} rules what is left of the village: solitary victory.",
    repWolvesTarget: "🐺 Werewolf pack → {name}",
    repNoWolvesTarget: "🐺 Werewolf pack → no victim",
    repManiacTarget: "🔪 Maniac → {name} (unstoppable attack)",
    repSeerCheck: "🔮 {role} inspects {name} → {result}",
    repProtect: "🛡️ {role} protects {name}",
    repVillageShield: "🛡️ Ultimate Shield: whole village protected",
    repWitchLife: "⚗️ Life potion used on {name}",
    repWitchPoison: "☠️ Poison potion used on {name}",
    repSilence: "🤐 Black Wolf silences {name}",
    repSilenceSelf: "🤐 Black Wolf silences himself ({name})",
    repInfect: "🩸 Black Wolf infects {name}",
    repThief: "🎭 The Thief ({thief}) steals {name}'s role → {role}; {name} becomes a plain Villager",
    repFaces: "🎭 3 faces uses “{power}” on {name}",
    repDied: "💀 {name} ({role}) — {cause}",
    repSavedBy: "✨ {name} saved by {role}",
    repMuted: "🤐 {name} cannot debate today",
    repNoDeaths: "Nobody died tonight.",
    repFacePower_protect: "Protection",
    repFacePower_life: "Life potion",
    repFacePower_poison: "Poison potion",
    repFacePower_inspect: "Inspection",
    cause_MANIAC: "murdered by the Maniac",
    cause_SUICIDE_REVEAL: "Suicide / role reveal",
    logSuicideReveal: "{name} revealed their identity: immediate suicide.",
    cause_THREE_FACES_POISON: "poisoned by 3 faces",
    cause_WOLVES: "devoured by the wolves",
    cause_WITCH_POISON: "poisoned by the Witch",
    cause_WHITE_WOLF_KILL: "slain by the White Wolf",
    cause_HUNTER_SHOT: "shot by the Hunter",
    cause_HEARTBREAK: "died of heartbreak",
    cause_VILLAGE_VOTE: "executed by the village",
    cause_JAILER_EXECUTION: "executed by the Jailer",
    cause_SPY_DETECTED: "spotted by the pack",
    cause_TALKATIVE_WOLF: "betrayed by their silence",
    cause_GENERAL_STRIKE: "shot by the General",
    cause_GENERAL_FAILED: "removed by the Game Master (the General missed)",
  },
  ar: {
    logVoteTally: "اليوم {d} — التصويت: [{tally}] ← المُقصى: {names}",
    lovers: "{a} و {b} أصبحا عاشقين.",
    logCupid: "كيوبيد يربط {a} و {b}.",
    mimeCopy: "أنت تنسخ الدور: {role}.",
    wildModel: "قدوتك هي {name}.",
    jailExecuted: "تم إعدام {name} في زنزانته.",
    jailLocked: "يقضي {name} الليلة في الحبس، بعيدًا عن الأنياب.",
    seerSees: "{name} هو: {role}.",
    shieldUltimate: "الدرع الأقصى يحيط بالقرية كلها — ويفقد المنقذ قدراته.",
    logShieldUltimate: "الليلة {n}: {name} فعّل الدرع الأقصى.",
    protectedTonight: "{name} محمي هذه الليلة.",
    spyCaught: "لقد كشفك القطيع… لن ترى الفجر.",
    spyHint: "ترى ظلًا: الحرف الأول «{letter}».",
    spyNothing: "لا ترى شيئًا في الظلام.",
    eyesClosed: "تُبقي عينيك مغمضتين.",
    packDisagree: "خلاف في القطيع: تعود الذئاب للنوم، وستحسم الأم الكبرى الأمر.",
    packChose: "اختار القطيع {name}.",
    matriarchImpose: "الأم الكبرى تفرض {name}.",
    logMatriarch: "الأم الكبرى تحسم: {name}.",
    logSoloKill: "{role} يفترس {name} (قطيع منفرد).",
    talkativeWord: "الكلمة المفروضة على الذئب الثرثار: «{word}». عليه قولها خلال النقاش.",
    infectBlocked: "فشل التحويل: الهدف محمي.",
    logInfectBlocked: "المنقذ أوقف التحويل — القدرة محفوظة.",
    infectJoin: "{name} ينضم إلى القطيع محتفظًا بقدرته.",
    logInfect: "الذئب الأسود يحوّل {name}.",
    silenceNote: "{name} لن يتمكن من النقاش صباح الغد.",
    logSilence: "الذئب الأسود يُسكت {name}.",
    packAsPlanned: "القطيع يفترس كما هو مقرر.",
    whiteTarget: "سيفترس الذئب الأبيض {name}.",
    witchSaved: "تم إنقاذ ضحية الذئاب.",
    poisoned: "{name} مسموم.",
    fluteCharm: "اللحن يسحر روحين جديدتين.",
    ravenVotes: "سيبدأ {name} التصويت بصوتين.",
    tavernDrink: "شرب {name}: غدًا لا يمكنه التصويت، لكنه محصّن.",
    bearGrowl: "🐻 الدب يزمجر.",
    bearCalm: "كل شيء على ما يرام.",
    generalWolf: "{name} كان ذئبًا: تم إسقاطه. {actor} يصبح القائد الجديد.",
    logGeneralWolf: "الجنرال يقتل {name} ويصبح قائدًا.",
    generalFail: "{name} لم يكن ذئبًا: سيد اللعبة يقصي الجنرال.",
    logGeneralFail: "فشلت ضربة الجنرال على {name}.",
    generalIdle: "الجنرال لا يتحرك هذه الليلة.",
    survivedAttack: "نجا {name} من الهجوم… هذه المرة.",
    deathLine: "مات {name} — {cause}.",
    logDeath: "{name} ({role}) — {cause}.",
    elderFall: "سقط الشيخ بيد القرية: يفقد جميع القرويين قدراتهم.",
    wildAwaken: "يشعر {name} بالوحش يستيقظ في داخله…",
    redRidingHood: "ذات الرداء الأحمر بقيت تحت حماية الصياد: فشل الهجوم.",
    villageShieldSaved: "🛡️ الدرع الأقصى حمى القرية كلها هذه الليلة.",
    saviorFoiled: "المنقذ أفشل هجوم الذئاب.",
    jailerSafe: "سجين السجّان كان بعيدًا عن المنال.",
    bearNear: "🐻 الدب يزمجر: هناك ذئب قريب جدًا!",
    mutedToday: "{name} صامت: لا يمكنه النقاش اليوم.",
    nobodyDied: "بشكل غريب، لم يمت أحد هذه الليلة.",
    newCaptain: "{name} يصبح القائد الجديد.",
    day1NoVote: "اليوم 1: رفضت القرية التصويت.",
    logTalkativeExecuted: "اليوم {d} — أُعدم الذئب الثرثار (لم يقل الكلمة)؛ أُلغي التصويت.",
    nightHeader: "— الليلة {n} —",
    killerFallback: "الليلة {n}: لا ذئب عادي — القتل يعود إلى {role}.",
    idiotSurvives: "{name} هو أبله القرية: ينجو لكنه يفقد حق التصويت.",
    untouchableToday: "{name} كان محصّنًا اليوم.",
    winAngel: "{name} — الملاك يفوز: أعدمته القرية في اليوم الأول.",
    winNobody: "لا أحد ينجو. انطفأت القرية.",
    winLovers: "العاشقان يفوزان: {a} و {b}.",
    winWhiteWolf: "الذئب الأبيض {name} يبقى وحده: فوز منفرد.",
    winPiper: "عازف المزمار {name} سحر القرية بأكملها.",
    winVillage: "القرية تنتصر: لم يبق أي ذئب.",
    winWolves: "الذئاب المستذئبة افترست القرية.",
    thiefSteal: "تسرق دور {name}: {role}. يصبح {name} قرويًا بسيطًا.",
    logThiefSteal: "اللص يسرق دور {name} ({role}).",
    facesProtectMsg: "الوجوه الثلاثة تحمي {name} هذه الليلة.",
    facesInspectMsg: "الوجوه الثلاثة تكتشف: {name} هو {role}.",
    facesLifeMsg: "الوجوه الثلاثة تستعمل جرعة الحياة: تم إنقاذ ضحية الذئاب.",
    facesPoisonMsg: "الوجوه الثلاثة تسمّم {name}.",
    logFaces: "الوجوه الثلاثة تستعمل «{power}» على {name}.",
    maniacTargetMsg: "المهووس يضرب {name} — لا حماية توقفه.",
    logManiac: "المهووس يغتال {name}.",
    winManiac: "المهووس {name} يبقى سيد القرية: فوز منفرد.",
    repWolvesTarget: "🐺 قطيع الذئاب ← {name}",
    repNoWolvesTarget: "🐺 قطيع الذئاب ← بلا ضحية",
    repManiacTarget: "🔪 المهووس ← {name} (هجوم لا يُوقف)",
    repSeerCheck: "🔮 {role} يكشف {name} ← {result}",
    repProtect: "🛡️ {role} يحمي {name}",
    repVillageShield: "🛡️ الدرع الأقصى: القرية كلها محمية",
    repWitchLife: "⚗️ استُعملت جرعة الحياة على {name}",
    repWitchPoison: "☠️ استُعملت جرعة السم على {name}",
    repSilence: "🤐 الذئب الأسود يُسكت {name}",
    repSilenceSelf: "🤐 الذئب الأسود يُسكت نفسه ({name})",
    repInfect: "🩸 الذئب الأسود يحوّل {name}",
    repThief: "🎭 اللص ({thief}) يسرق دور {name} ← {role}؛ يصبح {name} قرويًا بسيطًا",
    repFaces: "🎭 الوجوه الثلاثة تستعمل «{power}» على {name}",
    repDied: "💀 {name} ({role}) — {cause}",
    repSavedBy: "✨ {name} أنقذه {role}",
    repMuted: "🤐 {name} لا يمكنه النقاش اليوم",
    repNoDeaths: "لم يمت أحد هذه الليلة.",
    repFacePower_protect: "الحماية",
    repFacePower_life: "جرعة الحياة",
    repFacePower_poison: "جرعة السم",
    repFacePower_inspect: "الكشف",
    cause_MANIAC: "اغتاله المهووس",
    cause_SUICIDE_REVEAL: "انتحار / كشف الدور",
    logSuicideReveal: "كشف {name} هويته: انتحار فوري.",
    cause_THREE_FACES_POISON: "سمّمه صاحب الوجوه الثلاثة",
    cause_WOLVES: "افترسته الذئاب",
    cause_WITCH_POISON: "سمّمته الساحرة",
    cause_WHITE_WOLF_KILL: "ذبحه الذئب الأبيض",
    cause_HUNTER_SHOT: "أطلق عليه الصياد النار",
    cause_HEARTBREAK: "مات من الحزن",
    cause_VILLAGE_VOTE: "أعدمته القرية",
    cause_JAILER_EXECUTION: "أعدمه السجّان",
    cause_SPY_DETECTED: "كشفه القطيع",
    cause_TALKATIVE_WOLF: "خانه صمته",
    cause_GENERAL_STRIKE: "أسقطه الجنرال",
    cause_GENERAL_FAILED: "أقصاه سيد اللعبة (ضربة الجنرال الفاشلة)",
  },
};

const ROLE_NAMES: Partial<Record<Lang, Record<string, { name?: string }>>> = {
  fr: frDict.roles,
  en: enDict.roles,
  ar: arDict.roles,
};

function localRoleName(lang: Lang, id: string): string {
  return ROLE_NAMES[lang]?.[id]?.name ?? ROLE_BY_ID[id]?.name ?? id;
}

/** Traduit tous les jetons de narration contenus dans un texte.
 *  Analyse manuelle (accolades équilibrées) afin de supporter les jetons imbriqués. */
export function resolveNarration(text: string, lang: Lang): string {
  if (!text || !text.includes(OPEN)) return text;
  let out = "";
  let i = 0;
  while (i < text.length) {
    const start = text.indexOf(OPEN, i);
    if (start < 0) {
      out += text.slice(i);
      break;
    }
    out += text.slice(i, start);
    const close = text.indexOf(CLOSE, start);
    if (close < 0) {
      out += text.slice(start);
      break;
    }
    const key = text.slice(start + 1, close);
    // Lecture du bloc JSON avec accolades équilibrées (chaînes ignorées).
    let j = close + 1;
    let depth = 0;
    let inStr = false;
    let esc = false;
    for (; j < text.length; j++) {
      const c = text[j];
      if (inStr) {
        if (esc) esc = false;
        else if (c === "\\") esc = true;
        else if (c === '"') inStr = false;
        continue;
      }
      if (c === '"') inStr = true;
      else if (c === "{") depth++;
      else if (c === "}") {
        depth--;
        if (depth === 0) {
          j++;
          break;
        }
      }
    }
    const raw = text.slice(close + 1, j);
    let vars: Record<string, string | number> = {};
    try {
      vars = JSON.parse(raw) as Record<string, string | number>;
    } catch {
      vars = {};
    }
    if (key === "@role") {
      out += localRoleName(lang, String(vars.id ?? ""));
    } else {
      const tpl = NARRATION[lang]?.[key] ?? NARRATION.fr[key] ?? "";
      out += tpl.replace(/\{(\w+)\}/g, (m, v: string) =>
        v in vars ? resolveNarration(String(vars[v]), lang) : m,
      );
    }
    i = j;
  }
  return out;
}
