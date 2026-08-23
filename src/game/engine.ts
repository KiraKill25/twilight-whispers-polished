import { ROLE_BY_ID, type Team } from "@/data/roles";
import { nk, nrole } from "@/lib/narration";

export type Phase = "NUIT_1" | "NUIT" | "AUBE" | "JOUR_VOTE" | "EVENEMENT_MORT" | "FIN";

export type DeathCause =
  | "WOLVES"
  | "WITCH_POISON"
  | "WHITE_WOLF_KILL"
  | "HUNTER_SHOT"
  | "HEARTBREAK"
  | "VILLAGE_VOTE"
  | "JAILER_EXECUTION"
  | "SPY_DETECTED"
  | "TALKATIVE_WOLF"
  | "GENERAL_STRIKE"
  | "GENERAL_FAILED"
  | "MANIAC"
  | "THREE_FACES_POISON"
  | "SUICIDE_REVEAL";

/** Libellé traduisible d'une cause de mort (jeton de narration). */
export const DEATH_LABEL: Record<DeathCause, string> = {
  WOLVES: nk("cause_WOLVES"),
  WITCH_POISON: nk("cause_WITCH_POISON"),
  WHITE_WOLF_KILL: nk("cause_WHITE_WOLF_KILL"),
  HUNTER_SHOT: nk("cause_HUNTER_SHOT"),
  HEARTBREAK: nk("cause_HEARTBREAK"),
  VILLAGE_VOTE: nk("cause_VILLAGE_VOTE"),
  JAILER_EXECUTION: nk("cause_JAILER_EXECUTION"),
  SPY_DETECTED: nk("cause_SPY_DETECTED"),
  TALKATIVE_WOLF: nk("cause_TALKATIVE_WOLF"),
  GENERAL_STRIKE: nk("cause_GENERAL_STRIKE"),
  GENERAL_FAILED: nk("cause_GENERAL_FAILED"),
  MANIAC: nk("cause_MANIAC"),
  THREE_FACES_POISON: nk("cause_THREE_FACES_POISON"),
  SUICIDE_REVEAL: nk("cause_SUICIDE_REVEAL"),
};

/** Évènement horodaté de la partie, utilisé par la frise du bilan. */
export interface GameEvent {
  round: number;
  phase: "NIGHT" | "DAY";
  type: "KILL" | "CONTAMINATION" | "RESCUE";
  /** Joueur concerné. */
  name: string;
  roleId?: string;
  cause?: DeathCause;
  /** Rôle sauveur pour un évènement RESCUE. */
  bySavior?: string;
}

export interface Player {
  id: string;
  name: string;
  roleId: string;
  team: Team;
  alive: boolean;
  lives: number;
  isLover: boolean;
  enchanted: boolean;
  abilityUsed: boolean;
  canVote: boolean;
  immuneToDayVote: boolean;
  voteWeight: number;
  baseVotes: number;
  powersDisabled: boolean;
  disabledNightAbility: boolean;
  isCaptain?: boolean;
  isConvertedToWolf?: boolean;
  originalRoleId?: string;
  retainsOriginalPowers?: boolean;
  hasUsedLifePotion?: boolean;
  hasUsedDeathPotion?: boolean;
  healUsed?: boolean;
  poisonUsed?: boolean;
  roleModelId?: string;
  copiedRoleId?: string;
  deathCause?: DeathCause;
  /** Interdit de débattre le matin suivant (pouvoir du Loup Noir ou Marionnettiste). */
  mutedForDay?: boolean;
  /** Salvateur : Bouclier Ultime consommé (protection définitivement perdue). */
  ultimateShieldUsed?: boolean;
  /** Marionnettiste : Le joueur désigné porte la marionnette cette nuit. */
  hasPuppetShield?: boolean;
  /** 3 faces : pouvoirs déjà utilisés ("protect" | "potion" | "inspect"). */
  facesUsed?: string[];
  /** Étoiles attribuées par le meneur pendant les débats. */
  stars: number;
}

export interface Step {
  key: string;
  roleId: string;
  title: string;
  prompt: string;
  mode:
    | "one"
    | "two"
    | "yesno"
    | "info"
    | "witch"
    | "word"
    | "bear"
    | "wolves"
    | "blackwolf"
    | "threefaces";
  optional?: boolean;
  actorId?: string;
  /** Loup Noir est le seul loup actif — la sélection de victime est intégrée à cette étape. */
  soloKill?: boolean;
}

export interface RoundState {
  attackedId?: string;
  protectedId?: string;
  previousProtectedId?: string;
  jailedId?: string;
  poisonedId?: string;
  healed?: boolean;
  whiteWolfKillId?: string;
  blackWolfConvert?: boolean;
  spyCaught?: boolean;
  ravenTargetId?: string;
  drinkTargetId?: string;
  requiredWord?: string;
  bearGrowls?: boolean;
  /** Joueur réduit au silence par le Loup Noir ou Marionnettiste pour le débat du matin. */
  mutedId?: string;
  /** Cible muselée la nuit précédente (interdite deux nuits de suite). */
  previousMutedId?: string;
  /** La meute n'a pas trouvé d'accord : la Matriarche tranche. */
  wolvesDisagreed?: boolean;
  /** Salvateur : le village entier est protégé cette nuit (Bouclier Ultime). */
  villageShield?: boolean;
  /** Maniaque : victime de la nuit (ignore toutes les protections). */
  maniacKillId?: string;
  /** 3 faces : cible empoisonnée par le visage « potion de mort ». */
  facesPoisonedId?: string;
}

export interface GameState {
  phase: Phase;
  night: number;
  day: number;
  players: Player[];
  steps: Step[];
  stepIndex: number;
  round: RoundState;
  log: string[];
  reveal?: string;
  pendingDeaths: { id: string; cause: DeathCause }[];
  hunterPending?: string;
  dawnSummary: string[];
  voteSkippedOffer: boolean;
  villageCaptainId?: string;
  revoteDone?: boolean;
  captainSuccessionPending?: string;
  lastEliminated?: { id: string; roleId: string; name: string }[];
  /** Frise chronologique des évènements marquants (morts, contaminations, sauvetages). */
  events: GameEvent[];
  /** Rapport nocturne du Maître du Jeu (jetons de narration) — remis à zéro chaque nuit. */
  nightReport: string[];
  winnerTeam?: "VILLAGE" | "WOLVES" | "OTHER";
  winner?: string;
}

