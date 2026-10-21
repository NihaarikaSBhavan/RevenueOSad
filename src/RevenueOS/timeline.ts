// Every beat as a frame number (30fps). Moves start 3–4 frames before the word they serve.
export const T = {
  // 0:00–0:07 tension: the cost, in blue
  counter: [30, 64, 94, 120, 143, 163, 181, 197, 211], // ticks come faster: the cost compounds while you wait
  chipFade: [61, 175], // Priya's temperature chip, orange → grey
  clinical: 27,

  // 0:07 the turn: Revenue OS switches on, blue gives way to orange
  scan: 222, // scan line starts (lands with "Revenue OS" energy, 4f before VO2 "Revenue OS")
  priyaLit: 234,
  numberSnap: 241,
  sourceStamp: 248,
  warmChip: 257,

  // 0:09 chat
  glideChat: 274,
  msg1: 293,
  typing: 304,
  reply1: 312,
  rateChip: 319,
  chip247: 323,
  msgHindi: 333,
  replyHindi: 347,
  beatWorked: 309,

  // 0:12 write-back
  glideContact: 354,
  lift: [361, 371, 382],
  land: [378, 388, 399],
  beatRecords: 376,

  // 0:14 score
  zoomGauge: 427,
  gauge: 435,
  bars: 439,
  hot: 465,

  // 0:16 calendar + click 1
  glideCalendar: 475,
  askDrop: 496,
  collide: 506,
  snap: 519,
  feedItem: 524,
  click1: 534,

  // 0:18 click 2, invite, Saturday, click 3
  preview: 543,
  click2: 564,
  invite: 571,
  reminder: 579,
  saturday: 583,
  visitDone: 588,
  thankYou: 591,
  click3: 598,
  lock: 602, // "3 clicks. Enquiry to visit." held to days30: the money shot

  // 0:21 +30 days
  days30: 630,
  glideGrowth: 628,
  nba: 642,
  revenue: 657,
  churnFlag: 654,
  retention: 663,
  labels: [659, 669, 678],
  beatGrown: 657,

  // 0:23 pull back
  pullBack: 685,
  dial: 694,
  beat100: 697,

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
  ["01-tension", 186],
  ["02-os-on", 269],
  ["03-chat", 352],
  ["04-writeback", 409],
  ["05-score", 474],
  ["06-calendar-click1", 545],
  ["07-click3-money-shot", 621],
  ["08-plus30-grown", 683],
  ["09-pullback", 713],
  ["10-title", 770],
  ["11-endcard1", 834],
  ["12-endcard2", 892],
];
