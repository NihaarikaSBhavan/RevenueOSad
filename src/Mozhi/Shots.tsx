import { CanvasImage, staticFile, useCurrentFrame } from "remotion";
import { lerp, ramp, sp } from "../RevenueOS/anim";
import { Office } from "./Office";
import { C, clip, mono, Q, sans, shot } from "./theme";
import { Avatar, Bubble, Card, Check, Feature, FootShade, InShot, Label, Phone, Pop, Waveform } from "./ui";

// ---------- 6. booked, reminded, handed to sales ----------

const SLOTS: [string, string | null][] = [
  ["10:30", "Booked"],
  ["11:00", "Booked"],
  ["11:30", null],
  ["12:00", null],
];

export const Book: React.FC = () => {
  const frame = useCurrentFrame();
  const s = shot("book");
  const booked = sp(frame, Q.booked, 15, 180);
  const up = frame >= Q.salesUp;
  const bump = up ? 1 - sp(frame, Q.salesUp, 14, 220) : 0;
  return (
    <InShot id="book">
      <Card style={{ left: 90, top: 140, width: 560, height: 640, padding: 36 }}>
        <Label>Calendar</Label>
        <div style={{ fontSize: 36, fontWeight: 600, marginTop: 8 }}>Saturday</div>
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 14 }}>
          {SLOTS.map(([time, taken]) => {
            const mine = time === "11:30";
            return (
              <div key={time} style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <div style={{ fontFamily: mono, fontSize: 22, color: C.dim, width: 74 }}>{time}</div>
                <div
                  style={{
                    flex: 1,
                    height: 76,
                    borderRadius: 14,
                    padding: "0 20px",
                    display: "flex",
                    alignItems: "center",
                    fontSize: 22,
                    fontWeight: mine ? 600 : 400,
                    color: mine ? "#fff" : C.dim,
                    background: mine ? `rgba(254,119,44,${booked})` : taken ? "rgba(244,247,252,0.06)" : "transparent",
                    border: `1px ${taken || mine ? "solid" : "dashed"} ${mine ? C.orange : C.faint}`,
                    scale: mine ? String(lerp(1.06, 1, booked)) : "1",
                  }}
                >
                  {mine ? (booked > 0.05 ? "Priya Sharma · Appointment" : "") : taken}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Phone x={760} y={110} scale={0.84} title="Mozhi · Sales" sub="online">
        <Bubble side="left" style={{ fontSize: 20, opacity: 0.55 }}>
          कीमतें: Starter ₹1.9L · Plus ₹2.6L.
        </Bubble>
        {frame >= Q.confirm - 1 && (
          <Pop at={Q.confirm}>
            <Bubble side="left">Confirmed: Saturday, 11:30. See you then, Priya.</Bubble>
          </Pop>
        )}
        {frame >= Q.confirm + 7 && (
          <Pop at={Q.confirm + 8}>
            <div style={{ alignSelf: "center", fontFamily: mono, fontSize: 16, letterSpacing: 2, color: C.orange, padding: "8px 16px", borderRadius: 99, border: `1px solid ${C.orange}` }}>
              REMINDER SET · FRI 6 PM
            </div>
          </Pop>
        )}
      </Phone>

      <div style={{ position: "absolute", left: 1250, top: 140, width: 580 }}>
        {frame >= Q.handoff - 1 && (
          <Pop at={Q.handoff} dx={40} dy={0}>
            <Card style={{ position: "relative", padding: 34 }} glow={0.7}>
              <Label color={C.orange}>Hot lead → Arjun, Sales</Label>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 18 }}>
                <Avatar initials="PS" size={56} />
                <div style={{ fontSize: 28, fontWeight: 600 }}>Priya Sharma</div>
              </div>
              <div style={{ fontSize: 24, lineHeight: 1.4, marginTop: 16, color: C.text }}>Liked the brochure. Visiting Sat 11:30 with family.</div>
            </Card>
          </Pop>
        )}
        <Card style={{ position: "relative", marginTop: 26, padding: 34 }}>
          <Label>Sales closed · this week</Label>
          <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginTop: 8 }}>
            <div style={{ fontFamily: mono, fontSize: 92, fontWeight: 600, scale: String(1 + bump * 0.12), transformOrigin: "left center" }}>{up ? 13 : 12}</div>
            {up && <div style={{ fontFamily: mono, fontSize: 40, fontWeight: 600, color: C.orange, opacity: sp(frame, Q.salesUp, 16) }}>+1</div>}
          </div>
        </Card>
      </div>
      <FootShade />
      <Feature at={s.start + 4} text="Books, reminds, and hands hot leads to your team" />
    </InShot>
  );
};

// ---------- 7. support, any hour ----------

