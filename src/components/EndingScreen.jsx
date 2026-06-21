import { useState, useEffect, useRef, useMemo } from "react";

const DIRECTOR_IMG = {
  normal: "/sprites/Museum_Director/director_normal.png",
  happy:  "/sprites/Museum_Director/director_happy.png",
};

const ENDING_LINES = [
  "해냈어! 정말 대단해!",
  "서른 개의 유물 정령이 모두 마음을 열었어!",
  "박물관에 다시 활기가 넘치고 있어!",
  "정령들이 너 덕분에 다시 사람들 곁으로 돌아왔어.",
  "나도 너랑 같이 탐험해서 정말 즐거웠어!",
  "...박물관을 구해줘서 고마워.",
  "어? 잠깐, 저기 관장님이 오시는 것 같은데?",
];
const PAUSES = [1400, 1800, 1600, 2000, 2200, 1600, 0];

const DIRECTOR_ENDING = [
  { img: "happy",  text: "해냈어! 자네가 정말 해냈어!" },
  { img: "happy",  text: "서른 개의 정령이 모두 마음을 열었다네!\n박물관에 다시 활기가 넘쳐흐를 거야!" },
  { img: "normal", text: "처음 만났을 때부터 믿었다네.\n자네야말로 진짜 우리 박물관의 수호자야!" },
  { img: "happy",  text: "정말 고마워, 젊은이.\n박물관을 대표해서 진심으로 감사하다네!" },
];
const DIRECTOR_PAUSES = [1800, 2400, 2400, 0];

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
  const [phase, setPhase] = useState("intro"); // intro | docent | director | credits
  const [lineIdx, setLineIdx] = useState(0);
  const [orbFading, setOrbFading] = useState(false);
  const [lightsReveal, setLightsReveal] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [directorSceneIdx, setDirectorSceneIdx] = useState(0);
  const [directorIn, setDirectorIn] = useState(false);

  const { displayed, done, skip } = useTyping(
    phase === "docent" ? ENDING_LINES[lineIdx] : "",
    42
  );

  const dirScene = DIRECTOR_ENDING[directorSceneIdx];
  const { displayed: dirDisplayed, done: dirDone, skip: dirSkip } = useTyping(
    phase === "director" ? dirScene.text : "",
    42
  );

  useEffect(() => {
    const t1 = setTimeout(() => setLightsReveal(true), 500);
    const t2 = setTimeout(() => setPhase("docent"), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // 도슨트 대사 자동 진행
  useEffect(() => {
    if (phase !== "docent" || !done) return;
    if (lineIdx >= ENDING_LINES.length - 1) {
      const t = setTimeout(() => {
        setOrbFading(true);
        setTimeout(() => setPhase("director"), 1800);
      }, 1600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setLineIdx(i => i + 1), PAUSES[lineIdx] ?? 2000);
    return () => clearTimeout(t);
  }, [done, lineIdx, phase]);

  // 관장님 진입 애니메이션
  useEffect(() => {
    if (phase !== "director") return;
    const t = setTimeout(() => setDirectorIn(true), 300);
    return () => clearTimeout(t);
  }, [phase]);

  // 관장님 대사 자동 진행
  useEffect(() => {
    if (phase !== "director" || !dirDone) return;
    if (directorSceneIdx >= DIRECTOR_ENDING.length - 1) {
      const t = setTimeout(() => setPhase("credits"), 2200);
      return () => clearTimeout(t);
    }
    const pause = DIRECTOR_PAUSES[directorSceneIdx] ?? 2000;
    if (pause === 0) return;
    const t = setTimeout(() => setDirectorSceneIdx(i => i + 1), pause);
    return () => clearTimeout(t);
  }, [dirDone, directorSceneIdx, phase]);

  const handleTap = () => {
    if (phase === "docent") {
      if (!done) { skip(); return; }
      if (lineIdx < ENDING_LINES.length - 1) {
        setLineIdx(ENDING_LINES.length - 1);
        return;
      }
      setOrbFading(true);
      setTimeout(() => setPhase("director"), 1800);
    }
    if (phase === "director") {
      if (!dirDone) { dirSkip(); return; }
      if (directorSceneIdx < DIRECTOR_ENDING.length - 1) {
        setDirectorSceneIdx(i => i + 1);
        return;
      }
      setPhase("credits");
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

      {/* 도슨트 요정 구슬 */}
      {(phase === "intro" || phase === "docent") && (
        <div className="ed-orb-area">
          <LightOrb fading={orbFading} />
          {!orbFading && <div className="ed-orb-label">도슨트 요정</div>}
        </div>
      )}

      {/* 도슨트 대화 */}
      {phase === "docent" && (
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

      {/* 관장님 컷신 */}
      {phase === "director" && (
        <>
          <div className={`dc-director ${directorIn ? "dc-director-in" : ""}`}>
            <img
              key={dirScene.img}
              className="dc-director-img"
              src={DIRECTOR_IMG[dirScene.img]}
              alt="관장님"
            />
          </div>
          <div className="ed-dir-textbox">
            <div className="dc-persona-tag">✦ 국립중앙박물관 관장님</div>
            <p className="dc-line">
              {dirDisplayed}
              {!dirDone && <span className="dc-cursor">|</span>}
            </p>
            {dirDone && (
              <div className="dc-tap-hint">
                {directorSceneIdx < DIRECTOR_ENDING.length - 1
                  ? "화면을 터치하면 넘어갑니다 ▼"
                  : "화면을 터치하면 계속 ▼"}
              </div>
            )}
          </div>
          <button className="dc-skip" onClick={(e) => { e.stopPropagation(); setPhase("credits"); }}>
            건너뛰기
          </button>
        </>
      )}

      {/* 크레딧 */}
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