const WORDS_BY_LANG: Record<string, string[]> = {
  fr: ["lune", "sang", "silence", "forêt", "brume", "clocher", "corbeau", "lanterne"],
  en: ["moon", "blood", "silence", "forest", "mist", "bell", "raven", "lantern"],
  ar: ["قمر", "دم", "صمت", "غابة", "ضباب", "جرس", "غراب", "فانوس"],
};

/** Mot secret tiré dans la langue active de l'interface. */
function randomWord() {
  let lang = "fr";
  try {
    lang = localStorage.getItem("mvno-lang") ?? "fr";
  } catch {
    /* SSR / stockage indisponible */
  }
  const list = WORDS_BY_LANG[lang] ?? WORDS_BY_LANG.fr;
  return list[Math.floor(Math.random() * list.length)];
}

const uid = () => Math.random().toString(36).slice(2, 10);

export function effectiveRoleId(p: Player) {
  return p.copiedRoleId ?? p.roleId;
}

/** Ajoute une ligne au rapport nocturne du Maître du Jeu. */
function rep(s: GameState, line: string) {
  if (!s.nightReport) s.nightReport = [];
  s.nightReport.push(line);
}

export function createGame(
  input: { name: string; roleId: string }[],
  villageCaptainId?: string,
): GameState {
  const players: Player[] = input.map((p) => ({
    id: uid(),
    name: p.name,
    roleId: p.roleId,
    team: ROLE_BY_ID[p.roleId]?.team ?? "VILLAGEOIS",
    alive: true,
    lives: p.roleId === "ancien" ? 2 : 1,
    isLover: false,
    enchanted: false,
    abilityUsed: false,
    canVote: true,
    immuneToDayVote: false,
    voteWeight: 1,
    baseVotes: 0,
    powersDisabled: false,
    disabledNightAbility: false,
    isConvertedToWolf: false,
    retainsOriginalPowers: true,
    hasUsedLifePotion: false,
    hasUsedDeathPotion: false,
    hasPuppetShield: false,
    stars: 0,
  }));

  const captain = players.find((p) => p.name === villageCaptainId);
  if (captain) {
    captain.isCaptain = true;
    captain.voteWeight = 2;
  }

  const state: GameState = {
    phase: "NUIT_1",
    night: 1,
    day: 0,
    players,
    steps: [],
    stepIndex: 0,
    round: {},
    log: ["La nuit tombe sur le village pour la première fois…"],
    pendingDeaths: [],
    dawnSummary: [],
    voteSkippedOffer: false,
    villageCaptainId: captain?.id,
    lastEliminated: [],
    events: [],
    nightReport: [],
  };
  state.steps = buildNightSteps(state);
  return state;
}

export function alivePlayers(s: GameState) {
  return s.players.filter((p) => p.alive);
}

function hasRole(s: GameState, roleId: string) {
  return s.players.find((p) => p.alive && effectiveRoleId(p) === roleId && !p.disabledNightAbility);
}

