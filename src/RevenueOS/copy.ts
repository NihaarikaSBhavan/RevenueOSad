// Every on-screen string lives here so it can be checked against the brief's banned-word list.
export const COPY = {
  dashTitle: "Enquiries · All sources",
  clock: "2:47 AM",
  unanswered: "Unanswered",
  clinical: "Leads paid for. Leads never called.",
  priyaTitle: "New enquiry · Priya S. · Instagram ad",
  lastContact: "Last contact: —",
  phoneRaw: "98450 12345",
  phoneE164: "+91 98450 12345",
  sourceTag: "source=instagram",
  warm: "Warm 54",
  hot: "Hot 86",

  chatHeader: "Priya S.",
  chatSub: "+91 98450 12345 · online",
  msg1: "Hi, how much is a skin consultation? Indiranagar is closest for me.",
  reply1: "Hi Priya. A skin consultation is ₹1,500 at our Indiranagar branch.",
  rateChip: "Skin consultation · ₹1,500 · Indiranagar",
  msgHindi: "ठीक है, बजट 2000 तक है। शनिवार 10:30 मिल सकता है?",
  replyHindi: "ज़रूर, प्रिया। मैं शनिवार के स्लॉट देख रही हूँ।",
  repliedBy: "Replied by Revenue OS",
  chip247: "24/7",
  beatWorked: "Every lead worked.",

  c360: "Contact 360",
  summaryLabel: "Summary",
  summary: "New enquiry for a skin consultation. Prefers Indiranagar, Saturday morning.",
  profileLabel: "Captured profile",
  fields: [
    { label: "Budget", value: "Up to ₹2,000", quote: "“बजट 2000 तक है”", conf: "0.94" },
    { label: "Branch", value: "Indiranagar", quote: "“Indiranagar is closest for me”", conf: "0.91" },
    { label: "Preferred time", value: "Sat 10:30", quote: "“शनिवार 10:30”", conf: "0.97" },
  ],
  temperature: "Live temperature",
  signals: ["Intent", "Engagement", "Recency", "Source"],
  beatRecords: "Your records write themselves.",

  todayFeed: "Today",
  feed: ["Approve booking · Priya S. · Sat 11:00", "Approve message · Priya S.", "Mark visit complete · Priya S."],
  approve: "Approve",
  approved: "Approved",
  done: "Done",
  calTitle: "Indiranagar · Saturday",
  booked: "Booked · Anil K.",
  ask: "Sat 10:30",
  snapped: "Sat 11:00 · Dr. Rao",
  aiBadge: "Booked by Revenue OS",
  previewLabel: "Message preview",
  preview: "Your visit is confirmed: Sat 11:00 with Dr. Rao, Indiranagar.",
  invite: "Calendar invite · Sat 11:00",
  addToCal: "Tap to add",
  reminder: "Reminder · 24h before",
  saturday: "Saturday",
  visitDone: "Visit complete",
  thankYou: "Thank you for visiting, Priya. See you at your follow-up.",
  click: "CLICK",
  lock: "3 clicks. Enquiry to visit.",

  days30: "+30 days",
  nbaLabel: "Next best action",
  nba: "Follow-up package offer · Priya S.",
  sent: "Sent",
  revenueLabel: "Revenue · Priya S.",
  churnName: "Arjun M. · engagement",
  churnFlag: "Churn signal",
  retention: "Retention check-in sent",
  states: ["Not yet won", "Won and grown", "At risk, saved"],
  beatGrown: "Every customer grown.",

  dialLabel: "Autonomy",
  supervised: "Supervised",
  autonomous: "Autonomous",
  auditLabel: "Audit log",
  audit: [
    "02:47:09  Lead captured · source=instagram · Priya S.",
    "02:47:11  Reply sent · rate card · ₹1,500",
    "02:47:40  Reply sent · Hindi",
    "02:47:41  3 fields written · quotes attached",
    "02:47:41  Score 54 → 86 · Hot",
    "02:47:43  Slot snapped 10:30 → 11:00 · conflict",
    "09:02:15  Booking approved · Meera (staff)",
    "09:02:31  Message approved · Meera (staff)",
    "09:02:32  Invite + 24h reminder scheduled",
    "Sat 12:10  Visit complete · task closed",
    "+30d 10:00  Next best action sent",
    "+30d 10:04  Churn signal · Arjun M. · check-in sent",
  ],
  beat100: "100% of leads worked.",

  title: "REVENUE OS",
  endorsed: "by TheVertical.ai",
  subline: "Every lead worked. Every customer grown.",
  endLines: ["REAL TIME.", "UNDER POLICY.", "ON YOUR INFRASTRUCTURE."],
  logo: "TheVertical.ai",
  partOf: "Part of the TheVertical.ai Enterprise OS",
  cta: "thevertical.ai · Book a demo",
};

export const allCopy = (): string[] => {
  const out: string[] = [];
  const walk = (v: unknown) => {
    if (typeof v === "string") out.push(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
  };
  walk(COPY);
  return out;
};
