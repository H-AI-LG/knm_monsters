import { useState, useCallback } from "react";
import PhaserGame from "./game/PhaserGame";
import BattleScreen from "./components/BattleScreen";
import DoGam from "./components/DoGam";
import IntroCutscene from "./components/IntroCutscene";
import { ARTIFACTS } from "./data/artifacts";

// screen: "cover" | "intro" | "game"
export default function App() {
  const [screen, setScreen] = useState("cover");
  const [activeArtifact, setActiveArtifact] = useState(null);
  const [collected, setCollected] = useState(new Set());
  const [dogamOpen, setDogamOpen] = useState(false);

  const handleNear = useCallback(() => {}, []);

  const handleActivate = useCallback((id) => {
    const artifact = ARTIFACTS[id];
    if (artifact) setActiveArtifact(artifact);
  }, []);

  const handleCollect = useCallback((id) => {
    setCollected((prev) => new Set([...prev, id]));
  }, []);

  return (
    <div className="app">
      {/* ── 표지 ── */}
      {screen === "cover" && (
        <main className="cover-screen">
          <img className="cover-art" src="/gamecover.png" alt="유물 수호자 시간 여행 모험 표지" />
          <button className="enter-button" onClick={() => setScreen("intro")}>
            박물관 입장하기
          </button>
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
    </div>
  );
}