export function buildNightSteps(s: GameState): Step[] {
  const first = s.night === 1;
  const steps: Step[] = [];
  const push = (
    roleId: string,
    title: string,
    prompt: string,
    mode: Step["mode"],
    optional = false,
  ) => {
    const actor = hasRole(s, roleId);
    if (!actor) return;
    if (actor.powersDisabled) return;
    steps.push({
      key: `${s.night}-${roleId}`,
      roleId,
      title,
      prompt,
      mode,
      optional,
      actorId: actor.id,
    });
  };

  if (first) {
    push("voleur", "Le Voleur", "Vole le rôle d'un joueur : il devient Simple Villageois.", "one");
    push("cupidon", "Cupidon", "Désigne les deux amoureux.", "two");
    push("mime", "Mime", "Choisis le joueur dont tu copies le rôle.", "one");
    push("enfant-sauvage", "Enfant Sauvage", "Choisis ton modèle.", "one");
  }

  if (!first) push("geolier", "Geôlier", "Qui séquestres-tu cette nuit ?", "one");
  if (!first) push("voyante", "Voyante", "Quel joueur veux-tu sonder ?", "one");

  // Marionnettiste : s'éveille uniquement à la Nuit 2 pour équiper sa marionnette
  {
    const puppeteer = hasRole(s, "marionnettiste");
    if (puppeteer && s.night === 2 && !puppeteer.abilityUsed && !puppeteer.powersDisabled) {
      push("marionnettiste", "Le Marionnettiste", "Sur qui places-tu ta marionnette cette nuit ?", "one");
    }
  }

  {
    const savior = hasRole(s, "salvateur");
    if (savior && !savior.ultimateShieldUsed) {
      push("salvateur", "Salvateur", "Qui protèges-tu cette nuit ? (jamais deux fois de suite)", "one");
    }
  }
  push(
    "petite-fille",
    "Petite Fille",
    "Tu entrouvres les yeux… veux-tu espionner la meute ?",
    "yesno",
    true,
  );
  push(
    "loup-garou",
    "Les Loups-Garous",
    "La meute désigne sa victime. En cas de désaccord, la Matriarche tranche seule.",
    "wolves",
  );

  const packStepExists = steps.some((st) => st.mode === "wolves");
  const KILL_PRIORITY = ["loup-noir", "loup-blanc", "loup-bavard", "loup-matriarche"];
  const killerRoleId = packStepExists
    ? "loup-garou"
    : KILL_PRIORITY.find((r) => {
        const w = hasRole(s, r);
        return !!w && !w.powersDisabled;
      });
  if (!packStepExists && killerRoleId) {
    s.log.push(nk("killerFallback", { n: s.night, role: nrole(killerRoleId) }));
  }

  {
    const blackWolf = s.players.find(
      (p) =>
        p.alive &&
        effectiveRoleId(p) === "loup-noir" &&
        !p.disabledNightAbility &&
        !p.powersDisabled,
    );
    if (blackWolf) {
      const soloKill = killerRoleId === "loup-noir";
      steps.push({
        key: `${s.night}-loup-noir`,
        roleId: "loup-noir",
        title: soloKill ? "Loup Noir — Meute Solitaire" : "Loup Noir",
        prompt: soloKill
          ? "Désigne ta victime (tuer ou contaminer), puis impose le silence si disponible."
          : "Contamine la victime (une fois par partie) et/ou impose le silence à un joueur.",
        mode: "blackwolf",
        optional: !soloKill,
        actorId: blackWolf.id,
        soloKill,
      });
    }
  }

  if (killerRoleId === "loup-blanc") {
    const white = hasRole(s, "loup-blanc");
    if (white && !white.powersDisabled) {
      steps.push({
        key: `${s.night}-loup-blanc`,
        roleId: "loup-blanc",
        title: "Loup Blanc — Meute Solitaire",
        prompt: "Désigne ta victime parmi tous les survivants.",
        mode: "one",
        optional: true,
        actorId: white.id,
        soloKill: true,
      });
    }
  } else if (s.night % 2 === 0) {
    push("loup-blanc", "Loup Blanc", "Veux-tu dévorer un loup cette nuit ?", "one", true);
  }

  if (!first) {
    const talkative = hasRole(s, "loup-bavard");
    if (talkative && !talkative.powersDisabled) {
      const soloKill = killerRoleId === "loup-bavard";
      s.round.requiredWord = s.round.requiredWord ?? randomWord();
      steps.push({
        key: `${s.night}-loup-bavard`,
        roleId: "loup-bavard",
        title: soloKill ? "Loup Bavard — Meute Solitaire" : "Loup Bavard",
        prompt: soloKill
          ? "Désigne ta victime, puis retiens le mot secret à prononcer pendant le débat."
          : "Le Maître du Jeu montre le mot secret : il devra être prononcé pendant le débat du matin.",
        mode: "word",
        actorId: talkative.id,
        soloKill,
      });
    }
  }

  if (killerRoleId === "loup-matriarche") {
    const matri = hasRole(s, "loup-matriarche");
    if (matri && !matri.powersDisabled) {
      steps.push({
        key: `${s.night}-loup-matriarche`,
        roleId: "loup-matriarche",
        title: "Loup Matriarche — Meute Solitaire",
        prompt: "Désigne seule la victime de la nuit.",
        mode: "one",
        optional: true,
        actorId: matri.id,
        soloKill: true,
      });
    }
  }

  push("sorciere", "Sorcière", "Utilise tes potions.", "witch", true);

  {
    const faces = hasRole(s, "trois-faces");
    if (faces && !faces.powersDisabled && (faces.facesUsed?.length ?? 0) < 3) {
      steps.push({
        key: `${s.night}-trois-faces`,
        roleId: "trois-faces",
        title: "3 faces",
        prompt: "Choisis l'un de tes trois visages : protéger, une potion, ou inspecter.",
        mode: "threefaces",
        optional: true,
        actorId: faces.id,
      });
    }
  }

  push("maniaque", "Le Maniaque", "Désigne la victime que rien ne peut protéger.", "one", true);
  push("joueur-de-flute", "Joueur de Flûte", "Enchante deux joueurs.", "two", true);
  if (!first) push("corbeau", "Corbeau", "Sur qui déposes-tu la plume noire ?", "one", true);
  push("tavernier", "Tavernier", "À qui offres-tu un verre ?", "one", true);

  if (s.night === 2 || s.night === 3) {
    const gen = hasRole(s, "general");
    if (gen && !gen.abilityUsed && !gen.powersDisabled) {
      steps.push({
        key: `${s.night}-general`,
        roleId: "general",
        title: "Général",
        prompt: "Désigne le joueur que tu veux abattre. Si ce n'est pas un loup, tu meurs.",
        mode: "one",
        optional: true,
        actorId: gen.id,
      });
    }
  }

  if (first) {
    push("montreur-dours", "Montreur d'Ours", "L'ours flaire ses voisins…", "bear");
  }

  return steps;
}

export function currentStep(s: GameState): Step | undefined {
  return s.steps[s.stepIndex];
}

export function bearNeighbors(s: GameState, bearId: string) {
  const living = s.players.filter((p) => p.alive);
  const i = living.findIndex((p) => p.id === bearId);
  if (i < 0) return { left: undefined, right: undefined };
  return {
    left: living[(i - 1 + living.length) % living.length],
    right: living[(i + 1) % living.length],
  };
}

export function bearShouldGrowl(s: GameState, bearId: string): boolean {
  const bear = s.players.find((p) => p.id === bearId);
  const { left, right } = bearNeighbors(s, bearId);
  return [left, right, bear].some(
    (n) => !!n && (n.team === "WEREWOLVES" || n.isConvertedToWolf === true),
  );
}

function clone(s: GameState): GameState {
  return JSON.parse(JSON.stringify(s)) as GameState;
}

export interface StepPayload {
  targetId?: string;
  targetIds?: string[];
  yes?: boolean;
  healUsed?: boolean;
  poisonId?: string;
  muteId?: string;
  disagreement?: boolean;
  ultimateShield?: boolean;
  facePower?: "protect" | "life" | "poison" | "inspect";
}

