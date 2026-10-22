import { useCurrentFrame } from "remotion";
import { mixColor, ramp, sp } from "../RevenueOS/anim";
import { C, mono, Q, sans } from "./theme";

export type Mode = "pain" | "on" | "growth";

const HAIR = "#081332";
const SHIRT = "#2C55A8";
const MARKER = "#17357A";

/** Ring bursts that match scripts/mozhi_audio.py: two 0.4s bursts per ring. */
const ringing = (frame: number, first: number, every: number) => {
  const t = frame / 30;
  if (frame >= Q.ringUntil || t < first) return false;
  const k = (t - first) % every;
  return k < 0.4 || (k > 0.6 && k < 1.0);
};

const DeskPhone: React.FC<{ x: number; y: number; ring: boolean; tone: string }> = ({ x, y, ring, tone }) => {
  const frame = useCurrentFrame();
  const shake = ring ? Math.sin(frame * 2.2) * 5 : 0;
  return (
    <g transform={`translate(${x} ${y}) rotate(${shake} 32 20)`}>
      {ring &&
        [0, 1].map((i) => (
          <g key={i} opacity={0.4 + 0.6 * ((frame + i * 3) % 6 < 3 ? 1 : 0.4)} stroke={tone} strokeWidth="3" fill="none" strokeLinecap="round">
            <path d={`M ${-10 - i * 12} ${-6 - i * 8} Q ${-18 - i * 14} ${14} ${-10 - i * 12} ${34 + i * 8}`} />
            <path d={`M ${74 + i * 12} ${-6 - i * 8} Q ${82 + i * 14} ${14} ${74 + i * 12} ${34 + i * 8}`} />
          </g>
        ))}
      <rect x="0" y="10" width="64" height="30" rx="8" fill="#1F3B7E" />
      <path d="M -4 6 Q 32 -14 68 6 L 62 14 Q 32 0 2 14 Z" fill="#2A4C96" />
      <rect x="18" y="18" width="28" height="14" rx="3" fill="#0F2252" />
    </g>
  );
};

/** The owner, front on behind her desk. Her arm and face carry the story. */
const Owner: React.FC<{ mode: Mode; reach: number }> = ({ mode, reach }) => {
  const frame = useCurrentFrame();
  const blink = frame % 96 < 3 ? 0.2 : 1;
  const look = mode === "growth" ? 0 : 2.5;
  const brows =
    mode === "pain"
      ? ["M 374 446 L 393 440", "M 407 440 L 426 446"]
      : ["M 374 443 L 393 442", "M 407 442 L 426 443"];
  const mouth = mode === "pain" ? "M 389 488 Q 400 482 411 488" : mode === "growth" ? "M 385 481 Q 400 497 415 481" : "M 391 486 L 409 486";
  // Right arm: chin rest (worried) -> reaching for the laptop -> resting
  const chin = { elbow: [505, 690], hand: [440, 514] };
  const key = { elbow: [522, 652], hand: [622, 676] };
  const rest = { elbow: [482, 682], hand: [552, 690] };
  const from = mode === "growth" ? rest : chin;
  const to = mode === "growth" ? rest : key;
  const lerp2 = (a: number[], b: number[]) => [a[0] + (b[0] - a[0]) * reach, a[1] + (b[1] - a[1]) * reach];
  const elbow = lerp2(from.elbow, to.elbow);
  const hand = lerp2(from.hand, to.hand);
  const lean = mode === "growth" ? -6 : 0;
  return (
    <g transform={`rotate(${lean} 400 700)`}>
      <rect x="305" y="430" width="190" height="290" rx="34" fill="#0D2154" />
      <path d="M 338 442 Q 336 378 400 376 Q 464 378 462 442 L 474 566 Q 400 588 326 566 Z" fill={HAIR} />
      <rect x="386" y="494" width="28" height="44" fill="#86A2D6" />
      <path d="M 318 700 L 328 588 Q 334 548 376 540 L 424 540 Q 466 548 472 588 L 482 700 Z" fill={SHIRT} />
      {/* her left arm, always resting */}
      <path d="M 344 566 L 318 676 L 384 690" stroke={SHIRT} strokeWidth="30" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="392" cy="690" r="15" fill={C.skin} />
      <ellipse cx="400" cy="455" rx="44" ry="52" fill={C.skin} />
      <path d="M 355 444 Q 358 394 400 391 Q 446 392 449 432 Q 420 410 392 419 Q 370 426 355 444 Z" fill={HAIR} />
      <ellipse cx={385 + look} cy="461" rx="4.6" ry={4.6 * blink} fill={C.ink} />
      <ellipse cx={415 + look} cy="461" rx="4.6" ry={4.6 * blink} fill={C.ink} />
      {brows.map((d) => (
        <path key={d} d={d} stroke={HAIR} strokeWidth="4" strokeLinecap="round" />
      ))}
      <path d={mouth} stroke="#3B4F86" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      {mode === "growth" && <path d="M 372 474 Q 377 478 382 475 M 418 475 Q 423 478 428 474" stroke="#7F9BD2" strokeWidth="2" fill="none" />}
      <path d={`M 456 566 L ${elbow[0]} ${elbow[1]} L ${hand[0]} ${hand[1]}`} stroke={SHIRT} strokeWidth="30" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={hand[0]} cy={hand[1]} r="16" fill={C.skin} />
    </g>
  );
};

