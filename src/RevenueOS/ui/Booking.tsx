import { useCurrentFrame } from "remotion";
import { lerp, mixColor, sp } from "../anim";
import { COPY } from "../copy";
import { monoStack } from "../fonts";
import { C } from "../theme";
import { T } from "../timeline";
import { W } from "../world";
import { Bubble, PhoneFrame } from "./ChatPhone";
import { fieldPos } from "./Contact360";
import { Appear, Check, Chip, Cursor, Glass, Label } from "./primitives";

const ITEM_TOP = 104;
const ITEM_STEP = 214;
const CLICKS = [T.click1, T.click2, T.click3];

/** World position of each Today Feed item's button. */
export const button = (i: number) => ({ x: W.feed.x + W.feed.w - 120, y: W.feed.y + ITEM_TOP + i * ITEM_STEP + 150 });

export const TodayFeed: React.FC = () => {
  const frame = useCurrentFrame();
  const lit = 0.3 + 0.7 * sp(frame, T.glideCalendar + 8, 16);
  const appearAt = [T.feedItem, T.preview, T.visitDone];
  return (
    <Glass style={{ left: W.feed.x, top: W.feed.y, width: W.feed.w, height: W.feed.h, padding: 30, opacity: lit }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 30, fontWeight: 600 }}>{COPY.todayFeed}</div>
        <Label style={{ fontSize: 13 }}>Needs a person</Label>
      </div>
      {COPY.feed.map((title, i) => {
        const clicked = frame >= CLICKS[i];
        const press = clicked ? sp(frame, CLICKS[i], 14) : 0;
        return (
          <Appear key={title} at={appearAt[i]} dx={70} dy={0} style={{ position: "absolute", left: 30, right: 30, top: ITEM_TOP + i * ITEM_STEP }}>
            <div
              style={{
                height: ITEM_STEP - 20,
                borderRadius: 18,
                padding: "16px 20px",
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${clicked ? "rgba(34,197,94,0.5)" : "rgba(254,119,44,0.45)"}`,
              }}
            >
              <div style={{ fontSize: 21, fontWeight: 600 }}>{title}</div>
              {i === 1 ? (
                <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 12, background: "rgba(30,127,92,0.25)", fontSize: 17, lineHeight: 1.4 }}>
                  <span style={{ color: C.textDim }}>{COPY.previewLabel}: </span>
                  {COPY.preview}
                </div>
              ) : (
                <div style={{ marginTop: 8, fontSize: 17, color: C.textDim }}>
                  {i === 0 ? "Slot conflict-checked · Dr. Rao available" : "Saturday visit · Indiranagar"}
                </div>
              )}
              <div style={{ position: "absolute", right: 20, bottom: 18 }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "9px 20px",
                    borderRadius: 999,
                    fontSize: 18,
                    fontWeight: 600,
                    background: clicked ? mixColor(C.orange, C.green, press) : "transparent",
                    border: `2px solid ${clicked ? mixColor(C.orange, C.green, press) : C.orange}`,
                    color: clicked ? "#fff" : C.orange,
                  }}
                >
                  {clicked && press > 0.5 ? <Check size={18} color="rgba(255,255,255,0.25)" /> : null}
                  {clicked ? (i === 2 ? COPY.done : COPY.approved) : COPY.approve}
                </span>
              </div>
            </div>
          </Appear>
        );
      })}
    </Glass>
  );
};

const SLOT_TOP = 120;
const SLOT_H = 70;
const TIMES = ["9:00", "9:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00"];
export const slotY = (i: number) => W.cal.y + SLOT_TOP + i * SLOT_H;

export const Calendar: React.FC = () => {
  const frame = useCurrentFrame();
  const born = 0.3 + 0.7 * sp(frame, T.glideCalendar + 4, 16);
  const field = fieldPos(2);

  // The ask flies down from her "Preferred time" field into 10:30, collides with the booked slot, shakes, then snaps to 11:00
  const drop = sp(frame, T.askDrop, 15, 160);
  const shake = frame >= T.collide && frame < T.snap ? Math.sin((frame - T.collide) * 2.2) * 14 * Math.exp(-(frame - T.collide) / 7) : 0;
  const snap = sp(frame, T.snap, 14, 170);
  const askX = frame < T.snap ? lerp(field.x, W.cal.x + 120, drop) : W.cal.x + 120;
  const askY = frame < T.snap ? lerp(field.y, slotY(3), drop) - Math.sin(Math.PI * drop) * 160 : lerp(slotY(3), slotY(4), snap);
  const colliding = frame >= T.collide && frame < T.snap;
  const placed = frame >= T.snap;
  const done = frame >= T.visitDone;
  const doneT = sp(frame, T.visitDone, 15);

  return (
    <>
      <Glass style={{ left: W.cal.x, top: W.cal.y, width: W.cal.w, height: W.cal.h, padding: 30, opacity: born }}>
        <div style={{ fontSize: 30, fontWeight: 600 }}>{COPY.calTitle}</div>
        {TIMES.map((t, i) => (
          <div key={t} style={{ position: "absolute", left: 30, right: 30, top: SLOT_TOP + i * SLOT_H, height: SLOT_H, borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center" }}>
            <div style={{ width: 80, fontFamily: monoStack, fontSize: 17, color: C.textDim }}>{t}</div>
          </div>
        ))}
        {/* Already booked: the collision */}
        <div
          style={{
            position: "absolute",
            left: 120,
            right: 30,
            top: SLOT_TOP + 3 * SLOT_H + 6,
            height: SLOT_H - 12,
            borderRadius: 12,
            background: colliding ? "rgba(254,119,44,0.18)" : "rgba(255,255,255,0.08)",
            border: `1px solid ${colliding ? C.orange : "rgba(255,255,255,0.14)"}`,
            display: "flex",
            alignItems: "center",
            padding: "0 18px",
            fontSize: 18,
            color: C.textDim,
          }}
        >
          {COPY.booked}
        </div>
      </Glass>

      {/* The ask, born from her "Preferred time" field */}
      {frame >= T.askDrop - 2 && (
        <div
          style={{
            position: "absolute",
            left: askX + shake,
            width: W.cal.w - 150,
            top: askY + 6,
            height: SLOT_H - 12,
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 18px",
            opacity: Math.min(1, drop * 3),
            scale: String(0.6 + 0.4 * Math.min(1, drop)),
            transformOrigin: "left center",
            background: done ? mixColor(C.blue, C.green, doneT) : placed ? C.blue : "rgba(1,119,255,0.35)",
            border: `1px solid ${colliding ? C.orange : C.blue}`,
            boxShadow: placed ? "0 10px 40px rgba(1,119,255,0.45)" : undefined,
            fontSize: 20,
            fontWeight: 600,
            color: "#fff",
          }}
        >
          <span>{done ? COPY.visitDone : placed ? COPY.snapped : COPY.ask}</span>
          {done ? <Check size={24} color="rgba(255,255,255,0.3)" /> : placed ? <span style={{ fontSize: 13, fontWeight: 600, opacity: 0.85 }}>{COPY.aiBadge}</span> : null}
        </div>
      )}
    </>
  );
};

/** Her phone: invite, 24h reminder and the thank-you arrive without anyone sending them. */
export const MiniPhone: React.FC = () => {
  const frame = useCurrentFrame();
  const lit = 0.3 + 0.7 * sp(frame, T.invite - 4, 16);
  return (
    <div style={{ opacity: lit }}>
      <PhoneFrame x={W.mini.x} y={W.mini.y} w={W.mini.w} h={W.mini.h} title={COPY.chatHeader} sub={COPY.phoneE164}>
        <Bubble at={T.invite} out time="9:02 AM">
          {COPY.preview}
          <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 12, background: "rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 17 }}>
            <span>{COPY.invite}</span>
            <span style={{ color: C.blue, fontWeight: 600 }}>{COPY.addToCal}</span>
          </div>
        </Bubble>
        <Appear at={T.reminder} dy={10} style={{ alignSelf: "center" }}>
          <Chip color={C.blue} style={{ fontSize: 16 }}>
            {COPY.reminder}
          </Chip>
        </Appear>
        <Bubble at={T.thankYou} out time="Sat 12:10 PM">
          {COPY.thankYou}
        </Bubble>
      </PhoneFrame>
    </div>
  );
};

/** The cursor: three presses, nothing else. */
export const BookingCursor: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < T.feedItem || frame > T.lock + 30) return null;
  const start = { x: button(0).x + 260, y: button(0).y + 220 };
  let pos = start;
  [0, 1, 2].forEach((i) => {
    const arrive = CLICKS[i] - 10;
    const t = sp(frame, arrive - 8, 18, 150);
    const from = i === 0 ? start : button(i - 1);
    const to = button(i);
    if (frame >= arrive - 8) pos = { x: lerp(from.x, to.x, t), y: lerp(from.y, to.y, t) };
  });
  const pressed = Math.max(...CLICKS.map((c) => (frame >= c && frame < c + 14 ? (frame - c) / 14 : 0)));
  const opacity = Math.min(1, (frame - T.feedItem) / 6) * (frame > T.lock + 20 ? Math.max(0, 1 - (frame - T.lock - 20) / 10) : 1);
  return <Cursor x={pos.x - 4} y={pos.y - 4} pressed={pressed} opacity={opacity} />;
};
