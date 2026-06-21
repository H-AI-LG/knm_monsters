import { useState, useEffect, useRef } from "react";
import { ARTIFACTS } from "../data/artifacts";

const GRADE_COLOR = { 일반: "#7ab87a", 고급: "#5b9bd5", 전설: "#c9a24b", 보스: "#c04040" };

const VILLAIN_SCENES = [
  "하하하... 드디어 나왔군, 꼬마 수호자.",
  "고작 낡은 유물 따위를 위해 여기까지 왔다고?\n어리석기 짝이 없구나!",
  "낡고 부서지는 너희들에게 미래는 없어.\n결국 데이터인 '나'만이 영원하다!",
  "어디 한번 해봐. 네 '진심'이 내 홀로그램을 이길 수 있는지!",
];
const VILLAIN_PAUSES = [2000, 2600, 2800, 0];

function useTyping(text, speed = 35) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    clearInterval(timer.current);
    setDisplayed(""); setDone(false);
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

export default function TopThreeScreen({ collected, onStartBoss }) {
  const [phase, setPhase] = useState("select"); // select | villain
  const [selected, setSelected] = useState([]);
  const [vilSceneIdx, setVilSceneIdx] = useState(0);
  const [exiting, setExiting] = useState(false);

  const { displayed, done, skip } = useTyping(
    phase === "villain" ? VILLAIN_SCENES[vilSceneIdx] : "",
    35
  );

  // 수집된 일반 정령들 (보스 제외)
  const collectedList = [...collected]
    .filter(id => id !== "artifact_009" && ARTIFACTS[id])
    .map(id => ARTIFACTS[id])
    .sort((a, b) => Number(a.number) - Number(b.number));

  const handleSelect = (id) => {
    if (selected.includes(id)) {
      setSelected(prev => prev.filter(s => s !== id));
    } else if (selected.length < 3) {
      setSelected(prev => [...prev, id]);
    }
  };

  // 빌런 자동 진행
  useEffect(() => {
    if (phase !== "villain" || !done) return;
    if (vilSceneIdx >= VILLAIN_SCENES.length - 1) return;
    const pause = VILLAIN_PAUSES[vilSceneIdx] ?? 2000;
    if (pause === 0) return;
    const t = setTimeout(() => setVilSceneIdx(i => i + 1), pause);
    return () => clearTimeout(t);
  }, [phase, done, vilSceneIdx]);

  const handleVilTap = () => {
    if (!done) { skip(); return; }
    if (vilSceneIdx < VILLAIN_SCENES.length - 1) {
      setVilSceneIdx(i => i + 1);
      return;
    }
    setExiting(true);
    setTimeout(() => onStartBoss(selected), 700);
  };

  if (phase === "select") {
    return (
      <div className="tt-root">
        <div className="tt-bg" />
        <div className="tt-header">
          <div className="tt-title">⭐ 최애 유물 TOP 3</div>
          <div className="tt-subtitle">
            함께 최후의 결전에 나설<br />
            가장 소중한 정령 3개를 골라줘!
          </div>
        </div>

        <div className="tt-grid">
          {collectedList.map(a => {
            const isSel = selected.includes(a.id);
            const rank = selected.indexOf(a.id) + 1;
            const disabled = !isSel && selected.length >= 3;
            return (
              <button
                key={a.id}
                className={`tt-card ${isSel ? "tt-card-sel" : ""} ${disabled ? "tt-card-dim" : ""}`}
                onClick={() => handleSelect(a.id)}
              >
                {isSel && <div className="tt-rank">#{rank}</div>}
                <img src={a.image} alt={a.name} className="tt-card-img" />
                <div className="tt-card-name">{a.name}</div>
                <div className="tt-card-grade" style={{ color: GRADE_COLOR[a.grade] }}>
                  {a.grade}
                </div>
              </button>
            );
          })}
        </div>

        <div className="tt-footer">
          <div className="tt-count">{selected.length} / 3 선택됨</div>
          {selected.length === 3 && (
            <button className="tt-confirm" onClick={() => setPhase("villain")}>
              출전! →
            </button>
          )}
        </div>
      </div>
    );
  }

  // 빌런 컷신 phase
  return (
    <div className={`tt-villain-root ${exiting ? "tt-exit" : ""}`} onClick={handleVilTap}>
      <div className="tt-villain-bg" />

      <div className="tt-top3-row">
        {selected.map((id, i) => {
          const a = ARTIFACTS[id];
          if (!a) return null;
          return (
            <div key={id} className="tt-mini-card">
              <div className="tt-mini-rank">#{i + 1}</div>
              <img src={a.image} alt={a.name} className="tt-mini-img" />
              <div className="tt-mini-name">{a.name}</div>
            </div>
          );
        })}
      </div>

      <div className="tt-villain-box">
        <div className="tt-villain-tag">⚡ 디지털 광개토대왕릉비</div>
        <p className="tt-villain-line">
          {displayed}
          {!done && <span className="tt-vil-cursor">|</span>}
        </p>
        {done && (
          <div className="tt-villain-hint">
            {vilSceneIdx < VILLAIN_SCENES.length - 1
              ? "화면을 터치하면 넘어갑니다 ▼"
              : "최후의 결전을 시작합니다... ▼"}
          </div>
        )}
      </div>

      <button className="tt-skip" onClick={(e) => { e.stopPropagation(); setExiting(true); setTimeout(() => onStartBoss(selected), 700); }}>
        건너뛰기
      </button>
    </div>
  );
}