export function submitStep(state: GameState, payload: StepPayload): GameState {
  const s = clone(state);
  const step = s.steps[s.stepIndex];
  if (!step) return resolveNight(s);
  const actor = s.players.find((p) => p.id === step.actorId)!;
  const target = payload.targetId ? s.players.find((p) => p.id === payload.targetId) : undefined;
  s.reveal = undefined;

  switch (step.roleId) {
    case "marionnettiste": {
      if (target) {
        s.players.forEach((p) => (p.hasPuppetShield = false));
        target.hasPuppetShield = true;
        s.reveal = `La marionnette veille sur ${target.name} cette nuit.`;
        s.log.push(`Le Marionnettiste place sa marionnette sur ${target.name}.`);
        rep(s, `Le Marionnettiste a placé sa marionnette sur ${target.name}.`);
      }
      break;
    }
    case "cupidon": {
      const [a, b] = (payload.targetIds ?? []).map((id) => s.players.find((p) => p.id === id));
      if (a && b) {
        a.isLover = true;
        b.isLover = true;
        if (a.team !== b.team) {
          a.team = "LOVERS";
          b.team = "LOVERS";
        }
        s.reveal = nk("lovers", { a: a.name, b: b.name });
        s.log.push(nk("logCupid", { a: a.name, b: b.name }));
      }
      break;
    }
    case "mime": {
      if (target) {
        actor.copiedRoleId = target.roleId;
        s.reveal = nk("mimeCopy", { role: nrole(target.roleId) });
      }
      break;
    }
    case "enfant-sauvage": {
      if (target) {
        actor.roleModelId = target.id;
        s.reveal = nk("wildModel", { name: target.name });
      }
      break;
    }
    case "geolier": {
      if (target) {
        s.round.jailedId = target.id;
        target.disabledNightAbility = true;
        if (payload.yes) {
          s.pendingDeaths.push({ id: target.id, cause: "JAILER_EXECUTION" });
          s.reveal = nk("jailExecuted", { name: target.name });
        } else {
          s.reveal = nk("jailLocked", { name: target.name });
        }
        s.steps = rebuildRemaining(s);
      }
      break;
    }
    case "voyante": {
      if (target) {
        const seenId = seenRoleId(target);
        s.reveal = nk("seerSees", { name: target.name, role: nrole(seenId) });
        rep(
          s,
          nk("repSeerCheck", {
            role: nrole("voyante"),
            name: target.name,
            result: nrole(seenId),
          }),
        );
      }
      break;
    }
    case "voleur": {
      if (target) {
        const stolen = effectiveRoleId(target);
        actor.roleId = stolen;
        actor.copiedRoleId = undefined;
        actor.team = target.team;
        actor.lives = stolen === "ancien" ? 2 : actor.lives;
        target.roleId = "simple-villageois";
        target.copiedRoleId = undefined;
        target.team = "VILLAGEOIS";
        target.hasPuppetShield = false;
        s.reveal = nk("thiefSteal", { name: target.name, role: nrole(stolen) });
        s.log.push(nk("logThiefSteal", { name: target.name, role: nrole(stolen) }));
        rep(
          s,
          nk("repThief", {
            thief: actor.name,
            name: target.name,
            role: nrole(stolen),
          }),
        );
        s.steps = rebuildRemaining(s);
      }
      break;
    }
    case "maniaque": {
      if (target) {
        s.round.maniacKillId = target.id;
        s.reveal = nk("maniacTargetMsg", { name: target.name });
        s.log.push(nk("logManiac", { name: target.name }));
        rep(s, nk("repManiacTarget", { name: target.name }));
      }
      break;
    }
    case "trois-faces": {
      const power = payload.facePower;
      if (power) {
        actor.facesUsed = actor.facesUsed ?? [];
        if (power === "protect" && target) {
          s.round.protectedId = target.id;
          actor.facesUsed.push("protect");
          s.reveal = nk("facesProtectMsg", { name: target.name });
          s.log.push(nk("logFaces", { power: nk("repFacePower_protect"), name: target.name }));
          rep(s, nk("repFaces", { power: nk("repFacePower_protect"), name: target.name }));
        } else if (power === "inspect" && target) {
          const seenId = seenRoleId(target);
          actor.facesUsed.push("inspect");
          s.reveal = nk("facesInspectMsg", { name: target.name, role: nrole(seenId) });
          rep(
            s,
            nk("repSeerCheck", {
              role: nrole("trois-faces"),
              name: target.name,
              result: nrole(seenId),
            }),
          );
        } else if (power === "life" && s.round.attackedId) {
          const saved = s.players.find((p) => p.id === s.round.attackedId);
          s.round.attackedId = undefined;
          s.round.healed = true;
          actor.facesUsed.push("potion");
          s.reveal = nk("facesLifeMsg");
          rep(s, nk("repWitchLife", { name: saved?.name ?? "" }));
          if (saved)
            pushEvent(s, {
              round: s.night,
              phase: "NIGHT",
              type: "RESCUE",
              name: saved.name,
              bySavior: "trois-faces",
            });
        } else if (power === "poison" && target) {
          s.round.facesPoisonedId = target.id;
          actor.facesUsed.push("potion");
          s.reveal = nk("facesPoisonMsg", { name: target.name });
          s.log.push(nk("logFaces", { power: nk("repFacePower_poison"), name: target.name }));
          rep(s, nk("repWitchPoison", { name: target.name }));
        }
      }
      break;
    }
    case "salvateur": {
      if (payload.ultimateShield) {
        s.round.villageShield = true;
        rep(s, nk("repVillageShield"));
        actor.ultimateShieldUsed = true;
        actor.powersDisabled = true;
        s.reveal = nk("shieldUltimate");
        s.log.push(nk("logShieldUltimate", { n: s.night, name: actor.name }));
        break;
      }
      if (target) {
        s.round.protectedId = target.id;
        s.reveal = nk("protectedTonight", { name: target.name });
        rep(s, nk("repProtect", { role: nrole("salvateur"), name: target.name }));
      }
      break;
    }
    case "petite-fille": {
      if (payload.yes) {
        const caught = Math.random() < 0.25;
        if (caught) {
          s.round.spyCaught = true;
          s.pendingDeaths.push({ id: actor.id, cause: "SPY_DETECTED" });
          s.reveal = nk("spyCaught");
        } else {
          const wolves = s.players.filter((p) => p.alive && p.team === "WEREWOLVES");
          const hint = wolves[Math.floor(Math.random() * wolves.length)];
          s.reveal = hint
            ? nk("spyHint", { letter: hint.name.charAt(0).toUpperCase() })
            : nk("spyNothing");
        }
      } else {
        s.reveal = nk("eyesClosed");
      }
      break;
    }
    case "loup-garou": {
      const matriarch = s.players.find(
        (p) =>
          p.alive &&
          effectiveRoleId(p) === "loup-matriarche" &&
          !p.disabledNightAbility &&
          !p.powersDisabled,
      );
      if (payload.disagreement && matriarch) {
        s.round.wolvesDisagreed = true;
        s.round.attackedId = undefined;
        s.steps = [
          ...s.steps.slice(0, s.stepIndex + 1),
          {
            key: `${s.night}-loup-matriarche`,
            roleId: "loup-matriarche",
            title: "Loup Matriarche",
            prompt: "La meute n'a pas trouvé d'accord : désigne seule la victime de la nuit.",
            mode: "one",
            actorId: matriarch.id,
          },
          ...s.steps.slice(s.stepIndex + 1),
        ];
        s.reveal = nk("packDisagree");
      } else if (target) {
        s.round.attackedId = target.id;
        s.reveal = nk("packChose", { name: target.name });
        rep(s, nk("repWolvesTarget", { name: target.name }));
      }
      break;
    }
    case "loup-matriarche": {
      if (target) {
        s.round.attackedId = target.id;
        s.reveal = nk("matriarchImpose", { name: target.name });
        rep(s, nk("repWolvesTarget", { name: target.name }));
        s.log.push(nk("logMatriarch", { name: target.name }));
      }
      break;
    }
    case "loup-bavard": {
      if (step.soloKill && payload.targetId && !s.round.attackedId) {
        s.round.attackedId = payload.targetId;
        const v = s.players.find((p) => p.id === payload.targetId);
        if (v) s.log.push(nk("logSoloKill", { role: nrole("loup-bavard"), name: v.name }));
      }
      s.reveal = nk("talkativeWord", { word: s.round.requiredWord ?? "" });
      break;
    }
    case "loup-noir": {
      if (payload.targetId && !s.round.attackedId) {
        s.round.attackedId = payload.targetId;
        const soloVictim = s.players.find((p) => p.id === payload.targetId);
        if (soloVictim) {
          s.log.push(nk("logSoloKill", { role: nrole("loup-noir"), name: soloVictim.name }));
        }
      }
      const notes: string[] = [];
      const infectionBlocked =
        !!payload.yes &&
        !!s.round.attackedId &&
        (s.round.villageShield || s.round.attackedId === s.round.protectedId);
      if (infectionBlocked) {
        notes.push(nk("infectBlocked"));
        s.log.push(nk("logInfectBlocked"));
      }
      if (payload.yes && !infectionBlocked && s.round.attackedId && !actor.abilityUsed) {
        const victim = s.players.find((p) => p.id === s.round.attackedId)!;
        victim.originalRoleId = victim.roleId;
        victim.isConvertedToWolf = true;
        victim.retainsOriginalPowers = true;
        victim.team = "WEREWOLVES";
        s.round.attackedId = undefined;
        s.round.blackWolfConvert = true;
        actor.abilityUsed = true;
        notes.push(nk("infectJoin", { name: victim.name }));
        s.log.push(nk("logInfect", { name: victim.name }));
        rep(s, nk("repInfect", { name: victim.name }));
        pushEvent(s, {
          round: s.night,
          phase: "NIGHT",
          type: "CONTAMINATION",
          name: victim.name,
          roleId: victim.originalRoleId,
        });
      }
      if (payload.muteId && s.night >= 2 && payload.muteId !== s.round.previousMutedId) {
        const muted = s.players.find((p) => p.id === payload.muteId);
        if (muted) {
          s.round.mutedId = muted.id;
          notes.push(nk("silenceNote", { name: muted.name }));
          s.log.push(nk("logSilence", { name: muted.name }));
          rep(
            s,
            muted.id === actor.id
              ? nk("repSilenceSelf", { name: muted.name })
              : nk("repSilence", { name: muted.name }),
          );
        }
      }
      s.reveal = notes.length ? notes.join(" ") : nk("packAsPlanned");
      break;
    }
    case "loup-blanc": {
      if (target) {
        if (step.soloKill) {
          if (!s.round.attackedId) s.round.attackedId = target.id;
          s.log.push(nk("logSoloKill", { role: nrole("loup-blanc"), name: target.name }));
        } else {
          s.round.whiteWolfKillId = target.id;
        }
        s.reveal = nk("whiteTarget", { name: target.name });
      }
      break;
    }
    case "sorciere": {
      if (payload.healUsed && s.round.attackedId) {
        const saved = s.players.find((p) => p.id === s.round.attackedId);
        s.round.healed = true;
        s.round.attackedId = undefined;
        actor.healUsed = true;
        actor.hasUsedLifePotion = true;
        s.reveal = nk("witchSaved");
        rep(s, nk("repWitchLife", { name: saved?.name ?? "" }));
        if (saved)
          pushEvent(s, {
            round: s.night,
            phase: "NIGHT",
            type: "RESCUE",
            name: saved.name,
            bySavior: "sorciere",
          });
      }
      if (payload.poisonId) {
        s.round.poisonedId = payload.poisonId;
        actor.poisonUsed = true;
        actor.hasUsedDeathPotion = true;
        const v = s.players.find((p) => p.id === payload.poisonId);
        s.reveal = nk("poisoned", { name: v?.name ?? "" });
        rep(s, nk("repWitchPoison", { name: v?.name ?? "" }));
      }
      break;
    }
    case "joueur-de-flute": {
      (payload.targetIds ?? []).forEach((id) => {
        const p = s.players.find((x) => x.id === id);
        if (p) p.enchanted = true;
      });
      s.reveal = nk("fluteCharm");
      break;
    }
    case "corbeau": {
      if (target) {
        s.round.ravenTargetId = target.id;
        s.reveal = nk("ravenVotes", { name: target.name });
      }
      break;
    }
    case "tavernier": {
      if (target) {
        s.round.drinkTargetId = target.id;
        s.reveal = nk("tavernDrink", { name: target.name });
      }
      break;
    }
    case "montreur-dours": {
      s.round.bearGrowls = bearShouldGrowl(s, actor.id);
      s.reveal = s.round.bearGrowls ? nk("bearGrowl") : nk("bearCalm");
      break;
    }
    case "general": {
      if (target) {
        actor.abilityUsed = true;
        const isWolf = target.team === "WEREWOLVES" || target.isConvertedToWolf === true;
        if (isWolf) {
          s.pendingDeaths.push({ id: target.id, cause: "GENERAL_STRIKE" });
          s.players.forEach((p) => {
            p.isCaptain = false;
            p.voteWeight = 1;
          });
          actor.isCaptain = true;
          actor.voteWeight = 2;
          s.villageCaptainId = actor.id;
          s.reveal = nk("generalWolf", { name: target.name, actor: actor.name });
          s.log.push(nk("logGeneralWolf", { name: target.name }));
        } else {
          s.pendingDeaths.push({ id: actor.id, cause: "GENERAL_FAILED" });
          s.reveal = nk("generalFail", { name: target.name });
          s.log.push(nk("logGeneralFail", { name: target.name }));
        }
      } else {
        s.reveal = nk("generalIdle");
      }
      break;
    }
  }

  s.stepIndex += 1;
  if (s.stepIndex >= s.steps.length) {
    return resolveNight(s);
  }
  return s;
}