export const Support: React.FC = () => {
  const frame = useCurrentFrame();
  const s = shot("support");
  const logged = ramp(frame, Q.logged, Q.logged + 8);
  return (
    <InShot id="support">
      <Card style={{ left: 360, top: 150, width: 1200, height: 560, padding: 44 }} glow={0.35}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Avatar initials="RK" size={84} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 38, fontWeight: 600 }}>Rahul Kumar</div>
            <div style={{ fontSize: 22, color: C.dim }}>Customer since 2024 · account call</div>
          </div>
          <div style={{ fontFamily: mono, fontSize: 22, color: C.orange, letterSpacing: 2 }}>11:52 PM · NO QUEUE</div>
        </div>
        <div style={{ marginTop: 26 }}>
          <Waveform width={1112} height={70} bars={70} />
        </div>
        <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 16 }}>
          <Bubble side="left" meta="RAHUL">Hi, can I move my renewal date to the fifteenth?</Bubble>
          <Pop at={clip("mozhiSupport").start - 2}>
            <Bubble side="right" meta="MOZHI">Done. It's moved to the fifteenth.</Bubble>
          </Pop>
          <div style={{ alignSelf: "flex-end", display: "flex", alignItems: "center", gap: 12, opacity: logged, fontFamily: mono, fontSize: 18, letterSpacing: 2, color: C.orange }}>
            <Check on={logged} size={24} /> LOGGED TO ACCOUNT
          </div>
        </div>
      </Card>
      <FootShade />
      <Feature at={s.start + 4} text="24/7 support · no queue" />
    </InShot>
  );
};

// ---------- 8. payment recovery, in Tamil ----------

// "Hello Karthik, you can pay your outstanding ₹18,500 at the link below. Thank you!"
const TAMIL_REMINDER = "வணக்கம் கார்த்திக், உங்கள் ₹18,500 நிலுவைத் தொகையை கீழே உள்ள இணைப்பில் செலுத்தலாம். நன்றி!";
const TAMIL_PAY = "இப்போது செலுத்து"; // "Pay now"

export const Recover: React.FC = () => {
  const frame = useCurrentFrame();
  const s = shot("recover");
  const press = frame >= Q.tap ? Math.sin(Math.PI * Math.min(1, (frame - Q.tap) / 8)) : 0;
  const paid = sp(frame, Q.paid, 14, 200);
  const isPaid = frame >= Q.paid;
  return (
    <InShot id="recover">
      <Phone x={440} y={70} scale={0.95} title="Mozhi · Accounts" sub="online">
        <Pop at={s.start + 2}>
          <Bubble side="left" style={{ fontSize: 22 }}>
            <div style={{ lineHeight: 1.6, fontSize: 21 }}>{TAMIL_REMINDER}</div>
            <div
              style={{
                marginTop: 14,
                padding: "12px 0",
                textAlign: "center",
                borderRadius: 12,
                background: C.orange,
                fontWeight: 600,
                fontSize: 22,
                scale: String(1 - 0.06 * press),
              }}
            >
              {TAMIL_PAY}
            </div>
          </Bubble>
        </Pop>
        {isPaid && (
          <Pop at={Q.paid}>
            <div style={{ alignSelf: "center", display: "flex", alignItems: "center", gap: 10, fontSize: 20, fontWeight: 600, color: C.orange, padding: "10px 18px", borderRadius: 99, border: `1px solid ${C.orange}` }}>
              <Check on={1} size={22} /> Payment received · ₹18,500
            </div>
          </Pop>
        )}
      </Phone>
      {/* the tap */}
      {frame >= Q.tap - 6 && frame < Q.tap + 14 && (
        <div style={{ position: "absolute", left: 572, top: 426, width: 60, height: 60, borderRadius: 99, border: `3px solid #fff`, opacity: 1 - ramp(frame, Q.tap, Q.tap + 14), scale: String(0.6 + ramp(frame, Q.tap, Q.tap + 14)) }} />
      )}
      <Card style={{ left: 1000, top: 250, width: 640, padding: 40 }} glow={paid * 0.7}>
        <Label>Invoice #2291</Label>
        <div style={{ fontSize: 34, fontWeight: 600, marginTop: 12 }}>Karthik S.</div>
        <div style={{ fontFamily: mono, fontSize: 72, fontWeight: 600, marginTop: 10 }}>₹18,500</div>
        <div
          style={{
            marginTop: 18,
            display: "inline-block",
            fontFamily: mono,
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: 3,
            padding: "8px 18px",
            borderRadius: 10,
            color: isPaid ? "#fff" : C.blue,
            background: isPaid ? C.orange : "rgba(1,119,255,0.12)",
            border: `1px solid ${isPaid ? C.orange : C.blue}`,
            scale: String(isPaid ? lerp(1.3, 1, paid) : 1),
          }}
        >
          {isPaid ? "PAID" : "OVERDUE · 21 DAYS"}
        </div>
        <div style={{ fontSize: 20, color: C.dim, marginTop: 18 }}>Reminder sent in Tamil, on WhatsApp</div>
      </Card>
      <FootShade />
      <Feature at={s.start + 4} text="Payment recovery" then="Payment received · ₹18,500" thenAt={Q.paid} />
    </InShot>
  );
};

