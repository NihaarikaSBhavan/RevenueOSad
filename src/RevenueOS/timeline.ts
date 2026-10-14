// Every beat as a frame number (30fps). Moves start 3–4 frames before the word they serve.
export const T = {
  // 0:00–0:05 tension
  counter: [36, 78, 120], // Unanswered 1,247 → 1,248 → 1,249
  chipFade: [40, 115], // Priya's temperature chip, orange → grey
  clinical: 18,

  // 0:05 the OS switches on
  scan: 146, // scan line starts (lands with "Revenue OS" energy, 3f before 0:05)
  priyaLit: 160,
  numberSnap: 168,
  sourceStamp: 176,
  warmChip: 186,

  // 0:07 chat
  glideChat: 206,
  msg1: 228,
  typing: 240,
  reply1: 250,
  rateChip: 258,
  chip247: 262,
  msgHindi: 274,
  replyHindi: 290,
  beatWorked: 246,

  // 0:10 write-back
  glideContact: 298,
  lift: [306, 318, 330],
  land: [326, 338, 350],
  beatRecords: 324,

  // 0:13 score
  zoomGauge: 382,
  gauge: 392,
  bars: 396,
  hot: 426,

  // 0:15 calendar + click 1
  glideCalendar: 438,
  askDrop: 462,
  collide: 474,
  snap: 488,
  feedItem: 494,
  click1: 506,

  // 0:17 click 2, invite, Saturday, click 3
  preview: 516,
  click2: 540,
  invite: 548,
  reminder: 558,
  saturday: 562,
  visitDone: 568,
  thankYou: 572,
  click3: 580,
  lock: 584, // "3 clicks. Enquiry to visit." held to 616: the money shot

  // 0:20 +30 days
  days30: 616,
  glideGrowth: 614,
  nba: 630,
  revenue: 648,
  churnFlag: 644,
  retention: 654,
  labels: [650, 661, 672],
  beatGrown: 648,

  // 0:22 pull back
  pullBack: 680,
  dial: 690,
  beat100: 694,

  // 0:24 close
  dissolve: 718,
  title: 728,
  subline: 742,
  endCard1: 780,
  drums: [782, 800, 818],
  endCard2: 840,
  logo: 842,
  partOf: 852,
  cta: 862,
};

/** One still per beat, for approval before animation polish. */
/** One still per beat, each taken where the beat has fully settled. */
export const STILLS: [string, number][] = [
  ["01-tension", 122],
  ["02-os-on", 200],
  ["03-chat", 296],
  ["04-writeback", 362],
  ["05-score", 437],
  ["06-calendar-click1", 518],
  ["07-click3-money-shot", 606],
  ["08-plus30-grown", 678],
  ["09-pullback", 712],
  ["10-title", 770],
  ["11-endcard1", 834],
  ["12-endcard2", 892],
];