function seenRoleId(target: Player): string {
  const id = target.originalRoleId ?? effectiveRoleId(target);
  return id === "maniaque" ? "simple-villageois" : id;
}

function rebuildRemaining(s: GameState): Step[] {
  const done = s.steps.slice(0, s.stepIndex + 1);
  const jailed = s.round.jailedId;
  return [
    ...done,
    ...s.steps
      .slice(s.stepIndex + 1)
      .filter((st) => st.actorId !== jailed || st.roleId === "loup-garou"),
  ];
}

function pushEvent(s: GameState, e: GameEvent) {
  if (!s.events) s.events = [];
  s.events.push(e);
}

function killPlayer(s: GameState, id: string, cause: DeathCause) {
  const p = s.players.find((x) => x.id === id);
  if (!p || !p.alive) return;

  if (cause === "WOLVES" && p.lives > 1) {
    p.lives -= 1;
    s.dawnSummary.push(nk("survivedAttack", { name: p.name }));
    pushEvent(s, {
      round: s.night,
      phase: "NIGHT",
      type: "RESCUE",
      name: p.name,
      bySavior: "ancien",
    });
    return;
  }

  p.alive = false;
  p.deathCause = cause;
  s.dawnSummary.push(nk("deathLine", { name: p.name, cause: DEATH_LABEL[cause] }));
  s.log.push(
    nk("logDeath", {
      name: p.name,
      role: nrole(effectiveRoleId(p)),
      cause: DEATH_LABEL[cause],
    }),
  );
  pushEvent(s, {
    round: cause === "VILLAGE_VOTE" ? s.day || s.night : s.night,
    phase:
      cause === "VILLAGE_VOTE" || cause === "HUNTER_SHOT" || cause === "TALKATIVE_WOLF"
        ? "DAY"
        : "NIGHT",
    type: "KILL",
    name: p.name,
    roleId: p.originalRoleId ?? effectiveRoleId(p),
    cause,
  });

  if (p.isCaptain) {
    p.isCaptain = false;
    s.villageCaptainId = undefined;
    if (s.players.some((x) => x.alive && x.id !== p.id)) {
      s.captainSuccessionPending = p.id;
    }
  }

  if (
    effectiveRoleId(p) === "ancien" &&
    (cause === "VILLAGE_VOTE" || cause === "HUNTER_SHOT" || cause === "WITCH_POISON")
  ) {
    s.players
      .filter((x) => x.alive && x.team === "VILLAGEOIS")
      .forEach((x) => {
        x.powersDisabled = true;
      });
    s.dawnSummary.push(nk("elderFall"));
  }

  s.players
    .filter((x) => x.alive && x.roleModelId === p.id)
    .forEach((x) => {
      x.team = "WEREWOLVES";
      s.dawnSummary.push(nk("wildAwaken", { name: x.name }));
    });

  if (p.isLover) {
    const other = s.players.find((x) => x.isLover && x.id !== p.id && x.alive);
    if (other) killPlayer(s, other.id, "HEARTBREAK");
  }

  if (effectiveRoleId(p) === "chasseur" && !p.powersDisabled) {
    s.hunterPending = p.id;
  }
}

