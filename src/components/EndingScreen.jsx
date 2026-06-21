import { useState, useEffect, useRef, useMemo } from "react";

const ENDING_LINES = [
  "해냈어! 정말 대단해!",
  "서른 개의 유물 정령이 모두 마음을 열었어!",
  "박물관에 다시 활기가 넘치고 있어!",
  "정령들이 너 덕분에 다시 사람들 곁으로 돌아왔어.",
  "관장님도 정말 기뻐하실 거야!",
  "나도 너랑 같이 탐험해서 정말 즐거웠어!",
  "언제든 또 놀러 와.\n정령들도 기다리고 있을 거야.",
  "...박물관을 구해줘서 고마워!",
];
const PAUSES = [1400, 1800, 1600, 2000, 1800, 2200, 2000, 0];

function useTyping(text, speed = 42) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    clearInterval(timer.current);
    setDisplayed("");
    setDone(false);
    if (!text) { setDone(true); return; }
    let i = 0;
    timer.current = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(timer.current); setDone(true); }
    }, speed);
    return () => clearInterval(timer.current);
  }, [text, speed]);

  const skip = () => { clearInterval(timer.current); setDisplayed(text); setDone(true); };
  return { displayed, done, skip };
}

function LightOrb({ fading }) {
  return (
    <div className={`ed-orb ${fading ? "ed-orb-fade" : ""}`}>
      <div className="ed-orb-aura" />
      <div className="ed-orb-ring ed-ring-3" />
      <div className="ed-orb-ring ed-ring-2" />
      <div className="ed-orb-ring ed-ring-1" />
      <div className="ed-orb-core" />
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="ed-wisp" style={{ "--wi": i, "--wn": 6 }} />
      ))}
    </div>
  );
}

function SpiritLights({ reveal }) {
  const items = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: 5 + ((i * 73 + 11) % 90),
      y: 5 + ((i * 53 + 7) % 85),
      color: ["#ffd700","#c8a0e8","#60d8c8","#ff9898","#90e090","#98b8ff"][i % 6],
      delay: i * 0.07,
      size: 5 + ((i * 37) % 7),
    }))
  , []);

  return (
    <div className="ed-spirit-lights">
      {items.map(s => (
        <div key={s.id} className={`ed-spirit-dot ${reveal ? "ed-spirit-dot-in" : ""}`}
          style={{
            left: `${s.x}%`, top: `${s.y}%`,
            width: s.size, height: s.size,
            background: s.color,
            boxShadow: `0 0 ${s.size * 2}px ${s.color}88`,
            transitionDelay: `${s.delay}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function EndingScreen({ onClose }) {
  const [phase, setPhase] = useState("intro"); // intro | dialogue | credits
  const [lineIdx, setLineIdx] = useState(0);
  const [orbFading, setOrbFading] = useState(false);
  const [lightsReveal, setLightsReveal] = useState(false);
  const [exiting, setExiting] = useState(false);

  const { displayed, done, skip } = useTyping(
    phase === "dialogue" ? ENDING_LINES[lineIdx] : "",
    42
  );

  useEffect(() => {
    const t1 = setTimeout(() => setLightsReveal(true), 500);
    const t2 = setTimeout(() => setPhase("dialogue"), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    if (phase !== "dialogue" || !done) return;
    if (lineIdx >= ENDING_LINES.length - 1) {
      const t = setTimeout(() => { setOrbFading(true); setTimeout(() => setPhase("credits"), 1800); }, 1600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setLineIdx(i => i + 1), PAUSES[lineIdx] ?? 2000);
    return () => clearTimeout(t);
  }, [done, lineIdx, phase]);

  const handleTap = () => {
    if (phase === "dialogue") {
      if (!done) { skip(); return; }
      if (lineIdx < ENDING_LINES.length - 1) {
        setLineIdx(ENDING_LINES.length - 1);
        return;
      }
      setOrbFading(true);
      setTimeout(() => setPhase("credits"), 1800);
    }
  };

  const handleClose = () => {
    setExiting(true);
    setTimeout(onClose, 900);
  };

  return (
    <div className={`ed-root ${exiting ? "ed-exit" : ""}`} onClick={handleTap}>
      <div className="ed-bg" />
      <div className="ed-fog ed-fog-1" />
      <div className="ed-fog ed-fog-2" />
      <SpiritLights reveal={lightsReveal} />

      <div className="ed-orb-area">
        <LightOrb fading={orbFading} />
        {!orbFading && <div className="ed-orb-label">도슨트 요정</div>}
      </div>

      {phase === "dialogue" && (
        <div className="ed-textbox">
          <div className="ed-persona-tag">✦ 도슨트 요정</div>
          <p className="ed-line">
            {displayed}
            {!done && <span className="ed-cursor">|</span>}
          </p>
          {done && lineIdx < ENDING_LINES.length - 1 && (
            <div className="ed-tap-hint">화면을 터치하면 넘어갑니다 ▼</div>
          )}
        </div>
      )}

      {phase === "credits" && (
        <div className="ed-credits">
          <div className="ed-credits-sparkle">✦</div>
          <div className="ed-credits-title">유물 수호자</div>
          <div className="ed-credits-sub">30개의 유물 정령이 마음을 열었습니다</div>
          <div className="ed-credits-divider">— ✦ —</div>
          <div className="ed-credits-msg">
            박물관에 다시 생기가 넘쳐요!<br />
            모든 정령이 당신의 친구가 되었어요.
          </div>
          <button className="ed-close-btn" onClick={(e) => { e.stopPropagation(); handleClose(); }}>
            박물관을 나가기
          </button>
        </div>
      )}
    </div>
  );
}
