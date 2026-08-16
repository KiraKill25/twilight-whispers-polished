/** Contenu du guide "Comment jouer" (5 diapositives) + pistes de narration. */

import type { Lang } from "@/lib/i18n";

const SLIDE_TIMESTAMPS_BASE = {
  fr: [2, 11, 56, 75, 95],
  en: [2, 11, 53, 72, 90],
  ar: [2, 12, 63, 87, 109],
};

export const SLIDE_TIMESTAMPS: Record<Lang, number[]> = {
  ...SLIDE_TIMESTAMPS_BASE,
  es: SLIDE_TIMESTAMPS_BASE.en,
  zh: SLIDE_TIMESTAMPS_BASE.en,
  pt: SLIDE_TIMESTAMPS_BASE.en,
  ru: SLIDE_TIMESTAMPS_BASE.en,
  de: SLIDE_TIMESTAMPS_BASE.en,
};

export const NARRATION_SRC: Record<Lang, string> = {
  fr: "/audio/narration_fr.mp3",
  en: "/audio/narration_en.mp3",
  ar: "/audio/narration_ar.mp3",
  es: "/audio/narration_en.mp3",
  zh: "/audio/narration_en.mp3",
  pt: "/audio/narration_en.mp3",
  ru: "/audio/narration_en.mp3",
  de: "/audio/narration_en.mp3",
};

export interface HowToSlide {
  kicker: string;
  title: string;
  body: string;
  /** Encart mis en avant (badge lumineux). */
  badge?: string;
}

export interface HowToCopy {
  openLabel: string;
  title: string;
  prev: string;
  next: string;
  close: string;
  play: string;
  pause: string;
  cta: string;
  slides: HowToSlide[];
}

const HOWTO_BASE = {
  fr: {
    openLabel: "Guide du Meneur",
    title: "Comment jouer",
    prev: "Diapositive précédente",
    next: "Diapositive suivante",
    close: "Fermer le guide",
    play: "Lancer la narration",
    pause: "Mettre la narration en pause",
    cta: "Que la chasse commence",
    slides: [
      {
        kicker: "Prélude",
        title: "La malédiction ancienne",
        body: "Un voyageur encapuchonné dépose son grimoire aux portes du village. Cette nuit, la malédiction se réveille : des loups marchent parmi les vôtres. Le Meneur du Jeu garde le téléphone et guide chaque phase.",
      },
      {
        kicker: "Crépuscule",
        title: "Les rôles secrets",
        body: "Chaque joueur reçoit une carte en secret : Village, Loups-Garous ou Solitaire. Regarde ta carte seul, puis passe le téléphone. Personne ne doit deviner ton camp.",
        badge: "Village · Loups-Garous · Solitaires",
      },
      {
        kicker: "La nuit",
        title: "Actions silencieuses",
        body: "Le village s'endort. Le Meneur réveille les rôles un par un, en silence. Les loups désignent leur victime, les protecteurs et voyants agissent dans l'ombre.",
        badge: "Nuit 1 : le Corbeau, le Geôlier et le Loup Bavard restent endormis jusqu'à la nuit 2.",
      },
      {
        kicker: "L'aube",
        title: "Accusations & vote",
        body: "Le jour se lève, les morts sont annoncés. Le village débat, s'accuse, puis vote pour éliminer un suspect. En cas d'égalité, le Juge tranche.",
        badge: "Corbeau : +2 voix contre sa cible",
      },
      {
        kicker: "Victoire",
        title: "Que la chasse commence",
        body: "Le Village gagne quand tous les loups sont morts. Les Loups-Garous gagnent quand ils dominent le village. Les Solitaires n'obéissent qu'à leur propre condition.",
      },
    ],
  },
  en: {
    openLabel: "How to Play",
    title: "How to Play",
    prev: "Previous slide",
    next: "Next slide",
    close: "Close guide",
    play: "Play narration",
    pause: "Pause narration",
    cta: "Let the Hunt Begin",
    slides: [
      {
        kicker: "Prelude",
        title: "The ancient curse",
        body: "A hooded traveler lays a grimoire at the village gates. Tonight the curse awakens: wolves walk among your own. The Game Master holds the phone and guides every phase.",
      },
      {
        kicker: "Twilight",
        title: "The secret roles",
        body: "Each player secretly receives a card: Village, Werewolves or Solo. Look at your card alone, then pass the phone on. No one may guess your side.",
        badge: "Village · Werewolves · Solo",
      },
      {
        kicker: "Night",
        title: "Silent actions",
        body: "The village falls asleep. The Game Master wakes each role one by one, in silence. The wolves choose their victim while protectors and seers act in the shadows.",
        badge: "Night 1: the Raven, the Jailer and the Talkative Wolf stay dormant until Night 2.",
      },
      {
        kicker: "Daybreak",
        title: "Accusations & voting",
        body: "Dawn breaks and the dead are announced. The village debates, accuses, then votes to eliminate a suspect. On a tie, the Judge decides.",
        badge: "Raven: +2 extra votes on its target",
      },
      {
        kicker: "Victory",
        title: "Let the hunt begin",
        body: "The Village wins when every wolf is dead. The Werewolves win when they outnumber the village. Solo roles answer only to their own condition.",
      },
    ],
  },
  ar: {
    openLabel: "دليل قائد اللعبة",
    title: "كيف تلعب",
    prev: "الشريحة السابقة",
    next: "الشريحة التالية",
    close: "إغلاق الدليل",
    play: "تشغيل السرد",
    pause: "إيقاف السرد",
    cta: "ولتبدأ رحلة الصيد",
    slides: [
      {
        kicker: "المقدمة",
        title: "اللعنة القديمة",
        body: "مسافر مقنّع يضع كتابه عند أبواب القرية. الليلة تستيقظ اللعنة: ذئاب تسير بين أهلك. قائد اللعبة يحمل الهاتف ويقود كل مرحلة.",
      },
      {
        kicker: "الغروب",
        title: "الأدوار السرية",
        body: "يتلقى كل لاعب بطاقته سرًا: القرية، المستذئبون أو المنفرد. انظر إلى بطاقتك وحدك ثم مرّر الهاتف. لا يجب أن يعرف أحد فريقك.",
        badge: "القرية · المستذئبون · المنفردون",
      },
      {
        kicker: "الليل",
        title: "أفعال صامتة",
        body: "تنام القرية. يوقظ القائد كل دور على حدة في صمت. تختار الذئاب ضحيتها بينما يتحرك الحماة والعرافون في الظل.",
        badge: "الليلة الأولى: الغراب والسجّان والذئب المتكلم يبقون نائمين حتى الليلة الثانية.",
      },
      {
        kicker: "الفجر",
        title: "الاتهامات والتصويت",
        body: "يطلع الفجر ويُعلن الموتى. تتناقش القرية وتتّهم ثم تصوّت لإقصاء مشتبه به. عند التعادل يحكم القاضي.",
        badge: "الغراب: صوتان إضافيان على هدفه",
      },
      {
        kicker: "الفوز",
        title: "ولتبدأ رحلة الصيد",
        body: "تفوز القرية عندما يموت كل الذئاب. يفوز المستذئبون عندما يسيطرون على القرية. أما المنفردون فلهم شروطهم الخاصة.",
      },
    ],
  },
} satisfies Record<"fr" | "en" | "ar", HowToCopy>;

export const HOWTO: Record<Lang, HowToCopy> = {
  ...HOWTO_BASE,
  es: HOWTO_BASE.en,
  zh: HOWTO_BASE.en,
  pt: HOWTO_BASE.en,
  ru: HOWTO_BASE.en,
  de: HOWTO_BASE.en,
};