function resolveNight(state: GameState): GameState {
  const s = clone(state);
  s.dawnSummary = [];

  if (s.round.attackedId) {
    const victim = s.players.find((p) => p.id === s.round.attackedId)!;
    const hunterAlive = s.players.some((p) => p.alive && effectiveRoleId(p) === "chasseur");
    if (effectiveRoleId(victim) === "chaperon-rouge" && hunterAlive) {
      s.round.attackedId = undefined;
      s.dawnSummary.push(nk("redRidingHood"));
      pushEvent(s, {
        round: s.night,
        phase: "NIGHT",
        type: "RESCUE",
        name: victim.name,
        bySavior: "chasseur",
      });
    }
  }
  if (s.round.villageShield) {
    if (s.round.attackedId || s.round.whiteWolfKillId) {
      s.dawnSummary.push(nk("villageShieldSaved"));
      const saved = s.players.find(
        (p) => p.id === (s.round.attackedId ?? s.round.whiteWolfKillId),
      );
      if (saved)
        pushEvent(s, {
          round: s.night,
          phase: "NIGHT",
          type: "RESCUE",
          name: saved.name,
          bySavior: "salvateur",
        });
    }
    s.round.attackedId = undefined;
    s.round.whiteWolfKillId = undefined;
  }
  if (s.round.attackedId && s.round.attackedId === s.round.protectedId) {
    const saved = s.players.find((p) => p.id === s.round.attackedId);
    s.round.attackedId = undefined;
    s.dawnSummary.push(nk("saviorFoiled"));
    if (saved)
      pushEvent(s, {
        round: s.night,
        phase: "NIGHT",
        type: "RESCUE",
        name: saved.name,
        bySavior: "salvateur",
      });
  }
  if (s.round.attackedId && s.round.attackedId === s.round.jailedId) {
    const saved = s.players.find((p) => p.id === s.round.attackedId);
    s.round.attackedId = undefined;
    s.dawnSummary.push(nk("jailerSafe"));
    if (saved)
      pushEvent(s, {
        round: s.night,
        phase: "NIGHT",
        type: "RESCUE",
        name: saved.name,
        bySavior: "geolier",
      });
  }

  // ---------------------------------------------------------------------------
  // Redirection des attaques de loups sur le Marionnettiste vers sa marionnette
  // ---------------------------------------------------------------------------
  if (s.round.attackedId) {
    const attackedPlayer = s.players.find((p) => p.id === s.round.attackedId);

    if (attackedPlayer && effectiveRoleId(attackedPlayer) === "marionnettiste") {
      // Trouver le joueur qui porte la marionnette
      const puppetPlayer = s.players.find((p) => p.alive && p.hasPuppetShield);

      if (puppetPlayer) {
        // La marionnette est consommée / détruite
        puppetPlayer.hasPuppetShield = false;
        attackedPlayer.abilityUsed = true;

        // Cas 4 : La marionnette est protégée par le Salvateur ou bouclier du village
        const isPuppetProtected =
          s.round.protectedId === puppetPlayer.id || s.round.villageShield;

        if (isPuppetProtected) {
          s.round.attackedId = undefined; // L'attaque est complètement perdue
          s.dawnSummary.push(
            `Les loups ont attaqué le Marionnettiste, mais l'attaque redirigée vers la marionnette de ${puppetPlayer.name} a été bloquée par le Salvateur !`,
          );
          pushEvent(s, {
            round: s.night,
            phase: "NIGHT",
            type: "RESCUE",
            name: puppetPlayer.name,
            bySavior: "salvateur",
          });
        } else {
          // Cas 2 : L'attaque est redirigée vers le porteur de la marionnette (qui meurt à la place)
          s.round.attackedId = puppetPlayer.id; // Redirection de la mort vers le porteur
          attackedPlayer.mutedForDay = true;     // Le Marionnettiste devient muet

          s.dawnSummary.push(
            `Les loups ont attaqué le Marionnettiste ! La marionnette portée par ${puppetPlayer.name} a absorbé le coup et a péri à sa place. Le Marionnettiste est désormais muet.`,
          );
          rep(
            s,
            `La marionnette portée par ${puppetPlayer.name} a été détruite en absorbant l'attaque des loups.`,
          );
          pushEvent(s, {
            round: s.night,
            phase: "NIGHT",
            type: "RESCUE",
            name: attackedPlayer.name,
            bySavior: "marionnettiste",
          });
        }
      } else {
        // Cas 3 : Plus de marionnette active (déjà détruite ou absente), le Marionnettiste prend l'attaque et meurt normalement.
        // s.round.attackedId reste le Marionnettiste, killPlayer s'en chargera.
      }
    }
  }

  const aliveBefore = new Set(s.players.filter((p) => p.alive).map((p) => p.id));
  if (s.round.maniacKillId) killPlayer(s, s.round.maniacKillId, "MANIAC");
  if (s.round.attackedId) killPlayer(s, s.round.attackedId, "WOLVES");
  if (s.round.whiteWolfKillId) killPlayer(s, s.round.whiteWolfKillId, "WHITE_WOLF_KILL");
  if (s.round.poisonedId) killPlayer(s, s.round.poisonedId, "WITCH_POISON");
  if (s.round.facesPoisonedId) killPlayer(s, s.round.facesPoisonedId, "THREE_FACES_POISON");
  s.pendingDeaths.forEach((d) => killPlayer(s, d.id, d.cause));
  s.pendingDeaths = [];

  if (s.round.bearGrowls) {
    s.dawnSummary.push(nk("bearNear"));
  }

  // Silence permanent pour le Marionnettiste dont la marionnette a été détruite
  s.players.forEach((p) => {
    if (p.alive && effectiveRoleId(p) === "marionnettiste" && p.abilityUsed) {
      p.mutedForDay = true;
    }
  });

  if (s.round.mutedId) {
    const muted = s.players.find((p) => p.id === s.round.mutedId);
    if (muted && muted.alive) {
      muted.mutedForDay = true;
      s.dawnSummary.push(nk("mutedToday", { name: muted.name }));
    }
  }

  s.players.forEach((p) => {
    p.immuneToDayVote = false;
    p.baseVotes = 0;
  });
  if (s.round.drinkTargetId) {
    const d = s.players.find((p) => p.id === s.round.drinkTargetId);
    if (d) {
      d.immuneToDayVote = true;
      d.canVote = false;
    }
  }
  if (s.round.ravenTargetId) {
    const r = s.players.find((p) => p.id === s.round.ravenTargetId);
    if (r) r.baseVotes = 2;
  }

  const deaths = s.players.filter((p) => !p.alive && aliveBefore.has(p.id));
  deaths.forEach((p) =>
    rep(
      s,
      nk("repDied", {
        name: p.name,
        role: nrole(p.originalRoleId ?? effectiveRoleId(p)),
        cause: p.deathCause ? DEATH_LABEL[p.deathCause] : "",
      }),
    ),
  );
  s.events
    .filter((e) => e.phase === "NIGHT" && e.round === s.night && e.type === "RESCUE")
    .forEach((e) =>
      rep(s, nk("repSavedBy", { name: e.name, role: nrole(e.bySavior ?? "salvateur") })),
    );
  s.players
    .filter((p) => p.alive && p.mutedForDay)
    .forEach((p) => rep(s, nk("repMuted", { name: p.name })));
  if (deaths.length === 0) rep(s, nk("repNoDeaths"));

  if (s.dawnSummary.length === 0) s.dawnSummary.push(nk("nobodyDied"));

  s.phase = s.hunterPending ? "EVENEMENT_MORT" : "AUBE";
  s.day = s.night;
  return checkVictory(s);
}

