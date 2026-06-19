import { useState, useEffect, useRef, useMemo } from "react";

const LINES = [
  "잘 왔네, 도사 양반.",
  "자네는 본래 이 땅의 혼란을 잡던 도사였네.",
  "유물에 깃든 정령들을 다스리고,\n시대마다 도력으로 균형을 지켰지.",
  "하지만 시간이 흘러...\n자네는 환생하며 모든 걸 잊었네.",
  "정령들은 잠들었고,\n어딘가 균열이 생겼다네.",
  "이제 자네가 돌아왔으니...",
  "다시 정령들을 깨우고\n균형을 잡아야 한다네.",
];
const PAUSES = [1700, 1600, 1900, 2100, 1900, 2400, 0];

function useTyping(text, speed = 38) {
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

// 떠다니는 영혼 구슬들
function Bokeh() {
  const items = useMemo(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: 4  + ((i * 73 + 11) % 92),
      y: 4  + ((i * 53 +  7) % 88),
      size: 3 + ((i * 37) % 9),
      delay: ((i * 43) % 32) / 10,
      dur:   5 + ((i * 29) % 7),
      op:  0.12 + ((i * 17) % 22) / 100,
    }))
  , []);
  return (
    <div className="ic-bokeh">
      {items.map(b => (
        <div key={b.id} className="ic-bokeh-dot"
          style={{
            left: `${b.x}%`, top: `${b.y}%`,
            width: b.size, height: b.size,
            opacity: b.op,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.dur}s`,
          }}
        />
      ))}
    </div>
  );
}

// 정령 구체
function SpiritOrb({ phase }) {
  return (
    <div className={`ic-spirit ${phase === "spirit" || phase === "dialogue" || phase === "ready" ? "ic-spirit-in" : ""}`}>
      <div className="ic-spirit-aura" />
      <div className="ic-spirit-ring ic-ring-3" />
      <div className="ic-spirit-ring ic-ring-2" />
      <div className="ic-spirit-ring ic-ring-1" />
      <div className="ic-spirit-core" />
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="ic-wisp" style={{ "--wi": i, "--wn": 6 }} />
      ))}
    </div>
  );
}

export default function IntroCutscene({ onComplete }) {
  const [phase, setPhase] = useState("dark"); // dark | spirit | dialogue | ready
  const [lineIdx, setLineIdx] = useState(0);
  const [allDone, setAllDone] = useState(false);
  const [entering, setEntering] = useState(false);

  const { displayed, done, skip } = useTyping(
    phase === "dialogue" ? LINES[lineIdx] : "",
    38
  );

  // 단계 전환 타이밍
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("spirit"),   900);
    const t2 = setTimeout(() => setPhase("dialogue"), 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // 대사 자동 진행
  useEffect(() => {
    if (phase !== "dialogue" || !done) return;
    if (lineIdx >= LINES.length - 1) {
      const t = setTimeout(() => setPhase("ready"), 1600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setLineIdx(i => i + 1), PAUSES[lineIdx] ?? 1600);
    return () => clearTimeout(t);
  }, [done, lineIdx, phase]);

  const handleTap = () => {
    if (phase === "dark" || phase === "spirit") return;
    if (phase === "dialogue") {
      if (!done) { skip(); return; }
      if (lineIdx < LINES.length - 1) {
        clearTimeout(undefined);
        setLineIdx(LINES.length - 1);
        return;
      }
      setPhase("ready");
      return;
    }
    if (phase === "ready") handleEnter();
  };

  const handleEnter = () => {
    if (entering) return;
    setEntering(true);
    setTimeout(onComplete, 900);
  };

  return (
    <div className={`ic-root ${entering ? "ic-exit" : ""}`} onClick={handleTap}>
      {/* 배경 효과 */}
      <div className="ic-bg" />
      <div className="ic-fog ic-fog-1" />
      <div className="ic-fog ic-fog-2" />
      <div className="ic-fog ic-fog-3" />
      <Bokeh />

      {/* 바닥 빛 */}
      <div className="ic-floor-glow" />

      {/* 정령 구체 */}
      <div className="ic-spirit-area">
        <SpiritOrb phase={phase} />
        {(phase === "spirit" || phase === "dialogue" || phase === "ready") && (
          <div className="ic-spirit-label">도슨트 정령</div>
        )}
      </div>

      {/* 대화창 */}
      {phase === "dialogue" && (
        <div className="ic-textbox">
          <div className="ic-textbox-corner tl" /><div className="ic-textbox-corner tr" />
          <div className="ic-textbox-corner bl" /><div className="ic-textbox-corner br" />
          <div className="ic-persona-tag">✦ 도슨트 정령</div>
          <p className="ic-line">
            {displayed}
            {!done && <span className="ic-cursor">|</span>}
          </p>
          {done && lineIdx < LINES.length - 1 && (
            <div className="ic-tap-hint">화면을 터치하면 넘어갑니다 ▼</div>
          )}
        </div>
      )}

      {/* 입장 버튼 */}
      {phase === "ready" && (
        <div className="ic-enter-wrap">
          <div className="ic-ready-text">도사님, 준비가 되셨습니까?</div>
          <button className="ic-enter-btn" onClick={handleEnter}>
            <span className="ic-enter-glow" />
            박물관으로 들어가기
          </button>
          <div className="ic-enter-sub">— 국립중앙박물관 —</div>
        </div>
      )}

      {/* 건너뛰기 */}
      {phase === "dialogue" && (
        <button className="ic-skip" onClick={(e) => { e.stopPropagation(); setPhase("ready"); }}>
          건너뛰기
        </button>
      )}
    </div>
  );
}
