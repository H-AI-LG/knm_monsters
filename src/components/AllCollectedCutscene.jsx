import { useState, useEffect, useRef } from "react";

const LINES = [
  "와아...! 드디어 해냈구나, 탐험가!",
  "박물관의 모든 정령들이\n네 진심에 마음을 열었어!",
  "그런데... 아직 끝이 아니야.",
  "중앙홀에 있는 경천사 십층석탑이\n아직 잠들어 있거든.",
  "네가 가장 마음에 들었던 정령들을 데리고\n경천사 십층석탑으로 가보자!",
];
const PAUSES = [1600, 2000, 1400, 2200, 0];

function useTyping(text, speed = 36) {
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

export default function AllCollectedCutscene({ onComplete }) {
  const [phase, setPhase] = useState("dark"); // dark | spirit | dialogue | ready
  const [lineIdx, setLineIdx] = useState(0);
  const [entering, setEntering] = useState(false);

  const { displayed, done, skip } = useTyping(
    phase === "dialogue" ? LINES[lineIdx] : "",
    36
  );

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("spirit"),   600);
    const t2 = setTimeout(() => setPhase("dialogue"), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    if (phase !== "dialogue" || !done) return;
    if (lineIdx >= LINES.length - 1) {
      const t = setTimeout(() => setPhase("ready"), 1400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setLineIdx(i => i + 1), PAUSES[lineIdx] ?? 1600);
    return () => clearTimeout(t);
  }, [done, lineIdx, phase]);

  const handleTap = () => {
    if (phase === "dark" || phase === "spirit") return;
    if (phase === "dialogue") {
      if (!done) { skip(); return; }
      if (lineIdx < LINES.length - 1) { setLineIdx(i => i + 1); return; }
      setPhase("ready");
      return;
    }
    if (phase === "ready") handleEnter();
  };

  const handleEnter = () => {
    if (entering) return;
    setEntering(true);
    setTimeout(onComplete, 700);
  };

  return (
    <div className={`ic-root ${entering ? "ic-exit" : ""}`} onClick={handleTap}>
      <div className="ic-bg" />
      <div className="ic-fog ic-fog-1" />
      <div className="ic-fog ic-fog-2" />
      <div className="ic-fog ic-fog-3" />
      <div className="ic-floor-glow" />

      {/* 정령 구체 */}
      <div className="ic-spirit-area">
        <div className={`ic-spirit ${phase !== "dark" ? "ic-spirit-in" : ""}`}>
          <div className="ic-spirit-aura" />
          <div className="ic-spirit-ring ic-ring-3" />
          <div className="ic-spirit-ring ic-ring-2" />
          <div className="ic-spirit-ring ic-ring-1" />
          <div className="ic-spirit-core" />
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="ic-wisp" style={{ "--wi": i, "--wn": 6 }} />
          ))}
        </div>
        {phase !== "dark" && (
          <div className="ic-spirit-label">도슨트 요정</div>
        )}
      </div>

      {/* 대화창 */}
      {phase === "dialogue" && (
        <div className="ic-textbox">
          <div className="ic-textbox-corner tl" /><div className="ic-textbox-corner tr" />
          <div className="ic-textbox-corner bl" /><div className="ic-textbox-corner br" />
          <div className="ic-persona-tag">✦ 도슨트 요정</div>
          <p className="ic-line">
            {displayed}
            {!done && <span className="ic-cursor">|</span>}
          </p>
          {done && lineIdx < LINES.length - 1 && (
            <div className="ic-tap-hint">화면을 터치하면 넘어갑니다 ▼</div>
          )}
        </div>
      )}

      {/* 진행 버튼 */}
      {phase === "ready" && (
        <div className="ic-enter-wrap">
          <div className="ic-ready-text">경천사 십층석탑으로 가자!</div>
          <button className="ic-enter-btn" onClick={handleEnter}>
            <span className="ic-enter-glow" />
            중앙홀로 이동하기
          </button>
        </div>
      )}

      {phase === "dialogue" && (
        <button className="ic-skip" onClick={(e) => { e.stopPropagation(); setPhase("ready"); }}>
          건너뛰기
        </button>
      )}
    </div>
  );
}