export function resolveHunter(state: GameState, targetId: string): GameState {
  const s = clone(state);
  s.hunterPending = undefined;
  killPlayer(s, targetId, "HUNTER_SHOT");
  s.phase = s.hunterPending ? "EVENEMENT_MORT" : s.day > 0 ? "AUBE" : "AUBE";
  return checkVictory(s);
}

export function goToVote(state: GameState): GameState {
  const s = clone(state);
  s.phase = "JOUR_VOTE";
  return s;
}

export function suicideReveal(state: GameState, targetId: string): GameState {
  let s = clone(state);
  const target = s.players.find((p) => p.id === targetId);
  if (!target || !target.alive) return state;
  s.dawnSummary = [];
  s.lastEliminated = [];
  killPlayer(s, targetId, "SUICIDE_REVEAL");
  s.log.push(nk("logSuicideReveal", { name: target.name }));
  s.hunterPending = undefined;
  s.captainSuccessionPending = undefined;
  s = checkVictory(s);
  if (s.phase === "FIN") return s;
  return startNight(s);
}

export function assignCaptain(state: GameState, targetId: string): GameState {
  const s = clone(state);
  s.players.forEach((p) => {
    p.isCaptain = false;
    p.voteWeight = 1;
  });
  const next = s.players.find((p) => p.id === targetId && p.alive);
  if (next) {
    next.isCaptain = true;
    next.voteWeight = 2;
    s.villageCaptainId = next.id;
    s.log.push(nk("newCaptain", { name: next.name }));
  }
  s.captainSuccessionPending = undefined;
  return s;
}

