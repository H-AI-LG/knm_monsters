import { useState, useEffect, useRef } from "react";

const IMG = {
  normal: "/sprites/Museum_Director/director_normal.png",
  cry:    "/sprites/Museum_Director/director_cry.png",
  happy:  "/sprites/Museum_Director/director_happy.png",
};

const SCENES = [
  { img: "normal", text: "어서 오게나, 젊은이! 마침 잘 왔어!" },
  { img: "normal", text: "다름이 아니라... 박물관에 큰 위기가 생겼다네.\n유물 정령들이 전부 삐쳐서 숨어버렸거든!" },
  { img: "cry",    text: "요즘 사람들이 스마트폰만 보고 박물관엔 통 안 오니...\n정령들이 상처받아서 꽁꽁 숨어버린 거야... 흑흑..." },
  { img: "cry",    text: "이대로 가면 박물관이 텅 빈 채로 끝나버려...\n자네가 마지막 희망이야, 젊은이!" },
  { img: "normal", text: "그래서 말인데! 이 특별한 저고리를 입어보게나.\n정령들과 소통할 수 있는 마법의 옷이야!" },
  { img: "normal", text: "그리고 이 친구도 소개할게.\n우리 박물관의 도슨트 요정이야, 잘 부탁하네!" },
];
const PAUSES = [1800, 2500, 3000, 2800, 2400, 0];

function useTyping(text, speed = 36) {
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

export default function DirectorCutscene({ onComplete }) {
  const [sceneIdx, setSceneIdx] = useState(0);
  const [directorIn, setDirectorIn] = useState(false);
  const [exiting, setExiting] = useState(false);

  const scene = SCENES[sceneIdx];
  const { displayed, done, skip } = useTyping(scene.text, 36);

  useEffect(() => {
    const t = setTimeout(() => setDirectorIn(true), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!done || sceneIdx >= SCENES.length - 1) return;
    const pause = PAUSES[sceneIdx] ?? 2000;
    if (pause === 0) return;
    const t = setTimeout(() => setSceneIdx(i => i + 1), pause);
    return () => clearTimeout(t);
  }, [done, sceneIdx]);

  const finish = () => {
    if (exiting) return;
    setExiting(true);
    setTimeout(onComplete, 700);
  };

  const handleTap = () => {
    if (!done) { skip(); return; }
    if (sceneIdx < SCENES.length - 1) { setSceneIdx(i => i + 1); return; }
    finish();
  };

  return (
    <div className={`dc-root ${exiting ? "dc-exit" : ""}`} onClick={handleTap}>
      <div className="dc-bg" />

      <div className={`dc-director ${directorIn ? "dc-director-in" : ""}`}>
        <img
          key={scene.img}
          className="dc-director-img"
          src={IMG[scene.img]}
          alt="관장님"
        />
      </div>

      <div className="dc-textbox">
        <div className="dc-persona-tag">✦ 국립중앙박물관 관장님</div>
        <p className="dc-line">
          {displayed}
          {!done && <span className="dc-cursor">|</span>}
        </p>
        {done && (
          <div className="dc-tap-hint">
            {sceneIdx < SCENES.length - 1 ? "화면을 터치하면 넘어갑니다 ▼" : "화면을 터치하면 계속 ▼"}
          </div>
        )}
      </div>

      <button className="dc-skip" onClick={(e) => { e.stopPropagation(); finish(); }}>
        건너뛰기
      </button>
    </div>
  );
}