/** Her salesperson, at the back, on a call. */
const Salesperson: React.FC = () => {
  const frame = useCurrentFrame();
  const talk = 2 + 3 * Math.abs(Math.sin(frame / 3.2)) * (Math.sin(frame / 23) > -0.3 ? 1 : 0);
  return (
    <g transform="translate(1640 0)">
      <rect x="-80" y="470" width="160" height="230" rx="28" fill="#0D2154" />
      <path d="M -70 700 L -62 600 Q -56 566 -22 560 L 22 560 Q 56 566 62 600 L 70 700 Z" fill="#23488F" />
      <circle cx="0" cy="510" r="38" fill="#8EA8DA" />
      <path d="M -38 500 Q -36 466 0 464 Q 38 466 38 500 Q 20 484 0 486 Q -22 486 -38 500 Z" fill={HAIR} />
      <circle cx="-12" cy="512" r="3.5" fill={C.ink} />
      <circle cx="12" cy="512" r="3.5" fill={C.ink} />
      <ellipse cx="0" cy="532" rx="7" ry={talk} fill="#3B4F86" />
      {/* handset at his ear */}
      <path d="M -44 488 Q -60 516 -44 546" stroke="#2A4C96" strokeWidth="14" fill="none" strokeLinecap="round" />
      <path d="M 52 580 L -36 552" stroke="#23488F" strokeWidth="26" strokeLinecap="round" />
    </g>
  );
};

const LaptopScreen: React.FC<{ mode: Mode; on: number }> = ({ mode, on }) => {
  const frame = useCurrentFrame();
  if (mode === "growth") {
    const t = ramp(frame, Q.metrics[0] - 10, Q.metrics[2]);
    return (
      <g>
        <rect x="612" y="482" width="296" height="186" fill="#1C1520" />
        <text x="628" y="510" fontFamily={mono} fontSize="13" fill={C.dim} letterSpacing="2">THIS MONTH</text>
        <path d={`M 628 640 C 700 630 760 600 ${628 + 264 * t} ${640 - 110 * t}`} stroke={C.orange} strokeWidth="5" fill="none" strokeLinecap="round" />
      </g>
    );
  }
  return (
    <g>
      <rect x="612" y="482" width="296" height="186" fill={mixColor("#0E2A66", "#2A1A1A", on)} />
      {on < 0.5 ? (
        <g>
          <rect x="624" y="494" width="272" height="22" rx="4" fill="#1C3F8C" />
          <text x="632" y="510" fontFamily={mono} fontSize="12" fill={C.bluePale}>LEADS · THIS WEEK</text>
          {Array.from({ length: 7 }, (_, i) => (
            <g key={i}>
              <rect x="624" y={526 + i * 19} width="120" height="10" rx="3" fill="#2C55A8" opacity="0.7" />
              <rect x="756" y={526 + i * 19} width="60" height="10" rx="3" fill="#2C55A8" opacity="0.4" />
              <text x="832" y={535 + i * 19} fontFamily={mono} fontSize="11" fill={C.blueSoft}>{i === 1 ? "called" : "—"}</text>
            </g>
          ))}
        </g>
      ) : (
        <g opacity={on}>
          <text x="760" y="560" textAnchor="middle" fontFamily={sans} fontSize="30" fontWeight="600" fill={C.text}>Mozhi OS</text>
          <text x="760" y="592" textAnchor="middle" fontFamily={mono} fontSize="14" fill={C.orange} letterSpacing="3">● LIVE · DIALLING</text>
        </g>
      )}
    </g>
  );
};

/**
 * The owner's office: her desk, laptop and ringing phone; a whiteboard still hiring; a sales
 * chart gone flat; her one salesperson on a call. In growth mode the chart climbs, the cost
 * line falls, hiring is on hold and she smiles.
 */