export function skipVote(state: GameState): GameState {
  const s = clone(state);
  s.voteSkippedOffer = true;
  s.log.push(nk("day1NoVote"));
  return startNight(s);
}

export function submitVote(state: GameState, targetId: string, talkativeSpoke = true): GameState {
  let s = clone(state);
  const target = s.players.find((p) => p.id === targetId);
  s.lastEliminated = [];

  if (target && !target.immuneToDayVote) {
    const roleId = effectiveRoleId(target);
    if (roleId === "ange" && s.day === 1) {
      s.phase = "FIN";
      s.winnerTeam = "OTHER";
      s.winner = nk("winAngel", { name: target.name });
      return s;
    }
    if (roleId === "idiot-du-village" && !target.abilityUsed) {
      target.abilityUsed = true;
      target.canVote = false;
      s.dawnSummary = [nk("idiotSurvives", { name: target.name })];
    } else {
      s.dawnSummary = [];
      killPlayer(s, target.id, "VILLAGE_VOTE");
      s.lastEliminated = [
        {
          id: target.id,
          name: target.name,
          roleId: target.originalRoleId ?? effectiveRoleId(target),
        },
      ];
    }
  } else if (target) {
    s.dawnSummary = [nk("untouchableToday", { name: target.name })];
  }

  if (s.day === 1) {
    s.players
      .filter((p) => effectiveRoleId(p) === "ange" && p.alive)
      .forEach((p) => {
        p.roleId = "simple-villageois";
        p.copiedRoleId = undefined;
        p.team = "VILLAGEOIS";
      });
  }

  if (!talkativeSpoke) {
    const talk = s.players.find((p) => p.alive && effectiveRoleId(p) === "loup-bavard");
    if (talk) killPlayer(s, talk.id, "TALKATIVE_WOLF");
  }

  s = checkVictory(s);
  if (s.phase === "FIN") return s;
  if (s.hunterPending) {
    s.phase = "EVENEMENT_MORT";
    return s;
  }
  return startNight(s);
}

export function eliminateTied(state: GameState, ids: string[], talkativeSpoke = true): GameState {
  let s = clone(state);
  s.dawnSummary = [];
  s.lastEliminated = [];
  ids.forEach((id) => {
    const p = s.players.find((x) => x.id === id);
    if (!p || !p.alive || p.immuneToDayVote) return;
    killPlayer(s, id, "VILLAGE_VOTE");
    s.lastEliminated!.push({
      id: p.id,
      name: p.name,
      roleId: p.originalRoleId ?? effectiveRoleId(p),
    });
  });

  if (!talkativeSpoke) {
    const talk = s.players.find((p) => p.alive && effectiveRoleId(p) === "loup-bavard");
    if (talk) killPlayer(s, talk.id, "TALKATIVE_WOLF");
  }

  s = checkVictory(s);
  if (s.phase === "FIN") return s;
  if (s.hunterPending) {
    s.phase = "EVENEMENT_MORT";
    return s;
  }
  return startNight(s);
}

export function executeTalkativeWolfAndSkip(state: GameState): GameState {
  let s = clone(state);
  const talk = s.players.find((p) => p.alive && effectiveRoleId(p) === "loup-bavard");
  if (talk) {
    killPlayer(s, talk.id, "TALKATIVE_WOLF");
    s.log.push(nk("logTalkativeExecuted", { d: s.day }));
  }
  s = checkVictory(s);
  if (s.phase === "FIN") return s;
  if (s.hunterPending) {
    s.phase = "EVENEMENT_MORT";
    return s;
  }
  return startNight(s);
}

export function startNight(state: GameState): GameState {
  const s = clone(state);
  s.night += 1;
  s.phase = "NUIT";
  s.round = {
    previousProtectedId: state.round.protectedId,
    previousMutedId: state.round.mutedId,
  };
  s.stepIndex = 0;
  s.reveal = undefined;
  s.dawnSummary = [];
  s.nightReport = [];
  s.players.forEach((p) => {
    p.disabledNightAbility = false;
  });
  s.steps = buildNightSteps(s);
  s.log.push(nk("nightHeader", { n: s.night }));
  return s;
}

export function checkVictory(state: GameState): GameState {
  const s = clone(state);
  const living = s.players.filter((p) => p.alive);
  if (living.length === 0) {
    s.phase = "FIN";
    s.winnerTeam = "OTHER";
    s.winner = nk("winNobody");
    return s;
  }

  const lovers = living.filter((p) => p.team === "LOVERS");
  if (lovers.length === 2 && living.length === 2) {
    s.phase = "FIN";
    s.winnerTeam = "OTHER";
    s.winner = nk("winLovers", { a: lovers[0].name, b: lovers[1].name });
    return s;
  }

  const whiteWolf = living.find((p) => effectiveRoleId(p) === "loup-blanc");
  if (whiteWolf && living.length === 1) {
    s.phase = "FIN";
    s.winnerTeam = "WOLVES";
    s.winner = nk("winWhiteWolf", { name: whiteWolf.name });
    return s;
  }

  const piper = living.find((p) => effectiveRoleId(p) === "joueur-de-flute");
  if (piper) {
    const enchanted = living.filter((p) => p.enchanted && p.id !== piper.id);
    if (enchanted.length === living.length - 1) {
      s.phase = "FIN";
      s.winnerTeam = "OTHER";
      s.winner = nk("winPiper", { name: piper.name });
      return s;
    }
  }

  const maniac = living.find((p) => effectiveRoleId(p) === "maniaque");
  if (maniac && living.length <= 2) {
    s.phase = "FIN";
    s.winnerTeam = "OTHER";
    s.winner = nk("winManiac", { name: maniac.name });
    return s;
  }

  const wolves = living.filter((p) => p.team === "WEREWOLVES");
  if (wolves.length === 0 && !maniac) {
    s.phase = "FIN";
    s.winnerTeam = "VILLAGE";
    s.winner = nk("winVillage");
    return s;
  }
  if (wolves.length > 0 && !maniac && wolves.length >= living.length - wolves.length) {
    s.phase = "FIN";
    s.winnerTeam = "WOLVES";
    s.winner = nk("winWolves");
    return s;
  }
  return s;
}
