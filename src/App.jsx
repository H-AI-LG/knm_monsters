import { useState, useCallback, useEffect } from "react";
import PhaserGame from "./game/PhaserGame";
import BattleScreen from "./components/BattleScreen";
import DoGam from "./components/DoGam";
import IntroCutscene from "./components/IntroCutscene";
import EndingScreen from "./components/EndingScreen";
import CreditsScreen from "./components/CreditsScreen";
import { ARTIFACTS } from "./data/artifacts";
import { playBGM, stopBGM } from "./game/audio";

// screen: "cover" | "intro" | "game" | "ending"
export default function App() {
  const [screen, setScreen] = useState("cover");
  const [activeArtifact, setActiveArtifact] = useState(null);
  const [collected, setCollected] = useState(() => {
    try {
      const saved = localStorage.getItem("knm_collected");
      if (saved) return new Set(JSON.parse(saved));
    } catch {}
    return new Set();
  });
  const [dogamOpen, setDogamOpen] = useState(false);
  const [creditsOpen, setCreditsOpen] = useState(false);

  // 수집 내역 localStorage 동기화
  useEffect(() => {
    try {
      localStorage.setItem("knm_collected", JSON.stringify([...collected]));
    } catch {}
  }, [collected]);

  // BGM: 화면/상태별 자동 전환
  useEffect(() => {
    if (screen === "cover")        playBGM("title");
    else if (screen === "intro")   playBGM("intro");
    else if (screen === "ending")  playBGM("ending");
    else if (screen === "game") {
      if (activeArtifact) playBGM("spirit");
      else                playBGM("explore_calm");
    } else stopBGM();
  }, [screen, activeArtifact]);

  const handleNear = useCallback(() => {}, []);

  const handleActivate = useCallback((id) => {
    const artifact = ARTIFACTS[id];
    if (artifact) setActiveArtifact(artifact);
  }, []);

  const handleCollect = useCallback((id) => {
    setCollected((prev) => new Set([...prev, id]));
  }, []);

  // ── DEV: 나중에 삭제 ──────────────────────────────────
  const handleDevBoss = useCallback(() => {
    const fill = new Set(Object.keys(ARTIFACTS).filter(id => id !== "artifact_009"));
    setCollected(fill);
    setScreen("game");
    setTimeout(() => setActiveArtifact(ARTIFACTS["artifact_009"]), 300);
  }, []);
  // ─────────────────────────────────────────────────────

  // 30선 완료 → 엔딩 (BattleScreen이 닫힌 직후 전환)
  useEffect(() => {
    if (screen === "game" && !activeArtifact && collected.size >= 30) {
      const t = setTimeout(() => setScreen("ending"), 400);
      return () => clearTimeout(t);
    }
  }, [screen, activeArtifact, collected.size]);

  return (
    <div className="app">
      {/* ── 표지 ── */}
      {screen === "cover" && (
        <main className="cover-screen">
          <img className="cover-art" src="/gamecover.png" alt="유물 수호자 시간 여행 모험 표지" />
          <div className="cover-btns">
            <button className="enter-button" onClick={() => setScreen("intro")}>
              박물관 입장하기
            </button>
            {collected.size > 0 && (
              <button className="resume-button" onClick={() => setScreen("game")}>
                이어하기 ({collected.size}/30 수집)
              </button>
            )}
            <button className="credits-button" onClick={() => setCreditsOpen(true)}>
              제작 정보
            </button>
            {/* DEV — 나중에 삭제 */}
            <button style={{marginTop:8,padding:"6px 16px",background:"#ff4444",color:"#fff",border:"none",borderRadius:6,cursor:"pointer",fontSize:12}} onClick={handleDevBoss}>
              [DEV] 보스전 바로가기
            </button>
          </div>
        </main>
      )}

      {/* ── 도입 컷씬 ── */}
      {screen === "intro" && (
        <IntroCutscene onComplete={() => setScreen("game")} />
      )}

      {/* ── 게임 ── */}
      {screen === "game" && (
        <>
          <PhaserGame onNearArtifact={handleNear} onActivateArtifact={handleActivate} />
          <button className="dogam-btn" onClick={() => setDogamOpen(true)}>
            <span className="dogam-btn-icon">📖</span>
            <span className="dogam-btn-count">{collected.size}/30</span>
          </button>
        </>
      )}

      {/* ── 배틀 / 도감 (게임 위 오버레이) ── */}
      {activeArtifact && (
        <BattleScreen
          artifact={activeArtifact}
          onClose={() => setActiveArtifact(null)}
          collected={collected}
          onCollect={handleCollect}
        />
      )}

      {dogamOpen && (
        <DoGam collected={collected} onClose={() => setDogamOpen(false)} />
      )}

      {/* ── 엔딩 ── */}
      {screen === "ending" && (
        <EndingScreen onClose={() => setScreen("cover")} />
      )}

      {/* ── 크레딧 (오버레이) ── */}
      {creditsOpen && (
        <CreditsScreen onClose={() => setCreditsOpen(false)} />
      )}
    </div>
  );
}