export const Office: React.FC<{ mode: Mode }> = ({ mode }) => {
  const frame = useCurrentFrame();
  const on = mode === "on" ? 1 : mode === "growth" ? 1 : 0;
  const reach = mode === "on" ? 1 : 0;
  const warm = mode === "growth" ? 1 : 0;
  const grow = mode === "growth" ? ramp(frame, Q.metrics[0] - 12, Q.metrics[2]) : 0;
  return (
    <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
      <rect width="1920" height="830" fill={mixColor(C.wall, "#1B1420", warm)} />
      <rect y="830" width="1920" height="250" fill={mixColor(C.floor, "#120E16", warm)} />
      <rect y="826" width="1920" height="6" fill={mixColor("#12285E", "#2A1E26", warm)} />

      {/* window */}
      <rect x="90" y="120" width="210" height="500" rx="6" fill={mixColor("#12306E", "#3A2A2A", warm)} />
      <path d="M 195 120 V 620 M 90 370 H 300" stroke={mixColor(C.wall, "#1B1420", warm)} strokeWidth="10" />
      <path d="M 110 600 L 280 140" stroke="rgba(255,255,255,0.06)" strokeWidth="40" />

      {/* sales chart on the wall */}
      <rect x="620" y="180" width="320" height="220" rx="10" fill={mixColor("#0F2557", "#24181E", warm)} stroke={mixColor(C.blueMid, "#5A3A2C", warm)} strokeWidth="3" />
      <text x="644" y="214" fontFamily={mono} fontSize="16" letterSpacing="3" fill={C.dim}>SALES</text>
      <path d="M 644 372 H 916" stroke={C.faint} strokeWidth="2" />
      {mode === "growth" ? (
        <>
          <path d="M 648 348 C 720 346 760 330 800 300 S 880 236 912 222" stroke={C.orange} strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray="420" strokeDashoffset={420 * (1 - grow)} />
          <path d="M 648 250 C 720 262 780 300 830 330 S 890 354 912 360" stroke={C.bluePale} strokeWidth="3" fill="none" strokeDasharray="8 8" opacity={0.7 * grow} />
          <text x="912" y="214" textAnchor="end" fontFamily={mono} fontSize="14" fill={C.orange} opacity={grow}>SALES</text>
          <text x="912" y="388" textAnchor="end" fontFamily={mono} fontSize="14" fill={C.bluePale} opacity={grow}>COST</text>
        </>
      ) : (
        <path d="M 648 300 C 690 292 720 330 760 336 S 840 344 912 346" stroke={C.blue} strokeWidth="5" fill="none" strokeLinecap="round" />
      )}

      {/* whiteboard */}
      <rect x="1090" y="130" width="580" height="350" rx="8" fill={mixColor(C.bluePale, "#E9DCD6", warm)} stroke="#7E95C4" strokeWidth="6" />
      <rect x="1130" y="476" width="500" height="10" rx="4" fill="#7E95C4" />
      <text x="1130" y="200" fontFamily={sans} fontStyle="italic" fontSize="40" fontWeight="600" fill={MARKER}>
        Hiring: {mode === "growth" ? <tspan fill={C.orange}>on hold</tspan> : "3 sales callers"}
      </text>
      {["Interview · Ravi · Mon", "Interview · Sana · Wed"].map((line, i) => (
        <g key={line}>
          <text x="1150" y={290 + i * 64} fontFamily={sans} fontStyle="italic" fontSize="30" fill={MARKER} opacity="0.85">{line}</text>
          <path d={`M 1142 ${280 + i * 64} L 1470 ${276 + i * 64}`} stroke={MARKER} strokeWidth="4" strokeLinecap="round" />
        </g>
      ))}
      <text x="1150" y="418" fontFamily={sans} fontStyle="italic" fontSize="30" fill={MARKER} opacity="0.6">Interview · ?</text>

      {/* the empty desk, its phone ringing */}
      <rect x="1080" y="700" width="300" height="16" rx="4" fill="#142C66" />
      <rect x="1100" y="716" width="12" height="114" fill="#0F2252" />
      <rect x="1348" y="716" width="12" height="114" fill="#0F2252" />
      <DeskPhone x={1200} y={660} ring={ringing(frame, 0.9, 2.6)} tone={C.blueSoft} />

      {/* salesperson's desk */}
      <Salesperson />
      <rect x="1460" y="690" width="380" height="18" rx="4" fill="#173272" />
      <rect x="1480" y="708" width="340" height="122" fill="#10265A" />

      {/* her desk */}
      <Owner mode={mode} reach={reach} />
      <rect x="250" y="690" width="780" height="20" rx="4" fill={mixColor("#1C3775", "#2C2026", warm)} />
      <rect x="270" y="710" width="740" height="130" fill={mixColor("#13295F", "#20171D", warm)} />
      <rect x="598" y="468" width="324" height="214" rx="14" fill="#0A1430" />
      <LaptopScreen mode={mode} on={on} />
      {on > 0 && mode === "on" && <rect x="598" y="468" width="324" height="214" rx="14" fill="none" stroke={C.orange} strokeWidth="3" opacity={on} />}
      <path d="M 578 680 H 942 L 962 696 H 558 Z" fill="#1A2647" />
      <DeskPhone x={950} y={652} ring={ringing(frame, 0.1, 2.2)} tone={C.blueSoft} />
    </svg>
  );
};