// ---------- 9. one month later ----------

const METRICS: [string, string][] = [
  ["Sales", "↑ 30%"],
  ["Payments recovered", "↑ 28%"],
  ["Cost per call", "↓ 40%"],
  ["Replies", "60% faster"],
  ["New hires", "0"],
];

export const Growth: React.FC = () => {
  const frame = useCurrentFrame();
  const s = shot("growth");
  const stamp = sp(frame, s.start + 2, 16);
  const push = lerp(1.02, 1.07, ramp(frame, s.start, s.end + 4));
  return (
    <InShot id="growth">
      <div style={{ position: "absolute", inset: 0, transformOrigin: "760px 480px", scale: String(push) }}>
        <Office mode="growth" />
      </div>
      <div style={{ position: "absolute", left: 96, top: 60, fontFamily: mono, fontSize: 26, letterSpacing: 6, color: C.orange, opacity: stamp }}>ONE MONTH LATER</div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 320, background: "linear-gradient(transparent, rgba(16,12,18,0.92))" }} />
      <div style={{ position: "absolute", left: 60, right: 60, bottom: 74, display: "flex", justifyContent: "center", gap: 16 }}>
        {METRICS.map(([label, value], i) => (
          <Pop key={label} at={Q.metrics[i]} dy={20}>
            <div style={{ padding: "16px 24px", borderRadius: 18, background: "rgba(16,12,18,0.85)", border: `1px solid rgba(254,119,44,0.45)`, fontFamily: sans, textAlign: "left" }}>
              <div style={{ fontFamily: mono, fontSize: 15, letterSpacing: 2, color: C.dim, textTransform: "uppercase" }}>{label}</div>
              <div style={{ fontSize: 40, fontWeight: 600, color: C.orange, marginTop: 2 }}>{value}</div>
            </div>
          </Pop>
        ))}
      </div>
      <div style={{ position: "absolute", right: 64, bottom: 30, fontFamily: sans, fontSize: 16, color: C.dim, opacity: ramp(frame, Q.metrics[4], Q.metrics[4] + 8) }}>
        Illustrative results.
      </div>
    </InShot>
  );
};

// ---------- 10. close ----------

export const Title: React.FC = () => {
  const frame = useCurrentFrame();
  const s = shot("title");
  const t = sp(frame, s.start, 18);
  const phrases: [string, number][] = [
    ["Sell more.", clip("vo3a").start],
    ["Spend less.", clip("vo3b").start],
    ["Grow without growing the team.", clip("vo3c").start],
  ];
  return (
    <InShot id="title">
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: sans, color: C.text }}>
        <div style={{ fontSize: 170, fontWeight: 600, letterSpacing: 18, opacity: t, scale: String(lerp(0.94, 1, t) * (1 + 0.0007 * (frame - s.start))) }}>
          MOZHI <span style={{ color: C.orange }}>OS</span>
        </div>
        <div style={{ display: "flex", gap: 22, marginTop: 40, fontSize: 48, fontWeight: 600 }}>
          {phrases.map(([p, at], i) => {
            const k = sp(frame, Math.max(at, s.start + 4 * i) - 2, 18, 140);
            return (
              <span key={p} style={{ opacity: k, translate: `0px ${14 * (1 - k)}px`, color: i === 2 ? C.orange : C.text }}>
                {p}
              </span>
            );
          })}
        </div>
      </div>
    </InShot>
  );
};

const END_LINES = ["REAL TIME", "UNDER POLICY", "ON YOUR INFRASTRUCTURE"];
const LOGO_W = 560;
const LOGO_H = Math.round((LOGO_W * 590) / 1955);

export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const logo = sp(frame, Q.logo, 18);
  return (
    <InShot id="endCard" fade={2}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 200, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, fontFamily: sans }}>
        {END_LINES.map((line, i) => {
          const t = sp(frame, Q.drums[i], 14, 240);
          return (
            <div key={line} style={{ fontSize: 60, fontWeight: 600, letterSpacing: 7, color: C.text, opacity: Math.min(1, t * 2), scale: String(lerp(1.12, 1, t)) }}>
              {line}
              <span style={{ color: C.orange }}>.</span>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 960 - LOGO_W / 2, top: 600, opacity: logo, scale: String(lerp(0.94, 1, logo)) }}>
        <CanvasImage src={staticFile("images/logo-white.png")} width={LOGO_W} height={LOGO_H} style={{ width: LOGO_W, height: LOGO_H }} />
      </div>
      {/* Spoken as the sign-off: "The Vertical AI. AI Enterprise OS for success." */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 790, textAlign: "center", fontFamily: sans, fontSize: 44, fontWeight: 600, color: C.text, opacity: sp(frame, Q.tagline - 2, 18), translate: `0px ${14 * (1 - sp(frame, Q.tagline - 2, 18))}px` }}>
        AI Enterprise OS for <span style={{ color: C.orange }}>success.</span>
      </div>
    </InShot>
  );
};
