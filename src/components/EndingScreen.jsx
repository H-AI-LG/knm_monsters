import { useState, useEffect, useRef, useMemo } from "react";

const ENDING_LINES = [
  "...해냈습니다, 도사님.",
  "서른 개의 정령이 모두 깨어났어요.",
  "그 오랜 시간...\n모두가 기다리고 있었습니다.",
  "이제 균열이 닫히겠군요.\n세상이 다시 균형을 찾을 거예요.",
  "저도... 이제는 쉬어도 되겠네요.",
  "수천 년을 혼자 이 박물관을 지켰는데...\n외로웠지만, 후회하지 않아요.",
  "당신이 돌아올 걸 믿었으니까요.",
  "...안녕히 가세요, 도사님.\n언젠가 또 만나요.",
];
const PAUSES = [1600, 1800, 2000, 2200, 2800, 3000, 2200, 0];

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
        {!orbFading && <div className="ed-orb-label">도슨트 정령</div>}
      </div>

      {phase === "dialogue" && (
        <div className="ed-textbox">
          <div className="ed-persona-tag">✦ 도슨트 정령</div>
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
          <div className="ed-credits-sub">30선의 정령이 모두 각성하였습니다</div>
          <div className="ed-credits-divider">— ✦ —</div>
          <div className="ed-credits-msg">
            균열이 닫혔습니다.<br />
            도사님의 도력이 이 땅을 지켰습니다.
          </div>
          <button className="ed-close-btn" onClick={(e) => { e.stopPropagation(); handleClose(); }}>
            박물관을 나가기
          </button>
        </div>
      )}
    </div>
  );
}
